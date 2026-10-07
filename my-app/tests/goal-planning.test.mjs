import test from "node:test";
import assert from "node:assert/strict";
import { goalDurationEnd } from "../src/features/potluck/goal-model.ts";
test("Goal duration preserves calendar dates and clamps month ends", () => {
  assert.equal(goalDurationEnd("2028-01-31", "months", 1), "2028-02-29");
  assert.equal(goalDurationEnd("2026-01-31", "months", 1), "2026-02-28");
  assert.equal(goalDurationEnd("2026-12-28", "weeks", 2), "2027-01-11");
  assert.equal(goalDurationEnd("2026-12-28", "indefinite", 0), null);
  assert.throws(() => goalDurationEnd("2026-02-30", "months", 1));
  assert.throws(() => goalDurationEnd("2026-11-01", "months", 0));
});
