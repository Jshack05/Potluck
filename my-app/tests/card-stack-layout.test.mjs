import test from "node:test";
import assert from "node:assert/strict";
import { cardStackLayout } from "../src/features/potluck/card-stack-layout.ts";

test("collapsed cards retain the Figma 58px stride at every card size", () => {
  for (const height of [176, 149, 120]) {
    const layout = cardStackLayout(4, height, -1);
    assert.deepEqual(layout.positions, [0, 58, 116, 174]);
    assert.equal(layout.height, 174 + height);
  }
});
test("expanded geometry matches all four Figma variants and contains every card", () => {
  const variants = [
    [14, 200, 258, 316],
    [0, 72, 258, 316],
    [0, 58, 130, 316],
    [0, 58, 116, 188],
  ];
  variants.forEach((positions, selected) => {
    const actual = cardStackLayout(4, 176, selected);
    assert.deepEqual(
      actual.positions,
      positions.map((y) => y - 20),
    );
    assert.equal(actual.height, actual.positions.at(-1) + 176);
  });
  for (const count of [0, 1, 2, 12, 50]) {
    const actual = cardStackLayout(count, 140, count - 1);
    assert.equal(actual.positions.length, count);
    assert.ok(actual.positions.every((y) => y + 140 <= actual.height));
  }
});
