# Potluck prototype handoff

## What this package contains

- `index.html` — complete front-end prototype, including styles, UI, demo authentication, role switching, invitations, contribution agreements, approvals, reimbursement records, and mock card activity.
- `provider-adapter.js` — provider interface, working mock adapter, and deliberately disabled Highnote placeholder.
- `assets/` — default profile silhouette and the Host/Contributor demo portraits.
- `README.md` — run instructions, ownership model, security rules, and launch caveats.
- `INTEGRATION.md` — future backend and Highnote integration map.

Open `index.html` directly in a modern browser. No build step or dependencies are required.

## Demo identities

- Host: Joseph Hostelford, username `joseph.host`.
- Contributor: Joseph Contrelford, username `joseph.contrib`.
- Use the role selector and role-specific **Quick login** button.
- Logout and switch identities to verify that invitations, contribution changes, Ready state, and renewal approvals are shared between both personas.

Additional searchable contributor profiles are included to demonstrate fuzzy username matching. They are directory samples, not additional quick-login identities.

## Persistence

- Shared demo application state is stored in browser `localStorage` under `potluck-card-workspace-v9`.
- The active signed-in identity is stored in `sessionStorage` under `potluck-demo-session`.
- Older `splitnest-card-workspace-*` localStorage keys are migrated into the Potluck key on first save.
- Uploaded profile pictures are resized in the browser before being stored.
- Clearing site data resets the demo.

## Product and legal model

- The host is the only future Highnote account holder, legal cardholder, and owner of provider-held funds.
- Contributors are not cardholders, authorized users, or owners of the balance.
- Contributor shares, Ready state, invitations, approvals, and reimbursement records are Potluck application state only.
- Contributor money does not move through Potluck. Reimbursements remain external in the first real version.
- The host funds the future card using an approved host funding method.
- No current action issues a card, contacts Highnote, charges a payment card, or moves money.

## Provider boundary

The adapter reserves these operations:

- `createHostAccountHolder()`
- `getHostOnboardingStatus()`
- `createSubscriptionCard()`
- `getCardBalance()`
- `getCardDisplayToken()`
- `addHostFunds()`
- `freezeCard()`
- `closeCard()`
- `configureSpendControls()`
- `receiveAuthorizationWebhook()`
- `receiveTransactionWebhook()`

Real Highnote calls must be implemented on the Potluck backend. Browser code must not hold Highnote credentials or receive PAN, CVV, or expiration data.

## Prepared data model

Host fields:

- `highnoteAccountHolderId`
- `highnoteApplicationId`
- `onboardingStatus`

Card fields:

- `provider`
- `highnoteCardProductId`
- `highnoteFinancialAccountId`
- `highnotePaymentCardId`
- `cardStatus`
- `spendControlConfig`
- `balanceSource`

Activity fields:

- `providerEventId`
- `eventType`
- `authorizationStatus`
- `settlementStatus`
- `amount`
- `merchantData`
- `createdAt`

## Spend-control intent

Subscription cards prepare an abstract intended-merchant rule, transaction amount limit, and one-successful-renewal-per-calendar-month velocity rule. Exact merchant matching and control availability must be confirmed with Highnote and its bank/program team.

Potluck can produce an application-level allow/deny signal from agreement and approval state. That signal is not a payment guarantee and does not replace provider authorization, card status, ledger balance, clearing, reversals, or settlement.

## Production work still required

1. Backend authentication, users, invitations, and persistent database storage.
2. Highnote program approval, KYC/onboarding, disclosures, funding design, fees, and card-product configuration.
3. Server-only Highnote adapter and credentials.
4. Verified, idempotent webhook processing.
5. Provider-ledger balance reads instead of `mockBalance`.
6. Approved host funding flow instead of the mock Add funds action.
7. Highnote Card Viewer SDK or another approved secure card-detail flow.
8. Final merchant-lock, transaction-limit, and velocity-control design.
9. Authorization workflow that treats Potluck approval as only one policy input.
10. Security, privacy, accessibility, compliance, and end-to-end testing.

## Important caveat

Do not present this prototype as capable of issuing or funding real cards. Highnote program approval and bank/program-team clearance are prerequisites for launch.
