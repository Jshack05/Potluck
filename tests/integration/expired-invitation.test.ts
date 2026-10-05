import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { openDatabase } from "../../services/potluck-api/src/db.ts";
import {
  createCircle,
  inviteToCircle,
} from "../../services/potluck-api/src/application/core.ts";
test("an expired invitation can be replaced without deleting its history", async () => {
  const db = await openDatabase(":memory:");
  try {
    const host = randomUUID(),
      person = randomUUID();
    for (const [id, name] of [
      [host, "Host"],
      [person, "Person"],
    ])
      await db.query(
        "INSERT INTO users(id,name,email,identity) VALUES($1,$2,$3,'local')",
        [id, name, name.toLowerCase() + "@example.test"],
      );
    const context = {
      body: { name: "People" },
      resourceId: "",
      requestId: randomUUID(),
    };
    const circle = await db.transaction((tx) =>
      createCircle(tx, host, context),
    );
    const inviteContext = {
      ...context,
      resourceId: circle.id,
      body: { email: "person@example.test" },
    };
    const first = await db.transaction((tx) =>
      inviteToCircle(tx, host, inviteContext),
    );
    await db.query(
      "UPDATE invitations SET expires_at=now()-interval '1 day' WHERE id=$1",
      [first.id],
    );
    const second = await db.transaction((tx) =>
      inviteToCircle(tx, host, inviteContext),
    );
    assert.notEqual(first.id, second.id);
    assert.equal(second.status, "pending");
    assert.equal(
      (await db.query("SELECT status FROM invitations WHERE id=$1", [first.id]))
        .rows[0].status,
      "expired",
    );
    assert.equal(
      (
        await db.query(
          "SELECT id FROM audit_events WHERE action='invitation.expired' AND resource_id=$1",
          [first.id],
        )
      ).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});
