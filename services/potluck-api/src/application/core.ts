import { agreementAcceptance, billInput, cardInput } from "@potluck/contracts";
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
import type { CommandContext, Queryable, Row } from "./ports.ts";
import { billView, ownedCard } from "./read-models.ts";
export {
  createCircle,
  inviteToCircle,
  respondToInvitation,
} from "./circle-flows.ts";
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
  demand(
    !input.planningOnly ||
      (input.participants.length === 1 && input.participants[0] === user),
    400,
    "INVALID_PRIVATE_BILL",
    "A personal Bill can only include you. Review a proposal to invite other people.",
  );
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
    if (person !== user) await unblocked(tx, user, person);
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
    "INSERT INTO bills(id,host_id,circle_id,card_id,name,kind,amount_minor,maximum_minor,currency,frequency,first_due_date,icon,color,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *",
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
      input.icon,
      input.color,
      input.planningOnly ? "draft" : "proposed",
    ],
  );
  if (input.planningOnly) {
    await audit(tx, user, "bill.saved", bill.id, context.requestId, {
      version: 1,
    });
    return billView(tx, bill.id, user);
  }
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
      capBehavior: "stop_if_exceeded",
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
  const maximum = input.personalMaximumMinor ?? agreement.maximum_minor;
  demand(
    maximum <= agreement.maximum_minor &&
      (agreement.terms.kind === "flexible" ||
        maximum === agreement.maximum_minor),
    400,
    "INVALID_CAP",
    "Choose a maximum within the proposed terms. Fixed shares cannot be changed here.",
  );
  const terms = {
    ...agreement.terms,
    maximumMinor: maximum,
    proposedMaximumMinor: agreement.maximum_minor,
  };
  const result = await one(
    tx,
    "UPDATE agreements SET status='accepted',accepted_at=now(),maximum_minor=$2,terms=$3 WHERE id=$1 RETURNING *",
    [agreement.id, maximum, JSON.stringify(terms)],
  );
  await audit(tx, user, "agreement.accepted", agreement.id, context.requestId, {
    termsVersion: input.termsVersion,
    terms,
  });
  return api(result);
}
