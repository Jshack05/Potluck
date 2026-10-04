# Ending a shared bill — September 13, 2026

Implemented the three approved visual prototypes in Figma file `1hAy3kcZAEvqq8ZNjKU7CD`, with four supporting history destinations. The prototype flow starting point is **End a shared bill**.

| Screen | Node |
| --- | --- |
| Review ending | `1525:18671` |
| Bill ended | `1525:18787` |
| Bill history | `1525:18886` |
| September payment record | `1528:18888` |
| August payment record | `1528:19006` |
| July payment record | `1528:19124` |
| Contribution records | `1528:19242` |

## Behavior and example

The actor is the Bill Host. The example ends Internet bill in Apartment crew on September 30, 2026. September is paid, no transfers are in progress, and no funds remain to resolve. October's future contributions are canceled. Ending the bill does not cancel the external service, remove Circle members, close the funding card, refund previous payments, or erase history.

The review explains the consequences before its explicit **End shared bill** action. Confirmation opens the ended bill's history. Each history row opens its matching settled bill-payment record; contributor history is a distinct host view. Back/cancel actions return to the Bills index or the ended bill history as appropriate. The flow can be launched directly from its Figma starting point; the existing Bills index is not a persistent post-closure simulation.

Fixtures: September and August bill payments are $96 each; July is $84. Maya, Jordan and Taylor each contributed $32, $32 and $28 respectively: $92 per person, $276 total. Provider bill settlement and received contributions are separate records.

Pending transfers, outstanding obligations and unresolved earmarked funds require their own accurate treatment in production. Do not reuse this clear-to-end fixture to imply those states disappear. Existing provider-controlled transfers retain their state. Provider timing and resolution rules remain application/provider work.

## Design and reuse

Sources live in **02 Components**; undetached screen instances live in **03 Screens**. Twelve new reusable sources include the three screen bodies, two supporting content bodies, summary/history/explanation rows, and four editable vector assets. Archive artwork is native vector geometry, not a flattened mockup. Bill identity, neutral information cards, calendar, avatars, buttons, back controls and chevrons reuse existing components. Relevant labels, amounts, months and icon choices expose component properties.

The 430 × 932 shell, 390 × 664 content area, fixed actions, Inter typography, mint rounded-square bill icon, neutral Ended badge, and black information icon follow the current design guidelines. All three main bodies fit the viewport. Supporting bodies range from 481 to 559px.

[Approved visual reference](2026-09-13-ending-shared-bill-prototype-v1.png). The prior general flow image was preserved as [before-bill-ending-v12](../ui-flow/2026-09-13-before-bill-ending-v12.png); it is a historical snapshot, not a new map of these screens.

## Marketable purpose

Target: hosts ending a shared arrangement and contributors retaining records. Promise: **End sharing clearly, without losing your history.** This is Free/core closure and consent functionality. A transparent exit supports invitation trust and reduces support friction; closure is never a subscription gate. Future paid convenience must stand independently of essential access. Compared with deleting an expense tracker entry, this flow distinguishes future collection, historical contributions, merchant service, and bill settlement. Measure closure completion, accidental-end reports, and support contacts about post-ending charges or missing history.

## Validation

- Rendered all three main screens and all four history destinations.
- All 20 new prototype navigation actions resolve to existing destinations.
- No text-boundary issues across the seven screens.
- No overlaps involving the seven new screens or twelve component sources.
- Verified editable archive artwork and flexible identity text widths.
- No real bill, payment, notification, refund or contribution agreement was changed. Figma uses predetermined examples; backend permissions, consent/audit events, reconciliation and durable state are not implemented here.
