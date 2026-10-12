# Cards Figma fidelity recovery action plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task after authorization. This turn is inspection and planning only.

**Goal:** Restore the existing approved Cards screens and interactions in the app, starting with creation and card detail, without designing replacements.

**Architecture:** Keep existing authenticated resources, drafts and commands. Replace mismatched presentation with reusable implementations of identified Figma components. Distinguish source-backed design, incomplete prototype wiring, and unavailable provider capabilities; none authorizes fabricated financial state.

**Tech stack:** Expo / React Native / TypeScript; existing Potluck API and tests.

**Spec:** User's October 8 phone screenshots and five Figma references; live file `1hAy3kcZAEvqq8ZNjKU7CD`; PRODUCT_CONTEXT.md, BILLS_CONTEXT.md, UI_FLOW.md, APP_FLOW_MAP.md and the September 14 role-specific flow record. Current implementation branch inspected: `codex/home-empty-state-polish`.

## Authority and scope

- Cards is the current scope. Figma-first rules apply throughout the app, at screen AND element level.
- Locate the current approved source, variant, actor and connection before implementation. A newer ID alone does not establish authority. Preserve distinctions between active sources, hidden alternatives and explicitly labeled historical references.
- Missing or ambiguous counterpart: stop that part, document what was searched and the unresolved match, and continue only independently verified work. Do not invent another page, generic row, icon or confirmation.
- Do not redesign Figma to fit the existing app. No Figma or app changes were made in this planning turn.
- Whole-file audit remains paused. This focused inspection does not complete every Cards variant or the wider audit.

Target users: hosts creating/organizing cards and independently authorized spenders using assigned cards. Promise: a consistent Cards flow that behaves as designed. Placement: Free/core; no monetization changes. Existing Circle invitations support acquisition; reliable ongoing card/bill coordination supports retention. Paid conversion remains deferred. Differentiation comes from connected arrangements and independent permissions rather than a new feature. Measure creation completion, backtracking and confirmed design mismatches.

## Confirmed source references and mismatches

All IDs below were checked against live Figma metadata or component/prototype inspection on October 8, in addition to the supplied screenshots. File URL prefix: `https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=`.

| Area           | Figma reference / reusable source                                                                   | Current mismatch                                                                                                                                                                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create card    | `854:3466`; app `my-app/src/app/create/card.tsx`                                                    | Shared preview uses setup messaging throughout, and surrounding spacing needs exact comparison before repair.                                                                                                                                                                                                                   |
| Appearance     | `928:4751`, options source `1081:5569`                                                              | Current Figma selector has six gradient/solid/panel choices. App adds Artwork choices; verify approved alternatives before changing selection availability.                                                                                                                                                                     |
| Attach Circle  | `854:3495`; Circle row source `1077:5751`; selection `895:3972`; plus `901:3984`; chevron `329:440` | App reuses a 68-point PlanningChoice for No Circle and a large generic Row for creation. Figma uses distinct 52-point No Circle and Create rows. Existing Circle rows remain 68 points with avatar/member information.                                                                                                          |
| Review         | `855:3408`, standalone `861:3572`; circle source `756:3028`, invitation row `793:3176`              | App uses generic rows, changes invitation presentation and always routes successful creation to detail. Figma Create CTA targets Cards collection `547:1625`.                                                                                                                                                                   |
| Card detail    | Apartment `573:2058`, card source `1592:19292`                                                      | Figma detail preview is 369.6 × 197.12 at x30 on a 430-wide screen; app preview maxes at 330 × 176. Header/title/menu hierarchy, action sizes and bill rows differ. App adds People and permissions and Create a Goal rows absent from the supplied detail frame. Trace intended destinations before relocating/removing links. |
| Detail actions | `583:2166`, `583:2170`, `583:2174`; shared surface `583:2106`                                       | Figma actions are 122 × 44 with eye `589:2161`, dollar `575:2078`, snowflake `575:2077`. App uses card/bank/pending icons and 48-point buttons.                                                                                                                                                                                 |
| Show details   | `583:2166`, hidden alternate card `1179:6386`                                                       | Figma toggles card presentation and Show/Hide details variables in place. App navigates to `/card/[id]/details`, a different layout. Secure credential delivery remains provider-owned.                                                                                                                                         |
| Settings       | Family `622:2591`, Apartment `622:2752`; Details `1077:5664`, Controls `1077:5680`                  | `/card/[id]/setup` replaces the existing grouped settings with Finish card setup, Activation and generic rows. Figma uses 330 × 176 preview, labeled detail rows/dividers and grouped controls.                                                                                                                                 |
| Add people     | Compact `488:1203`, expanded `488:1272`, source `467:839`                                           | Supplied sheet exists. Inspected add actions currently target Circle-selected state `542:1632`; do not assume this proves Cards invitation semantics. Inspect the caller and current role-specific invitation sources before reuse.                                                                                             |

Card image cropping is visible in the phone evidence: right and bottom parts of the preview show the fallback surface. `card-preview.tsx` places percentage-sized absolute images inside a padded container. That is a plausible native layout cause, not yet a measured root cause. Confirm actual iOS image/container bounds before deciding the precise repair.

Figma review/settings card size is 330 × 176; appearance thumbnails are 94 points tall. Use source-specific variants of one card component, rather than imposing the detail size on every context. Preserve existing saved design IDs and do not migrate or delete saved cards merely to reconcile selector options.

## Unresolved interactions and data states

1. The inspected Freeze action has no reaction; the app instead opens generic Spending controls. Search other current host variants/components for the approved freeze/unfreeze behavior. If none exists, record the missing interaction and stop that action implementation.
2. No Circle currently navigates directly to standalone review `861:3572`, while Continue navigates to attached review `855:3408`. Verify selected-state and return behavior across the current prototype before choosing a single behavior; do not silently normalize it.
3. Creating a Circle from the picker targets `335:506`. Verify its return-to-card behavior and retention of the card draft; the current app simply pushes `/create/circle`.
4. Confirm whether the current six-choice appearance component supersedes any approved Artwork selector. Existing aurora/graphite card artwork is not evidence that an extra selector section was approved.
5. Active Figma fixtures display balances, masked credentials, transaction rows and controls. Actual API state must supply these values. Locate approved unissued/unavailable/error variants; if absent, flag the design gap instead of designing another setup screen or displaying fictional balances.
6. Settings wording such as “Protects the Circle balance” must be reconciled with the product's separate Card/Circle ownership model. Preserve intended layout while flagging outdated semantics before implementation.
7. Keep host and spender sources distinct. September 14 role-specific updates supersede certain Grocery/Trip examples; frames labeled Reference before role update are not implementation targets.

## Ordered implementation batches

### 1. Finish a Cards-specific source and transition register

- [ ] Map collection, expanded cards, all four creation steps, both review branches, completion, detail, settings, appearance editing, people/invitations, balance, fund/review/pending, activity, credentials, controls and frozen/closed/error states.
- [ ] Read exact component sources, visible variants and prototype actions; record node IDs beside each app route/state. Include `/cards`, `/create/card`, `/card/[id]`, `/card/[id]/{setup,details,controls,people,invite,fund,balance,activity}`, `/card/access-info` and the Cards branch of `/manage/[kind]/[id]`.
- [ ] Inspect each relevant app route/supporting module and API contract, not just screenshots. Mark matched, mismatched, not implemented, not wired and unresolved separately.
- [ ] Resolve the above conflicts using current approved counterparts. Produce an explicit blocked-items list where evidence is insufficient; do not fill gaps by invention.

### 2. Repair shared card rendering and exact action assets

- [ ] Measure/reproduce native clipping using the saved screenshots and current iPhone build. Separate the background/clipping layer from content padding if measurement confirms the cause.
- [ ] Implement measured preview/detail/thumbnail variants in `my-app/src/features/potluck/card-preview.tsx`, preserving saved designs, aspect ratios, corner clipping and font scaling.
- [ ] Export/reuse the identified eye, dollar, snowflake, plus, chevron and selection assets. Check existing assets first. Do not substitute a generic semantic icon.
- [ ] Verify all source-backed looks in creation, selector, review, collection, detail and settings. Reject exposed fallback strips, cropped previews or a resized detail card leaking into other contexts.

### 3. Restore creation and Circle-selection flow

- [ ] Update `my-app/src/app/create/card.tsx` using verified source spacing, rows and appearance sections. Build only component variants grounded in the source register; avoid globally restyling PlanningChoice/Row and accidentally changing Bills or Goals.
- [ ] Restore compact No Circle and Create rows, real Circle identity/member information where permitted, and the exact selected/unselected indicators.
- [ ] Preserve name/design/selection on Back, appearance changes, Circle creation and resume. Verify draft locks and retry identity remain intact.
- [ ] Restore attached and standalone review presentations and confirmed completion destination. Invitation count/names must reflect actual prepared invitations, not Figma fixture people.
- [ ] Test draft recovery, failed submission and duplicate submission, plus Circle/no-Circle branches and nested creation return.

### 4. Restore card detail and settings

- [ ] Update `my-app/src/app/card/[id].tsx` and `card/[id]/setup.tsx`: source-backed header/menu placement, card size, action row, bill/transaction hierarchy and grouped Details/Controls.
- [ ] Remove or relocate unsupported entry points only after confirming their intended Figma destination and preserving required access. Do not implement Goal relocation as part of this task.
- [ ] Restore Show/Hide details in place only through an approved secure provider display; keep credentials out of ordinary app storage/logs. If the required unavailable design or provider contract is missing, mark this part blocked.
- [ ] Restore exact Freeze/Fund actions and settings-row destinations only where the register establishes the approved behavior. Do not make controls appear successful when the backend cannot execute them.
- [ ] Use real resource fields for name, Circle, status, creation date, limits and permitted credential metadata. No fabricated Active status, money, people, dates or card numbers.

### 5. Restore connected Cards subflows that have verified counterparts

- [ ] Reuse existing add-people sheet structure where the correct Cards caller/role semantics are verified. Inspect `circle-ui.tsx` for reusable presentation; do not reuse Circle membership actions as card authorization.
- [ ] Compare `/fund`, `/balance`, `/activity`, `/people`, `/invite`, `/controls` and `/details` individually with current corresponding frames and states. Repair verified mismatches in small batches; leave unmatched states explicitly blocked.
- [ ] Keep provider integration gaps separate from visual fidelity. Card funding, issuing, freezing and spending grants still need authorization, consent, idempotency and provider confirmation. This plan does not expand into a new issuing integration.

### 6. Visual, interaction and regression acceptance

- [ ] Compare each repaired state with its exact Figma frame at 430 × 932 and the physical phone's logical size. Test compact layout, keyboard, scrolling, large text and content overflow.
- [ ] Exercise creation from +, appearance choices, both Circle paths, nested creation/back, review, success destination, card detail, settings, permitted funding/details/freeze and people paths. Do not call an unimplemented provider operation working because its button navigates.
- [ ] Preserve shared fixed bottom navigation, existing header components where source-appropriate, bottom primary actions and blank-first loading. No generic new pages or decorative elements.
- [ ] Run existing creation-draft tests, card-related journey/authorization/invitation tests and meaningful new coverage for changed state transitions. Never weaken resource/role checks or consent rules to match fixture displays.
- [ ] Run `scripts/validate.mjs` with dependency audits available, plus changed-file formatting; report pre-existing audit findings separately from new failures. Native screenshots and direct phone checks are required before claiming the native clipping issue fixed.
- [ ] Review final app/Figma pairs, record any unresolved counterparts, and publish focused commits/PR with validation and rollback instructions. Do not merge automatically.

## Files and rollback boundaries

Primary presentation files: `card-preview.tsx`, `create/card.tsx`, `card/[id].tsx`, `card/[id]/setup.tsx`; source-backed assets under `my-app/assets/potluck`. Connected routes and `card-scene.tsx` change only when their exact matches are verified. Existing `creation-draft` and API logic should remain intact unless a demonstrated flow bug requires a separately tested repair.

Use a focused branch and preserve the current commit before implementation. No schema change, dependency or broad shared-component rewrite is expected. If one becomes necessary, document why and re-scope before proceeding. Rollback should revert the focused UI commits without deleting saved cards, draft data, invitations, financial history or the paused audit checkpoint.

## Status of this turn

October 8 execution follow-up: see [source register, implemented repairs, blocked counterparts and verification](../../ui-concepts/2026-10-08-cards-recovery.md). The execution record separates implemented geometry/transitions from provider gaps and outstanding visual acceptance. The planning snapshot below remains historical.

Planning only. Compared supplied native app images and Figma images; inspected current application source, existing tests and live Figma geometry, component sources and selected reactions. No runtime test suite or complete native click-through was run, and no claim of a completed all-Cards audit is made. The only repository addition is this action plan.
