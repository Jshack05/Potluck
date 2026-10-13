# Merchant controls — Figma execution record

## Authorized scope

Create the approved Maximum, Range, and Choose industries screens in the existing Potluck Figma file, reusing local components and icons. Connect the active Family and Apartment Card settings entries. New reusable components are authorized where the library has gaps. No application implementation or provider behavior changes are part of this task.

Target: a Card Host configuring where and for what purchase amounts a Card may be used. Core promise: clearly choose permitted industries and an amount maximum or range. Core/free design; invitations remain the acquisition mechanism, recurring Card use supports retention, and paid conversion is deferred. Measure control setup completion and subsequent adjustment. These controls supplement a shared Card workflow rather than a retrospective bill tracker.

## Source inspection and plan

- Active settings: Family `622:2591`, Apartment `622:2752`. Both use Controls card / Standard `1077:5680`; Merchant controls has no destination. Archived Grocery/Trip reference screens are excluded.
- Reuse header `1078:6039`, CTA `333:474`, Cards-selected four-destination navigation `1207:6363`, checkboxes `1917:29476` / `1917:29478`, and local Bill/Core icons. Back `280:414` and field `1077:5650` supplied reference geometry; the new reusable amount field adds explicit label/value/currency properties, and the explicit-destination Back variant is described below.
- Existing local icons cover Groceries, Utilities, Phone & internet, Transportation, and Health & pharmacy. Local and library searches found no appropriate Dining, Fuel pump, Travel suitcase, Shopping bag, or Entertainment ticket components. Add those as small token-bound vector component sources.
- Add cohesive component sources for amount fields, Maximum/Range panel, selectable industry rows, card context, and selection summary; build screens from instances with auto layout and existing theme variables.
- Wire the full Merchant controls row, mode switching, industry editing, selection toggles, Save, and Back. Keep source Card identity and committed prototype state separate from draft state.
- Inspect rendered screens and check prototype targets, source links, containment, scrolling, and preservation of existing routes. Save node IDs and limitations below.

## Rules represented by this design

Maximum/range is **per purchase**, distinct from the existing monthly spending-limit and spender-permission flows. Industry restrictions use merchant category codes, not individual basket items. Only checked industries are allowed; no selection means no industries permitted. Example values are USD $150 maximum or $10–$150 inclusive range. The production implementation must still verify supported provider attributes, deterministic rule precedence, server authorization, audit events, and data integrity. Figma state is not financial state.

Industry group labels are informed by the official [Lithic MCC reference](https://docs.lithic.com/docs/merchant-category-codes-mccs), [Lithic conditional rules](https://docs.lithic.com/docs/conditional-action-rules), and [Stripe spending controls](https://docs.stripe.com/issuing/controls/spending-controls). Exact MCC group membership remains an implementation decision requiring explicit coverage; these labels must not be treated as a complete processor taxonomy.

## Execution and verification

Created on **03 Screens**, with source components on **02 Components**:

| Screen                                                                                                        | Figma node   |
| ------------------------------------------------------------------------------------------------------------- | ------------ |
| [Merchant controls / Maximum](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=2353-45867) | `2353:45867` |
| [Choose industries](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=2353-46051)           | `2353:46051` |
| [Merchant controls / Range](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=2353-46316)   | `2353:46316` |

The [mapping ledger](../flow-audit/2026-10-12-merchant-controls-mapping.json) records new and reused component IDs, exposed properties, entry points, app mapping and verification results. New sources include a two-variant purchase-amount component, one reusable amount field, one icon-swappable industry row with an exposed Checked property, a shared allowlist summary, the industry list, card-context row, search presentation, and summary strip. Five missing icons extend the existing Bill Icon geometry and palette. No original component master or unrelated screen was replaced.

Both settings entries have full-row interaction targets: Family `2356:46444`, Apartment `2356:46446`. Each loads its own saved prototype policy. Mode switching retains the draft; Edit snapshots the industry choices; picker Back restores that snapshot; Use retains choices; editor Back leaves saved policy unchanged; Save commits only the current Card's prototype values. The settings value updates to the selected-industry count. All ten rows toggle and update the count, checkboxes, selected-only rows, and mode-appropriate summary. Empty selection explicitly permits no industries. The existing 390 × 72 Cards-selected navigation stays at y=832 on each 430 × 932 screen.

**Verification:** all three rendered screens were visually inspected. Sixteen read-only checks evaluated the live Figma reaction definitions, including independent Family/Apartment state, cancel/save behavior, zero/all selections, counts, navigation targets and shared navigation dimensions. All passed. This is structural/action evaluation, not browser playback or production-provider testing. Initial composition revealed spacing and inconsistent nested Back rendering; these were corrected and screenshots refreshed. The screens retain the existing header title component with its nested Back hidden; visible Back controls share the new `Navigation / Back / Explicit destination` source (`2364:48011`), built from the existing disclosure-chevron icon (`329:440`), approved 44px geometry and theme surface. The new source carries no generic history action; each instance uses its explicit Card/cancel destination. Original header and Back masters were not changed.

**Visual refinement requested after review:** the current-Card row is 88px tall and uses a 104 × 55.47 miniature, proportionally scaled from the original Apartment/Aurora and Family/Graphite components. The reusable miniature set `2370:48104` follows the same `context/cardName` variable as the row label, so entering from Family settings does not display Apartment artwork. No artwork was redrawn or detached. Additional appearances should use the same scaling pattern with their existing Card sources.

The miniature displays only the user name, with an 8px internal inset. Its exposed `User name#2378:4` property defaults to `Joseph`, matching the existing Figma profile detail (`1075:5374`); application implementation must supply the authenticated user's name. Balance, Card title, role and bill elements are hidden only within the miniature's nested Card instances. The Card name and HOST badge remain outside the miniature. Full-size Card masters are unchanged. The row has a 20px left/right inset. Both green draft-summary strip instances were removed, and their space now extends the scroll viewport to y=744 while Save and navigation retain their positions.

Both Maximum/Range selectors use the existing `radius/full` token. The shared amount input uses a white surface, subtle 1px border, 9px corners and 22px amount text. Labels stay above the inputs, with `USD per purchase` below the amount group, matching the supplied prototype. Both rendered screens were visually reviewed after the row enlargement. The original sixteen reaction checks passed again, along with eight focused checks covering dimensions, name-only content and inset, summary removal, Save clearance, and preservation of both original Card masters. These changes affect Figma only; existing screen IDs, mode targets and Save/cancel actions are preserved.

**Prototype limits:** amount inputs show example values; arbitrary typing and industry-search filtering are not simulated. Industry selection, mode switching, navigation and session-level Save/cancel behavior are wired. Exact processor MCC membership remains to be established before app enforcement. No application source changed; app tests and provider tests were not rerun for this Figma/documentation task.

Screenshot export intermittently omitted a Back instance despite correct visibility and geometry. The final review rendered each Back instance first, then its screen; all three final captures show the control. Browser/native Figma playback remains unverified, so the reaction checks should not be represented as a live click-through test.

New documentation and the mapping JSON pass Prettier; `git diff --check` passes. `UI_FLOW.md` and `APP_FLOW_MAP.md` also fail formatting at their unchanged HEAD baselines, so this task leaves their unrelated historical formatting intact and adds only the focused mapping notices.

**App handoff:** `my-app/src/app/card/[id]/setup.tsx` currently displays Merchant controls without an `onPress`. Its existing `controls.tsx` is a provider-readiness screen, not this design. Implementing the new editor is a separate task; use these exact Figma IDs and reuse the catalog/row/field boundaries.

**Rollback:** remove only the three new screen frames, their two flow-start entries, and the two new settings interaction targets. Unbind the two Merchant controls value texts (`I1077:6321;1077:5698`, `I1077:6377;1077:5698`) and restore `Essentials` / `Utilities`. New component sources and the `Prototype / Merchant controls` variable collection may be removed only after confirming no later consumers reference them. Existing screen IDs and other prototype connections were preserved.
