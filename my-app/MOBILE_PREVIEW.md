# Potluck mobile preview — September 22, 2026

## Main-screen refresh

The discovery screen now uses the approved Figma search header (`1717:24177`): editable search and Filters sit together above the category tabs, replacing the tagline/Lucky row. Results scroll inside a white surface with rounded top corners. The repeated preview banner has been removed; the Welcome notice and practice-message disclosures remain. Housing/Memberships, data, saves and route state are unchanged. Exact search artwork is stored locally with provenance.

Browser verification at 390×844 and 430×932 confirmed typing, clear, applying the price filter, and preserving a search through listing → Back. Physical-iPhone keyboard behavior still requires on-device confirmation. The standard validation command passed lint, type checking, all five tests and iOS/Android/web exports for this refresh.

The installed development client serves this app from Metro. From `my-app`, run `npx expo start --dev-client --lan --port 8081`. Keep the computer and phone on the same network. Reload the app from its development menu after changing the root layout.

## Implemented screens

- Welcome and first-visit introduction (per app session)
- Housing and membership discovery, text search and monthly-share filtering
- Listing detail, proposed share, host link and reversible saves
- Host profiles and separately searchable alternative property listings
- Saved listings
- Separate Splitfinder inquiry inbox
- Inquiry conversation, editable drafts and local practice messages

Source Figma file: `1hAy3kcZAEvqq8ZNjKU7CD`. References: welcome `1209:6717`, discovery `1209:6796` / `1209:6924`, residential browse `1662:23381`, detail `1212:8306`, profile `1540:19118`, inbox `1209:7339`, inquiry `1212:8530`. Exported assets and provenance are in `assets/splitfinder/`.

The approved September 20 launch decision supersedes older financial UI. This subset uses contextual navigation, not a new finalized launch tab bar. Experiences and financial destinations are excluded. Unsupported reputation statistics, verification badges and payment/acceptance controls are omitted. Figma styles and imagery are adapted to flexible native layouts; this is not a pixel-identical reproduction of every old screen.

## Boundaries

All listings, prices, names and portraits are samples from the design context. Austin examples are retained as samples, not presented as Georgia Tech inventory. No backend, accounts, publishing, ID verification, remote messaging, payment, or shared-bill execution exists here. No exact residential addresses are exposed. Saves, queries, drafts and practice messages survive navigation but reset on a full reload or process restart. No fictitious replies or delivery receipts are generated.

## Validation

`npm run validate` runs Expo ESLint, TypeScript, Node model tests, and production JS exports for iOS, Android and web. It does not create or submit a signed store build. `npx prettier@3.6.2 --check <changed source files>` checks formatting. Provider/database integration tests do not apply to this UI-only change. `npm audit` reports upstream dependency advisories separately; do not apply breaking forced downgrades merely to silence advisories.

Browser QA at 390 × 844 covers welcome → discovery → filter → listing → save → inquiry → inbox → profile. Empty-search recovery and blank-message disabling are checked. Final keyboard behavior on physical iPhone still needs on-device confirmation; native keyboard avoidance wraps the full screen rather than the content below its header.

Development-only ESLint packages were installed because the starter's lint script had no linter/configuration. No runtime/native module dependencies or signing settings were changed. Rollback: restore the starter root layout/index and remove the added routes/features/assets. No data migration is involved.

Final checks: ESLint and TypeScript pass; 5 model tests pass; iOS/Android/web exports pass; changed-source Prettier check passes. Dependency audit reports 14 moderate advisories and no high/critical advisories in the existing Expo dependency tree. Those advisories are unresolved. Browser inspection confirmed the main forward flow; a later browser back-navigation automation timed out, so repeated browser-history traversal and physical-iPhone keyboard behavior are not claimed verified.

## September 25, 2026 update (supersedes the earlier main-screen description)

Colorful onboarding now uses Potluck's tagline and Plans, Memberships, Subscriptions and Spaces, plus Explore all opportunities. A selection immediately opens discovery; Change revisits the picker and resets search/price. The subscription home uses the blended canvas header, working All/TV & movies/Music/Software filters, numeric vacancies, full-plan pricing, savings and View group. Exact layered SVG onboarding artwork is local. Native safe areas replace the mock status bar; narrow-screen text and touch targets adapt to the device.

New illustrative subscription and phone-plan fixtures are local only. Active is sample listing information, not provider-verified payment status. Savings compare the full plan bill with the person's share. Saves and inquiries remain session-only. Existing financial/account navigation is not added. The future directional header animation remains deferred.

References: onboarding 1784:24235; subscription home 1763:24097. Seven model tests cover the existing behaviors plus category/subtype filters and savings. Reload the existing development client while connected to Metro; no new native build is required. Physical iPhone QA is still needed.
