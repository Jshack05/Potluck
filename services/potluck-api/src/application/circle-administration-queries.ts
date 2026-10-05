import { api } from "../lib.ts";
import type { Queryable } from "./ports.ts";
import { requiredActor, type QueryContext } from "./query-context.ts";
export async function getCircleTransfers(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT t.*,c.name AS circle_name,u.name AS sender_name FROM circle_transfers t JOIN circles c ON c.id=t.circle_id JOIN users u ON u.id=t.sender_id WHERE t.recipient_id=$1 AND t.status='pending' AND t.expires_at>now() ORDER BY t.created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
