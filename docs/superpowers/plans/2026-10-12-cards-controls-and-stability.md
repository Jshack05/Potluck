# Cards controls and stability implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan after Joseph approves it. Check current repository instructions and source state before starting. Do not treat this planning document as implementation authorization.

**Status:** Awaiting approval. This document consolidates unfinished work; no application or Figma changes were made while preparing it.

**Goal:** Bring the approved Merchant controls screens into the app, make their editing and saving flow work, and complete the three pending Card/management/sheet repairs without regressing the existing Card creation flow.

**Architecture:** Keep financial rules and validated configuration outside presentation components. Use one Merchant controls editor with Maximum/Range modes and one industry picker. Share the existing Card artwork renderer between full Cards and name-only thumbnails. Keep stack selection controlled by the Cards route, and isolate native sheet transforms from JavaScript-driven layout.

**Tech stack:** Existing Expo Router/React Native/TypeScript application, Potluck API, shared contracts, PostgreSQL/PGlite migrations, and existing test harnesses. No new dependency is planned.

**Inspected checkpoint:** `codex/cards-figma-recovery` at `b5ed1c0`. Existing uncommitted Figma mapping, flow documentation and the pending repair plan must be preserved. This plan incorporates, rather than replaces or deletes, [the detailed repair diagnosis](2026-10-12-card-dismiss-and-native-text.md).

## Purpose and boundaries

- **Target user:** A Card Host configuring their own Card; existing users navigating Cards, Circles and arrangement management also benefit from the repairs.
- **Promise:** Clearly configure a Card's purchase limits and industries, and navigate its setup without broken selection, rendering or sheet interactions.
- **Plan placement:** Free/core experience. No subscription gates or upgrade prompts.
- **Acquisition:** Supports the existing Card/Circle invitation workflow; no new acquisition mechanism or invitation permission is introduced.
- **Conversion:** No new paid conversion claim. Paid controls and entitlements remain deferred.
- **Retention:** Reliable recurring Card management and understandable saved settings.
- **Alternative/differentiation:** Controls sit in the existing Card workflow instead of requiring a separate tracker. This task does not assert differentiation from live issuer enforcement that does not yet exist.
- **Primary quality measures:** Successful controls saves and management visits without rendering/animation errors. No new analytics collection is included.
- The Host may edit only their own eligible Card. Circle membership or contribution alone does not grant that permission. Preserve all existing authorization, consent, request identity and audit rules.
- Approval of this plan includes a narrow API/database addition for saved Merchant controls configuration. It does **not** include live issuing, money movement, simulated authorization approvals, or claiming these settings are enforced by an issuer.
- The existing beta bank-selection exception remains limited to that existing flow. It does not authorize invented provider capabilities or merchant-category mappings.
- No monthly Spending limit screen, Goals relocation, broad Figma audit, dependency overhaul or unrelated screen redesign is included.

## 1. Preserve the checkpoint and establish the baseline

- [ ] Re-read current `AGENTS.md`, relevant product/flow/architecture documents, affected source and tests. Verify the working tree and branch have not changed since planning.
- [ ] Inspect untracked/staged material for secrets, local databases, credentials, personal screenshots and sensitive data. Include only safe source/design records.
- [ ] Before implementation edits, create a clearly named backup commit and push a dated backup branch; work on a separate focused implementation branch. Preserve all existing user changes.
- [ ] Run the repository's local validation and security audits using the documented runtime. Record pre-existing failures independently from new failures. Previous successful checks are historical evidence, not this change's baseline.
- [ ] Inspect active API/Expo processes before starting replacements. Use synthetic accounts and arrangements for verification.

## 2. Confirm the current Figma source and state coverage

Canonical file: `1hAy3kcZAEvqq8ZNjKU7CD`.

| App surface | Current Figma source | Implementation |
| --- | --- | --- |
| Merchant controls, Maximum | `2353:45867` | One shared editor in Maximum mode |
| Merchant controls, Range | `2353:46316` | The same editor in Range mode |
| Choose industries | `2353:46051` | One picker with isolated temporary selection |
| Card settings entry points | `622:2591`, `622:2752` | Existing settings route for the actual Card |
| Cards collapsed/expanded stack | `547:1625`, `570:1755`, `563:1705`, `570:1824`, `570:1893` | Existing stack and motion, with completed dismissal |

- [ ] Refresh design context, screenshots, component properties and prototype reactions for the exact affected nodes before implementation. Frame identity was checked during planning; full motion playback is still an execution check.
- [ ] Follow the newest [Merchant controls mapping](../../flow-audit/2026-10-12-merchant-controls-mapping.json) and [design record](../../ui-concepts/2026-10-12-merchant-controls-figma.md), including the latest miniature typography refinement.
- [ ] Resolve first-use/unconfigured values, amount errors, zero selected industries, failed saves and saved-versus-provider-active presentation using existing approved patterns. Do not import example amounts as real defaults. If a required screen, element or state has no approved counterpart, record the specific gap and stop that affected part instead of inventing it.
- [ ] Do not add new Figma screens or rewrite the existing Figma flow as part of this implementation approval.

## 3. Complete the pending stability repairs

### 3A. Manage arrangement native text error

**Files:** `my-app/src/app/manage/[type]/[id].tsx`; new `my-app/tests/manage-rendering.test.mjs`.

- [ ] Add a failing regression that distinguishes native View containers from Text-backed components, with transparent fragments. Cover default menus for Cards/Bills/Circles in owner/non-owner contexts, plus loading, missing-resource and error states.
- [ ] Remove the two stray `{" "}` expressions between action rows. Preserve intentional spaces inside text components. Do not silence LogBox or alter the renderer.
- [ ] Assert existing action labels, destinations, confirmation behavior, permission decisions, command payloads and mutation identity remain unchanged.
- [ ] Run the focused render tests and existing arrangement-lifecycle/circle-administration integration tests. Retest the native screen without mutating real arrangements.

### 3B. Add people sheet animation failures

**Files:** `my-app/src/design/sheet.tsx`; `my-app/tests/sheet-interaction.test.mjs`, `sheet-geometry.test.mjs`; affected creation-flow tests.

- [ ] Reproduce the reported unsupported native `height`/`marginBottom` properties and mixed JS/native animation graph. Use a regression that detects driver-boundary violations, not a permissive mock alone.
- [ ] Separate native translation/drag transforms from JavaScript-driven height/bottom spacing using cohesive nested containers; keep public sheet props stable. Confirm the driver boundary on native runtime.
- [ ] Keep the backdrop stationary while the foreground sheet moves. Preserve drag tracking, compact/expanded/closed snapping, nested list scroll, keyboard clearance, safe areas, gesture cancellation, reduced motion and dismissal/reopen behavior.
- [ ] Check all consumers of the shared sheet, including non-draggable consumers. Preserve selection, invitations and form state.
- [ ] Run sheet/creation regressions and inspect fresh native logs. A browser-only pass cannot close this issue.

### 3C. Tap outside a selected Card to restore the stack

**Files:** `my-app/src/app/cards.tsx`, `my-app/src/features/potluck/card-stack.tsx`; existing Card recovery/layout tests. Change `my-app/src/design/system.tsx` only if an opt-in background interaction is required and reusable.

- [ ] Add failing tests for deselection from eligible blank space above/below the stack, side margins and expanded gaps.
- [ ] Clear the existing controlled selection through one callback. Reuse the original collapsed geometry and animation; preserve order and 58-point spacing. Avoid a touch-stealing overlay or resetting on every scroll/touch start.
- [ ] Preserve selecting another Card and opening the selected Card. Header actions, plus menu, bottom navigation and setup actions retain their own behavior.
- [ ] Cover zero/one/many Cards, first/middle/last selection, refresh removing the selected item, rapid taps, reduced motion, scrolling and accessible activation.
- [ ] Check content clearance with long lists and the shared shell on nearby screens, without adding fixed-height patches or moving navigation above the keyboard.

## 4. Implement reusable Merchant controls presentation

**Existing integration points:** `my-app/src/app/card/[id]/setup.tsx`, `my-app/src/features/potluck/card-preview.tsx`, existing appearance catalog, approved icon registry and shared design components.

**Proposed focused modules:** `card-artwork.tsx`, `card-thumbnail.tsx`, `merchant-controls-form.tsx`, `merchant-industry-picker.tsx`, and a draft state module under `my-app/src/features/potluck/`. Follow actual repository naming and avoid creating a file for every trivial wrapper.

- [ ] Reuse/extract Card artwork rendering so images, finishes, gradients, two-tone designs, sizing and foreground contrast have one implementation. Add behavior coverage before moving existing rendering responsibilities.
- [ ] Implement the approved **88-point Card context row** with a **104 x 55.47** thumbnail. Use the actual Card appearance, Card name and signed-in user's full name; do not hardcode the Apartment/Northern lights example.
- [ ] The miniature contains only the user's name: **Inter Bold, 10-point text, 12-point line height, 8-point inset**, matching current Figma. Card name and Host badge remain outside it. Verify first/last names, two-line names, all appearance contrasts and narrow screens; record any exceptional-name layout gap instead of silently inventing a new treatment.
- [ ] Use fully rounded Maximum/Range pills with the approved dark green selected state.
- [ ] Match white amount inputs, subtle 1-point outline, 9-point corners, 22-point values, labels above and USD-per-purchase text below.
- [ ] Omit the removed green summary strip in both modes. Retain the approved helper text, primary action and stationary shared navigation.
- [ ] Reuse the approved Figma industry icons and selectable rows. Supported display categories: Groceries; Utilities; Phone & internet; Dining; Fuel; Transportation; Travel & lodging; Shopping; Health & pharmacy; Entertainment.
- [ ] Make search filter the list while preserving selected industries outside the current search results. Keep counts and checkmarks synchronized. The list is product configuration, not a claim of a verified provider MCC mapping.

## 5. Add narrowly scoped, server-authorized configuration persistence

The existing app has no Merchant controls editor or saving API. A functional Save action therefore requires more than a route and local component state.

**Expected files:** Shared contract/domain definitions under `packages/`; `services/potluck-api/src/application/card-merchant-controls.ts`; matching API route module and registration; a new forward database migration; client service/types; integration tests. Verify exact module conventions and the next unused migration number before creating files.

- [ ] Define an explicit Maximum/Range configuration, currency, integer minor-unit amounts and allowed industry identifiers. Distinguish no saved configuration from an explicitly empty industry allowlist.
- [ ] Parse decimal input without binary floating-point monetary arithmetic. Validate required/positive maximum, nonnegative minimum, minimum not exceeding maximum, supported precision/currency, identifier allowlist and contract bounds on both client and server.
- [ ] Permit only the authenticated Card Host to read/edit controls as allowed by the product contract. Reject another user's resource, removed access and closed/ineligible Cards. Do not rely on hidden controls for authorization.
- [ ] Persist configuration through the existing transaction and idempotent mutation patterns. Handle concurrent edits/version conflicts without silently overwriting newer settings. Record safe audit metadata without sensitive financial data.
- [ ] Add database constraints and an additive migration; leave existing Cards unconfigured instead of backfilling fictional limits. Retain configuration/history on app rollback.
- [ ] Test successful save/reload, Card/account isolation, invalid values, zero selected industries, duplicate requests, stale updates, forbidden writes, rollback on failure and audit records. Zero selections must never be normalized into allow-all.
- [ ] Keep saved policy separate from provider-active enforcement. Do not create an authorization engine, invent supported decline codes, map provider categories by guesswork or trigger real transactions.

## 6. Wire and verify the complete editing flow

**Routes:** Proposed `my-app/src/app/card/[id]/merchant-controls.tsx` and an industry-picker route or existing approved navigation pattern beneath that Card. Confirm route organization before adding files. Keep `setup.tsx` as the entry point.

- [ ] Connect Card settings > Merchant controls to the selected Card's configuration. Check existing callers of the generic `controls.tsx` route before adjusting compatibility; do not accidentally replace unrelated provider-readiness or monthly-limit behavior.
- [ ] Use one editor for Maximum/Range and preserve the draft's values and industry selections when switching modes. Prevent drafts leaking between Cards or signed-in users.
- [ ] Opening Edit industries snapshots the selection. Picker Back cancels only picker edits; Use industries applies them to the parent draft without saving to the server.
- [ ] Main editor Back discards unsaved edits. Save validates, persists once, returns to the originating Card settings and refreshes its Merchant controls summary.
- [ ] Preserve entered data on failed requests, reuse request identity for safe retries, prevent duplicate submissions and handle revoked permissions/stale data safely.
- [ ] Use existing blank-first loading, error and authentication patterns. Test direct entry, reload, missing/closed Card, back navigation and interrupted network requests. Record missing approved UI states rather than inventing them.
- [ ] Keep bottom navigation stationary with the keyboard. Adjust only input content when needed, maintain scrolling and avoid placing footer actions over fields.

## 7. Regression checks for completed work

These are verification items, not requests to rebuild features already implemented:

- [ ] Combined Card naming/appearance selection, Graphite default, all 33 catalog options, category order, Ocean/Sunset naming and dark green See all/See less.
- [ ] Creation/review Card identity text and appearance continuity through Circle selection, beta bank selection, review and saved Card.
- [ ] Just for you person icon; prominent Bank account review row; Card/sharing/bank edit links; cancel restores the prior draft; Continue returns to review; mutation identity remains stable.
- [ ] Existing 58-point stack geometry, animation and full scroll extent. Long Card/Bill/Circle content remains reachable above floating actions/navigation.
- [ ] Sign in/Create account actions do not automatically rise over password/input fields. Shared bottom navigation, Inbox and You remain consistent.
- [ ] No unrequested Goals content, new auth/financial bypass, change to consent or provider state, new placeholder imagery, or navigation regression.

## 8. Validation, review and delivery

- [ ] Run focused failing-then-passing tests with each repair/refactor/feature batch. Do not weaken existing coverage or claim native correctness from HTML adapters.
- [ ] Run `node scripts/validate.mjs --local` from the repository root: formatting, lint, type checks, backend/domain/integration tests, mobile tests and iOS/Android/web exports. Run the documented full gate/security audits through the available npm runtime and report their actual results.
- [ ] Compare rendered editor/picker/thumbnail states with current Figma at the reference and narrower viewports. Inspect light/dark artwork, name wrapping, amount typing, industry search, keyboard, scroll clearance and accessibility labels.
- [ ] Retest the Add people driver errors, Manage rendering and Card dismissal on the affected native device when accessible. Explicitly identify any phone-only checks still outstanding; a dev-server reload is not a new native build upload.
- [ ] Review the final diff for accidental behavioral changes and scope. Check provider safeguards, authorization, monetary parsing, retry/concurrency handling and migration compatibility.
- [ ] Update the existing flow map, Merchant controls implementation status, validation record and necessary product/API documentation. Keep detailed implementation findings in repository files; do not add audit prose to Figma.
- [ ] Commit coherent batches, push the implementation branch and open/update the appropriate PR with validation evidence, pre-existing failures, migration impact and rollback instructions. Attach the PR to this chat and **do not merge automatically**.
- [ ] Rollback: revert application/API changes to the backup checkpoint while preserving the additive configuration table and audit history. Do not delete user settings or financial records. Document any compatibility checks required before rollback.

## Remaining uncertainties and deferred work

- Native gesture/driver behavior requires native verification; present component tests alone do not establish it.
- New-user/unconfigured, validation/conflict/error and saved-but-not-enforced presentation must use approved design patterns. Any missing design state is an explicit gap to resolve, not permission to fabricate a screen.
- Live issuer enforcement, exact provider MCC coverage and real authorization decisions are separate future integration work. Saving configuration cannot honestly be reported as enforcing purchases.
- The existing `system.tsx -> creation-menu.tsx -> system.tsx` require-cycle warning is separate from the diagnosed rendering/animation errors. Record it; perform a narrow boundary repair only if the approved touched-code work requires it, otherwise defer it explicitly.
- Existing dependency-audit findings must be refreshed and distinguished from new regressions. Broad dependency upgrades remain outside this plan.
- The full Potluck/Figma audit, unrelated screens and the monthly Spending limit flow remain outside this bounded implementation.

## Approval checkpoint

Joseph approves this consolidated scope before application changes begin, including server/database persistence of intended Merchant controls settings without live issuer enforcement. Implementation proceeds in the order above, stopping only the affected part when an essential design or product rule is missing.
