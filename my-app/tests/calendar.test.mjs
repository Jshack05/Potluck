import { test } from "node:test";
import assert from "node:assert/strict";
import {
  monthCells,
  moneyInput,
} from "../src/features/potluck/calendar-model.ts";
test("calendar includes leap day and aligns the first day to its weekday", () => {
  const feb = monthCells(2028, 1);
  assert.equal(feb.filter(Boolean).length, 29);
  assert.equal(feb[2], "2028-02-01");
  assert.equal(feb.at(-1), "2028-02-29");
  assert.equal(monthCells(2027, 1).filter(Boolean).length, 28);
});
test("form money input preserves exact cents and rejects more than two decimal places", () => {
  assert.equal(moneyInput("0.29"), 29);
  assert.equal(moneyInput("40.10"), 4010);
  for (const value of ["1.001", "-1", "1e2", "", "1000000.01"])
    assert.throws(() => moneyInput(value));
});
