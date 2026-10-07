# Potluck app flow restoration review

Date: October 7, 2026. Branch: `codex/full-potluck-integration`. Baseline: `57f63a7`.

This work recovers the existing Potluck designs in the Expo app. Figma was read as the source, not modified. Splitfinder was not redesigned. The prior authentication repair remains intact: no change to `sign-in.tsx`; `client.tsx` adds only profile refresh, and the shared Field retains its error border and accessible message.

## Recovered flows

| Area            | Existing source and recovered behavior                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared creation | Figma `199:317` / component `185:198`: one consistent plus, four tinted rows, original icons. Accessible close control and bounded scrolling support compact screens.                                                 |
| Circles         | `7:423`, `335:506`, `542:1632`, `488:1203`, `488:1272`, `218:314`, continuation family `2019`: original home/create/detail, people sheet, invitation review/results, members, privacy, leave and host handover.       |
| Cards           | `854:3466`, `928:4751`, `854:3495`, `855:3408`, role family `1606`: details, eight appearances, Circle connection, review, saved setup, controls/activity/people/funding paths.                                       |
| Bills           | `714:2708`, `1052`, `1056`, `1330`, `1348`, `1480`, `1525`: manual/import source, identity/icon/color, calendar/schedule, people and allocations, Card connection, review, agreements, changes, history and ending.   |
| Goals           | `793:3211`, `793:3256`, `793:3292`, `793:3345`, `793:3386`, `794`, `801`, `812`, `839`: target/time planning, schedule, planned contributions, Circle/Card connection, review and saved plan/terms.                   |
| Account         | `652:2589`, `669` family: original grouped Settings, profile, banking, security, personal details, privacy, notifications, help and logout. Full-name editing persists; unavailable account capabilities are labeled. |

Assets are rendered inside native components; screenshots are not used as interactive screens. Bill and Circle asset folders include source records. Root assets `create-circle.svg`, `create-card.svg`, `create-bill.svg`, and `target.svg` come from the shared creation source; profile/search/divider assets come from the Settings family. Existing colors, font family, navigation icons and illustrations are retained.

## Access and financial boundaries

- Login is required; bank readiness no longer gates organization of owned resources.
- A Card setup is unissued. Card creation does not create credentials, balances, spending permission or a transfer.
- A self-only Bill with no agreement history saves as a private draft. It skips allocation and creates no contribution offers. Personal monthly plans remain separately labeled from accepted shares.
- Shared Bill terms still require individual acceptance. Changes do not silently replace existing consent.
- Goal records are plans only: no invitations, accepted agreements, outbox jobs or charging are created.
- Exact API method/route allowlists permit planning. Provider actions and unknown financial routes remain gated; ownership checks apply independently.
- Circle membership grants neither Card access nor contribution/spending permission.

## Review findings corrected

- Replaced remade creation forms with the existing page-by-page designs and interactive selectors/calendars.
- Removed main-tab slide transitions and moved navigation outside the keyboard-avoiding content container.
- Corrected private Bill Back/resume behavior, explicit disconnection persistence and planning summaries.
- Released creation drafts after definitive validation rejections while retaining immutable requests after uncertain failures.
- Removed duplicate exact-email people choices and limited empty-search suggestions to visible existing contacts.
- Added Goal pagination and verified foreign plans remain inaccessible.
- Fixed direct Security logout, profile-sheet scrolling, settings deep-link return destinations, web checked-state exposure and an empty-string Settings rendering warning.
- Verified the creation menu's accessible close dismisses the menu without selecting a row.

## Validation evidence

Final `node scripts/validate.mjs --local` exited 0. Backend formatting, API/mobile TypeScript, mobile ESLint, **47 backend/domain tests**, **39 mobile/model tests**, and iOS/Android/web exports passed. `git diff --check` passed. Logs: `.local/restoration-functional-final.log`.

The full validation command also ran with the official npm CLI. Backend audit: **0 findings**. Mobile audit: **23 findings (19 high, 3 moderate, 1 critical)** in the unchanged dependency tree. The full gate exits 1 because of the mobile audit; this is not release approval. Audit log: `.local/restoration-final-validation.log`. No project dependencies or lockfiles were changed.

Browser walkthrough at **430 x 932** and **320 x 600** covered:

- Account sign-in and destination restoration; original Circles and Bills empty artwork; main navigation and shared creation menu.
- Persisted Circle creation with a selected existing local account; recipient review, acceptance and resulting membership. Recipient did not inherit the host's Card.
- Card naming, appearance, Circle selection, review, persistence, setup details, funding review and contextual bank entry; no transfer was submitted.
- Manual $84 monthly Bill with calendar date November 1, saved without Circle, Card or bank; All bills showed its personal $84 November plan. Reopening preserved fields; private people-to-Card navigation and Back skipped allocation.
- Goal planning and persisted review/detail; amount, schedule, Circle and Card retained.
- Profile-name editing and restoration; Banking entry; logout from Security and Settings.
- Compact-screen sheet/menu layout and screenshot checks. Original SVG assets were checked after load, not only during their initial paint.

Local QA records are clearly prefixed `Restoration QA`; they contain no live financial data. Test accounts were signed out after review. Screenshot evidence: `.local/restoration-create-menu.png`, `.local/restoration-bills.png`.

Development hot updates produced earlier maximum-depth console errors; they did not recur during the final reloaded walkthrough. The Settings empty-text warning was reproduced and corrected. This is browser evidence, not a claim of physical-device testing.

## Remaining boundaries

- Physical iPhone/Android keyboard timing, safe-area behavior and bottom navigation need device verification. Navigation is structurally outside keyboard avoidance; browser sizing cannot validate native keyboard behavior.
- Banking, import suggestions, issuance, credentials, issuer-approved roles, authorization/settlement and real money movement require provider integration and program approval. The UI stops at their real availability boundary.
- Goal invitation/acceptance/charging, profile photos, usernames/contact changes, passkeys/MFA/recovery, account-wide privacy preferences and support/notification delivery remain unfinished local capabilities. These are not all provider blockers.
- The current people picker supports existing Potluck accounts. External email delivery and phone/username lookup are not implemented.
- Dependency remediation remains necessary before a clean release security gate.

## Migration and rollback

Forward migrations `0006` through `0009` add Circle preferences, Goal planning tables, Card appearance and Bill draft/visual metadata. Local migrations were applied after a backup to `.local/pre-restoration-db-20261006`. Reverting this UI must preserve stored arrangements, accepted terms and audit records; do not roll back by deleting tables or history. No provider or production configuration was changed.

Detailed domain notes: [Circles](../architecture/circle-flow-restoration.md), [Cards and Goals](2026-10-06-card-goal-flow-restoration.md), [Bills](2026-10-07-bill-flow-restoration.md).
