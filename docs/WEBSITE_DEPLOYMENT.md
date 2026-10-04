# Potluck website deployment

The `marketing-site` branch of `Jshack05/Potluck` is connected to Cloudflare Workers Builds for Worker `potluck`, serving https://getpotluck.app. Root `wrangler.jsonc` publishes only `marketing-site/` as static assets. Source code, tests, and the lockfile live in `website/`.

## October 2, 2026 release

Replaces the old single-page marketing site with the approved React/TypeScript website from source commit `5615b1a`: homepage, Splitfinder, Cards, Bills, Circles, Credits, and a custom 404. Includes the interactive hero, floating card rotation, shared-bill carousel, and Import/Choose/Review demonstration. Financial previews remain explicitly planned and illustrative.

Validation before publication: `pnpm validate` passed formatting, ESLint, TypeScript, production prerendering, 61 tests across 8 files, and dependency audit with no known vulnerabilities. Built files copied byte-for-byte into `marketing-site/`. Cloudflare handles directory indexes and custom 404 responses; no SPA fallback is used.

## Updating

### October 4, 2026 release

Publishes the unchanged website from source commit `adb5489`, including the flat Lucky family contribution story, distinct characters, centered bill and attached card, automatic looping, and pause/resume. All existing feature pages and planned-experience disclosures remain intact.

Validation: `pnpm validate` passed formatting, ESLint, TypeScript, production prerendering, 66 tests across 9 files, and dependency audit with no known vulnerabilities. The generated output is copied from that validated build. Previous hashed assets are retained so already-open pages can finish loading during deployment. No secrets, database changes, provider configuration, or financial operations are included.

For this release, rollback is a forward revert of its deployment commit, or restoration of the successful Cloudflare deployment for `69c950d01adcb370534ffe775a43f95e78c9aa53`.

1. Edit source in `website/`, then run `pnpm install --frozen-lockfile` and `pnpm validate` there.
2. Replace the contents of `marketing-site/` with the validated `website/dist/` output, removing obsolete hashed assets.
3. Commit both source and generated changes together on the deployment branch. Never include `.env`, dependencies, private app data, or unrelated repository work.
4. Push `marketing-site` and inspect the GitHub `Workers Builds: potluck` check.
5. Verify the live homepage, all feature pages, JavaScript/CSS/images, slash redirects, security headers, and a genuine 404.

Cloudflare uploads the committed static output; it does not need a new dashboard build command or a running developer PC. No database, provider, DNS, or payment changes are part of this release.

## Rollback

The prior production deployment is commit `ed5d910c0cf233925e872bd8503b3523d40abc3c`. Revert the website deployment commit and push the resulting forward commit, or use the corresponding previously successful Cloudflare deployment. Do not force-reset shared branch history. No data migration or backfill is involved.
