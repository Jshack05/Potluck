import test from "node:test";
import assert from "node:assert/strict";
import { datesInMonth } from "../../services/potluck-api/src/domain/schedule.ts";
test("monthly schedules clamp to month end without shifting the original anchor", () => {
  assert.deepEqual(datesInMonth("2028-01-31", "monthly", "2028-02"), [
    "2028-02-29",
  ]);
  assert.deepEqual(datesInMonth("2028-01-31", "monthly", "2028-03"), [
    "2028-03-31",
  ]);
  assert.deepEqual(datesInMonth("2028-03-31", "monthly", "2028-02"), []);
});
test("weekly and once schedules belong to their own due dates", () => {
  assert.deepEqual(datesInMonth("2026-10-30", "weekly", "2026-11"), [
    "2026-11-06",
    "2026-11-13",
    "2026-11-20",
    "2026-11-27",
  ]);
  assert.deepEqual(datesInMonth("2026-10-30", "once", "2026-11"), []);
  assert.deepEqual(datesInMonth("2026-10-30", "once", "2026-10"), [
    "2026-10-30",
  ]);
});
