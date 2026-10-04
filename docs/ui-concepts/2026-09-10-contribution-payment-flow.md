# Contribution payment — September 10, 2026

Approved flow: review a one-time contribution, confirm it, see transfer pending, and inspect contribution status. Paid is a later settled state, not the result of clicking View contribution.

## Figma assets

File: `1hAy3kcZAEvqq8ZNjKU7CD`.

- Reusable editable **Core Icon / Dollar bill**: `1347:11956` in 02 Components.
- **Contribution / Transfer in progress illustration**: `1347:11961`. Includes an undetached banknote instance, bank icon, and the standard Bills icon with a shallow dashed path directed toward their centers. Later approved refinements removed both mint icon circles, reduced the Bills icon weight and size, and centered the tilted banknote on the dashed path. Three trailing strokes fade from transparent to mint toward the banknote. Artwork is static in Figma.
- Payment review: `1348:10898`.
- Transfer pending: `1348:10951`.
- Pending contribution details: `1348:11048`.
- Received contribution details, separate later-state example: `1348:11099`.

The Bills summary's next-contribution hotspot `1307:12332` now opens payment review. Review reuses the connected-account selector; selection persists through the existing account variable. Confirming opens Pending; View contribution opens Pending details. Back to bill returns to Groceries `714:3018`. There is deliberately no automatic transition to Received.

## Product intent and limits

This is Free/core for an existing contributor: **Know what you are sending and whether it has arrived.** It completes invitation activation and recurring contribution review; measure first-contribution completion and duplicate-payment attempts. Paid convenience remains roadmap context. Provider settlement remains authoritative; acceptance, payment initiation, pending transfer, and received funds are separate concepts.

The $18, September dates, bank accounts, and statuses are illustrative. Figma does not initiate transfers, store consent, deduplicate real payments, persist financial state, or receive settlement events. Returning to an existing bill detail does not recalculate that screen's financial fixtures. The real application must enforce accepted terms, account eligibility, authorization, idempotency, and reconciled provider state.

## Validation

Rendered review and pending layouts and inspected the final illustration. Confirmed all four frames are 430 × 932, content fits above actions, new component/screen placement has no overlaps, and all prototype navigation destinations exist. The dollar bill remains an instance in the illustration. Prior map preserved as `docs/ui-flow/2026-09-10-before-contribution-payment-v10.png`.
