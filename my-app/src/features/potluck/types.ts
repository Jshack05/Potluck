export type Item = {
  id: string;
  name: string;
  status: string;
  version: number;
  createdAt: string;
};
export type Person = { id: string; name: string; joinedAt?: string };
export type Circle = Item & {
  description: string;
  privacy: "normal" | "anonymous";
  hostId: string;
  role?: "host" | "member";
  people: Person[];
  bills: Bill[];
  cards: Card[];
};
export type Card = Item & {
  hostId: string;
  circleId: string | null;
  description: string;
  design: "teal" | "graphite" | "aurora";
  bills: Bill[];
  availableMinor: number | null;
};
export type Agreement = Item & {
  billId: string;
  billName?: string;
  hostName?: string;
  participantId: string;
  amountMinor: number;
  maximumMinor: number;
  termsVersion: number;
  fundingStatus: string;
  acceptedAt?: string;
  terms: {
    frequency: string;
    firstDueDate: string;
    kind: string;
    calculation?: { kind: string; numerator: number; denominator: number };
  };
};
export type Bill = Item & {
  connectionVersion: number;
  hostId: string;
  circleId: string | null;
  cardId?: string | null;
  amountMinor: number;
  maximumMinor: number | null;
  frequency: "once" | "weekly" | "monthly";
  kind: "fixed" | "flexible";
  firstDueDate: string;
  currency: string;
  role: "host" | "contributor";
  agreements: Agreement[];
};
export type Invitation = Item & {
  circleId: string;
  circleName: string;
  senderName: string;
  recipientId: string;
  expiresAt: string;
};
export type Listing = Item & {
  title: string;
  brand: string;
  serviceKind: "tv" | "music" | "software" | "other";
  category: "subscriptions" | "memberships" | "plans" | "housing";
  description: string;
  shareMinor: number;
  totalMinor: number | null;
  capacity: number;
  filled: number;
  location: string;
  moveIn: string | null;
  hostId: string;
  hostName: string;
};
export type ListingRequest = Item & {
  listingVersion: number;
  currentListingVersion: number;
  listingId: string;
  listingTitle: string;
  requesterName: string;
  requesterId: string;
  hostId: string;
  message: string;
};
export type Conversation = Item & {
  listingId: string;
  listingTitle: string;
  hostId: string;
  participantId: string;
  hostName: string;
  participantName: string;
  blocked: boolean;
  messages: Message[];
};
export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
};
export type Collection<T> = { items: T[]; nextOffset?: number | null };
