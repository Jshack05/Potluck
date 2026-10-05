import { api, member, one } from "../lib.ts";
import type { Queryable } from "./ports.ts";
import { requiredActor, type QueryContext } from "./query-context.ts";
import { billView, ownedCard } from "./read-models.ts";
export async function getCircles(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT c.* FROM circles c JOIN memberships m ON m.circle_id=c.id WHERE m.user_id=$1 AND m.status='accepted' AND c.status='active' ORDER BY c.created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
export async function getCirclesDetail(db: Queryable, context: QueryContext) {
  const user = requiredActor(context.actor),
    circle = await member(db, context.resourceId, user),
    hidden = circle.privacy === "anonymous" && circle.host_id !== user;
  const people = (
    await db.query(
      "SELECT u.id,u.name,m.joined_at FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.circle_id=$1 AND m.status='accepted'" +
        (hidden ? " AND m.user_id=$2" : "") +
        " ORDER BY m.joined_at",
      hidden ? [circle.id, user] : [circle.id],
    )
  ).rows.map(api);
  return {
    ...api(circle),
    people,
    // Keep the response shape for older clients; financial projections are
    // available only through the separately bank-gated arrangements endpoint.
    cards: [],
    bills: [],
    role: circle.host_id === user ? "host" : "member",
  };
}
export async function getCircleArrangements(
  db: Queryable,
  context: QueryContext,
) {
  const user = requiredActor(context.actor),
    circle = await member(db, context.resourceId, user);
  const cards = (
    await db.query(
      "SELECT id,name,status,design FROM cards WHERE circle_id=$1 AND host_id=$2",
      [circle.id, user],
    )
  ).rows.map(api);
  const bills = (
    await db.query(
      "SELECT b.id,b.name,b.amount_minor,b.status FROM bills b WHERE b.circle_id=$1 AND (b.host_id=$2 OR EXISTS(SELECT 1 FROM agreements a WHERE a.bill_id=b.id AND a.participant_id=$2))",
      [circle.id, user],
    )
  ).rows.map(api);
  return { cards, bills };
}
export async function getInvitations(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT i.*,c.name AS circle_name,u.name AS sender_name FROM invitations i JOIN circles c ON c.id=i.circle_id JOIN users u ON u.id=i.sender_id WHERE i.recipient_id=$1 AND i.status='pending' AND i.expires_at>now() ORDER BY i.created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
export async function getCards(db: Queryable, context: QueryContext) {
  return {
    items: (
      await db.query(
        "SELECT * FROM cards WHERE host_id=$1 AND status!='closed' ORDER BY created_at DESC LIMIT 100",
        [requiredActor(context.actor)],
      )
    ).rows.map(api),
  };
}
export async function getCardsDetail(db: Queryable, context: QueryContext) {
  const user = requiredActor(context.actor),
    card = await ownedCard(db, context.resourceId, user);
  const bills = (
    await db.query(
      "SELECT id,name,amount_minor,status FROM bills WHERE card_id=$1 AND host_id=$2",
      [card.id, user],
    )
  ).rows.map(api);
  return {
    ...api(card),
    bills,
    availableMinor: null,
    pendingMinor: null,
    reservedMinor: null,
    spenders: [],
    role: "host",
  };
}
export async function getBills(db: Queryable, context: QueryContext) {
  const user = requiredActor(context.actor),
    rows = (
      await db.query(
        "SELECT b.* FROM bills b WHERE b.host_id=$1 OR EXISTS(SELECT 1 FROM agreements a WHERE a.bill_id=b.id AND a.participant_id=$1) ORDER BY b.created_at DESC LIMIT 100",
        [user],
      )
    ).rows;
  return {
    items: await Promise.all(rows.map((row) => billView(db, row.id, user))),
  };
}
export async function getBillsDetail(db: Queryable, context: QueryContext) {
  return billView(db, context.resourceId, requiredActor(context.actor));
}
export async function getAgreementsDetail(
  db: Queryable,
  context: QueryContext,
) {
  const user = requiredActor(context.actor);
  const agreement = api(
    await one(
      db,
      "SELECT a.*,b.name AS bill_name,u.name AS host_name FROM agreements a JOIN bills b ON b.id=a.bill_id JOIN users u ON u.id=b.host_id WHERE a.id=$1 AND a.participant_id=$2",
      [context.resourceId, user],
    ),
  );
  const current = (
    await db.query(
      "SELECT * FROM agreements WHERE bill_id=$1 AND participant_id=$2 AND status='accepted' AND id!=$3 ORDER BY terms_version DESC LIMIT 1",
      [agreement.billId, user, agreement.id],
    )
  ).rows[0];
  return { ...agreement, currentAgreement: current ? api(current) : null };
}
