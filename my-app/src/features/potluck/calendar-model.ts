export function monthCells(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1, 12),
    count = new Date(year, month + 1, 0, 12).getDate();
  return [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from(
      { length: count },
      (_, index) =>
        year +
        "-" +
        String(month + 1).padStart(2, "0") +
        "-" +
        String(index + 1).padStart(2, "0"),
    ),
  ];
}
export function moneyInput(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim()))
    throw new Error("Enter an amount with up to two decimal places.");
  const [whole, fraction = ""] = value.trim().split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (minor > 100000000n) throw new Error("The amount is too large.");
  return Number(minor);
}
