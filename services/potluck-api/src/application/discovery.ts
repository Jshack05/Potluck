import {
  id,
  listingInput,
  messageInput,
  requestInput,
  versionInput,
} from "@potluck/contracts";
import { z } from "zod";
import { api, audit, demand, notify, one, unblocked, uuid } from "../lib.ts";
import { expireInvitations } from "./invitation-lifecycle.ts";
import type { CommandContext, Queryable, Row } from "./ports.ts";
import { conversation } from "./read-models.ts";
export async function createListing(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const v = listingInput.parse(context.body);
  const result = await one(
    tx,
    "INSERT INTO listings(id,host_id,title,brand,category,description,share_minor,total_minor,capacity,filled,location,move_in,service_kind) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *",
    [
      uuid(),
      user,
      v.title,
      v.brand,
      v.category,
      v.description,
      v.shareMinor,
      v.totalMinor,
      v.capacity,
      v.filled,
      v.location,
      v.moveIn,
      v.serviceKind,
    ],
  );
  await audit(tx, user, "listing.created", result.id, context.requestId);
  return api(result);
}
export async function publishListing(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { expectedVersion } = versionInput.parse(context.body);
  const listing = await one(
    tx,
    "SELECT * FROM listings WHERE id=$1 AND host_id=$2 FOR UPDATE",
    [context.resourceId, user],
  );
  demand(
    listing.version === expectedVersion &&
      ["draft", "verification_required"].includes(listing.status),
    409,
    "LISTING_CHANGED",
    "Review the latest listing.",
  );
  const status =
    listing.category === "housing" ? "verification_required" : "published";
  const result = await one(
    tx,
    "UPDATE listings SET status=$1,version=version+1 WHERE id=$2 RETURNING *",
    [status, listing.id],
  );
  await audit(tx, user, "listing." + status, listing.id, context.requestId);
  return api(result);
}
export async function editListing(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { expectedVersion, ...fields } = z
    .object({ expectedVersion: z.number().int().positive() })
    .passthrough()
    .parse(context.body);
  const input = listingInput.parse(fields),
    listing = await one(
      tx,
      "SELECT * FROM listings WHERE id=$1 AND host_id=$2 FOR UPDATE",
      [context.resourceId, user],
    );
  demand(
    listing.version === expectedVersion && listing.status !== "closed",
    409,
    "LISTING_CHANGED",
    "Review the latest listing.",
  );
  // Changing a published offer withdraws it until the host deliberately republishes.
  const result = await one(
    tx,
    "UPDATE listings SET title=$1,brand=$2,category=$3,description=$4,share_minor=$5,total_minor=$6,capacity=$7,filled=$8,location=$9,move_in=$10,service_kind=$11,status='draft',version=version+1 WHERE id=$12 RETURNING *",
    [
      input.title,
      input.brand,
      input.category,
      input.description,
      input.shareMinor,
      input.totalMinor,
      input.capacity,
      input.filled,
      input.location,
      input.moveIn,
      input.serviceKind,
      listing.id,
    ],
  );
  await audit(tx, user, "listing.updated", listing.id, context.requestId, {
    version: result.version,
  });
  return api(result);
}
export async function closeListing(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { expectedVersion } = versionInput.parse(context.body);
  const listing = await one(
    tx,
    "SELECT * FROM listings WHERE id=$1 AND host_id=$2 FOR UPDATE",
    [context.resourceId, user],
  );
  demand(
    listing.version === expectedVersion && listing.status !== "closed",
    409,
    "LISTING_CHANGED",
    "Review the latest listing.",
  );
  const result = await one(
    tx,
    "UPDATE listings SET status='closed',version=version+1 WHERE id=$1 RETURNING *",
    [listing.id],
  );
  await audit(tx, user, "listing.closed", listing.id, context.requestId);
  return api(result);
}
export async function requestListing(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = requestInput.parse(context.body);
  const listing = await one(
    tx,
    "SELECT * FROM listings WHERE id=$1 AND status='published' FOR UPDATE",
    [context.resourceId],
  );
  demand(
    listing.version === input.listingVersion,
    409,
    "LISTING_CHANGED",
    "This listing changed. Review the updated details before sending a request.",
  );
  demand(
    listing.host_id !== user,
    400,
    "OWN_LISTING",
    "You cannot request your own listing.",
  );
  await unblocked(tx, user, listing.host_id);
  const result = await one(
    tx,
    "INSERT INTO requests(id,listing_id,requester_id,message,rules_version,listing_version,listing_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [
      uuid(),
      listing.id,
      user,
      input.message,
      input.rulesVersion,
      listing.version,
      JSON.stringify({
        title: listing.title,
        shareMinor: listing.share_minor,
        capacity: listing.capacity,
        description: listing.description,
      }),
    ],
  );
  await audit(tx, user, "listing.requested", result.id, context.requestId, {
    rulesVersion: input.rulesVersion,
  });
  await notify(tx, listing.host_id, "listing_request", result.id);
  if (listing.category === "housing") {
    const c = await one(
      tx,
      "INSERT INTO conversations(id,listing_id,request_id,host_id,participant_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [uuid(), listing.id, result.id, listing.host_id, user],
    );
    await tx.query(
      "UPDATE requests SET status='accepted',version=version+1 WHERE id=$1",
      [result.id],
    );
    await tx.query(
      "INSERT INTO messages(id,conversation_id,sender_id,text) VALUES($1,$2,$3,$4)",
      [uuid(), c.id, user, input.message],
    );
    return { ...api(result), status: "accepted", conversationId: c.id };
  }
  return api(result);
}
export async function respondToRequest(
  tx: Queryable,
  user: string,
  context: CommandContext,
  action: "accept" | "decline" | "withdraw",
): Promise<Row> {
  const { expectedVersion } = versionInput.parse(context.body);
  const request = await one(
    tx,
    "SELECT r.*,l.host_id,l.status AS listing_status,l.version AS current_listing_version FROM requests r JOIN listings l ON l.id=r.listing_id WHERE r.id=$1 AND " +
      (action === "withdraw" ? "r.requester_id" : "l.host_id") +
      "=$2 FOR UPDATE OF r,l",
    [context.resourceId, user],
  );
  demand(
    request.status === "pending" &&
      request.version === expectedVersion &&
      (action !== "accept" || request.listing_status === "published"),
    409,
    "REQUEST_CHANGED",
    "This request is no longer available.",
  );
  if (action === "accept")
    demand(
      request.listing_version === request.current_listing_version,
      409,
      "LISTING_CHANGED",
      "The listing changed after this request. Ask the person to review it and send a new request.",
    );
  await unblocked(tx, request.host_id, request.requester_id);
  const status = {
    accept: "accepted",
    decline: "declined",
    withdraw: "withdrawn",
  }[action];
  await tx.query(
    "UPDATE requests SET status=$1,version=version+1 WHERE id=$2",
    [status, request.id],
  );
  await audit(tx, user, "request." + status, request.id, context.requestId);
  if (action !== "accept") return { id: request.id, status };
  const c = await one(
    tx,
    "INSERT INTO conversations(id,listing_id,request_id,host_id,participant_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
    [
      uuid(),
      request.listing_id,
      request.id,
      request.host_id,
      request.requester_id,
    ],
  );
  await tx.query(
    "INSERT INTO messages(id,conversation_id,sender_id,text) VALUES($1,$2,$3,$4)",
    [uuid(), c.id, request.requester_id, request.message],
  );
  await notify(tx, request.requester_id, "conversation_opened", c.id);
  return api(c);
}
export async function sendMessage(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = messageInput.parse(context.body),
    c = await conversation(tx, context.resourceId, user);
  await unblocked(tx, c.host_id, c.participant_id);
  const result = await one(
    tx,
    "INSERT INTO messages(id,conversation_id,sender_id,text) VALUES($1,$2,$3,$4) RETURNING *",
    [uuid(), c.id, user, input.text],
  );
  await notify(
    tx,
    c.host_id === user ? c.participant_id : c.host_id,
    "message",
    c.id,
  );
  return api(result);
}
export async function inviteFromConversation(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { circleId } = z.strictObject({ circleId: id }).parse(context.body),
    c = await conversation(tx, context.resourceId, user);
  await unblocked(tx, c.host_id, c.participant_id);
  await one(
    tx,
    "SELECT id FROM circles WHERE id=$1 AND host_id=$2 AND status='active' FOR UPDATE",
    [circleId, user],
  );
  const recipient = c.host_id === user ? c.participant_id : c.host_id;
  demand(
    !(
      await tx.query(
        "SELECT 1 FROM memberships WHERE circle_id=$1 AND user_id=$2 AND status='accepted'",
        [circleId, recipient],
      )
    ).rows.length,
    409,
    "ALREADY_MEMBER",
    "This person is already in the Circle.",
  );
  await expireInvitations(tx, circleId, recipient, user, context.requestId);
  const invitation = await one(
    tx,
    "INSERT INTO invitations(id,circle_id,sender_id,recipient_id) VALUES($1,$2,$3,$4) RETURNING *",
    [uuid(), circleId, user, recipient],
  );
  await audit(
    tx,
    user,
    "conversation.circle_invited",
    invitation.id,
    context.requestId,
  );
  await notify(tx, recipient, "circle_invitation", invitation.id);
  return api(invitation);
}
export async function blockUser(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { userId } = z.strictObject({ userId: id }).parse(context.body);
  demand(userId !== user, 400, "INVALID_TARGET", "Choose another person.");
  await one(tx, "SELECT id FROM users WHERE id=$1", [userId]);
  await tx.query(
    "INSERT INTO blocks(user_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
    [user, userId],
  );
  await audit(tx, user, "user.blocked", userId, context.requestId);
  return { blocked: true };
}
export async function reportListing(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { reason } = z
    .strictObject({ reason: z.string().trim().min(5).max(1000) })
    .parse(context.body);
  await one(tx, "SELECT id FROM listings WHERE id=$1 AND status='published'", [
    context.resourceId,
  ]);
  const reportId = uuid();
  await tx.query(
    "INSERT INTO reports(id,reporter_id,listing_id,reason) VALUES($1,$2,$3,$4)",
    [reportId, user, context.resourceId, reason],
  );
  await audit(tx, user, "listing.reported", reportId, context.requestId);
  return { id: reportId, status: "received" };
}
export async function saveListing(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { saved } = z.strictObject({ saved: z.boolean() }).parse(context.body);
  await one(tx, "SELECT id FROM listings WHERE id=$1 AND status='published'", [
    context.resourceId,
  ]);
  if (saved)
    await tx.query(
      "INSERT INTO saved_listings(user_id,listing_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [user, context.resourceId],
    );
  else
    await tx.query(
      "DELETE FROM saved_listings WHERE user_id=$1 AND listing_id=$2",
      [user, context.resourceId],
    );
  return { saved };
}
export async function readNotification(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  return api(
    await one(
      tx,
      "UPDATE outbox SET read_at=now() WHERE id=$1 AND recipient_id=$2 RETURNING *",
      [context.resourceId, user],
    ),
  );
}
