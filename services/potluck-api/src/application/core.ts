import {
  agreementAcceptance,
  billInput,
  cardInput,
  circleInput,
  versionInput,
} from "@potluck/contracts";
import { z } from "zod";
import { proposalShares } from "../domain/money.ts";
import {
  api,
  AppError,
  attachable,
  audit,
  demand,
  member,
  notify,
  one,
  uuid,
  unblocked,
} from "../lib.ts";
import { expireInvitations } from "./invitation-lifecycle.ts";
import type { CommandContext, Queryable, Row } from "./ports.ts";
import { billView, ownedCard } from "./read-models.ts";
export async function createCircle(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = circleInput.parse(context.body),
    circleId = uuid();
  const circle = await one(
    tx,
    "INSERT INTO circles(id,host_id,name,description,privacy) VALUES($1,$2,$3,$4,$5) RETURNING *",
    [circleId, user, input.name, input.description, input.privacy],
  );
  await tx.query(
    "INSERT INTO memberships(circle_id,user_id,status) VALUES($1,$2,'accepted')",
    [circleId, user],
  );
  await audit(tx, user, "circle.created", circleId, context.requestId);
  return api(circle);
}
export async function inviteToCircle(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const circle = await one(
    tx,
    "SELECT * FROM circles WHERE id=$1 AND host_id=$2 AND status='active' FOR UPDATE",
    [context.resourceId, user],
  );
  const input = z
    .strictObject({
      email: z.email().transform((v) => v.toLowerCase().trim()),
    })
    .parse(context.body);
  const recipient = await one(
    tx,
    "SELECT id FROM users WHERE email=$1 AND NOT disabled",
    [input.email],
  );
  demand(
    recipient.id !== user,
    400,
    "ALREADY_MEMBER",
    "You already belong to this Circle.",
  );
  await unblocked(tx, user, recipient.id);
  const existing = await tx.query(
    "SELECT 1 FROM memberships WHERE circle_id=$1 AND user_id=$2 AND status='accepted'",
    [circle.id, recipient.id],
  );
  demand(
    !existing.rows.length,
    409,
    "ALREADY_MEMBER",
    "This person already belongs to the Circle.",
  );
  await expireInvitations(tx, circle.id, recipient.id, user, context.requestId);
  const invitation = await one(
    tx,
    "INSERT INTO invitations(id,circle_id,sender_id,recipient_id) VALUES($1,$2,$3,$4) RETURNING *",
    [uuid(), circle.id, user, recipient.id],
  );
  await audit(tx, user, "invitation.created", invitation.id, context.requestId);
  await notify(tx, recipient.id, "circle_invitation", invitation.id);
  return api(invitation);
}
export async function respondToInvitation(
  tx: Queryable,
  user: string,
  context: CommandContext,
  action: "accept" | "decline" | "revoke",
): Promise<Row> {
  const { expectedVersion } = versionInput.parse(context.body);
  const invitation = await one(
    tx,
    "SELECT * FROM invitations WHERE id=$1 AND " +
      (action === "revoke" ? "sender_id" : "recipient_id") +
      "=$2 FOR UPDATE",
    [context.resourceId, user],
  );
  demand(
    invitation.status === "pending" &&
      invitation.version === expectedVersion &&
      new Date(invitation.expires_at).getTime() > Date.now(),
    409,
    "INVITATION_CHANGED",
    "This invitation is no longer available.",
  );
  await one(tx, "SELECT id FROM circles WHERE id=$1 AND status='active'", [
    invitation.circle_id,
  ]);
  if (action === "accept")
    await unblocked(tx, invitation.sender_id, invitation.recipient_id);
  const status = {
    accept: "accepted",
    decline: "declined",
    revoke: "revoked",
  }[action];
  const result = await one(
    tx,
    "UPDATE invitations SET status=$1,version=version+1 WHERE id=$2 RETURNING *",
    [status, invitation.id],
  );
  if (action === "accept")
    await tx.query(
      "INSERT INTO memberships(circle_id,user_id,status) VALUES($1,$2,'accepted') ON CONFLICT(circle_id,user_id) DO UPDATE SET status='accepted',joined_at=now()",
      [invitation.circle_id, user],
    );
  await audit(
    tx,
    user,
    "invitation." + status,
    invitation.id,
    context.requestId,
  );
  return api(result);
}
export async function createCard(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = cardInput.parse(context.body);
  await attachable(tx, input.circleId, user);
  const card = await one(
    tx,
    "INSERT INTO cards(id,host_id,circle_id,name,description,design) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
    [uuid(), user, input.circleId, input.name, input.description, input.design],
  );
  await audit(tx, user, "card.shell_created", card.id, context.requestId);
  return api(card);
}
export async function activateCard(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  await ownedCard(tx, context.resourceId, user);
  throw new AppError(
    409,
    "PROGRAM_UNAVAILABLE",
    "Card activation requires an approved issuing program. Your setup is saved.",
  );
}
export async function createBill(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = billInput.parse(context.body);
  await attachable(tx, input.circleId, user);
  if (input.cardId) {
    const card = await one(
      tx,
      "SELECT * FROM cards WHERE id=$1 AND host_id=$2 FOR UPDATE",
      [input.cardId, user],
    );
    demand(
      card.status === "setup_required",
      409,
      "CARD_CLOSED",
      "Choose an available Card.",
    );
  }
  for (const person of input.participants) {
    await one(tx, "SELECT id FROM users WHERE id=$1 AND NOT disabled", [
      person,
    ]);
    if (person !== user && input.circleId)
      await member(tx, input.circleId, person);
  }
  let proposal;
  try {
    proposal = proposalShares(input);
  } catch (e) {
    throw new AppError(400, "INVALID_ALLOCATION", (e as Error).message);
  }
  const { allocation, caps, calculations } = proposal;
  const bill = await one(
    tx,
    "INSERT INTO bills(id,host_id,circle_id,card_id,name,kind,amount_minor,maximum_minor,currency,frequency,first_due_date) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
    [
      uuid(),
      user,
      input.circleId,
      input.cardId,
      input.name,
      input.kind,
      input.amountMinor,
      input.maximumMinor,
      input.currency,
      input.frequency,
      input.firstDueDate,
    ],
  );
  for (const person of input.participants) {
    const maximum = caps[person];
    const terms = {
      calculation: calculations[person],
      amountMinor: allocation[person],
      maximumMinor: maximum,
      currency: input.currency,
      frequency: input.frequency,
      firstDueDate: input.firstDueDate,
      kind: input.kind,
      fundingAuthorization: "none",
    };
    const agreementId = uuid();
    await tx.query(
      "INSERT INTO agreements(id,bill_id,participant_id,amount_minor,maximum_minor,currency,terms_version,terms) VALUES($1,$2,$3,$4,$5,$6,1,$7)",
      [
        agreementId,
        bill.id,
        person,
        allocation[person],
        maximum,
        input.currency,
        JSON.stringify(terms),
      ],
    );
    await notify(tx, person, "agreement_offered", agreementId);
  }
  await audit(tx, user, "bill.proposed", bill.id, context.requestId, {
    version: 1,
  });
  return billView(tx, bill.id, user);
}
export async function acceptAgreement(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const input = agreementAcceptance.parse(context.body);
  const agreement = await one(
    tx,
    "SELECT a.*,b.version AS bill_version,b.status AS bill_status FROM agreements a JOIN bills b ON b.id=a.bill_id WHERE a.id=$1 AND a.participant_id=$2 FOR UPDATE OF a,b",
    [context.resourceId, user],
  );
  demand(
    agreement.status === "offered" &&
      agreement.terms_version === input.termsVersion &&
      agreement.bill_version === input.termsVersion &&
      agreement.bill_status !== "ended",
    409,
    "TERMS_CHANGED",
    "The terms changed. Review the latest proposal.",
  );
  await tx.query(
    "UPDATE agreements SET status='superseded' WHERE bill_id=$1 AND participant_id=$2 AND status='accepted'",
    [agreement.bill_id, user],
  );
  const result = await one(
    tx,
    "UPDATE agreements SET status='accepted',accepted_at=now() WHERE id=$1 RETURNING *",
    [agreement.id],
  );
  await audit(tx, user, "agreement.accepted", agreement.id, context.requestId, {
    termsVersion: input.termsVersion,
    terms: agreement.terms,
  });
  return api(result);
}
