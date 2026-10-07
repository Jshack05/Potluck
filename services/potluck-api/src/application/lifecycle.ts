import { billInput, id, versionInput } from "@potluck/contracts";
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
import type { CommandContext, Queryable, Row } from "./ports.ts";
const acknowledged = versionInput.extend({ acknowledged: z.literal(true) });
export async function reviseBill(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { expectedVersion, expectedConnectionVersion, ...fields } = z
      .object({
        expectedVersion: z.number().int().positive(),
        expectedConnectionVersion: z.number().int().positive(),
      })
      .passthrough()
      .parse(context.body),
    v = billInput.parse(fields);
  const bill = await one(
    tx,
    "SELECT * FROM bills WHERE id=$1 AND host_id=$2 FOR UPDATE",
    [context.resourceId, user],
  );
  if (v.planningOnly) {
    demand(
      v.participants.length === 1 &&
        v.participants[0] === user &&
        !(
          await tx.query("SELECT 1 FROM agreements WHERE bill_id=$1 LIMIT 1", [
            bill.id,
          ])
        ).rows.length,
      400,
      "INVALID_PRIVATE_BILL",
      "An existing agreement cannot be replaced by a personal draft.",
    );
  }
  demand(
    bill.status !== "ended" && bill.version === expectedVersion,
    409,
    "BILL_CHANGED",
    "Review the latest Bill before changing its terms.",
  );
  demand(
    bill.connection_version === expectedConnectionVersion,
    409,
    "CONNECTION_CHANGED",
    "Review the current Bill connection before changing its terms.",
  );
  await attachable(tx, v.circleId, user);
  if (v.cardId)
    await one(
      tx,
      "SELECT id FROM cards WHERE id=$1 AND host_id=$2 AND status='setup_required' FOR UPDATE",
      [v.cardId, user],
    );
  for (const person of v.participants) {
    if (person !== user) await unblocked(tx, user, person);
    await one(tx, "SELECT id FROM users WHERE id=$1 AND NOT disabled", [
      person,
    ]);
    if (
      person !== user &&
      v.circleId &&
      !(
        await tx.query(
          "SELECT 1 FROM agreements WHERE bill_id=$1 AND participant_id=$2",
          [bill.id, person],
        )
      ).rows.length
    )
      await member(tx, v.circleId, person, true);
  }
  let proposal;
  try {
    proposal = proposalShares(v);
  } catch (e) {
    throw new AppError(400, "INVALID_ALLOCATION", (e as Error).message);
  }
  const { allocation, caps, calculations } = proposal;
  const result = await one(
    tx,
    "UPDATE bills SET name=$1,circle_id=$2,card_id=$3,kind=$4,amount_minor=$5,maximum_minor=$6,frequency=$7,first_due_date=$8,version=version+1,connection_version=connection_version+CASE WHEN circle_id IS DISTINCT FROM $2::uuid OR card_id IS DISTINCT FROM $3::uuid THEN 1 ELSE 0 END,icon=$10,color=$11,status=$12 WHERE id=$9 RETURNING *",
    [
      v.name,
      v.circleId,
      v.cardId,
      v.kind,
      v.amountMinor,
      v.maximumMinor,
      v.frequency,
      v.firstDueDate,
      bill.id,
      v.icon,
      v.color,
      v.planningOnly ? "draft" : "proposed",
    ],
  );
  if (v.planningOnly) {
    await audit(tx, user, "bill.updated", bill.id, context.requestId, {
      version: result.version,
    });
    return api(result);
  }
  await tx.query(
    "UPDATE agreements SET status='withdrawn' WHERE bill_id=$1 AND status='offered'",
    [bill.id],
  );
  for (const person of v.participants) {
    const maximum = caps[person];
    const terms = {
      calculation: calculations[person],
      amountMinor: allocation[person],
      maximumMinor: maximum,
      currency: v.currency,
      frequency: v.frequency,
      firstDueDate: v.firstDueDate,
      kind: v.kind,
      fundingAuthorization: "none",
      capBehavior: "stop_if_exceeded",
      ...(v.reasonForChange ? { reasonForChange: v.reasonForChange } : {}),
    };
    const aid = uuid();
    await tx.query(
      "INSERT INTO agreements(id,bill_id,participant_id,amount_minor,maximum_minor,currency,terms_version,terms) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        aid,
        bill.id,
        person,
        allocation[person],
        maximum,
        v.currency,
        result.version,
        JSON.stringify(terms),
      ],
    );
    await notify(tx, person, "agreement_offered", aid);
  }
  await audit(tx, user, "bill.revised", bill.id, context.requestId, {
    previousVersion: bill.version,
    version: result.version,
  });
  const agreements = (
    await tx.query(
      "SELECT * FROM agreements WHERE bill_id=$1 ORDER BY terms_version DESC",
      [bill.id],
    )
  ).rows.map(api);
  return { ...api(result), agreements };
}
export async function respondToAgreement(
  tx: Queryable,
  user: string,
  context: CommandContext,
  action: "decline" | "cancel",
): Promise<Row> {
  const { termsVersion } = z
    .strictObject({ termsVersion: z.number().int().positive() })
    .parse(context.body);
  const a = await one(
    tx,
    "SELECT a.* FROM agreements a JOIN bills b ON b.id=a.bill_id WHERE a.id=$1 AND a.participant_id=$2 FOR UPDATE OF a,b",
    [context.resourceId, user],
  );
  demand(
    a.terms_version === termsVersion &&
      a.status === (action === "decline" ? "offered" : "accepted"),
    409,
    "TERMS_CHANGED",
    "Review the current agreement.",
  );
  const result = await one(
    tx,
    "UPDATE agreements SET status=$1 WHERE id=$2 RETURNING *",
    [action === "decline" ? "declined" : "canceled", a.id],
  );
  await audit(tx, user, "agreement." + result.status, a.id, context.requestId, {
    termsVersion,
    previousStatus: a.status,
  });
  return api(result);
}
export async function endBill(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { expectedVersion } = acknowledged.parse(context.body),
    b = await one(
      tx,
      "SELECT * FROM bills WHERE id=$1 AND host_id=$2 FOR UPDATE",
      [context.resourceId, user],
    );
  demand(
    b.version === expectedVersion && b.status !== "ended",
    409,
    "BILL_CHANGED",
    "Review the current Bill.",
  );
  await tx.query(
    "UPDATE agreements SET status=CASE WHEN status='accepted' THEN 'canceled' ELSE 'withdrawn' END WHERE bill_id=$1 AND status IN ('accepted','offered')",
    [b.id],
  );
  const result = await one(
    tx,
    "UPDATE bills SET status='ended',version=version+1 WHERE id=$1 RETURNING *",
    [b.id],
  );
  await audit(tx, user, "bill.ended", b.id, context.requestId, {
    externalServiceCanceled: false,
    moneyMoved: false,
  });
  return api(result);
}
export async function changeMembership(
  tx: Queryable,
  user: string,
  context: CommandContext,
  action: "leave" | "remove",
): Promise<Row> {
  const v = (
      action === "remove" ? acknowledged.extend({ userId: id }) : acknowledged
    ).parse(context.body),
    circle = await member(tx, context.resourceId, user, true);
  await one(tx, "SELECT id FROM circles WHERE id=$1 FOR UPDATE", [circle.id]);
  demand(
    circle.version === v.expectedVersion,
    409,
    "CIRCLE_CHANGED",
    "Review the current Circle.",
  );
  if (action === "remove")
    demand(
      circle.host_id === user,
      403,
      "FORBIDDEN",
      "Only the Circle Host can remove a member.",
    );
  const target =
    action === "leave"
      ? user
      : id.parse((context.body as { userId?: unknown }).userId);
  demand(
    target !== circle.host_id,
    409,
    "HOST_REQUIRED",
    "Transfer Circle hosting before the host leaves.",
  );
  const result = await one(
    tx,
    "UPDATE memberships SET status=$1 WHERE circle_id=$2 AND user_id=$3 AND status='accepted' RETURNING *",
    [action === "leave" ? "left" : "removed", circle.id, target],
  );
  await audit(
    tx,
    user,
    "circle.member_" + result.status,
    circle.id,
    context.requestId,
    { memberId: target, independentAgreementsUnchanged: true },
  );
  return api(result);
}
export async function closeCard(
  tx: Queryable,
  user: string,
  context: CommandContext,
): Promise<Row> {
  const { expectedVersion } = acknowledged.parse(context.body),
    c = await one(
      tx,
      "SELECT * FROM cards WHERE id=$1 AND host_id=$2 FOR UPDATE",
      [context.resourceId, user],
    );
  demand(
    c.version === expectedVersion && c.status === "setup_required",
    409,
    "CARD_CHANGED",
    "Review the current Card setup.",
  );
  demand(
    !(
      await tx.query(
        "SELECT 1 FROM bills WHERE card_id=$1 AND status!='ended'",
        [c.id],
      )
    ).rows.length,
    409,
    "BILLS_ATTACHED",
    "Disconnect or end active Bills before closing this setup.",
  );
  const result = await one(
    tx,
    "UPDATE cards SET status='closed',version=version+1 WHERE id=$1 RETURNING *",
    [c.id],
  );
  await audit(tx, user, "card.shell_closed", c.id, context.requestId);
  return api(result);
}
export async function changeConnection(
  tx: Queryable,
  user: string,
  context: CommandContext,
  type: "bills" | "cards",
): Promise<Row> {
  const v = versionInput
      .extend({
        circleId: id.nullable(),
        cardId: id.nullable().optional(),
        expectedConnectionVersion: z.number().int().positive().optional(),
      })
      .parse(context.body),
    resource = await one(
      tx,
      "SELECT * FROM " + type + " WHERE id=$1 AND host_id=$2 FOR UPDATE",
      [context.resourceId, user],
    );
  demand(
    resource.version === v.expectedVersion &&
      !["ended", "closed"].includes(resource.status),
    409,
    "RESOURCE_CHANGED",
    "Review the latest details.",
  );
  if (type === "bills")
    demand(
      v.expectedConnectionVersion === resource.connection_version,
      409,
      "CONNECTION_CHANGED",
      "Review the current connection.",
    );
  await attachable(tx, v.circleId, user);
  if (type === "bills" && v.cardId)
    await one(
      tx,
      "SELECT id FROM cards WHERE id=$1 AND host_id=$2 AND status='setup_required' FOR UPDATE",
      [v.cardId, user],
    );
  // Connection metadata does not replace accepted financial terms or their version.
  const result =
    type === "bills"
      ? await one(
          tx,
          "UPDATE bills SET circle_id=$1,card_id=$2,connection_version=connection_version+1 WHERE id=$3 RETURNING *",
          [
            v.circleId,
            v.cardId === undefined ? resource.card_id : v.cardId,
            resource.id,
          ],
        )
      : await one(
          tx,
          "UPDATE cards SET circle_id=$1,version=version+1 WHERE id=$2 RETURNING *",
          [v.circleId, resource.id],
        );
  await audit(
    tx,
    user,
    type.slice(0, -1) + ".connection_changed",
    resource.id,
    context.requestId,
    { circleId: v.circleId },
  );
  return api(result);
}
