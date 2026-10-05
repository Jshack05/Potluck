import assert from "node:assert/strict";
import test from "node:test";
import { safeReturnTo, creationPath } from "../src/services/navigation.ts";
test("creation context survives contextual registration with encoded values", () => {
  const destination = creationPath("/create/listing", {
    brand: "A & B",
    category: "subscriptions",
    id: undefined,
  });
  assert.equal(
    safeReturnTo(destination),
    "/create/listing?brand=A+%26+B&category=subscriptions",
  );
  assert.equal(
    new URL(
      creationPath("/create/bill", { circleId: "circle-a", cardId: "card-b" }),
      "https://potluck.invalid",
    ).searchParams.get("cardId"),
    "card-b",
  );
});
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
