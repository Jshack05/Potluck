import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";
import { openDatabase } from "../../services/potluck-api/src/db.ts";
import { saveCardAppearance } from "../../services/potluck-api/src/application/card-appearance.ts";
import { uuid } from "../../services/potluck-api/src/lib.ts";

test("Card appearance update and its before/after audit commit or roll back together", async () => {
  const db = await openDatabase(":memory:");
  try {
    const host = uuid(),
      card = uuid();
    await db.query(
      "INSERT INTO users(id,name,email,identity) VALUES($1,'Host','host@edit-audit.test','local')",
      [host],
    );
    await db.query(
      "INSERT INTO cards(id,host_id,name,design) VALUES($1,$2,'Original','graphite')",
      [card, host],
    );
    const context = {
      resourceId: card,
      requestId: uuid(),
      body: { expectedVersion: 1, name: "Renamed", design: "sage_solid" },
    };
    await assert.rejects(
      db.transaction(async (tx) => {
        await saveCardAppearance(tx, host, context);
        throw new Error("injected failure");
      }),
      /injected failure/,
    );
    assert.equal(
      (await db.query("SELECT name FROM cards WHERE id=$1", [card])).rows[0]
        .name,
      "Original",
    );
    assert.equal((await db.query("SELECT * FROM audit_events")).rows.length, 0);
    await db.transaction((tx) => saveCardAppearance(tx, host, context));
    const events = (
      await db.query("SELECT * FROM audit_events WHERE resource_id=$1", [card])
    ).rows;
    assert.equal(events.length, 1);
    assert.equal(events[0].action, "card.appearance_updated");
    assert.deepEqual(events[0].metadata, {
      prior: { name: "Original", design: "graphite", version: 1 },
      resulting: { name: "Renamed", design: "sage_solid", version: 2 },
    });
    await assert.rejects(
      db.transaction((tx) => saveCardAppearance(tx, host, context)),
      /changed elsewhere/,
    );
    assert.equal(
      (
        await db.query("SELECT * FROM audit_events WHERE resource_id=$1", [
          card,
        ])
      ).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});

test("Card editing preserves identity and associations, rejects unauthorized/stale changes, and replays once", async () => {
  const app = await createApp({ mode: "local", database: ":memory:" });
  try {
    let sequence = 0;
    const account = async (name: string) =>
      (
        await app.inject({
          method: "POST",
          url: "/v1/local/accounts",
          payload: {
            name,
            email: name + "@card-edit.test",
            password: "local-card-edit-password",
          },
        })
      ).json();
    const host = await account("Host"),
      other = await account("Other");
    const call = (
      actor: typeof host | null,
      path: string,
      payload?: object,
      key = "card-edit-" + ++sequence,
    ) =>
      app.inject({
        method: payload ? "POST" : "GET",
        url: "/v1" + path,
        payload,
        headers: {
          ...(actor ? { authorization: "Bearer " + actor.token } : {}),
          "idempotency-key": key,
        },
      });
    const circle = (
      await call(host, "/circles", { name: "Keep Circle" })
    ).json();
    const card = (
      await call(host, "/cards", {
        name: "Original",
        design: "graphite",
        circleId: circle.id,
      })
    ).json();
    const path = `/cards/${card.id}/appearance`;
    const body = {
      expectedVersion: card.version,
      name: "  Apartment card  ",
      design: "ocean_artwork",
    };
    const controls = {
      expectedVersion: 0,
      settings: {
        mode: "maximum",
        currency: "USD",
        minimumMinor: null,
        maximumMinor: 15000,
        industries: ["groceries"],
      },
    };
    assert.equal(
      (await call(host, `/cards/${card.id}/merchant-controls`, controls))
        .statusCode,
      200,
    );
    const original = (await call(host, `/cards/${card.id}`)).json();
    assert.equal((await call(null, path, body)).statusCode, 401);
    assert.equal((await call(other, path, body)).statusCode, 404);
    for (const invalid of [
      { ...body, name: " " },
      { ...body, name: "x".repeat(81) },
      { ...body, design: "invented" },
      { ...body, circleId: null },
      { ...body, expectedVersion: 0 },
      { name: "x", expectedVersion: card.version },
    ]) {
      assert.equal((await call(host, path, invalid)).statusCode, 400);
    }
    const saved = await call(host, path, body, "same-edit");
    assert.equal(saved.statusCode, 200, saved.body);
    assert.equal(saved.json().name, "Apartment card");
    assert.equal(saved.json().design, "ocean_artwork");
    assert.equal(saved.json().version, card.version + 1);
    assert.deepEqual(
      (await call(host, path, body, "same-edit")).json(),
      saved.json(),
    );
    assert.equal(
      (
        await call(host, path, { ...body, name: "Different" }, "same-edit")
      ).json().error.code,
      "IDEMPOTENCY_CONFLICT",
    );
    assert.equal(
      (await call(host, path, body)).json().error.code,
      "VERSION_CONFLICT",
    );
    const after = (await call(host, `/cards/${card.id}`)).json();
    for (const field of [
      "id",
      "hostId",
      "circleId",
      "betaAccountId",
      "status",
      "createdAt",
      "bills",
      "availableMinor",
      "pendingMinor",
      "reservedMinor",
      "spenders",
    ])
      assert.deepEqual(after[field], original[field], field);
    assert.deepEqual(
      (await call(host, `/cards/${card.id}/merchant-controls`)).json().settings,
      controls.settings,
    );
    assert.equal((await call(host, "/cards")).json().items.length, 1);
    assert.equal(
      (
        await call(host, `/cards/${card.id}/close`, {
          expectedVersion: after.version,
          acknowledged: true,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (
        await call(host, path, { ...body, expectedVersion: after.version })
      ).json().error.code,
      "CARD_CLOSED",
    );
    assert.equal(
      (await call(host, path, body, "same-edit")).json().error.code,
      "CARD_CLOSED",
      "replay rechecks current access/state",
    );
  } finally {
    await app.close();
  }
});
