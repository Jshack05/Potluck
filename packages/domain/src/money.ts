export function splitEqually(
  total: number,
  participants: string[],
): Record<string, number> {
  validTotal(total);
  if (
    !participants.length ||
    new Set(participants).size !== participants.length ||
    participants.some((p) => !p || p === "__proto__")
  )
    throw new Error("Invalid participants");
  const ids = [...participants].sort();
  const base = Math.floor(total / ids.length);
  const remainder = total % ids.length;
  return Object.fromEntries(
    ids.map((id, index) => [id, base + (index < remainder ? 1 : 0)]),
  );
}
export function validateAllocation(
  total: number,
  allocation: Record<string, number>,
): void {
  validTotal(total);
  const amounts = Object.values(allocation);
  if (
    !amounts.length ||
    amounts.some((value) => !Number.isSafeInteger(value) || value < 0) ||
    amounts.reduce((sum, value) => sum + BigInt(value), 0n) !== BigInt(total)
  )
    throw new Error("Allocation must equal bill total");
}
export function parseMoney(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) throw new Error("Enter a valid amount");
  const [whole, fraction = ""] = value.split(".");
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (result > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error("Amount too large");
  return Number(result);
}
function validTotal(total: number): void {
  if (!Number.isSafeInteger(total) || total <= 0)
    throw new Error("Invalid amount");
}

export function allocateRatio(
  total: number,
  weights: Record<string, number>,
): Record<string, number> {
  validTotal(total);
  const ids = Object.keys(weights).sort();
  if (
    !ids.length ||
    ids.some(
      (id) => !id || !Number.isSafeInteger(weights[id]) || weights[id] < 0,
    )
  )
    throw new Error("Invalid allocation weights");
  const denominator = Object.values(weights).reduce(
    (sum, value) => sum + BigInt(value),
    0n,
  );
  if (denominator <= 0n) throw new Error("Allocation weights must be positive");
  const result = Object.fromEntries(
    ids.map((id) => [
      id,
      Number((BigInt(total) * BigInt(weights[id])) / denominator),
    ]),
  );
  const priority = [...ids].sort((a, b) => {
    const x = (BigInt(total) * BigInt(weights[a])) % denominator,
      y = (BigInt(total) * BigInt(weights[b])) % denominator;
    return x === y ? (a < b ? -1 : 1) : x > y ? -1 : 1;
  });
  const remainder =
    total - Object.values(result).reduce((sum, value) => sum + value, 0);
  for (let i = 0; i < remainder; i++) result[priority[i]]++;
  return result;
}
export type ShareProposal = {
  amountMinor: number;
  participants: string[];
  kind: "fixed" | "flexible";
  maximumMinor: number | null;
  allocation?: Record<string, number>;
  percentages?: Record<string, number>;
  personalCaps?: Record<string, number>;
};
export function proposalShares(input: ShareProposal) {
  const ids = [...input.participants].sort();
  if (!ids.length || new Set(ids).size !== ids.length)
    throw new Error("Choose distinct people");
  const matches = (value: Record<string, number>) =>
    Object.keys(value).sort().join(",") === ids.join(",");
  if (input.percentages && input.allocation)
    throw new Error("Choose dollars or percentages");
  if (input.percentages) {
    if (!matches(input.percentages))
      throw new Error("Set a percentage for every person");
    validateAllocation(10000, input.percentages);
  }
  const allocation = input.percentages
    ? allocateRatio(input.amountMinor, input.percentages)
    : (input.allocation ?? splitEqually(input.amountMinor, ids));
  if (!matches(allocation)) throw new Error("Set a share for every person");
  validateAllocation(input.amountMinor, allocation);
  // An equal split remains equal at every occurrence. A rounded estimate is
  // an output, never the ratio used to calculate future shares.
  const weights =
    input.percentages ??
    input.allocation ??
    Object.fromEntries(ids.map((id) => [id, 1]));
  const denominator = input.percentages
    ? 10000
    : input.allocation
      ? input.amountMinor
      : ids.length;
  const defaults =
    input.kind === "flexible"
      ? allocateRatio(input.maximumMinor!, weights)
      : allocation;
  if (input.personalCaps && !matches(input.personalCaps))
    throw new Error("Set a maximum for every person");
  const caps = Object.fromEntries(
    ids.map((id) => [
      id,
      input.kind === "fixed"
        ? allocation[id]
        : (input.personalCaps?.[id] ?? Math.max(allocation[id], defaults[id])),
    ]),
  );
  if (
    ids.some(
      (id) =>
        !Number.isSafeInteger(caps[id]) ||
        caps[id] < allocation[id] ||
        caps[id] > 100000000,
    )
  )
    throw new Error("Each maximum must cover the proposed share");
  return {
    allocation,
    caps,
    calculations: Object.fromEntries(
      ids.map((id) => [
        id,
        {
          kind: input.kind === "flexible" ? "proportional" : "fixed",
          basis: input.percentages
            ? "percentages"
            : input.allocation
              ? "amounts"
              : "equal",
          numerator: weights[id],
          denominator,
        },
      ]),
    ),
  };
}
