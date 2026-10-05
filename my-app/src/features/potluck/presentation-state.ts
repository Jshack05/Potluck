import type { Bill } from "./types";
export function defaultPersonalMaximum(agreement: {
  maximumMinor: number;
  currentAgreement?: { maximumMinor: number } | null;
}) {
  return Math.min(
    agreement.maximumMinor,
    agreement.currentAgreement?.maximumMinor ?? agreement.maximumMinor,
  );
}
export function visibleBills<T extends Pick<Bill, "isShared">>(
  bills: T[],
  scope: "shared" | "all",
): T[] {
  return bills.filter((bill) => scope === "all" || bill.isShared);
}
export function ownBillShare(
  bill: Pick<Bill, "agreements">,
  userId: string | undefined,
) {
  return (
    bill.agreements.find(
      (a) => a.participantId === userId && a.status === "accepted",
    ) ??
    bill.agreements.find(
      (a) => a.participantId === userId && a.status === "offered",
    )
  );
}
export function draftAfterSend(current: string, submitted: string): string {
  return current === submitted ? "" : current;
}
