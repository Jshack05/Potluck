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

The homepage uses a 2×2 feature grid, stacked on phones. Native links open `/splitfinder/`, `/cards/`, `/bills/`, `/circles/` and `/credits/`. Each has independent HTML, metadata and canonical URLs, with browser back/forward and no-JavaScript access. Splitfinder includes the retained interactive sample search, a horizontal category rail and read-only availability/joining illustrations. More detailed explanations use native disclosures.

Splitfinder showcase listings stay level and centered. The Cards showcase cycles through deep-teal, mountain and ivory virtual-card concepts with layered edges and a floating shadow. Each 650 ms circular transition is followed by about 3.8 seconds of quiet floating; the caption stays level and the other two cards remain visible in the background. Selection dots and a pause button support manual viewing, and keyboard focus or manual selection pauses playback until explicitly resumed. Cycling and floating stop offscreen or in a hidden tab. Reduced-motion visitors get static, manually selectable designs. The app-screen card uses a static deep-teal finish. These illustrations do not imply physical-card availability.

`src/pages.ts` is the route/metadata source of truth. `scripts/prerender.mjs` emits each directory's `index.html`, `404.html` and `sitemap.xml`. Vite development serves the shared entry for known routes; production preview serves each built page and redirects known paths without trailing slashes. Unknown preview paths return HTTP 404. No router dependency is needed.

## Sources and copy

- Circle detail: Figma `218:314`; members `224:360`; bill rows `224:387`; pending agreement `1555:19224`. The floating showcase pairs simple teal and ivory finishes with the original Aurora mountain artwork (`public/figma/aurora-card.png`). The static app excerpt keeps its simple teal finish and layout based on Figma `1592:19292`.
- Splitfinder: Figma `1763:24097`.
- Brand lines: the existing getpotluck.app headline and approved `Your bills. Your people. All together.` positioning.
- Contact: `joseph@getpotluck.app` from the repository website copy draft.
- Motion: adapted Aceternity Container Scroll and Skiper 40 Animated Link. See `THIRD_PARTY_NOTICES.md`; retain visible Skiper attribution.

The screen excerpts intentionally omit some mobile controls to present the app as a read-only marketing illustration. Website navigation, sample search and native disclosures are functional. Amounts and service listings are illustrative. The joining flow is an illustration, not a working request form. No login, balance, consent, payment, card issuance, analytics, waitlist submission or provider integration is implemented here. Contact uses `mailto:` and requires the visitor to send their own email.

## Deployment

Deploy only `website/dist/` to the existing domain's static hosting after reviewing the result and confirming that host's project configuration. This task does not change DNS or publish the site. Canonical links and sitemap target `https://getpotluck.app/`. `public/_headers` is ready for hosts that support that convention; other hosts need equivalent response-header settings. There are no required secrets or environment variables.

The production host must serve directory indexes, redirect known slashless page URLs to their slash versions, and use `404.html` with HTTP 404 for missing routes. Do not configure a catch-all SPA rewrite to the homepage: it would serve incorrect prerendered content and metadata. Provider-specific hosting configuration remains a deployment step.

Financial services are not yet available. Site copy describes a conditional combined launch and Stripe preference without claiming provider approval. Keep those disclosures alongside financial previews.

## Rollback

Switch the hosting deployment back to its previous artifact; there are no migrations or financial side effects. Local rollback removes only this independent website project. Preserve unrelated repository changes.
