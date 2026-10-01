# Visual product pages implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this cohesive website update.

**Goal:** Replace the paragraph-heavy homepage with a visual 2×2 product grid and short dedicated feature pages.

**Architecture:** React, existing app excerpts and local Figma assets; native page links and static prerendering for every route. No router dependency or client-side financial services. Keep the existing focused website branch and leave unrelated dirty files alone.

**Spec (approved in conversation):** Homepage hero, 2×2 Splitfinder / Cards / Bills / Circles grid, compact partner section. One headline, large app artwork, short captions on feature pages. Splitfinder gets browsing, availability and joining scenes plus sharing categories. Stack tiles on phones. Separate Credits page; preserve free Skiper attribution. Existing Aceternity and Skiper motion remains subtle and respects reduced motion.

## Global constraints

- Use original Potluck icons/artwork and teal/blue colors, no new mascot or Apple assets.
- Financial features remain planned, unavailable and subject to provider/program approval. No invented approvals, testimonials or live listings.
- Circle membership, contributions and spending permissions remain separate; agreement precedes collection.
- Preserve working sample search, keyboard access and native back/forward navigation.
- No new dependencies, migration, payment actions, forms, tracking, deployment or DNS changes.
- Target visitors: prospective users and financial partners. Promise: understand the product visually in seconds. Public/free marketing; acquisition through feature links and partner contact; no paid conversion or paywalls in scope. Return visits support product understanding; differentiation is connected discovery, people and agreed bills. Primary future metric: feature-page visits leading to partner inquiries; no analytics introduced.
- Provider systems remain authoritative for real financial state. All data here is illustrative. Rollback is reverting this isolated website change.

## Task 1: Visual homepage and feature destinations

**Files:** App.tsx shared shell; pages.ts route metadata; components/ProductVisuals.tsx visual compositions; pages/Home.tsx, FeaturePage.tsx and Credits.tsx; styles.css and app-previews.css; prerender.mjs; App.test.tsx, Hydration.test.tsx; README, VALIDATION, THIRD_PARTY_NOTICES.

**Interfaces:** App receives a pathname (default `/`); native links use `/splitfinder/`, `/cards/`, `/bills/`, `/circles/`, `/credits/`. Build and client use the same path normalization. Existing AppPreviews supplies read-only artwork and interactive sample search on Splitfinder only.

- [ ] Update interaction tests for four visible feature links, dedicated pages, retained sample search and read-only financial content; run red.
- [ ] Implement shared shell, 2×2 homepage and short feature/credits pages with local artwork.
- [ ] Prerender each destination with unique title, description and canonical URL; write sitemap and a not-found artifact. Test route hydration and no-JavaScript content.
- [ ] Run `pnpm validate`; expected format/lint/type/build/tests/audit pass.
- [ ] Browser-check 1440px, 390px and 320px: links, search/clear/empty state, details, page reload/back, no overflow or image failures. Review visual balance and reduced motion.
- [ ] Document validation; focused commit; one independent final review; resolve important findings.

## Review focus

- Direct feature URLs and trailing slashes must serve the correct prerender, including without JavaScript.
- Small screens must show readable app content without page-level horizontal overflow.
- Search is a clearly labeled sample and must not suggest real marketplace access.
- Financial consent/availability caveats must survive the shorter copy.
- No-JavaScript and reduced-motion visitors must see all content without hydration errors.
