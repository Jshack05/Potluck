# Potluck provider-ready prototype

Open `index.html` in a modern browser. This remains a front-end-only prototype: it issues no cards, calls no financial APIs, and moves no money.

## Real-world ownership model

- The host is the sole future Highnote account holder, legal cardholder, and owner of the provider balance.
- Members are Potluck participants only. Their suggested/custom shares, Ready state, renewal approvals, and reimbursements are application records—not provider account ownership or card permissions.
- The host would fund the card using an approved host funding method. Member reimbursements remain outside Potluck in the first version.

## Provider boundary

`provider-adapter.js` defines the intended backend-facing contract:

- `createHostAccountHolder()`
- `getHostOnboardingStatus()`
- `createSubscriptionCard()`
- `getCardBalance()`
- `getCardDisplayToken()`
- `addHostFunds()`
- `freezeCard()` / `closeCard()`
- `configureSpendControls()`
- `receiveAuthorizationWebhook()` / `receiveTransactionWebhook()`

The UI uses `MockPaymentProvider`; `HighnotePaymentProvider` is deliberately disabled. A real implementation must live behind the Potluck backend, keep credentials server-side, verify webhooks, and map provider events idempotently.

## Security and state

- PAN, CVV, and expiration are absent from defaults and are never persisted. Migration deletes these legacy fields before saving state.
- A future reveal flow should request a short-lived display token and mount Highnote's Card Viewer SDK or another approved secure viewer. Normal Potluck APIs should not return card credentials.
- Mock balances remain in localStorage only while `balanceSource` is `mock`. A real Highnote card uses `balanceSource: "provider_ledger"` and reads its balance from the provider through the backend.

## Spend-control preparation

Subscription cards carry an abstract `spendControlConfig`: intended merchant, transaction limit, and one successful renewal per calendar month. Exact merchant matching and available controls require confirmation during Highnote program design. Potluck approval can become an input to a future authorization decision, but it is not represented as a payment guarantee here.

## Launch caveat

Highnote program approval, KYC, consumer disclosures, funding design, fees, and merchant-lock configuration must be cleared with Highnote and its bank/program team before launch.
