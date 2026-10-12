# Card dismissal and native text error implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task after Joseph authorizes implementation. Steps use checkbox syntax for tracking.

**Status:** Diagnosis and planning only. No app or Figma implementation changed.

**Goal:** Restore the original Cards stack when the user taps outside a selection, remove the native rendering error on Manage arrangement, and repair the reported Add people animation errors.

**Architecture:** Keep selection in the Cards route and reuse CardStack's existing layout and animation. Repair invalid JSX children at their source in the shared Manage route. Separate native transforms from JavaScript-driven sheet layout at the animation/view boundary; do not hide errors or change the native renderer.

**Tech stack:** Expo Router, React Native, TypeScript, existing Animated API and Node component-test harness. No new dependencies.

**Spec:** Joseph's October 12 requests in this chat (outside-card dismissal and the native error screenshot), plus [the existing interaction contract](../../ui-concepts/2026-10-12-card-interactions.md). Snapshot inspected: `codex/cards-figma-recovery` at `b5ed1c0`.

## Constraints and product purpose

- This is a Free/core usability repair for people organizing their Cards, Bills and Circles. Promise: navigate and manage existing arrangements without unexpected errors or stuck selections.
- Preserve card order, appearance, navigation, 58-point collapsed spacing, 240 ms ease-out animation, reduced-motion behavior, scrolling and measured content clearance.
- Reuse approved Figma screens and components. Before implementing dismissal, refresh the recorded stack references (`547:1625`, `570:1755`, `563:1705`, `570:1824`, `570:1893`) and their reactions. Record missing or conflicting evidence instead of inventing UI. These IDs are prior evidence, not a fresh live Figma check in this investigation.
- Preserve authentication, server authorization, consent, existing mutation payloads, request identity, confirmations and resource history. No database migration, financial action or provider integration is involved.
- Acquisition/invitations, pricing and conversion are unchanged; paid features remain deferred. Reliable recurring organization supports retention. This improves the existing connected Card/Circle workflow, not a new competitive feature. Primary quality metric: successful management-screen visits without native render errors; no analytics implementation is part of this plan.

## Confirmed diagnosis

`my-app/src/app/manage/[type]/[id].tsx` contains two explicit `{" "}` JSX children at lines 118 and 126, between the action rows inside the `!intent` branch. Unlike indentation between JSX elements, these expressions create actual text nodes. AuthGate returns a fragment, so the spaces reach Shell's native content container without a Text ancestor.

The installed native renderer reports exactly the screenshot's message when creating text outside a Text parent (`ReactFabric-dev.js`, `createTextInstance`). The LogBox source in the screenshot is the reporter, not the application defect. The component stack points to the enclosing conditional at line 109 rather than the two exact child expressions.

A read-only, synthetic component diagnostic transpiled the actual Manage route using the existing test-harness approach. It found two raw space children for all six default-menu combinations of resource type (Cards/Bills/Circles) and owner/non-owner. It found none in the connect/end/leave branches. This is a render-tree reproduction, not a physical-device retest or a claim that every role can access every resource.

A source-wide syntax scan found the same whitespace expressions elsewhere inside text-rendering components (including BillInfo, which wraps its children in Label). Preserve those intentional spaces. This scan isolates this particular pattern; it is not proof that every possible raw-text error in the app has been eliminated.

The Manage file's latest commit is `d09a5f7`, the earlier core integration. This defect predates the latest Card interaction changes. Existing browser-oriented component adapters use HTML divs, where bare whitespace is legal; they cannot by themselves enforce the native Text rule.

For dismissal, `CardStack` already calls `onSelect(null)` through a background Pressable, but its bounds cover only the measured stack with small top/bottom extensions. Other blank areas on the Cards screen have no dismissal handler. The null-selection geometry and collapse animation already exist. Full screen hit testing still needs browser and device verification.

## Review focus

1. Default Manage menus across Cards/Bills/Circles and host/member contexts must render without raw text children.
2. Removing stray spaces must not remove legitimate spaces inside labels or change any management action.
3. Empty-space taps must collapse the stack; taps on another card must select that card, and opening the selected card must still navigate.
4. Scroll drags, the create button, header actions, navigation and setup rows must keep their own behavior without accidental dismissal or swallowed input.
5. Empty/single/long card lists, refreshes that remove the selected item, reduced motion and narrow screens must retain valid geometry and accessible controls.

## Task 1: Repair Manage arrangement text children

**Files:** Modify `my-app/src/app/manage/[type]/[id].tsx`; create `my-app/tests/manage-rendering.test.mjs`. Follow the controlled-hook/transpile approach in `my-app/tests/cards-recovery.test.mjs`.

**Interface:** Keep Manage's routes, props, command payloads and state transitions unchanged. The regression harness must distinguish native view containers from Text-backed components and treat fragments transparently.

- [ ] Add a failing render regression for default menus across all three resource types and owner/non-owner states. Assert no string or number children outside a Text-backed component; include pending, missing-resource and failure states.
- [ ] Assert connect/end/leave and cancel actions still render their existing text and invoke the same handlers; retain allowed inline whitespace in Text-backed components.
- [ ] Run `node --test my-app/tests/manage-rendering.test.mjs` from the repository root and confirm the two space children cause failure before editing.
- [ ] Remove only the two stray JSX space expressions. Keep row spacing in the existing layout; do not wrap the whole menu in Text or suppress LogBox.
- [ ] Rerun the focused test and `node --test --test-concurrency=1 tests/integration/arrangement-lifecycle.test.ts tests/integration/circle-administration.test.ts`.
- [ ] Check the accessible Manage screens on the iPhone and confirm the native error no longer appears. Use synthetic data; do not end, close or leave a real arrangement to test rendering.

## Task 2: Complete outside-card dismissal

**Files:** Modify `my-app/src/app/cards.tsx` and `my-app/src/features/potluck/card-stack.tsx`; extend `my-app/tests/cards-recovery.test.mjs` and `my-app/tests/card-stack-layout.test.mjs`. Modify `my-app/src/design/system.tsx` only if the shared content surface needs a reusable, opt-in background-tap hook; cover any such hook in `my-app/tests/ui-shell-regressions.test.mjs`.

**Interface:** Preserve `CardStack`'s controlled `selectedId: string | null` and `onSelect(id: string | null)` API. Dismissal clears the existing selection rather than manipulating positions or card order directly.

- [ ] Verify the recorded Figma stack references and current app hit areas. Include above/below the stack, side margins, expanded gaps and the unused viewport area in the dismissal acceptance map.
- [ ] Add failing interaction tests: select a card, tap eligible background, observe null selection and original positions; tap another card and retain its selection; tap the selected card and open its details.
- [ ] Extend dismissal to noninteractive background surfaces using a single controlled callback. Avoid a topmost overlay that steals taps, a global touch-start reset, or handlers that fire on scroll drags. Any Shell hook must default to no behavior and leave other screens unchanged.
- [ ] Reuse existing collapse animation and full content extent. Test first/middle/last selected cards, zero/one/many cards, a removed selection after refresh, rapid taps and reduced motion.
- [ ] Verify scroll gestures, card opening, create/menu/header/navigation/setup actions, accessibility activation and scroll clearance in the browser and on the phone.
- [ ] Run `node --test my-app/tests/cards-recovery.test.mjs my-app/tests/card-stack-layout.test.mjs my-app/tests/ui-shell-regressions.test.mjs`.

## Task 3: Repair Add people animation-driver conflicts

**New evidence:** The existing Expo log `.local/server-expo-20261012-094251.log` captured iOS errors through 09:50 on October 12. No screenshot is needed to recover these messages:

1. `Style property 'height' is not supported by native animated module`.
2. `Style property 'marginBottom' is not supported by native animated module`.
3. `Attempting to run JS driven animation on animated node that has been moved to "native" earlier by starting an animation with useNativeDriver: true`.

The first two point to `SheetSurface` at `my-app/src/design/sheet.tsx:271`, reached through `CircleSheet` / `AddCirclePeople` / `CreateCircle`. The third points to its layout effect at line 103. The earlier Manage text error is also present independently in the same log.

**Source-supported cause:** The same Animated.View style graph combines `sheetHeight` and `sheetBottom` (animated with the JavaScript driver) with `offset` and `dragOffset` (native-driven transforms). Native promotion of the connected style graph conflicts with its layout properties and later JavaScript animations. Verify the native graph behavior in the regression before implementing; browser-only adapters cannot validate this boundary.

**Files:** Modify `my-app/src/design/sheet.tsx`; extend `my-app/tests/sheet-interaction.test.mjs` and, if geometry changes are necessary, `my-app/tests/sheet-geometry.test.mjs`. Keep `SheetSurface`'s public props and all consumer flows unchanged.

- [ ] Add a failing regression that detects native-driver propagation into animated height/bottom-spacing values. Exercise initial open, expand/collapse, drag release/termination, keyboard show/hide and dismiss/reopen; do not rely only on a mock that accepts every Animated style.
- [ ] Isolate native translate animations on an outer animated container from JavaScript-driven height and bottom spacing on the layout container. Preserve the existing white surface, drag target, accessibility modal semantics, clipping and coordinate measurements. If native propagation cannot be isolated with the existing layout, evaluate one consistent driver for the draggable sheet rather than switching drivers on a value.
- [ ] Keep the backdrop stationary; retain compact/expanded sizing, scrolling, safe areas, keyboard bounds, reduced motion and the appearance/behavior of sheets without dragging. No Figma redesign or new screen is required.
- [ ] Run `node --test my-app/tests/sheet-interaction.test.mjs my-app/tests/sheet-geometry.test.mjs my-app/tests/cards-recovery.test.mjs`.
- [ ] Retest these interactions on the iPhone and confirm all three messages are absent from fresh logs. Distinguish a successful browser check from native runtime verification.

The log also repeats the already documented `system.tsx -> creation-menu.tsx -> system.tsx` require-cycle warning. Keep it separate from these three animation errors; do not assume it caused them or expand the repair into unrelated module restructuring.

## Completion and rollback

- [ ] Run `node scripts/validate.mjs --local` for formatting, lint, types, backend/domain/mobile tests and iOS/Android/web exports. Run the documented dependency audit separately using the available npm CLI and distinguish pre-existing findings from regressions.
- [ ] Review the diff for unintended UI, mutation, permission, spacing and navigation changes. Keep the repairs in separate reviewable commits when implementation is authorized; do not merge automatically.
- [ ] Record actual browser and phone results separately. An export or HTML rendering test does not prove native runtime correctness.
- [ ] Rollback is a revert of the relevant repair commit; there are no migrations, data edits or native dependencies. No new mobile binary is expected for these JavaScript-only repairs.

Only this planning document was added during diagnosis. Full validation and physical-phone confirmation are future implementation steps, not completed results.
