import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../services/potluck-api/src/app.ts";
import { openDatabase } from "../../services/potluck-api/src/db.ts";
import { saveMerchantControls } from "../../services/potluck-api/src/application/card-merchant-controls.ts";
import { uuid } from "../../services/potluck-api/src/lib.ts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const maximum = {
  mode: "maximum",
  currency: "USD",
  minimumMinor: null,
  maximumMinor: 15000,
  industries: ["groceries", "utilities"],
};
async function fixture(database = ":memory:") {
  const app = await createApp({ mode: "local", database });
  let sequence = 0;
  const register = async (name: string) =>
    (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name,
          email: name + "@merchant.test",
          password: "local-merchant-test-password",
        },
      })
    ).json();
  const host = await register("Host"),
    other = await register("Other");
  const call = (
    actor: typeof host | null,
    path: string,
    payload?: object,
    key = "merchant-test-" + ++sequence,
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
  const created = await call(host, "/cards", {
    name: "My Card",
    design: "graphite",
  });
  assert.equal(created.statusCode, 201, created.body);
  const card = created.json(),
    path = `/cards/${card.id}/merchant-controls`;
  return { app, host, other, card, path, call };
}

test("Merchant controls persist per Card with no invented defaults or issuing activation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "potluck-merchant-test-"));
  const database = join(directory, "database");
  const f = await fixture(database);
  try {
    const initial = await f.call(f.host, f.path);
    assert.equal(initial.statusCode, 200, initial.body);
    assert.deepEqual(initial.json(), {
      cardId: f.card.id,
      version: 0,
      settings: null,
      enforcement: "not_active",
    });
    const body = { expectedVersion: 0, settings: maximum };
    const saved = await f.call(f.host, f.path, body, "same-merchant-save");
    assert.equal(saved.statusCode, 200, saved.body);
    assert.deepEqual(saved.json(), {
      cardId: f.card.id,
      version: 1,
      settings: maximum,
      enforcement: "not_active",
    });
    assert.deepEqual((await f.call(f.host, f.path)).json(), saved.json());
    assert.deepEqual(
      (await f.call(f.host, f.path, body, "same-merchant-save")).json(),
      saved.json(),
    );
    const changedKey = await f.call(
      f.host,
      f.path,
      { ...body, settings: { ...maximum, maximumMinor: 999 } },
      "same-merchant-save",
    );
    assert.equal(changedKey.statusCode, 409);
    assert.equal(changedKey.json().error.code, "IDEMPOTENCY_CONFLICT");
    const range = {
      ...maximum,
      mode: "range",
      minimumMinor: 1000,
      industries: [],
    };
    const second = await f.call(f.host, f.path, {
      expectedVersion: 1,
      settings: range,
    });
    assert.equal(second.statusCode, 200, second.body);
    assert.deepEqual(
      second.json().settings,
      range,
      "empty allowlist is preserved rather than becoming allow-all",
    );
    assert.equal(second.json().version, 2);
    const another = (
      await f.call(f.host, "/cards", { name: "Separate" })
    ).json();
    assert.equal(
      (await f.call(f.host, `/cards/${another.id}/merchant-controls`)).json()
        .settings,
      null,
    );
    assert.equal(
      (await f.call(f.host, `/cards/${f.card.id}`)).json().availableMinor,
      null,
    );
    assert.deepEqual((await f.call(null, "/capabilities")).json().financial, {
      issuance: false,
      funding: false,
      spending: false,
    });
  } finally {
    await f.app.close();
    const reopened = await openDatabase(database);
    try {
      const saved = (
        await reopened.query(
          "SELECT * FROM card_merchant_controls WHERE card_id=$1",
          [f.card.id],
        )
      ).rows[0];
      assert.equal(saved.version, 2);
      assert.deepEqual(saved.industries, []);
      const events = (
        await reopened.query(
          "SELECT * FROM audit_events WHERE resource_id=$1 AND action='card.merchant_controls_saved' ORDER BY created_at",
          [f.card.id],
        )
      ).rows;
      assert.equal(
        events.length,
        2,
        "duplicate retries create no additional audit event",
      );
      assert.equal(events[0].metadata.prior.settings, null);
      assert.equal(events[1].metadata.resulting.version, 2);
    } finally {
      await reopened.close();
      await rm(directory, { recursive: true });
    }
  }
});

test("Merchant configuration constraints and audit records roll back atomically", async () => {
  const db = await openDatabase(":memory:");
  try {
    const actor = uuid(),
      card = uuid();
    await db.query(
      "INSERT INTO users(id,name,email,identity) VALUES($1,'Host','host@controls.test','local')",
      [actor],
    );
    await db.query(
      "INSERT INTO cards(id,host_id,name,design) VALUES($1,$2,'Card','graphite')",
      [card, actor],
    );
    const context = {
      resourceId: card,
      requestId: uuid(),
      body: { expectedVersion: 0, settings: maximum },
    };
    await assert.rejects(
      db.transaction(async (tx) => {
        await saveMerchantControls(tx, actor, context);
        throw new Error("injected rollback");
      }),
      /injected rollback/,
    );
    assert.equal(
      (await db.query("SELECT * FROM card_merchant_controls")).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          "SELECT * FROM audit_events WHERE action='card.merchant_controls_saved'",
        )
      ).rows.length,
      0,
    );
    await db.transaction((tx) => saveMerchantControls(tx, actor, context));
    for (const sql of [
      "maximum_minor=0",
      "maximum_minor=100000001",
      "currency='EUR'",
      "mode='range',minimum_minor=NULL",
      "mode='range',minimum_minor=16000",
      "industries=ARRAY['unknown']",
      "industries=ARRAY[NULL]::text[]",
      "version=0",
    ]) {
      await assert.rejects(
        db.query(
          "UPDATE card_merchant_controls SET " + sql + " WHERE card_id=$1",
          [card],
        ),
        { code: "23514" },
      );
    }
    await assert.rejects(
      db.query("UPDATE card_merchant_controls SET card_id=$1", [uuid()]),
      { code: "23503" },
    );
    assert.equal(
      (
        await db.query(
          "SELECT maximum_minor FROM card_merchant_controls WHERE card_id=$1",
          [card],
        )
      ).rows[0].maximum_minor,
      15000,
    );
  } finally {
    await db.close();
  }
});

test("Merchant controls deny other actors, unauthenticated requests and closed-Card retries", async () => {
  const f = await fixture();
  try {
    const body = { expectedVersion: 0, settings: maximum };
    assert.equal((await f.call(null, f.path)).statusCode, 401);
    assert.equal((await f.call(null, f.path, body)).statusCode, 401);
    assert.equal((await f.call(f.other, f.path)).statusCode, 404);
    assert.equal((await f.call(f.other, f.path, body)).statusCode, 404);
    const saved = await f.call(f.host, f.path, body, "before-close-save");
    assert.equal(saved.statusCode, 200, saved.body);
    const closed = await f.call(f.host, `/cards/${f.card.id}/close`, {
      expectedVersion: f.card.version,
      acknowledged: true,
    });
    assert.equal(closed.statusCode, 200, closed.body);
    assert.equal(
      (await f.call(f.host, f.path, body, "before-close-save")).statusCode,
      409,
      "authorization must run even before idempotent replay",
    );
    assert.equal(
      (await f.call(f.host, f.path)).json().settings.maximumMinor,
      15000,
      "closing preserves settings history",
    );
  } finally {
    await f.app.close();
  }
});

test("invalid controls and stale concurrent edits never replace saved settings", async () => {
  const f = await fixture();
  try {
    for (const settings of [
      { ...maximum, maximumMinor: 0 },
      { ...maximum, maximumMinor: 0.1 },
      { ...maximum, maximumMinor: 100000001 },
      { ...maximum, maximumMinor: -1 },
      { ...maximum, currency: "EUR" },
      { ...maximum, minimumMinor: 1 },
      { ...maximum, mode: "range", minimumMinor: null },
      { ...maximum, mode: "range", minimumMinor: 15001 },
      { ...maximum, industries: ["unknown"] },
      { ...maximum, industries: ["groceries", "groceries"] },
      { ...maximum, industries: [null] },
      { ...maximum, enforcement: "active" },
    ]) {
      const rejected = await f.call(f.host, f.path, {
        expectedVersion: 0,
        settings,
      });
      assert.equal(rejected.statusCode, 400, rejected.body);
    }
    assert.equal((await f.call(f.host, f.path)).json().settings, null);
    const results = await Promise.all(
      [1001, 1002].map((maximumMinor) =>
        f.call(f.host, f.path, {
          expectedVersion: 0,
          settings: { ...maximum, maximumMinor },
        }),
      ),
    );
    assert.deepEqual(results.map((r) => r.statusCode).sort(), [200, 409]);
    const saved = results.find((r) => r.statusCode === 200)!.json();
    assert.deepEqual((await f.call(f.host, f.path)).json(), saved);
    const stale = await f.call(f.host, f.path, {
      expectedVersion: 0,
      settings: maximum,
    });
    assert.equal(stale.json().error.code, "VERSION_CONFLICT");
    assert.deepEqual((await f.call(f.host, f.path)).json(), saved);
  } finally {
    await f.app.close();
  }
});
