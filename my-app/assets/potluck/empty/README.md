# Original Potluck empty-state artwork

Source: Potluck Core UI file `1hAy3kcZAEvqq8ZNjKU7CD`, retrieved with Figma design context on October 5, 2026.

- Cards screen `766:3012`, empty-state component `776:3168`.
- Circles screen `766:3056`, empty-state component `427:649`.
- Bills screen `766:3098`, empty-state component `765:3333`.

SVG files are unchanged Figma exports, composed in `src/features/potluck/home-empty-state.tsx` within the original 164 × 128 illustration slot. Root dimensions, effects bounds, layering and source positions are retained. `circle-lucky.svg` and `circle-eye.svg` preserve the distinct Circles source colors. The pink card infill and plus signs are native views/text matching the original non-SVG Figma layers.

| Asset                        | Export dimensions |
| ---------------------------- | ----------------- |
| table-glow.svg               | 162 × 48          |
| table.svg                    | 142 × 52          |
| contact-shadow.svg           | 62 × 21           |
| lucky.svg / circle-lucky.svg | 70 × 70           |
| eye.svg / circle-eye.svg     | 6 × 6             |
| smile.svg                    | 22 × 7            |
| card.svg                     | 38.5 × 28.9       |
| bill.svg / bill-infill.svg   | 32 × 34           |

The screen composition adapts to available height and accessible text sizes. The three home empty states reserve the same filter-row space and use a shared illustration offset, independent of description length and footer actions. The original green "Tap + to create your first…" hint points to the existing creation menu above navigation. Filtered Shared results with personal bills keep their contextual explanation instead of claiming the user has no bills. Descriptions explain bank setup when required. No entire-screen screenshot is used as application UI.

See [October 8 alignment and hint verification](../../../../docs/ui-concepts/2026-10-08-home-empty-state-polish.md).
