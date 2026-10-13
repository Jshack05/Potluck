import {
  merchantControlsInput,
  merchantControlsState,
  merchantIndustries,
} from "@potluck/contracts";
import { audit, demand, one } from "../lib.ts";
import type { CommandContext, Queryable, Row } from "./ports.ts";

export async function authorizeMerchantControls(
  db: Queryable,
  user: string,
  cardId: string,
  edit = false,
) {
  const card = await one(
    db,
    "SELECT id, status FROM cards WHERE id=$1 AND host_id=$2" +
      (edit ? " FOR UPDATE" : ""),
    [cardId, user],
  );
  if (edit)
    demand(
      card.status === "setup_required",
      409,
      "CARD_CLOSED",
      "This Card cannot be edited.",
    );
}

function state(cardId: string, row?: Row) {
  return merchantControlsState.parse({
    cardId,
    version: row?.version ?? 0,
    settings: row
      ? {
          mode: row.mode,
          currency: row.currency,
          minimumMinor: row.minimum_minor,
          maximumMinor: row.maximum_minor,
          industries: row.industries,
        }
      : null,
    enforcement: "not_active",
  });
}

export async function getMerchantControls(
  db: Queryable,
  user: string,
  cardId: string,
) {
  await authorizeMerchantControls(db, user, cardId);
  return state(
    cardId,
    (
      await db.query("SELECT * FROM card_merchant_controls WHERE card_id=$1", [
        cardId,
      ])
    ).rows[0],
  );
}

export async function saveMerchantControls(
  tx: Queryable,
  user: string,
  context: CommandContext,
) {
  const input = merchantControlsInput.parse(context.body),
    cardId = context.resourceId;
  // Serialize initial creation, concurrent edits, and Card closure on the parent row.
  await authorizeMerchantControls(tx, user, cardId, true);
  const prior = state(
    cardId,
    (
      await tx.query("SELECT * FROM card_merchant_controls WHERE card_id=$1", [
        cardId,
      ])
    ).rows[0],
  );
  demand(
    prior.version === input.expectedVersion,
    409,
    "VERSION_CONFLICT",
    "These controls changed elsewhere. Reopen them to review the latest settings.",
  );
  const settings = {
    ...input.settings,
    industries: merchantIndustries.filter((id) =>
      input.settings.industries.includes(id),
    ),
  };
  const row = await one(
    tx,
    "INSERT INTO card_merchant_controls(card_id,mode,currency,minimum_minor,maximum_minor,industries,version) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(card_id) DO UPDATE SET mode=EXCLUDED.mode,currency=EXCLUDED.currency,minimum_minor=EXCLUDED.minimum_minor,maximum_minor=EXCLUDED.maximum_minor,industries=EXCLUDED.industries,version=EXCLUDED.version,updated_at=now() RETURNING *",
    [
      cardId,
      settings.mode,
      settings.currency,
      settings.minimumMinor,
      settings.maximumMinor,
      settings.industries,
      prior.version + 1,
    ],
  );
  const result = state(cardId, row);
  await audit(
    tx,
    user,
    "card.merchant_controls_saved",
    cardId,
    context.requestId,
    { prior, resulting: result },
  );
  return result;
}
