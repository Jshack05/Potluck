import { z } from "zod";
import { goalInput } from "../../../../packages/contracts/src/goals.ts";
import {
  api,
  attachable,
  audit,
  demand,
  member,
  one,
  unblocked,
  uuid,
} from "../lib.ts";
import type { CommandContext, Queryable } from "./ports.ts";
import { requiredActor, type QueryContext } from "./query-context.ts";

async function goalView(db: Queryable, id: string, actor: string) {
  const goal = await one(
    db,
    "SELECT g.*,c.name AS circle_name,k.name AS card_name FROM goals g LEFT JOIN circles c ON c.id=g.circle_id LEFT JOIN cards k ON k.id=g.card_id WHERE g.id=$1 AND g.host_id=$2",
    [id, actor],
  );
  const people = (
    await db.query(
      "SELECT p.person_id,p.amount_minor,u.name FROM goal_planned_contributions p JOIN users u ON u.id=p.person_id WHERE p.goal_id=$1 ORDER BY u.name,p.person_id",
      [id],
    )
  ).rows.map(api);
  return {
    ...api(goal),
    id: String(goal.id),
    plannedContributions: people,
    fundedMinor: null,
    fundingStatus: "not_authorized",
    invitationStatus: "not_sent",
  };
}
export async function getGoals(db: Queryable, context: QueryContext) {
  const actor = requiredActor(context.actor);
  const query = z
    .object({ offset: z.coerce.number().int().min(0).max(100000).default(0) })
    .parse(context.query ?? {});
  const rows = (
    await db.query(
      "SELECT id FROM goals WHERE host_id=$1 ORDER BY created_at DESC,id LIMIT 51 OFFSET $2",
      [actor, query.offset],
    )
  ).rows;
  return {
    items: await Promise.all(
      rows.slice(0, 50).map((row) => goalView(db, row.id, actor)),
    ),
    nextOffset: rows.length > 50 ? query.offset + 50 : null,
  };
}
export async function getGoal(db: Queryable, context: QueryContext) {
  return goalView(db, context.resourceId, requiredActor(context.actor));
}
export async function createGoal(
  tx: Queryable,
  actor: string,
  context: CommandContext,
) {
  const input = goalInput.parse(context.body);
  await attachable(tx, input.circleId, actor);
  const circle = input.circleId
    ? await member(tx, input.circleId, actor, true)
    : null;
  demand(
    !input.showContributions || (circle && circle.privacy === "normal"),
    409,
    "GOAL_PRIVACY",
    "Showing contributions requires a non-anonymous Circle.",
  );
  if (input.cardId) {
    const card = await one(
      tx,
      "SELECT id,circle_id,status FROM cards WHERE id=$1 AND host_id=$2 FOR UPDATE",
      [input.cardId, actor],
    );
    demand(
      card.status === "setup_required",
      409,
      "CARD_CLOSED",
      "Choose an available Card setup.",
    );
    demand(
      !card.circle_id || card.circle_id === input.circleId,
      409,
      "CIRCLE_MISMATCH",
      "Choose the Circle attached to this Card.",
    );
  }
  for (const person of input.plannedContributions) {
    if (person.personId === actor) continue;
    demand(
      circle,
      403,
      "GOAL_PERSON_UNAVAILABLE",
      "Choose a Circle before planning contributions from other people.",
    );
    await member(tx, circle.id, person.personId, true);
    await unblocked(tx, actor, person.personId);
  }
  const goal = await one(
    tx,
    "INSERT INTO goals(id,host_id,circle_id,card_id,name,kind,target_minor,end_date,first_contribution_date,frequency,currency,lock_funds_requested,show_contributions) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *",
    [
      uuid(),
      actor,
      input.circleId,
      input.cardId,
      input.name,
      input.kind,
      input.targetMinor,
      input.endDate,
      input.firstContributionDate,
      input.frequency,
      input.currency,
      input.lockFundsRequested,
      input.showContributions,
    ],
  );
  for (const person of input.plannedContributions)
    await tx.query(
      "INSERT INTO goal_planned_contributions(goal_id,person_id,amount_minor,currency) VALUES($1,$2,$3,$4)",
      [goal.id, person.personId, person.amountMinor, input.currency],
    );
  await audit(tx, actor, "goal.draft_created", goal.id, context.requestId, {
    priorState: null,
    resultingState: "draft",
    plannedPeople: input.plannedContributions.length,
    fundingStatus: "not_authorized",
  });
  return goalView(tx, goal.id, actor);
}
