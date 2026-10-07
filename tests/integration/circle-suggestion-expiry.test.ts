import { randomUUID } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { openDatabase } from "../../services/potluck-api/src/db.ts";
import {
  createCircle,
  inviteToCircle,
  respondToInvitation,
} from "../../services/potluck-api/src/application/circle-flows.ts";

test("expired member suggestions cannot be approved and replacement retains audit history", async () => {
  const db = await openDatabase(":memory:");
  try {
    const host = randomUUID(),
      member = randomUUID(),
      recipient = randomUUID();
    for (const [id, name] of [
      [host, "host"],
      [member, "member"],
      [recipient, "recipient"],
    ])
      await db.query(
        "INSERT INTO users(id,name,email,identity) VALUES($1,$2,$3,'local')",
        [id, name, name + "@example.test"],
      );
    const context = { requestId: randomUUID(), resourceId: "", body: {} };
    const circle = await db.transaction((tx) =>
      createCircle(tx, host, {
        ...context,
        body: {
          name: "Together",
          membersCanInvite: true,
          requireHostApproval: true,
        },
      }),
    );
    await db.query(
      "INSERT INTO memberships(circle_id,user_id,status) VALUES($1,$2,'accepted')",
      [circle.id, member],
    );
    const first = await db.transaction((tx) =>
      inviteToCircle(tx, member, {
        ...context,
        resourceId: circle.id,
        body: { recipientId: recipient },
      }),
    );
    await db.query(
      "UPDATE invitations SET expires_at=now()-interval '1 day' WHERE id=$1",
      [first.id],
    );
    await assert.rejects(
      db.transaction((tx) =>
        respondToInvitation(
          tx,
          host,
          { ...context, resourceId: first.id, body: { expectedVersion: 1 } },
          "approve",
        ),
      ),
      { code: "INVITATION_CHANGED" },
    );
    const next = await db.transaction((tx) =>
      inviteToCircle(tx, member, {
        ...context,
        resourceId: circle.id,
        body: { recipientId: recipient },
      }),
    );
    assert.notEqual(first.id, next.id);
    assert.equal(next.status, "awaiting_host_approval");
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
    await db.query(
      "UPDATE memberships SET status='removed' WHERE circle_id=$1 AND user_id=$2",
      [circle.id, member],
    );
    await assert.rejects(
      db.transaction((tx) =>
        respondToInvitation(
          tx,
          host,
          { ...context, resourceId: next.id, body: { expectedVersion: 1 } },
          "approve",
        ),
      ),
      { code: "NOT_FOUND" },
    );
    assert.equal(
      (await db.query("SELECT status FROM invitations WHERE id=$1", [next.id]))
        .rows[0].status,
      "awaiting_host_approval",
    );
  } finally {
    await db.close();
  }
});
