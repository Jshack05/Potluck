import assert from "node:assert/strict";
import test from "node:test";
import {
  safeReturnTo,
  creationPath,
  entryDestination,
  parseEntryStatus,
} from "../src/services/navigation.ts";
test("every full-app destination requires sign-in then bank confirmation and retains its intent", () => {
  const destination = "/create/bill?circleId=invite-context";
  assert.equal(
    entryDestination("signed_out", destination),
    "/sign-in?returnTo=" + encodeURIComponent(destination),
  );
  assert.equal(
    entryDestination("bank_required", destination),
    "/connect-bank?returnTo=" + encodeURIComponent(destination),
  );
  assert.equal(
    entryDestination("error", destination),
    "/connect-bank?returnTo=" + encodeURIComponent(destination),
  );
  assert.equal(entryDestination("ready", destination), null);
  assert.equal(
    entryDestination("signed_out", "https://evil.test"),
    "/sign-in?returnTo=%2Fcircles",
  );
  assert.deepEqual(
    parseEntryStatus({ access: "ready", bankConnection: "confirmed" }),
    { access: "ready", bankConnection: "confirmed" },
  );
  assert.throws(() =>
    parseEntryStatus({ access: "ready", bankConnection: "unavailable" }),
  );
  assert.throws(() => parseEntryStatus({ access: "ready" }));
});
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
