export function datesInMonth(
  first: string,
  frequency: "once" | "weekly" | "monthly",
  month: string,
): string[] {
  const original = first.slice(0, 10),
    [year, m] = month.split("-").map(Number),
    anchor = new Date(original + "T12:00:00Z");
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    !Number.isFinite(anchor.getTime()) ||
    anchor.toISOString().slice(0, 10) !== original
  )
    throw new Error("Invalid calendar date");
  const start = new Date(Date.UTC(year, m - 1, 1, 12)),
    end = new Date(Date.UTC(year, m, 0, 12));
  if (frequency === "once") return original.startsWith(month) ? [original] : [];
  if (frequency === "monthly") {
    const due = new Date(
      Date.UTC(
        year,
        m - 1,
        Math.min(anchor.getUTCDate(), end.getUTCDate()),
        12,
      ),
    );
    return due < anchor ? [] : [due.toISOString().slice(0, 10)];
  }
  const week = 7 * 86400000,
    offset = Math.max(
      0,
      Math.ceil((start.getTime() - anchor.getTime()) / week),
    ),
    dates: string[] = [];
  for (
    let due = anchor.getTime() + offset * week;
    due <= end.getTime();
    due += week
  )
    dates.push(new Date(due).toISOString().slice(0, 10));
  return dates;
}
