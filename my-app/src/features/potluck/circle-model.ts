import type { Circle, Invitation } from "./types";

export type CircleRecipient = { id?: string; email?: string; name: string };
export type CircleDetail = Circle & {
  icon: "circles" | "home" | "heart" | "star";
  color: "lilac" | "mint" | "peach" | "blue";
  membersCanInvite: boolean;
  requireHostApproval: boolean;
  memberCount: number;
  pendingInvitationCount: number;
};
export type CircleInvitation = Invitation & {
  senderId: string;
  recipientName: string;
  hostId: string;
  privacy: "normal" | "anonymous";
};
export type CircleTransfer = {
  id: string;
  circleId: string;
  circleName: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  hostId: string;
  version: number;
  status: string;
  expiresAt: string;
};
export function recipientKey(person: CircleRecipient) {
  return person.id ?? person.email?.trim().toLowerCase() ?? "";
}
export function unresolvedCircleEmail(
  search: string,
  query: string,
  resultCount: number | undefined,
  loading: boolean,
) {
  const email = search.trim().toLowerCase();
  return !loading &&
    query.trim().toLowerCase() === email &&
    resultCount === 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}
export function addCircleRecipient(
  people: CircleRecipient[],
  person: CircleRecipient,
): CircleRecipient[] {
  const normalized = {
    ...person,
    ...(person.email ? { email: person.email.trim().toLowerCase() } : {}),
  };
  if (
    !recipientKey(normalized) ||
    people.length >= 20 ||
    people.some((p) => recipientKey(p) === recipientKey(normalized))
  )
    return people;
  return [...people, normalized];
}
export function removeCircleRecipient(
  people: CircleRecipient[],
  person: CircleRecipient,
) {
  return people.filter((p) => recipientKey(p) !== recipientKey(person));
}
export function circleInvitationState(
  invite: { status: string; expiresAt: string },
  now = Date.now(),
) {
  return ["pending", "awaiting_host_approval"].includes(invite.status) &&
    new Date(invite.expiresAt).getTime() <= now
    ? "expired"
    : invite.status;
}
export function canInviteToCircle(circle: {
  role?: string;
  privacy: string;
  membersCanInvite?: boolean;
}) {
  return (
    circle.role === "host" ||
    (circle.privacy === "normal" && circle.membersCanInvite === true)
  );
}
export function circleSummary(
  circle: { memberCount?: number; people?: unknown[] },
  arrangements?: { cards: unknown[]; bills: unknown[] },
) {
  const count = circle.memberCount ?? circle.people?.length ?? 1;
  return [
    count + (count === 1 ? " person" : " people"),
    arrangements?.cards.length
      ? arrangements.cards.length +
        (arrangements.cards.length === 1 ? " card" : " cards")
      : "",
    arrangements?.bills.length
      ? arrangements.bills.length +
        (arrangements.bills.length === 1 ? " bill" : " bills")
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
