# Cards flow fixes

Approved scope: implement the October 10 review's source-backed corrections. Reuse existing screens/elements; stop and record missing counterparts. Base: `c202144`, branch `codex/cards-figma-recovery`. The audit report is preserved in commit `9eba9cf` on the audit branch.

Target: Card hosts and permitted viewers. Promise: follow the designed Cards flow without losing context or encountering extra navigation. Free/core; no paid conversion changes. Existing invitations support acquisition and recurring arrangements support retention. A coherent shared arrangement distinguishes this from a standalone tracker. Metric: successful creation completion and confirmed navigation/design mismatches. No financial operations, provider contracts, authorization, consent, schema or stored design IDs change.

### Task 1: Restore shared Cards navigation and headers

- Write behavior regressions for transfer review Back retaining the amount, direct-entry return to the affected Card, source-specific navigation visibility, and safe footer placement without a navigation dock. Run them against the existing code; expected: the missing navigation contracts fail.
- Extend the existing `CardScene` and `Shell` with explicit options, preserving default behavior elsewhere. Funding review Back returns to its amount step. Remove the now-redundant Change amount action absent from source `1151:5263`.
- Hide navigation on source-backed funding, balance, activity and role flows. Keep it on Card detail/settings. Use the existing centered role-header treatment from `1606:19916`, `1606:20151`, `1606:20227`, `1606:21248` through one shared header option.
- Keep hidden-navigation footer actions above the device's bottom safe area. Preserve keyboard/navigation separation.
- Run affected and mobile tests. Expected: all pass. Commit one coherent navigation repair.

### Task 2: Extract reusable creation-step presentation

- Extend behavior coverage for all six existing appearance choices through Back/review, selected Circle/standalone review, and locked drafts. Run against current code to establish preserved behavior.
- Extract Card-specific appearance, Circle choice list and review components. Keep one draft/submission owner in the creation route; preserve numeric saved steps, command identity, errors and source copy. Do not add a generic wizard or new UI.
- Test the same user actions after extraction. Expected: behavior and source presentation preserved; all mobile tests pass. Commit separately.

### Task 3: Record boundaries, validate and review

- Stop C03 at the missing nested Circle completion/return design. Stop C04 at missing unavailable-state counterparts/provider contracts. Stop C05 at the unapproved combined frame/catalog/default reconciliation. Stop C06 at unmatched administrative/legacy counterparts. Preserve functioning existing entry points; do not invent substitutes.
- Keep source-backed Back to card controls. Do not copy Figma's inconsistent thumbnail scaling or fixture balances.
- Run the documented validation gate, changed-file formatting and dependency audits when the available runtime supports them. Report pre-existing failures separately.
- Obtain one independent final code review. Fix actionable defects, rerun affected checks and record native visual acceptance limitations. Keep commits focused; no automatic merge.

## Progress and rulings

- Baseline: 56 mobile tests pass on `c202144`; previous review also checked mobile types and scoped lint. Live source screenshots/reactions from the review remain available; funding review and role picker/review were refreshed at implementation start.
- Existing isolated worktree reused; no additional checkout or dependencies needed.
- Review notes were committed on the audit branch before switching; preserved recovery base was already committed and pushed.
- Missing source decisions stop only the affected work; independently verified corrections continue.
- Task 1: six navigation regressions failed on the baseline for the expected assertions and pass after the repair. All 62 mobile tests, mobile strict types and lint pass. Shared centered headers balance the existing Back control; footer safe-area padding also applies to existing hidden-navigation creation routes.
- Workflow tooling: Bash is unavailable on this Windows host. Progress and explicit task outcomes are recorded here; tests run through the installed Node runtime without changing dependencies.
