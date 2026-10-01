# Validation — visual product pages, October 1, 2026

- `pnpm validate`: passed formatting, ESLint, TypeScript, production build and 24 tests across three files. Dependency audit: no known vulnerabilities.
- Four homepage feature links are visible together. Dedicated Splitfinder, Cards, Bills, Circles and Credits pages have their own prerendered HTML, descriptions, canonical URLs and titles.
- Interaction coverage: normalized sample search, empty results, clear/focus restoration, read-only financial boundaries, contact/credits destinations and unknown-route recovery. The removed tab interaction test was replaced with the approved all-visible grid/navigation behavior; search and financial assertions were preserved.
- All seven built HTML artifacts (including 404) hydrate cleanly with reduced motion, expose their main content without JavaScript, reference existing image files and link only to defined local pages.
- Independent review identified an explicit `index.html` alias mismatch: static HTML served the feature but client routing selected 404. Home and feature alias hydration regressions failed before terminal `index.html` normalization and now pass. No remaining review findings.
- Real HTTP preview tests cover all five dedicated pages with and without trailing slashes, plus an actual 404 for unknown paths. Regression observed: SPA fallback returned homepage HTML for slashless/unknown paths. MPA serving plus known-route redirects resolves it.
- Browser: inspected 1440×1000, 390×844 and 320×844 layouts. Product grid is two columns on desktop and a single column on phones. All feature routes at 320px measured document/client widths of 305/305px (15px scrollbar). Homepage also measures 305/305px after its grid min-width fix. No failed images.
- Browser actions: homepage feature link, all header feature links, direct reload, search/filter/empty/clear, Credits and browser back navigation. Phone checks identified and fixed the Splitfinder flex minimum width and narrow card content clipping. Subscription art now composes both original SVG layers.
- Reduced motion is covered in hydration tests and CSS; on-device Safari and a full accessibility audit remain outside this focused browser QA.
- Original Aceternity and Skiper adaptations retained. Fuller credits have their own page; required Skiper attribution remains visible in the footer.
- Local preview only; not deployed to getpotluck.app. Static hosting needs directory indexes, trailing-slash redirects and a proper 404 mapping. No financial-provider calls, money movement, data collection, accounts, migrations or new dependencies.

Preview: `pnpm preview --port 4173`.
