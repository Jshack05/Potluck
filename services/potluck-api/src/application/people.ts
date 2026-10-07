import { z } from "zod";
import type { Queryable } from "./ports.ts";
import { requiredActor, type QueryContext } from "./query-context.ts";

/** Exact-address lookup or names already visible to this actor, never a private directory. */
export async function findPeople(db: Queryable, context: QueryContext) {
  const actor = requiredActor(context.actor);
  const { q } = z
    .object({ q: z.string().trim().max(254).default("") })
    .parse(context.query);
  if (q.length > 0 && q.length < 3) return { items: [] };
  const items = (
    await db.query(
      `SELECT u.id,u.name FROM users u WHERE u.id<>$1 AND NOT u.disabled
      AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.user_id=$1 AND b.blocked_id=u.id) OR (b.blocked_id=$1 AND b.user_id=u.id))
      AND (lower(u.email)=lower($2) OR (strpos(lower(u.name),lower($2))>0 AND (
        EXISTS(SELECT 1 FROM memberships mine JOIN memberships theirs ON theirs.circle_id=mine.circle_id JOIN circles c ON c.id=mine.circle_id
          WHERE mine.user_id=$1 AND theirs.user_id=u.id AND mine.status='accepted' AND theirs.status='accepted' AND c.status='active'
          AND (c.privacy='normal' OR c.host_id=$1 OR c.host_id=u.id))
        OR ($2<>'' AND EXISTS(SELECT 1 FROM listings l WHERE l.host_id=u.id AND l.status='published'))
      ))) ORDER BY u.name,u.id LIMIT 20`,
      [actor, q],
    )
  ).rows;
  return { items };
}
