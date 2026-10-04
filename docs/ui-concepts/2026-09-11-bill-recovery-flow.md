# Bill recovery and changed contributions — September 11, 2026

## Approved design

Implement the issue-resolution prototypes using Potluck's cream canvas, white cards, green actions, and reusable editable icons. The failed-transfer illustration is restrained: a red outlined exclamation in a pale blush circle, without cheerful movement rays. Changed contributions use the document-and-up-arrow illustration. Reconnection uses horizontal interlocking links and a reusable bank icon matched to the approved reference.

General change copy is **Your host proposed a higher contribution.** An optional **Note from your host** displays the host's explanation. No provider-cause badge is inferred. A confirmed member departure uses **Group size changed**. Contributor acceptance remains separate from proposals, membership changes, payment initiation, and settlement.

## Figma screens and routes

File: `1hAy3kcZAEvqq8ZNjKU7CD`. Screen instances are on `03 Screens` (`1:123`); reusable sources are on `02 Components` (`1:122`).

| Screen | Node |
| --- | --- |
| Needs attention | `1375:11172` |
| Transfer unsuccessful | `1375:11314` |
| Reconnect account | `1375:11413` |
| Higher contribution with host note | `1375:11493` |
| Group size changed | `1375:11617` |
| Above accepted maximum | `1375:11740` |
| Updated terms | `1377:13017` |
| Acceptance, decline, or proposal result | `1377:13061` |
| Secure bank connection handoff | `1377:13092` |
| Host proposes increase, with optional reason field | `1377:13124` |
| Host proposal preview | `1377:13177` |
| Message host | `1377:13249` |
| Choose eligible account | `1378:13204` |
| Message sent | `1378:13227` |

The Bills header has an issue entry (`1380:13239`) leading to Needs attention. Five example issues open their corresponding screens. View invitations reuses the existing invitation inbox. A retry returns to existing payment review (`1348:10898`) before any confirmation. Updated terms receive the selected scenario's bill, amount, effective date, schedule, and duration through prototype variables; acceptance alone leads to its result. Declining displays the previous accepted share. An above-cap example is a one-occurrence $29 approval and does not raise the ongoing $25 cap.

Account selection opens terms before the selected account is confirmed. Reconnection stops at an explicit provider boundary. The host has a separate proposal -> preview -> sent path. A host sending a proposal does not activate contributors' new obligations.

## Reusable assets

| Source | Node |
| --- | --- |
| Unsuccessful illustration | `1367:12230` |
| Updated terms illustration | `1367:12236` |
| Reconnect illustration | `1368:12230` |
| Info, message, screen, and unsuccessful core icons | `1367:12242`, `1367:12247`, `1367:12250`, `1367:12254` |
| Core Wi-Fi and lightning icons | `1374:12311`, `1374:12316` |
| Share comparison | `1370:12243` |
| Host note | `1368:12239` |
| Information strip | `1368:12247` |
| Issue row | `1368:12254` |
| Review actions | `1370:12275` |
| Unsuccessful payment card | `1372:12258` |
| Bills attention entry | `1380:13202` |

Comparison text and the host explanation are exposed as component properties. The host form specifies the optional reason field; its sample text is editable in Figma. Free-text input, optional-note persistence, and syncing a changed form value to the proposal are application work, not simulated text entry. A real empty note must hide the entire contributor note section.

## Product purpose and implementation boundary

Free/core for contributors resolving a problem and hosts explaining proposed changes: **Understand what needs attention and choose the next step.** Clear recovery protects invitation trust and recurring bill retention. Measure resolved issues before the due date, completed proposal reviews, clarification-message rate, and duplicate-payment attempts. Consent, accurate status, and recovery are essential access, not conversion gates. Paid convenience remains roadmap-only.

All amounts, accounts, dates, and bank-decline reasons are fixtures. A real unsuccessful-attempt state and retry eligibility must be provider-confirmed. Figma does not reconnect banks, send messages, store consent, activate agreements, or initiate payments. Its result screens represent intended states. Existing bill overview fixtures are not recalculated when an example result is viewed. The application must enforce role checks, explicit consent, idempotency, proposal-version audit records, account eligibility, and provider reconciliation.

## Validation

- All 14 screens are 430 × 932, use source-backed content, and have the same footer position (y794 to y908).
- Longer content scrolls inside a clipped viewport above the stationary footer.
- Checked all primary, secondary and back actions; 43 navigation destinations resolve, with no missing targets.
- Confirmed the terms' seven dynamic text bindings and the scenario values passed by proposal and account-selection actions.
- Rendered key screens and corrected the failed-state badge to a single line. Compared illustrations, dividers and icon placement against the approved prototypes.
- Zero new top-level screen overlaps, zero new source-component overlaps, and no zero-sized text nodes.
- Validation used Figma renders and structure/reaction inspection. A browser click-through was not completed in this run; runtime provider and accessibility behavior remain untested.
- Preserved the prior flow reference at `docs/ui-flow/2026-09-11-before-bill-recovery-v11.png`.

PNG references: `2026-09-11-bill-recovery-attention-v1.png`, `2026-09-11-bill-recovery-failure-v1.png`, `2026-09-11-bill-recovery-host-increase-v1.png`, and `2026-09-11-bill-recovery-group-change-v1.png` in this directory.

## Reconnect illustration refinement

Matched the supplied reference more closely in reusable source `1368:12230`: two horizontal rounded links, overlapping mint backdrops, six native editable gradients, a small mint highlight, a peach gradient accent, and a centered white medallion with a soft shadow. The bank glyph is an undetached instance of source `1397:13218`, available in `02 Components`.

Verified that Reconnect account and Secure bank connection handoff inherit this source at 210 × 116, each retaining all six gradients. Their 430 × 932 screen bounds and existing layout remain unchanged. Rendered both screens and checked the new component placement for overlap. Updated visual references: `2026-09-11-reconnect-account-v2.png` and `2026-09-11-bank-connection-v2.png`. This is an editable vector recreation of the raster reference, not a pixel-identical raster replacement.
