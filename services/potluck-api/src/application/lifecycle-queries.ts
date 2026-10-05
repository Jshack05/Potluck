import { z } from "zod";
import { datesInMonth } from "../domain/schedule.ts";
import type { Queryable } from "./ports.ts";
import { requiredActor, type QueryContext } from "./query-context.ts";
export async function getBillSummary(db: Queryable, context: QueryContext) {
  const user = requiredActor(context.actor),
    q = z
      .object({
        month: z.string().regex(/^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/),
        scope: z.enum(["all", "shared"]).default("shared"),
      })
      .parse(context.query);
  const rows = (
    await db.query(
      "SELECT a.*,b.name,b.circle_id,b.card_id FROM agreements a JOIN bills b ON b.id=a.bill_id WHERE a.participant_id=$1 AND a.status='accepted' AND b.status!='ended'" +
        (q.scope === "shared"
          ? " AND (b.circle_id IS NOT NULL OR b.card_id IS NOT NULL)"
          : ""),
      [user],
    )
  ).rows;
  const occurrences = rows
    .flatMap((a) =>
      datesInMonth(a.terms.firstDueDate, a.terms.frequency, q.month).map(
        (date) => ({
          billId: a.bill_id,
          agreementId: a.id,
          name: a.name,
          date,
          amountMinor: a.amount_minor,
          estimated: a.terms.kind === "flexible",
          status: "funding_not_authorized",
        }),
      ),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    month: q.month,
    scope: q.scope,
    currency: "USD",
    totalMinor: occurrences.reduce((sum, x) => sum + x.amountMinor, 0),
    occurrences,
    financialActivity: false,
  };
}
