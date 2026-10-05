# Full Potluck Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This is a coordinating plan for several subsystems; expand the named subsystem plans before implementing them. Do not interpret a milestone as permission to skip its domain specification, tests, or external approval gates.

**Goal:** Complete one coherent Potluck app connecting Circles, Cards, Bills, and Splitfinder, from discovery or invitation through individually accepted arrangements and provider-supported payment activity.

**Architecture:** Continue the existing Expo app. Use a Potluck-owned TypeScript backend organized into domain modules, one PostgreSQL source for application records, and adapters for authentication, storage, messaging delivery, and financial providers. Provider systems remain authoritative for financial accounts, verification, transfers, issued credentials, authorization, and settlement; Potluck maintains reconciled records and allocations.

**Tech Stack:** Existing Expo Router, React Native, and TypeScript. Proposed backend: a modular TypeScript service, PostgreSQL, background workers, transactional outbox/inbox, and versioned SQL migrations. Supabase is a candidate for managed PostgreSQL/Auth/Storage behind owned interfaces; Cloud Run is a candidate for the API and workers. Confirm deployment cost, operational ownership, and authorization latency before selecting services or adding dependencies. Stripe is the first provider to qualify, not an approved integration.

**Spec:** [Product context](../../PRODUCT_CONTEXT.md), [Bills context](../../BILLS_CONTEXT.md), [UI flow](../../UI_FLOW.md), [Splitfinder context](../../SPLITFINDER_CONTEXT.md), [design guidelines](../../DESIGN_GUIDELINES.md), [existing flow audit](../../APP_FLOW_MAP.md), and the founder's October 4 full-app scope instruction. Figma source: [Potluck Core UI](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD), Components `1:122`, Screens `1:123`.

**Status:** Execution approved and in progress. The founder confirmed local-first development without an existing Supabase project. See `2026-10-04-local-subsystems.md` and the capability register for implementation evidence and outstanding gates. This document does not establish provider approval or replace legal/program review.

## Local execution checkpoint — October 4

The reviewed local continuation now connects shared identity, Circles and invitations, Bill proposals/individual consent, unissued Card setup, and Splitfinder publishing/requests/conversations. See [capability register](../../architecture/full-app-capabilities.md) and [review record](../../architecture/2026-10-04-local-integration-review.md). The coordinating milestones below deliberately remain open where their complete acceptance criteria include unimplemented local work, hosted/native validation or external provider approval. A local implementation is not completion of every milestone.

## Global Constraints

- Main navigation: **Circles · Cards · Bills · Splitfinder**. Circles is the signed-in default; guest discovery and invitation links retain their intended destination.
- Preserve the existing application identifier `app.getpotluck.potluck` and Expo project unless a separately justified migration is approved.
- Browse before registration. Request account entry when an action needs identity or persistence; do not repeat the first-use category question later in the same flow.
- A Splitfinder request acceptance opens a conversation. Circle membership, Bill agreements, and Card spending grants require separate actions and acceptance.
- Contributing does not grant spending rights, Card credentials, or provider-account ownership. Circle Host, Card host, Bill host, contributor, and Trusted Spender are resource-specific roles.
- Circle membership changes never silently change existing Bill obligations or Card access. Removing someone requires explicit review of any independent roles and unresolved obligations.
- Existing core features are ungated. No Plus/Premium checkout, paid navigation, or new paid entitlements in this work.
- Money uses integer minor units plus currency. Financial mutations require server permissions, explicit state transitions, idempotency, consent records, and audit history.
- No real financial activity in development/tests. Sandbox outcomes must never masquerade as live funds, issued production cards, verified identities, or completed payments.
- No credentials or sensitive identity/financial data in source control, app logs, analytics, notification payloads, or client-accessible secrets.
- Preserve approved Potluck teal/green, Splitfinder blue, typography, illustration, icon, and component sources. No invented visual rebrand.

## Review Focus

- A person holds different roles on different resources: tests must prevent Circle membership or Bill contribution from exposing another person's Card or account. Owned by milestones 2, 4, 5, and 7.
- Registration, app termination, offline operation, or an expired link interrupts a journey: restore safe intent and drafts, recheck authorization, and never replay a financial action without deduplication. Owned by milestones 2, 3, 6, and 9.
- Provider callbacks arrive twice, late, or out of order, including after a timeout: do not duplicate movement, release a real hold incorrectly, or invent settlement. Owned by milestones 7 and 8.
- Membership, allocation, price, or schedule changes while another user is reviewing: reject stale acceptance and retain the exact previously accepted terms. Owned by milestones 4 and 5.
- Long names, large text, small screens, keyboards, loading, and empty states: preserve readable content and reachable actions without overlap or changing the design language. Owned by milestones 1, 3, and 9.

## What exists and what must be completed

Inspection on October 4 found an Expo implementation in `my-app/`, including discovery, listing/profile details, saved items, Inbox, and inquiry screens. Its Splitfinder store uses in-memory sample data. It does not currently provide a production account system, remotely persisted listings/messages, Circles, Bills, or payment execution. Starter Home/Explore navigation also remains in the codebase.

The older root browser prototype and `provider-adapter.js` are behavior references, not production infrastructure. Mock balances and the disabled provider placeholder must not be reused as financial truth. The current checkout contains substantial untracked work, including `my-app/`; establish a reviewed, secret-free source-control baseline before substantive implementation.

Figma is substantially ahead of the native application. The October 2 audit recorded 786 frame/instance entries, not 786 distinct screens, and did not completely inspect every prototype reaction. Later continuation reviews improve specific flows but do not prove whole-file completeness. Reconcile canonical screens and states before estimating or porting them. Do not recreate the application from screenshots or turn every artboard variant into a separate route.

Apple/Expo setup has already been recorded locally, including a registered application and built development/production artifacts. Recheck current signing and distribution access when needed; a completed build is not proof of a TestFlight release or App Store approval. Do not restart enrollment or rename the app merely to implement this plan.

## Product purpose and boundaries

**Target:** hosts organizing shared expenses with friends, families, roommates, or people met through Splitfinder, and the contributors/spenders they invite. **Promise:** bring your people, agreed bills, and supported payments together without repeatedly rebuilding the group or chasing unclear commitments.

Splitfinder and invitations acquire users; accepted arrangements and recurring clarity drive retention. The alternative is disconnected classifieds, group chats, trackers, bank transfers, and cards. Core integration should demonstrate the complete benefit for free. Paid conversion is a future hypothesis around additional convenience and scale, not a prerequisite or a reason to restrict safety or consent. Proposed primary measure: Circles with at least one accepted shared arrangement still active after 30 days. Track useful discovery conversations and invite acceptance as funnel measures; financial correctness, unauthorized access, transfer failures, and reconciliation exceptions are guardrails. No growth or revenue figures are assumed.

The recommended approach builds real application persistence and provider-independent business rules while qualifying and testing the financial integration in parallel. A UI-only four-tab demo would hide the hardest problems; waiting for a banking contract before doing any application work would stall work that can proceed independently. Build order does not reinstate a Splitfinder-only scope.

## How the four areas connect

| Area | Owns | Connections and boundaries |
|---|---|---|
| Circles | Accepted membership, group identity, Circle privacy and administration | Shows permitted linked Bills and Cards. Selecting people prepares individual invitations; it never grants financial rights automatically. |
| Bills | Bill series, occurrences, allocation proposals, accepted agreements, due dates, contribution and payment history | Can attach to a Circle and select a funding Card. The same Bill appears in every permitted view without duplication. |
| Cards | Card setup, approved credentials, permitted funding/control actions, provider-reconciled activity | Pays supported merchant charges and funds associated Bills according to approved ownership/allocation rules. Card ownership does not imply management rights over every attached Bill. |
| Splitfinder | Public directories, user-created listings, inquiries and introductions | Can lead to conversation and a separately accepted Circle invitation. It does not turn a public listing price into a debit authorization. |
| Shared foundation | Potluck identity, profile, Inbox, notifications, links, audit and support | One identity across all four; separate resource permissions and only relevant actions in each context. |

### Journey A: People who already know one another

Create Circle → invite people → accept Circle invitation → create Bill with equal/custom terms → select an eligible Card or create its setup shell → send individual agreements → each contributor reviews and accepts → complete required funding/verification setup → provider-supported funding and payment → consistent status/history in Circle, Bill, and Card views.

The host can draft the Bill and invitations before everyone joins. Drafting, attachment, acceptance, funding readiness, and merchant payment remain distinct states. Registration and financial onboarding occur when required for the relevant actor, not as one large questionnaire for everybody.

### Journey B: People meeting through Splitfinder

Guest browses brand/category → opens an individual listing and host profile → registers when requesting/contacting → host accepts request → conversation opens → people agree to continue → host selects or creates an eligible Circle → sends a separate Circle invitation → invited person accepts → optional Bill setup and individual contribution agreements → any Card spending grant handled separately.

Housing keeps its approved direct-inquiry behavior. Listing acceptance is never presented as completed Circle membership. Do not automatically expose an existing Circle's private people or history to an inquiry sender. Only explicitly reviewed listing details may prefill a new arrangement.

### Journey C: Start anywhere

A user can create a standalone Bill or Card, later attach it to a Circle, or find an existing Circle from the permitted resource. No compulsory Splitfinder detour. Contextual create actions retain the original resource and return destination. Creating a Card shell is fast; provider activation remains a separate, truthful setup state.

## Proposed implementation structure

Existing files stay in place unless a focused migration requires moving them. Proposed new boundaries are:

| Path | Responsibility |
|---|---|
| `my-app/src/app/(tabs)/` | Four main tab destinations and their navigation layouts |
| `my-app/src/app/` | Shared detail, authentication, invitation, agreement, and conversation routes |
| `my-app/src/features/{circles,cards,bills,splitfinder,identity,inbox}/` | Feature screens, queries, state adapters, and focused view components |
| `my-app/src/design/` | Figma-derived tokens, shared controls, icons, spacing and typography |
| `my-app/src/services/` | Typed Potluck API client, session/link handling, safe local drafts and caching |
| `packages/contracts/src/` | Versioned request/response schemas, IDs, money, error codes and event contracts |
| `services/potluck-api/src/modules/` | Identity, Circles, Bills, agreements, Cards, funding, listings, conversations and notification modules |
| `services/potluck-api/src/adapters/` | Provider, authentication, database, file storage and delivery adapters |
| `services/potluck-worker/src/` | Schedules, event delivery, reconciliation and retryable background work |
| `db/migrations/` | Versioned schema, constraints, indexes and authorization policies |
| `tests/integration/`, `tests/e2e/` | Cross-module permission/state tests and multi-user application journeys |
| `docs/architecture/`, `docs/provider/` | Approved architecture decisions and exact provider capability/approval records |

Use one deployable business application initially, with separate API and worker processes where appropriate. Do not create a microservice fleet. Financial authorization processing needs bounded latency and the approved provider's timeout/fallback behavior; a scale-to-zero default must not be assumed adequate.

Backend code must keep domain rules independent of Expo, HTTP handlers, database libraries, and provider SDKs. Managed services can speed up delivery without making direct client writes to financial tables the architecture. Use ordinary versioned SQL where possible, own Potluck user IDs, and isolate Auth/Storage/Realtime dependencies behind adapters.

Key proposed command contracts to refine in subsystem specs:

- `AcceptCircleInvitation(actor, invitationId, expectedVersion, idempotencyKey)` returns membership status only.
- `AcceptListingRequest(actor, requestId, expectedVersion, idempotencyKey)` returns a conversation reference, not membership or a contribution.
- `AttachResourceToCircle(actor, circleId, resourceRef, expectedVersion)` checks authority over both sides and applicable visibility.
- `ProposeBillAllocation(actor, billId, allocation, expectedVersion)` creates a proposal version and individual agreement offers.
- `AcceptContributionAgreement(actor, agreementId, termsVersion, fundingSourceRef, idempotencyKey)` records exact accepted terms and any required authorization outcome; it does not invent provider success.
- `InviteTrustedSpender(actor, cardId, personId, idempotencyKey)` creates a distinct invitation/setup state. Credential issuance requires the approved provider's eligibility and verification results.

Every state transition specification must enumerate actor, allowed prior states, permissions, consent, provider prerequisites, audit event, side effects, retry and failure behavior. These are proposed interfaces, not functions that already exist.

## Milestones and acceptance checks

### 1. Establish the canonical product, design, and code baseline

**Files:** existing context documents and app routes; create `docs/architecture/0001-full-app-boundaries.md`, `docs/architecture/canonical-screen-register.md`, and `docs/superpowers/plans/2026-10-04-app-foundation.md`.

- [ ] Identify the approved Figma source for each route/state/component; tag obsolete and alternative artboards without deleting them. Complete the outstanding authentication, onboarding, import, financial-role, and recovery audit.
- [ ] Reconcile older provider references and contributor/Card assumptions with newer independent-role decisions. Preserve history and mark superseded material explicitly.
- [ ] Capture current app behavior and validation; review untracked files for secrets/artifacts, then establish a focused, reproducible Git baseline. Preserve unrelated work and do not mass-add the checkout. Evaluate Graphify or a similar repository relationship tool for tracing conflicting product rules and code dependencies; it is an optional aid, not a substitute for inspection or a prerequisite for progress.
- [ ] Define route/state mapping and shared tokens. Keep native application identifiers stable; replace starter artwork/navigation with approved sources.

**Acceptance:** every in-scope journey has a canonical screen/state reference, missing states are listed, the current app can be reproduced from reviewed source, and no old document silently overrides a newer decision.

### 2. Build persistent identity and authorization foundations

**Files:** `packages/contracts/src/`, `services/potluck-api/src/modules/identity/`, `my-app/src/features/identity/`, `my-app/src/services/`, initial `db/migrations/`; expand `docs/superpowers/plans/2026-10-04-identity-and-permissions.md`.

- [ ] Specify the account-entry method from the approved authentication screens. Recommended starting options are email one-time verification and Sign in with Apple, with secure session storage and an explicit linking/recovery policy; final choice belongs in the architecture decision.
- [ ] Implement one Potluck identity, profile, consent records, session revocation, validated API contracts and per-resource server authorization. Protect private storage and database access as additional layers.
- [ ] Preserve intended destination through sign-in. Distinguish account authentication, housing-poster verification and bank-required financial verification; collect each only at its legitimate point of need.
- [ ] Test two users, anonymous access, guessed resource IDs, revoked/expired sessions, identity linking, stale consent, private images and unavailable verification. Add migration/restore and contract compatibility checks.

**Acceptance:** two separate devices/accounts can access their own persisted data after restart, while unauthorized requests fail even when made outside the UI.

### 3. Connect the real mobile shell and shared interaction system

**Files:** `my-app/src/app/_layout.tsx`, `my-app/src/app/(tabs)/`, `my-app/src/design/`, `my-app/src/services/links.ts`; expand the foundation plan from milestone 1.

- [ ] Implement Circles, Cards, Bills and Splitfinder navigation, global Inbox/You access, consistent Back behavior and context-aware create actions. Replace starter Home/Explore behavior deliberately rather than leaving two navigation systems.
- [ ] Map loading, empty, pending, offline, denied and failed states to reusable components. Keep factual payment/account status visible, not hidden in optional help.
- [ ] Implement secure invitation/universal links with opaque expiring tokens, server validation and a web fallback. Never place bank/card data or authority in a link.
- [ ] Test nested navigation, deep-link sign-in return, closed/expired resources, state restoration, keyboard avoidance, screen readers and large text.

**Acceptance:** users can enter any permitted resource from an invitation, notification or another tab and return predictably, without duplicate resource copies or losing an unfinished draft.

### 4. Implement Circles and invitations as the shared people layer

**Files:** `my-app/src/features/circles/`, `services/potluck-api/src/modules/circles/`, Circle migrations; create `docs/superpowers/plans/2026-10-04-circles-and-invitations.md`.

- [ ] Build create/detail, invite/accept/decline/revoke/expire, member roles, normal/anonymous privacy, permitted asset attachment, leave/remove, host transfer and applicable archive outcomes.
- [ ] Make attachment a relationship to the same resource. Prepare individual invitations only for selected members. Apply anonymous-Circle restrictions on both data and UI.
- [ ] Show actionable readiness from underlying records. Membership removal explains independent Bill/Card roles and offers explicit authorized actions instead of silently canceling them.
- [ ] Test duplicate/expired acceptance, non-host administration, attachment ownership, anonymous-member visibility, concurrent changes and the absence of automatic financial grants.

**Acceptance:** two accounts can form and manage a Circle, see only authorized shared assets, and attach a Bill/Card without gaining an unintended role.

### 5. Implement Bills, occurrences, allocations and consent

**Files:** `my-app/src/features/bills/`, server `bills/` and `agreements/` modules, versioned migrations; create `docs/superpowers/plans/2026-10-04-bills-and-agreements.md`.

- [ ] Implement Bills home with **Shared** first/default and **All bills** second, per the current Bills context. Imports explicitly finish in All bills. Shared is a connection filter, not proof of another member or contribution.
- [ ] Build manual creation and reviewable import suggestions; Fixed/Flexible types, dates, recurrence, equal/custom proposals, contributor selection and the funding-Card choice at the end. Reuse one Bill ID across views.
- [ ] Separate series, occurrence, agreement version, personal cap, bill maximum and payment state. Implement accept/decline/change/cancel, dates/time zones, reminders, end-Bill review and retained history.
- [ ] Make contribution invitations independent of Card membership. Do not collect or redistribute a changed obligation without the required new acceptance.
- [ ] Test exact cent totals, pending agreements, zero accepted share for a new person, cap violations, stale proposal acceptance, month ends/DST, cancellation cutoffs and ending with unresolved transfers.

**Acceptance:** a host proposes a Bill and another person accepts their exact terms; later edits cannot silently change that person's obligation. Both see the same Bill with role-appropriate information. This milestone alone does not claim funds moved.

### 6. Complete Splitfinder and the conversation-to-Circle bridge

**Files:** existing `my-app/src/features/splitfinder/` and routes; server `listings/`, `conversations/`, `notifications/` modules; create `docs/superpowers/plans/2026-10-04-splitfinder-to-circle.md`.

- [ ] Replace preview fixtures with authenticated publishing and public, privacy-filtered browsing/search. Preserve brand-only autocomplete, user-created service titles, category filters, profiles, saved listings, listing editing/drafts/closure and real message delivery states.
- [ ] Keep housing-poster ID verification at Publish, preserve drafts, and skip repeated verification when current verified status suffices. Do not apply this verification requirement to every inquiry sender.
- [ ] Implement request review, accepted conversation, direct housing inquiries, moderation/block/report, failed-message retry, unread state and notification links.
- [ ] Add the linked Sharing Rules, relevant service eligibility summary and an unchecked declaration at the appropriate request step. Record the accepted rules/declaration version and timestamp; this does not establish brand permission or legal immunity.
- [ ] Add an explicit action from conversation to invite into an existing eligible Circle or create one. Review any copied arrangement information; keep private Circle/history data out of the public listing.
- [ ] Test interrupted registration, blocked users, duplicate requests/messages, listing closure while applying, revoked access and accepted-request-without-membership. A retry reuses a message identity rather than creating another message.

**Acceptance:** discovery produces a real conversation between accounts and, only after a separate accepted invitation, Circle membership. That Circle can use the Bill journey from milestone 5.

### 7. Implement Cards and the approved provider adapter in sandbox

**Files:** `my-app/src/features/cards/`, server `cards/`, `funding/`, `verification/`, provider adapters and migrations; create `docs/superpowers/plans/2026-10-04-cards-and-provider.md` plus `docs/provider/program-capability-matrix.md`.

- [ ] Start provider qualification at milestone 1. Before provider-specific financial implementation, obtain written confirmation of the intended program and responsibilities; vendor-neutral contracts and simulations can proceed earlier.
- [ ] Implement rapid Card-shell creation, setup required/pending/restricted/rejected states, eligible bank linking, host verification, individually approved spender credentials, secure card display, funding review, controls, activity, freeze/unfreeze and closure.
- [ ] Build manual and recurring funding only against approved capabilities and exact accepted terms. Contributors see their own agreement/funding information, not the host's Card credential or unrestricted balance.
- [ ] Explain the actual merchant setup step: issuing a Card does not subscribe to a service, change its payment method, or grant subscription access. Verify that each intended Bill can use the approved payment rail; unsupported rent/ACH-only payments require a separate qualified capability or a truthful unavailable payment state.
- [ ] Use the provider's approved secure display/wallet integration. Verify React Native/Expo compatibility early; do not extract raw PAN/CVV into custom React Native screens.
- [ ] Test unsupported capabilities, provider downtime, rejected verification, revoked spenders, repeated card-creation requests, bank replacement and funding-source failure. Build a new native development client when SDK requirements change.

**Acceptance:** sandbox credentials and transactions match actual provider results, resource permissions are enforced server-side, and the interface never reports a pending or failed provider operation as successful.

### 8. Connect financial events, operations and recovery end to end

**Files:** server funding/authorization modules, `services/potluck-worker/`, ledger/allocation migrations, reconciliation/support tools; create `docs/superpowers/plans/2026-10-04-financial-events-and-operations.md`.

- [ ] Implement signature-verified webhooks, durable event inbox/outbox, idempotent commands/workers, provider reconciliation and an auditable minor-unit journal/allocation model. Separate available, reserved, pending and settled values.
- [ ] Reserve approved logical-pool spending atomically. Handle clearing, reversal, expiration, returns, refunds, disputes, forced posts and deficits; reconcile against the provider's authoritative balance and transactions.
- [ ] Apply documented rule priority and provider-supported decline reasons. Host shortfall coverage uses only eligible unreserved host funds; another Bill's reserved money is not borrowed silently.
- [ ] Define how a merchant authorization maps to a Bill allocation before promising per-Bill controls. Prefer stable provider identifiers and dedicated credentials where supported; ambiguous matches need an explicit policy. A merchant name alone must not select a private reserve or falsely mark an occurrence paid.
- [ ] Build truthful Needs attention, member notices, support/dispute access, account closure, retention and administrative review with least-privilege audited access. Notification previews omit sensitive financial detail by default.
- [ ] Test simultaneous transactions, duplicates, out-of-order events, timeout-then-success, ACH returns after spending, recurring-worker retries, settlement mismatches and recovery from restored backups.

**Acceptance:** a complete sandbox journey from accepted contribution to funding, Card authorization, clearing and refund/return is correct across Circle, Card and Bill views. Reconciliation discrepancies are visible to operations and do not become invented spendable funds.

### 9. Finish the full interaction and release review

**Files:** `tests/e2e/`, mobile visual fixtures, root validation scripts, deployment/recovery runbooks, `my-app/MOBILE_PREVIEW.md`; create `docs/superpowers/plans/2026-10-04-full-app-release.md`.

- [ ] Walk every canonical route and role against Figma, including alerts, pending/failed outcomes, consent, account recovery, blocking, closure and retained history. Fix the components before patching repeated screen symptoms.
- [ ] Exercise the three cross-product journeys on two physical accounts/devices; kill/restart the app, interrupt connectivity, resend events and use expired links. Review small screens, larger text, VoiceOver, reduced motion and keyboard states.
- [ ] Establish one validation entry point covering formatting, lint, types, domain tests, migrations, permissions, integration, dependency/security checks, production builds and critical E2E journeys. Extend the existing mobile `npm run validate`; do not claim mobile export proves backend correctness.
- [ ] Recheck Apple signing, entitlements, app links, native SDKs, privacy disclosures and account deletion. Distribute a controlled TestFlight build after the required build/submission steps; preserve a tested rollback path.
- [ ] Complete the production gate: executed provider/program approvals, accepted legal/operational duties, production configuration, funding limits, dispute/return handling, monitoring, reconciliation, restore drill and incident controls.

**Acceptance:** the combined application is testable as a coherent product and live capabilities are enabled only when their approval and operational gates pass. A financial gate blocks live financial activation, not unrelated application development.

### 10. Account for the remaining established capabilities

**Files:** scope/capability matrix and separate plans for approved goal/Pledge and managed-spender flows.

- [ ] Include existing approved goals and recurring contribution variants in the inventory. They must reuse the agreement engine; only net settled contributions advance a funded goal. Final-payment calculation and Card-versus-Bill attachment require an explicit specification before coding.
- [ ] Keep Trusted Spender and managed-spender designs distinct. Minor/household access is included as a capability to qualify, not assumed available because an adult Card program exists.
- [ ] Tag each existing control as supported, unsupported or pending provider confirmation. Keep deferred premium-only roadmap items visible in the register without implementing paywalls or mislabeling them as core omissions.

**Acceptance:** “entire Potluck” has an explicit capability register; no existing family of screens disappears silently from the plan, and no unsupported financial feature is presented as working.

## Problems, resolutions and remaining dependencies

| Problem | Resolution | Evidence required before calling it resolved |
|---|---|---|
| Multiple Figma generations and repeated states | Canonical screen/state register, shared component implementation, route-by-route visual review | Every included journey mapped; duplicates distinguished from missing behavior |
| Mobile app currently uses local sample data | Persistent backend, authenticated API, safe local drafts/cache, shared invalidation and reconciliation | Two-account restart/offline tests; no sample success in production |
| Old documents assume different providers or Card prerequisites | Dated precedence and capability matrix; independent-role contracts | Product/docs/API/UI agree; role tests deny unintended access |
| Ambiguous group ownership and permissions | Per-resource authorization; separate Circle/Bill/Card grants | Cross-role permission matrix tested at API level |
| Provider may reject multi-person funding or account structure | Qualify the exact funds flow before integration; compare an alternative approved issuer/banking stack if Stripe declines | Written program decision, responsibilities, commercial terms and supported APIs |
| Async payments, retries and duplicate webhooks | Explicit state machines, transaction boundaries, idempotency, inbox/outbox and reconciliation | Duplicate/concurrency/failure tests plus sandbox lifecycle evidence |
| Shared balance can accidentally spend another Bill's reserve | Auditable allocations, atomic holds, provider-supported controls and exception handling | Concurrency and return/force-post tests; provider confirms enforceable limits |
| A rent/utilities provider does not accept the issued Card | Identify payment-rail compatibility in setup; qualify another rail explicitly if needed, with its own consent and reconciliation | Supported merchant/payment flow verified; no claim that virtual cards pay every Bill |
| A Card charge cannot be reliably associated with a Bill | Specify provider-ID/credential mapping and review ambiguous matches; distinguish funding readiness from actual merchant payment | Multiple Bills with the same merchant and unmatched-charge tests |
| Flexible Bills and allocation changes can overcharge | Versioned terms, personal caps, exact cent allocation and renewed acceptance | No change exceeds accepted authority; stale acceptances rejected |
| Public discovery can expose private financial/group data | Separate public listing models; explicit reviewed handoff; server permission checks | Private identities, messages and financial data absent from unauthorized responses |
| Brand/service eligibility and abuse are not solved by a disclaimer | Implement linked Sharing Rules, relevant eligibility declarations, moderation and record of acceptance; obtain counsel review of launch practices | Actual operating policies and reviewed use; no claim that the UI grants legal immunity |
| Native secure-display or identity SDK may not fit Expo Go | Use the existing development-build path; validate provider-supported native components early | Secure flow verified on a physical device; no raw credential workaround |
| Financial operation costs or reserves may exceed the launch budget | Obtain fees, monthly minimums, reserve/return obligations and support requirements before commitment | Program economics reviewed without relying on unproven interchange revenue |
| Untracked code and shared checkout work risk loss/conflicts | Review and version the existing app first; focused implementation branches/worktrees and small commits | Reproducible checkout; unrelated existing work preserved |
| Full-app work can become an untestable large rewrite | Independently reviewable subsystem plans and complete cross-product slices | Each milestone has a working demonstration and passing relevant tests |

## Provider qualification: exact question and fallback

Qualify this intended flow, not the general phrase “virtual cards”:

**Several contributors' own bank accounts → transfers authorized by those contributors → a host-owned consumer account/balance → Potluck allocations for agreed Bills → host or separately approved spender credentials → merchant payment.**

Written answers are needed on third-party funding, ACH push/pull and recurring authorization, the host's legal ownership/liability, contributor verification and rights, minors, unique spender credentials, returns/negative balances, allocation controls, real-time authorization and fallback behavior, disputes/refunds, closure, geographic availability, and commercial requirements. Distinguish bank-account ownership from a card balance or a display-only allocation.

Stripe currently advertises consumer issuing, so treating all Stripe Issuing as business-only would be inaccurate. Its “for your business” route also cannot be assumed to approve this consumer/family use. Consumer-product availability is not confirmation of Potluck's exact program. If Stripe will not approve the model, retain provider-neutral contracts and qualify another stack against the same flow; any changed legal ownership or product promise must be reviewed explicitly. Multiple supported providers may be necessary, but do not add that complexity until a documented gap justifies it.

No provider outreach, financial activation, or commercial commitment is part of writing this plan. Approval is an external dependency we can prepare for; it cannot be manufactured by an interface, sandbox or terms checkbox.

## Proposed defaults needing a specification before implementation

These recommendations solve known ambiguities; they are not already-approved product facts:

1. **Rounding:** calculate in integer cents; use a documented deterministic remainder allocation and display the exact proposed cents before acceptance. Reject allocations that do not match the Bill amount rather than silently editing someone else's share.
2. **Variable occurrence amount:** use a host-confirmed amount or a verified supported source, subject to agreed caps and required notices. Missing/unconfirmed amounts become an actionable pending state rather than an invented charge.
3. **Account entry:** support guest discovery and contextual authentication; use the approved sign-in methods with an account-linking/recovery policy. Financial onboarding stays actor- and capability-specific.
4. **Housing estimates/privacy:** specify the rent-share denominator explicitly and show how it is estimated. Separate any required private address from public location precision; make exact/flexible move-in behavior explicit in the housing spec.
5. **Invitation-to-arrangement handoff:** default to an explicit Circle invitation from the accepted conversation, with a preview of information being shared. Joining does not accept financial terms.
6. **Operational ownership:** assign responsibility for moderation, provider disputes, reconciliation exceptions, account closure and incident response before a live pilot. An automated workflow does not remove the need for an accountable operator.

## Design rules for every milestone

- Reuse exact approved Figma components, assets and tokens; keep new gap-filling Figma screens/components in a clearly named, separately removable continuation section beside the existing work.
- People and shared purpose lead; financial detail supports a decision. Circles, Cards, Bills and Splitfinder retain recognizable, distinct layouts rather than the same repeated information-card template.
- Put primary screen actions above the persistent bottom navigation where appropriate, with safe-area/keyboard handling. Do not move local controls such as message retry or a picker option into a global bottom action merely for consistency.
- Use standalone typography, rows, separators, timelines, real calendars/date selection, amount controls and contextual sheets when these better convey the task. Optional explanation can expand; essential consent and status remain visible.
- Use one consistent Back component and predictable return semantics. Correct tap area, alignment and behavior matter as much as icon appearance.
- Brand search returns brands only. Individual listings can have specific service titles and show the person offering them. Maintain logo and generic asset variants from one layout/configuration, with logos the current default.
- Savings belong on the detail/review surface and use the established approved savings component. Use actual disclosed comparison inputs; do not assume every group saves a fixed amount or promise annual savings without its price/time assumption.
- Subscription directory cards retain numeric open/filled spots; individual listings/profile contexts introduce people where the user chooses whom to contact.
- No fabricated status-bar clock/Wi-Fi/battery. Respect the device's native safe areas. No unnecessary explanatory cards, repeated category questions, generic yellow error panels or decorative icons with no purpose.
- Test readable text contrast, at least 44×44-point touch areas for core controls, larger text and screen-reader labels; do not rely on color alone for payment, pending or failure states.

## Validation, release and rollback

The existing mobile validation command is `npm run validate` in `my-app`; it covers lint, TypeScript, current model tests and Expo exports. It has not been rerun for this planning-only task. A future root validation command must add server, migration, access-control, provider-adapter and end-to-end coverage before full-app completion can be claimed.

Keep development, staging/sandbox and production isolated. Gate financial commands server-side on environment, provider approval and account capability, not just a hidden button or client flag. Disable new collections/issuance safely during incidents while continuing reconciliation and preserving access to records, support and required fund-return processes.

Use forward-compatible migrations and phased API releases so an older installed app can still read valid state. Do not delete financial/audit data to roll back UI work. Keep reviewed deployment artifacts, test restores, and design rollback behavior per migration. Native dependency changes may require a new binary; a JavaScript update is not a universal rollback mechanism.

Full completion means the canonical journeys work between real authenticated test users; relevant data survives restart; each role sees only authorized information; the interface matches reviewed Figma sources; failure paths are recoverable; financial sandbox behavior is reconciled and tested; and production financial availability is separately substantiated by written approvals and operational readiness. Screen count or a successful Expo export alone does not establish completion.

## Sources checked October 4, 2026

- [Stripe Issuing overview](https://docs.stripe.com/issuing) and [consumer issuing](https://stripe.com/issuing/consumer): consumer program availability and bank/program qualification, not approval of Potluck's model.
- [Stripe Issuing for your business](https://docs.stripe.com/issuing/for-your-business): a distinct own-business use case; not an automatic route for consumer group spending.
- [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations) and [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security): migration-controlled persistence and database access controls.
- [Expo development builds](https://docs.expo.dev/develop/development-builds/use-development-builds/) and [linking overview](https://docs.expo.dev/linking/overview/): native client rebuild requirements and link integration.

No live Figma edits, application changes, provider actions, or deployment were performed in preparing this plan. The product-context update records the user's scope decision only.
