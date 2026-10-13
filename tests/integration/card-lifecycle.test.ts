import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../../services/potluck-api/src/app.ts";
import { openDatabase } from "../../services/potluck-api/src/db.ts";

test("Card connection and closure retain authorization, consent, versions, replay and history", async () => {
  const directory = await mkdtemp(join(tmpdir(), "potluck-card-lifecycle-"));
  const database = join(directory, "database");
  const app = await createApp({ mode: "local", database });
  let sequence = 0;
  const register = async (name: string) =>
    (
      await app.inject({
        method: "POST",
        url: "/v1/local/accounts",
        payload: {
          name,
          email: name + "@card-lifecycle.test",
          password: "local-lifecycle-test-password",
        },
      })
    ).json();
  const host = await register("Host"),
    other = await register("Other");
  const call = (
    actor: typeof host | null,
    path: string,
    payload?: object,
    key = "lifecycle-" + ++sequence,
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
  let cardId = "",
    circleId = "",
    billId = "";
  try {
    const created = await call(host, "/cards", {
      name: "Private Card",
      design: "graphite",
    });
    assert.equal(created.statusCode, 201, created.body);
    cardId = created.json().id;
    const circle = (
      await call(other, "/circles", { name: "Shared Circle" })
    ).json();
    circleId = circle.id;
    const path = `/cards/${cardId}`;
    const connect = { expectedVersion: 1, circleId };
    assert.equal(
      (await call(null, path + "/connection", connect)).statusCode,
      401,
    );
    assert.equal(
      (await call(other, path + "/connection", connect)).statusCode,
      404,
    );
    assert.equal(
      (await call(host, path + "/connection", connect)).statusCode,
      404,
      "Circle membership is required",
    );
    const invitation = (
      await call(other, `/circles/${circleId}/invitations`, {
        email: "host@card-lifecycle.test",
      })
    ).json();
    assert.equal(
      (await call(host, path + "/connection", connect)).statusCode,
      404,
      "unaccepted membership cannot attach Cards",
    );
    const accepted = await call(host, `/invitations/${invitation.id}/accept`, {
      expectedVersion: 1,
    });
    assert.equal(accepted.statusCode, 200, accepted.body);
    const before = (await call(host, `/circles/${circleId}`)).json();
    const connected = await call(
      host,
      path + "/connection",
      connect,
      "connect-once",
    );
    assert.equal(connected.statusCode, 200, connected.body);
    assert.equal(connected.json().circleId, circleId);
    assert.equal(connected.json().version, 2);
    assert.deepEqual(
      (await call(host, path + "/connection", connect, "connect-once")).json(),
      connected.json(),
    );
    assert.equal(
      (
        await call(host, path + "/connection", {
          expectedVersion: 1,
          circleId: null,
        })
      ).statusCode,
      409,
    );
    const disconnected = await call(host, path + "/connection", {
      expectedVersion: 2,
      circleId: null,
    });
    assert.equal(disconnected.statusCode, 200, disconnected.body);
    assert.equal(disconnected.json().circleId, null);
    assert.deepEqual(
      (await call(host, `/circles/${circleId}`)).json().people,
      before.people,
      "connection changes do not change membership",
    );
    assert.deepEqual((await call(host, path)).json().spenders, []);
    const controls = await call(host, path + "/merchant-controls", {
      expectedVersion: 0,
      settings: {
        mode: "maximum",
        currency: "USD",
        minimumMinor: null,
        maximumMinor: 10000,
        industries: ["groceries"],
      },
    });
    assert.equal(controls.statusCode, 200, controls.body);
    const bill = await call(host, "/bills", {
      name: "Attached Bill",
      cardId,
      amountMinor: 2000,
      participants: [host.user.id],
      firstDueDate: "2026-11-01",
    });
    assert.equal(bill.statusCode, 201, bill.body);
    billId = bill.json().id;
    const close = { expectedVersion: 3, acknowledged: true };
    assert.equal((await call(null, path + "/close", close)).statusCode, 401);
    assert.equal((await call(other, path + "/close", close)).statusCode, 404);
    const blocked = await call(host, path + "/close", close);
    assert.equal(blocked.statusCode, 409, blocked.body);
    assert.equal(blocked.json().error.code, "BILLS_ATTACHED");
    assert.equal((await call(host, path)).json().status, "setup_required");
    const ended = await call(host, `/bills/${billId}/end`, {
      expectedVersion: 1,
      acknowledged: true,
    });
    assert.equal(ended.statusCode, 200, ended.body);
    assert.equal(
      (await call(host, path + "/close", { ...close, expectedVersion: 2 }))
        .statusCode,
      409,
    );
    const closed = await call(host, path + "/close", close, "close-once");
    assert.equal(closed.statusCode, 200, closed.body);
    assert.equal(closed.json().status, "closed");
    const replay = await call(host, path + "/close", close, "close-once");
    assert.equal(replay.statusCode, 200, replay.body);
    assert.deepEqual(replay.json(), closed.json());
    assert.equal((await call(host, path + "/close", close)).statusCode, 409);
    assert.equal(
      (await call(host, "/cards"))
        .json()
        .items.some((c: { id: string }) => c.id === cardId),
      false,
    );
    assert.equal((await call(host, path)).json().status, "closed");
    assert.equal(
      (await call(host, path + "/merchant-controls")).json().settings
        .maximumMinor,
      10000,
    );
  } finally {
    await app.close();
  }
  const db = await openDatabase(database);
  try {
    assert.equal(
      (await db.query("SELECT status FROM cards WHERE id=$1", [cardId])).rows[0]
        .status,
      "closed",
    );
    assert.equal(
      (await db.query("SELECT status FROM circles WHERE id=$1", [circleId]))
        .rows[0].status,
      "active",
    );
    assert.equal(
      (await db.query("SELECT status FROM bills WHERE id=$1", [billId])).rows[0]
        .status,
      "ended",
    );
    for (const [action, count] of [
      ["card.connection_changed", 2],
      ["card.shell_closed", 1],
    ] as const) {
      assert.equal(
        (
          await db.query(
            "SELECT * FROM audit_events WHERE resource_id=$1 AND action=$2",
            [cardId, action],
          )
        ).rows.length,
        count,
        "replay creates no duplicate audit event",
      );
    }
    assert.equal(
      (
        await db.query(
          "SELECT * FROM card_merchant_controls WHERE card_id=$1",
          [cardId],
        )
      ).rows.length,
      1,
    );
  } finally {
    await db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
