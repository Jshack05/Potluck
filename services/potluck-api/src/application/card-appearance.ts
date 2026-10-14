import { cardAppearanceInput } from "@potluck/contracts";
import { api, audit, demand, one } from "../lib.ts";
import type { CommandContext, Queryable, Row } from "./ports.ts";

export async function authorizeCardAppearance(
  db: Queryable,
  user: string,
  cardId: string,
) {
  const card = await one(
    db,
    "SELECT * FROM cards WHERE id=$1 AND host_id=$2 FOR UPDATE",
    [cardId, user],
  );
  demand(
    card.status === "setup_required",
    409,
    "CARD_CLOSED",
    "This Card cannot be edited.",
  );
  return card;
}

const identity = (card: Row) => ({
  name: card.name,
  design: card.design,
  version: card.version,
});

export async function saveCardAppearance(
  tx: Queryable,
  user: string,
  context: CommandContext,
) {
  const input = cardAppearanceInput.parse(context.body);
  const prior = await authorizeCardAppearance(tx, user, context.resourceId);
  demand(
    prior.version === input.expectedVersion,
    409,
    "VERSION_CONFLICT",
    "This Card changed elsewhere. Reopen Edit card to review its latest details.",
  );
  const result = await one(
    tx,
    "UPDATE cards SET name=$1,design=$2,version=version+1 WHERE id=$3 RETURNING *",
    [input.name, input.design, prior.id],
  );
  await audit(
    tx,
    user,
    "card.appearance_updated",
    prior.id,
    context.requestId,
    { prior: identity(prior), resulting: identity(result) },
  );
  return api(result);
}
