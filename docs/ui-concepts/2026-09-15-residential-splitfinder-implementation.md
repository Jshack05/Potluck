# Residential Splitfinder — September 15, 2026

## Follow-up — Verification at Publish

Removed the early ID disclaimer from review component `1661:22119` (notice `1661:22143` and text `1661:22144`). Checked address, details, review, and both alternative-property forms for early ID notices: none remain. Visually checked the review screen and confirmed Publish `1662:22722` still routes verified posters to published management and unverified posters to the existing verification step. Draft state and verification requirements are unchanged. This is a Figma-only presentation change.

## Follow-up — Move-in dates and housing filters

The user's follow-up adds exact move-in timing for students/renters and search filters, superseding the earlier messaging-only timing note. Every property-entry path now has a calendar-linked move-in field; dates are bound into detail, discovery, review, profile, and management presentations. Shared fields/components and native editable text remain reusable.

New screens: Filters `1678:22256`, January calendar `1678:22411`, February calendar `1678:22561`. Total: 24 residential screens. Calendars are prototype fixtures for January/February 2027, not a production date-input service. Dates use day indices to avoid Figma numeric precision rounding.

Filters support inclusive from/through dates, maximum estimated monthly share (Any / $800 / $1,000 examples), and minimum beds/baths/roommates sought. The same start/end date matches that exact day. Invalid ranges stay in the filter screen with an explanation. Clear resets criteria. Apply combines criteria and active-post state; browse shows result counts and no-results content. Room filters reuse the vertical arrow stepper.

Updated validation: 55 reaction/viewport/destination checks passed, including exact dates, ranges, price/date combinations, no results, invalid ranges, reset, and all five calendar return contexts. No unresolved destinations. Visual inspection covered filters, calendars, and updated discovery. This is reaction-logic evaluation, not a live browser or backend test. Historical counts below describe the initial implementation.

Implemented in Figma file `1hAy3kcZAEvqq8ZNjKU7CD`. This is a design prototype, not a deployed publishing, messaging, identity-verification, or payment service.

## Entry points

- Existing Spaces discovery now has “Find a home to split” leading to `1662:23381`.
- Existing Living → “Let’s find a place” now leads to `1662:22425`.
- Original existing-place and Working paths remain available.

## Screen map

| Screen | Figma node |
| --- | --- |
| address | 1662:22425 |
| details | 1662:22507 |
| estimate | 1662:22621 |
| review | 1662:22713 |
| add2 | 1662:22799 |
| add3 | 1662:22917 |
| detail1 | 1662:23035 |
| detail2 | 1662:23119 |
| detail3 | 1662:23203 |
| profile | 1662:23287 |
| browse | 1662:23381 |
| inquiry | 1662:23465 |
| chat | 1662:23546 |
| verify | 1662:23625 |
| pending | 1662:23702 |
| manage | 1662:23777 |
| remove | 1662:23858 |
| removed | 1662:23933 |
| draft | 1666:23311 |
| photos | 1666:23384 |
| override | 1666:23456 |

## Reuse and presentation

21 residential body components live on 02 Components; 03 Screens contains linked instances in the existing 430 × 932 Splitfinder shell. Existing labeled fields, actions, header controls, navigation, theme tokens, and apartment photo fixtures are reused. The new reusable vertical Number stepper is `1659:22066`; a compact profile identity component is `1670:23422`. Splitfinder screens retain blue; the profile stays Potluck green. Fields remain native editable Figma text. Photos, properties, identity status, rents, and chat content are illustrative fixtures.

## Interaction coverage

- Beds, baths, and roommates use up arrow → centered number → down arrow, with 44px arrow targets. Beds and roommates move in whole steps; baths use half steps. Each property has independent counters. Prototype bounds are beds 0–20, baths 1–20, roommates 1–20; these demonstration bounds are not approved production inventory limits.
- Add 1–3 properties, review each as an independent public post, save/resume a draft, and use a photo-selection checkpoint. After the third property, Add another place disappears.
- An explicit People sharing rent counter demonstrates a transparent calculation basis. The example uses $2,400 total rent, with estimates rounded to cents. A separate override screen demonstrates a $900 custom estimate. Arbitrary field entry, final default denominator, and production monetary calculation are not implemented by Figma.
- The prototype starts with a verified poster fixture. Publish routes unverified state to ID check; that handoff remains pending without simulating provider approval. Browsing and inquiry messaging have no ID gate.
- Individual property details reveal no alternate property list. The profile groups alternatives and supports multi-selection; selected properties appear in the inquiry/conversation. No recipient-acceptance gate precedes the conversation.
- Manual removal confirms the selected property and hides only that post from discovery/profile; other alternatives remain. Chat history remains available. No automatic roommate countdown, applications, leases, deposits, or mandatory card adoption is introduced.

## Validation

40 evaluated checks passed against stored Figma reactions, including counter increments/lower bounds, 3-property limit, ID gating, empty/multiple selections, unrestricted inquiry entry, estimate calculation/override, individual removal, all 21 viewport/scroll configurations, and destination resolution. This is reaction-logic evaluation and visual inspection, not a live browser end-to-end test or backend test. The final audit found 227 nodes with reactions and no unresolved destinations.

Rendered review covered the counter form, estimate, multi-property review, individual property detail, profile grouping, inquiry, and removal confirmation. Long content scrolls above fixed actions/navigation. The original Bills screen and its icons were not part of this change.
