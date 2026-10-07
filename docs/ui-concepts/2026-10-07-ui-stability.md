# Potluck UI stability — October 7, 2026

Branch: `codex/potluck-ui-stability`. Base: `4eccded321e21a05a6bb4c8c0c66c91b5290eb02`.

## Approved scope and implementation

- One persistent bottom navigation for Circles, Cards, Bills and Splitfinder. Nested screens use the same implementation. One shared Inbox/You component; header dimensions no longer depend on empty/populated data. Existing route destinations and authentication remain intact.
- Removed the lighter rounded inset on empty Cards/Bills that created the cream rim. Existing Figma empty-state illustrations are reused.
- Bills always retain All bills / Shared controls; Shared remains the default. A response must arrive before the empty state is shown. Scoped empty collections retain the original artwork.
- Import bills reuses the original icon and white Figma button, enlarged from 189×44 to 284×66, shrinking on narrow screens. It is centered vertically beside the existing +. Existing import and manual-entry routes are preserved.
- Removed both Your Goals links from Cards. No new Goals placement or feature was implemented.
- A shared sheet surface displays the full-screen scrim immediately and animates only the foreground. Dismissal completes before unmount; interrupted animations cannot finish a stale dismissal. Reduced motion uses a stationary foreground.
- The initial implementation used shared skeleton primitives. The approved blank-first follow-up below supersedes them. Existing authorized resource data remains during refresh; failures retain retry handling. Bill-summary controls stay available during delayed/failed month changes.

The shared primitives were extracted from `design/system.tsx` so chrome, loaders and sheets can reuse typography/icons without creating dependency cycles. Public system exports remain compatible. Mechanical additions of `ResourceState.data` across existing screens prevent an initial skeleton from being shown beside cached content during refresh.

No service, domain, API, dependency, lockfile, schema, consent or financial-operation changes. No real bank connection, transfer or card issuance was attempted. A disposable, clearly named local empty QA account was used alongside existing QA fixtures.

## Figma record

File: `1hAy3kcZAEvqq8ZNjKU7CD`.

| Change                                                     | Node IDs                                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Import source 284×66; icon 24; label 16/24                 | 1145:5963, 1147:5958, 1145:5962                                                                                   |
| Linked import instances on empty/populated Bills           | 2178:44994, 2178:45000                                                                                            |
| Empty Cards/Bills canvas and inset fills                   | 766:3012–3014, 766:3098–3100                                                                                      |
| Linked collection tabs on empty Bills                      | 2178:45012; source 1118:5752, set 1118:5759                                                                       |
| Header positioning normalized on home frames               | 7:423, 427:662, 434:660, 547:1625, 563:1705, 570:1755, 570:1824, 570:1893, 714:2708, 766:3012, 766:3056, 766:3098 |
| Removed obsolete three-tab white hotspots                  | 766:3447–3455                                                                                                     |
| Existing four-tab instances retained and actions preserved | 1210:8047, 1210:8019, 1210:8075                                                                                   |
| Loading component set and six source variants              | 2181:46350; 2181:46261, 2181:46276, 2181:46279, 2181:46305, 2181:46321, 2181:46336                                |
| Linked loading examples: Circles / Cards / Bills           | 2182:44978 / 2182:45048 / 2182:45109                                                                              |
| Existing Add people overlay states inspected               | 488:1134, 488:1203, 488:1272, 488:1396                                                                            |

Headers remain linked to sources 1555:19206 / 1555:19208. Navigation keeps its existing component variants. The existing Figma people overlay already kept the scrim at y=0 while the sheet moved; no replacement flow was needed. New loading sources bind existing neutral/surface tokens. Loading examples are separately named and grouped spatially away from the established screens. Structural bounds and screenshots were checked for empty Bills and the loading library/examples.

## Decisions and review ledger

- Ruling: keep the existing data-guarded financial summary calculations. Inspection disproved the preliminary concern about false zeroes in its prior Overview/By week body. The actual flash came from selecting the populated collection layout before its request resolved. Cost if wrong: loading behavior needs additional provider/data-state investigation; financial calculations must not be changed as a visual workaround.
- Ruling: use a persistent root dock for the four home routes, with the same component inside nested Shell screens. This avoids a route migration and preserves existing deep links. Cost if wrong: nested transitions still need device-level layout testing.
- Final review found two Important issues: Android's default `adjustResize` lifts the dock, and an early pending-summary return removed month controls. Both were reproduced by failing regression tests, then corrected. Android now explicitly uses `softwareKeyboardLayoutMode: pan`; the installed Expo manifest adapter test verifies `adjustPan`. Summary controls remain mounted and only its unresolved body becomes a skeleton/error.
- Final review reported no Critical or additional Minor findings. Existing session/resource-key isolation and sheet callback cleanup passed its code inspection.
- Final ruling on review limitations: browser evidence covers sheet backdrop geometry, tap shielding, dismissal/reopening and 320/430-pixel layouts; Figma was separately inspected through component metadata and renders. Physical-device keyboard/animation and native large-text behavior remain unverified. Cost if wrong: device-specific motion or accessibility fixes may still be required before release.

## Verification

Baseline: 47 backend/domain tests and 39 mobile tests; formatting, lint, strict types and iOS/Android/web exports passed.

New regression coverage: collection initial/empty/error/refresh distinctions, Shared-empty versus personal All bills, Android manifest keyboard behavior, summary controls during pending/failed month requests, and retained totals on a failed refresh. Tests for the identified regressions were observed failing before implementation and passing afterward.

Browser checks used the actual local Expo app at 430×932 and 320×600: all four tabs, populated and empty fixtures, both Bills scopes, import entry, original empty artwork, shared chrome dimensions, no horizontal overflow, no Goals links on Cards, and people-sheet expansion/inside interaction/outside dismissal/reopening. The navigation stayed the same DOM instance across home tabs, with a 390×72 inner bar at the 430 reference width.

Dependency audits: backend zero; mobile 23 existing findings (19 high, 3 moderate, 1 critical). The critical transitive package is `shell-quote`. No lockfiles or dependency declarations changed, and the same totals are documented in the October 6 baseline. These remain release blockers; no forced upgrade was applied as part of a visual task.

Final gate: 47 backend/domain tests and 46 mobile tests passed, as did backend formatting, mobile lint, both strict type checks and iOS/Android/web exports. Every changed mobile file also passed formatting. The full command failed only the existing mobile dependency audit described above. See `docs/LOCAL_DEVELOPMENT.md`. Exports validate bundles, not signed native binaries or physical-device behavior.

## Native configuration and rollback

Android's keyboard mode is a native manifest setting. An existing Android development build must be rebuilt/reinstalled to pick it up; JavaScript reload alone cannot update its manifest. iOS has no native configuration change in this task. See [Expo keyboard handling](https://docs.expo.dev/guides/keyboard-handling/) and [app configuration](https://docs.expo.dev/versions/v57.0.0/config/app/#softwarekeyboardlayoutmode).

Revert this branch's UI commits to restore code behavior. Restore `softwareKeyboardLayoutMode` and rebuild Android if rolling that change back. Do not delete databases, migrations, arrangements, agreements or audit records. For Figma, restore the recorded nodes through version history, or restore the import source to 189×44 and remove the separately listed loading nodes. Do not detach existing instances or remove unrelated screens. No automatic merge is authorized.

## Blank-first loading follow-up

Approved after review of the skeleton implementation: leave unresolved content blank initially, preserving its current canvas and established chrome/actions. A single shared `LoadingFeedback` renders nothing for the first 500 ms, then shows a small native indicator with Loading text; reduced motion uses static text only. Ready content replaces it immediately. Session restoration uses the same component and Opening Potluck label. No artificial minimum time or entrance animation was added.

`useResource` exposes its existing path/user identity as `loadingKey`. Explicit and spread `ResourceState` consumers use that identity to restart the feedback timer when the resource changes. Bill-summary month/scope changes also restart it. The existing fetch, session, authorization, retained-data and error/retry logic is unchanged. Explicit action/provider progress is unchanged. Skeleton-only variants, shapes and theme color were removed after source/config/test searches found no remaining consumers; the reduced-motion hook remains because the people sheet uses it.

Figma's existing three examples now have blank initial content: Circles `2182:44978`, Cards `2182:45048`, Bills `2182:45109`. Delayed counterparts are `2187:46411`, `2187:46453`, `2187:46495`. They use instances of new source `2187:46405` in set `2187:46410`, with reduced-motion source `2187:46408`. Typography, color and spacing bind existing tokens. Header/navigation/action instances and geometry were retained. The old skeleton set `2181:46350` and six variants were removed only after `getInstancesAsync` confirmed zero remaining references. Initial/delayed Bills renders confirmed a clear canvas and centered minimal feedback.

New timer tests cover cancellation before the deadline, one reveal at 500 ms, and independent subsequent requests. The actual component's initial render is empty. Existing summary tests retain month/view controls, failure/retry and authorized totals; no empty result or fabricated zero replaces pending data. New tests were observed failing before production changes, then passing. Mobile suite: 50/50; backend/domain: 47/47. Formatting, lint, strict types and all-platform exports passed. Full validation exits unsuccessfully only for the unchanged mobile audit findings described above.

Browser evidence: all four populated tabs and Bills month navigation at 430×932; ignored harness using the actual component confirmed a 100 ms request has no loader, pending feedback appeared at 508 ms, resolution removes it immediately, and a new request starts blank. No production test route, dependency or API bypass was added. The fresh independent review reported no actionable findings and independently passed 8/8 focused tests. Limitation: mounted lifecycle behavior was checked manually in the harness, not through a committed DOM test runner; physical-device and native screen-reader timing remains unverified.

Rollback only this follow-up commit to restore skeleton loading in code, without reverting prior navigation/sheet/empty-state fixes. No database or native-binary change is involved in this follow-up. Figma rollback is separate: restore the removed skeleton sources/instances through version history and remove the recorded delayed examples/source set. Keep the draft PR unmerged.
