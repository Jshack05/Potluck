# Potluck partner website — October 1, 2026

## Approved brief

Build the site now, based on the real Potluck app. Discard the generated prototype and mascot. Make it spacious, sleek and premium using Skiper UI and Aceternity UI. The domain is getpotluck.app; the immediate purpose is financial-provider evaluation. Present Splitfinder and financial Potluck together as a conditional product vision, with Stripe preferred where supported and approved.

## Context and boundaries

Affected actors: prospective users and financial partners viewing public marketing. No real Card, Bill, balance, contribution, invitation, authorization or money movement changes. Figma and repository product documents own the visual/product source; provider approval remains external and unconfirmed. Screen amounts and people are illustrative. No testimonials, customer statistics, compliance claims, live payment forms, paid entitlements or invented mascot.

Target user: prospective issuing/banking partners, with future hosts and contributors as secondary readers. Promise: shared bills, made simple. Acquisition: clear product tour and direct partner email. Placement: public marketing, outside plan entitlements. Conversion: qualified partner discussions; no consumer subscription gate. Retention: explains recurring shared expenses and consent. Alternative: a disconnected bill tracker and messaging thread. Primary metric: qualified partner inquiries, assessed manually rather than adding tracking.

## Implementation

1. Create an isolated `website/` React/TypeScript/Vite project on a focused branch. Bundle Inter and Figma original assets locally, with provenance. Adapt Aceternity Container Scroll and Skiper 40 Animated Link; retain upstream code and attribution. Motion is needed for scroll transforms; the native Expo runtime cannot serve this independent web landing page. Vite supplies the web build; test/format/lint packages supply repeatable validation.
2. Build an editorial hero with an authentic Apartment crew excerpt, one product tour with Splitfinder/Bills/Cards, and a compact provider section. Use existing approved headlines. Build actual semantic responsive components, not screen-sized screenshot backgrounds. Product tour tabs, sample listing search and FAQ work locally; contact opens email.
3. Test keyboard tab navigation, filtering/clear/empty state, static preview boundaries, contact destinations and reduced-motion behavior. Check desktop and narrow mobile in browser. Run formatting, lint, TypeScript, component tests, dependency audit and production build through `pnpm validate`. Prerender the initial page so content is available without JavaScript.
4. Obtain one fresh code review, fix material issues, open local preview. Hosting deployment is separate from the local build and requires existing hosting configuration; do not change DNS or publish an unfinished review.

## Risk and rollback

Presentation-only: no schema migrations or provider configuration. Remove/revert only `website/` to roll back the new site. The existing prototype, Expo app and unrelated working changes remain untouched. Financial availability must remain visibly conditional, not merely buried in a footer. Preserve the free Skiper attribution. Verify no cross-user storage, secret or network submission is introduced.

## Review focus

Check keyboard and screen-reader operation of tour tabs, search/clear/empty states, SSR/hydration, layout at 320px, reduced-motion behavior, original asset provenance, truthful financial status and no accidental live transactions or fabricated proof. Check production asset paths and dependency security.
