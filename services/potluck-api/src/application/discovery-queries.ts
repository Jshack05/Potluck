import { z } from "zod";
import { api, one, unblocked } from "../lib.ts";
import type { Queryable } from "./ports.ts";
import { requiredActor, type QueryContext } from "./query-context.ts";
import { conversation } from "./read-models.ts";
export async function getBrands(db: Queryable, context: QueryContext) {
  const q = z
    .object({
      q: z.string().trim().max(80).default(""),
      category: z
        .enum(["housing", "subscriptions", "plans", "memberships"])
        .optional(),
      serviceKind: z.enum(["tv", "music", "software", "other"]).optional(),
      maxMinor: z.coerce.number().int().min(0).max(100000000).optional(),
    })
    .parse(context.query);
  const params: unknown[] = ["%" + q.q + "%"],
    where = ["l.status='published'", "l.brand!=''", "l.brand ILIKE $1"];
  for (const [field, value] of [
    ["category", q.category],
    ["service_kind", q.serviceKind],
  ] as const)
    if (value) {
      params.push(value);
      where.push("l." + field + "=$" + params.length);
    }
  if (q.maxMinor !== undefined) {
    params.push(q.maxMinor);
    where.push("l.share_minor<=$" + params.length);
  }
  if (context.actor) {
    params.push(context.actor.id);
    const index = params.length;
    where.push(
      "NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.user_id=$" +
        index +
        " AND b.blocked_id=l.host_id) OR (b.blocked_id=$" +
        index +
        " AND b.user_id=l.host_id))",
    );
  }
  return {
    items: (
      await db.query(
        "SELECT l.brand AS name,MIN(l.service_kind) AS service_kind FROM listings l WHERE " +
          where.join(" AND ") +
          " GROUP BY l.brand ORDER BY l.brand LIMIT 100",
        params,
      )
    ).rows.map(api),
  };
}
export async function getListings(db: Queryable, context: QueryContext) {
  const query = z
    .object({
      q: z.string().trim().max(100).default(""),
      serviceKind: z.enum(["tv", "music", "software", "other"]).optional(),
      brand: z.string().max(60).optional(),
      category: z
        .enum(["housing", "subscriptions", "plans", "memberships"])
        .optional(),
      maxMinor: z.coerce.number().int().min(0).max(100000000).optional(),
      offset: z.coerce.number().int().min(0).max(100000).default(0),
    })
    .parse(context.query);
  const params: unknown[] = ["%" + query.q + "%"];
  const clauses = [
    "l.status='published'",
    "(l.title ILIKE $1 OR l.brand ILIKE $1 OR l.location ILIKE $1)",
  ];
  for (const [field, value] of [
    ["category", query.category],
    ["brand", query.brand],
    ["service_kind", query.serviceKind],
  ] as const)
    if (value) {
      params.push(value);
      clauses.push("l." + field + "=$" + params.length);
    }
  if (query.maxMinor !== undefined) {
    params.push(query.maxMinor);
    clauses.push("l.share_minor<=$" + params.length);
  }
  if (context.actor) {
    params.push(context.actor.id);
    clauses.push(
      "NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.user_id=$" +
        params.length +
        " AND b.blocked_id=l.host_id) OR (b.blocked_id=$" +
        params.length +
        " AND b.user_id=l.host_id))",
    );
  }
  params.push(query.offset);
  const rows = (
    await db.query(
      "SELECT l.*,u.name AS host_name FROM listings l JOIN users u ON u.id=l.host_id WHERE " +
        clauses.join(" AND ") +
        " ORDER BY l.created_at DESC,l.id LIMIT 40 OFFSET $" +
        params.length,
      params,
    )
  ).rows;
  return {
    items: rows.map(api),
    nextOffset: rows.length === 40 ? query.offset + 40 : null,
  };
}
export async function getMyListings(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT * FROM listings WHERE host_id=$1 ORDER BY created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
export async function getProfilesDetail(db: Queryable, context: QueryContext) {
  const person = await one(
    db,
    "SELECT id,name,created_at FROM users WHERE id=$1 AND NOT disabled",
    [context.resourceId],
  );
  if (context.actor) await unblocked(db, context.actor.id, person.id);
  const listings = (
    await db.query(
      "SELECT l.*,u.name AS host_name FROM listings l JOIN users u ON u.id=l.host_id WHERE l.host_id=$1 AND l.status='published' ORDER BY l.created_at DESC LIMIT 40",
      [person.id],
    )
  ).rows.map(api);
  return { ...api(person), listings };
}
export async function getListingsDetail(db: Queryable, context: QueryContext) {
  const listing = await one(
    db,
    "SELECT l.*,u.name AS host_name FROM listings l JOIN users u ON u.id=l.host_id WHERE l.id=$1 AND (l.status='published' OR l.host_id=$2)",
    [context.resourceId, context.actor?.id ?? null],
  );
  if (context.actor) await unblocked(db, context.actor.id, listing.host_id);
  return api(listing);
}
export async function getRequests(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT r.*,r.listing_snapshot->>'title' AS listing_title,l.version AS current_listing_version,l.host_id,u.name AS requester_name FROM requests r JOIN listings l ON l.id=r.listing_id JOIN users u ON u.id=r.requester_id WHERE l.host_id=$1 OR r.requester_id=$1 ORDER BY r.created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
export async function getConversations(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT c.*,l.title AS listing_title,h.name AS host_name,p.name AS participant_name FROM conversations c LEFT JOIN listings l ON l.id=c.listing_id JOIN users h ON h.id=c.host_id JOIN users p ON p.id=c.participant_id WHERE c.host_id=$1 OR c.participant_id=$1 ORDER BY c.created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
export async function getConversationsDetail(
  db: Queryable,
  context: QueryContext,
) {
  const user = requiredActor(context.actor),
    c = await conversation(db, context.resourceId, user);
  const messages = (
    await db.query(
      "SELECT * FROM (SELECT m.*,u.name AS sender_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id=$1 ORDER BY m.created_at DESC,m.id DESC LIMIT 100) recent ORDER BY created_at,id",
      [c.id],
    )
  ).rows.map(api);
  const blocked =
    (
      await db.query(
        "SELECT 1 FROM blocks WHERE (user_id=$1 AND blocked_id=$2) OR (user_id=$2 AND blocked_id=$1)",
        [c.host_id, c.participant_id],
      )
    ).rows.length > 0;
  return { ...api(c), messages, blocked };
}
export async function getSaved(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT l.*,u.name AS host_name FROM saved_listings s JOIN listings l ON l.id=s.listing_id JOIN users u ON u.id=l.host_id WHERE s.user_id=$1 AND l.status='published' AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.user_id=$1 AND b.blocked_id=l.host_id) OR (b.blocked_id=$1 AND b.user_id=l.host_id)) ORDER BY l.created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
export async function getNotifications(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT * FROM outbox WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
