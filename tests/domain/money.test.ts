import { test } from "node:test";
import assert from "node:assert/strict";
import {
  splitEqually,
  validateAllocation,
  parseMoney,
} from "../../services/potluck-api/src/domain/money.ts";

test("equal shares allocate every cent deterministically without depending on input order", () => {
  assert.deepEqual(splitEqually(1000, ["c", "a", "b"]), {
    a: 334,
    b: 333,
    c: 333,
  });
  assert.deepEqual(splitEqually(1000, ["a", "b", "c"]), {
    a: 334,
    b: 333,
    c: 333,
  });
});
test("rejects duplicate participants and invalid monetary values", () => {
  for (const total of [0, -1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => splitEqually(total, ["a"]));
  assert.throws(() => splitEqually(100, []));
  assert.throws(() => splitEqually(100, ["a", "a"]));
});
test("custom allocation must exactly cover the bill without negative or fractional amounts", () => {
  assert.doesNotThrow(() =>
    validateAllocation(12000, { a: 6000, b: 4000, c: 2000 }),
  );
  assert.throws(() => validateAllocation(12000, { a: 11999 }));
  assert.throws(() => validateAllocation(100, { a: 101, b: -1 }));
  assert.throws(() => validateAllocation(100, { a: 99.5, b: 0.5 }));
});
test("money input parses decimal characters without binary floating-point multiplication", () => {
  assert.equal(parseMoney("10.10"), 1010);
  assert.equal(parseMoney("0.29"), 29);
  assert.equal(parseMoney("12"), 1200);
  for (const value of [
    "-1",
    "1.001",
    "1e3",
    "Infinity",
    "",
    "1,000",
    "900719925474099.99",
  ])
    assert.throws(() => parseMoney(value));
});
