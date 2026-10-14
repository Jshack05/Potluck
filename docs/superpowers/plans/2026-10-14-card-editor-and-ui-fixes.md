# Card editing and UI corrections

Approved by Joseph on October 14, 2026. Do not merge automatically.

## Scope and sources

Implement the existing Edit Card design (2448:47287) using the shared Card preview and 33-look picker. The pencil opens editing; the menu opens settings. Save changes only the existing Card's name/design; Cancel and Back discard local edits and return to that Card. Preserve Circle, bank selection, controls, history, and provider state.

Restore Circle creation (335:506, selected people 542:1632, Add people 488:1134) and overview (218:314, empty Bills 450:785, empty Cards 463:847). Reuse the existing off-switch treatment. Fix amount input clipping against Fund Card 1151:5189. Improve the pencil from an existing Figma icon and use the user's approved literal creation-menu descriptions. Missing Figma counterparts are documented, not invented.

## Product and safety

Target user: a Card Host maintaining a recognizable Card, and Circle creators. Promise: name, recognize, and organize your Card without rebuilding it. Core/Free placement; no paywalls or subscription changes. Acquisition/invitations: clearer Circle purpose supports understandable invitations; no new invitation mechanism. Retention: correct names/designs reduce repeated setup. Alternative: recreating a Card loses continuity. Measure successful edits and edit failures; conversion is not claimed for this basic workflow.

No money movement or issuer state changes. The application database owns product name/design. Require authenticated Host ownership, strict input validation, version conflict checks, idempotent transactions, and immutable before/after audit. Existing schema fields should suffice; inspect before deciding. All financial and consent gates remain intact.

## Tasks

1. Test then implement a focused Card appearance update API. Cover persistent save, permissions, closed Card, invalid inputs, stale version, retry deduplication, replay authorization, rollback, and unaffected associations/controls.
2. Test then implement the reusable editor using current Figma, existing picker/preview, durable commands, explicit returns, and Host gating. Test selection, Save, failure retention, Cancel, and distinct pencil/menu destinations.
3. Apply shared switch and amount-input fixes, literal creation copy, Circle source-backed layout/empty states, and the verified pencil asset. Preserve anonymous-Circle permissions and existing data/financial validation. Add meaningful behavior/layout regressions.
4. Run targeted checks, repository validation and rendered browser comparisons. Obtain one independent whole-change review, resolve findings, update node/route documentation, and commit reviewable changes without merging.

## Completion evidence

Record commands/results, Figma sources, rendered viewport checks, known native-device limitations, and any security-audit failures in the implementation record. No claim of affected-phone verification without testing that device. Rollback is a code revert; retain saved metadata and audit history.

Implemented tasks 1–3 and completed task 4 verification/review. The [execution record](../../ui-concepts/2026-10-14-card-editor-and-ui-fixes.md) documents 58 backend/domain and 143 mobile passing tests, passing exports, the existing mobile audit failure, and outstanding native-device acceptance. The independent review's native Back finding was fixed and regression-tested. No automatic merge.
