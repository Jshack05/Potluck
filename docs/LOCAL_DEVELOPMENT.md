# Full Potluck: local development

## October 8 Cards recovery follow-up

The [Cards source register and execution record](ui-concepts/2026-10-08-cards-recovery.md) describes the focused Figma recovery branch. Final validation passes formatting, lint, both strict type checks, **47 backend/domain and 56 mobile tests**, and iOS/Android/web exports. The full gate fails only the unchanged mobile dependency audit: **23 findings (3 moderate, 19 high, 1 critical)**; backend audit zero. Live browser and physical-phone visual acceptance remain outstanding after Expo startup was rejected by automatic approval review. No native build or OTA update was published. No database migration or provider integration was added.

## October 7 blank-first loading follow-up

The approved follow-up removes skeletons in favor of blank initial content and minimal feedback only after 500 ms. Existing resource data stays visible during refresh; changed resource identities restart the delay. The shared session-restoration state uses the same timing. No native configuration, dependency, backend, provider or schema change is part of this follow-up, so an existing compatible development binary only needs a JavaScript reload.

`node scripts/validate.mjs` passed formatting, lint, strict types, **47 backend/domain tests, 50 mobile tests**, and iOS/Android/web exports. The full command still fails only the pre-existing mobile dependency audit: **23 findings (19 high, 3 moderate, 1 critical)**; backend audit zero. No dependency declarations or lockfiles changed.

Browser checks exercised all four populated home tabs and Bills month navigation at 430×932. A temporary ignored browser harness mounted the real `LoadingFeedback`: a 100 ms completion produced no indicator; a pending request began blank and displayed feedback after 508 ms in that run; resolving it removed the indicator immediately, and a subsequent request began blank again. This is component/browser evidence, not a physical-device timing guarantee. Figma initial/delayed states were checked through metadata and renders. Fresh independent review found no actionable issues and independently passed the eight focused loader/shell tests. Physical-device and native screen-reader verification remain pending. See the [follow-up record](ui-concepts/2026-10-07-ui-stability.md#blank-first-loading-follow-up).

## October 7 shared UI stability verification

The [UI stability record](ui-concepts/2026-10-07-ui-stability.md) documents shared navigation/header controls, stationary sheet backdrops, persistent Bills scopes, original empty states, enlarged import action, removal of Goals from Cards, and reusable loading states. Authentication and optional-bank boundaries are unchanged.

Final `node scripts/validate.mjs` execution (with `npm_execpath` pointing to an integrity-verified temporary official npm CLI) passed backend formatting, backend/mobile strict types, mobile lint, **47 backend/domain tests, 46 mobile tests**, and iOS/Android/web exports. Formatting of every changed mobile file also passed. The full command exits unsuccessfully only for the existing mobile dependency audit: **23 findings (19 high, 3 moderate, 1 critical)**; backend audit zero. No dependency or lockfile changes were made. Do not describe this as a green release gate.

Browser verification covered populated/empty data, both Bills scopes, four-tab chrome, original artwork, the import entry, and people-sheet dismissal/reopening at 430×932 and 320×600. The independent code review identified Android resize behavior and disappearing month controls; both were reproduced by regression tests and fixed before this final run. Physical-iPhone/Android keyboard, animation and large-text checks remain pending.

Android now requests `adjustPan` through Expo configuration. An installed Android development binary needs rebuilding/reinstallation for this native manifest change. This task changes no iOS native settings. Local Expo/API servers were reused; no production provider operation was performed.

## Authentication validation repair

Local sign-up and sign-in show server-validated name, email and password errors beside the affected fields with a visible border and accessible error text. Submit stays available to explain missing entries; only an in-flight request disables it. Editing a field clears its previous error, and switching forms clears stale errors. Registration requires a name, a complete email address such as you@example.com, and a 12–200-character password. The API remains authoritative; no test login or bank bypass is introduced.

This Free/core repair serves new and returning users: understand what to correct and continue into Circles or Splitfinder. It protects invitation activation and recurring access, with no paid conversion gate or new competitive feature. Measure successful account-entry recovery. No migration, new dependency or provider configuration is required; reverting the changed files restores the prior UI without touching accounts or sessions. Regression tests cover invalid input, corrected registration, wrong passwords, duplicate accounts, revoked sessions, social access and financial gating.

October 6 verification: browser checks at 390×844 and 320×600 confirmed the `test@gm` email error, red field borders and accessibility associations, clearing errors on edit and form changes, blank-name registration validation, scrollable fields, and bottom actions. Corrected registration opened Circles and Splitfinder while Cards retained the bank prompt. The check caught and fixed an empty-string child in the shared Field error conditional; repeating the interactions produced no browser console errors. Physical-iPhone display, keyboard timing and native screen-reader behavior remain unverified.

The full validation command passed 36 backend/domain tests, 26 mobile tests, formatting, lint, type checks and all-platform exports, but failed the mobile dependency audit: **23 findings (19 high, 3 moderate, 1 critical)**. The critical finding is the existing `shell-quote` dependency ([GHSA-pqg4-j6r4-53mv](https://github.com/advisories/GHSA-pqg4-j6r4-53mv)); the backend audit reports zero. No dependencies or lockfiles changed in this repair. npm was available through `pnpm dlx npm@11 run validate`; the missing shell command did not prevent running the audits. Authentication verification does not establish release readiness.

## October 5 iPhone build checkpoint

EAS development build [`0cd6df49-87b0-48f9-884b-ebae6f0c71d7`](https://expo.dev/accounts/potluck_splitfinder/projects/jshack05/builds/0cd6df49-87b0-48f9-884b-ebae6f0c71d7) finished successfully from application commit `78df449`. The native logs include RNCAsyncStorage 2.2.0, ExpoSecureStore 57.0.4 and ExpoCrypto 57.0.3. It reuses the existing app identifier, signing credentials and registered iPhone. An earlier attempt failed at Expo's credential service; the retry succeeded without code changes or replacing credentials.

The updated build still needs installation and startup verification on the physical iPhone. JavaScript reloads cannot add native libraries to an older installed app. Install this development build, keep the computer's Expo server running, and select its LAN address in the development launcher. No TestFlight or App Store submission was performed.

For this session, the API is bound to the computer's Wi-Fi IPv4 address, and the ignored `my-app/.env.local` points `EXPO_PUBLIC_API_URL` to that address on port 4100. Expo was restarted on port 8083. The host health check and browser sign-in through the LAN address passed; phone-side connectivity remains to be confirmed. No firewall changes were required. If the computer's address changes, update the local environment and restart both servers. Retain loopback as the versioned default.

## October 5 entry policy

The full-app build requires sign-in. Circles, Splitfinder, invitations, Card setups, manual Bills, agreement review/cancellation and Goal planning work without a bank. Cards and Bills use their original illustrated empty states and shared creation menu. Bank-powered actions preserve their destination through contextual bank setup. The local API has no bank provider configured: `/onboarding` returns `bank_required` / `unavailable` for financial readiness. An explicit method-and-route allowlist opens owned planning resources; unknown/provider routes remain bank gated, with resource checks still required. Card activation and actual financial execution remain unavailable. No fixture bank is reported as real.

Integration tests cover account-only planning, guest/resource rejection, provider failures, invalid actor-bound proof and blocked activation. Historical tests may inject provider fixtures; new planning tests run without them. No runtime flag, development button or client callback bypasses financial requirements. Real linking, verified provider proof persistence/reconciliation, and physical-iPhone validation remain unfinished.

Restoration migrations 0006–0009 add Circle settings, Goal draft storage, Card appearance choices and Bill planning metadata. Defaults preserve prior rows; no financial/audit records are deleted. Back up the stopped local database before migrating. Revert presentation code without dropping the new tables or removing saved arrangements. Provider activation must preserve essential agreement cancellation/dispute access.

This branch connects the existing Expo app to a persistent local Potluck API. It is a development environment, not an activated financial program or public release.

## Start

Use Node 24. Run `npm ci` at the repository root, then `npm ci --prefix my-app`. Copy the safe values from `.env.example` and `my-app/.env.example` into your shell/environment as needed; never commit private configuration.

Run `npm run api` in one terminal and `npm --prefix my-app run web` in another. The API defaults to port 4100 and the Expo client to port 8081. Local accounts are created in the app. Records persist in `.local/potluck-db`; the mobile device stores its session in SecureStore. Web sessions are intentionally memory-only, so a full page reload requires signing in again.

Optional disposable QA data: `node tests/e2e/seed-local.ts`. It refuses a nonlocal API and creates clearly labeled QA accounts/listings. Its development-only password is in the fixture source. Never run these fixtures against a hosted deployment. Existing unrelated records are preserved.

For a physical development device, configure `EXPO_PUBLIC_API_URL` to this computer's trusted-LAN address and deliberately bind the local API to that interface with `API_HOST`. Keep it off the public Internet. SecureStore and Crypto require a new Expo development binary. The existing bundle ID and Expo project are retained; this branch has not been tested in a new signed iPhone binary or distributed to TestFlight.

## What the local records mean

- A Circle invitation grants Circle membership only.
- A listing acceptance opens a conversation only. Sending a Circle invitation is a separate action.
- A Bill offer records the exact amount, maximum and schedule for individual acceptance. Contributors can choose a lower personal cap; a revised review defaults to the lower existing cap. An exceeded cap means no contribution, not a partial payment. Accepting terms does not authorize a bank debit. Changed offers do not replace previously accepted terms until accepted.
- A Card is a saved setup shell, not an issued card. There is no synthetic available balance, credential, transfer, payment or settlement.
- Local email/password identities are development identities. Hosted authentication, verification, delivery and financial providers require separate configuration and validation. Local invitations and notifications appear in Inbox; no email or push delivery is claimed.
- Housing drafts remain private until a supported verification flow is connected. Brand marks identify community listings and do not establish a partnership or sharing eligibility.

## Database, migration and recovery

Versioned SQL migrations run transactionally on startup. PGlite supplies local PostgreSQL semantics; the deployment adapter uses `pg`. Production mode refuses local identity and an in-process database. The `potluck` schema is private and public privileges are revoked. Before hosting, provision separate migration and least-privilege application roles, private network access, encrypted storage, backups and monitoring. Do not expose this schema through a public data API.

Stop the local API before backing up its complete `.local/potluck-db` directory. Restore into a separate directory and set `DATABASE_URL` to that directory path. The restart integration test validates persisted records and sessions across reopen; it does not certify a hosted backup system. Do not delete or rewrite existing migration history. Add a forward corrective migration if needed; retain audit and financial history.

Migration `0005_contributor_caps.sql` allows a contributor’s Flexible Bill cap to be below the planning estimate while retaining the Fixed Bill invariant. It rewrites no records. Reverting that constraint would reject valid accepted terms: keep the forward migration and disable new acceptance in a rollback, preserving existing records. Terms revisions now require both terms and connection versions; old clients may read but must update before revising.

Circle/Card/Bill/listing drafts are stored per user on the device. Interrupted creations and listing publication retain their command identity and acknowledged resource before continuing. Clearing browser/app storage removes local drafts; it does not delete server records. Hosted sign-out explicitly reports an unconfigured-revocation error instead of claiming a session was revoked.

## Release boundaries

Live financial activation needs written approval for contributor-owned banks → host-owned balance → agreed Bill allocations → separately approved spending credentials → merchant payments. Provider verification, transfer authorization, settlement, returns, disputes, controls, secure credential display and reconciliation cannot be replaced by a checkbox or local state.

Hosted email/Apple authentication and recovery, private media storage, external message delivery, universal-link hosting, production operational review and physical-device testing remain release dependencies. Consult the capability register for implementation status rather than interpreting four visible tabs as a finished financial product.

## Validation

`npm run validate` is the single full gate: formatting, strict types, mobile lint, domain/integration/mobile tests, iOS/Android/web export, and dependency audits. It runs every check and exits unsuccessfully if any fail. `npm run validate:local` runs the functional checks and exports only; it does not establish release security. Dependency audit findings are recorded as release blockers, never suppressed by skipping tests or forcing an incompatible SDK downgrade.

The backend executes TypeScript directly on Node 24; the mobile export is a JavaScript/assets production bundle, not a signed iPhone/Android binary. PostgreSQL deployment, Supabase account flows, native devices and financial providers need their own validation.
