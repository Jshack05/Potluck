# Bill follow-up screens — September 12, 2026

Implemented the 12 approved prototype screens, with 13 supporting states for account selection, return navigation, transfer history and bill context. These Figma examples extend the [declined-proposal resolution flow](2026-09-12-proposal-resolution.md).

## Figma entry points

File: `1hAy3kcZAEvqq8ZNjKU7CD`. Sources are on **02 Components** (`1:122`); undetached screen instances are on **03 Screens** (`1:123`).

- **New shares accepted** — `1480:16596`
- **Complete an accepted removal** — `1480:16958`
- **Resolve a declined revision** — `1480:17401`
- **Manage your contribution** — `1480:17474`

## Design and reuse

The screens use the existing 430 × 932 mobile shell, a 390 × 664 content viewport, fixed bottom actions, warm neutral backgrounds, white rounded cards and subtle shading. Main actions retain the established teal treatment. Soft orange distinguishes a declined or unpaid state; neutral information cards use a black outlined information icon.

Reusable sources include:
- Bill identity: `1475:16029`; teal circular treatment: `1483:17577`.
- Status badge: `1475:16063`.
- Contributor status row: `1476:16033`; amount row: `1484:17626`.
- Agreement detail row with a swappable icon: `1476:16042`.
- Funding account option with swappable radio state: `1476:16050`.
- Footer actions with labels that fill the available width: `1495:18435`.
- Editable document illustration: `1475:16065`; document icon at 24px: `1496:18430`; repeat icon at 24px: `1496:18434`.

The new icons were imported as native SVG vectors, not flattened screenshots. The approved Lucky, bank, calendar, radio and moving-dollar artwork are reused. Avatar initials, fills and images remain editable; status labels, names, amounts and icon swaps remain component properties. The 36 new reusable sources comprise the screen bodies and shared primitives. Existing unrelated components were preserved.

## Example rules and scope

- Acceptance confirms terms; it does not mean money was transferred or received.
- The accepted-share example is $96/month split $32 each among Maya, Jordan and Taylor, starting October 1.
- The accepted removal plan is $48 each for Maya and Jordan. Taylor's removal requires a separate confirmation and takes effect on October 1. Circle membership, previous obligations and transfer history remain distinct.
- The revised-decline example compares Taylor's existing $28 with the latest proposed $30. It links to the earlier message, revision and resolution fixtures.
- Account management is a separate automatic-contribution example: $32 monthly on the 1st, changing from Personal checking •• 4821 to Savings •• 1108 from October 1, until canceled. The authorization is reviewed before confirmation; the confirmation does not initiate a debit.
- The stop example ends future recurring contributions on September 25. The October 1 future contribution is canceled; a transfer already processing retains its independent status, and earlier amounts owed are not erased.
- The October bill's manual-payment example has separate manual terms and a $32 pending-transfer state. The manual flow does not enable automatic payments.
- Host, contributor and date examples are distinct fixtures. They do not imply all events happened in one account timeline.

All navigation uses predetermined Figma states. No real bank connection, message, consent record, account change, removal or payment occurs. Revisiting selection screens resets to their example data; the prototype does not implement durable state or every repeated-edit combination. The bank connection screen previews a provider handoff only. Runtime implementation must enforce actor permissions, versioned consent, provider-supported timing, idempotency and reconciliation. Final provider authorization language remains application/provider work.

## Screens

| State | Screen node | Source component | Scope |
| --- | --- | --- | --- |
| Everyone accepted | `1480:16596` | `1477:16042` | Approved screen |
| Scheduled shares | `1480:16675` | `1477:16121` | Approved screen |
| Updated bill October | `1480:16885` | `1477:16181` | Approved screen |
| Removal plan accepted | `1480:16958` | `1477:16254` | Approved screen |
| Confirm accepted removal | `1480:17153` | `1477:16305` | Approved screen |
| Updated contributors | `1480:17226` | `1477:16349` | Approved screen |
| Revision declined again | `1480:17401` | `1477:16409` | Approved screen |
| Your agreement | `1480:17474` | `1477:16476` | Approved screen |
| Choose funding account | `1480:17547` | `1477:16578` | Approved screen |
| Review funding change | `1480:17823` | `1477:16632` | Approved screen |
| Stop future contributions | `1480:17896` | `1477:16692` | Approved screen |
| Future contributions stopped | `1480:17969` | `1477:16748` | Approved screen |
| Funding account updated | `1480:18183` | `1478:16474` | Supporting state |
| Your contribution history | `1480:18256` | `1478:16600` | Supporting state |
| Funding authorization details | `1480:18329` | `1478:16657` | Supporting state |
| Current funding account selected | `1489:17891` | `1486:17582` | Supporting state |
| Past contributors | `1489:17970` | `1486:17659` | Supporting state |
| Connect another funding account | `1489:18043` | `1486:17690` | Supporting state |
| Review October contribution | `1489:18240` | `1486:17739` | Supporting state |
| October contribution pending | `1489:18313` | `1489:17837` | Supporting state |
| Bill after accepted removal | `1489:18386` | `1486:17858` | Supporting state |
| Bill with ended agreement | `1489:18621` | `1486:17933` | Supporting state |
| Manual contribution terms | `1490:18336` | `1490:18185` | Supporting state |
| Contribution history with pending transfer | `1490:18415` | `1490:18253` | Supporting state |
| Bill with automatic agreement | `1490:18488` | `1490:18298` | Supporting state |

## Marketable purpose

**Target user:** bill hosts resolving shared terms and contributors managing their own funding agreements. **Promise:** know what happens next and remain in control of your contribution. These are Free/core capabilities: essential consent, cancellation, account management and accurate financial states are not paid gates. Clear invitations and review paths support acquisition; reliable recurring-bill management supports retention. Future paid convenience can build on this trustworthy core without restricting it. Unlike a passive tracker, these flows make each person's agreement, effective date and funding status explicit. Measure proposal-resolution completion, agreement-management completion, time to a covered plan and clarification/support contacts.

## Validation

- Visually reviewed every approved screen and the account-selection, updated-agreement, pending-transfer and removal return states.
- All 25 screen bodies fit their 664px viewport; the tallest is 662px.
- No horizontal overflow or wrapped footer labels.
- All 87 prototype navigation actions have valid destinations.
- No overlap among the new screen frames or the 36 new source components.
- Reusable detail icons fit 24px slots; account choices use the approved radio components.
- Application tests and provider calls were not run: this change consists of Figma designs and their documentation.

