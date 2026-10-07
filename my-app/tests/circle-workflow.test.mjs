import test from "node:test";
import assert from "node:assert/strict";
import {
  addCircleRecipient,
  removeCircleRecipient,
  circleInvitationState,
  canInviteToCircle,
  circleSummary,
  unresolvedCircleEmail,
} from "../src/features/potluck/circle-model.ts";

test("email entry waits for lookup and cannot duplicate its account result", () => {
  const email = "maya@example.com";
  assert.equal(unresolvedCircleEmail(email, email, 1, false), null);
  assert.equal(unresolvedCircleEmail(email, email, undefined, false), null);
  assert.equal(unresolvedCircleEmail(email, email, 0, true), null);
  assert.equal(unresolvedCircleEmail(email, "old@example.com", 0, false), null);
  assert.equal(
    unresolvedCircleEmail("MAYA@example.com ", email, 0, false),
    email,
  );
  assert.equal(unresolvedCircleEmail("Maya", "Maya", 0, false), null);
});

test("selected people deduplicate by stable identity and normalized email, preserving earlier selections", () => {
  const first = addCircleRecipient([], { id: "member", name: "Maya" });
  assert.deepEqual(
    addCircleRecipient(first, { id: "member", name: "New name" }),
    first,
  );
  const email = addCircleRecipient(first, {
    email: " Alex@Example.com ",
    name: "Alex",
  });
  assert.equal(email[1].email, "alex@example.com");
  assert.equal(
    addCircleRecipient(email, { email: "alex@example.com", name: "Alex" })
      .length,
    2,
  );
  assert.deepEqual(removeCircleRecipient(email, first[0]), [email[1]]);
});
test("Circle invitations distinguish host approval, recipient choice, expiry and terminal outcomes", () => {
  assert.equal(
    circleInvitationState(
      { status: "awaiting_host_approval", expiresAt: "2030-01-01" },
      Date.parse("2026-01-01"),
    ),
    "awaiting_host_approval",
  );
  assert.equal(
    circleInvitationState({ status: "pending", expiresAt: "2020-01-01" }),
    "expired",
  );
  assert.equal(
    circleInvitationState({ status: "accepted", expiresAt: "2020-01-01" }),
    "accepted",
  );
  assert.equal(
    canInviteToCircle({
      role: "member",
      privacy: "anonymous",
      membersCanInvite: true,
    }),
    false,
  );
  assert.equal(
    canInviteToCircle({
      role: "host",
      privacy: "anonymous",
      membersCanInvite: false,
    }),
    true,
  );
  assert.equal(
    canInviteToCircle({
      role: "member",
      privacy: "normal",
      membersCanInvite: true,
    }),
    true,
  );
});
test("Circle summaries omit zero financial counts and use server member totals", () => {
  assert.equal(
    circleSummary({ memberCount: 5 }, { cards: [], bills: [] }),
    "5 people",
  );
  assert.equal(
    circleSummary(
      { memberCount: 1 },
      { cards: [{ id: "a" }], bills: [{ id: "b" }, { id: "c" }] },
    ),
    "1 person · 1 card · 2 bills",
  );
});
