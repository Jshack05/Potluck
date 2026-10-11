# Combined Card creation — October 11, 2026

Joseph approved combining naming and appearance selection. The app now uses **Create card (name and appearance) → Attach a Circle → Review card → Cards**. This replaces the separate appearance step; it does not change permissions, bank setup, issuance, funding or invitations.

## Source and composition

- [Current combined Figma screen, 854:3466](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=854-3466).
- [Preserved pre-combination reference, 2306:45190](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD/Potluck?node-id=2306-45190). Original components and the old appearance frame `928:4751` remain; that frame is no longer the required next creation step.
- [Approved plan and complete 21-source register](../superpowers/plans/2026-10-11-combined-card-creation.md).
- [Dated route/connection overlay](../flow-audit/2026-10-11-card-creation-mapping.json). Older audit captures remain immutable evidence of their own dates.

Live inspection reconfirmed the six basic designs and fifteen approved custom themes in `1583:19502`. Sample Card names, balances and selected-state variants were not counted as new designs. Thirteen missing raster fills were exported; the existing Graphite/Northern lights artwork and six basic renderings were retained. Asset provenance is beside the new artwork.

The combined Figma frame reuses the original field, heading, preview, selection controls and Continue. See all styling comes from `573:2090`; tiles use `1075:5433` and original Card/Selection components. A nested-instance resize limitation required detaching the outer tile wrapper only; the Card and Selection children remain component instances. Thumbnail proportions were corrected to 176 × 93.87, derived from 330:176. The layout has a clipped scrolling body and stationary footer. Prototype variables control the 21 previews/selections and Finishes/Artwork expansion. Captured Continue and attachment-Back reactions point directly between `854:3466` and `854:3495`.

Figma is a reference prototype: its sample financial values and static text fixtures are not runtime state. The app renders real names, saved state and truthful unissued status. Figma wiring and variable bindings were inspected programmatically; a full live Figma prototype click-through is not claimed. The app additionally identifies a selected but collapsed tile next to its category; the prototype's selected-name caption remains above the catalog.

## App architecture and behavior

- `card-appearance-catalog.ts` owns labels, categories, stable IDs, source nodes and rendering metadata. `CardPreview` uses it for creation, review, collection, detail and settings. The same exact artwork fills every size without baking text or balances into an image.
- Graphite is the default only for genuinely new UI drafts. Existing Cards, saved drafts, pending request bodies, workflow identities and results retain their choices. API clients omitting a design retain the historical `teal` default.
- The creation route owns one draft. Stored steps 0/1 map to the combined form; 2/3 retain Circle/review semantics. Pending submissions remain locked and resumable. Expansion state is presentation state retained while navigating within the mounted creation flow.
- Categories show two choices initially. Finishes (5) and Artwork (10) have independent See all/See less actions. Solid colors, Gradients and Potluck panels each contain two, so no redundant expansion action is shown. Selection never advances the route or clears the name. Collapsing preserves the selected design and identifies it with text.
- Only the combined screen opts out of Shell keyboard avoidance. Continue stays in its ordinary bottom position; the name field supports Done and scrolling. This does not implement the separately recorded authentication-screen keyboard changes.
- Dark foregrounds on Brushed Silver, Frosted Glass, Champagne and Coral follow their sources. The existing edit icon is tinted with that foreground so it remains visible in saved Card detail.

## Validation and review

New regressions were observed failing before implementation and passing afterward: complete catalog acceptance/artwork, combined default/navigation, independent expansion, hidden selection, old draft compatibility, stationary footer, Coral lettering and light-card edit contrast.

- `node scripts/validate.mjs --local` after the final code fix: **48 backend/domain tests and 74 mobile tests passed**, along with backend formatting, strict types, mobile lint and iOS/Android/web exports.
- Earlier full `node scripts/validate.mjs`, with the local npm CLI configured: all functional checks/exports passed; backend dependency audit found zero vulnerabilities. **Mobile dependency audit failed with 23 pre-existing findings: 3 moderate, 19 high, 1 critical.** Dependencies and lockfiles were not changed. The full release gate is not green.
- Independent fresh-context review checked the implementation and reran 26 focused tests plus the catalog integration test. Its single actionable finding, light-card edit contrast, was fixed with a failing-then-passing regression. Native behavior and live Figma interaction were explicitly outside that review's evidence.
- Browser checks at 320×640, 390×844 and 430×932 covered long names, complete image loading, proportional artwork, expansion, selection, Back and a saved draft reopening after re-authentication. A synthetic local account completed creation with Lagoon, reopened the saved Card with Lagoon artwork, and started another draft with Graphite. No bank, provider issuance, spending credential or money movement was created.
- Browser detail navigation exposed an existing nested-button warning (`Balance details` wraps a Card preview with `Edit card`); the same nesting exists at baseline `20de753`. An existing `system → creation-menu → system` require-cycle warning also remains. Both are deferred outside this composition change, rather than suppressed.

Physical iPhone keyboard timing, safe areas, large accessibility text and touch/scroll acceptance remain outstanding. Browser viewport checks and successful exports do not establish native fidelity. No new mobile binary or OTA release was published.

## Migration, delivery and rollback

`0010_card_appearance_catalog.sql` expands the allowed appearance IDs. It does not rewrite existing rows; `0008` remains unchanged. Deploy the migration and API contract before a client submits the new IDs. The local API was restarted with its existing database and the new migration; Expo remains on port 8083. This is local development delivery, not a production deployment.

The pushed backup branch is `codex/backup-before-combined-card-2026-10-11` at `b9bd6da` (approved plan plus pre-change app). To restore the prior UI, use that branch in a separate checkout or revert the October 11 UI commits, preserving the current database and drafts. **Keep the expanded database constraint and existing appearance IDs** even if reverting client presentation; never relabel saved designs to satisfy an older constraint. Older clients may render unfamiliar designs generically, so deploy a compatible UI before exposing new choices broadly. Restore the original Figma composition from `2306:45190` if necessary; do not delete the source components or current reference evidence.

Work remains on `codex/cards-figma-recovery` in draft PR #5, unmerged. The separate nested Create Circle return gap, unmatched administrative counterparts and provider-backed financial actions are unchanged. No missing artwork was fabricated; the broader Figma audit is not represented as complete.
