# Card review, stack and shared-layout repair

## Approved scope and source evidence

This implements the five-part plan approved October 12: the personal review icon;
draggable Add people; animated Cards stack; editable, prominent banking and sharing
summaries; and the shared bottom cutoff. Nearby changes are limited to defects in
these interactions. No API, schema, provider, consent, authorization or money state
changes are included.

Target: hosts creating Circles and organizing Cards, including contributors viewing
their authorized Cards. Promise: review and adjust a Card confidently, and navigate
groups and Cards without clipped content or abrupt motion. This belongs in Free/core.
Circle invitations support acquisition; repeated organization supports retention.
Paid conversion is deferred. The differentiation remains a connected Card/Circle
workflow rather than a disconnected tracker. Measure creation completion, edit
completion and interaction failures; this repair adds no analytics or entitlements.

All IDs refer to Figma file `1hAy3kcZAEvqq8ZNjKU7CD`.

| Design                            | Source                                    | Implementation                                   |
| --------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| Review with/without Circle        | 855:3408 / 861:3572                       | create/card.tsx, card-creation-steps.tsx         |
| Leading-icon review row           | 2335:47450, derived from 793:3176         | CardReviewRow                                    |
| Bank / single-person icon         | 1107:5658 / 2019:38333                    | Existing bank-house.svg / circle-flow/person.svg |
| Bank review rows                  | 2335:47463 / 2335:47496                   | CardCreationReview bank summary                  |
| Just for you row                  | 2335:47482                                | CardReviewRow with person icon                   |
| Collapsed stack                   | 547:1625                                  | CardStack / cardStackLayout                      |
| Expanded stack variants           | 570:1755 / 563:1705 / 570:1824 / 570:1893 | CardStack / cardStackLayout                      |
| People compact/expanded/dismissed | 488:1203 / 488:1272 / 488:1396            | SheetSurface optional drag behavior              |

Figma composition reuses existing row surfaces, type styles and icon components.
The review frames retain their IDs; the content scrolls above the existing CTA.
Prototype summary links target existing creation, Circle and bank steps. Native
edit/cancel/return semantics are defined below rather than inferred from prototype
click-through alone. Historical review artwork still shows example balances;
runtime creation continues to use name, signed-in full name and role only.

## Implementation contract

1. Whole review sections open their original step. Editing retains a persisted
   snapshot; Continue returns directly to review; header Back cancels the edit.
   Pending or completed commands remain locked and retain their retry identity.
2. Stack tops are 58 logical pixels apart when collapsed, independent of card size.
   Expanded positions match each Figma variant, animated for 240 ms ease-out.
   Stack scroll extent includes every transformed card. Existing CardPreview owns
   artwork; roles and navigation retain their current server-authorized meanings.
3. People sheet follows a drag, settles to compact/expanded/dismissed, coordinates
   list scroll at its top edge, and clamps height above the keyboard and safe area.
   Figma's 380/700 heights are reference snap points, not fixed device assumptions.
   Reduced motion and accessible expand/collapse remain supported. Other sheets
   retain their existing behavior unless opting into dragging.
4. Floating home actions use the measured action height as end-of-content clearance.
   Their transparent container does not remove a full-width strip from the viewport.
   Genuine flow footers remain in normal layout. Bottom navigation remains stationary.

## Validation and rollback

Baseline: 86 mobile tests passed before edits. Final `node scripts/validate.mjs
--local` passed formatting, lint, both type checks, **51 backend/domain tests,
98 mobile tests**, and iOS/Android/web exports. Separate dependency audits found
zero backend vulnerabilities and the unchanged **23 mobile findings (3 moderate,
19 high, 1 critical)**. The complete release gate remains blocked by that existing
dependency debt; no dependency or lockfile was changed.

Coverage includes review edit/cancel and locked requests, stack geometry, measured
footer clearance, sheet gesture/lifecycle behavior, keyboard bounds, web without
the native Keyboard.metrics method, and selecting a person inside the shared
scroll body. Independent review found compact-sheet reopening and short-viewport
overflow defects; both were repaired. Live browser checks additionally caught a
web keyboard-method crash and competing handle press/drag actions, with regression
coverage added before final validation. Temporary diagnostic logging was removed.

Browser verification used an isolated local QA account and synthetic data:

- Review bank editing returned directly to review; cancelling a sharing edit kept
  the selections; Card creation saved the edited account (verified through the API).
- Nine Cards rendered at exactly 58-point collapsed spacing; expanded positions
  matched the source, and the final Card scrolled completely clear of the actions.
- People sheet dragged upward, dismissed downward, reopened, supported keyboard
  activation, and allowed selecting/removing a synthetic person in a 320-by-250
  viewport. No invitation was sent.
- At 390-by-844, Bills and Circles navigation items both measured y=750, height=60.
  Their empty states and floating controls were checked; long-list verification
  was performed on Cards. Shared measured clearance is covered at component level.

The reusable leading-icon component was also checked in Figma for sibling overlap
(none). Existing source IDs and refreshed composition are recorded above and in
`docs/flow-audit/2026-10-12-card-interactions-mapping.json`.

Backup: `codex/backup-before-card-interactions-2026-10-12` at `1e827bd` is pushed.
Revert this repair's commits to roll back code; no migrations or data backfill are
needed. Figma edits are separate: restore the two review frames through file history
and remove the leading-icon review variant if rolling back the design.

Physical iPhone gesture and keyboard verification must be distinguished from web
rendering, component tests and native exports. No automated test proves device feel.
Real phone safe areas, keyboard animation and larger accessibility text remain
manual acceptance checks. No native dependency changed and no mobile binary or OTA
release was uploaded. Development-server clients receive the updated JavaScript;
reload when testing to avoid retaining an old gesture handler through Fast Refresh.

The existing design-system/creation-menu import cycle was observed during browser
testing and deferred because changing module ownership is separate work. Historical
post-creation setup messaging and provider-unavailable states were preserved. The
whole-file Figma audit remains outside this repair.
