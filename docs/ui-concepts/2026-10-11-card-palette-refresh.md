# Card palette refresh — October 11, 2026

## Scope and current state

Joseph requested stronger, continuous gradients, more gradient and two-color designs, and the approved dark green for Create card's See all controls. His final category name is **Two tone**, superseding the earlier Duotone answer and Potluck panels label.

**Figma refresh and subsequently authorized app synchronization completed.** The Figma picker and app both have 29 choices. The first phase changed Figma only; the follow-up extended the shared app catalog, API enum and database constraint and simplified the creation Card face as explicitly requested. No dependency, financial-state or permission behavior changed.

## Current Figma sources

File: `1hAy3kcZAEvqq8ZNjKU7CD`.

- [Create card — name and appearance, 854:3466](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=854-3466).
- [Palette review sheet, 2315:46936](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=2315-46936), on **02 Components**. These are source-linked specimens, not another product screen.
- Gradients category: `2306:46125`; Two tone category: `2306:46241`, on the existing Create card screen.

| Category | Label | Source component | Existing app ID / proposed future ID |
| --- | --- | --- | --- |
| Gradients | Aurora | `915:4016` | Existing `aurora_gradient` |
| Gradients | Sunset | `915:4033` | Existing `sunset` |
| Gradients | Cobalt | `2315:46752` | Proposed `cobalt_gradient` |
| Gradients | Tidal | `2315:46773` | Proposed `tidal_gradient` |
| Gradients | Ember | `2315:46794` | Proposed `ember_gradient` |
| Gradients | Iris | `2315:46815` | Proposed `iris_gradient` |
| Two tone | Ocean | `917:4052` | Existing `ocean` |
| Two tone | Violet | `917:4069` | Existing `berry` |
| Two tone | Evergreen | `2315:46836` | Proposed `evergreen_twotone` |
| Two tone | Clay | `2315:46855` | Proposed `clay_twotone` |
| Two tone | Indigo | `2315:46874` | Proposed `indigo_twotone` |
| Two tone | Slate | `2315:46893` | Proposed `slate_twotone` |

Source Cards remain 330 × 176. Gradient fills now blend across the whole Card; the old translucent right-half panel children are hidden, not deleted. Two tone retains the distinct two-area treatment. Existing source IDs are preserved, with four additional sources in each family. Editable paint styles and the `Card appearance palettes` variable collection (`VariableCollectionId:2315:46743`) own the new palette values. Other categories and Graphite's default selection are unchanged.

All eight See all / See less text controls in the combined picker bind to the existing `color/brand/deep-teal` variable (`VariableID:1:21`, **#006D67**). The global token itself was not changed. The original source-backed tile, selection indicator and preview patterns are reused; thumbnails retain the 330:176 proportions.

## Prototype and verification

- 29 tiles and 29 large previews. Every tile's captured action sets exactly one of the 29 selection variables true and clears the others; existing tiles also clear the eight new choices.
- Gradients and Two tone show two choices initially and each expand independently to three rows of two choices. See less restores the compact view without changing the selected design.
- Inspected renders of the 12-source review sheet, the combined screen's initial viewport, and both expanded category grids. Continuous gradient fills, distinct Two tone panels, consistent tile sizes, labels and deep-teal expansion links were visible without overlap.
- Expanded-grid inspection temporarily disabled ancestor clipping and restored it; expansion defaults were restored to collapsed. This was canvas render and wiring verification, **not a live prototype click-through or physical-phone test**.
- Continue remains connected to Attach a Circle (`854:3495`); that screen's Back remains connected to the combined form. No new route or product screen was introduced.

## App synchronization

The existing shared `card-appearance-catalog.ts` owns all 29 designs, their exact Figma palettes, source nodes and category labels. Its gradient helper retains the source geometry and now renders six continuous fills without the old panel overlay. Two tone uses the existing panel renderer. No duplicated per-screen art or new dependencies were introduced. The internal category ID `panels` and existing saved design IDs remain compatible; user-facing wording is Two tone.

`CardPreview` accepts an optional typed `CardCreationIdentity`. Create card obtains the full profile name from the signed-in session and passes the same identity through the picker, swatches and review. The large creation/review face has only Card name, full name and HOST; the type also supports CONTRIBUTOR without converting contributors into spenders. The existing compact swatch omits the badge to keep its selection indicator unobstructed. Identity does not enter persisted drafts, Card commands or permission decisions. The user's explicit content request supersedes the financial sample text in the Figma reference for these creation previews only. No new screen was invented; saved Card status/balance/edit rendering remains on its existing path.

The picker reuses `theme.teal` (#006D67) for every See all / See less label. Categories still expand independently and preserve hidden selections. Graphite remains the new-draft default; saved drafts, pending submissions and the historical omitted-API-design default (`teal`) are unchanged.

The eight proposed IDs in the table above are now implemented in the mobile type, contract and forward migration **0011_card_palette_refresh.sql**. Apply the migration/API before exposing new IDs in the client. Migration `0010` is unchanged; no records are rewritten. The running LAN API was restarted with the existing local database and the forward migration after taking an ignored local database backup. Expo remains on port 8083. This is local development delivery, not a production deployment or new native binary/OTA release.

### App verification

- Tests first reproduced the missing identity face, muted expansion text, old gradient overlay/colors and rejection of the new IDs. The expanded API test initially hit the unchanged 120-request IP limit because it sent host, stranger and anonymous requests from one synthetic address. It now gives those three actors distinct addresses, retaining every permission/idempotency assertion and leaving production limits unchanged.
- Final full `node scripts/validate.mjs` (with the existing local npm CLI): **48 backend/domain and 80 mobile tests passed**, backend formatting, mobile lint, both type checks and iOS/Android/web exports passed. Backend dependency audit: zero. **Full release gate fails on the same 23 mobile dependency findings (3 moderate, 19 high, 1 critical)**; lockfiles and dependencies are unchanged.
- Browser checks at 390×844 and 320×640 covered the simplified creation/review face, a long multi-part full name, Graphite default, expanded categories, dark-green link CSS, continuous gradient markup, Two tone base/accent CSS, collapsing a selected option, Circle/review navigation and successful Cobalt persistence through the running API using a synthetic local account. A subsequent new draft returned to Graphite. No bank, provider credential or money movement was created.
- Fresh-context code review found no actionable regressions. Existing generic saved-card setup messages, unrelated screens and compact badge omission were explicitly outside the creation-face change. Physical iPhone/Android rendering and keyboard acceptance remain unverified.
- The preliminary validation overlapped test editing and therefore is not claimed as a clean baseline; the final completed gate above is the evidence for this change. The old dependency findings are independently documented in the earlier combined-creation record.

## Recovery

- [Original four sources before refresh, 2315:46674](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=2315-46674).
- [Combined screen before expansion, 2316:45407](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=2316-45407).

The screen backup retains component links; restore the saved source paint states as well if reverting the Figma appearance refresh. Keep original source IDs and historical audit captures.

For app rollback, restore the presentation files from pre-sync commit `96ba16c` (also pushed as `codex/backup-before-card-palette-2026-10-11`) in a separate checkout. Do not blindly revert the whole palette/identity commit: **retain migration 0011 and the expanded API IDs** so saved designs remain valid; do not relabel user choices or remove existing data. Older clients may show a neutral preview for unfamiliar designs. The local database backup is ignored and contains private development data; it must never enter Git. Work continues on `codex/cards-figma-recovery` / draft PR #5, without merging.

Delivery: implementation commit `cd77514` was pushed to PR #5. Updating the PR description was denied by the GitHub integration (403), and the browser session was signed out; this document contains the current validation and recovery record. The PR also reports a failed Cloudflare deployment check for that commit. Local exports passed, but no successful hosted deployment or native release is claimed.
