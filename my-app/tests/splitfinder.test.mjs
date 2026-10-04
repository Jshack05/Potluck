import assert from "node:assert/strict";
import test from "node:test";
import {
  listings,
  findListing,
  filterListings,
  toggleSaved,
  appendMessage,
} from "../src/features/splitfinder/model.ts";

test("search is trimmed, case insensitive, and scoped to category", () => {
  assert.equal(
    filterListings(listings, "housing", "  NORTH LOOP  ", null).length,
    1,
  );
  assert.equal(
    filterListings(listings, "memberships", "North Loop", null).length,
    0,
  );
  assert.equal(
    filterListings(listings, "housing", "zz-no-match", null).length,
    0,
  );
});
test("share limit includes the boundary and reset includes all homes", () => {
  assert.ok(
    filterListings(listings, "housing", "", 80000).every(
      (x) => x.shareMinor <= 80000,
    ),
  );
  assert.ok(
    filterListings(listings, "housing", "", 80000).some(
      (x) => x.shareMinor === 80000,
    ),
  );
  assert.equal(filterListings(listings, "housing", "", null).length, 3);
});
test("unknown routes never silently select a different listing", () => {
  assert.equal(findListing("missing"), undefined);
});
test("all opportunities and subscription subcategories preserve search and price limits", () => {
  assert.equal(
    filterListings(listings, "all", "", null).length,
    listings.length,
  );
  assert.equal(filterListings(listings, "subscriptions", "", null).length, 3);
  assert.equal(
    filterListings(listings, "subscriptions", "", 600, "Music")[0]?.title,
    "SoundClub",
  );
  assert.equal(
    filterListings(listings, "subscriptions", "CloudDesk", null, "Music")
      .length,
    0,
  );
  assert.equal(
    filterListings(listings, "plans", "", null)[0]?.title,
    "Connect Mobile",
  );
});
test("subscription savings use the full plan minus the share in integer cents", async () => {
  const { planSavings } = await import("../src/features/splitfinder/model.ts");
  assert.deepEqual(planSavings(findListing("screentime")), {
    monthly: 3000,
    annual: 36000,
  });
  assert.deepEqual(planSavings(findListing("soundclub")), {
    monthly: 1800,
    annual: 21600,
  });
  assert.equal(planSavings({ shareMinor: 1000 }), null);
  assert.equal(planSavings({ shareMinor: 1000, totalMinor: 500 }), null);
});
test("saving is reversible and ignores nonexistent listing IDs", () => {
  const saved = toggleSaved([], listings[0].id);
  assert.deepEqual(toggleSaved(saved, listings[0].id), []);
  assert.deepEqual(toggleSaved(saved, "missing"), saved);
});
test("blank and oversized messages are rejected, valid text stays in its listing thread", () => {
  assert.deepEqual(appendMessage({}, listings[0].id, "  "), {});
  assert.deepEqual(appendMessage({}, listings[0].id, "x".repeat(2001)), {});
  assert.deepEqual(appendMessage({}, "missing", "Hello"), {});
  const state = appendMessage(
    {},
    listings[0].id,
    "  Is this still available?  ",
  );
  assert.deepEqual(state[listings[0].id], ["Is this still available?"]);
  assert.equal(state[listings[1].id], undefined);
  assert.deepEqual(
    appendMessage(state, listings[0].id, "Thanks")[listings[0].id],
    ["Is this still available?", "Thanks"],
  );
});
