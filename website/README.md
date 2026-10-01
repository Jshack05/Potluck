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

`pnpm validate` checks formatting, ESLint, interaction tests, TypeScript, the production build and the dependency audit (high/critical threshold). `pnpm test` builds first so the hydration regression test checks the actual fresh prerendered HTML. The build prerenders the initial page to `dist/index.html`, so the story, links and native FAQs are available without JavaScript. The product tour and search hydrate on the client. Motion respects the operating system's reduced-motion setting.

## Sources and copy

- Circle detail: Figma `218:314`; members `224:360`; bill rows `224:387`; pending agreement `1555:19224`; card artwork `1592:19292`.
- Splitfinder: Figma `1763:24097`.
- Brand lines: the existing getpotluck.app headline and approved `Your bills. Your people. All together.` positioning.
- Contact: `joseph@getpotluck.app` from the repository website copy draft.
- Motion: adapted Aceternity Container Scroll and Skiper 40 Animated Link. See `THIRD_PARTY_NOTICES.md`; retain visible Skiper attribution.

The screen excerpts intentionally omit some mobile controls to present the app as a read-only marketing illustration. Website navigation, tour tabs, sample search and native FAQ disclosure are functional. Amounts and service listings are illustrative. No login, balance, consent, payment, card issuance, analytics, waitlist submission or provider integration is implemented here. Contact uses `mailto:` and requires the visitor to send their own email.

## Deployment

Deploy only `website/dist/` to the existing domain's static hosting after reviewing the result and confirming that host's project configuration. This task does not change DNS or publish the site. Canonical links and sitemap target `https://getpotluck.app/`. `public/_headers` is ready for hosts that support that convention; other hosts need equivalent response-header settings. There are no required secrets or environment variables.

Financial services are not yet available. Site copy describes a conditional combined launch and Stripe preference without claiming provider approval. Keep those disclosures alongside financial previews.

## Rollback

Switch the hosting deployment back to its previous artifact; there are no migrations or financial side effects. Local rollback removes only this independent website project. Preserve unrelated repository changes.
