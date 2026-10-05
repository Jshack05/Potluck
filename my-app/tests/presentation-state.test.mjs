import test from "node:test";
import assert from "node:assert/strict";
import {
  visibleBills,
  ownBillShare,
  draftAfterSend,
  defaultPersonalMaximum,
} from "../src/features/potluck/presentation-state.ts";
test("a revised proposal retains the contributor's lower cap as the review default", () => {
  assert.equal(
    defaultPersonalMaximum({
      maximumMinor: 10000,
      currentAgreement: { maximumMinor: 4000 },
    }),
    4000,
  );
  assert.equal(
    defaultPersonalMaximum({
      maximumMinor: 3000,
      currentAgreement: { maximumMinor: 4000 },
    }),
    3000,
  );
  assert.equal(defaultPersonalMaximum({ maximumMinor: 10000 }), 10000);
});
test("Shared filter uses the safe classification, and the displayed cadence belongs to the selected agreement", () => {
  const shared = {
    id: "bill",
    isShared: true,
    frequency: "weekly",
    agreements: [
      {
        participantId: "me",
        status: "offered",
        amountMinor: 1000,
        terms: { frequency: "weekly" },
      },
      {
        participantId: "me",
        status: "accepted",
        amountMinor: 5000,
        terms: { frequency: "monthly" },
      },
    ],
  };
  assert.deepEqual(
    visibleBills(
      [shared, { ...shared, id: "standalone", isShared: false }],
      "shared",
    ),
    [shared],
  );
  const share = ownBillShare(shared, "me");
  assert.equal(share.amountMinor, 5000);
  assert.equal(share.terms.frequency, "monthly");
});
test("completion of an older send never erases a newer draft, including retries", async () => {
  let draft = "First message",
    finish;
  const pending = new Promise((resolve) => {
    finish = resolve;
  }).then(() => {
    draft = draftAfterSend(draft, "First message");
  });
  draft = "Next message";
  finish();
  await pending;
  assert.equal(draft, "Next message");
  assert.equal(draftAfterSend("First message", "First message"), "");
  assert.equal(
    draftAfterSend("Next message", "Failed earlier message"),
    "Next message",
  );
});
