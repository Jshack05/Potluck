# Declined proposal resolution prototype

The September 12 prototype implements the approved host options after a contributor declines: message, revise, remove from the bill, keep the current share, or withdraw unaccepted changes.

## Entry and scope

Copy refinement: user-facing withdrawal actions now say **Cancel proposed changes**, with **Proposed changes canceled** as the outcome. Supporting copy makes clear that already accepted agreements, pending transfers and past obligations remain unchanged. This simplifies the wording without broadening cancellation to accepted terms.

Figma file: 1hAy3kcZAEvqq8ZNjKU7CD. Start the named flow **Resolve a declined proposal** at `1462:15167`. Reusable source components remain on 02 Components; undetached screen instances are on 03 Screens.

Fifteen connected screens include review, cancel and illustrative outcome states. Buttons navigate between predetermined examples. The message draft, allocation inputs and split-mode controls are design fixtures, not live text entry, calculation or communication. No real message, agreement change, removal or payment occurs. View bill returns to the existing Internet bill example, which does not persist these simulated outcomes.

## Rules and example amounts

- The bill is $96/month. Jordan accepted $32; Taylor declined a proposed $32 and retains the current $28 agreement. With the host at $32, the remaining planning difference is $4.
- Message opens a direct draft with bill context. Its sent screen is explicitly a prototype preview, without a fabricated recipient reply.
- Revise demonstrates $34 host / $32 Jordan / $30 Taylor. Jordan's unchanged accepted terms remain; Taylor must accept the changed share.
- Keep current share reviews $36 host / $32 Jordan / $28 Taylor. The host explicitly confirms the additional $4 and manual-payment arrangement.
- Remove reviews $64 host / $32 Jordan / $0 Taylor from the effective date. Existing obligations, transfer history and Circle membership remain separate. No transfer is initiated.
- The alternative removal plan proposes $48 / $48. Jordan must accept and removal remains unconfirmed until the plan is ready. No silent redistribution.
- Withdrawal applies only to unaccepted proposed terms, preserving accepted agreements, pending transfers and past obligations. The remaining $4 difference is visible and can open the host-cover review.
- Future application implementation must enforce permissions, consent, timing and transfer reconciliation; these screens do not establish provider support.

## Screens

| State | Screen | Source |
| --- | --- | --- |
| hub | `1462:15167` | `1460:14956` |
| options | `1462:15308` | `1460:15037` |
| message | `1462:15426` | `1460:15083` |
| message_sent | `1462:15533` | `1460:15118` |
| remove | `1462:15640` | `1460:15153` |
| removed | `1462:15768` | `1460:15218` |
| keep | `1462:15895` | `1460:15273` |
| kept | `1462:16027` | `1460:15333` |
| withdraw | `1462:16159` | `1460:15393` |
| withdrawn | `1462:16278` | `1460:15440` |
| revision_review | `1462:16397` | `1460:15487` |
| revision_sent | `1462:16527` | `1460:15545` |
| revise | `1462:16657` | `1460:15603` |
| redistribute | `1464:16013` | `1464:15906` |
| redistributed | `1464:16139` | `1464:15978` |

## Marketable purpose

Free/core for bill hosts and contributors: resolve a declined share without awkward surprises or hidden changes. Clear resolution supports proposal acceptance and recurring bill retention; it does not introduce a paid gate. Measure resolution completion, time to an accepted covered plan, repeat proposals and clarification contacts. The value beyond a bill tracker is explicit group agreement and visible funding responsibility.

## Validation

Reviewed rendered mobile screens; all 15 content bodies fit their 664px viewports. Verified 50 navigation destinations and no overlapping new screens or source components. App-shell typography is inherited from the existing screen; content uses existing Inter styling. Amount examples sum to $96 where a full plan is proposed. Runtime financial tests are not applicable to these Figma-only fixtures.
