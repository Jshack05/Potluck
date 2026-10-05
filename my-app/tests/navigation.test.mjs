import assert from "node:assert/strict";
import test from "node:test";
import {
  safeReturnTo,
  creationPath,
  entryDestination,
  parseEntryStatus,
  canLoadResource,
} from "../src/services/navigation.ts";
test("financial deep links require bank confirmation and retain their intent", () => {
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
test("bank status checks and failures do not suppress signed-in social data or release financial data", () => {
  for (const path of [
    "/circles",
    "/circles/a",
    "/brands?q=Net",
    "/listings?category=subscriptions",
    "/conversations/a",
    "/notifications",
    "/invitations",
  ]) {
    for (const status of ["loading", "bank_required", "error", "ready"])
      assert.equal(canLoadResource(status, path), true, status + " " + path);
    assert.equal(canLoadResource("signed_out", path), false);
  }
  for (const path of [
    "/cards",
    "/bills",
    "/bill-summary?scope=all",
    "/agreements/a",
    "/circle-arrangements/a",
    "/future-financial-resource",
  ]) {
    for (const status of ["loading", "bank_required", "error", "signed_out"])
      assert.equal(canLoadResource(status, path), false, status + " " + path);
    assert.equal(canLoadResource("ready", path), true);
  }
});
test("signed-in social destinations and financial tab prompts remain accessible without a bank", () => {
  for (const access of ["bank_required", "error", "ready"]) {
    for (const path of [
      "/circles",
      "/circle/example",
      "/circle/example/invite",
      "/create/circle",
      "/invitation/example",
      "/circle-transfer/example",
      "/discover",
      "/listing/example",
      "/create/listing?brand=Netflix",
      "/inbox",
      "/conversation/example",
      "/you",
      "/cards",
      "/bills",
    ]) {
      assert.equal(entryDestination(access, path), null, access + " " + path);
      assert.equal(
        entryDestination("signed_out", path),
        "/sign-in?returnTo=" + encodeURIComponent(path),
      );
    }
  }
  for (const path of [
    "/card/example",
    "/bill/example",
    "/agreement/example",
    "/create/card?circleId=a",
    "/manage/cards/example",
    "/manage/bills/example",
  ]) {
    assert.equal(
      entryDestination("bank_required", path),
      "/connect-bank?returnTo=" + encodeURIComponent(path),
    );
  }
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
