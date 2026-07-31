# Highnote integration map

The browser should call only the Potluck backend. The backend owns the Highnote adapter, credentials, display-token exchange, webhook verification, idempotency, and provider-to-domain mapping.

## Domain fields

Host records reserve `highnoteAccountHolderId`, `highnoteApplicationId`, and `onboardingStatus`.

Card records reserve `provider`, `highnoteCardProductId`, `highnoteFinancialAccountId`, `highnotePaymentCardId`, `cardStatus`, `spendControlConfig`, and `balanceSource`. `mockBalance` is prototype-only.

Activity records reserve `providerEventId`, `eventType`, `authorizationStatus`, `settlementStatus`, `amount`, `merchantData`, and `createdAt`.

## Future authorization boundary

Potluck may compute an application-level allow/deny signal from the current agreement and renewal approvals. A backend authorization handler can consider that signal alongside provider card status, provider ledger balance, merchant controls, amount limits, and velocity controls. Highnote remains authoritative for the financial account, card, authorization, clearing, reversal, transaction, and ledger state.

Never translate a member's Ready or Approved state into a claim that money is reserved, available, or guaranteed.
