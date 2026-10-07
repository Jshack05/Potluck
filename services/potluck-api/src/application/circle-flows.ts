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
import { expireInvitations } from "./invitation-lifecycle.ts";
import type { CommandContext, Queryable, Row } from "./ports.ts";

const inviteInput = z.union([
  z.strictObject({
    email: z.email().transform((value) => value.toLowerCase().trim()),
  }),
  z.strictObject({ recipientId: id }),
]);

export async function createCircle(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = circleInput.parse(context.body);
  demand(
    input.invitedEmails.length + input.invitedUserIds.length <= 20,
    400,
    "TOO_MANY_INVITATIONS",
    "Choose up to 20 people.",
  );
  const circle = await one(
    tx,
    "INSERT INTO circles(id,host_id,name,description,privacy,icon,color,members_can_invite,require_host_approval) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    [
      uuid(),
      user,
      input.name,
      input.description,
      input.privacy,
      input.icon,
      input.color,
      input.membersCanInvite,
      input.requireHostApproval,
    ],
  );
  await tx.query(
    "INSERT INTO memberships(circle_id,user_id,status) VALUES($1,$2,'accepted')",
    [circle.id, user],
  );
  await audit(tx, user, "circle.created", circle.id, context.requestId);
  const recipients = new Set<string>(input.invitedUserIds);
  for (const email of input.invitedEmails) {
    const recipient = await one(
      tx,
      "SELECT id FROM users WHERE email=$1 AND NOT disabled",
      [email.toLowerCase().trim()],
    );
    recipients.add(recipient.id);
  }
  for (const recipientId of recipients)
    await inviteToCircle(tx, user, {
      ...context,
      resourceId: circle.id,
      body: { recipientId },
    });
  return api(circle);
}

export async function inviteToCircle(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const circle = await member(tx, context.resourceId, user, true);
  const host = circle.host_id === user;
  demand(
    host || (circle.members_can_invite && circle.privacy === "normal"),
    403,
    "FORBIDDEN",
    "Only the Circle Host can invite people here.",
  );
  const input = inviteInput.parse(context.body);
  const recipient = await one(
    tx,
    "SELECT id FROM users WHERE " +
      ("email" in input ? "email" : "id") +
      "=$1 AND NOT disabled",
    ["email" in input ? input.email : input.recipientId],
  );
  demand(
    recipient.id !== user,
    400,
    "ALREADY_MEMBER",
    "You already belong to this Circle.",
  );
  await unblocked(tx, user, recipient.id);
  await unblocked(tx, circle.host_id, recipient.id);
  demand(
    !(
      await tx.query(
        "SELECT 1 FROM memberships WHERE circle_id=$1 AND user_id=$2 AND status='accepted'",
        [circle.id, recipient.id],
      )
    ).rows.length,
    409,
    "ALREADY_MEMBER",
    "This person already belongs to the Circle.",
  );
  await expireInvitations(tx, circle.id, recipient.id, user, context.requestId);
  const status =
    !host && circle.require_host_approval
      ? "awaiting_host_approval"
      : "pending";
  const invitation = await one(
    tx,
    "INSERT INTO invitations(id,circle_id,sender_id,recipient_id,status) VALUES($1,$2,$3,$4,$5) RETURNING *",
    [uuid(), circle.id, user, recipient.id, status],
  );
  await audit(
    tx,
    user,
    status === "pending" ? "invitation.created" : "invitation.suggested",
    invitation.id,
    context.requestId,
    { status },
  );
  await notify(
    tx,
    status === "pending" ? recipient.id : circle.host_id,
    status === "pending" ? "circle_invitation" : "circle_invitation_approval",
    invitation.id,
  );
  return api(invitation);
}

export async function respondToInvitation(
  tx: Queryable,
  user: string,
  context: CommandContext,
  action: "accept" | "decline" | "revoke" | "approve",
): Promise<Row> {
  const { expectedVersion } = versionInput.parse(context.body);
  // Lock the Circle before its invitation, matching create/approve/archive order.
  const candidate = await one(
    tx,
    "SELECT i.* FROM invitations i JOIN circles c ON c.id=i.circle_id WHERE i.id=$1 AND " +
      (action === "approve"
        ? "c.host_id=$2"
        : action === "revoke"
          ? "(i.sender_id=$2 OR c.host_id=$2)"
          : "i.recipient_id=$2"),
    [context.resourceId, user],
  );
  const circle = await one(
    tx,
    "SELECT * FROM circles WHERE id=$1 AND status='active' FOR UPDATE",
    [candidate.circle_id],
  );
  const invitation = await one(
    tx,
    "SELECT * FROM invitations WHERE id=$1 FOR UPDATE",
    [candidate.id],
  );
  demand(
    action !== "approve" || circle.host_id === user,
    403,
    "FORBIDDEN",
    "Only the current Circle Host can approve.",
  );
  demand(
    action !== "revoke" ||
      invitation.sender_id === user ||
      circle.host_id === user,
    403,
    "FORBIDDEN",
    "This action is unavailable.",
  );
  const allowed =
    action === "approve"
      ? invitation.status === "awaiting_host_approval"
      : action === "revoke"
        ? ["pending", "awaiting_host_approval"].includes(invitation.status)
        : invitation.status === "pending";
  demand(
    allowed &&
      invitation.version === expectedVersion &&
      new Date(invitation.expires_at).getTime() > Date.now(),
    409,
    "INVITATION_CHANGED",
    "This invitation is no longer available.",
  );
  if (action === "approve" || action === "accept") {
    await member(tx, circle.id, invitation.sender_id);
    await unblocked(tx, invitation.sender_id, invitation.recipient_id);
    await unblocked(tx, circle.host_id, invitation.recipient_id);
    demand(
      invitation.sender_id === circle.host_id ||
        (circle.members_can_invite && circle.privacy === "normal"),
      409,
      "INVITATION_CHANGED",
      "Ask the Circle Host for a new invitation.",
    );
  }
  const status = {
    accept: "accepted",
    decline: "declined",
    revoke: "revoked",
    approve: "pending",
  }[action];
  const result = await one(
    tx,
    "UPDATE invitations SET status=$1,version=version+1 WHERE id=$2 RETURNING *",
    [status, invitation.id],
  );
  if (action === "accept")
    await tx.query(
      "INSERT INTO memberships(circle_id,user_id,status) VALUES($1,$2,'accepted') ON CONFLICT(circle_id,user_id) DO UPDATE SET status='accepted',joined_at=now()",
      [circle.id, user],
    );
  await audit(
    tx,
    user,
    action === "approve" ? "invitation.approved" : "invitation." + status,
    invitation.id,
    context.requestId,
    { priorState: invitation.status, resultingState: status },
  );
  if (action === "approve")
    await notify(
      tx,
      invitation.recipient_id,
      "circle_invitation",
      invitation.id,
    );
  return api(result);
}
