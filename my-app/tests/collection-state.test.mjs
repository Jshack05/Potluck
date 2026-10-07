import test from "node:test";
import assert from "node:assert/strict";
import * as presentation from "../src/features/potluck/presentation-state.ts";

test("an unresolved collection never becomes an empty state, including between request keys", () => {
  assert.equal(typeof presentation.collectionPhase, "function");
  assert.equal(presentation.collectionPhase(null, ""), "loading");
  assert.equal(presentation.collectionPhase(null, "Offline"), "error");
});

test("only a successful collection can be empty; a refresh failure retains the last result", () => {
  assert.equal(typeof presentation.collectionPhase, "function");
  assert.equal(presentation.collectionPhase([], ""), "empty");
  assert.equal(presentation.collectionPhase([], "Offline"), "empty");
  assert.equal(
    presentation.collectionPhase([{ id: "bill" }], "Offline"),
    "ready",
  );
});

test("Shared can be empty while All bills contains the personal bill", () => {
  assert.equal(typeof presentation.collectionPhase, "function");
  const items = [{ id: "personal", isShared: false }];
  assert.equal(
    presentation.collectionPhase(
      presentation.visibleBills(items, "shared"),
      "",
    ),
    "empty",
  );
  assert.equal(
    presentation.collectionPhase(presentation.visibleBills(items, "all"), ""),
    "ready",
  );
});
