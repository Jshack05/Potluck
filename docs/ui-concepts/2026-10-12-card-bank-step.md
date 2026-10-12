# October 12, 2026 — Entry keyboard and Card setup refinement

## Approved sequence and scope
Plan, then update Figma, then implement the app. Sign-in/Create-account footer actions must remain at their ordinary bottom position while fields stay reachable. Rename artwork display labels to Ocean and Sunset without changing saved IDs. Add Navy, Plum, Sage and Sand solid looks; preserve Graphite as the new-draft default. Category order: Finishes, Artwork, Gradients, Two tone, Solid colors (solids retained last because the requested four-category order omitted them).

After Circle selection, local beta Card creation presents a bank-account step with unconnected and connected states. Reuse Figma account rows 1108:5658 / 1109:5653, the screen header 1078:6039, primary action 793:3173, and existing Card appearance sources. Existing screens 854:3466, 854:3495, 855:3408 and 861:3572 define the route. No Code Connect files exist in this checkout; discover components and tokens directly from those sources.

## Findings and approach
- EntryShell wraps fields and footer in one KeyboardAvoidingView. Move only the field/content area into keyboard avoidance and leave the footer outside. Retain safe-area spacing, scroll access, field validation and account-switch behavior.
- Appearance labels and ordering come from one shared catalog; extend it after creating source components in Figma. Keep all prior design IDs and expand constraints through a forward migration.
- No Card-creation account-selection screen exists in the scoped current Figma source. The user explicitly requests this addition. Compose two states from existing account and navigation components; wire Circle → bank → review and reverse paths.
- Beta bank accounts must be explicit simulated records, separate from provider-confirmed onboarding and real funding sources. Permit creation/selection only in local server mode, enforce actor ownership, persist the chosen association atomically with Card setup, and retain idempotency/audit events. No balances, credentials, issuance, spending permissions, financial status or transfers may be fabricated. Production rejects beta mutations/fields. Existing pending Card submissions retain their original command and payload.
- Keep state orchestration in the route, reusable bank presentation in a focused component, and beta persistence in its own application module.

## Product and safety
Target: signed-in Hosts creating recognizable Card setups. Promise: choose a Card look and its intended account without losing progress. Free/core placement; invitations remain the acquisition mechanism, recognizable recurring arrangements the retention mechanism, paid conversion deferred. Compared with a passive tracker, this tests a connected setup flow; measure setup completion and account-step abandonment. Simulation labels must remain visible on the bank step and review. This narrowly supersedes earlier no-simulation wording for local beta account selection only, not real banking.

## Batches and verification
1. Preserve current branch checkpoint on GitHub; establish baseline; inventory source components and prototype state.
2. Figma: add four source looks/tokens, update category labels/order/expansion, compose empty/selected bank states, wire navigation and verify renders.
3. Regression tests first: entry footer separation/input access; catalog count/order/labels/contrast; account selection/back/draft/legacy retry; server local-only/unauthorized/cross-user/invalid/duplicate cases.
4. Implement shared entry fix, catalog/contract migration, isolated beta accounts and Card association, route state and review.
5. Run focused tests per batch and full repository validation. Inspect app at narrow widths; record physical-keyboard limits. Independent review, fix findings, commit/push and update PR where available; do not merge.

## Rollback
Backup branch: codex/backup-before-card-bank-step-2026-10-12 at 4066bca.
Restore presentation from backup if necessary; retain expanded appearance constraints and beta records, never remove existing user data or audit history. Disabling local beta endpoints must not affect real onboarding checks. Record exact Figma backup IDs and final validation here or in the execution record.

## Execution and source register

Figma changes preceded app implementation. Combined picker **854:3466** has the requested category order, renamed Ocean/Sunset artwork labels and six solid looks with inline expansion. New solid source components: Navy **2323:47176**, Plum **2323:47194**, Sage **2323:47212**, Sand **2323:47230**. They use palette variables and contrast-appropriate lettering. Backup frame **2325:46062** preserves the pre-change picker.

New bank states: **2326:45885** (connect), **2326:45900** (choose). Header/account rows/buttons reuse the source components above. Prototype variables retain connected status, selected account and Circle choice. Circle Continue and No Circle route through the bank step; Continue branches to **855:3408** (attached review) or **861:3572** (standalone review). Both reviews display the selected account and beta notice; their nested Back buttons return to selection. New frames and the expanded solid grid were visually rendered and inspected.

The app continues to use one appearance catalog and CardPreview across creation/review/detail/settings. Four added IDs take it to 33; existing IDs/defaults remain valid. `CardBankStep` is presentation-only and reuses CardSelection/heading/hint. The creation route owns draft and request state; step 4 is additive so saved steps 0–3 and pending submissions keep their meaning. A stale unsubmitted review returns to account selection; a pending submission replays its original payload. The beta disclosure remains visible even when account details cannot be reloaded during recovery.

EntryShell now puts only its scrollable input area inside KeyboardAvoidingView. Footer/account-switch actions remain outside it. Password Return dismisses the keyboard. Sign-in validation, permissions, authentication and bottom navigation are unchanged.

`/v1/beta/bank-accounts` and `/v1/beta/bank-accounts/connect` exist only as local-enabled application behavior. Connect yields three named synthetic fixtures scoped to the actor and rejects submitted account data. Production rejects beta commands and Card associations before replay. Card selection is persisted atomically with the Card, backed by an ownership foreign key and separate simulated audit events. No provider record, balance, bank confirmation, funding permission, credential or transfer is generated. Server capability discovery controls client exposure; it is not a client financial bypass.

## Migrations and recovery

Forward migration **0012** expands Card appearance constraints; **0013** adds the synthetic-account table and nullable Card association with an ownership foreign key. Existing Cards require no backfill. Keep both migrations/records during a UI rollback; removing the new looks/constraints would invalidate saved choices. Revert the presentation or disable the local beta capability/commands instead of deleting account or audit records. Production must continue rejecting beta mutations.

The stopped local database was copied to ignored `.local/backups/potluck-db-before-0012-0013-20261012` before restarting the API and applying migrations. Backup branch is already pushed. API remains bound to the previously authorized private LAN address on port 4100; Expo remains on 8083. No native dependency/configuration changed and no new mobile binary/OTA upload is required for this JavaScript update.

## Verification

Baseline functional validation passed before app edits. Tests first reproduced the moving-footer structure, missing new catalog choices, missing account step and interrupted-review disclosure. Focused tests cover all 33 choices through Circle/review/back/save, selected-account preservation, failed capability/account reads, production-disabled behavior, unauthorized/cross-user/invalid input, idempotency, database ownership/fixture constraints, transaction rollback and audit events. Solid foreground contrast is checked at 4.5:1 or better.

Browser checks at 390×844 and 320×640 exercised all six solid colors, empty bank state → connection → choosing Household checking → review → saved Sage Card, and returning creation with existing accounts (Continue disabled until selection). New drafts still start Graphite. The live API confirmed the saved Sage design/sample-account association while real onboarding remained `bank_required/unavailable`. Phone-width browser geometry has no horizontal overflow. Screenshots are in ignored `.local/oct12-solid-colors.png` and `.local/oct12-bank-selection.png`.

Independent review found one recovery-disclosure issue, fixed with a red-to-green regression. Physical-iPhone/Android keyboard, safe-area and large-text behavior remain unverified; browser/export checks do not replace those device checks. No live banking/provider testing is claimed.

Final full `node scripts/validate.mjs` with the existing local npm CLI passed **51 backend/domain tests, 86 mobile tests**, formatting, mobile lint, both strict type checks, and iOS/Android/web exports. Backend dependency audit found zero vulnerabilities. The full command exits unsuccessfully only for the unchanged mobile audit: **23 findings (3 moderate, 19 high, 1 critical)**. No dependencies/lockfiles changed; this is not a green release gate. An initial new-test lint error was corrected before the final run.

The narrow Create account browser check confirmed the focused password field remained above the footer with no horizontal overflow. Both QA tabs recorded zero console errors. Browser viewport overrides were reset and temporary tabs closed. This is web layout evidence only; no native keyboard was simulated. The local API/Expo servers remain available for a physical-device reload.
