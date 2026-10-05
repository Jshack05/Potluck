# Original Potluck empty-state artwork

Source: Potluck Core UI file `1hAy3kcZAEvqq8ZNjKU7CD`, retrieved with Figma design context on October 5, 2026.

- Cards screen `766:3012`, empty-state component `776:3168`.
- Circles screen `766:3056`, empty-state component `427:649`.
- Bills screen `766:3098`, empty-state component `765:3333`.

SVG files are unchanged Figma exports, composed in `src/features/potluck/home-empty-state.tsx` within the original 164 × 128 illustration slot. Root dimensions, effects bounds, layering and source positions are retained. `circle-lucky.svg` and `circle-eye.svg` preserve the distinct Circles source colors. The pink card infill and plus signs are native views/text matching the original non-SVG Figma layers.

| Asset | Export dimensions |
|---|---|
| table-glow.svg | 162 × 48 |
| table.svg | 142 × 52 |
| contact-shadow.svg | 62 × 21 |
| lucky.svg / circle-lucky.svg | 70 × 70 |
| eye.svg / circle-eye.svg | 6 × 6 |
| smile.svg | 22 × 7 |
| card.svg | 38.5 × 28.9 |
| bill.svg / bill-infill.svg | 32 × 34 |

The screen composition adapts to available height and accessible text sizes. Descriptions explain bank setup when required. The current bottom-action rule replaces the old floating-plus hint with a labeled action above the existing four-destination navigation. No entire-screen screenshot is used as application UI.
