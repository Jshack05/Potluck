# Potluck website deployment

The `marketing-site` branch of `Jshack05/Potluck` is connected to Cloudflare Workers Builds for Worker `potluck`, serving https://getpotluck.app. Root `wrangler.jsonc` publishes `marketing-site/` as static assets and `website/worker/index.ts` for the contact API. Source code, tests, and the lockfile live in `website/`.

## October 4, 2026 contact release

Release commit `36e03c9bf4e51ecc10fc5a6dcc2316a26b433f16` adds `/contact/`, linked from Start a conversation, and `POST /api/v1/contact`. Cloudflare version `b6d3879d-3077-4d0a-b949-2098071fa99d` was tested as a preview and promoted to 100% of production traffic. Both the focused branch and `marketing-site` contain this release; the promoted version was built from the focused branch at the identical commit.

The `CONTACT_EMAIL` binding restricts delivery to verified recipient `joseph@getpotluck.app`. Messages use `website@getpotluck.app` as sender and the validated visitor address as Reply-To. Cloudflare accepted one clearly labeled test inquiry and returned a message ID; the browser displayed the success state. Inbox receipt was not independently observed. No MX records, paid plan, credentials, or financial-provider settings were changed.

The API validates fields and body size, rejects foreign origins and honeypots, and uses per-location rate limits of five requests per IP per minute and thirty delivery attempts per minute. These are not a global hard cap. Form contents are not stored or logged by application code. Provider failure preserves the visitor's draft and offers direct email; there is no automatic retry after uncertain delivery.

Validation: `pnpm validate` passed formatting, lint, TypeScript, build, all 89 tests across 11 files, and the dependency audit. Wrangler's deployment dry run passed. All seven live pages and current JS/CSS assets returned 200; pages use `index-CcCuWUwt.js`. An unknown page returned 404, incomplete contact JSON returned 400, and a foreign-origin submission returned 403. API responses are not cached. The live homepage link and contact page were checked in the browser.

Rollback this contact release by promoting previous production version `d9ac1dcc-e95c-47d2-9157-aaa2f602b065`. That restores the prior mailto link and static website. Already accepted emails remain in the recipient's mailbox; there is no database migration or backfill. Preserve the recipient verification for a later corrected release.

## October 2, 2026 release

Replaces the old single-page marketing site with the approved React/TypeScript website from source commit `5615b1a`: homepage, Splitfinder, Cards, Bills, Circles, Credits, and a custom 404. Includes the interactive hero, floating card rotation, shared-bill carousel, and Import/Choose/Review demonstration. Financial previews remain explicitly planned and illustrative.

Validation before publication: `pnpm validate` passed formatting, ESLint, TypeScript, production prerendering, 61 tests across 8 files, and dependency audit with no known vulnerabilities. Built files copied byte-for-byte into `marketing-site/`. Cloudflare handles directory indexes and custom 404 responses; no SPA fallback is used.

## Updating

### October 4, 2026 release

Publishes the unchanged website from source commit `adb5489`, including the flat Lucky family contribution story, distinct characters, centered bill and attached card, automatic looping, and pause/resume. All existing feature pages and planned-experience disclosures remain intact.

Validation: `pnpm validate` passed formatting, ESLint, TypeScript, production prerendering, 66 tests across 9 files, and dependency audit with no known vulnerabilities. The generated output is copied from that validated build. Previous hashed assets are retained so already-open pages can finish loading during deployment. No secrets, database changes, provider configuration, or financial operations are included.

Production activation verified October 4, 2026: release commit `da1baff07659ef5c81c3d90b81e3dcdbe0a82343`, Cloudflare version `d9ac1dcc-e95c-47d2-9157-aaa2f602b065`, promoted to 100% of traffic. All six public pages returned 200 with the new `index-BWzmBdqq.js` bundle; JavaScript and CSS returned 200, and an unknown path returned 404. The public homepage was also visually verified in a browser.

The GitHub build had uploaded a preview without activating production. A successful build alone does not establish that getpotluck.app has changed. The previous production version was `748873ce` (commit `ed5d910c0cf233925e872bd8503b3523d40abc3c`); `69c950d` was a preview, not the previous active production release.

1. Edit source in `website/`, then run `pnpm install --frozen-lockfile` and `pnpm validate` there.
2. Copy the validated `website/dist/` output into `marketing-site/`. Retain previous hashed assets during rollout so already-open pages can finish loading.
3. Commit both source and generated changes together on the deployment branch. Never include `.env`, dependencies, private app data, or unrelated repository work.
4. Push `marketing-site` and inspect the GitHub `Workers Builds: potluck` check.
5. In Cloudflare Worker `potluck` > Deployments, find the version for the exact release commit and use More options > Promote version to activate it at 100%. Verify that it is the active deployment.
6. Verify the live homepage, all feature pages, JavaScript/CSS/images, slash redirects, security headers, and a genuine 404. Match the public bundle hash to the validated build before reporting publication complete.

Cloudflare uploads the committed static output; it does not need a new dashboard build command or a running developer PC. No database, provider, DNS, or payment changes are part of this release.

## Rollback

The prior production deployment is commit `ed5d910c0cf233925e872bd8503b3523d40abc3c`. Revert the website deployment commit and push the resulting forward commit, or use the corresponding previously successful Cloudflare deployment. Do not force-reset shared branch history. No data migration or backfill is involved.
