import assert from "node:assert/strict";
import test from "node:test";
import { safeReturnTo } from "../src/services/navigation.ts";
test("sign-in restores only an internal approved app destination", () => {
  assert.equal(
    safeReturnTo("/circle/6b612d57-eaef-4b96-b02b-d89ef3be50f3"),
    "/circle/6b612d57-eaef-4b96-b02b-d89ef3be50f3",
  );
  assert.equal(
    safeReturnTo("/create/bill?circleId=test"),
    "/create/bill?circleId=test",
  );
  for (const value of [
    "https://evil.test",
    "//evil.test",
    "/sign-in",
    "/unknown",
    "/\\evil.test",
    null,
    ["/bills"],
  ])
    assert.equal(safeReturnTo(value), "/circles");
});
