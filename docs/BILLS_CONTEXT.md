# Potluck Bills Context

## October 7, 2026 — Collection states and controls

All bills (left) and Shared (right, default) remain present while loading and when empty. Both scopes reuse the established No bills yet artwork; a Shared-only empty result can direct users to All bills when personal bills exist. The Import bills action follows its existing Figma design at approximately 1.5 times its prior dimensions, alongside the creation + above navigation. It opens the existing bank-import/manual-entry flow.

Summary month and Overview/By week controls remain available while a month request is pending or fails. Leave unresolved content blank initially and show only minimal feedback after 500 ms; do not use skeleton placeholders. Preserve current-resource data through a refresh and expose any refresh failure. A new month/scope starts a fresh loading delay and must not show the old month's total. Loading is not an empty collection or a financial zero.

## October 7, 2026 — Manual Bills before banking

The latest founder instruction permits unconnected manual Bills after sign-in. A self-only planning Bill is saved as a draft without contribution offers; shared proposals still record exact terms and require each person's acceptance. Importing bank-detected Bills and bank-funded payment actions lead to bank setup. No provider is configured locally, so the app must not invent detected charges, linked accounts or transfer results. Bank outages must not remove organization, agreement review or cancellation access. Resource permissions continue to apply independently of bank status.

The live original Figma layout recovered for the app places **All bills left, Shared right**, with Shared selected by default. Saving a personal Bill explicitly opens All bills. The prior September 8 written ordering below is superseded by this restoration decision. The source chooser, icon/color identity, calendar and schedule, direct people/allocation, Card connection, review, acceptance, changed-share review, management and ending flows reuse the established designs. Import results remain unavailable until backed by real suggestions.

Private Bills with no agreement history skip allocation. Summaries include the host's personal draft Bills on their scheduled dates, separately labeled from accepted contribution shares; these plans are not debit consent. Once proposed to people or ended, a Bill leaves the personal total. See the [restoration record](ui-concepts/2026-10-07-bill-flow-restoration.md).

## October 5, 2026 — Contextual bank setup (superseded above)

Signing in opens Circles and Splitfinder. Before bank confirmation, the Bills tab uses the established Figma empty-state illustration and a bottom **Connect bank account** action. It does not load Bill data or enable creation, contribution acceptance or financial mutations. The bank handoff retains the destination and allows navigation back to social areas. Provider confirmation remains server-owned and is separate from consent to any contribution or debit. Existing cancellation, dispute and funds-access continuity must be resolved before enabling a live provider; current local financial execution remains unavailable.

**Status:** Product direction approved; implementation details marked as open remain unresolved.
**Last updated:** October 7, 2026

## Purpose

This document is the authoritative detailed context for Potluck Bills. Read it with `PRODUCT_CONTEXT.md` and the repository `AGENTS.md` before planning, designing, implementing, or reviewing a Bills change.

## Product Decision

Bill Hosts can end future shared-bill collection after reviewing the consequences. Ending a Bill retains payment/contribution history and does not itself cancel the external service, close its funding Card, remove Circle membership, refund settled payments, or erase unresolved obligations. The September 13 [Figma ending flow](ui-concepts/2026-09-13-ending-shared-bill.md) demonstrates the case with no pending transfers or funds left to resolve; other settlement states require their own accurate handling.

Bills and cards are separate first-class product objects.

- A card is the host-owned payment container and control surface.
- A bill is a one-time or recurring obligation with its own amount or calculation method, schedule, contributors, contribution agreements, funding state, and history.
- One card may fund multiple bills.
- Card creation is intentionally lightweight: name, visual color or design, and optional description. The card appears on the dashboard immediately in a `Draft` or `Setup required` state until required card-level settings and activation prerequisites are complete.
- People may be invited directly to a Bill without being added to its funding Card. Bill contribution and Card spending access are separate roles.
- A Circle may be attached to a Bill as an invitation shortcut, with attachment-specific exclusions and individual agreement acceptance.
- Free users can create and fully manage viable bills from the Bills, Circle, or Card context.
- Premium users receive a dedicated cross-card Bills workspace that makes bills substantially easier to organize, fund, monitor, and optimize.

The card remains visible to the host. Contributors interact primarily with the bill, their accepted contribution terms, their own funding state, and required actions. They do not become cardholders by contributing.

## Card and Bill Setup Flow

### Saved bill collection (approved September 5, 2026)

The core Bills screen has **Shared** first on the left and **All bills** second on the right, with **Shared** selected by default (approved September 8, 2026). The selected tab is underlined in Potluck green. All bills is the complete saved collection, including confirmed imports from every import date and bills created in Potluck; sharing a bill does not remove it from this collection. Shared is a connection filter: it contains only bills attached to a Circle or funding Card. A Card-only connection belongs in Shared but must not display a Circle badge or imply that other people have joined. Ordinary import completion still explicitly opens All bills so the newly saved imports are visible.

Unshared imports expose **Share bill**. The user chooses a connection, reviews the bill and connection, and saves it. The existing bill then appears in Shared while retaining its identity and import history in All bills. Connection alone does not send contribution agreements, enroll Circle members, grant spending access, activate collection, or move money. Contribution terms and individual acceptance remain separate prerequisites.

Import confirmation saves the selected bills to All bills without requiring immediate sharing or contribution setup. Older imports are not hidden by a current-month cutoff. Confirmed imports must remain distinct from unreviewed detection suggestions and must be deduplicated against existing bill records in the application implementation.

This is Free/core organization, not an approval to implement Premium analytics, forecasts, optimization, subscriptions, or paywalls. The target user is a host organizing existing bills; the promise is "See every bill and share the ones you pay together." Import-to-sharing creates the invitation opportunity, retained history supports recurring use, and the primary metric is the share of confirmed imported bills connected to a Circle or Card. Paid conversion remains a future convenience/scale hypothesis and does not gate this workflow. Unlike a passive bill tracker, the connection can lead to separately accepted contribution arrangements. Provider systems remain authoritative for bank activity and financial state.

### Contribution invitation (approved September 10, 2026)

Host allocation proposals use a **Split equally** toggle. When off, **Dollars / Percentages** controls allow individual allocation; percentages also show dollar equivalents. Require the full total to be allocated before preview. Material changes still require each affected contributor's acceptance. The Figma examples and application boundaries are documented in [Host bill allocation](ui-concepts/2026-09-11-bill-allocation.md).

The subsequent manual payment flow is documented in [Contribution payment](ui-concepts/2026-09-10-contribution-payment-flow.md): review → pending → pending details. Received is a separate settled-state example. The Bills next-contribution row opens this review flow. The reusable dollar-bill icon and centered transfer illustration live in 02 Components.

Use standardized headings: **Review your share**, **Choose how you’ll contribute**, and **Your contribution is set up**. The two-step path presents the bill's individual terms, then the contributor's funding account and manual/automatic choice, followed by confirmation. Manual acceptance is not automatic debit authorization, and acceptance is not settlement. Circle membership and spending access remain separate. The implemented Figma routes, reusable sources, evidence, and limitations are recorded in [Contribution agreement flow](ui-concepts/2026-09-10-contribution-agreement-flow.md).

### Collection summary (approved September 9, 2026)

Shared and All bills each have their own scoped summary. The larger collection tabs remain above the compact summary card. Inside it, smaller **Overview** and **By week** tabs use the same Potluck-green underline. Overview is the default and shows the selected month, the user's contribution total, and the next contribution's bill, amount, date, and applicable status. By week replaces that content with weekly contribution totals for the selected month; it does not repeat a large total or the next contribution. Switching either set of tabs keeps the summary height, list position, and bottom navigation stable.

The total concerns the user's share of occurrences in the selected month, not full bill charges, a card balance, or an outstanding-money balance. Shared includes connected bills; All bills also includes personal bills. Weekly and one-time contributions belong to their contribution dates, even when the underlying merchant charge falls in a different month. Flexible amounts must be identified as estimates. Historical saved bills remain in the list independently of the summary's selected month. Payment, contribution settlement, scheduling, and manual action must remain distinct states.

This is Free/core contribution clarity for hosts and contributors: "See your share and what comes next." It supports recurring review and informed sharing without an upgrade gate. Measure summary usage and on-time accepted contributions; paid conversion remains a future convenience hypothesis. Provider events and accepted agreements remain authoritative in an application implementation. Viewing the summary or opening a bill never initiates a transfer.

Figma sources in `02 Components`: `Bills / Summary tabs` (`1299:11314`) and `Bills / Summary` (`1303:11718`). Twelve variants cover two scopes, two views, and August–October 2026. `Bills / Summary` variables store view, month, dimensions, and next-row visibility. Source-backed instances live in the existing Bills library variants; the main screen remains `714:2708`. The card is 390 x 248 after the September 10 spacing refinement; the overview total uses 36px type with 16px beneath its text box; main tabs use 20px labels and secondary tabs 14px. The next-row screen hotspot (`1307:12332`) opens Groceries and is hidden for By week and the ended August example.

The generated preview's $100/$118.98 figures were illustrative and differed from existing bill details. Figma now uses a September shared estimate of $210.10: Internet $21, Electric $11.50, Phone $25.60, four grocery contributions of $18, and the $80 lodging contribution due September 29. Weekly groups are $43.60, $39, $29.50, and $98. All bills adds $18.98 in personal imports, totaling $229.08. The next example uses Groceries $18 on September 17, Manual, after the current grocery occurrence already shown as paid for Jordan. Adjacent-month amounts and import-date allocation are editable demonstration fixtures, not imported financial history or live calculations. The Figma summary does not dynamically recalculate arbitrary newly imported or newly shared bills; the application must do so from its accepted terms, actual schedules, and visibility rules.

Validation: live clicks checked both collection scopes, both summary views, next-month navigation, the next-contribution link, and Back. All twelve variants retain 390 x 248 summary bounds and identical list bounds; weekly values sum to monthly totals. New component sets do not overlap existing sources. Existing outer navigation/import/create actions were preserved. Visual references: [Overview](ui-concepts/2026-09-09-bills-overview-figma-v1.png) and [By week](ui-concepts/2026-09-09-bills-by-week-figma-v1.png).

### New bill creation

The primary setup sequence is:

```text
Choose Fixed or Flexible Bill
→ enter Bill identity, amount, and schedule
→ select a Circle or individual people and apply exclusions
→ Potluck calculates an equal split by default
→ Bill Host confirms or changes the proposal
→ select an existing funding Card or create a Card shell inline
→ review and send individual contribution agreements
→ contributors review and accept
```

Creating a card shell requires only a name, visual color or design, and optional description. It must not silently create a bill, send invitations, activate transfers, grant spending access, select a shortfall policy, or represent a provider card as active. The host completes required card-level settings, including the host-selected shortfall policy, before financial activation.

The Card detail remains the management hub for its setup, funded Bills, Trusted Spenders, Activity, and Controls. A Bill contributor does not receive Card access. A person added to a Card is invited separately as a Trusted Spender and must complete any issuer-required approval steps. Contribution roles and approved spending roles remain independent.

Bill creation uses a page-by-page flow that collects, in order:

1. Fixed or Flexible bill type
2. Bill identity and optional merchant information
3. Amount, maximum, and estimate as applicable
4. Frequency, expected date, and first occurrence
5. A Circle or individual people, with attachment-specific exclusions
6. Potluck's default equal-split calculation, followed by Host confirmation or proposed changes
7. Allocation method, proposed shares, host remainder, and contributor caps
8. Manual or proposed automatic contribution timing
9. The existing funding Card, or inline creation of a lightweight Card shell when none exists
10. Review and confirmation before individual invitations or terms are sent

Adding a new Circle member to an existing equal-split Bill begins with one Host action. Potluck recalculates the proposed split, the Bill Host confirms or changes it, and updated individual agreements are sent. Previously accepted recurring agreements remain active until they are validly replaced, canceled, revoked, or expired. A new invitee contributes `$0` until accepting; Potluck does not silently redistribute the uncovered share.

## Marketable Promise

### Contribution visibility (September 5, 2026)

The Bill people panel shows each included person's agreed contribution beneath their name, with both a color and a status label: green Paid, amber Not paid before the agreed date, and red Overdue after that date. Paid means settled contributions cover the accepted amount for the displayed occurrence; pending, partial, failed, canceled, and unaccepted arrangements must retain their distinct state in the application. Monthly bills use the current month; weekly and one-time Bills identify the applicable occurrence instead of pretending to be monthly.

Selecting a person opens their settled paid amount / accepted amount, agreed payment date and schedule, agreement acceptance date, Circle join date, and elapsed Circle membership. The ratio is money paid versus money due, not installments completed. Dates and amounts in Figma are illustrative fixtures as of September 5, 2026; application state must come from accepted agreements, membership records, and reconciled payments. Viewing does not edit terms or initiate collection.

Visibility follows Bill and Circle permissions, including anonymous-Circle restrictions. Hosts may view applicable contributor readiness; a contributor's access does not automatically expose another person's private funding account or hidden membership. The core promise is "See who has paid and what is still due." This Free feature supports invitation clarity and recurring payment readiness; measure contribution-detail engagement and on-time accepted contributions. Paid convenience remains roadmap-only, and essential financial status is never gated.

### Card balance clarity and funding (September 5, 2026)

Cards distinguish available spending, settled funds reserved for individual Bills, and pending transfers. The sum of bill reservations must reconcile to the card's reserved amount. Pending money does not count as available or reserved settled money, and a host cannot freely spend Bill reserves. Bill-specific funding and general Card funding remain distinct purposes.

This Free/core capability serves hosts and eligible contributors: "Know what you can spend without using next month's bill money." Clear funding readiness supports accepted invitations and recurring use; no paid gate is introduced. Future paid convenience is a roadmap hypothesis only. Unlike a passive tracker, the intended behavior couples allocations with enforceable card authorization. Measure reviewed-funding completion and successful next-bill funding, with incorrect-balance incidents as a guardrail. Provider support, source ownership, server-side permissions, explicit transfer consent, idempotency, and settlement reconciliation remain implementation prerequisites.

The flagship promise is:

> Potluck keeps every shared bill organized, funded, and optimized without chasing people or getting surprised by changes.

The Premium Bills experience combines three benefits:

1. **No chasing, no surprises:** Prioritize readiness, funding, exceptions, and clear next actions.
2. **Bill command center:** Provide cross-card organization, an agenda, calendar, filters, forecasts, and bulk management.
3. **Spend less on recurring bills:** Surface meaningful amount changes, recurring-cost trends, annualized impact, and opportunities to review or replace unnecessary services.

Every Bills feature must identify its acquisition, subscription-conversion, retention, and competitive-differentiation purpose. Bills should create an invitation loop because hosts bring contributors into Potluck, a conversion path because hosts want cross-card automation and control, and retention because recurring agreements and history reduce repeated coordination work.

## Research Basis

Competitive research establishes several table-stakes patterns:

- Rocket Money organizes recurring charges into Upcoming, All, and Calendar views and detects recurring charges from connected transaction history. [Rocket Money](https://help.rocketmoney.com/en/articles/3117398-where-can-i-view-my-subscriptions-and-bills)
- Monarch detects possible recurring items, asks the user to review uncertain matches, and distinguishes upcoming, paid-as-expected, and changed-amount items. [Monarch](https://help.monarch.com/hc/en-us/articles/4890751141908-Tracking-Recurring-Expenses-and-Bills)
- Quicken Simplifi combines recurring reminders with projected cash flow, supports amount-matching rules for variable bills, and permits occurrence-level changes without rewriting the series. [Quicken Simplifi Bills and Income](https://support.simplifi.quicken.com/en/articles/4109588-using-the-bills-income-section), [amount matching](https://support.simplifi.quicken.com/en/articles/9174873-amount-matching-for-recurring-transactions)
- Splitwise supports recurring shared expenses and group reminders but remains primarily a shared-expense ledger. [Splitwise](https://kb.splitwise.com/balances-and-expenses/how-can-i-manage-recurring-expenses)

Potluck must meet those expectations but should not market itself as another passive recurring-charge calendar. Its differentiation is coordinated execution: accepted group formulas, contributor-controlled limits, funding availability, host shortfall behavior, card controls, and provider-reconciled payment state in one workflow.

Reminder research supports timely, actionable notices but does not justify indiscriminate alerts. Potluck should deliver an alert when the recipient can understand the issue, deadline, consequence, and next action. [NBER reminder study](https://www.nber.org/papers/w17020), [CFPB bill-payment research](https://www.consumerfinance.gov/data-research/research-reports/consumer-insights-paying-bills/)

## Roles, Ownership, and Privacy

- The host is the sole primary account holder and remains financially responsible.
- Contributors accept contribution agreements but receive no card credentials, spending rights, withdrawal rights, or provider-account ownership merely by contributing.
- Settled and available contributions become host-owned funds earmarked for the applicable bill.
- Hosts may see bill-level contribution status but not unnecessary private bank details.
- Contributors see their own terms, calculated amount, cap, funding status, notices, and history.
- A contribution change that increases or materially alters a contributor's obligation requires that contributor's explicit acceptance.

## Bill Data Model

A bill should record at least:

- Host and linked card
- Merchant or payee identity using provider identifiers where available
- Name and category
- Bill type: Fixed or Flexible
- One-time or recurring status
- Frequency, billing date, and next expected occurrence
- Fixed recurring amount, or Flexible bill maximum and optional estimate
- Contribution allocation formula
- Contributors and their agreement versions
- Expected, pending, available, and shortfall amounts
- Reference to the linked card's host-selected shortfall policy
- Bill and occurrence states
- Provider authorizations, clearings, reversals, refunds, and disputes
- Audit events and timestamps

Each occurrence must remain distinct from the recurring bill series so one month's amount, date, status, or exception can change without silently rewriting past or future occurrences.

## Fixed and Flexible Bills

### Fixed bill

A Fixed bill has the same configured amount for each recurring occurrence. The host may later propose a new amount, but a change that increases or materially alters a contributor's obligation requires renewed contributor acceptance before the changed agreement becomes active.

### Flexible bill

A Flexible bill is intended for expenses such as utilities whose final amount changes by occurrence. It has:

- A required host-configured bill maximum
- An optional monthly estimate used for forecasting and allocation previews
- An actual occurrence amount when known from an approved source or provider event
- Contributor allocation formulas and independently accepted personal caps

The bill maximum is a card-control and exception boundary for the bill; the optional estimate is informational and must never be presented as the final amount, guaranteed amount, or transfer authorization. A contributor's personal cap is separate and may be lower than the overall bill maximum.

If an observed or requested charge exceeds the Flexible bill maximum, Potluck creates an exception and applies supported card controls and the linked card's shortfall behavior. The interface must not promise that every above-maximum charge can be stopped because delayed, offline, force-posted, or other provider-permitted transactions may still post.

Fixed and Flexible are core bill types, not paid safety features. Plan entitlements may govern advanced allocation formulas, automation, analytics, and cross-card administration, but must not remove access to a bill's current status, consent, caps, disputes, or closure controls.

## Contribution Agreements

A contribution agreement may use:

- Equal shares
- A fixed-dollar allocation
- A percentage allocation
- A mixed fixed-dollar and percentage allocation

For variable bills, the host proposes the calculation method rather than choosing a new final dollar amount every month. The contributor accepts the formula, expected bill range, schedule, funding source, effective date, notice terms, and personal maximum.

### Mixed-allocation example

For a bill with final amount `T`:

```text
Person A funds the first $100
Remaining balance R = max(T - $100, $0)
Person B calculated share = 30% x R
Person C calculated share = 70% x R
```

For a $300 bill:

```text
Person A = $100
R = $200
Person B = $60
Person C = $140
```

If the bill is less than $100, Person A contributes only the actual bill amount and percentage contributors owe $0. Monetary calculations use integer minor units and a documented deterministic rounding rule.

### Contributor-controlled caps

Each contributor may set a personal hard cap. The host may not raise that cap.

If the calculated contribution exceeds the accepted cap:

```text
agreement state = CAP_EXCEEDED
transfer amount = $0
transfer initiation = blocked
```

Potluck must not silently debit the cap amount, raise the cap, change the percentage, or redistribute the missing share. A future, separately accepted agreement could offer an explicit "contribute up to my cap" behavior, but that is not the approved default.

The contributor receives the calculated amount, cap, and confirmation that no transfer was initiated. The host receives the resulting bill shortfall and resolution choices.

## Variable Bills and Price Changes

Padding, first-payment padding, Bill Cushions, and rolling price reserves are not part of the Bills design.

### Host explanation for a proposed increase (approved September 11, 2026)

The host's contribution-change flow must offer an optional **Reason for the change** text field. It supports increases, decreases, and reallocations when people join or leave the bill. Show submitted text to affected contributors as **Note from your host**, alongside the current share, proposed share, effective date, and updated terms. Omit the note section when no note is supplied. The note is the host's explanation, not a verified statement from Potluck.

Use standardized review copy: **Your host proposed a change to your contribution.** Do not infer a provider cause from the amount. A confirmed change to the people sharing the bill may show **Group size changed**; describe a person joining or leaving only when that event is known. Generic wording is **The people sharing this bill changed. Your host proposed a new split.** Circle membership alone must not imply bill participation or reallocation. The host may include a note in every case.

Compute each person's change independently: an increase, decrease, or unchanged share can coexist in one proposal. Show signed dollar differences and accurate percentage/annual equivalents; decreases say **decrease** and **less per year**, while unchanged shares say **No change**. Avoid percentage division by zero for new contributors or a prior zero share. A lower amount may use a calm mint treatment; preserve soft orange for increases. New bill contributors receive their own contribution terms for acceptance. For example, an unchanged $96 bill shared by three then four people changes equal shares from $32 to $24; a $96 bill reduced to $84 with three people changes them from $32 to $28.

The proposed increase remains inactive until the affected contributor accepts the updated terms. Member departure does not silently redistribute obligations. Preserve the explanation with the proposal version shown during review; it does not replace exact amount, schedule, funding-source, effective-date, and authorization terms. This feature is specified for development; the image prototype does not implement it.

This Free/core feature serves hosts explaining changes and contributors deciding whether to accept: **Understand a proposed increase before agreeing.** It supports trust in invitations and repeat bill use, differentiates consent-based sharing from passive tracking, and should be measured by proposal-review completion and clarification-message rate. Essential explanations and acceptance remain outside paid conversion gates.

The September 11 Figma implementation is recorded in [Bill recovery and changed contributions](ui-concepts/2026-09-11-bill-recovery-flow.md). It includes host proposal and preview screens, contributor review and outcomes, a restrained failed-transfer screen, reconnection handoff, and reusable editable artwork. Form input, note persistence, role enforcement, and real financial state remain application work.

A changing utility, phone, or subscription amount is routine when:

- The final bill stays within the accepted bill-level range.
- Every contributor's calculated amount stays within their accepted agreement and personal cap.
- Required notice and transfer timing rules are satisfied.

Potluck calculates each share automatically and gives contributors advance notice of the actual amount. A higher amount must not cause a surprise debit.

A future price-change watcher may use a host-confirmed bill notice, an invoice or statement provided with explicit permission, transaction history, or a provider authorization amount. Each signal must be labeled by confidence, such as `SUSPECTED`, `CONFIRMED`, or `OBSERVED_AT_AUTHORIZATION`. Potluck must not claim that a merchant raised its price when it has only observed a larger amount; variable usage, taxes, fees, or plan changes may also explain the difference.

The change becomes an exception when:

- The final bill is outside its accepted range.
- A calculated share exceeds a contributor cap.
- The amount arrives too late to satisfy required notice or funding timing.
- The merchant or bill identity cannot be matched confidently.
- A contribution fails or will not become available before the bill is due.

Permitted host resolutions include:

- Cover the current shortfall under `HOST_COVERS`.
- Propose a one-time allocation that affected contributors explicitly accept.
- Propose new recurring terms effective for a future occurrence.
- Ask a contributor to review and voluntarily change their cap.
- Allow the bill to follow `DECLINE_IF_UNDERFUNDED`.
- Review, downgrade, replace, pause, or close the bill.

Potluck must show the dollar and percentage change and its annualized impact. It must distinguish an ordinary variable bill from a detected recurring-price increase and must not invent a reason for an amount change.

For recurring electronic transfers, Regulation E generally requires advance notice when the amount varies while allowing a consumer to elect notices based on an agreed amount or a reasonable specified range. Final authorization, notice timing, stop-payment, and revocation behavior require provider and legal review. [CFPB Regulation E §1005.10](https://www.consumerfinance.gov/rules-policy/regulations/1005/10/), [Nacha ACH developer guidance](https://achdevguide.nacha.org/index.php/how-ach-works)

## Bill States and Exception Handling

Important workflows use explicit states rather than loosely related booleans. The detailed state machine remains an implementation-design task, but the user-facing model should resolve to:

- **On track:** Terms are accepted and scheduled funding is expected to be available.
- **Needs attention:** A user action is required but the due date is not yet at immediate risk.
- **At risk:** A cap, failed contribution, missing consent, unavailable funding, amount change, or timing problem threatens the bill.
- **Paid:** The provider reports the bill transaction as cleared or settled.

Every exception must identify one reason, the affected occurrence, the responsible actor, the deadline, and the safest available next action. Provider authorization is not a payment guarantee, and force-posted transactions or provider exceptions may bypass an authorization-time decline.

## Free Bills Experience

Free users must be able to complete a safe bill workflow within each eligible card. Essential access must not be paywalled.

During the current core-product implementation phase, this is the Bills experience to build. Treat it as the ungated working product rather than surrounding it with Premium previews, locked controls, upgrade prompts, or subscription checkout.

The Free bill experience includes:

- Create, view, edit, pause, and close a bill within a card
- Bill schedule and next occurrence
- Equal and fixed-amount contribution agreements
- Basic automatic and manual contributions
- Contributor invitations, acceptance, revocation, and personal caps where applicable
- Current occurrence readiness and funding state
- Essential notices and cap/shortfall warnings
- Both host shortfall policies
- Accurate current-month summaries and required personal history
- Consent, dispute, refund, closure, and access-to-funds protections

Variable and mixed-allocation entitlement placement must remain consistent with the approved plan configuration. A safety-relevant cap is never a paid feature.

## Premium Bills Workspace

The Premium Bills workspace is approved roadmap context but is explicitly deferred from the current implementation phase. Do not build its navigation, gates, previews, upgrade prompts, or paid-only behavior until a later approved task reopens Premium scope and the core Bills workflow has been validated.

When Premium development begins later, it should be positioned as advanced control, not merely higher limits. Its Bills workspace should reduce administrative effort across every card.

Proposed flagship capabilities are:

- **Action Inbox:** Missing consent, cap exceeded, failed contribution, funding delay, price change, merchant mismatch, or approval needed
- **Upcoming agenda:** Bills ordered by due date, readiness, and risk
- **Calendar:** Cross-card month and future views
- **All Bills:** Search, sort, saved filters, active and archived series
- **Funding forecast:** Expected bill totals, contributor amounts, settled and pending funding, projected host exposure, and shortfalls
- **Smart notices:** Configurable, actionable alerts consolidated to avoid notification fatigue
- **Bulk management:** Apply reminder, review, filter, notification, or supported policy changes to selected bills
- **Recurring-cost insights:** Amount changes, annualized impact, trends, and review opportunities
- **Automation:** Execute already-authorized schedules and routine notices while stopping on material changes or exceptions
- **History and reporting:** Cross-card analytics, exports, and long-term audit history according to plan entitlements

The workspace should default to exceptions and next actions rather than a passive chart collection. Each bill row or card should answer: what is due, who is ready, whether funds will be available, what changed, and what the host should do next.

## Marketability Requirements

For each proposed Bills capability, product work must document:

- Target user
- One-sentence user-facing promise
- Acquisition or invitation loop
- Free, Plus, or Premium placement
- Subscription-conversion rationale
- Recurring retention mechanism
- Competitive alternative and Potluck differentiation
- Primary success metric

Bills should be marketed as coordinated execution, not merely tracking. Calendars and recurring-charge detection are competitive table stakes; Potluck differentiates by connecting accepted group terms, contributor funding, card controls, shortfall policy, and bill payment state.

## Success Measures

- Time from bill creation to accepted contributor agreements
- Invitation and agreement acceptance rates
- Percentage of bills on track before their funding deadline
- Reduction in manual host reminders
- Cap-exceeded and shortfall resolution rate before the due date
- Intended bill authorization and clearing success rates
- Free-to-paid conversion attributable to Bills workspace use or limits
- Premium Bills workspace weekly and monthly host engagement
- Recurring bill retention and paid-plan renewal
- Price-change exceptions resolved without unauthorized transfers
- False matches, false alerts, disputes, returns, and support contacts

Metrics must never encourage hidden enrollment, silent obligation changes, excessive retries, or difficult cancellation.

## Open Decisions

- Whether a cap-exceeded share may ever be redistributed among contributors who separately pre-authorized flexible redistribution
- Whether a future "contribute up to my cap" mode should exist alongside the approved hard-stop cap
- The deterministic rounding method for percentage allocations in minor units
- How multiple fixed-dollar allocations behave when their combined amount exceeds the final bill
- Which source provides a final variable-bill amount early enough for notice and funding
- Which recurring amount changes qualify as a confirmed price increase rather than ordinary variability
- Exact Free, Plus, and Premium entitlement placement for mixed allocation formulas and advanced variable schedules
- The detailed bill-series and bill-occurrence state machines
- Provider and sponsor-bank support for bill-level authorization controls and data

These questions must remain unresolved until explicitly decided.

## Splitfinder membership import handoff - September 8, 2026

Creating a Splitfinder membership can open Bills to choose an imported charge or import another bill. The listing-specific Bills selector is `1246:10496`; selection returns to membership confirmation (`1246:9200`). Completing a bill import from this path returns to that selector, while ordinary import still returns to All bills. Both completion paths require at least one selected bill.

The listing carries the selected bill name, amount, and cadence into the proposed membership split. It does not expose bank-account details or billing history, connect a Circle, enroll contributors, or authorize collection. Hosts must separately confirm that the provider permits the proposed sharing arrangement. The Figma flow uses illustrative bill records and session variables; import services and consent enforcement remain application work.

## Bill follow-up prototype - September 12, 2026

The approved follow-up screens cover accepted shares, scheduled changes, an accepted removal plan, a declined revision, contributor agreement management, funding-account review, and stopping future contributions. Acceptance, money movement, bill participation and Circle membership remain separate. Reusable Figma sources, screen links, fixture boundaries and validation are recorded in [Bill follow-up screens](ui-concepts/2026-09-12-bill-followup-screens.md).

## Declined proposal resolution - September 12, 2026

Hosts can message a declined contributor, revise the proposal, review removal from the bill, keep the contributor's current share, or withdraw unaccepted changes. Removal is distinct from Circle membership and does not erase past obligations or transfer history. The host must review any funding difference; it is never silently reassigned to other contributors. A replacement share requires acceptance where terms change materially. Accepted agreements remain intact when other proposed changes are withdrawn.

Keeping the current share may require the host to explicitly cover a difference. A removal plan that depends on another contributor accepting a larger share remains unconfirmed until that plan is ready. These are Free/core consent and resolution capabilities. The connected Figma examples, limitations and validation are recorded in [Declined proposal resolution](ui-concepts/2026-09-12-proposal-resolution.md).

## Explicitly Rejected Direction

Do not reintroduce padding, an inflated first payment, a Bill Cushion, or a rolling price reserve unless the user explicitly reverses this decision. Variable ranges, accepted formulas, contributor caps, advance notice, and explicit exception resolution replace that concept.

September 10 visual refinement: increased summary height by 20px and the monthly total from 32px to 36px. Updated the reusable variants and aligned the next-contribution click target. Verified all twelve variant heights, main-screen rendering, and unchanged bottom navigation position. Current [Overview reference](ui-concepts/2026-09-10-bills-overview-figma-v2.png); earlier references remain preserved.
