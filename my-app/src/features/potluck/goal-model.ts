export function goalDurationEnd(
  start: string,
  unit: "months" | "weeks" | "indefinite",
  count: number,
): string | null {
  const first = new Date(start + "T12:00:00Z");
  if (
    !Number.isFinite(first.getTime()) ||
    first.toISOString().slice(0, 10) !== start
  )
    throw new Error("Choose a valid start date.");
  if (unit === "indefinite") return null;
  if (!Number.isInteger(count) || count < 1 || count > 120)
    throw new Error("Choose a duration from 1 to 120.");
  if (unit === "weeks") first.setUTCDate(first.getUTCDate() + count * 7);
  else {
    const day = first.getUTCDate();
    first.setUTCDate(1);
    first.setUTCMonth(first.getUTCMonth() + count);
    const last = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
    ).getUTCDate();
    first.setUTCDate(Math.min(day, last));
  }
  return first.toISOString().slice(0, 10);
}
export type Goal = {
  id: string;
  name: string;
  hostId: string;
  status: "draft";
  version: number;
  createdAt: string;
  kind: "target" | "time_based";
  targetMinor: number | null;
  endDate: string | null;
  frequency: "monthly" | "weekly";
  firstContributionDate: string;
  currency: "USD";
  circleId: string | null;
  circleName?: string | null;
  cardId: string | null;
  cardName?: string | null;
  lockFundsRequested: boolean;
  showContributions: boolean;
  fundedMinor: null;
  fundingStatus: "not_authorized";
  invitationStatus: "not_sent";
  plannedContributions: {
    personId: string;
    name: string;
    amountMinor: number;
  }[];
};
