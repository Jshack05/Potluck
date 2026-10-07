import test from "node:test";
import assert from "node:assert/strict";
import {
  restoredBillStep,
  savesPlanningBill,
  nextWeekday,
  billAttention,
  restoredBillConnection,
  adjacentBillStep,
} from "../src/features/potluck/bill-flow-model.ts";

test("restoring a four-page draft keeps it at the equivalent page without advancing to submission", () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((step) => restoredBillStep(step, undefined)),
    [0, 3, 4, 5],
  );
  assert.equal(restoredBillStep(99, undefined), 0);
  assert.equal(restoredBillStep(2, 2), 2);
  assert.equal(restoredBillStep(-2, 2), 0);
  assert.equal(restoredBillStep("5", 2), 0);
});

test("resuming an edited bill preserves explicit disconnection choices", () => {
  assert.equal(
    restoredBillConnection({ circleId: null }, "circleId", "old-circle"),
    null,
  );
  assert.equal(
    restoredBillConnection({ cardId: null }, "cardId", "old-card"),
    null,
  );
  assert.equal(restoredBillConnection({}, "cardId", "old-card"), "old-card");
  assert.equal(
    restoredBillConnection(
      { circleId: "new-circle" },
      "circleId",
      "old-circle",
    ),
    "new-circle",
  );
});

test("attention is based on the viewer's real terms and never invents payment failures", () => {
  const make = (
    id,
    participantId,
    status,
    amountMinor,
    maximumMinor,
    termsVersion = 1,
  ) => ({
    id,
    participantId,
    status,
    amountMinor,
    maximumMinor,
    termsVersion,
    terms: { kind: "flexible" },
  });
  const bill = {
    id: "bill",
    name: "Utilities",
    hostId: "host",
    status: "proposed",
    agreements: [
      make("old-decline", "person", "declined", 100, 100),
      make("offer", "person", "offered", 120, 120, 2),
      make("accepted", "me", "accepted", 100, 90, 2),
      make("other", "other", "accepted", 200, 100, 2),
    ],
  };
  assert.deepEqual(
    billAttention([bill], "me").map((issue) => [issue.agreementId, issue.kind]),
    [["accepted", "maximum"]],
  );
  assert.deepEqual(
    billAttention([bill], "person").map((issue) => issue.kind),
    ["review"],
  );
  assert.deepEqual(billAttention([bill], "host"), []);
  assert.deepEqual(billAttention([{ ...bill, status: "ended" }], "me"), []);
  assert.deepEqual(
    billAttention(
      [
        {
          ...bill,
          agreements: [make("decline", "person", "declined", 100, 100)],
        },
      ],
      "host",
    ).map((issue) => issue.kind),
    ["declined"],
  );
});

test("only self-only planning with no prior agreements may omit proposals", () => {
  assert.equal(savesPlanningBill(["host"], "host", 0), true);
  assert.equal(savesPlanningBill(["host", "person"], "host", 0), false);
  assert.equal(savesPlanningBill(["person"], "host", 0), false);
  assert.equal(savesPlanningBill([], "host", 0), false);
  assert.equal(savesPlanningBill(["host"], "host", 1), false);
  assert.equal(savesPlanningBill(["host", "host"], "host", 0), false);
});

test("private planning skips allocation in both directions but existing agreements retain review", () => {
  const personal = savesPlanningBill(["host"], "host", 0);
  assert.equal(adjacentBillStep(2, 1, personal), 4);
  assert.equal(adjacentBillStep(4, -1, personal), 2);
  assert.equal(adjacentBillStep(4, 1, personal), 5);
  assert.equal(adjacentBillStep(5, -1, personal), 4);
  for (const participants of [["host", "person"], ["person"]]) {
    assert.equal(
      adjacentBillStep(2, 1, savesPlanningBill(participants, "host", 0)),
      3,
    );
  }
  assert.equal(
    adjacentBillStep(2, 1, savesPlanningBill(["host"], "host", 1)),
    3,
  );
  assert.equal(adjacentBillStep(4, -1, false), 3);
});

test("weekday selection preserves calendar dates across month, year and daylight saving boundaries", () => {
  assert.equal(nextWeekday(0, "2026-10-31"), "2026-11-01");
  assert.equal(nextWeekday(0, "2026-11-01"), "2026-11-01");
  assert.equal(nextWeekday(1, "2026-12-31"), "2027-01-04");
  assert.equal(nextWeekday(0, "2026-03-07"), "2026-03-08");
});
