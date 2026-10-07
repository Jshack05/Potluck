import { api, member, one } from "../lib.ts";
import type { Queryable } from "./ports.ts";
import { requiredActor, type QueryContext } from "./query-context.ts";
export async function getCircleTransfers(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT t.*,c.name AS circle_name,u.name AS sender_name FROM circle_transfers t JOIN circles c ON c.id=t.circle_id JOIN users u ON u.id=t.sender_id WHERE t.recipient_id=$1 AND t.status='pending' AND t.expires_at>now() ORDER BY t.created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}

function invitationView(row: Record<string, any>) {
  const result = api(row);
  if (
    ["pending", "awaiting_host_approval"].includes(result.status) &&
    new Date(result.expiresAt).getTime() <= Date.now()
  )
    result.status = "expired";
  return result;
}
const invitationColumns =
  "SELECT i.*,c.name AS circle_name,c.host_id,c.privacy,u.name AS sender_name,r.name AS recipient_name FROM invitations i JOIN circles c ON c.id=i.circle_id JOIN users u ON u.id=i.sender_id JOIN users r ON r.id=i.recipient_id ";
const transferColumns =
  "SELECT t.*,c.name AS circle_name,c.host_id,u.name AS sender_name,r.name AS recipient_name FROM circle_transfers t JOIN circles c ON c.id=t.circle_id JOIN users u ON u.id=t.sender_id JOIN users r ON r.id=t.recipient_id ";

export async function getCircleInvitations(
  db: Queryable,
  context: QueryContext,
) {
  const user = requiredActor(context.actor),
    circle = await member(db, context.resourceId, user);
  return {
    items: (
      await db.query(
        invitationColumns +
          "WHERE i.circle_id=$1 AND (c.host_id=$2 OR i.sender_id=$2) ORDER BY i.created_at DESC LIMIT 100",
        [circle.id, user],
      )
    ).rows.map(invitationView),
  };
}
export async function getInvitation(db: Queryable, context: QueryContext) {
  const user = requiredActor(context.actor);
  return invitationView(
    await one(
      db,
      invitationColumns +
        "WHERE i.id=$1 AND (i.recipient_id=$2 OR (c.status='active' AND EXISTS(SELECT 1 FROM memberships m WHERE m.circle_id=c.id AND m.user_id=$2 AND m.status='accepted') AND (i.sender_id=$2 OR c.host_id=$2)))",
      [context.resourceId, user],
    ),
  );
}
export async function getCircleTransferHistory(
  db: Queryable,
  context: QueryContext,
) {
  const user = requiredActor(context.actor),
    circle = await member(db, context.resourceId, user);
  return {
    items: (
      await db.query(
        transferColumns +
          "WHERE t.circle_id=$1 AND (t.sender_id=$2 OR t.recipient_id=$2 OR c.host_id=$2) ORDER BY t.created_at DESC LIMIT 100",
        [circle.id, user],
      )
    ).rows.map(invitationView),
  };
}
export async function getCircleTransfer(db: Queryable, context: QueryContext) {
  const user = requiredActor(context.actor);
  return invitationView(
    await one(
      db,
      transferColumns +
        "WHERE t.id=$1 AND (t.sender_id=$2 OR t.recipient_id=$2 OR c.host_id=$2) AND EXISTS(SELECT 1 FROM memberships m WHERE m.circle_id=c.id AND m.user_id=$2 AND m.status='accepted')",
      [context.resourceId, user],
    ),
  );
}
