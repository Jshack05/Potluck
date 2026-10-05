import { api, one } from "../lib.ts";
import type { Queryable } from "./ports.ts";
export const ownedCard = (tx: Queryable, cardId: string, user: string) =>
  one(tx, "SELECT * FROM cards WHERE id=$1 AND host_id=$2", [cardId, user]);
export async function billView(tx: Queryable, billId: string, user: string) {
  const bill = await one(
    tx,
    "SELECT b.* FROM bills b WHERE b.id=$1 AND (b.host_id=$2 OR EXISTS(SELECT 1 FROM agreements a WHERE a.bill_id=b.id AND a.participant_id=$2))",
    [billId, user],
  );
  const host = bill.host_id === user;
  const agreements = (
    await tx.query(
      "SELECT a.*,u.name FROM agreements a JOIN users u ON u.id=a.participant_id WHERE a.bill_id=$1" +
        (host ? "" : " AND a.participant_id=$2") +
        " ORDER BY a.terms_version DESC,a.created_at",
      host ? [billId] : [billId, user],
    )
  ).rows.map(api);
  const result = api(bill);
  if (!host) delete result.cardId;
  return { ...result, role: host ? "host" : "contributor", agreements };
}
export const conversation = async (
  tx: Queryable,
  conversationId: string,
  user: string,
) =>
  one(
    tx,
    "SELECT c.*,l.title AS listing_title,h.name AS host_name,p.name AS participant_name FROM conversations c LEFT JOIN listings l ON l.id=c.listing_id JOIN users h ON h.id=c.host_id JOIN users p ON p.id=c.participant_id WHERE c.id=$1 AND (c.host_id=$2 OR c.participant_id=$2)",
    [conversationId, user],
  );
