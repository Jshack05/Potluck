# Home empty-state polish — October 8, 2026

The full Figma audit is paused at its existing checkpoint. This is a separate app presentation repair on `codex/home-empty-state-polish`, based on the captured original designs; it does not expand or complete the audit. No Figma edits were made.

## Sources and bounded plan

| App route  | Existing Figma screen                                                            | Shared implementation                              |
| ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/circles` | [766:3056](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=766-3056) | `my-app/src/features/potluck/home-empty-state.tsx` |
| `/cards`   | [766:3012](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=766-3012) | Same component and original exported artwork       |
| `/bills`   | [766:3098](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=766-3098) | Same component, with existing Bills scope controls |

1. Align the illustration independently of paragraph height, filters and footer height.
2. Restore the original green creation hint for genuinely empty collections.
3. Outline the existing Import bills button in Potluck green; retain its dimensions and destination.
4. Compare all three routes at standard and compact sizes; check existing interactions and run validation.

Target: signed-in organizers starting their first Circle, Card setup or Bill. Promise: know where to start without the illustration jumping between tabs. This is Free/core activation polish; existing creation/invitation paths support acquisition and recurring coordination supports retention. Paid conversion is deferred. No new competitive feature or entitlement is introduced; first-arrangement creation completion is the relevant metric.

## Cause and implementation

The old component vertically centered the complete illustration-and-copy block. Different paragraph heights changed the illustration position. Bills also had a filter row, while Cards always rendered an empty list wrapper that introduced a parent gap. Their footer heights also differed.

The existing shared empty component now reserves a common leading-controls slot and uses a responsive, bounded top offset for the original 164 × 128 artwork. Bills supplies its existing scope tabs to that slot when empty. Cards only renders its list wrapper when it has cards. Longer copy grows downward; small screens can scroll without displacing fixed actions/navigation. The original creation hint is omitted for bank-error/bank-required states and for an empty Shared filter when personal bills already exist.

Import bills keeps its existing size, icon, press feedback and `/import-bills` destination, with a two-point `theme.teal` outline. No new flow, dependency, authentication rule, data mutation, provider state, financial calculation or consent behavior was added.

## Verification

- Baseline: 50 mobile tests passed before edits.
- Full `scripts/validate.mjs` gate: 47 backend/domain tests and 50 mobile tests passed; backend formatting, both strict type checks, mobile lint, and iOS/Android/web exports passed. Changed mobile files also passed Prettier.
- Backend dependency audit passed. The release gate still fails for the same pre-existing 23 mobile dependency advisories (3 moderate, 19 high, 1 critical), matching the preceding blank-loading validation. No dependency or lockfile was changed.
- Running app, real local test account: all three empty routes show their appropriate creation hint. At 430 × 932, the table SVG top is exactly y=384 on all three routes; at 320 × 600, it is y=272 on all three before scrolling. Compact content can scroll while actions and navigation stay available.
- Bills All bills/Shared selection, creation-menu opening, and Import bills → existing import/manual-entry screen were exercised. Outline color and retained 284 × 66 button dimensions were measured in the browser at the reference size.
- Local screenshot: `.local/empty-state-bills-final.jpg` (ignored). Comparison used the October 8 captured Figma text/structure and the retained original Bills render; live Figma reinspection remains quota-limited. Physical iPhone rendering has not been reverified.

The October 8 broad audit source mappings remain a historical snapshot of application commit `39b92f50`; this document records the subsequent narrow app delta without rewriting captured audit evidence.

## Rollback

Revert the home-empty-state polish commit. No migration, database rollback, native rebuild or provider configuration is needed. Preserve the paused audit branch and its checkpoint. A JavaScript reload loads this presentation change in the existing development build.
