import { circleInput, id, versionInput } from "@potluck/contracts";
import { z } from "zod";
import {
  api,
  audit,
  demand,
  member,
  notify,
  one,
  unblocked,
  uuid,
} from "../lib.ts";
import type { CommandContext, Queryable, Row } from "./ports.ts";
export async function editCircle(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = circleInput
      .omit({ invitedEmails: true, invitedUserIds: true })
      .extend({
        expectedVersion: z.number().int().positive(),
        icon: z.enum(["circles", "home", "heart", "star"]).optional(),
        color: z.enum(["lilac", "mint", "peach", "blue"]).optional(),
        membersCanInvite: z.boolean().optional(),
        requireHostApproval: z.boolean().optional(),
      })
      .parse(context.body),
    c = await one(
      tx,
      "SELECT * FROM circles WHERE id=$1 AND host_id=$2 AND status='active' FOR UPDATE",
      [context.resourceId, user],
    );
  demand(
    c.version === input.expectedVersion,
    409,
    "CIRCLE_CHANGED",
    "Review the current Circle.",
  );
  const result = await one(
    tx,
    "UPDATE circles SET name=$1,description=$2,privacy=$3,icon=$4,color=$5,members_can_invite=$6,require_host_approval=$7,version=version+1 WHERE id=$8 RETURNING *",
    [
      input.name,
      input.description,
      input.privacy,
      input.icon ?? c.icon,
      input.color ?? c.color,
      input.membersCanInvite ?? c.members_can_invite,
      input.requireHostApproval ?? c.require_host_approval,
      c.id,
    ],
  );
  await audit(tx, user, "circle.updated", c.id, context.requestId, {
    previousPrivacy: c.privacy,
    privacy: input.privacy,
    previousSettings: {
      icon: c.icon,
      color: c.color,
      membersCanInvite: c.members_can_invite,
      requireHostApproval: c.require_host_approval,
    },
    settings: {
      icon: result.icon,
      color: result.color,
      membersCanInvite: result.members_can_invite,
      requireHostApproval: result.require_host_approval,
    },
  });
  return api(result);
}
export async function proposeHosting(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const v = versionInput.extend({ userId: id }).parse(context.body),
    c = await one(
      tx,
      "SELECT * FROM circles WHERE id=$1 AND host_id=$2 AND status='active' FOR UPDATE",
      [context.resourceId, user],
    );
  demand(
    c.version === v.expectedVersion && user !== v.userId,
    409,
    "CIRCLE_CHANGED",
    "Choose another accepted member of this Circle.",
  );
  await member(tx, c.id, v.userId);
  await unblocked(tx, user, v.userId);
  await tx.query(
    "UPDATE circle_transfers SET status='revoked',version=version+1 WHERE circle_id=$1 AND status='pending'",
    [c.id],
  );
  const result = await one(
    tx,
    "INSERT INTO circle_transfers(id,circle_id,sender_id,recipient_id,circle_version) VALUES($1,$2,$3,$4,$5) RETURNING *",
    [uuid(), c.id, user, v.userId, c.version],
  );
  await audit(
    tx,
    user,
    "circle.transfer_proposed",
    result.id,
    context.requestId,
  );
  await notify(tx, v.userId, "circle_transfer", result.id);
  return api(result);
}
export async function respondToHosting(
  tx: Queryable,
  user: string,
  context: CommandContext,
  action: "accept" | "decline" | "revoke",
): Promise<Row> {
  const v = versionInput.parse(context.body),
    t = await one(
      tx,
      "SELECT * FROM circle_transfers WHERE id=$1 AND " +
        (action === "revoke" ? "sender_id" : "recipient_id") +
        "=$2 FOR UPDATE",
      [context.resourceId, user],
    );
  const c = await one(
    tx,
    "SELECT * FROM circles WHERE id=$1 AND status='active' FOR UPDATE",
    [t.circle_id],
  );
  demand(
    t.status === "pending" &&
      t.version === v.expectedVersion &&
      new Date(t.expires_at).getTime() > Date.now(),
    409,
    "TRANSFER_CHANGED",
    "This hosting invitation is no longer available.",
  );
  if (action === "accept") {
    demand(
      c.host_id === t.sender_id && c.version === t.circle_version,
      409,
      "CIRCLE_CHANGED",
      "Ask the host for a new hosting invitation.",
    );
    await member(tx, c.id, user);
    await unblocked(tx, t.sender_id, user);
    await tx.query(
      "UPDATE circles SET host_id=$1,version=version+1 WHERE id=$2",
      [user, c.id],
    );
  }
  const result = await one(
    tx,
    "UPDATE circle_transfers SET status=$1,version=version+1 WHERE id=$2 RETURNING *",
    [
      { accept: "accepted", decline: "declined", revoke: "revoked" }[action],
      t.id,
    ],
  );
  await audit(
    tx,
    user,
    "circle.transfer_" + result.status,
    t.id,
    context.requestId,
    { cardAndBillOwnershipUnchanged: true },
  );
  return api(result);
}
export async function archiveCircle(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const v = versionInput
      .extend({ acknowledged: z.literal(true) })
      .parse(context.body),
    c = await one(
      tx,
      "SELECT * FROM circles WHERE id=$1 AND host_id=$2 AND status='active' FOR UPDATE",
      [context.resourceId, user],
    );
  demand(
    c.version === v.expectedVersion,
    409,
    "CIRCLE_CHANGED",
    "Review the latest Circle.",
  );
  await tx.query(
    "UPDATE invitations SET status='revoked',version=version+1 WHERE circle_id=$1 AND status IN ('pending','awaiting_host_approval')",
    [c.id],
  );
  await tx.query(
    "UPDATE circle_transfers SET status='revoked',version=version+1 WHERE circle_id=$1 AND status='pending'",
    [c.id],
  );
  const result = await one(
    tx,
    "UPDATE circles SET status='archived',version=version+1 WHERE id=$1 RETURNING *",
    [c.id],
  );
  await audit(tx, user, "circle.archived", c.id, context.requestId, {
    independentFinancialArrangementsUnchanged: true,
  });
  return api(result);
}
