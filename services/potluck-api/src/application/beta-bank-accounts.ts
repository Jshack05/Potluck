import { z } from "zod";
import { api, audit, demand, one, uuid } from "../lib.ts";
import type { CommandContext, Queryable } from "./ports.ts";

/** Local beta fixtures are deliberately separate from provider funding sources. */
export function requireBetaBankMode(enabled: boolean) {
  demand(
    enabled,
    404,
    "BETA_UNAVAILABLE",
    "This beta feature is not available.",
  );
}
export async function listBetaBankAccounts(
  db: Queryable,
  user: string,
  enabled: boolean,
) {
  requireBetaBankMode(enabled);
  const result = await db.query(
    "SELECT id, name, last4, state FROM beta_bank_accounts WHERE user_id=$1 ORDER BY fixture_key",
    [user],
  );
  return { items: result.rows.map(api) };
}
export async function connectBetaBankAccounts(
  tx: Queryable,
  user: string,
  context: CommandContext,
  enabled: boolean,
) {
  requireBetaBankMode(enabled);
  z.strictObject({}).parse(context.body);
  const fixtures = [
    ["1-personal", "Personal checking", "4821"],
    ["2-household", "Household checking", "7390"],
    ["3-savings", "Everyday savings", "2186"],
  ];
  for (const [key, name, last4] of fixtures) {
    const inserted = await tx.query(
      "INSERT INTO beta_bank_accounts(id,user_id,fixture_key,name,last4) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,fixture_key) DO NOTHING RETURNING id",
      [uuid(), user, key, name, last4],
    );
    if (inserted.rows[0])
      await audit(
        tx,
        user,
        "beta.account_connected",
        inserted.rows[0].id,
        context.requestId,
        { simulated: true },
      );
  }
  return listBetaBankAccounts(tx, user, enabled);
}
export async function requireOwnedBetaAccount(
  tx: Queryable,
  user: string,
  accountId: string,
  enabled: boolean,
) {
  requireBetaBankMode(enabled);
  await one(
    tx,
    "SELECT id FROM beta_bank_accounts WHERE id=$1 AND user_id=$2 AND state='simulated'",
    [accountId, user],
  );
}
