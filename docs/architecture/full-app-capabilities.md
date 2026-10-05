# Full-app capability register

## October 5 revised access policy

Sign-in opens Circles and Splitfinder. Bank confirmation gates Cards and Bills only, including direct financial links and server mutations. Their tab prompts and the Circles empty home reuse the existing Lucky/table Figma assets; actions stay above navigation. Bank setup no longer traps users outside social features. There is no native dependency change, schema migration, bank simulation or financial activation. Earlier snapshots below are historical.

Circle details now keep people and invitations separate from financial projections. `GET /v1/circles/:id` retains empty `cards`/`bills` arrays for response compatibility; the client reads financial summaries through `GET /v1/circle-arrangements/:id`, which requires bank confirmation, Circle membership and the existing per-resource permissions. This also keeps Circle coordination available during a bank-provider outage. Regression tests cover guests, unbanked members, confirmed members, hosts, unrelated users and provider failures. Independent review rechecked this boundary after the fix.

Validation: formatting, backend/mobile strict types, mobile lint, **34 backend/domain tests + 26 mobile/model tests**, and all-platform exports passed. The unchanged dependency audit reports **22 mobile findings (19 high, 3 moderate)** and zero backend findings, so the release security gate remains blocked. Browser review at 430×932 and 320×600 checked original artwork rendering, centered copy and bottom actions, signup/sign-in directly to Circles, Circle creation without a bank, Circle-to-Bill destination preservation, bank-tab prompts, and navigation back to Splitfinder. This is browser and local-service evidence, not physical-iPhone or real-provider verification.

## October 5 native build checkpoint

The updated signed iPhone development build completed successfully on EAS: [`0cd6df49-87b0-48f9-884b-ebae6f0c71d7`](https://expo.dev/accounts/potluck_splitfinder/projects/jshack05/builds/0cd6df49-87b0-48f9-884b-ebae6f0c71d7). Native storage, secure session storage and Crypto are included. The computer's LAN API and browser sign-in were checked. Physical-phone installation, startup and phone-to-API connectivity are still pending; bank linking remains unavailable. This supersedes earlier statements that the signed build itself is unfinished, but does not establish native runtime verification or release readiness.

## October 5 earlier correction (entry policy superseded above)

Full-app entry is now **account → bank → app**. The shared generic guest screens have been removed; authentication and bank setup use Figma source elements with bottom actions and no app tabs. Core Inbox uses its own teal asset. This does not establish full Figma parity for the remaining screens.

The API independently requires sign-in and actor-bound provider confirmation for protected app routes. Its current provider adapter is unavailable, so local accounts stop at bank setup. The tests supply provider fixtures only inside the test process. No bank link, verification, debit permission or card activation is fabricated. The earlier capability/validation snapshot below is historical; native installation and real bank linking remain unverified.

October 5 verification: backend formatting, both strict type checks, mobile lint, **32 backend/domain tests and 24 mobile/model tests**, and iOS/Android/web JavaScript/assets exports passed. The full `npm run validate` command still exits unsuccessfully because of the existing **22 mobile dependency findings (19 high, 3 moderate)**; backend audit reports zero. No dependencies were added or audits suppressed by this correction.

Browser QA confirmed Bills deep-link preservation through sign-in and bank setup, unavailable-bank retry, sign-out, and scrollable account fields with bottom actions at 430×932, 320×760 and 320×600. These dimensions are browser checks, not physical keyboard/device verification. Independent review identified and rechecked an expired-session recovery fix: a confirmed 401 clears identity, while network failures do not masquerade as session revocation. The review approved this correction's scope; the broader Figma alignment, signed phone build and provider integration remain unfinished.

Snapshot: October 4, 2026, after the local implementation and one independent review/fix pass. Local records are real persisted development records. The full master plan remains in progress; this is not a public-release or financial-program approval.

| Capability | Current status | Remaining boundary |
|---|---|---|
| Four-tab shell, shared identity and Inbox | Implemented locally; browser checked at 430px and 320px | Physical-device and hosted validation |
| Local accounts, sessions, role authorization | Implemented; API tests | Real email/Apple account setup and recovery |
| Circles, invitations, separate membership | Implemented; API and browser checks | External invitation delivery |
| Circle privacy, leave/remove, hosting transfer, archive | Implemented; transfer and independent-ownership tests | Complete UI verification |
| Bill proposals, equal/custom shares, Fixed/Flexible maximum | Implemented; integer cents and role tests | Provider-specific variable-payment execution is separate |
| Individual accept/decline/cancel and revised terms | Implemented; personal cap choice, current/proposed comparison, host note, stale-consent and retained-history tests | Provider-specific payment authorization remains separate |
| Bill connection, end, month/week planning | Implemented; date tests | Payment occurrences/settlement require provider facts |
| Card setup and connection | Implemented; no issued credential or fake balance | Approved issuer program |
| Funding, automatic contributions and money movement | Unavailable, denied by server | Written approval, provider integration and lifecycle tests |
| Card controls, real-time authorization, ledger reservations | Not active | Documented provider identifiers, response codes, timeout/fallback and clearing behavior |
| Trusted Spender credentials | Unavailable | Separate issuer eligibility/grant/consent and secure display |
| Managed/minor spenders | Pending qualification | Explicit supported household/minor program; never inferred from an adult card |
| Goal/Pledge variants | Inventoried, not enabled | Accepted goal/final-payment specification and net-settled provider events |
| Brand directory, real listings, public profiles, saved items | Implemented locally | Public launch moderation and eligibility review |
| Requests → conversations → separate Circle invitation | Implemented; API and browser review | Push/email delivery and production abuse operations |
| Listing drafts/edit/publish/close | Implemented; checkpointed publish recovery and stable workflow identity | Production media storage and verification |
| Circle/Card/Bill drafts and contextual sign-in | Implemented; per-user restoration, intent preservation and deduplicated retries | Native termination/storage testing |
| Conversation history and failed sends | Implemented; cursor paging, preserved newer drafts and retry | Unread/delivery operations and external push |
| Housing publication | Drafts only | Real identity-verification adapter and private media/location handling |
| Reporting/blocking | Stored and enforced for interactions | Operational moderation owner and case handling before public launch |
| Bill import and external account data | Not connected | Source-specific consent, provider/import specification and deduplication |
| Plus/Premium | Deliberately not implemented | Explicit later approval; core remains ungated |

Changing a Circle connection does not grant a financial role. Circle hosting transfers do not transfer Cards, Bills or provider accounts. Removing membership never erases independent agreements. No module may fabricate provider state to make a downstream screen appear complete.

## Validation checkpoint

The final functional verification covers backend formatting, both strict type checks, zero-warning mobile lint, 30 backend/domain tests, 21 mobile/model tests and iOS/Android/web JavaScript/assets exports. The full release command remains unsuccessful because the mobile audit reports **22 findings: 19 high and 3 moderate**. Backend audit: zero. A scoped compatible UUID update reduced the mobile findings from 30; no incompatible SDK downgrade or audit suppression was applied. See [review and release record](2026-10-04-local-integration-review.md) for exact evidence and rulings.

Browser checks used disposable QA identities: guest category discovery, contextual sign-in, Circle invitation acceptance with private Card/Bill isolation, Circle-to-Bill creation, selecting an existing Card setup, individual agreement acceptance, accepted-share planning at 320px, restored Circle/Card drafts, host request acceptance into a conversation, local messages, and current/proposed Flexible terms with the previous lower personal cap preserved by default. These are browser observations, not native-device or financial-program certification.

Remaining work includes the full legacy authentication/import/role screen audit, production account recovery/Apple sign-in, private media and housing verification, unread/delivery operations, provider-backed occurrences and funding, and physical-device validation. No master milestone covering these is marked complete.

## Remaining local work, separate from provider approval

- Complete the full legacy Figma authentication, import, role and recovery inventory; verify remaining native layouts, larger text, keyboard behavior and screen readers.
- Complete unread/read receipts, notification routing/delivery operations and public launch moderation tools; currently messages and notifications are persisted locally and exposed in Inbox.
- Expand specified discovery/housing fields, supported private media and operational verification; draft housing is not a claim of complete residential UX.
- Expand API collection pagination beyond listings/message history and finish API response-contract coverage before a public-scale deployment.
- Finish specified Bill occurrence/reminder/import workflows and their source/consent specifications. Financial execution and reconciled history separately require an approved provider.

These are implementation work, not all external blockers. They remain in the master plan. The completed local continuation establishes the shared core and consent boundaries without claiming every historic Figma state is implemented.
