# Contribution agreement flow — September 10, 2026

Implemented in Potluck Core UI Figma, file `1hAy3kcZAEvqq8ZNjKU7CD`.

## Approved copy and scope

Use the same headings for every bill: **Review your share**, **Choose how you’ll contribute**, and **Your contribution is set up**. Bill names, people, amounts, schedules, and accounts are content; do not write a custom marketing headline for each expense.

The core path is two steps and a confirmation. An Inbox bill invitation opens the agreement, separately from the existing Circle invitation. Manual acceptance does not authorize automatic transfers. Automatic acceptance shows an explicit recurring authorization and its selected account, amount, first date, frequency, and cancellation condition. Neither confirmation means funds have settled or grants spending rights.

This Free/core flow serves invited contributors and hosts. Promise: understand your share and agree with confidence. Invitations drive acquisition; recurring clarity supports retention. Measure invitation-to-acceptance and first-contribution completion. Essential consent and account selection are not paid features; paid convenience remains roadmap context.

## Figma entry and screens

- Inbox / Invites: `1209:7402`, new bill invitation instance `1330:10965`.
- Review: `1330:10437`.
- Manual acceptance: `1330:10511`.
- Automatic acceptance: `1330:10587`.
- Manual confirmation: `1330:10657`.
- Automatic confirmation: `1330:10694`.
- Manual / automatic full terms: `1330:10731`, `1330:10778`.
- Connected-account selection: `1330:10825`.
- Declined invitation: `1330:10860`.
- Ask host / illustrative sent question: `1330:10886`, `1330:10901`.
- View bill returns to existing Groceries detail `714:3018`.

Reusable `Contribution / …` sources are on **02 Components**, with undetached instances on **03 Screens**. Reused the existing grocery, bank-house, back, primary-button, and health-face components. Colors reference existing variables. `Contribution / Flow` stores the selected account as a text variable (`VariableID:1327:11496`), shared across account selection, terms, and confirmation.

## Validation and limits

Checked rendered review, acceptance, confirmation, and Inbox screens. All eleven new screen frames are 430 × 932, with primary actions aligned at y=832 and no content overlap. Checked component and screen placement for overlap and all navigation destinations for existence. Live Figma clicks verified Continue, account selection and persistence, switching to automatic, full terms and Back, and automatic confirmation. The step-two back buttons return directly to review.

Fixtures use $18 weekly from September 17, 2026, until canceled. Connected accounts are existing illustrative accounts. New bank linking is not implemented in this flow. The question branch demonstrates one preset message, not a functional text composer or live messaging. Figma acceptance/decline does not persist server-side agreement state or update the existing bill’s financial history. Production requires accepted terms, server authorization, provider-supported account eligibility and transfer behavior, audit records, and reconciled settlement. No real money movement occurs here.

Visual references: [Review](2026-09-10-contribution-review-v1.png), [Accept](2026-09-10-contribution-accept-v1.png), [Confirmation](2026-09-10-contribution-ready-v1.png).

## Approved visual refinement and future app motion

Payment choices now use 18px labels and 16px helper text with editable outlined radio controls; selected controls retain a white gap between the teal ring and center dot. Both payment states use the same geometry.

Confirmation keeps the standardized heading and uses a larger reference-matched mint Lucky with curved happy eyes, a smile, and peach/lilac accent dots. The editable source is `Contribution / Lucky celebration` (`1340:11945`) in 02 Components. The amount is 48px; the account icon has a mint bubble and payment method appears in a mint pill. Updated evidence: [Acceptance v2](2026-09-10-contribution-accept-v2.png), [Confirmation v2](2026-09-10-contribution-ready-v2.png).

User request for the real app: confetti falls from the top when the contribution-accepted screen first appears after successful acceptance. This is a future runtime animation, not implemented in Figma. Use a brief, nonblocking celebration, respect reduced-motion preferences, and avoid replaying it merely on Back or a terms-screen return. The celebration acknowledges agreement acceptance, never payment settlement.
