# Full Potluck: local development

## October 5 iPhone build checkpoint

EAS development build [`0cd6df49-87b0-48f9-884b-ebae6f0c71d7`](https://expo.dev/accounts/potluck_splitfinder/projects/jshack05/builds/0cd6df49-87b0-48f9-884b-ebae6f0c71d7) finished successfully from application commit `78df449`. The native logs include RNCAsyncStorage 2.2.0, ExpoSecureStore 57.0.4 and ExpoCrypto 57.0.3. It reuses the existing app identifier, signing credentials and registered iPhone. An earlier attempt failed at Expo's credential service; the retry succeeded without code changes or replacing credentials.

The updated build still needs installation and startup verification on the physical iPhone. JavaScript reloads cannot add native libraries to an older installed app. Install this development build, keep the computer's Expo server running, and select its LAN address in the development launcher. No TestFlight or App Store submission was performed.

For this session, the API is bound to the computer's Wi-Fi IPv4 address, and the ignored `my-app/.env.local` points `EXPO_PUBLIC_API_URL` to that address on port 4100. Expo was restarted on port 8083. The host health check and browser sign-in through the LAN address passed; phone-side connectivity remains to be confirmed. No firewall changes were required. If the computer's address changes, update the local environment and restart both servers. Retain loopback as the versioned default.

## October 5 entry policy

The full-app build now requires sign-in and bank confirmation before its four tabs. Opening a protected route preserves its destination through account entry. The local API has no bank provider configured: it returns `bank_required` / `unavailable`, and denies protected app data and mutations with `BANK_CONNECTION_REQUIRED`. It never reports a fixture bank as real or enables financial capabilities.

Existing integration tests explicitly inject a confirmed-provider fixture as the setup precondition for their unchanged business assertions. Separate entry tests use the actual default adapter, failures and invalid evidence. No runtime flag, development button or client callback bypasses the bank requirement. The prior browser QA described below predates this new prerequisite. Real linking, verified provider proof persistence/reconciliation, and physical-iPhone validation remain unfinished.

No migration or data deletion is part of this change. Reverting its code restores the prior entry policy without erasing local records. Before enabling a provider, durably separate completed onboarding from current bank health and preserve essential agreement cancellation/dispute access.

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
