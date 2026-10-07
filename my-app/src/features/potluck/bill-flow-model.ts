export const billSteps = [
  "Create bill",
  "Bill details",
  "Attach a Circle",
  "Set contributions",
  "Attach a Card",
  "Review bill",
] as const;

export function restoredBillConnection(
  draft: Record<string, unknown> | null,
  key: "circleId" | "cardId",
  fallback: string | null,
) {
  const value = draft?.[key];
  return value === null || typeof value === "string" ? value : fallback;
}

/** Older drafts used four combined pages. Keep their entered values and map the page. */
export function restoredBillStep(step: unknown, flowVersion: unknown) {
  const value = typeof step === "number" && Number.isInteger(step) ? step : 0;
  return Math.max(
    0,
    Math.min(5, flowVersion === 2 ? value : ([0, 3, 4, 5][value] ?? 0)),
  );
}

export function savesPlanningBill(
  participants: readonly string[],
  actorId: string,
  priorAgreementCount: number,
) {
  return (
    priorAgreementCount === 0 &&
    participants.length === 1 &&
    participants[0] === actorId
  );
}

/** A personal plan has no contributor allocation to choose or consent to. */
export function adjacentBillStep(
  step: number,
  direction: 1 | -1,
  planningOnly: boolean,
) {
  const next = step + direction;
  return Math.max(
    0,
    Math.min(5, planningOnly && next === 3 ? next + direction : next),
  );
}

export function contributionCadence(frequency: string) {
  return frequency === "monthly"
    ? "month"
    : frequency === "weekly"
      ? "week"
      : "once";
}

/** Date selections are calendar dates, never UTC-converted local midnights. */
export function nextWeekday(day: number, from: string) {
  const date = new Date(from + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + ((day - date.getUTCDay() + 7) % 7));
  return date.toISOString().slice(0, 10);
}

export function billStatusLabel(status: string) {
  return status === "draft"
    ? "Saved bill"
    : status === "ended"
      ? "Ended · history retained"
      : "Review contribution terms";
}

type BillAttentionSource = {
  id: string;
  name: string;
  hostId: string;
  status: string;
  agreements: {
    id: string;
    participantId: string;
    status: string;
    amountMinor: number;
    maximumMinor: number;
    termsVersion: number;
    terms: { kind: string };
  }[];
};
/** Only persisted consent/cap states produce issues; provider failures are never inferred. */
export type BillAttentionItem = {
  billId: string;
  agreementId: string;
  name: string;
  kind: "review" | "maximum" | "declined";
};
export function billAttention(
  bills: BillAttentionSource[],
  actorId: string,
): BillAttentionItem[] {
  return bills.flatMap((bill) =>
    bill.status === "ended"
      ? []
      : bill.agreements.flatMap<BillAttentionItem>((agreement) => {
          if (
            agreement.participantId === actorId &&
            agreement.status === "offered"
          )
            return [
              {
                billId: bill.id,
                agreementId: agreement.id,
                name: bill.name,
                kind: "review" as const,
              },
            ];
          if (
            agreement.participantId === actorId &&
            agreement.status === "accepted" &&
            agreement.terms.kind === "flexible" &&
            agreement.amountMinor > agreement.maximumMinor
          )
            return [
              {
                billId: bill.id,
                agreementId: agreement.id,
                name: bill.name,
                kind: "maximum" as const,
              },
            ];
          if (
            bill.hostId === actorId &&
            agreement.participantId !== actorId &&
            agreement.status === "declined" &&
            agreement.termsVersion ===
              Math.max(...bill.agreements.map((item) => item.termsVersion))
          )
            return [
              {
                billId: bill.id,
                agreementId: agreement.id,
                name: bill.name,
                kind: "declined" as const,
              },
            ];
          return [];
        }),
  );
}
