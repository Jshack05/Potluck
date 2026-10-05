# Full-app entry and shared-shell correction

The October 5 instruction changes the approved full-app entry to **sign in or create account → connect bank → enter Potluck**. It supersedes guest browsing for this full-app build. A future Splitfinder-only release needs a separate explicit decision. This is a correction to the existing implementation, not permission to redesign the remaining screens.

## Scope and source

- Use Figma `940:4770` for the authentication identity, type and fields; adapt its action placement to the founder's current bottom-action rule. Email/password is the currently implemented local authentication method; do not fabricate Apple/Google authentication.
- Use `1489:18043` / `1486:17690` for the bank handoff composition and source artwork, removing the unrelated Bill identity and unnecessary information containers for first use.
- Use the actual teal `1555:19208` Inbox component in core Potluck; retain Splitfinder's blue treatment only in its section.
- One shared onboarding layout with a fixed lower action area, scrollable content and no main navigation or Inbox before access is granted. Preserve deep-link intent. Remove the repeated inline guest cards/buttons across app screens.
- Enforce access on the API as well as navigation. No client flag, callback URL or local storage value can establish bank confirmation. Use an explicit provider-confirmation read boundary; its current adapter reports unavailable. Do not invent a connected bank or bypass entry to make the demo appear complete.

## Implementation and verification

1. Record the new product and design rules in context documents.
2. Add failing API tests for guest discovery, signed-in users without a confirmed connection, spoofed completion, provider errors, and approved confirmation. Existing domain-journey tests will use a clearly test-only confirmed-provider fixture as their new setup precondition, retaining their business assertions.
3. Add one server onboarding boundary and a safe status response, keeping financial capabilities disabled. No schema or provider mutation is needed in this change. An actual integration must persist and reconcile provider proof before this boundary can return complete.
4. Add central entry routing, sign-in and bank handoff layouts using the existing assets. Correct the Inbox source and remove the reusable generic guest content. Check the remaining primary-action call sites for misplaced flow actions.
5. Verify errors, retry, sign-out, preserved destinations, narrow widths and keyboard layout; run the documented full validation gate. Report browser evidence separately from the unresolved native build and bank-provider integration.

## Boundaries

Affected actors are all users entering full Potluck. A connected bank is an onboarding prerequisite, not debit consent, Card activation, Circle membership, or a contribution agreement. Current accounts remain local development identities. Existing records are retained. No migration, external upload or live financial operation is part of this correction. Rollback is a code revert; it does not delete data. Provider reconnection must never remove essential cancellation, dispute or funds access when financial features are later enabled.

Core/Free promise: enter one coherent Potluck experience with account setup completed once. Acquisition remains invitations and discovery after entry. There is no paid conversion mechanism or paywall here. Retention depends on reusable setup and preserved return destinations; this is distinct from an isolated expense tracker. Measure onboarding completion, failed bank handoffs and successful invitation resumption.

## Implementation checkpoint

Entry routing, source assets, lower action areas and API enforcement are implemented. Independent review's expired-session recovery finding was fixed and rechecked. Formatting, lint, types, 56 tests and three-platform JavaScript/assets export passed. Full validation fails only the pre-existing mobile dependency audit (22 findings). Responsive browser checks passed; native keyboard/device validation, signed phone build, remaining screen fidelity and actual provider linking are explicitly incomplete. No migration or financial operation was performed.
