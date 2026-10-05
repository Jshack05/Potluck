# Potluck Product Context

## October 4, 2026 — Local-first full-app implementation

The founder confirmed there is no existing Supabase project and requested local-first development of the approved Circles, Cards, Bills and Splitfinder integration. Development accounts and persistent local PostgreSQL-compatible records are permitted; this is not verified production identity, financial approval, hosted deployment or launch. Card creation saves an unissued setup shell. Accepting Bill terms does not authorize a bank debit. The intended consumer funding/issuer model remains conditional on written program approval. See [local development](LOCAL_DEVELOPMENT.md) and the [capability register](architecture/full-app-capabilities.md) for current implementation limits.


## October 4, 2026 — Full Potluck integration planning scope

The founder explicitly reopened the whole application: connect **Circles, Cards, Bills, and Splitfinder** in the real Potluck app, using the existing Figma work. This supersedes the September 20 Splitfinder-only implementation boundary. Splitfinder is an optional discovery entry into the same product; existing friends and families can start with Circles, Bills, or Cards. The current request is for an implementation plan, issues, and solutions, not permission to execute live financial operations or a claim that the full application is implemented.

The integration must preserve independent resource permissions and consent. Accepting a Splitfinder request opens a conversation, not Circle membership, a contribution agreement, or Card access. Circle membership, Bill contribution acceptance, and issuer-approved spending grants remain separate. Bill contributors need not join the funding Card. Main navigation remains **Circles · Cards · Bills · Splitfinder**, with contextual guest discovery and invitation entry.

The [full integration plan](superpowers/plans/2026-10-04-full-potluck-integration.md) proposes implementation milestones, backend boundaries, design rules, and acceptance gates. Technical choices and unresolved product defaults in that plan are recommendations until approved. Core-only implementation remains in force: reopening all four product areas does not authorize Plus/Premium paywalls. Stripe remains the preferred provider where the intended consumer funding and card program is supported and approved in writing. Historical Lithic/Highnote references do not establish a selected or approved integration. Financial production activation still requires provider/bank approval and verified implementation readiness.

## October 2, 2026 — Connected family website story

Approved homepage explanation: a full-width Lucky family illustration below the product grid connects a Family Circle, individually agreed $60/$40/$20 contributions, a host-managed Family card and an illustrative $120 phone bill. The shared meter shows money set aside for that bill, not total available card funds. Its closing state is ready for payment, not a completed merchant payment. Financial capability remains planned and subject to approval; no transfer, agreement acceptance, spending grant or provider integration is implemented by the animation. Splitfinder remains an optional discovery entry, not a requirement for an existing family.

The public section serves prospective users and financial partners with the promise “Everyone brings their part.” It explains ongoing shared-bill coordination and the invitation opportunity; recurring clarity is the retention hypothesis. Unlike a standalone tracker illustration, it connects people, agreed contributions and the intended payment arrangement. This is an ungated explanation of core product scope, not a paid feature or subscription-conversion experiment. Relevant success measures are feature exploration and partner inquiries; analytics collection is not introduced here.

## October 1, 2026 — Website and conditional combined launch direction

**Visual website structure approved:** A concise homepage with a 2×2 product grid (Splitfinder, Cards, Bills, Circles), stacked vertically on phones. Each feature has a short dedicated page led by original app visuals, icons and brief captions; Splitfinder receives more discovery/joining detail. Longer explanations sit in expandable sections, with essential availability and consent boundaries visible. A Credits page holds fuller design/motion acknowledgments. No new product capabilities or financial availability are implied.

The founder's current website direction is to present Splitfinder and financial Potluck together, with an initial launch including both **if financial integration, program approval and implementation readiness permit**. This updates the earlier discovery-only launch intention; it does not assert that financial capabilities are approved, implemented or available. Stripe is the preferred provider for financial functions wherever its documented products, eligibility and written approval support the intended flow. Unsupported capabilities still require another approved provider or a scope reduction.

The immediate purpose of getpotluck.app is to explain the product to prospective card, banking and payment partners. Use the actual app's Figma components, approved brand statements and authentic artwork, with a spacious visual presentation. Do not base the site on the rejected generated prototype or its invented character. Public financial previews must be labeled as planned and subject to provider approval; no invented testimonials, usage metrics, partnership or compliance claims. This decision authorizes the marketing-site build, not financial implementation or a change to consent and ownership rules.

## September 20, 2026 — Splitfinder-first launch scope

**Launch with Splitfinder for housing and bills**, including subscription/membership group discovery, starting campus by campus from Georgia Tech. Full financial Potluck remains the longer-term destination, contingent on funding, provider/bank support, consent and implementation readiness. Experiences are possible later scope. Initial launch does not promise virtual cards, banking, pooled funds or automated collection. The intermediate coordination release and discovery-only navigation remain open.

Read the [consolidated launch and conversation decisions](2026-09-20-launch-and-conversation-decisions.md) for features, design preferences, naming candidates, dated branding research and unresolved questions. This update supersedes conflicting older initial-product assumptions below; it records decisions only and does not implement screens or services.

## Document Purpose

### September 17, 2026 — Splitfinder search direction

Search/discovery requirements are saved in [Splitfinder context](SPLITFINDER_CONTEXT.md#search-and-discovery-direction--september-17-2026) for later actual-app implementation. They cover category-aware search/filtering, clear share pricing, sorting, Spaces map/list, saved-search alerts, and later shared shortlists. Future screen work must design the real app surfaces and reusable controls rather than stand-in feature demonstrations. No screens or functionality are authorized by this note-taking request. The core experience remains ungated; no financial or verification rules change.

### September 15, 2026 — Residential Splitfinder decision reference

**Verification presentation follow-up:** Residential posters complete their draft before encountering verification at Publish. Omit up-front ID disclaimers in composition/review. Already verified posters publish directly; unverified posters retain their draft while completing verification, which remains required before publication.

**Move-in timing follow-up:** Residential posts support an exact move-in date, with housing-search filters for timing, estimated rent, and room/roommate counts. This supersedes the earlier messaging-only timing treatment. The current implementation and remaining runtime boundaries are recorded in `docs/SPLITFINDER_CONTEXT.md`.

The approved residential rental discovery answers are recorded in [Splitfinder context](SPLITFINDER_CONTEXT.md#residential-rental-discovery--september-15-2026) and synchronized in [splitfinder.md](../splitfinder.md). Users may create 1–3 separately searchable property posts, grouped only on their public profile. Anyone may post, subject to **poster-only ID verification**; inquiry senders do not require ID verification for this discovery flow. This supersedes older blanket residential discovery verification language without changing financial-feature verification/consent. Total rent and automatically estimated share are shown, with poster override; the default denominator is still unspecified. Required address/rent/roommates needed/lease length, optional website/introduction, and private discussion of move-in timing are approved. Posters manually remove completed posts. Scope is introductions/planning with optional encouragement to use Potluck cards/shared bills afterward; apartment partnerships are a future ambition. No Figma or backend implementation is claimed by this saved decision.

This document preserves the durable product context for Potluck so engineers and AI coding agents can understand what the application is, who it serves, how its core workflows should behave, and which decisions remain unresolved.

This is a living product document. Update it when the product model, terminology, business rules, provider assumptions, or important constraints change.

Implementation details belong in architecture documents and code. This document should focus on stable product truths.

---

## Product Summary

Host bill-allocation proposals support equal splitting or custom dollar/percentage shares. Preview requires a complete allocation; changing a split does not bypass contributor acceptance or initiate payment. See [Host bill allocation](ui-concepts/2026-09-11-bill-allocation.md).

Splitfinder is a separate discovery destination for sharing **Spaces, Experiences, and Memberships**, including arrangements still being planned. Its approved rules are recorded in [SPLITFINDER_CONTEXT.md](SPLITFINDER_CONTEXT.md). The main navigation is now **Circles · Cards · Bills · Splitfinder**, with Circles leftmost and still the default. Splitfinder introduces itself on first use; listing inquiries have a separate section in the global Inbox from ordinary direct and Circle messages.

Potluck is a shared-payment and virtual-card application designed to help groups pay recurring or shared expenses through host-controlled virtual cards.

A host is the sole primary account holder, owns the provider balance, and remains financially responsible. The host creates a shared card or bill, invites contributors, and proposes how much each contributor should provide. A contributor must review and accept the terms before Potluck initiates any transfer.

Contributors can fund the host-owned arrangement through manual or automatic bank transfers inside Potluck, subject to explicit authorization and approval from Lithic and its sponsor-bank partner. Settled contributions become host-owned funds earmarked for the applicable pool. Contributing does not grant card access, spending rights, or provider-account ownership; a separate approved spending grant may do so.

The virtual card may be used for many purposes, but the initial product is focused on:

- Shared subscriptions
- Family plans
- Phone bills
- Rent or household expenses
- Parent-and-child spending arrangements
- Spouse or partner shared spending
- General-purpose shared cards

Potluck also gives the host configurable transaction controls. These controls may allow or decline transactions based on industry, merchant category, marketplace, specific merchant, available funds, or other issuer-supported authorization data.

---

## Product Vision

Potluck should make shared expenses feel organized, transparent, consensual, and controllable.

The product should reduce common problems such as:

- One person fronting the entire bill
- Participants forgetting to send their share
- Unclear expectations about who owes what
- Unexpected purchases on a shared payment method
- Shared cards being used outside their intended purpose
- Repeated manual collection for recurring bills
- Disputes caused by contribution changes that were not agreed upon

Potluck is not merely a bill-splitting calculator. It combines:

1. A shared financial agreement
2. Participant funding
3. A virtual card
4. Transaction controls
5. A transparent activity and consent history

---

## Initial Target Users

### Friends sharing subscriptions

Examples:

- Streaming services
- Gaming subscriptions
- News subscriptions
- Shared software plans

### Families

Examples:

- Parent creates a controlled card for a child
- Family members contribute toward a phone plan
- Relatives share a recurring household expense

### Couples and spouses

Examples:

- Shared utility payments
- Shared subscriptions
- Household purchases
- A controlled shared-spending card

### Roommates and households

Examples:

- Rent contributions
- Internet service
- Utilities
- Household supplies

### Small informal groups

Examples:

- Clubs
- Travel groups
- Teams
- Recurring shared services

Business accounts and large groups are not part of the initial scope unless later approved.

---

## Core Roles

### Host

The host creates and manages a shared card or shared bill.

The host can generally:

- Create a shared card
- Invite participants
- Propose contribution amounts
- Propose whether contributions are one-time or recurring
- Configure card-control rules
- View relevant shared-card activity
- Pause or close the shared card, subject to settlement rules
- Remove a participant, subject to active obligations and refund rules

The host cannot silently create or increase a participantâ€™s financial obligation.

### Primary account holder

The host is the sole primary account holder, owns the provider balance, and remains financially responsible for every host-owned shared card. An issuer-approved supplementary credential does not give its assigned user ownership of the account or funds.

The host's legal relationship to the card does not authorize Potluck or the host to debit a contributor's bank account without the contributor's explicit, auditable consent.

### Contributor

A contributor is invited to provide funds toward a specific shared card or shared bill. A Bill contributor may be invited directly and does not need to be added to the funding Card. A contributor is not a cardholder, authorized user, joint owner, or owner of the provider-held balance.

A contributor can generally:

- Accept or reject an invitation
- Review a proposed contribution
- Accept or reject contribution terms
- Connect an eligible bank account through an approved provider
- Make a manual contribution
- Authorize an automatic contribution
- View their own contributions and applicable shared activity
- Cancel future automatic contributions subject to disclosed timing rules
- Leave a shared arrangement subject to pending transactions and obligations

A contributor gains no spending rights by contributing. The same person may separately receive an approved spending grant, but the two permissions must remain independent and revocable.

### Trusted Spender (authorized spender)

`Trusted Spender` is the approved user-facing term for an authorized spender or authorized user. A Trusted Spender is an approved adult who receives a unique card credential tied to a host-controlled pool. The spender may use only the assigned card and has no authority to manage the host account, contributions, other cards, or the underlying funds. Provider contracts, backend state, and audit records retain the legally and operationally accurate authorized-spender or authorized-user terminology.

### Managed spender

A managed spender is a minor or other household member whose unique card and spending access are controlled by the host. This role may be offered only when Lithic and the sponsor bank approve its eligibility, verification, agreement, card-naming, and wallet requirements. Potluck must not represent a managed spender as the host or distribute the host's credential as a workaround.

### Participant terminology

"Participant" remains the canonical contribution-domain term, while "contributor" is the preferred user-facing term for a person who provides funds. "Trusted Spender" is the preferred user-facing term for the separate authorized-spender role. "Managed spender" remains a separate spending role. Existing prototype copy may also use "member." Do not use "shared holder" or "subholder," because those terms imply ownership rights.

---

## Core Product Objects

### Circle

A Circle is a reusable, consent-based group and the primary people-centered interface object. Every person accepts a Circle invitation before joining. Circle membership alone creates no Bill obligation, Card access, spending right, account ownership, or visibility into private financial details.

Each Circle has one Circle Host responsible for membership removal, privacy mode, and Circle-level administration. In a normal Circle, any accepted member may attach a Card or Bill they host, subject to individual invitations and acceptance. In an anonymous Circle, members cannot see one another's identities, profiles, contributions, or attached assets, and only the Circle Host may attach Cards or Bills.

Attaching a Circle to a Bill prepares individual contribution invitations for the selected members. Attaching a Circle to a Card prepares individual Trusted Spender invitations. Attachment-specific exclusions do not change Circle membership. Later Circle membership changes never propagate automatically to existing Cards or Bills.

### Shared card

A shared card represents:

- A virtual card
- One host
- One primary account holder
- Zero or more contributors
- Zero or more approved spending grants and uniquely assigned credentials
- Funding arrangements
- Contribution agreements
- Potluck earmarks
- Card-control rules
- A host-selected shortfall policy
- Transaction and authorization history
- Shared-card status

The host creates the card shell with only a name, visual color or design, and optional description. The card appears on the host's dashboard immediately, but remains `Draft` or visibly `Setup required` until required provider verification, the host-selected shortfall policy, and any other activation prerequisites are complete. Creating the shell must not silently activate financial behavior or choose a shortfall policy.

Possible shared-card states may include:

- Draft
- Pending verification
- Active
- Paused
- Frozen
- Closing
- Closed

### Shared bill

A shared bill represents a one-time or recurring expense that participants agree to fund.

A shared bill and a shared card are separate first-class objects. A bill may be linked to a card, one card may fund multiple bills, and each bill has its own schedule, amount or calculation method, participants, contribution allocation, funding state, and history.

Recurring bills use two user-facing types:

- **Fixed bill:** The configured amount is the same for each occurrence until the host proposes a change. A change that increases or materially alters a contributor's obligation requires renewed acceptance.
- **Flexible bill:** The amount may vary by occurrence up to a host-configured bill maximum. An optional monthly estimate supports forecasting and allocation previews but is not an authorization, guaranteed charge amount, or substitute for the maximum. Contributor-controlled personal caps remain separate from the bill maximum.

Free users manage viable bills from within a card. Premium users receive a dedicated cross-card Bills workspace centered on exceptions, upcoming obligations, calendars, funding forecasts, automation, analytics, and recurring-cost insights. Detailed Bills requirements live in `docs/BILLS_CONTEXT.md`.

### Invitation

An invitation connects a proposed participant to a specific shared card or shared bill.

In the primary interface, people are added to a card before they are assigned to individual bills. A person may participate in zero, one, or multiple bills on that card. Adding a new person from a bill flow also adds that person to the parent card before creating the bill-specific assignment. Contribution and spending roles remain separate.

An invitation should record:

- Inviting host
- Invited person or destination
- Shared card or bill
- Proposed role
- Proposed contribution terms, if included
- Creation time
- Expiration time
- Acceptance or rejection state

Possible invitation states:

- Pending
- Accepted
- Rejected
- Expired
- Revoked

### Contribution agreement

A contribution agreement defines what a participant has accepted.

It should include:

- Participant
- Shared card or bill
- Amount or allocation method
- Expected bill range and calculation formula, where applicable
- Currency
- One-time or recurring status
- Schedule or trigger
- Funding source reference
- Start date
- Optional end date
- Maximum authorized amount, where applicable
- Participant-controlled hard cap, where applicable
- Consent version
- Acceptance timestamp
- Current status

Possible states:

- Proposed
- Accepted
- Active
- Paused
- Rejected
- Revoked
- Replaced
- Completed

### Pledge (working name)

`Pledge` is the provisional user-facing name for a contributor-approved monthly contribution agreement. The name is intentionally changeable; internal contracts should model the financial behavior as a recurring contribution agreement rather than hard-code `pledge` as a permanent domain term.

The host may propose:

- A fixed monthly amount
- A contribution date and start date
- A total contribution goal, or a time-based duration measured in months or weeks, including an explicitly accepted indefinite duration
- A selected Circle followed by an existing or newly created host-controlled shared Card that receives the goal earmark

The contributor must review and accept the exact amount, schedule, funding source, effective date, stopping condition, duration or total maximum, and any applicable visibility setting before the Pledge becomes active. The host may not impose it, choose the contributor's funding source, extend its duration, increase its amount or goal, or convert a goal-based Pledge to an indefinite Pledge without renewed contributor acceptance.

A goal-based Pledge completes only from provider-confirmed net settled contributions. Pending or failed transfers do not advance the goal, and returns, reversals, or refunds must adjust progress accurately. An indefinite Pledge continues under its accepted terms until the contributor revokes future authorization, the host ends future collection, the agreement reaches an accepted end date, or another valid terminal condition applies.

Goal contribution visibility is private by default: each contributor sees only their own contribution. A host may propose shared contribution visibility only for a normal, non-anonymous Circle, and that visibility term must be disclosed to every affected contributor before acceptance. Anonymous Circles never expose member identities or contribution amounts.

An optional goal lock may prevent Potluck from making goal-earmarked funds available for the configured goal purpose until the accepted total is reached or the accepted time-based period ends. A goal lock does not alter fund ownership, hide financial state, prevent revocation of future authorization, or override required refunds, reversals, disputes, or provider controls. Provider and sponsor-bank support for any production hold behavior remains an implementation prerequisite.

Pledge is intended as an ungated core convenience rather than a Premium feature, but its implementation should follow the basic one-time and recurring contribution workflow. Its user-facing promise is a simple way to steadily fund a shared purpose without repeated monthly coordination. Its invitation loop is host-to-contributor acceptance, its retention mechanism is the recurring monthly workflow, and its primary measures are proposal acceptance, successful scheduled contributions, goal completion, revocation, return, and support-contact rates.

### Contribution

A contribution is an individual attempt to move money from a participantâ€™s approved funding source into the shared arrangement.

Possible states:

- Scheduled
- Pending
- Processing
- Settled
- Failed
- Returned
- Reversed
- Refunded
- Canceled

### Card-control rule

A card-control rule determines whether a transaction should be allowed or declined.

Potential rule dimensions include:

- Industry
- Merchant category code
- Specific merchant
- Marketplace
- Transaction amount
- Available funds
- Time or date
- Recurrence behavior
- Geographic information, if supported

All controls depend on the attributes and decision capabilities exposed by the issuing provider.

---

## Primary User Journey

### 1. Host creates a card shell

The host creates a card with a name, visual color or design, and optional description. Potluck adds the card to the host's dashboard immediately in a `Draft` or `Setup required` state. The lightweight creation step does not invite people, create bills, activate transfers, issue an active credential, or silently select financial controls.

### 2. Host completes required card setup

From the card detail, the host selects the required card-level shortfall policy and completes provider verification or other activation prerequisites. Optional card controls, people, and bills may be added from the same card detail. The card cannot become financially active until required setup is complete.

### 3. Host adds people to the card

The host may add people to the card and separately propose contribution or spending roles. A person may be a contributor, an approved spender, both, or neither until a bill assignment or spending grant is completed. Adding a person to the card alone does not create a contribution obligation or spending access.

### 4. Host adds a bill and defines participation

From the card detail, the host creates a Fixed or Flexible bill through a page-by-page flow, selects existing card people or adds new people, and proposes how much each selected contributor should provide. People assigned to one bill are not automatically assigned to other bills on the same card.

Allocation methods may eventually include:

- Fixed amount per participant
- Equal split
- Percentage split
- Host-covered remainder
- Variable amount with an agreed maximum

Initial releases should prefer simple fixed or equal contributions unless another method is explicitly approved.

For a Fixed bill, the host supplies the recurring amount. For a Flexible bill, the host supplies a bill-wide upper limit and may supply an estimate for planning. The bill maximum, optional estimate, allocation formula, and each contributor's personal cap must remain distinct.

### 5. Participant reviews and agrees

The participant sees:

- What they are joining
- Who the host is
- The amount they are expected to contribute
- Whether the contribution is one-time or recurring
- When the contribution will occur
- Which funding source will be charged
- How to cancel or change future contributions

The participant must explicitly accept before an automatic contribution becomes active.

### 6. Participant funds the arrangement

The participant can contribute manually or activate an automatic contribution inside Potluck. The participant may choose a faster bank push, which may become available when Lithic receives and settles the ACH credit, or a standard bank pull, which remains pending until Lithic releases it after the configured return-risk hold.

The application should show the difference between:

- Scheduled funds
- Pending funds
- Settled funds
- Available card funds

The product must show an estimated availability time before confirmation and must not promise that a transfer will arrive the same day. Banking days, submission cutoffs, the sending bank, the transfer direction, and the provider's risk controls affect availability.

### 7. Virtual card is used

The primary cardholder or approved product flow uses the virtual card for the intended purchase or bill.

During authorization, Potluck evaluates applicable controls and available funds using issuer-supported data.

### 8. Activity is recorded

The host and participants see the activity appropriate to their role and privacy permissions.

The product must clearly distinguish:

- Authorization
- Completion or clearing
- Reversal
- Refund
- Decline
- Contribution
- Contribution failure

---

## Contribution Rules

### Agreement is mandatory

A host may propose an amount, but the participant must agree before Potluck activates an obligation or recurring withdrawal.

### Changes require consent

If the host changes any material term, Potluck should create a new proposal rather than silently editing the accepted agreement.

Material changes include:

- Higher amount
- Different calculation method
- More frequent collection
- New recurring status
- New funding source
- Extended duration
- Higher variable-payment maximum

### Manual deposits

Manual deposits require a direct participant action or confirmation for each contribution.

### Automatic deposits

Automatic deposits require:

- An active contribution agreement
- A valid funding source
- Required bank-transfer authorization
- A known schedule or trigger
- Notice of material changes
- A cancellation mechanism

### Failed contributions

A failed contribution should not be represented as settled or available.

The system should notify the affected participant and may notify the host without exposing private banking details.

Retry behavior must be documented and must not create duplicate debits.

### Funding availability

Potluck supports two intended contribution paths, subject to Lithic and sponsor-bank approval:

- **Faster bank transfer:** The participant initiates an ACH credit push using approved deposit instructions and a contribution reference. The contribution becomes available only when Lithic reports the receipt as settled and available.
- **Standard bank transfer:** Potluck initiates an authorized ACH debit pull. The contribution remains pending until Lithic reports that the debit has been released from its configured return-risk hold.

An ACH transfer being submitted or processed does not by itself make the funds available. Potluck will not advance provisional credit against a pending ACH pull in the initial release.

### Ownership and earmarks

Once available, a contribution becomes host-owned money earmarked in Potluck for the applicable shared bill. The participant does not retain a withdrawable provider balance or gain ownership of the host's financial account. Unused contributions and merchant refunds remain earmarked and roll forward to the next bill. When an arrangement closes, the host may initiate refunds after pending authorizations, clearings, returns, reversals, and disputes are resolved.

### Shortfall policy

Card balances lead with **Available to spend**, excluding funds reserved for Bills and pending transfers. A separate **Reserved for bills** amount opens an authorized, bill-by-bill breakdown; **Total settled balance** is secondary. Funds reserved for one Bill cannot fund ordinary purchases or another Bill without an allowed, consent-respecting reallocation. There is no general host control to unlock contributed Bill reserves for discretionary spending. These are intended product controls that require provider-supported enforcement and reconciliation, not guarantees supplied by UI labels.

**Fund card** lets an eligible user choose their own verified funding account and a one-time amount, review the destination and authorization, then track the transfer as pending. General Card funding adds to available spending only after settlement; Bill contributions retain their specific earmark. Funding never grants spending access. The September 5, 2026 Figma flow illustrates these states without creating a provider transfer.

Each shared card must have one host-selected shortfall policy:

- **Host covers:** An eligible merchant authorization may proceed when the host's eligible, unreserved available funds can cover the gap. Funds reserved for other Bills or goals do not count toward that coverage. Potluck records the amount funded by settled participant contributions and the additional amount covered by the host.
- **Decline if underfunded:** Potluck requests a decline for eligible authorizations when settled funds earmarked for the shared card are below the required amount.

The host chooses the policy during shared-card setup and may change it later. Every change must be audited. The product must disclose that force-posted charges and other provider or network exceptions may bypass authorization controls.

### Plans and limits

The host pays for Potluck; contributors join without a subscription charge. The approved plan structure is:

- **Free â€” $0:** Two active shared cards, up to four people per card including the host, basic automatic and manual contributions on both cards, equal and fixed-amount agreements, merchant locking, a transaction limit, essential alerts, pause/freeze/close controls, both shortfall policies, current-month summaries, and 90-day activity history.
- **Plus â€” $4.99 per month or $49.99 per year:** Up to eight active shared cards, up to ten people per card including the host, advanced contribution logic and schedules, reusable templates, category and velocity controls, reminders, two-year searchable history, and recurring-bill analytics.
- **Premium â€” $9.99 per month or $99.99 per year:** Up to fifteen active shared cards, up to twenty people per card including the host, a dedicated cross-card Bills workspace, combined authorization policies, renewal-approval workflows, advanced cross-card analytics, exports, long-term audit history, household/group administration, delegated non-financial management, and priority support.

Basic automatic contributions are part of the free core workflow on every free-tier card and must not be paywalled. Security, consent, authorization revocation, correct financial status, dispute access, personal contribution history, card/account closure, and the host's shortfall choice must remain free. Pending invitations count toward capacity until accepted, declined, revoked, or expired; closed and archived cards do not count. Limits must remain centrally configurable until contracted provider costs and risk limits are known.

---

## Card-Control Behavior

### Purpose controls

The host should be able to restrict a shared card to its intended purpose.

Examples:

- Allow streaming services but decline unrelated retail purchases
- Allow telecommunications merchants for a phone bill
- Allow a specific landlord or rent platform
- Allow a specific marketplace after the first approved purchase
- Restrict a childâ€™s card to approved categories or merchants

### Industry and category controls

The host may choose to allow or block industries or merchant categories, subject to issuer data quality and provider capabilities.

Merchant category codes can be imperfect. The interface should avoid promising perfect classification.

### Specific merchant or marketplace controls

After a transaction appears, the host may use it to create a future merchant-specific rule.

The system should prefer stable provider merchant identifiers over display names. A normalized merchant name may assist matching but should not be the only identifier when stronger data exists.

Creating a rule from a transaction must require an explicit host action.

### Decline behavior

Potluck may instruct the issuer or processor to decline a transaction when a supported rule is violated.

When multiple logical pools share one provider balance, Potluck must identify the card, atomically reserve the provider-requested hold against its assigned pool, and return the previously recorded decision for duplicate authorization requests. An unavailable or inconsistent pool ledger must fail closed. Clearing, reversal, expiry, refund, and force-post events must reconcile the reservation without pretending that every network exception can be declined.

The product must not assume it can freely choose any decline response. â€œInsufficient fundsâ€ or another specific response may be used only when supported and permitted by the issuer or processor.

User-facing messaging can explain the Potluck rule that caused the decline even when the network-facing response code is provider-controlled.

### Rule priority

The system needs a deterministic rule-priority model.

A proposed order is:

1. Card closed, frozen, compromised, or inactive
2. Compliance or issuer-required restriction
3. Insufficient available balance
4. Explicit merchant block
5. Explicit marketplace block
6. Category or industry block
7. Amount or velocity limit
8. Explicit allow rule
9. Default policy

This order is provisional and must be reviewed with the issuer integration design.

---

## Visibility and Privacy

The host needs enough visibility to manage the shared card, but participants should not lose unnecessary financial privacy.

The host may see:

- Participant display identity
- Contribution status
- Contribution amount
- Contribution due or scheduled date
- Whether a contribution failed
- Shared-card transactions and applicable decline reasons
- Which approved spender used each separately assigned card

The host should not see:

- Full bank-account numbers
- Bank login credentials
- Unrelated participant transactions
- Detailed private bank balances unless explicitly required and permitted
- Sensitive provider error payloads

Participants should see:

- Their accepted terms
- Their contribution history
- Their active funding authorization
- Shared-card activity appropriate to the arrangement
- Changes proposed by the host
- Declines or failures that affect their obligation

An approved spender should see only the assigned card, applicable available-to-spend amount, controls, and transactions. Card details must not be shared between users.

Exact visibility rules must be formalized before implementation.

---

## Trust and Safety Principles

Potluck should be designed to prevent coercive or deceptive use.

Product safeguards should include:

- Explicit participant acceptance
- Clear cancellation controls
- Notifications for material changes
- Audit history
- Limits on repeated failed collection attempts
- Protection against invitation spam
- Account recovery protections
- Fraud and abuse monitoring
- Clear dispute and support paths
- Controls for compromised cards and funding sources

Parent-and-child use requires special product and legal review, especially where the child is a minor.

Rent and large recurring payments require careful handling of transfer limits, timing, settlement risk, returns, and partial funding.

---

## Financial and Provider Model

Potluck intends to use Lithic Program Management and a compatible sponsor-bank partner for a consumer prepaid card program. Lithic is the intended system of record for provider financial accounts, balances, cards, ACH payments, authorization rules, card transactions, and provider events. The sponsor bank is the legal card issuer and must approve the program structure.

Potluck owns the product experience, contribution agreements, plan entitlements, earmark subledger, shortfall policy, and normalized audit history. Potluck must reconcile its records against Lithic rather than inventing provider state locally.

The intended provider structure is:

- One verified host is the sole primary Lithic account holder, owns the balance, and remains financially responsible.
- Contributing does not grant spending rights. Subject to written issuer approval, an adult authorized spender or managed minor may receive a unique, revocable credential without account or balance ownership.
- Each shared arrangement has a logical Potluck pool and may have multiple uniquely assigned cards. Users must not share PANs, CVVs, PINs, or wallet tokens.
- The host's prepaid issuing Financial Account is authoritative for the total provider balance. Potluck's reconciled subledger is authoritative for allocation among logical pools.
- If Lithic cannot provide separate issuing balances, Potluck uses approved Authorization Stream Access decisioning to atomically reserve funds against the correct logical pool and decline when that pool is insufficient.

Lithic Program Management is expected to coordinate capabilities such as:

- Identity verification
- Bank-account linking
- ACH or bank transfers
- Virtual-card issuance
- Card authorization decisions
- Transaction settlement
- Fraud and compliance controls
- Sponsor-bank and network coordination
- Provider ledgering and reconciliation

Lithic is the intended provider, not an approved production capability. The implementation must verify and obtain written approval for:

- Consumer prepaid program availability
- One host account receiving third-party participant contributions
- Multiple unique supplementary cards drawing from a host-owned balance
- Adult authorized-spender and managed-minor eligibility, verification, agreements, card naming, wallet access, and revocation
- Separate provider balances per pool, if available, or Authorization Stream Access enforcement of logical pools
- Participant identity and bank-account verification requirements
- ACH push and pull funding into a host-owned balance
- Stored balances, earmarks, refunds, and account closure
- Authorization-time decisioning
- Merchant and category data
- Host-selected shortfall behavior
- ACH authorization and recurring debits
- Returns, reversals, and disputes
- Account and transaction limits
- Webhook guarantees and latency
- Fees, reserves, minimums, dispute costs, and interchange revenue sharing

Potluck must display PAN, CVV, and expiration only through Lithic's short-lived Embedded Card UI to the host or issuer-approved user assigned to that card. Normal Potluck APIs and storage must not receive or persist those credentials.

---

## Compliance Questions Requiring Resolution

The following are open provider, product, and legal questions, not implementation assumptions:

1. Will Lithic and its sponsor-bank partner approve the proposed consumer prepaid program?
2. Which verification requirements apply to hosts and contributors in the third-party funding model?
3. Which ACH push and pull mappings are approved for contributions into a host-owned balance?
4. What bank-transfer authorization language, cancellation rights, and notice periods are required?
5. Which transaction-control, shortfall, and decline-response capabilities are approved?
6. Which refund, dispute, return, negative-balance, and account-closure procedures are required?
7. Does the rent use case create additional legal, limit, or operational requirements?
8. Can one host have multiple independent prepaid issuing balances, or must Potluck enforce logical pools within one balance?
9. Can designated adults and managed minors receive unique supplementary cards, and how must each user be represented?
10. What verification, card-naming, wallet, consent, dispute, and revocation rules apply to those spenders?
11. Which states or countries will the initial product support?
12. What fees, reserves, minimums, and interchange revenue share will apply?

No agent should resolve these questions by assumption.

---

## Initial Scope

The first useful version should focus on a narrow, testable workflow.

### Current implementation phase

Potluck is currently building the ungated core product. The immediate objective is a reliable, well-oiled end-to-end experience rather than Plus or Premium monetization. Current product and interface work must not implement paid-feature gates, upgrade prompts, subscription checkout, paid-only navigation, or the dedicated Premium Bills workspace. The approved Plus and Premium pricing, limits, and feature ideas remain roadmap context for later validation and must not complicate the current core experience.

Premium implementation begins only after the core workflow functions reliably across card creation, required card setup, people and role management, Fixed and Flexible bills, contribution consent, funding-state accuracy, shortfall behavior, supported authorization controls, transaction history, disputes, and closure.

### Proposed MVP

1. User registration and authentication
2. Host identity verification through a provider
3. Create a lightweight shared-card shell and show it on the host dashboard
4. Complete required card setup, including Host Covers or Decline If Underfunded
5. Add a limited number of people to the card and keep contribution and spending roles separate
6. Create a Fixed or Flexible bill within the card and assign only applicable card people
7. Propose equal or fixed-dollar contribution terms
8. Participant accepts or rejects the proposal
9. Participant connects a bank account through a provider
10. Participant makes a manual ACH push or pull contribution
11. Optional recurring ACH pull after explicit authorization
12. Distinguish scheduled, pending, settled, released, available, failed, returned, reversed, and refunded contribution states
13. Issue or activate a host-controlled merchant-locked virtual card through Lithic
14. Display contribution, bill, and card-transaction history
15. Configure a limited set of card controls approved by Lithic and its sponsor bank
16. Pause or close the shared arrangement
17. Maintain audit history and notifications

### Not automatically included in the MVP

- Large public groups
- Business expense management
- Credit underwriting
- Lending
- International transfers
- Cryptocurrency funding
- Cash deposits
- Complex percentage or usage-based splits
- Multiple primary cardholders
- Unlimited participants
- Custom physical cards
- Unsupported custom network decline codes
- Automatic interpretation of legal or contractual obligations
- Provisional credit against pending ACH pulls
- Participant card access or withdrawal rights
- Plus or Premium paywalls, upgrade prompts, or subscription checkout
- Dedicated cross-card Premium Bills workspace
- Premium analytics, exports, bulk administration, and long-term reporting

---

## Future Possibilities

Potential future capabilities include:

- Paid plans with more participants
- Multiple cards per household or group
- Advanced merchant controls
- Spending allowances
- Savings goals
- Group travel cards
- Shared emergency funds
- Business or team plans
- Physical cards
- Smart contribution adjustments
- Multiple currencies
- International availability
- More advanced reporting
- Optional participant spending permissions

These are ideas, not committed requirements.

---

## Product Success Measures

Potential success measures include:

- Percentage of invitations accepted
- Percentage of contribution proposals accepted
- Successful contribution rate
- Recurring contribution retention
- Reduction in late or missed shared payments
- Card-authorization approval rate for intended purchases
- False-decline rate
- Dispute and support-contact rate
- Participant cancellation rate
- Time from shared-card creation to first successful payment
- Number of active shared cards per user
- Fraud and return rates
- Invitation-driven acquisition attributable to shared cards and bills
- Free-to-Plus and Free-to-Premium conversion by feature and limit
- Paid-plan renewal and churn
- Premium Bills workspace adoption and recurring engagement
- Percentage of variable bills resolved within accepted ranges and contributor caps

Metrics must never incentivize hidden enrollment, difficult cancellation, excessive retries, or unclear consent.

---

## Marketability and Monetization

Every feature must have a marketable purpose. Product proposals must state the target user, one-sentence promise, acquisition or invitation loop, plan placement, subscription-conversion rationale, retention mechanism, competitive alternative, and measurable business outcome.

Potluck uses scale-gated freemium. Free must complete the core shared-financial-coordination job and demonstrate why Potluck is trustworthy. Paid plans sell additional scale, convenience, automation, sophistication, advanced control, history, analytics, administration, and service. Security, consent, authorization revocation, correct financial state, dispute access, closure, and access to existing financial arrangements are never conversion levers.

Published research supports placing upgrade prompts at natural capacity or sophistication boundaries rather than weakening the free workflow:

- A randomized freemium field experiment covering roughly 300,000 users found that stronger restrictions can increase conversion and viral activity while reducing product use. [Runge, Wagner, and Claussen (2022)](https://doi.org/10.1287/mksc.2021.1306)
- A 21-month field experiment involving about 35 million Pandora listeners found that heavier advertising increased subscriptions but reduced listening and increased churn, with larger long-run sensitivity. Potluck must not make Free deliberately irritating. [Huang, Reiley, and Riabov (2018)](https://doi.org/10.3386/w25161)
- Research comparing hard and soft freemium limits found that boundary design affects conversion and retention differently. Potluck uses clear capacity limits and preserves already-created financial arrangements. [Cao, Dhar, and Geva (2023)](https://doi.org/10.1287/isre.2022.1183)

Relevant market and cost signals include:

- Slack and Dropbox demonstrate useful free cores with paid scale, history, or capacity. [Slack plans](https://slack.com/help/articles/115002422943-Slack-plans-and-features), [Dropbox Basic](https://help.dropbox.com/plans/dropbox-basic)
- MX reported that consumers averaged 4.17 paid subscriptions in 2025, a directional signal for recurring-bill demand rather than a direct Potluck limit benchmark. [MX subscription research](https://www.mx.com/blog/subscription-economy/)
- Public payment pricing illustrates that verification, ACH attempts and failures, disputes, cards, and support can create different costs. These are sensitivity inputs, not substitutes for contracted Lithic and sponsor-bank economics. [Stripe pricing](https://stripe.com/pricing), [Stripe ACH pricing](https://stripe.com/pricing/local-payment-methods)

The contribution-margin model is:

```text
net subscription revenue
- allocated program-management costs
- active-card costs
- identity/KYC and linked-account costs
- ACH initiation and verification costs
- expected return, dispute, fraud, and support losses
- infrastructure and servicing costs
= contribution margin before interchange
```

Interchange remains separately modeled upside:

```text
eligible settled card volume
x contracted Potluck interchange share
- network adjustments, refunds, disputes, and fraud losses
```

The executable calculator is `profitability-model.js`. The $4.99 Plus and $9.99 Premium prices remain the simple approved marketing ladder. Limits and entitlements remain centrally configurable until contracted economics are known. The median paid host should produce at least 60% contribution margin before interchange, and the 90th-percentile legitimate host should remain non-negative across low, expected, and high-cost scenarios.

Before finalizing launch limits, obtain Lithic and sponsor-bank setup fees, minimums, program-management fees, ledger/card/token costs, verification costs, ACH pricing and return allocation, reserves, dispute/fraud/support obligations, and contracted net interchange share.

---

## Important Product Principles

1. **Consent before collection** â€” No participant should be charged under terms they did not accept.
2. **One clear source of truth** â€” Contribution, balance, and transaction states must be understandable.
3. **Controls should be explainable** â€” Users should know why a card was declined.
4. **Privacy by role** â€” Hosts receive management visibility, not unrestricted access to participant financial data.
5. **Provider reality over product assumptions** â€” Features must match actual issuer and payment capabilities.
6. **Safe failure** â€” Duplicate events, delayed settlement, provider outages, and retries must not create duplicate money movement.
7. **Auditability** â€” Important actions and changes must be traceable.
8. **Simple first** â€” The initial product should prove the shared-card and contribution workflow before adding complex group features.
9. **Marketable by design** â€” Every feature must support acquisition, subscription conversion, retention, or competitive differentiation through a clear user promise and measurable outcome.

---

## Open Product Decisions

The following decisions are intentionally unresolved:

- Whether cap-exceeded shares may be redistributed among contributors who separately pre-authorized flexible redistribution
- How multiple fixed-dollar allocations behave when their combined amount exceeds the final bill
- Which provider or bill source supplies a final variable amount early enough for required notice and funding
- Removal of participants with pending contributions or transactions
- Who covers failed-transfer fees, returns, or negative balances
- Exact transaction visibility for participants
- Merchant-rule learning and matching strategy
- Parent-and-minor eligibility rules
- Rent-payment workflow and transaction limits
- Initial geography
- Final Lithic and sponsor-bank program economics
- Whether Potluck should later offer risk-scored provisional availability for pending ACH pulls
- Whether a Pledge funds a card's general earmarked balance, must attach to a specific bill, or may support either relationship
- Whether the last scheduled contribution for a goal-based Pledge is reduced to the exact remaining amount or requires another explicitly accepted rule

Agents must preserve these as open questions until an explicit decision is made.

---

## Decision Log

### September 23, 2026 — Focused discovery onboarding and brand correction

The current launch first-use flow uses one category selection (Plans, Memberships, Subscriptions, Spaces) followed immediately by relevant opportunities; Plans means primarily phone plans. Subscription listings surface service/plan, monthly per-person price and headcount conditions, numeric availability and active/forming state, and comparable savings. Organizer identity belongs on detail, not scrolling subscription cards. Potluck's green/teal identity and Splitfinder's blue theme remain authoritative; purple in generated concepts was not approved. Preserve the [research and its limitations](2026-09-23-listing-card-research-and-critique.md) and [onboarding decisions](2026-09-23-onboarding-research-and-decisions.md). This records direction, not app/Figma implementation or financial functionality.

### September 8, 2026 — Splitfinder and global Inbox

- Approved Spaces, Experiences, and Memberships as a distinct discovery destination, including planning-stage listings with structured headings and required photos.
- Replaced the centered three-tab navigation with Circles, Cards, Bills, Splitfinder. Circles remains the default and moves to the far left; historical three-tab decisions below are superseded.
- A first-visit Splitfinder landing page precedes discovery. Subsequent visits open discovery directly.
- Keep Splitfinder inquiries separate from ordinary direct and Circle messages in the global Inbox. Circle invites have their own review section.
- Chat does not imply joining or financial consent. A minimum group size counts accepted current terms, and the host must confirm the start. Revised obligations require renewed acceptance.
- Record the detailed product, privacy, price, and marketability decisions in [SPLITFINDER_CONTEXT.md](SPLITFINDER_CONTEXT.md). User-to-user legal contracts remain unresolved.
- Splitfinder may use a distinct title and font size. Its approved visual identity now includes a blue/lilac Lucky banner, larger dark wordmark, and photographic discovery cards, while preserving the shared navigation and the default palette elsewhere in Potluck.

Use this section for durable, approved product decisions. Add the date, decision, rationale, and consequences.

### 2026-09-05 - Core Bills collection and connection filter

All bills retains all saved bills and confirmed imports across time. Shared contains the subset connected to a Circle or funding Card; a Card-only connection does not imply Circle membership or contributor participation. An unshared bill can be connected through Share bill, review, and Save sharing while retaining its identity and history in All bills. Imports may be saved before choosing whether to share them.

September 8, 2026: Shared is now the leftmost Bills tab and the default selection; All bills is second. Import completion continues to open All bills to reveal newly saved imports.

September 9, 2026: Bills adds a compact, collection-specific Overview / By week summary. Overview shows the user's monthly contribution share and next contribution; By week shows its weekly distribution. Shared and All bills have separate totals, estimates remain labeled, and contribution status does not imply the bill was paid. This is core contribution clarity without paid gates; full semantics and Figma implementation boundaries are in `BILLS_CONTEXT.md`.

This is a core/Free organization and activation path, not a reopening of Premium workspace entitlements. Connection does not grant spending rights, activate contributions, or replace individual acceptance of contribution terms. The full definition and marketability rationale are in `docs/BILLS_CONTEXT.md` under Saved bill collection.

### 2026-07-31 â€” Initial product definition

**Decision:** Potluck will center on one primary cardholder, a limited number of invited participants, participant-funded contributions, explicit contribution acceptance, and host-configured transaction controls.

**Rationale:** This model supports common shared expenses while keeping one clear card owner and requiring participant agreement before funds are collected.

**Consequences:** The architecture must separate the primary cardholder role from the participant role, preserve consent records, support manual and automatic contributions, and evaluate provider-supported transaction controls.

### 2026-07-31 â€” Participant agreement required

**Decision:** A host may propose each participantâ€™s contribution, but the participant must accept the terms before the contribution becomes active.

**Rationale:** Shared financial obligations must be transparent and consensual.

**Consequences:** Contribution terms require versioning, acceptance records, and renewed consent after material changes.

### 2026-07-31 â€” Limited participants initially

**Decision:** The initial product will limit the number of participants on a shared card. Higher limits may later be part of a paid subscription.

**Rationale:** A smaller initial group size reduces product, operational, fraud, and support complexity.

**Consequences:** Participant limits must be configurable rather than permanently hard-coded into domain logic.

### 2026-07-31 â€” Transaction controls are a core capability

**Decision:** Hosts should be able to restrict transactions by supported industry, category, marketplace, or merchant attributes, including creating future rules from observed transactions.

**Rationale:** The shared card should remain aligned with its intended purpose.

**Consequences:** Authorization decisions must be deterministic, auditable, provider-compatible, and based on reliable merchant identifiers when available.

### 2026-07-31 â€” Lithic Program Management selected

**Decision:** Potluck will pursue a managed consumer prepaid program through Lithic and a compatible sponsor-bank partner.

**Rationale:** Lithic provides the intended card issuing, ledger, ACH, authorization, event, and program-management infrastructure while coordinating the regulated issuer relationship.

**Consequences:** Production launch depends on written approval of the use case and economics. Provider integration must remain server-side, reconcile against Lithic, and use Lithic's Embedded Card UI for sensitive card credentials.

### 2026-07-31 â€” Host is the sole account holder

**Decision:** The host is the sole primary account holder and responsible party. Invited contributors provide funds but receive no card credentials, provider-account ownership, or spending rights by virtue of contributing. The 2026-08-02 delegated-spending decision later expands access through separate, issuer-approved roles while preserving host ownership.

**Rationale:** One legally responsible cardholder keeps ownership and card access clear while preserving group contribution workflows.

**Consequences:** Third-party contribution funding requires explicit participant consent and provider approval. Settled contributions become host-owned funds earmarked in Potluck for the applicable shared bill.

### 2026-08-02 â€” Separate contribution and delegated-spending roles

**Decision:** The host remains the sole primary account holder, owner of the provider balance, and financially responsible party. Contributing never grants spending rights. Subject to written Lithic and sponsor-bank approval, an adult authorized spender or managed minor may receive a unique, revocable credential assigned to that person and tied to a host-controlled logical pool.

**Rationale:** Unique credentials expand Potluck to couples and parent-managed spending while preserving attribution, individual controls, and one responsible account owner. Sharing the host's credential or representing another user as the host is not an acceptable substitute.

**Consequences:** Potluck must keep contribution and spending grants independent, map every card to its real assigned user and logical pool, prefer separate provider balances when available, and otherwise enforce pool availability through atomic, idempotent Authorization Stream Access reservations. Production depends on written approval of adult and minor eligibility, agreements, verification, wallet access, card naming, and liability.

### 2026-07-31 â€” ACH push and pull contribution paths

**Decision:** Potluck will support faster participant-initiated ACH pushes and convenient Potluck-initiated ACH pulls. Pushes become available when Lithic reports the receipt as settled; pulls become available only after Lithic releases the configured return-risk hold.

**Rationale:** The two paths balance faster availability with a convenient recurring collection experience without misrepresenting pending funds as settled.

**Consequences:** The product must show funding state and estimated availability, schedule recurring pulls early, and defer provisional credit against pending pulls.

### 2026-07-31 â€” Host-selectable shortfall behavior

**Decision:** Each shared card lets the host choose between Host Covers and Decline If Underfunded.

**Rationale:** Some hosts prioritize uninterrupted service while others prioritize avoiding personal exposure for missing contributions.

**Consequences:** The selected policy must be audited and enforced through provider-supported authorization controls. Product copy must disclose that force-posted charges may bypass authorization decisions.

### 2026-07-31 â€” Free, Plus, and Premium pricing

**Decision:** Potluck will offer Free, Plus at $4.99 per month or $49.99 per year, and Premium at $9.99 per month or $99.99 per year. Hosts pay; participants join free.

**Rationale:** The simple $5 and $10 price points keep the product accessible while monetizing capacity, automation, and advanced controls.

**Consequences:** Plan entitlements must be centrally configurable, essential safety and shortfall controls remain free, and final card limits depend on contracted provider economics.

### 2026-08-02 â€” Scale-gated freemium and provider-dependent paid pricing

**Decision:** This decision supersedes the earlier capacity limits, but not the simple $4.99 Plus and $9.99 Premium price ladder. Free includes two active cards, four people per card including the host, and basic automatic contributions on every free card. Plus targets eight cards and ten people per card. Premium targets fifteen cards and twenty people per card. Limits remain configurable until Lithic and sponsor-bank economics are contracted.

**Rationale:** Free must complete the core shared-payment job. Paid plans monetize additional scale, automation sophistication, controls, analytics, history, administration, and support rather than consent, safety, or access to funds.

**Consequences:** Subscription revenue must cover expected operating costs without relying on interchange. A proposed price is acceptable only when the median paid host reaches at least 60% contribution margin before interchange and the 90th-percentile legitimate host remains non-negative under low, expected, and high-cost scenarios.

### 2026-08-03 â€” Bills are separate objects and Premium's flagship workspace

**Decision:** Bills and cards are separate first-class objects. Free users manage viable bills within a card. Premium users receive a dedicated cross-card Bills workspace that combines exception management, organization, forecasting, automation, and recurring-cost insights.

**Rationale:** The Bills experience must provide a marketable reason to acquire, convert, and retain users. Potluck differentiates by coordinating accepted group terms, contributor funding, card controls, shortfall handling, and payment state rather than merely tracking recurring transactions.

**Consequences:** Bills require their own series and occurrence state, contribution agreements, funding state, history, and cross-card presentation. Detailed requirements are maintained in `docs/BILLS_CONTEXT.md`.

### 2026-08-03 â€” Variable bill formulas and contributor caps

**Decision:** A variable contribution agreement may combine fixed-dollar allocations with percentage allocations calculated from the remaining bill. Each contributor may set a hard personal cap. If a calculated amount exceeds that cap, Potluck initiates no transfer for that contributor and creates a shortfall exception.

**Rationale:** Contributors can authorize predictable formulas for utilities, phone bills, and other variable obligations without allowing the host to select an unrestricted new amount each month.

**Consequences:** Agreements must record the formula, expected range, cap, notice terms, and effective date. Potluck may not silently raise a cap, debit the cap amount, redistribute the missing share, or materially change an obligation. Padding, first-payment padding, Bill Cushions, and rolling price reserves are explicitly rejected.

### 2026-08-05 â€” Lightweight card creation and card-centered bill setup

**Decision:** Initial card creation asks only for a name, visual color or design, and optional description. The card appears on the host's dashboard immediately in a `Draft` or `Setup required` state. From the card detail, the host completes required card settings, adds people, and creates Fixed or Flexible bills through a page-by-page flow. People belong to the card first and are assigned only to the specific bills in which they participate.

**Rationale:** Separating the card shell from bills, people, contribution terms, and controls makes the first action fast and understandable while preserving bills and cards as distinct product objects. It also prevents a person added to one card from being treated as a contributor to every bill automatically.

**Consequences:** A card shell must not activate financial behavior, send invitations, create a bill, grant spending access, or silently choose a shortfall policy. Required activation settings remain explicit. Fixed bills use a stable recurring amount; Flexible bills use a required bill maximum and may include an estimate used only for planning. Bill-specific contribution assignments and agreements remain separately consented and versioned.

**Superseded in part on August 10, 2026:** Bill contributors no longer need to belong to the funding Card. See the August 10 Circle-centered UI and independent-role decision below.

### 2026-08-10 â€” Circle-centered UI, independent roles, and health states

**Decision:** Potluck's three primary user-facing assets are Circles, Cards, and Bills. Mobile navigation is `Cards Â· Circles Â· Bills`, with Circles centered as the default shared-home surface for invitations, shared alerts, notifications, and attention. A Bill contributor is independent from a Card Trusted Spender. A Bill selects or creates its funding Card at the end of Bill creation. Circles are reusable consent-based groups with one Circle Host, normal and anonymous modes, attachment-specific exclusions, and no automatic propagation of later membership changes.

Circle readiness uses permission-aware health faces: green smile for `All good`, yellow slanted face for `Needs attention`, and red frown for `Act now`. Bills communicate standing through amount color: deep green for normal, yellow for warning/unpaid-past-threshold, and red for declined charge or serious nonpayment. Cards do not have a generic "good standing" health-face pattern; cards are simply cards unless a separate card-specific action or state is explicitly designed. Private identity, security, funding-source, and account issues appear through the top-right You bubble rather than the shared Circles surface.

**Rationale:** A centered Circle experience keeps Potluck people-first, removes the need for a separate Home dashboard, and makes shared work easy to find. Independent Bill and Card roles prevent contribution from implying spending access. Reusable Circles, per-attachment exclusions, default equal-split calculations, context-aware creation, Circle-only health faces, and Bill amount standing colors reduce repeated setup without weakening individual consent or confusing Cards with status objects.

**Consequences:** Earlier four-tab Home navigation and the rule requiring people to join a Card before Bill assignment are superseded. `Trusted Spender` is the approved user-facing term while backend and provider contracts retain authorized-user or authorized-spender terminology. Potluck calculates a default equal split, the Bill Host confirms or changes it, and individual agreements are sent. Existing accepted agreements remain active until validly replaced or ended. Detailed interface behavior is maintained in `docs/UI_FLOW.md`.

### 2026-08-05 â€” Core product before premium implementation

**Decision:** Potluck will first build and validate a reliable ungated core application. Plus and Premium pricing, limits, and feature concepts remain documented roadmap strategy, but the current implementation must not add premium paywalls, upgrade prompts, subscription checkout, paid-only navigation, or the dedicated Premium Bills workspace.

**Rationale:** Card creation, people and role management, bills, consent, funding, shortfall handling, provider reconciliation, and card controls must work together smoothly before monetization layers add product and engineering complexity.

**Consequences:** Current designs and implementation plans should present one coherent core experience. Premium work begins only after the critical host and contributor journeys are functional, accurate, secure, and validated. Deferring premium implementation does not remove the future three-tier strategy or permit paid roadmap concepts to leak into the core UI as inactive or distracting controls.

### 2026-08-05 â€” Pledge as a provisional recurring-contribution feature

**Decision:** Potluck will use `Pledge` as the working user-facing name for a host-proposed, contributor-approved fixed monthly contribution that continues until an accepted total goal is reached or indefinitely under the accepted terms. The name may be changed later without changing the underlying recurring contribution-agreement behavior.

**Rationale:** Pledge gives hosts and contributors a simple recurring way to fund a shared purpose without recreating the arrangement every month, while explicit acceptance preserves contributor control.

**Consequences:** Pledge must reuse the consent, funding-source, authorization, idempotency, state, notice, revocation, and audit rules for recurring contribution agreements. Only net settled contributions advance a goal. The host cannot unilaterally create or materially change a contributor's Pledge. Card-versus-bill attachment and final-payment calculation remain open product decisions.

### 2026-08-28 â€” Goal attachment order and contribution review

**Decision:** Goal creation selects a Circle first and then selects or creates the host-controlled Card that receives the goal earmark. The review step shows each selected person's proposed contribution in one clear list rather than separating generic allocation copy from person chips. Forward actions in the creation pipeline use the neutral label `Continue` until the final `Create goal` action.

**Rationale:** Circle-first selection preserves the people-centered setup flow; selecting the Card immediately afterward makes the funding destination explicit without implying that Circle membership grants card access or creates an obligation. A single contribution list makes the proposed shares easy to review before individual agreements are sent.

**Consequences:** A Circle still prepares individual invitations only; every selected contributor must separately accept the exact amount, schedule, visibility setting, and funding source. The selected Card remains host-controlled, and a contributor does not gain spending rights or card credentials merely by funding a goal.

### 2026-08-03 â€” Every feature must be marketable

**Decision:** Every feature proposal must identify its user-facing promise and contribution to acquisition, subscription conversion, retention, or competitive differentiation, together with plan placement and a measurable business outcome.

**Rationale:** Potluck should build a coherent product people can understand, recommend, pay for, and continue using rather than a collection of technically useful but disconnected capabilities.

**Consequences:** Agents and product plans must evaluate marketability without using safety, consent, difficult cancellation, or access to existing financial arrangements as monetization pressure.

### 2026-07-31 â€” Unused funds roll forward

**Decision:** Unused contributions and merchant refunds remain earmarked for the next bill. When an arrangement closes, the host may initiate refunds after outstanding financial events resolve.

**Rationale:** Rolling funds forward avoids unnecessary transfer fees and supports recurring shared expenses while preserving an explicit closure path.

**Consequences:** Potluck needs bill-level earmarks, reconciliation, auditable refund actions, and closure checks for pending authorizations, clearings, returns, reversals, and disputes.

---

### September 11, 2026 decision: Optional host explanation for contribution increases

Hosts can add an optional **Reason for the change** when proposing an increase, decrease, or reallocation. Contributors see it as **Note from your host**, with their current and proposed shares and the effective date. Default copy states that the host proposed a change to their contribution; it does not assign a merchant/provider cause. Confirmed bill contributors joining or leaving may be identified as **Group size changed**. Circle membership does not itself change bill participation. Explanations remain attributable to the host and are preserved with the proposal reviewed. Every increased or materially changed obligation still requires individual acceptance; neither a note nor membership change authorizes a debit or automatic redistribution. This is a Free/core product requirement; Figma examples do not implement financial behavior. See `docs/BILLS_CONTEXT.md` for the review behavior.

## Context Maintenance Checklist

Update this document when any of the following changes:

- Product purpose
- Target users
- User roles
- Terminology
- Contribution behavior
- Participant consent requirements
- Card-control behavior
- Participant limits
- Pricing model
- Provider model
- MVP scope
- Privacy rules
- Geography
- Legal or compliance assumptions
- Major product decisions

### September 12, 2026 - Resolve declined bill proposals

Hosts may message a declined contributor, revise proposed terms, review bill-only removal, retain the current share while explicitly addressing a funding difference, or withdraw unaccepted changes. Circle membership, accepted agreements, past obligations and transfer state remain separate. Neither a decline nor removal silently redistributes an obligation. A replacement contribution requires acceptance where terms change materially; an accepted agreement is not revoked by withdrawing another proposed change. This is Free/core resolution behavior. See `docs/BILLS_CONTEXT.md` and `docs/ui-concepts/2026-09-12-proposal-resolution.md` for the connected prototype and application boundaries.

When updating this document:

1. Change the relevant section.
2. Add an entry to the decision log for a durable decision.
3. Remove or update contradictory open questions.
4. Update tests, schemas, and product copy affected by the decision.
5. Do not rewrite historical decision entries to hide a change; add a new superseding decision.

## September 14, 2026 — Card and bill visibility by role

**Decision:** Roles are evaluated per resource. A Card host, Trusted Spender, Bill host, Bill contributor, and Circle Host are independent permissions; one person may hold different combinations on different assets. Circle administration and Card ownership do not automatically confer Bill management rights.

Trusted Spenders see their assigned credential, applicable spendable amount and limits, read-only spending restrictions, and their own assigned-credential activity by default. They do not receive general Card funding controls, total pool balances, named Bill reserves, other people's credentials, or host management through their spending role. General Card funding requires a separate eligible authorization.

Bill contributors see their own accepted agreement, due amount and schedule, funding authorization, contribution history, and permitted Bill status. Their Bill detail does not expose the funding Card preview, Card balance, credential, or Card navigation. A separately approved spending role remains accessible through Cards. Normal/shared contribution transparency follows existing Bill permissions; private and anonymous arrangements continue to hide other members' identities and amounts. No new privacy default or silent visibility migration is approved by this decision.

Bill hosts manage their own Bills and propose changes, but cannot accept another contributor's terms or control their private funding account. Ending contributions does not itself revoke separately approved spending access. Removing spending access does not itself cancel contribution agreements or Circle membership. A spending invitation requires acceptance and any issuer-required approval before access becomes active.

**Purpose:** Give each person a clear view of their responsibilities and permitted actions. This is Free/core correctness and consent functionality, without a paid gate. Measure correct invitation-path completion and use permission misrouting or information exposure as guardrails.

**Implementation boundary:** Figma role variants specify intended presentation only. Runtime access control must be enforced server-side, and credential eligibility, display, controls, transaction state, and activation remain subject to the approved provider program. Managed-minor-specific onboarding is not added by this decision.


