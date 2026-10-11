# Combined Card creation and complete appearance catalog — approved plan

> **Approved October 11, 2026:** Joseph instructed “Apply these changes. Go.” Implemented under `superpowers:executing-plans`; see the [execution record](../../ui-concepts/2026-10-11-combined-card-creation.md) for validation and remaining physical-device acceptance.

**Goal:** Let a host name and personalize a Card on one screen using existing Figma designs, then continue to Circle attachment and review without losing their draft.

**Architecture:** Keep one creation route and one persistent draft owner. Extend the reusable Card preview and appearance picker using one presentation catalog; preserve the existing API/DB design identities and add new values through a forward migration.

**Tech stack:** Existing Expo/React Native/TypeScript client, shared contracts, local API and SQL migrations. No additional dependency proposed.

**Spec:** Joseph's October 11 request and supplied phone screenshots; the proposed experience and source register below. This supersedes the earlier planned separate name/appearance steps only after approval. Existing financial and authorization rules remain unchanged.

## Proposed experience

Flow: **Create card (name + appearance) → Attach a Circle → Review card → Cards**.

- Keep the existing Create card header and Back control. Show the existing name field, one centered live preview, the selected appearance name, categorized options, and one Continue action.
- Use **Graphite** for genuinely new drafts. It already exists in Figma (`1583:19448`) and the app (`graphite`). Existing Cards, saved drafts and pending submissions retain their chosen appearance, including Northern lights.
- Typing updates the preview name. Tapping a tile updates the preview and one selection indicator immediately. Selection does not advance, collapse a category, reset scroll, or dismiss the screen.
- Start each category with two designs in a two-column row. Proposed order: Finishes; Solid colors; Gradients; Potluck panels; Artwork. Put Graphite first in Finishes and preserve the six current basic designs' relative order.
- **See all** expands the rest of that category inline; **See less** collapses it. Keep other categories unchanged. No new gallery route or modal is needed. Preserve the selection and expanded categories while visiting Circle/review and returning. Collapsing never changes the selected design; show its name in the category heading if its tile becomes hidden.
- **Recommendation to review:** where a category has only two designs, its full contents are already visible. Omit a redundant See all action there. This is an explicit recommendation concerning the request for a button on every category, not an assumption that Figma supplies more designs than it does.
- Reuse the existing See all text-link treatment (`573:2090`) and appearance tile (`1075:5433`). Inline expansion is the proposed interaction for this combined composition; it is not claimed as existing prototype wiring.
- Keep Continue at its ordinary bottom safe-area position; do not lift it automatically with the keyboard. Keep the active name field reachable, allow content scrolling, and use the keyboard's Done action to dismiss it. Bottom navigation, wherever present, stays stationary.
- Use the exact 330:176 card aspect ratio, proportional thumbnail geometry, consistent gutters, readable names and source-specific light/dark foreground colors. Artwork fills the unpadded rounded bounds. Do not reproduce the existing Figma thumbnail double-scaling inconsistency.

## Current evidence and catalog

Read-only inspection on October 11 confirmed that `854:3466` (Create Card / Details) and `928:4751` (Choose appearance) are still separate. The app on `20de753` also separates them, starts new drafts with `aurora`, and offers six picker choices. Its accepted set contains eight IDs including the two saved artwork designs.

Figma file: `1hAy3kcZAEvqq8ZNjKU7CD`. The current screen uses picker `1081:6492`, tile `1075:5433`, and the six base appearances below. Custom set `1583:19502` contains 15 visually inspected variants with distinct image fills. This gives **21 catalog entries in these source sets**; sample Family/Grocery/Apartment/Trip cards and six selected-state picker variants are not additional selectable designs. Check for newer/superseding equivalents before implementation; inventory status is not automatic canonical approval.

| Proposed category | Label                          | Existing/source node | Persisted ID to retain or add |
| ----------------- | ------------------------------ | -------------------- | ----------------------------- |
| Finishes          | Graphite                       | `1583:19448`         | retain `graphite`             |
| Finishes          | Brushed Silver                 | `1583:19412`         | add `brushed_silver`          |
| Finishes          | Frosted Glass                  | `1583:19430`         | add `frosted_glass`           |
| Finishes          | Champagne                      | `1583:19466`         | add `champagne`               |
| Finishes          | Satin Teal                     | `1583:19484`         | add `satin_teal`              |
| Solid colors      | Evergreen                      | `916:4034`           | retain `teal`                 |
| Solid colors      | Coral                          | `916:4051`           | retain `coral`                |
| Gradients         | Aurora gradient                | `915:4016`           | retain `aurora_gradient`      |
| Gradients         | Sunset gradient                | `915:4033`           | retain `sunset`               |
| Potluck panels    | Ocean                          | `917:4052`           | retain `ocean`                |
| Potluck panels    | Violet                         | `917:4069`           | retain `berry`                |
| Artwork           | Northern lights (Figma Aurora) | `1583:19232`         | retain `aurora`               |
| Artwork           | Ocean artwork                  | `1583:19250`         | add `ocean_artwork`           |
| Artwork           | Sunset artwork                 | `1583:19268`         | add `sunset_artwork`          |
| Artwork           | Botanical                      | `1583:19286`         | add `botanical`               |
| Artwork           | Midnight                       | `1583:19304`         | add `midnight`                |
| Artwork           | Terracotta                     | `1583:19322`         | add `terracotta`              |
| Artwork           | Alpine                         | `1583:19340`         | add `alpine`                  |
| Artwork           | Prism                          | `1583:19358`         | add `prism`                   |
| Artwork           | Orbit                          | `1583:19376`         | add `orbit`                   |
| Artwork           | Lagoon                         | `1583:19394`         | add `lagoon`                  |

These category assignments and disambiguated artwork labels are proposed presentation choices. Export existing artwork fills only; never bake Figma's sample balances, card names, roles or controls into images. Inspect each source's foreground treatment: light finishes cannot inherit the white lettering used on dark artwork. Record asset provenance and do not invent missing art.

## Global constraints and product purpose

- Existing Figma screens/components are the starting point. Combining these screens is Joseph's requested change; creating unrelated replacement flows is not. Stop and record any missing source, unclear variant or unverified element.
- Target: a host creating a Card. Promise: name and recognize your Card without an extra setup step. Free/core; no upsell, entitlement or price changes. Acquisition/invitation stays in the existing Circle flow; retention comes from recognizing recurring shared arrangements. Primary measure: completion from creation entry to saved Card, with abandonment and selection errors as secondary measures. This improves the existing shared-arrangement product rather than adding a new competitive feature; paid conversion remains deferred.
- No bank-connection, spending-permission, provider issuance, funding, balance, consent, authentication or ownership changes. Never use Figma fixture financial data as runtime state.
- Preserve existing IDs and defaults for legacy API clients omitting a design. The app explicitly sends Graphite for new UI drafts. No rewriting existing rows or silent replacement of saved artwork.
- Keep persistent workflow IDs, pending request bodies and acknowledged results intact. Never unlock a pending retry or regenerate its identity to simplify the new UI.
- No generic wizard framework, duplicate Card renderer, new dependency, or broad Shell rewrite. Account-entry keyboard changes are recorded separately; this scope applies the same principle to the combined Card screen.

## Review focus

1. Old drafts at appearance step 1 must reopen the combined screen; Circle/review drafts must not jump backward or lose context.
2. Selected designs hidden by a collapsed category must stay selected and identifiable; selection must be accessible without relying only on color.
3. Image assets must fill every preview size and light finishes must retain source contrast; short phones, long names and large text must remain usable.
4. Card design IDs with overlapping labels must stay distinct through preview, API, database, saved Card and later views.
5. A lost response, permission failure or invalid design must not create duplicate Cards, erase the draft or weaken existing validation.

## Implementation tasks after approval

### Task 1 — Establish the canonical combined Figma composition and asset register

**Files/objects:** Existing frames `854:3466`, `928:4751`; tile/picker `1075:5433`/`1081:6492`; `docs/UI_FLOW.md`, `docs/APP_FLOW_MAP.md`, and the active graph/source inventory. Intended mapping must remain distinct from older captured prototype evidence.

- [x] Refresh the source sets and compare duplicate/sample variants before export; expected: an explicit source node and unique stable identity for every included look, with missing/ambiguous entries stopped and recorded.
- [x] Compose the approved combined layout using the existing name field, preview, categories, selection controls, See all treatment and Continue. Preserve original source IDs/reference evidence and avoid deleting original components.
- [x] Wire Continue directly to the existing Attach a Circle frame. Back from attachment returns to the combined composition. Preserve existing standalone/attached review and completion destinations; this task does not resolve the separate nested Create Circle return gap.
- [x] Validate narrow/tall composition, all expanded categories and scroll bounds; expected: no clipped name field, stretched art, overlapping actions or additional invented route. Record the final mapping and screenshots.

### Task 2 — Extend the shared appearance catalog and persistence contract

**Files:** New `my-app/src/features/potluck/card-appearance-catalog.ts`; existing `card-preview.tsx`, `types.ts`, `packages/contracts/src/index.ts`; new artwork under `my-app/assets/potluck/card-appearances/`; new `db/migrations/0010_card_appearance_catalog.sql` if that sequence remains available. Test in new `my-app/tests/card-appearance.test.mjs` and `tests/integration/card-appearance.test.ts`.

**Interfaces:** Catalog entries contain stable `id`, `label`, `category`, source node and background/foreground rendering metadata. Export `cardAppearanceCategories` and `cardAppearances`; preserve the existing CardPreview props and its consumers. Use static asset references supported by Metro, with one rendering path across creation, collection, review, detail and settings.

- [x] Write regressions asserting every catalog ID is unique and accepted, the original eight retain their meanings, unknown IDs are rejected, every label/source/asset is present, and light/dark foreground metadata matches the source. Run focused tests; expected: new catalog acceptance fails before implementation.
- [x] Add the 13 missing values above through contracts/types and an additive forward constraint migration. Do not edit `0008_card_appearance.sql`. Export verified fills and render through catalog metadata. Preserve the historical API omitted-design default unless a separately approved compatibility decision changes it.
- [x] Exercise authenticated creation/read for all 21 IDs, invalid values, duplicate command identity and another user's denied access. Run `node --test tests/integration/card-appearance.test.ts` and the mobile appearance tests; expected: pass, no financial state created.
- [x] Commit the coherent catalog/contract change with migration and asset provenance.

### Task 3 — Combine the UI while preserving existing drafts

**Files:** `my-app/src/app/create/card.tsx`, `my-app/src/features/potluck/card-creation-steps.tsx`, `my-app/tests/cards-recovery.test.mjs`, and `my-app/tests/card-navigation.test.mjs`. Keep the Card-specific stored-step adapter in the creation route. Reuse `useCreationDraft`; do not change its storage key or global retry semantics.

**Interfaces:** `CardAppearancePicker({name, design, disabled, onSelect})` remains controlled. Category expansion belongs to presentation state in the mounted creation route, not a second draft owner. The route sends the existing `{name, design, circleId}` command.

- [x] Write failing behavior tests: fresh draft starts Graphite; saved Northern lights remains; name/selection update the same preview; there is no intermediate appearance screen; Continue goes to Circle; Back retains name/design/expansion and restores the combined screen.
- [x] Use a compatibility adapter for stored steps: **0 or 1 → combined; 2 → Circle; 3 → review**. Continue from combined goes to 2; Back from 2 goes to combined; review Back goes to 2. Do not renumber existing saved steps. Pending/result drafts still resume review using the existing identity and request.
- [x] Compose the existing controls into one scrollable body with one preview and one Continue. Use two-column tiles and inline See all/See less as specified. New drafts alone receive `graphite`.
- [x] Add locked-draft, hidden-selection, expansion/collapse, empty/long name, absent Circle, lost-response and saved-result regression cases. Run `node --test my-app/tests/cards-recovery.test.mjs my-app/tests/creation-draft.test.mjs my-app/tests/card-appearance.test.mjs`; expected: pass without weakened existing cases.
- [x] Commit the combined screen and draft compatibility separately from catalog/schema work.

### Task 4 — Verify keyboard behavior, fidelity and safe rollout

**Files:** Existing Shell/creation layout only where required for the approved footer behavior; focused navigation/creation tests; execution notes and durable UI/product context updates.

- [x] Test that the combined screen keeps Continue outside keyboard-driven upward translation while the active field remains reachable. Do not globally change unrelated screens as a side effect. Keep all existing navigation tests.
- [ ] Compare the real app with the approved combined frame at 390/430-point widths and a compact viewport; exercise keyboard open/close, expansion, long names, light/dark artwork, scroll, Back, reload and creation retry on the development build. Expected: consistent aspect ratios and selection with no layout jumps or data loss. Report phone checks separately from browser/component tests.
- [x] Run `node scripts/validate.mjs` with npm available, changed-file formatting and `git diff --check`. Expected: all functional checks/exports pass; report the existing dependency-audit failures separately rather than suppressing them.
- [x] Update the flow documentation and creation-step decision, preserving historical captures. Record any stopped/missing sources. Submit focused commits through a draft PR with validation and rollback instructions; do not merge automatically.

## Rollout and rollback

The server constraint expansion must ship before a client can submit the added design IDs. Review old-client rendering before rollout: a client predating the new catalog may use a generic fallback for a saved new design. Prefer a forward UI repair/compatibility fallback; never relabel stored artwork or revert the database to a constraint that rejects saved choices. Verify the local next migration number again before execution.

Only code/artwork changes are expected on mobile; no new native package or binary configuration is planned. Do not claim phone delivery until the running development server and affected device are verified. Back up/commit the existing work before implementation and retain saved drafts, Cards and audit records throughout rollback.

## Execution outcome

Figma composition, catalog, additive migration and the combined app flow are implemented. Browser checks and automated validation are recorded in the execution report. The unchecked acceptance item includes physical-phone keyboard and large-text checks, which remain outstanding. Dependency-audit failures remain explicitly reported.
