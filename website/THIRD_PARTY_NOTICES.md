# Visual and motion sources

## Aceternity UI

`src/components/AceternityScroll.tsx` adapts the free [Container Scroll Animation](https://ui.aceternity.com/components/container-scroll-animation). The original registry response is retained in `vendor/aceternity-container-scroll.json` for provenance, not shipped in the static output. Changes: CSS instead of Tailwind, much smaller rotation/scale/translation ranges, intrinsic sizing, reduced-motion support and Potluck visual tokens.

Source retrieved October 1, 2026 from https://ui.aceternity.com/registry/container-scroll-animation.json. [Aceternity license](https://ui.aceternity.com/licence). This is a Potluck end-product website, not a component library or template for redistribution.

## Skiper UI

`src/components/SkiperLink.tsx` and `.skiper-link` styles adapt Skiper 40 Animated Link / Link001. Original source: https://skiper-ui.com/r/skiper40.json; documentation: https://skiper-ui.com/v1/skiper40. Original author: Gurvinder Singh (@gurvinder-singh02), https://gxuri.me. Registry snapshot retained in `vendor/skiper40.json`, excluded from production output.

The original component permits modification and personal/commercial use with attribution for the free version. The site footer visibly credits and links Skiper UI. Changes: native anchors instead of Next.js, ordinary CSS instead of Tailwind, visible keyboard focus and reduced-motion behavior. No Pro components are used.

## Potluck Figma

The original artwork and SVG assets come from the Potluck app, file `1hAy3kcZAEvqq8ZNjKU7CD`, read October 1, 2026. See `public/figma/sources.json`. They remain local assets with no temporary Figma dependencies. Screens are adapted into native HTML/CSS excerpts, not flattened screenshots. No image-generated prototype or new mascot is included.

Third-party service marks in the illustrative Splitfinder view identify those services, not a Potluck partnership. Service names, availability, prices, capacities and eligibility on this site are illustrative, not live offers.

## Font

Inter Variable is bundled locally through `@fontsource-variable/inter`. Its SIL Open Font License is included in the dependency distribution.
