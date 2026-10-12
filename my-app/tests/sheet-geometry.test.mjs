import test from "node:test";
import assert from "node:assert/strict";
import { sheetGeometry, sheetRelease } from "../src/design/sheet-geometry.ts";
test("people snap points match Figma and remain inside small keyboard viewports", () => {
  assert.deepEqual(sheetGeometry(932, 20, 32, 0), {
    bottom: 32,
    compact: 380,
    expanded: 700,
  });
  for (const [viewport, keyboard] of [
    [640, 0],
    [640, 330],
    [844, 350],
    [420, 260],
  ]) {
    const g = sheetGeometry(viewport, 47, 34, keyboard);
    assert.ok(g.compact > 0 && g.compact <= g.expanded);
    assert.ok(g.expanded + g.bottom + 47 <= viewport);
  }
});
test("a drag settles to the nearest state, velocity can expand, and a short compact drag stays open", () => {
  assert.equal(sheetRelease(320, 0, 380, 700), "compact");
  assert.equal(sheetRelease(640, 0, 380, 700), "expanded");
  assert.equal(sheetRelease(420, -0.8, 380, 700), "expanded");
  assert.equal(sheetRelease(200, 0.8, 380, 700), "closed");
});
