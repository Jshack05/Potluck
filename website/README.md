# Potluck public website

A standalone React + TypeScript site based on the current Potluck Figma app. This folder does not change the Expo app or the existing root prototype.

## Run and validate

Use Node 22.12+ or Node 24, and pnpm 11+.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm validate
pnpm preview --port 4173
```

`pnpm validate` checks formatting, ESLint, interaction and HTTP routing tests, TypeScript, the production build and the dependency audit (high/critical threshold). `pnpm test` builds first so hydration tests check fresh prerendered HTML for every page. Motion respects the operating system's reduced-motion setting.

## Pages

### Partnership contact and direct email

The homepage's “Start a conversation” link opens `/contact/`. The responsive screen asks for full name, business email, company and message, with optional role, company website and partnership topic. Browser autocomplete, persistent labels, appropriate input types and length limits support accessible completion. A direct link to `joseph@getpotluck.app` remains available.

The user approved direct delivery to `joseph@getpotluck.app`. The form posts JSON to `/api/v1/contact` on the same site. `worker/index.ts` validates the request and uses Cloudflare's `CONTACT_EMAIL` binding, restricted to that exact recipient. The visitor's email becomes Reply-To; it never controls the sender or destination. A provider message ID is required before the UI confirms acceptance. Provider or network failures preserve entered fields; no automatic retry or duplicate-send guarantee is claimed.

The public endpoint requires a matching HTTPS Origin and JSON, rejects unknown fields, control characters, oversized requests and non-HTTP website URLs, and includes a honeypot. Cloudflare limits each hashed IP to five requests per minute and accepted-send attempts to 30 per minute per location. These are abuse controls, not a global billing cap or a CAPTCHA. Shared networks can hit the same limit. No attachments, database, marketing enrollment or financial actions are involved. Logs contain only outcome codes and request IDs; inquiry contents go to the email provider and recipient, not application logs or storage.

Deployment needs a verified Cloudflare destination (`joseph@getpotluck.app`) and a sending-eligible `getpotluck.app` domain for `website@getpotluck.app`. Do not alter existing inbox MX records to obtain this. Root `wrangler.jsonc` configures the email, rate-limit and static-asset bindings. Only `/api/*` runs the Worker first. The static local Vite preview has no email backend; it reports a recoverable error if submitted. Automated tests use fake email bindings and do not send mail. Verify one clearly labeled test inquiry in a Cloudflare preview before promoting production. Production activation and inbox delivery must be confirmed separately from GitHub build success.

Audience and purpose: prospective card, banking, payment and business partners can introduce themselves with relevant context. The promise is a clear route to a partnership conversation; the acquisition route is the existing homepage call to action. This is public partner outreach, not a Free/Plus/Premium feature or financial flow. Follow-up conversations are the intended recurring use; qualified inquiries are the primary business metric, with no tracking added. A structured inquiry adds context missing from the former blank email link. It does not alter product scope, user consent, provider approval or money movement.

Validation: `pnpm validate` passed formatting, lint, TypeScript, prerendering, 89 tests and the dependency audit. Tests cover contact routing, fields, hydration, pending/accepted/error states, draft preservation, input rejection, recipient restrictions, origin checks, rate limits, safe failures and non-sensitive logs. Desktop and a 385px browser viewport were visually checked with no horizontal overflow. Cloudflare delivery verification is a separate release step.

The Bills page has one introduction: “Less chasing. More clarity.” followed by “Bring your bills into one place. Share the ones you pay together.” The Import → Choose → Review walkthrough follows immediately, with the planned-availability notice below it. The homepage Bills tile uses a pale mint surface, white compact bill cards and smaller contributor avatars while retaining the existing two-row carousel and manual controls.

The homepage uses a 2×2 feature grid, stacked on phones. Native links open `/splitfinder/`, `/cards/`, `/bills/`, `/circles/` and `/credits/`. Each has independent HTML, metadata and canonical URLs, with browser back/forward and no-JavaScript access. Splitfinder includes the retained interactive sample search, a horizontal category rail and read-only availability/joining illustrations. More detailed explanations use native disclosures.

The homepage phone cycles the existing Circles, Cards, Bills and Splitfinder previews every five seconds. Its fixed bottom navigation selects a screen immediately and holds it for 30 seconds, restarting that hold on each selection. A pause control, keyboard entry, Splitfinder search interaction, reduced-motion preferences, offscreen placement and hidden tabs suspend cycling. Search and Bills interactions stay paused until the visitor resumes. The phone is an interactive marketing preview; its financial screens remain illustrative.

The Bills tile introduces importing with one line. On `/bills/`, the headline is followed by **Import → Choose → Review**, then the app sample, then sharing/agreements. Import shows bill records dropping from a bank-account illustration; it depicts information, not money movement. The story pauses offscreen, in hidden tabs and on interaction, and provides manual controls and a static reduced-motion alternative. Saving is a brief confirmation after Review, not a fourth numbered step. The phone's Import bills action opens the selection/review flow in manual mode. Saving updates only this preview's in-memory All bills collection, deduplicates by example ID and leaves existing shared arrangements unchanged. New imports remain unshared; the Share bill link explains the separate sharing step. No bank is connected, financial record persisted, contribution activated or payment authorized. Navigating away resets the preview. The current Figma library and September 20 decision put All bills left and Shared right. This website demonstration opens All bills with an unshared imported Phone bill and a shared Internet bill; Shared shows only Internet with its people. This approved demonstration default does not change the actual app's default collection.

This presentation serves prospective hosts bringing existing bills into Potluck. Its promise is “Bring your bills with you.” Import-to-sharing explains the invitation opportunity, and the retained bill collection illustrates recurring usefulness beyond a standalone tracker. Import organization belongs to Free/core; paid conversion remains future convenience/scale scope, with no paywall or checkout here. The marketing hypothesis is clearer understanding and exploration of Bills; measure homepage-to-Bills engagement and, once an actual product exists, confirmed-import-to-sharing activation. No new analytics tracking is introduced. This change refines the presentation of an existing product decision and requires no migration or provider configuration.

Splitfinder showcase listings stay level and centered. The Cards showcase cycles through deep-teal, mountain and ivory virtual-card concepts with layered edges and a floating shadow. Each 650 ms circular transition is followed by about 3.8 seconds of quiet floating; the caption stays level and the other two cards remain visible in the background. Selection dots and a pause button support manual viewing, and keyboard focus or manual selection pauses playback until explicitly resumed. Cycling and floating stop offscreen or in a hidden tab. Reduced-motion visitors get static, manually selectable designs. The app-screen card uses a static deep-teal finish. These illustrations do not imply physical-card availability.

`src/pages.ts` is the route/metadata source of truth. `scripts/prerender.mjs` emits each directory's `index.html`, `404.html` and `sitemap.xml`. Vite development serves the shared entry for known routes; production preview serves each built page and redirects known paths without trailing slashes. Unknown preview paths return HTTP 404. No router dependency is needed.

The shared-bill showcase cycles Netflix, Sam’s Club and Phone bill examples through two visible rows, with contributor avatars and people counts on each. Rows advance every 4.4 seconds with a 600 ms vertical transition. Pause/next controls support manual viewing; reduced motion, keyboard focus, hidden tabs and offscreen placement suspend automatic cycling. Amounts are illustrative bill totals, not current service prices; the membership example is yearly. The showcase does not imply service affiliation, unrestricted sharing eligibility, accepted contributions or working payments.

This presentation serves prospective hosts, contributors and partners: see the people behind a shared bill at a glance. It supports core-product discovery through the existing feature links and partner contact, with no paid placement, upgrade flow or new financial behavior. The recurring-bill story distinguishes the product from a private bill tracker; feature-page engagement is the intended measurement, with no analytics added by this change.

## Sources and copy

- Circle detail: Figma `218:314`; members `224:360`; bill rows `224:387`; pending agreement `1555:19224`. The floating showcase pairs simple teal and ivory finishes with the original Alpine mountain artwork (`public/figma/alpine-card.png`, Figma `1583:19341`). The static app excerpt keeps its simple teal finish and layout based on Figma `1592:19292`.
- Splitfinder: Figma `1763:24097`.
- Brand lines: the existing getpotluck.app headline and approved `Your bills. Your people. All together.` positioning.
- Contact: `joseph@getpotluck.app` from the repository website copy draft.
- Motion: adapted Aceternity Container Scroll and Skiper 40 Animated Link. See `THIRD_PARTY_NOTICES.md`; retain visible Skiper attribution.

The screen excerpts intentionally omit some mobile controls to present the app as a read-only marketing illustration. Website navigation, sample search and native disclosures are functional. Amounts and service listings are illustrative. The joining flow is an illustration, not a working request form. No login, balance, consent, payment, card issuance, analytics, waitlist submission or financial-provider integration is implemented here. The contact page sends partnership inquiries through the restricted Cloudflare email binding; direct `mailto:` remains a fallback.

## Deployment

### Family contribution story

The homepage `#together` panel connects a Family Circle, three agreed illustrative contributions ($60/$40/$20), a host-managed Family card, and a $120 phone bill. It derives flat Lucky variants from the approved face (Figma `1340:11945`), omitting confetti and adding glasses to Jordan and a hair tuft to Maya. A centered bill contains its funding meter and attached Family payment card. One ten-second clock drives the tokens, gestures and contribution totals; funds are counted only when each token arrives. The final state is **Ready for the phone bill**, never a settled merchant payment. The meter describes this bill's reserved amount, not a total card balance.

The scene loops automatically after a four-second completed hold, suspends offscreen or in a hidden tab, supports pause/resume throughout the cycle, and renders its complete state for reduced motion or without JavaScript. Tests cover exact totals, preserved pause timing, hidden-tab behavior and motion-preference changes. The mobile composition keeps the bill centered with a compact attached card. Cycling visual totals are not live-announced to screen readers. No provider calls, credentials, real funds, new dependencies or entitlements are involved. Removing `FamilyStory` from `Home.tsx` rolls back the section without a data migration.

Deploy the validated `website/dist/` output through `marketing-site/` and the contact Worker using root `wrangler.jsonc`; follow `docs/WEBSITE_DEPLOYMENT.md` for activation and rollback. Canonical links and sitemap target `https://getpotluck.app/`. `public/_headers` configures static response headers; API headers are set by the Worker. The contact endpoint needs the configured email and rate-limit bindings, with the recipient verified in Cloudflare. No secret belongs in the browser bundle.

The production host must serve directory indexes, redirect known slashless page URLs to their slash versions, and use `404.html` with HTTP 404 for missing routes. Do not configure a catch-all SPA rewrite to the homepage: it would serve incorrect prerendered content and metadata. Provider-specific hosting configuration remains a deployment step.

Financial services are not yet available. Site copy describes a conditional combined launch and Stripe preference without claiming provider approval. Keep those disclosures alongside financial previews.

## Rollback

Switch the hosting deployment back to its previous artifact; there are no migrations or financial side effects. Local rollback removes only this independent website project. Preserve unrelated repository changes.
