import test from "node:test";
import assert from "node:assert/strict";
import { retryKeys } from "../src/services/retry-keys.ts";
test("an uncertain retry keeps its key; a later intentional identical message gets a new key", () => {
  let n = 0;
  const keys = retryKeys(() => String(++n));
  const key = keys.for("hello");
  assert.equal(keys.for("hello"), key);
  assert.notEqual(keys.for("other"), key);
  assert.equal(keys.for("hello"), key);
  keys.complete("hello", key);
  assert.notEqual(keys.for("hello"), key);
});
