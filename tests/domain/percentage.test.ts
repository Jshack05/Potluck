import test from "node:test";
import assert from "node:assert/strict";
import {
  allocateRatio,
  proposalShares,
} from "../../services/potluck-api/src/domain/money.ts";
test("weighted allocation conserves every cent and breaks ties deterministically", () => {
  assert.deepEqual(allocateRatio(10001, { c: 3334, b: 3333, a: 3333 }), {
    a: 3333,
    b: 3333,
    c: 3335,
  });
  assert.deepEqual(allocateRatio(101, { b: 1, a: 1 }), { a: 51, b: 50 });
  assert.deepEqual(allocateRatio(12000, { a: 7000, b: 3000 }), {
    a: 8400,
    b: 3600,
  });
  assert.throws(() => allocateRatio(100, { a: -1, b: 101 }));
  assert.throws(() => allocateRatio(100, { a: 0 }));
});
test("equal Flexible shares retain equal weights regardless of estimate rounding", () => {
  for (const amountMinor of [1, 101]) {
    const proposal = proposalShares({
      amountMinor,
      participants: ["a", "b"],
      kind: "flexible",
      maximumMinor: 10000,
    });
    assert.deepEqual(proposal.caps, { a: 5000, b: 5000 });
    assert.equal(proposal.calculations.a.numerator, 1);
    assert.equal(proposal.calculations.b.numerator, 1);
    assert.equal(proposal.calculations.a.denominator, 2);
    assert.deepEqual(
      allocateRatio(
        10000,
        Object.fromEntries(
          Object.entries(proposal.calculations).map(([id, value]) => [
            id,
            value.numerator,
          ]),
        ),
      ),
      { a: 5000, b: 5000 },
    );
  }
});
