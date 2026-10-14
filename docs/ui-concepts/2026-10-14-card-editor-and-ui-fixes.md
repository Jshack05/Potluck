# Edit Card and shared UI corrections — October 14, 2026

## Implemented scope

The Card pencil opens the approved, prefilled Edit card screen. Save updates name/design on the same Card; Cancel, header Back and native Back return to that Card without saving. The three-line menu still opens Card settings. Editing uses the existing catalog, preview, category picker, Field, Shell and durable command machinery. The edit presentation shows the real profile name; Figma fixture identity is never stored.

Creation-menu descriptions now state the action directly, including “Create a group to share cards and bills.” A shared Toggle uses the approved off-track color and iOS background across Circle, Bill, Goal and listing-consent consumers. Circle creation restores the source layout, hidden bottom navigation, hero, placeholder field and section sizes; the overview groups people and uses Figma's round add actions and exact empty-state illustrations. The anonymous-Circle invitation restrictions, pending-person semantics and existing draggable people sheet remain intact.

The pencil now uses the existing simple Figma vector. A shared AmountField fixes large-text clipping through explicit line height, padding and font-scale-aware minimum height. Fund Card and Goal contribution inputs reuse it. The existing Bill money input already provides sufficient line-height metrics and was left intact.

## Current Figma sources

File: `1hAy3kcZAEvqq8ZNjKU7CD`. Sources were inspected live before implementation.

| Surface                         | Source                | Implementation                                      |
| ------------------------------- | --------------------- | --------------------------------------------------- |
| Edit card                       | `2448:47287`          | `/card/[id]/edit`, CardEditor and shared picker     |
| Combined creation picker        | `854:3466`            | Existing 33-look catalog, unchanged saved IDs       |
| Create Circle / selected people | `335:506`, `542:1632` | `/create/circle`                                    |
| Add people                      | `488:1134`            | Existing AddCirclePeople / SheetSurface             |
| Circle overview                 | `218:314`             | `/circle/[id]`                                      |
| Empty Bills / Cards             | `450:785`, `463:847`  | Exact illustration SVG exports                      |
| Off toggle                      | `424:650`, `343:568`  | Shared Toggle; off track `#D2D9D7`                  |
| Pencil                          | `619:2448`            | Existing vector, white stroke on Card               |
| Fund Card                       | `1151:5189`           | Shared large AmountField                            |
| Creation menu                   | `199:317`             | Existing composition with approved copy corrections |

No Figma writes or invented screens were needed. The existing Circle icon-color picker has no verified counterpart in this review; it is retained unchanged and recorded as a design gap. This does not claim completion of the broader Figma audit.

## Persistence, permissions and rollback

`POST /v1/cards/:id/appearance` validates name, catalog design and expectedVersion. It requires authenticated Host ownership and the currently supported unissued setup state, including authorization rechecks before idempotent replay. Row locking/version checks reject stale writes. Name, design and version are the only updated fields. The audit event records prior/resulting appearance atomically.

Tests cover unauthenticated/non-Host rejection, malformed input, missing design, closed Card, stale version, replay, conflicting retry payload, rollback and preserved associations/financial fields. Financial execution, issuer controls, banking and spender consent are unchanged. No schema migration or provider configuration is required. Rollback is a code revert; previously saved metadata and immutable audit records remain.

The mobile app now declares its already-used local `@potluck/contracts` package. The first export exposed that missing dependency declaration; this adds no external library.

## Verification

- Full gate: `node .local/tooling/npm-cli/package/bin/npm-cli.js run validate` (local npm distribution).
- Backend formatting and strict types passed; **58 domain/integration tests passed**.
- Mobile lint and strict types passed; **143 tests passed**.
- iOS, Android and web exports passed.
- Backend dependency audit: **0 vulnerabilities**.
- **Full gate failed only the mobile dependency audit:** 23 existing findings (3 moderate, 19 high, 1 critical, including shell-quote). No suppression or forced dependency upgrades. Prior PR #7 records the same counts.
- Independent review found native Back could use unrelated history. Fixed with explicit return to the edited Card and a passing regression test.
- Browser QA used a separate synthetic local account and Card. At 430×932: pencil/editor prefill; name and design Save; same Card ID; persisted values on reopening; See all expansion; Cancel discarding edits; menu/settings separation; Circle creation, anonymous settings, Add people expansion/dismissal and empty overview. Console error log was empty.
- The editor and funding amount were inspected at 430×932 and a narrower 375×812 viewport. Authenticated direct entry into Edit card and its Back return to the same Card were verified. Shared amount tests cover font scales 1, 1.5 and 2; Circle creation remains scrollable at the narrower size.
- Actual iPhone keyboard, VoiceOver and native gesture/rendering acceptance remain pending. Browser and unit checks do not prove affected-phone behavior.

Evidence logs and screenshots are local ignored artifacts in `.superpowers/sdd/2026-10-14-card-editor-and-ui-fixes/`. The branch remains unmerged.
