import { audit } from "../lib.ts";
import type { Queryable } from "./ports.ts";
export async function expireInvitations(
  tx: Queryable,
  circleId: string,
  recipientId: string,
  actor: string,
  requestId: string,
) {
  const expired = await tx.query(
    "UPDATE invitations SET status='expired',version=version+1 WHERE circle_id=$1 AND recipient_id=$2 AND status IN ('pending','awaiting_host_approval') AND expires_at<=now() RETURNING id",
    [circleId, recipientId],
  );
  for (const row of expired.rows)
    await audit(tx, actor, "invitation.expired", row.id, requestId);
}
