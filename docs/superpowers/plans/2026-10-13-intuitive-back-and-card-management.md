# Intuitive Back Navigation and Card Management Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task after Joseph approves implementation. Steps use checkbox (`- [ ]`) syntax for tracking. Do not merge automatically.

**Goal:** Bring the authored Manage arrangement and Trusted Spenders designs into the app, with predictable Back/Cancel behavior, saved Circle connections and safe Card closure.

**Architecture:** Keep Expo Router and existing routes. Centralize returning to a known parent separately from forward navigation; preserve local workflow steps. Extract Card management from the mixed Card/Bill/Circle renderer only as needed, reusing existing Card identity, rows, selectors, and server commands.

**Tech stack:** Expo Router, React Native, TypeScript, existing Node test harness, existing PostgreSQL-backed API.

**Spec:** Joseph's October 13 request, including the clarification that confusing Back behavior is a defect even without a permanent loop; repository `AGENTS.md`, `docs/PRODUCT_CONTEXT.md`, `docs/UI_FLOW.md`, `docs/APP_FLOW_MAP.md`, and `docs/flow-audit/README.md`. Read `docs/BILLS_CONTEXT.md` before touching shared Bill behavior.

**Status:** Executed October 13 on `codex/card-management-flow`, following Joseph's “Execute”. Source-backed management, saved Circle editing, eligible Card closure, shared identity/people presentation and Back repairs are implemented. See the [execution evidence](../../ui-concepts/2026-10-13-card-management-figma.md) and [exact source mapping](../../flow-audit/2026-10-13-card-management-mapping.json). Unsupported spender operations and Profile History remain deferred.

**Execution review:** One independent final review identified four navigation/draft edge cases and unsupported role inference; all received regression coverage and were corrected. 56 backend/domain and 138 mobile tests pass, as do lint, types and iOS/Android/web exports. The full gate fails only the unchanged mobile dependency audit (23 findings). Physical-device gesture/keyboard and large-text verification remains outstanding. Checkbox items below are the original work breakdown; the execution evidence distinguishes implemented work from deferred acceptance checks.

## What will change in the app

1. **Manage arrangement:** Replace the generic Card management menu with Figma `2412:46435`: actual Card identity, current Circle or Just for you, Trusted Spenders, and Close card. Enter through the existing Card settings route; use the shared Cards navigation.
2. **Change Circle:** Implement Figma `2412:46539` within the existing management route. Show the saved selection, the personal choice with its single-person icon, available Circle avatars/member counts, Cancel and Save connection. Cancel/Back restore the saved association; save persists through the existing versioned API and returns to the refreshed management menu.
3. **Trusted Spenders:** Reuse the same people/invitation implementation from settings and management, with the miniature Card context and rounded Figma rows. Align person selection, permission selection and review with the mapped Apartment/Family flow; use each real Card's data and artwork, not the example names or values. Existing-person details, pending/sent results, permission edits and pause/restore/remove presentations are part of the design target, subject to the verified backend boundary below. The 38 Figma states do not require 38 app routes.
4. **Close card:** Implement Figma `2412:46632` with Keep card and Close card. After confirmed server success, refresh Cards, remove the closed Card from active results and reuse the normal Cards list or existing empty state. Figma `2417:47063` is the last-card example, not a reason to always show an empty list. Failed or blocked closure remains on the confirmation with a recoverable error.
5. **Predictable returns:** Management Back goes to that Card's settings; its editor/confirmation Back goes to management. People Back goes to its valid entry point. Invite Cancel returns to People without leaving an abandoned invitation underneath it. Internal Back preserves draft choices; Cancel discards the abandoned subtask.
6. **Shared presentation:** Extract the existing miniature Card identity into one component, reuse rows/icons/selectors and the existing shell/navigation, retain approved green actions and measured spacing. Preserve blank-first loading, accessible inputs, stationary navigation and footer clearance on small screens.

**Explicitly excluded:** profile History; bank/provider integration; real money movement or issued-card closure; new premium features; unrelated Bills/Circle redesigns; fabricated people, invitations, balances or successful permission changes. History remains a recorded future requirement.

## Verified capability boundary

The current code was re-read for this plan. `services/potluck-api/src/application/core-queries.ts` returns `spenders: []` and a host role. `my-app/src/app/card/[id]/invite.tsx` explicitly disables submission as `Invitation unavailable`. There is no usable spender invitation, person-permission or pause/revoke contract in the inspected API modules. The earlier local-beta exception permits simulated bank-account selection only; it does not permit simulated spending access.

Therefore this pass can deliver the management menu, persisted Circle editing, supported Card closure, repaired navigation and source-backed spender presentation. It must not claim to deliver operational invitation sending, saved individual spender limits, or active/pause/revoke transitions. Build reusable renderers and validate their existing Figma states with test fixtures; expose production results/actions only when a verified server contract supports them. Keep unavailable actions honest and reuse an approved unavailable/empty state. If that state lacks a Figma counterpart, record the design gap and stop that portion instead of inventing copy or a replacement screen.

Completing those spender operations requires a separately specified backend work package: invitation delivery/acceptance, recipient and Host authorization, explicit access states, persisted permissions, idempotency/audit events, and provider reconciliation where applicable. Do not silently add schemas/endpoints or turn on financial capabilities inside this UI task. Saving existing per-purchase Merchant controls remains operational and unchanged; it is a different contract from a spender's monthly limit.

## Global constraints

- Check current Figma frames, components, variants, and connections before implementing UI. A missing counterpart is a design gap to record, not permission to invent an app screen.
- Prioritize predictable destinations, preservation of drafts, and existing authorization over cosmetic simplification.
- Do not turn every Back into `replace`, or every Figma destination into `push`.
- Preserve existing Card creation, review-edit, inline Circle creation, funding, controls, and invitation state transitions.
- No new dependencies, schema changes, provider integrations, financial capabilities, or subscription gates.
- Preserve host authorization, optimistic versions, idempotency, resource access, audit events, and retained history. Connecting a Circle neither grants spending access nor changes contribution terms.
- Keep bottom navigation shared and stationary with the keyboard. Preserve current blank loading treatment for fast loads and meaningful errors/retry behavior.
- Work in `C:\Users\Joseph\.codex\worktrees\potluck-full-integration\Potluck`; record the current branch/diff before implementation and preserve existing work. Investigation baseline: `1ee82a5fe169c5396f171b2edfca83859af4cf2f` on `codex/merchant-controls-and-card-stability`.

## Confirmed findings and evidence

| Finding                                                                          | Evidence                                                                                                                                                            | Consequence                                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invitation Back pushes a new People screen.                                      | `my-app/src/app/card/[id]/invite.tsx:45` and `:78` call `go`; `my-app/src/design/system.tsx:303` defines `go` as `router.push`.                                     | People Back then reveals the invitation again. Reproduced in the running browser.                                                                    |
| General Back follows history even when the preceding screen is the wrong parent. | Shell's duplicated header handlers around `system.tsx:432` and `:520` use `router.back()` whenever `canGoBack()` is true; `returnTo` is only a no-history fallback. | A route existing underneath does not mean it is a sensible destination.                                                                              |
| Explicit Back to card also adds history.                                         | `my-app/src/app/card/[id]/people.tsx:18`.                                                                                                                           | Completed/abandoned child screens can remain underneath Card detail.                                                                                 |
| Card management uses the generic shell without a Card parent or active tab.      | `my-app/src/app/manage/[type]/[id].tsx:76`.                                                                                                                         | Browser showed Circles selected while managing a Card; direct-entry fallback is not Card-specific.                                                   |
| Management Back ignores its local editing step.                                  | Same route: `intent` controls local screens, but no `onBack` is provided.                                                                                           | Header Back can leave management instead of returning from the connection editor to its menu.                                                        |
| Saved connection is not initially represented as selected.                       | `circleId` starts `undefined`; selection rendering compares it directly with `null`/Circle IDs.                                                                     | Browser confirmed a saved No Circle association had no selected indicator. Save silently falls back to the stored association.                       |
| Cancel does not reset the connection draft.                                      | `Keep as it is` only calls `setIntent(null)`.                                                                                                                       | A canceled choice can remain selected when reopening the editor. Source-confirmed; repeated selection with multiple Circles remains to be exercised. |
| Closing/end controls are not consistently restricted in the renderer.            | The destructive link in the mixed management route is not guarded by `owned` for Cards/Bills.                                                                       | Ineligible users may see an action the server rejects. Server authorization remains present.                                                         |
| Existing navigation tests do not simulate a real navigation sequence.            | `my-app/tests/card-navigation.test.mjs` uses a fixed `history` boolean and records calls; invitation is absent from the direct-entry route cases.                   | The test suite can pass without detecting this loop.                                                                                                 |

Actual reproduced route sequence:

```text
Trusted Spenders -> Invite trusted spender
Invite header Back -> newly pushed Trusted Spenders
Trusted Spenders header Back -> previous Invite trusted spender
```

Other concerns need targeted reproduction before changes: tab switches use `replace` on the current route, so older nested history may survive; initial creation-step Back has no direct-entry fallback; Bill management has a push-based no-history fallback. These are audit candidates, not claims that every route currently loops.

## Initial Figma investigation, before the authored handoff

File: [Potluck Core UI](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD). Current Screens page inspected: `1:123`.

- [Trusted Spenders, `1606:19916`](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-19916): header Back currently connects to Apartment Card detail `573:2058`; Invite connects to `1606:20151`.
- [Invite trusted spender, `1606:20151`](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-20151): header Back connects to People; other actions include People/Card destinations. Confirm each action's semantics separately rather than treating all as forward navigation.
- [Attach a Circle, `854:3495`](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=854-3495): current avatar/member-count/radio rows, compact personal choice, and Create a new Circle row.
- [Apartment Card settings, `622:2752`](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=622-2752) and Family settings `622:2591`; current shared Controls component `2393:48056`.
- No exact standalone Manage arrangement/change-connection/Card-closure confirmation counterpart was found in the current Screens page's frame and text search. This is scoped evidence, not proof that none exists anywhere in the file. Check nested/component states and the existing inventory before concluding a new composition is necessary.
- Closed Card access `1606:19688` is an outcome/access screen, not a closure confirmation. Bill ending screens have different business rules and must not be substituted for Card closure.

## Proposed destination contract

Forward navigation opens a child. Back unwinds the current step or returns to its defined parent. Cancel discards the current unsaved subtask. Successful completion removes finished child routes instead of adding another copy of the parent.

| Current position/action                                       | Proposed destination and state                                                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Invitation review -> Back                                     | Spending permissions; retain in-progress inputs.                                                                                  |
| Spending permissions -> Back                                  | Person picker; no invitation sent.                                                                                                |
| Invitation picker -> Back, or explicit Cancel from invitation | Trusted Spenders for the same Card; remove invitation routes.                                                                     |
| Trusted Spenders -> Back                                      | The valid Card entry point: management/settings when opened there, otherwise Card detail. Direct entry falls back to Card detail. |
| Explicit Back to card                                         | Same Card detail, without leaving the child as the next Back destination.                                                         |
| Card settings -> Back                                         | Same Card detail.                                                                                                                 |
| Manage arrangement menu -> Back                               | Same Card settings.                                                                                                               |
| Change connection or close confirmation -> Back/Cancel        | Management menu; reset unsaved connection selections and stale action errors.                                                     |
| Connection save succeeds                                      | Management menu showing refreshed saved connection. Next Back reaches settings.                                                   |
| Connection save fails/conflicts                               | Remain in editor with safe error/retry behavior; no false success and no navigation away.                                         |
| Card setup closes successfully                                | Cards list; completed editable management routes cannot reappear on Back.                                                         |
| Direct link/reload with no usable parent                      | Known same-resource parent, then section root; never a self-loop.                                                                 |
| Change primary tab                                            | Requested section root, with no abandoned child flow unexpectedly resurfacing on Back.                                            |

Returning People to its management/settings entry point is now authored in Figma with the Card-detail fallback preserved. Read-only reaction evaluation passed for all three origins. App stack behavior still requires implementation and native/browser verification; Figma destination correctness does not establish app correctness.

### October 13 prototype feedback: Trusted Spenders and closure wording

Add a **Trusted Spenders** entry to Manage arrangement, using the existing people icon, list, invitation, permissions, and review flow. This is a new entry point into the same reusable flow, not a second implementation. The preview should distinguish Circle association from spending permission: joining or attaching a Circle never grants Card access automatically.

Proposed journey: **Manage arrangement -> Trusted Spenders -> Invite trusted spender -> Spending permissions -> Review**. Existing spender rows reopen their existing permissions view. Invitation cancellation/completion returns to People; People Back returns to Manage arrangement when opened there. Entries from settings or Card detail retain their own valid parent. Extend the validated origin enum to `card | settings | manage` and preserve that origin through invitation substeps.

Extend image-generated previews with the management entry and current Figma-backed spender states before Figma/app implementation. Preserve existing host-only permissions and provider capability boundaries; a design preview does not activate the currently unavailable invitation submission.

The initial image's **Close card setup** label reflects the existing backend: only an unissued `setup_required` Card can transition to `closed`, active attached Bills block closure, the active Cards query excludes closed records, and history/audit records remain. It does not close a bank account. Joseph approved the user-facing label **Close card** on October 13. Use it consistently for the management action, confirmation heading, and final action; describe the outcome in plain language without exposing the internal setup state. This wording does not expand issued-card closure capabilities or delete retained records.

The next image-generated prototype covers tapping Close card, reviewing the confirmation, and returning to Cards after successful closure with a brief confirmation message. The closed Card is absent from the active list; if it was the last Card, reuse the existing No cards yet state and shared creation/navigation controls. Keep cancellation available before submission, and never show the success state until the server confirms closure.

Add regression coverage for Manage -> People -> Invite -> Cancel -> People -> Back -> Manage, including repeated cycles, existing-person permission edits, direct entry, and unauthorized users. The destination table's People row now includes management as a valid origin.

## Management presentation proposal

Use the existing Card identity treatment and grouped settings vocabulary. Show the actual Card and connection clearly, avoiding repeated oversized headings and the vague generic menu.

- Reuse the Card thumbnail/artwork and existing identity row where the inspected Figma component fits. Keep cardholder identity, artwork scaling, and typography consistent.
- Show the current Circle or personal association in one clear, tappable connection row, using existing avatar/person assets.
- Add the existing Trusted Spenders flow as a separate management entry with the shared people icon and accurate count/status; reuse the same screens and permissions as the settings entry.
- Reuse the approved Circle-choice visuals, initialized from the saved association. This edits an existing Card; it must not call the creation flow or lose the originating Card.
- Separate closure from ordinary edits. Reuse existing destructive-action components, with a clearly named confirmation and safe return path. Match current server capabilities: closing an unissued setup is not equivalent to closing an issued financial account.
- Give each local step a meaningful title, correct Cards tab, measured spacing, and clear primary action. Show loading/failure separately from an empty Circle list.
- Resolve missing management/closure compositions in Figma first, after approval of this plan. If a needed element still has no approved source, document the gap and stop that UI portion; the navigation repair can proceed independently.
- Keep Bill management and Circle administration semantically separate. Their shared navigation can receive proven fixes, but this task does not redesign their business workflows.

## Review focus

1. Repeated entry/cancel cycles, including rapidly repeated taps, must not accumulate duplicate routes or pop past the intended parent.
2. Deep links, reloads, and authentication resumption must preserve valid same-resource intent and reject arbitrary return destinations.
3. Header Back, browser Back, Android Back, and iOS gestures must agree where supported; internal edits must not be skipped accidentally.
4. Changed/deleted resources, revoked permissions, and stale versions must not strand the user or expose an editable stale Card.
5. Canceled edits must reset; failed saves must retain the user's recoverable input; successful saves must refresh authoritative state.

## Task 0: Reuse the Card context and verify the design boundary

**Files:** Create `my-app/src/features/potluck/card-context.tsx`; modify `merchant-controls-form.tsx` only to reuse that same context; reuse `card-thumbnail.tsx`, `card-ui.tsx` and the existing design primitives. Add `my-app/tests/card-context.test.mjs`; extend the existing `my-app/tests/merchant-controls-ui.test.mjs` for the extraction regression.

**Interface:** `CardContext({ card, fullName, roleLabel }: { card: Pick<Card, "name" | "design">; fullName: string; roleLabel: string })` is presentation-only. Callers supply the role from authoritative data; the component never grants permissions. The 88 px context row, 104 px miniature, bold name-only miniature and outer Card name/role reproduce existing Figma source `2351:47499` and its variants.

- [x] Confirm exact mapped nodes and prototype paths against live Figma before coding. Inspect the empty/unavailable people cases and flag any missing counterpart; do not invent one.
- [x] Add context tests asserting the actual Card artwork/name and full user name, a single role label outside the miniature, and no financial-status copy inside the miniature. Run them before extraction to establish the expected failure.
- [x] Extract the current merchant-controls identity markup into `CardContext` and reuse it without changing the editor's save behavior, amount semantics or data loading.
- [ ] Run `node --test tests/card-context.test.mjs tests/merchant-controls-ui.test.mjs tests/merchant-controls-model.test.mjs` from `my-app`. Compare short/long names and several artwork types to Figma; preserve the existing editor before adopting the component in management and people views.
- [x] Commit the coherent extraction and passing regression coverage after implementation is authorized.

## Task 1: Define and implement shared return behavior

**Files:** `my-app/src/services/route-return.ts` (new focused router adapter), `my-app/src/design/system.tsx`, `my-app/src/features/potluck/card-scene.tsx`, `my-app/tests/card-navigation.test.mjs`, `my-app/tests/navigation.test.mjs`.

**Interfaces:** Add `returnToRoute(destination: Href): void` as the sole adapter for unwinding to a known destination with a safe absent-parent fallback. Add an optional explicit `backTo?: Href` to Shell/CardScene; distinguish it from the existing `returnTo` authentication/fallback meaning. A supplied local `onBack` remains authoritative. Confirm the installed Expo Router's supported dismiss/unwind operation in source before choosing its implementation; avoid hand-built global history.

The installed Expo Router declarations expose `dismissTo` and `canDismiss`. Check their implementation and exercise both an existing target and an absent target before selecting the adapter behavior; the API's existence alone does not prove the desired stack result on every platform.

- [x] Extend the existing route test harness to maintain an actual stack and mount successive routes. Add the failing People -> Invite -> Back -> Back sequence; assert the second Back cannot reopen Invite.
- [x] Add absent-parent, same-target, duplicate-parent, local-step, and repeated-tap cases. Run the tests and record expected failures before implementation.
- [x] Implement the focused return adapter using the installed Router API; cover both a parent already present and an absent parent. Keep forward `go` behavior unchanged.
- [x] Consolidate the duplicated Shell header dispatch so both header variants honor the same local-step/explicit-parent/fallback rules.
- [x] Run affected tests and review native/browser removal behavior before adopting the adapter outside Cards. Commit only this coherent navigation primitive and tests.

## Task 2: Repair Card journeys and audit related Back actions

**Files:** `my-app/src/app/card/[id]/invite.tsx`, `people.tsx`, `setup.tsx`, `my-app/src/features/potluck/card-scene.tsx`; inspect `my-app/src/design/chrome.tsx`, `my-app/src/app/_layout.tsx`, `my-app/src/app/create/card.tsx`, `create/goal.tsx`, and `bill/[id]/manage.tsx`. Tests: `card-navigation.test.mjs`, existing creation/Bill tests, `navigation.test.mjs`.

**Interfaces:** Use Task 1's `returnToRoute`/`backTo`. Where origin matters, accept only the validated source enum `source=card|settings|manage`, then derive the destination from the current Card ID. Preserve it through invitation/permission navigation. Missing/invalid sources fall back to Card detail; no arbitrary caller-supplied parent URL.

- [x] Pin the destination table in history-aware tests, including invitation local steps, Cancel, Back to card, settings entry, direct entry, and auth resumption.
- [x] Apply the adapter to backward/completion actions; retain push for actual forward entry. Preserve person/permission draft state on internal Back, and clear it on cancellation.
- [x] Test OS/browser removal alongside the header. Use existing navigation lifecycle support for local steps; ensure one event results in one transition and does not discard an in-flight command silently.
- [ ] Reproduce tab history and creation/Bill fallback candidates. Fix only proven inconsistencies with the same policy; avoid replacing the entire navigator or changing unrelated feature navigation.
- [x] Run the complete mobile suite. Record any deferred route findings, then commit the focused journey repairs.

## Task 3: Resolve Figma management counterparts

**Files/artifacts:** Current Figma sources above; `docs/APP_FLOW_MAP.md`, relevant `docs/flow-audit` route/source inventory; this plan's source register.

- [x] Recheck inventory, nested states and current component variants. Existing and newly composed sources are recorded in the dated mapping.
- [x] Compose management, connection editor, closure confirmation and illustrative last-card outcome from reusable Figma sources and connect their destinations.
- [x] Update People/Settings/Management prototype return context, preserving Card-detail entry. Twenty-four read-only action-state checks passed; live presentation clicking remains outstanding.
- [ ] Inspect screenshots at the intended frame size, long names, empty and populated choices, and confirmation states. Verify no clipping, unnecessary generic icons, or duplicate navigation.
- [x] Record exact new/reused node links and intended route mapping. Do not implement an unreviewed visual substitute if a source remains unresolved.

## Task 4: Implement modular Card management against those sources

**Files:** Keep `my-app/src/app/manage/[type]/[id].tsx` as a compatibility entry; add `my-app/src/features/potluck/card-management.tsx` for Card-specific view/state. Reuse `card-ui.tsx` (`CardCircleChoice`, `CardReviewRow`, `CardSettingsGroup`, `CardSetting`) and existing thumbnail/artwork components. Tests: `my-app/tests/manage-rendering.test.mjs`; `tests/integration/arrangement-lifecycle.test.ts` as the existing server contract regression suite.

**Interfaces:** `CardManagement({ id }: { id: string })` owns the Card read, authorization-derived action availability, and explicit `menu | connection | close` state. It consumes Task 1's return adapter and existing `useCommand`. Keep existing `/cards/:id/connection` and `/cards/:id/close` payloads/contracts unchanged.

Reuse Task 0's `CardContext`. Use actual Card/Circle names and the single-person icon for a saved null association. Add the source-aware Trusted Spenders entry to the same `/card/[id]/people` route; do not duplicate the people workflow inside management. After a connection save, reload authoritative Card data before showing its new association. After closure, invalidate active Cards data and unwind completed management routes so Back cannot reopen an editable closed Card.

- [x] Add failing tests for saved Circle/null preselection, cancel/reopen draft reset, menu versus editor Back, correct active tab, and non-host/closed action visibility.
- [x] Add tests for save success/refreshed state, recoverable failure, version conflict, pending duplicate press, and closure blocked by active Bills. Preserve existing Card/Bill/Circle native text regression cases.
- [x] Extract only Card management; retain the existing route and distinct Bill/Circle behavior. Fetch only resources needed for the current Card step, with proper empty/error/loading treatment and selected-item visibility.
- [x] Initialize a fresh connection draft on entering edit; reset it on cancel. Preserve a failed-save draft, refresh versions deliberately on conflict, and never silently overwrite a newer saved association.
- [x] Render verified Figma compositions using shared components. Keep closure eligibility accurate and server-enforced. Preserve mutation keys/retry behavior, audit events, and version checks.
- [x] Run mobile tests and arrangement lifecycle integration tests; commit this presentation/state repair separately from navigation.

## Task 4a: Match the shared Trusted Spenders presentation

**Files:** Modify `my-app/src/app/card/[id]/people.tsx` and `invite.tsx`; create `my-app/src/features/potluck/card-people.tsx` for reusable people/invitation presentation; extend `card-ui.tsx` only for a row pattern actually shared by the mapped screens. Add `my-app/tests/card-people.test.mjs`; use Task 0's context and Task 1's return adapter. Do not introduce speculative API DTOs or a second copy of the invitation state machine.

**Interface:** Route files own resource reads and validated `source=card|settings|manage`. Presentation components receive real Card/person data and callbacks. The invitation route owns explicit `pick | permissions | review` steps, selected person, amount draft and validation errors. Authoritative sent/accepted/pending/active states are separate from these local editing steps; an edited draft cannot become an active permission.

- [x] Add tests proving management and settings enter the same people route with preserved Card/source; empty responses remain empty; no fixture person or example amount leaks into production rendering.
- [x] Add tests for picker → permissions → review → Back, including preserved amount/person, Cancel draft disposal and loss of Host access while open. Assert that a disabled/unavailable submission cannot produce an Invitation sent result or mutate permissions.
- [x] Implement the mapped Card identity, person rows, permission/review sections and existing action styling with reusable components. Remove the redundant Back to card footer where the verified header destination replaces it.
- [ ] Implement reachable existing-person and outcome views only for fields/states supported by the server contract; keep unsupported designs in fixture-based visual verification until the separately scoped backend work exists. Do not fill missing permissions with Figma's example $200/Utilities values.
- [ ] Run `node --test tests/card-people.test.mjs tests/card-navigation.test.mjs` from `my-app`; compare the mapped picker/review/permission states, long names, large text and keyboard behavior to Figma. Record missing empty/unavailable counterparts explicitly.
- [x] Commit this cohesive presentation work with its tests; document the remaining operational spender dependency accurately.

## Task 4b: Pin the existing lifecycle contracts before release

**Files:** Add `tests/integration/card-lifecycle.test.ts` using the existing integration harness. Read `services/potluck-api/src/application/lifecycle.ts`, `modules/lifecycle.ts`, `application/core-queries.ts` and `tests/integration/card-merchant-controls.test.ts`; do not change their contracts to make UI tests pass.

- [x] Test Host-only connection changes, accepted-Circle access, explicit null association, stale versions and rejected cross-user resource IDs. Verify no membership, invitation or contribution changes occur as a side effect.
- [x] Test eligible unissued Card closure, active-Bill rejection, unauthorized/unauthenticated attempts, stale/duplicate requests, active-list removal and retained Card/merchant-control/audit records. Use the existing mutation/idempotency harness; no real transactions.
- [x] Run `node --test --test-concurrency=1 tests/integration/card-lifecycle.test.ts tests/integration/arrangement-lifecycle.test.ts tests/integration/card-merchant-controls.test.ts` from the repository root. Any failed existing invariant is investigated and reported; do not weaken it or silently expand issued-card closure support.

## Task 5: Validation, documentation, and delivery

- [x] Establish the current baseline before code changes; distinguish existing dependency/build failures from new failures. Prior reported passing tests are not a fresh baseline or proof of native behavior.
- [x] Run targeted mobile tests from `my-app`: `node --test tests/card-navigation.test.mjs tests/navigation.test.mjs tests/manage-rendering.test.mjs`. Run lifecycle integration from root: `node --test --test-concurrency=1 tests/integration/arrangement-lifecycle.test.ts`.
- [x] Run changed-file formatting, mobile lint/types, all mobile tests, backend/domain tests, and all-platform exports through `npm run validate`. Use the documented npm CLI path if npm is not on PATH. `node scripts/validate.mjs --local` excludes dependency audits and is not a full release gate.
- [ ] Exercise actual navigation repeatedly: Card -> settings -> People -> Invite -> Cancel/Back -> People -> settings -> Card; direct-entry variants; local invitation steps; management edit/cancel/save; unsuccessful closure; tab changes. Confirm behavior with browser history, Android Back, and iPhone swipe/header where devices are available. Report missing device verification explicitly.
- [ ] Compare management renders against exact Figma nodes, including small screens, long names, larger text, empty/loaded/error states, and stationary bottom navigation. Inspect console logs after interactions.
- [x] Review the final diff for behavior changes to invitations, permissions, merchant controls, creation drafts, Bills, and Circle administration. Update `docs/UI_FLOW.md`, source mapping, and `docs/LOCAL_DEVELOPMENT.md` with verified behavior/results. Update Product context only if an approved durable rule changes.
- [ ] Commit/push focused work and update/open the appropriate draft PR with validation and rollback instructions. Do not merge. With no migration or API contract change planned, rollback is reverting these focused UI/navigation commits; it must not undo saved user connections or delete audit records.

## Safety, product purpose, and limits

Affected users are Card Hosts and people viewing their own permitted Card access. This improves navigation and organization; it does not activate invitations, issue credentials, or move money. The API owns saved associations and lifecycle state; providers remain authoritative for issued-card/financial state.

The core/Free promise is: **Adjust a Card confidently and return to where you expect without losing your work.** Acquisition uses the existing invitation journey; retention comes from reliable repeated management. There is no new monetization or paid gate. A generic tracker is not a substitute for correctly managing permissions and connections on the actual Card, but this repair claims no new competitive feature. Suggested metric: fewer repeated Back cycles and abandoned management/invitation sessions, with improved task completion; instrumentation expansion is not part of this fix.

Historical planning evidence included source review, the earlier browser reproduction, authored Figma compositions and 24 read-only prototype-state checks. Current implementation evidence is recorded in the linked execution report above. Those do not establish correct app history. This planning revision did not rerun app tests or change application code. Live presentation clicking, missing empty/unavailable variants and physical-device Back gestures remain acceptance work. Full implementation validation must include formatting, lint, type checks, unit/integration tests, dependency audits and platform exports, with any pre-existing failures reported separately. Keep commits focused, push the reviewed work to a focused branch, include rollback instructions and validation in the pull request, and do not merge automatically.
