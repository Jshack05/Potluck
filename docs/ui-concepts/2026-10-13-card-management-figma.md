# Card management and Trusted Spenders — Figma handoff

Date: October 13, 2026. Status: designs authored; supported app scope implemented on `codex/card-management-flow`. Operational spender changes and physical-device acceptance remain deferred.

## Delivered design

[Open Manage arrangement](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2412-46435). The prototype starting point is **Card management and Trusted Spenders**.

| New composition              | Figma node   | Intended app location                    |
| ---------------------------- | ------------ | ---------------------------------------- |
| Manage arrangement           | `2412:46435` | Existing `/manage/cards/[id]` menu       |
| Change Circle                | `2412:46539` | Connection editor in the same route      |
| Close card                   | `2412:46632` | Confirmation in the same route           |
| Cards after last Card closes | `2417:47063` | `/cards`, reusing empty state `766:3012` |

Thirty-eight existing host-side role screens were refined in place for Apartment and Family Cards: people, active/pending permissions, person selection, invitation review/sent, editing limits, permission results, pause/restore and removal. Existing IDs and invitation-state logic are retained. No second invitation implementation was created.

The [machine-readable mapping](../flow-audit/2026-10-13-card-management-mapping.json) records sources, screen variants, entry points, prototype variables and verification evidence.

## Flow and reusable sources

Settings → Manage arrangement → Trusted Spenders → existing person or Invite trusted spender → person selection → review access → invitation sent → Trusted Spenders.

Existing-person branches reuse permission editing, pause, restore and remove flows. Invitation accepted, approval pending and active access remain distinct. Circle membership does not grant Card access.

People Back uses its recorded origin: management, settings or Card detail. In the app, review Back returns to permission editing, then the person picker; Cancel returns to People. This preserves the editable draft. Figma destinations are not translated indiscriminately into router pushes.

The Circle editor starts with the saved choice. Cancel discards the draft. Save changes only that Card's example association and member summary. Apartment and Family selections remain independent. The personal choice uses the existing person icon. Circle creation remains separate: no competing creation screen or unverified return link was added.

Shared sources include the existing 88 px Card context, 104 px miniature variants, header/back, primary CTA, Cards navigation, Circle rows, role rows and icons. New action-row source `2411:48076` exposes icon, title and detail properties, using existing semantic variables. The screens use editable component instances, Inter typography and the existing 20 px icon inset.

**Close card** is the approved wording. Confirmation provides Keep card and Close card. The new outcome illustrates an eligible last-card closure with the existing No cards yet state. It is not a simulation of settlement, refunds or provider closure. Actual closure must remain server-confirmed and preserve eligibility, active-Bill restrictions, authorization, audit records and history.

## Verification and limits

- Composition screenshots reviewed for management, Circle selection, closure, key invitation/permission states, pause/removal, settings and Family identity.
- Read-only structural evaluation covered 42 screens and 52 referenced destinations, with no missing destinations.
- Twenty-four action-state checks passed for management entry, Card-specific navigation, Back origins, invitation returns, Cancel/reset, independent saved choices and closure destinations.
- No horizontal text overflow was detected in the 38 refined host-role content areas after wrapping corrections.
- These checks evaluated saved Figma reactions. They are **not** a live presentation click-through or affected-phone test.
- Long names, accessibility scaling, empty Circle choices, native gestures and asynchronous app errors remain acceptance work.
- No app code, API, migration or dependency changed. App tests/builds were not rerun for this design task. No commit, push or merge was performed.

## Deferred profile History

Joseph requested a section reached from profile/You showing past Circles, Cards and associated Card transactions. This is recorded in PRODUCT_CONTEXT.md only. No History screen, navigation item or app feature was added. A later approved design must define retained-record access without exposing other users' private activity.

## Product purpose and next phase

This serves the Card Host with a clear place to manage association, access and closure. It belongs to the core experience; essential access and safety are not paywalled. Existing invitations support acquisition, and reliable administration supports retention. Successful management completion and fewer abandoned return journeys are the primary measures. This does not reopen paid plans or financial launch scope.

The [approved app plan](../superpowers/plans/2026-10-13-intuitive-back-and-card-management.md) was executed against these sources, within its verified backend boundary.

## App execution evidence

Implemented from live source inspection: management `2412:46435`, Circle editor `2412:46539`, closure `2412:46632`, outcome `2417:47063`, People `1606:19916`, picker `1606:20151`, permission editing `1606:20515` and invitation review `1606:20227`. Existing Card context source `2351:47499` and action row `2411:48076` are shared components. Runtime content uses actual Card, person and Circle data.

- `CardManagement` owns only Card presentation and local `menu | connection | close` state. The compatibility route retains distinct Bill/Circle behavior. Commands, permissions, versions, idempotency and audit records remain server-owned.
- `CardContext`, `CardActionRow`, Circle choices and people/permission rows are reusable. Merchant controls reuse the same identity without changing their saving contract. A role badge requires a known role; nonownership does not imply spending rights.
- A connection draft snapshots its version and saved selection. Back/Cancel discards it; failure preserves it. A former Circle that can no longer be read still has a Change Circle entry so its owner can disconnect it.
- Ordinary explicit returns use Expo's installed `dismissTo`; local Back wins. Successful closure alone resets the root stack to Cards, preventing completed management screens from surviving when Cards was absent from history. Closing waits for the API; the brief notice independently verifies closed state. No database or API contract changed.
- Invitation state is scoped by signed-in user and Card. Header/native Back at the picker returns to People; review/permissions Back retains input. Cancel clears person/amount/error. Unsupported send remains disabled and cannot produce a sent result.

### Verification performed

- Baseline existing functional checks passed; one intentionally new RED context test was added while the first run was still executing, so that initial run is not described as an entirely green baseline.
- Full `npm run validate`: **56 backend/domain tests and 138 mobile tests pass**, formatting, lint, strict types and iOS/Android/web exports pass. Backend dependency audit: **0**. Mobile dependency audit remains **23 (3 moderate, 19 high, 1 critical)**, including the pre-existing critical `shell-quote` finding. No lockfile/dependency changes; this is not a passing release-security gate.
- New real-database lifecycle coverage proves owner-only access, accepted Circle membership, null disconnection, stale versions, duplicate requests, active-Bill closure rejection, active-list removal, preserved merchant controls/history and persisted audit records after database reopen.
- Regression tests cover local/native Back, repeated returns, draft identity changes, unreadable former Circles, in-flight closure, and the actual installed Expo StackRouter after completion. Existing Bill/Circle and bare-native-text tests remain intact.
- Production web export exercised in Edge at 430×932 and 320×600 against the local API with isolated QA identities. Checked saved Circle changes, Cancel/reset, three Manage → People → Invite → Back cycles, real Circle-member selection, custom amount preservation on Back, disabled sending, and server-confirmed closure. No page exceptions or horizontal overflow. Small-screen content and footer actions were reachable by scrolling. Screenshots reviewed for management, populated Circle choices, closure, permission editing and review, including a long full name.
- The web check served the export under the approved localhost origin and granted local-network permission only to the temporary test browser context. It changed neither API CORS nor the user's browser permissions. API and Expo servers remained running.
- One independent final review's four P2 findings and role-inference finding were fixed with RED/GREEN regressions. Physical iPhone/Android gestures, keyboard and accessibility text scaling remain unverified; browser and mocked-native checks do not substitute for them.

### Deferred work and design gaps

The API currently supplies no usable spender invitation/person-permission/pause/revoke contract. Sending invitations, saved individual monthly limits, person-detail/outcome/pause/restore/remove screens are therefore deferred. No fabricated people, permissions, balances or Figma example amounts become production data.

A read-only search of the current Screens page and inspected role frames found no verified empty/unavailable spender counterpart or custom amount-input composition. Existing truthful empty/unavailable copy and the existing custom input remain; no replacement screen was invented. Those variants need approved Figma sources before redesign. Profile History stays recorded only. Broader audit, unrelated creation/Bill navigation and financial provider activation are unchanged.

### Delivery and rollback

Pre-implementation design/docs checkpoint: `85eb5ed`, pushed as `codex/backup-before-card-management-2026-10-13`. Implementation branch: `codex/card-management-flow`, based on `codex/merchant-controls-and-card-stability` (`1ee82a5`, PR #6). The new PR is stacked on that unmerged branch and must not be merged automatically.

Rollback by reverting this branch's focused implementation commits, or run the preserved backup branch. Keep existing database records and migrations: rolling back the UI must not reopen a closed Card, undo a saved Circle connection, erase merchant controls, or delete audit records. No migration/backfill or provider setup was added.

Execution decisions: use PowerShell for the local task ledger because the bundled Bash helper is unavailable; validate return origins with `card|settings|manage` as navigation metadata only; retain existing unavailable UI where no approved counterpart exists; use a completion-only stack reset because `dismissTo` cannot clear prior Card routes if Cards was absent. Their respective costs if wrong are reproducing the task log, correcting a destination mapping, reworking those deferred variants, or restoring a different post-closure navigation history. No minor code-review findings were left deferred.
