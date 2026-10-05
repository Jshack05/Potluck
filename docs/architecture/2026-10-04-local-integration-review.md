# Local integration review and delivery record

This is a local continuation of the full Potluck plan. It is not completion of its provider, hosted-release or full legacy-screen milestones. Work is isolated on `codex/full-potluck-integration`; the original checkout and Figma file were not altered by this implementation.

## Implemented connections

Circles, Cards, Bills and Splitfinder share one API-owned local identity and persistent database. Accepted Circle membership, a Bill agreement, a listing conversation and a Card setup are independent records with separate permissions. Public discovery uses persisted listings; financial success is never simulated. Source Figma tokens, navigation and assets are translated into responsive native controls.

The implementation includes invitations, Circle administration and accepted hosting transfer, resource connections, versioned Fixed/Flexible Bill offers, equal/custom allocation, personal caps, accept/decline/cancel, host change notes, current/proposed review, local Bill planning, unissued Card setup/closure, brand-only search, individual listings, checkpointed publishing, saved items, profiles, request acceptance into conversation, separate Circle invitation, message retry/history, blocking/report records and local Inbox.

## Independent review disposition

One fresh reviewer inspected the complete implementation range `7c32647..d09a5f7`, ran the backend tests and reproduced defects. The author performed one fix pass with failing regression tests before implementation and complete validation afterward. No second review was substituted for testing.

| Finding | Severity and ruling | Resolution |
|---|---|---|
| Stale terms edit overwrites a newer Card connection | Important, confirmed | Require terms and connection versions; increment connection version when a revision changes it. |
| Card-only Bills disappear from contributor Shared view | Important, confirmed | Return a safe `isShared` flag while withholding the private Card ID. |
| Blocking bypass through new Bill offers | Important, confirmed | Check both directions of blocking before create/revise; preserve existing agreement access and cancellation. |
| Interrupted listing publication duplicates a created listing | Important, confirmed | Persist workflow identity, pending command and acknowledged ID/version; resolve uncertainty before applying later edits. |
| Equal Flexible split becomes unequal after estimate rounding | Important, confirmed | Preserve equal weights independent of estimate cents; use deterministic occurrence rounding. |
| Cap wording suggests partial payment up to the maximum | Important, confirmed | Record stop-if-exceeded semantics and explain that the entire contribution stops. |
| Accepted amount shown with proposed frequency | Regraded from Minor to Important: misleading consent information | Render the frequency from the chosen agreement snapshot. |
| Typing during send loses the newer draft | Regraded from Minor to Important: loss of user input | Clear only the exact submitted draft; preserve newer text on success, failure and retry. |

The pass also completed the review’s local gaps: Circle/Card restoration, contextual creation destinations through sign-in, contributor-controlled caps, current/proposed comparison, host notes, decline explanation and cursor-based older messages. The existing lower personal cap is the review default; raising it requires an explicit accepted choice.

## Areas the reviewer could not establish

- **Live financial adapters, callbacks and settlement:** remain unavailable. No issuing, bank linking, funding, authorization response or settled balance is invented.
- **Hosted PostgreSQL contention and production database controls:** local PGlite tests do not prove these. Test separately against the hosted database with least-privilege roles and production-like concurrency.
- **Supabase/Apple, recovery and production revocation:** the verified-user adapter is preliminary. Local sessions revoke correctly; hosted revocation now fails explicitly until configured.
- **Native device, keyboard, screen-reader and complete Figma parity:** browser evidence and exports are available; native testing and the full remaining screen audit are open.
- **Private housing media, verification, moderation and legal operations:** require configured services and operating decisions; housing remains private at the publication gate.
- **Dependencies:** the release audit fails. A compatible scoped `xcode` UUID override removes eight findings; `braces`, `node-forge` and the current routing dependency chain still contribute 22 audit findings. Do not force an incompatible Expo downgrade or equate a successful export with a secure release.
- **Paid entitlements and managed spenders:** deliberately unavailable under current scope/program constraints, not accidentally omitted working features.

No independent-review findings are silently dismissed. The capability register separately lists unfinished local implementation work so that it is not mislabeled as a provider dependency.

## Verification and migration

Final check set: 30 backend/domain tests; 21 mobile/model tests; backend formatting; both strict type checks; mobile lint with zero warnings; iOS/Android/web JavaScript/assets export; backend and mobile dependency audits. All functional checks pass. Backend audit has zero findings; mobile audit has 22 (19 high, 3 moderate), so `npm run validate` exits unsuccessfully on the audit. `validate:local` explicitly excludes audits and is not a release gate.

Browser checks used disposable local QA accounts, at 430×932 and 320×760: discovery and brand search, contextual sign-in, listing request declaration, host conversation acceptance, local messages, separate Circle invitation affordance, Circle-to-Bill/Card links, individual Bill acceptance, contributor Card privacy, restored Circle/Card drafts, and current/proposed terms with preserved personal maximum. No signed physical-device or live provider test was performed.

Migration `0005_contributor_caps.sql` changes only the agreement cap constraint so a Flexible contributor can choose a lower hard cap than the estimate; Fixed shares remain constrained. No accepted records are rewritten. Keep this forward migration during a code rollback and preserve consent/audit records. Bill revisions additionally require `expectedConnectionVersion`; older clients must refresh/update before writing revisions.

The master plan remains active. Preserve this branch/worktree and its local development database for continuation; do not merge, deploy, activate finance or claim release readiness from this checkpoint.
