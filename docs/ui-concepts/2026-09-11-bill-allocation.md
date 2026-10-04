# Host bill allocation — September 11, 2026

The proposal-sent redesign uses editable vector illustration `1419:13478`, with `Left initial` and `Right initial` text properties. Tested A/M overrides and restored J/T sample values. The approved generated raster was recreated as vectors to avoid baked-in initials. The illustration and confirmation source remain in `02 Components`. Confirmation `1408:12212` now opens response tracking `1420:13562` (source `1420:13503`) through View responses. These are example states, not live delivery or recipient data. Application avatar values must come from actual recipients.

Split equally is a toggle. On distributes the total equally; off reveals Dollars / Percentages and individual shares. Percentages show dollar equivalents. Show the unallocated remainder and require complete allocation before preview in the application. Use integer cents and a disclosed rounding policy; do not silently assign rounding differences.

Material changes require each affected contributor's acceptance. Proposing or switching allocation modes does not debit anyone. Preserve the optional host reason and effective date with the proposal version.

## Figma

### Scalable review and full contributor lists

Latest review layout: bill/Circle identity and allocation summary share one 559px white card. Increased spacing around the split type, calendar row, contributor count and avatar strip. The neutral information icon is black. Review body and viewport are 670px; the 60px information card ends at screen y780, 14px above Send proposal at y794. Normalized existing instance height overrides across equal, dollar, percentage and 12-person reviews; View all destinations remain matched to each review.

Prototype fidelity refinements: schedule rows use reusable calendar outline `1434:14385`; review disclaimers use neutral rounded information card `1434:14389` with an information icon. Use this information treatment instead of standalone disclaimer text in this flow. Initial-avatar backgrounds vary consistently (mint, lavender, blush) between summary and full-list instances; existing photo fills are preserved. All four review screens retain their fixed footer, with 636px content for three-person examples and 655px for the 12-person example inside the 664px viewport.

The review sources now emphasize the bill and Circle, replace the split chart with avatars, and remove colored side markers. Avatar source `1425:13538` has Initial and Show initial properties; a photo can replace its circular fill with the initial hidden. Proposed-share row source `1425:13541` exposes name and amount.

Three-person equal/custom review routes remain intact. Their View all actions open `1428:13817` (equal), `1428:13932` (dollars), and `1428:14047` (percentages), each returning to its originating review. The 12-person review `1428:13747` opens full list `1428:14162`; the list has all twelve rows, a stationary identity/search area, and an independently scrolling viewport above Back to review. The avatar strip shows four people and +8. Twelve shares of $8 sum to $96; custom three-person shares remain $48/$24/$24.

The added prototype starting point is Review a 12-person proposal. Its edit example `1430:13163` contains twelve equal shares, and sent example `1430:13227` counts eleven invited contributors, excluding the host. Search is a design field, not live filtering. The large-group edit demonstrates equal shares; interactive custom-unit switching remains in the existing three-person example. All values are prototype fixtures, not actual user records or delivery events.

Change wording is direction-neutral: **Reason for the change (optional)** and **Your host proposed a change to your contribution.** Reallocations can follow bill contributors joining or leaving, even with an unchanged bill total. Signed differences and increase/decrease labels must describe each person's actual share. Existing positive-delta examples remain valid examples, not a restriction to increases. New contributors still accept their own terms; Circle membership is separate.

File `1hAy3kcZAEvqq8ZNjKU7CD`. Sources remain in `02 Components`, with instances in `03 Screens`.

| State | Screen | Source |
| --- | --- | --- |
| Equal | `1377:13124` | `1405:13240` |
| Dollars | `1408:12182` | `1405:13286` |
| Percentages | `1408:12188` | `1405:13341` |
| Preview equal | `1408:12194` | `1406:13255` |
| Preview dollars | `1408:12200` | `1406:13267` |
| Preview percentages | `1408:12206` | `1406:13267` |
| Sent | `1408:12212` | `1406:13279` |

Reuses the existing toggle, Wi-Fi, back and action components and color variables. The existing host-proposal entry now opens equal allocation. The switch and its enclosing row navigate together; tabs switch custom units. Each preview displays its matching sample, Edit returns to the originating unit, and Send opens a simulated confirmation.

Examples: $96 total; equal $32 each; custom $48/$24/$24 or 50%/25%/25%. These are predetermined prototype values. Production unit switching must preserve custom allocations. Fields are editable design text, not live numeric input. Calculation, input validation, persistence, real proposal delivery, consent enforcement and provider operations remain application work. The reason field is an empty placeholder, not a submitted explanation.

Validation: rendered equal and percentage forms, corrected auto-layout sizing and preview amount alignment, checked route destinations and new screen placement. Form heights are 537/626/653px within a 664px viewport; footers remain at y794. No new screen overlap. Browser click-through and runtime financial tests were not performed for this Figma-only change.

Free/core for hosts: Split the bill the way your group agrees. Transparent proposals support acceptance and recurring retention. Measure completed proposals and contributor acceptance; consent is not paywalled. No provider configuration is required for this design artifact.

## September 12 - proposal summary and response status polish

Implemented the approved generated previews in Figma. Reusable summary card `1445:14472` replaces the spaced-text summary inside sent source `1406:13279`; its date and response count are text properties. Includes prominent bill/Circle identity, calendar and contributor icons, compact orange awaiting badge, and View responses link. Neutral information-card instances use the black info icon.

Response source `1420:13503` and screen `1420:13562` now use a unified card with mint gradient identity header, clear count/date, reusable response rows `1446:14619`, and editable lavender/peach avatars. Sources remain on 02 Components and screen instances remain undetached. The contributor outline icon is `1446:14612`.

The existing 12-person sent screen now links to response screen `1448:14903`, using source `1448:14673` with 11 contributor rows (host excluded). Its 1,449px content scrolls within the 664px viewport; actions remain fixed. Current terms and no-payment messaging are preserved. This is visual prototype work only; no consent or payment behavior changed.

Validation: reviewed rendered summary/status screenshots; confirmed all text uses Inter, 14 navigation destinations exist, affected top-level screens/components do not overlap, and the small response body fits its viewport (662px within 664px). No application code changed or runtime tests required.

### September 12 - compact response cards

User feedback supersedes the expanded card spacing above. Two-contributor card `1447:14593` is now 340px high (previously 508px); contributor rows are 72px rather than 120px. Identity-header padding is 8px vertically, outer vertical padding is 14px/10px, and section gaps are 12px. The 11-contributor card uses the same compact rhythm and is 997px high. Text sizes, editable avatars, response states and fixed footer navigation are unchanged. Verified the rendered screen and live instance dimensions.
