# AGENTS.md

## Purpose

This file defines how AI coding agents must work inside the Potluck repository.

Potluck is a financial application involving virtual cards, shared funding, bank-account transfers, invitations, recurring contributions, card controls, and transaction authorization decisions. Changes must prioritize correctness, security, auditability, compliance, and protection of user funds.

This file is authoritative for repository-wide agent behavior. More specific `AGENTS.md` files may be added inside individual applications or packages. When instructions conflict, the most specific file applies unless it weakens security, compliance, testing, or data-integrity requirements.

---

## Required Context

Before planning, changing, or reviewing code, read:

1. `AGENTS.md`
2. `docs/PRODUCT_CONTEXT.md`
3. `docs/BILLS_CONTEXT.md` for any work involving bills, recurring obligations, variable contributions, bill schedules, bill alerts, or a Bills interface
4. The relevant source files and tests
5. Any package-level `AGENTS.md`
6. Relevant architecture decision records, API specifications, database schemas, and provider documentation

Do not begin implementation until you can explain:

- Which Potluck user or actor is affected
- Which card, bill, funding source, contribution, invitation, or transaction is affected
- Which authorization and consent rules apply
- Whether money movement or card authorization is involved
- Which external provider or system owns the source of truth
- What must be tested before the change is considered complete

If the product context and implementation conflict, do not silently choose one. Report the conflict and propose the smallest safe resolution.

---

## Product Vocabulary

Use the terminology defined in `docs/PRODUCT_CONTEXT.md`.

Important working terms:

- **Host**: The user who creates and controls a shared card or shared bill.
- **Primary account holder**: The host, who owns the provider balance and remains financially responsible under the intended program.
- **Circle Host**: The primary organizer of a Circle, responsible for Circle membership removal, privacy mode, and Circle-level administration. Circle Host status does not confer ownership or control of every Card or Bill attached to the Circle.
- **Circle**: A reusable, consent-based group whose accepted members may connect Cards and Bills subject to individual permissions and acceptance. Circle membership does not itself create a financial obligation or spending right.
- **Participant**: The canonical contribution-domain term for a person invited to fund a shared card or bill. "Contributor" is the preferred user-facing term. Contributing does not grant spending rights or ownership.
- **Authorized spender**: An issuer-approved adult with a unique, host-revocable credential and no ownership of the host account or funds. "Trusted Spender" is the preferred user-facing term; backend and provider contracts retain the legally accurate authorized-spender or authorized-user role.
- **Managed spender**: An issuer-approved minor or household member whose unique credential and controls are managed by the host.
- **Shared card**: A Potluck object representing a host-controlled virtual card and its associated participants, earmarks, rules, funding arrangements, and transaction history.
- **Shared bill**: A recurring or one-time obligation funded by agreed participant contributions.
- **Fixed bill**: A recurring bill with the same configured amount for each occurrence until the host proposes a change.
- **Flexible bill**: A recurring bill whose amount may vary by occurrence up to a host-configured bill maximum, with an optional estimate used only for planning.
- **Contribution agreement**: The amount, schedule, funding source, and consent status associated with a participant’s contribution.
- **Pledge (working name)**: A contributor-approved agreement to provide a fixed amount monthly until an accepted total goal is reached or indefinitely until canceled. "Pledge" is provisional user-facing terminology and may be renamed without changing the underlying contribution-agreement model.
- **Card-control rule**: A rule that permits or declines a transaction based on merchant, industry, category, marketplace, amount, time, location, or another supported attribute.

Do not introduce new names for these concepts without updating `docs/PRODUCT_CONTEXT.md` and all affected contracts.

---

## Core Engineering Principles

### 1. Protect money and user consent

Never move money, create a debit, change a contribution, or authorize a recurring withdrawal without an auditable record of the user’s consent and the exact terms they accepted.

A participant must explicitly accept:

- The amount or calculation method
- Whether the contribution is one-time or recurring
- The schedule or triggering condition
- The funding source
- The effective date
- Any maximum amount or variable-payment rule

A host may propose or modify a contribution, but a change that increases or materially alters a participant’s obligation requires renewed participant acceptance before it becomes active.

### 2. Treat provider systems as external sources of truth

Do not invent card, ACH, identity, balance, authorization, or settlement state locally.

Persist provider identifiers and normalized local state, but reconcile against provider webhooks and APIs. All webhook handlers must be idempotent and safe to retry.

### 3. Separate product roles from legal roles

Do not infer a spending role from contribution status. Authorized and managed spenders require a separate grant and explicit support from the card issuer, bank partner, and implemented program. Never represent one user as another or treat shared credentials as a substitute for an approved role.

Use neutral internal language where legal status is not confirmed.

### 4. Make financial operations idempotent

Every operation that may create or alter money movement must use an idempotency key or equivalent deduplication mechanism.

This includes:

- Manual deposits
- Automatic deposits
- ACH debit initiation
- Card creation
- Invitation acceptance
- Contribution activation
- Refunds
- Reversals
- Authorization decisions
- Webhook processing

### 5. Prefer explicit state machines

Do not represent important workflows with loosely related booleans.

Use explicit states for:

- Invitations
- Contribution agreements
- Funding transfers
- Shared cards
- Virtual cards
- Authorization decisions
- Disputes
- Refunds
- User verification

Every state transition must define:

- Allowed prior states
- Required actor
- Required permission
- Required provider state
- Side effects
- Audit event
- Retry behavior
- Failure behavior

### 6. Deny by default

For permissions, tenant or resource access, card controls, webhook validation, and sensitive operations, deny unless the action is explicitly allowed.

---

## Architecture Rules

Keep boundaries clear even if the implementation stack changes.

### Domain layer

Contains business concepts and rules, including:

- Users and identities
- Shared cards
- Shared bills
- Invitations
- Contribution agreements
- Funding schedules
- Card-control policies
- Authorization decisions
- Audit events

The domain layer must not depend directly on web frameworks, UI libraries, databases, payment-provider SDKs, or card-issuer SDKs.

### Application layer

Coordinates use cases such as:

- Create a shared card
- Invite a participant
- Propose a contribution
- Accept or reject a contribution
- Initiate a manual deposit
- Schedule an automatic deposit
- Evaluate a card authorization
- Add a merchant-specific control after a transaction
- Pause or close a shared card

Application services must enforce permissions, state transitions, idempotency, and transaction boundaries.

### Infrastructure layer

Contains:

- Database repositories
- Card-issuer integrations
- Bank-linking integrations
- ACH or payment integrations
- Email and notification delivery
- Webhook adapters
- Queue workers
- Logging, metrics, and tracing

Provider-specific data must be converted into stable internal contracts before entering the domain layer.

### Presentation layer

Contains:

- HTTP or RPC endpoints
- Web and mobile user interfaces
- Request parsing
- Response formatting
- Authentication middleware

Controllers and route handlers must not contain core business logic.

---

## Security Requirements

All sensitive operations require server-side authorization. Never rely on hidden UI elements or client-side checks.

At minimum:

- Encrypt data in transit and at rest using approved platform capabilities.
- Never log full bank-account numbers, card numbers, CVVs, access tokens, refresh tokens, identity documents, or secrets.
- Store only the minimum provider data required by the product.
- Use tokenized provider references instead of raw financial credentials.
- Verify webhook signatures before processing events.
- Apply replay protection to webhook and authorization events.
- Use least-privilege credentials and service permissions.
- Rate-limit invitations, funding attempts, authentication attempts, and sensitive mutations.
- Record immutable audit events for financial and administrative actions.
- Keep secrets outside source control.
- Do not expose internal provider errors directly to users.
- Validate every request with explicit schemas.
- Use database constraints in addition to application validation.

Do not claim PCI, SOC 2, bank, money-transmitter, NACHA, KYC, AML, or other compliance status in code or documentation unless formally confirmed.

---

## Card Authorization and Decline Rules

Card-control behavior must be implemented only through capabilities supported by the card-issuing provider and approved program configuration.

Rules may evaluate supported attributes such as:

- Merchant category code
- Merchant identifier
- Normalized merchant name
- Marketplace or platform
- Transaction amount
- Available shared-card funds
- Card status
- Time or recurrence pattern
- Host-configured allowlist or blocklist

Requirements:

1. Authorization decisions must be deterministic and explainable.
2. The decision, matched rules, provider request, response, and timestamp must be auditable.
3. Conflicting rules must use a documented priority order.
4. A merchant learned from a prior transaction must not be blocked or allowed without an explicit host action.
5. Merchant identity must use provider identifiers when available; normalized names alone are not reliable identifiers.
6. Do not fabricate an “insufficient funds” response. Return only decline reasons and response codes supported and permitted by the issuer or processor.
7. A rule change must not retroactively alter the recorded outcome of a past authorization.
8. Authorization handling must meet the provider’s latency requirements and fail safely.
9. A logical-pool balance check must atomically reserve the requested hold amount and deduplicate retries by provider transaction token.
10. Reservations must reconcile through clearing, reversal, expiry, refund, and force-post events while the provider remains authoritative for the total financial-account balance.

Default priority unless the product specification states otherwise:

1. Closed, frozen, or compromised card
2. Compliance or provider-required restriction
3. Insufficient available funds
4. Explicit merchant block
5. Explicit category or industry block
6. Amount or velocity limit
7. Explicit allow rule
8. Default card policy

---

## Contribution and Funding Rules

### Manual contributions

A manual contribution requires the participant to actively initiate or confirm the transfer.

### Automatic contributions

An automatic contribution requires an active contribution agreement containing the accepted amount, schedule, funding source, and authorization terms.

### Host controls

A host may:

- Invite participants
- Propose contribution amounts
- Define card-control rules
- View the shared card’s applicable activity
- Pause future collection attempts where supported
- Remove a participant subject to settlement and refund rules
- Grant, restrict, pause, or revoke an issuer-approved spender's assigned credential

A host may not:

- Secretly increase a participant’s obligation
- Change a participant’s bank account
- Withdraw from a participant without active authorization
- Misrepresent a participant’s legal relationship to the card
- View unnecessary private banking details

### Participant controls

A participant must be able to:

- Accept or reject an invitation
- Accept or reject contribution terms
- View active contribution terms
- Revoke or cancel future authorization subject to disclosed timing rules
- Change an eligible funding source through the approved provider flow
- View their own contribution history
- Receive notice of failed, changed, paused, or canceled contributions

An authorized or managed spender may access only the assigned card, applicable controls, available-to-spend amount, and transactions. Card credentials must use the approved provider display or wallet flow and must not be exposed to other users.

---

## Data Integrity Rules

Use decimal or integer minor-unit representations for money. Never use binary floating-point values for monetary calculations.

Every monetary record must include:

- Amount in minor units
- Currency
- Direction
- Status
- Initiating actor
- Benefiting resource
- Provider reference where applicable
- Idempotency key where applicable
- Created and updated timestamps
- Effective or settlement timestamps when applicable

Maintain distinct concepts for:

- Available balance
- Pending balance
- Settled contributions
- Pending deposits
- Authorized card transactions
- Cleared card transactions
- Reversals
- Refunds
- Fees

Do not calculate a user-visible balance from incomplete event subsets.

---

## Version Control Rules

- Treat the GitHub repository as the authoritative source for application code, infrastructure definitions, database schemas, and migrations.
- Perform substantive work on focused branches and keep commits intentional, reviewable, and limited to a coherent change.
- Prefer pull requests for review and integration; document validation results, migration impact, rollback behavior, and unresolved risks in the pull request.
- Import or synchronize generated code, including Lovable-generated interfaces, into GitHub before treating it as part of the production application.
- Do not allow an external builder, deployment environment, or live database to become the only source of an application or schema change.
- Never commit credentials, access tokens, private keys, production financial data, raw banking data, card data, or other secrets. Use approved secret-management and environment-configuration mechanisms.
- Keep environment-specific configuration separate from versioned defaults, and provide safe example configuration where developers need setup guidance.

---

## Database and Migration Rules

- Version-control every database schema change as a migration in the same repository as the code that depends on it.
- Use migrations for every schema change.
- Do not edit a previously deployed migration.
- Apply corrections to deployed schemas through new forward migrations rather than rewriting migration history.
- Version-control safe seed fixtures and reference data when reproducible environments require them; never commit production exports or sensitive user data.
- Keep database credentials and connection secrets outside source control.
- Add constraints for invariants whenever possible.
- Use foreign keys unless a documented architecture reason prevents them.
- Use unique constraints for provider IDs and idempotency keys.
- Make destructive changes in backward-compatible phases.
- Document rollback and data-backfill behavior.
- Never delete financial or audit records merely because a user-facing object is removed.
- Use soft deletion or archival where retention is required.

---

## API Rules

- Version public contracts.
- Validate inputs and outputs with schemas.
- Use stable machine-readable error codes.
- Do not expose stack traces or provider secrets.
- Require idempotency keys for financial mutation endpoints.
- Use pagination for unbounded collections.
- Include authorization checks at the resource level.
- Make retry behavior explicit.
- Document webhook event contracts.
- Preserve backward compatibility unless an approved migration plan exists.

---

## Testing Requirements

A feature is incomplete without tests for its business rules and failure modes.

Required test categories where applicable:

- Unit tests for domain rules
- State-transition tests
- Permission and ownership tests
- Participant-consent tests
- Idempotency tests
- Integration tests against provider adapters or realistic mocks
- Webhook signature and replay tests
- Database constraint tests
- Transaction and rollback tests
- Card-authorization rule tests
- Insufficient-funds tests
- Merchant normalization tests
- Recurring contribution tests
- Retry and duplicate-event tests
- End-to-end tests for critical user journeys

Critical end-to-end journeys include:

1. Host creates a shared card.
2. Host invites a participant.
3. Participant accepts the invitation.
4. Host proposes a contribution.
5. Participant accepts the contribution terms.
6. Participant completes a manual or scheduled contribution.
7. The shared card receives an authorization request.
8. Potluck applies the configured card-control rules.
9. The transaction is authorized or declined.
10. All affected users see accurate status and history.

Tests must not be removed, skipped, weakened, or rewritten solely to make a change pass.

---

## Observability and Auditability

Use structured logs and correlation IDs.

Record audit events for:

- Shared-card creation, pause, freeze, and closure
- Invitation creation, acceptance, rejection, expiration, and revocation
- Contribution proposal, acceptance, modification, cancellation, and failure
- Funding-source addition, replacement, and removal
- Deposit initiation, settlement, return, reversal, and refund
- Card-control creation, modification, matching, and deletion
- Authorization approval and decline
- Administrative access or override
- Security-sensitive account changes

Audit records should identify the actor, action, target, timestamp, request or correlation ID, prior state, resulting state, and relevant non-sensitive metadata.

---

## Agent Workflow

### Before implementation

1. Read the required context.
2. Inspect existing patterns and tests.
3. Identify affected domains and providers.
4. State assumptions and unresolved questions.
5. Produce a short implementation plan for changes spanning multiple modules.
6. Identify security, consent, money-movement, migration, and rollback risks.
7. State the feature's target user, one-sentence marketable promise, plan placement, acquisition or invitation mechanism, subscription-conversion rationale, retention mechanism, competitive alternative, and primary business metric.

### During implementation

1. Make the smallest coherent change.
2. Preserve architectural boundaries.
3. Add or update tests with the implementation.
4. Avoid unrelated refactors.
5. Do not add dependencies without explaining why existing tools are insufficient.
6. Do not weaken validation or security controls.

### Before completion

Run the repository’s documented validation commands. If they do not exist yet, create or recommend a single validation entry point that includes:

- Formatting
- Linting
- Type checking
- Unit tests
- Integration tests
- Security checks
- Production build

Report:

- What changed
- Why it changed
- Files affected
- Tests run
- Validation results
- Assumptions
- Risks or unresolved decisions
- Any required manual or provider-side configuration

Do not claim success when validation has not run or has failed.

---

## Product Marketability Gate

Every proposed Potluck feature must have a clear marketable purpose. A feature is not justified solely because it is useful or technically interesting.

Before approving or implementing a feature, document:

- **Target user:** Who experiences the problem and who pays for the solution
- **User-facing promise:** The benefit in one clear sentence
- **Acquisition:** Why a new host or contributor would try, invite others to, or share Potluck
- **Conversion:** Why the feature makes Plus or Premium worth purchasing without paywalling safety, consent, dispute access, correct financial state, or essential access to funds
- **Retention:** How the feature becomes part of a recurring workflow or reliably removes work, uncertainty, or financial friction
- **Differentiation:** Why a bill tracker, budgeting app, card product, or expense-sharing product is not an adequate substitute
- **Plan placement:** Why the capability belongs in Free, Plus, or Premium
- **Measurement:** The adoption, invitation, activation, conversion, renewal, engagement, or churn metric that tests the hypothesis

Prefer coherent, memorable product stories over disconnected feature collections. Free must demonstrate a complete and trustworthy core workflow; paid plans sell additional scale, convenience, automation, sophistication, advanced control, analytics, history, and administration.

The current implementation phase is core-product only. Do not implement Plus or Premium paywalls, upgrade prompts, subscription checkout, paid-only navigation, the cross-card Premium Bills workspace, or other premium entitlements unless a later approved task explicitly reopens that scope. Keep paid-plan definitions as roadmap context without allowing them to complicate or gate the working core experience.

Do not use artificial irritation, degraded safety, hidden enrollment, difficult cancellation, or loss of access to an existing financial arrangement as a conversion mechanism.

---

## Context Preservation Rules

The agent must help keep repository context current.

Update `docs/PRODUCT_CONTEXT.md` when a change affects:

- Product scope
- User roles
- Core terminology
- Contribution behavior
- Card-control behavior
- Invitation behavior
- Business rules
- Pricing or plan limits
- Market positioning, acquisition, conversion, retention, or competitive-differentiation decisions
- Provider assumptions
- Security or compliance assumptions
- Major unresolved questions

Do not fill the context document with implementation trivia. Record durable product truths, approved decisions, and important constraints.

When a major decision is made, add a dated entry to the decision log inside `docs/PRODUCT_CONTEXT.md` or create an architecture decision record if the repository uses ADRs.

At the beginning of a new task, summarize the relevant context internally before editing. At the end of a task, check whether the context document has become stale.

---

## Prohibited Agent Behavior

Do not:

- Invent legal or compliance approval
- Invent provider capabilities
- Treat participants as legal cardholders without confirmation
- Issue spending credentials to an unapproved user, share credentials between users, or represent a spender as the host
- Store raw bank or card credentials
- Trigger real financial transactions in tests or development environments
- Use production credentials locally
- Bypass consent requirements
- Fabricate authorization response codes
- Hide failed tests
- Suppress exceptions without handling them
- Log sensitive financial data
- Create undocumented administrative backdoors
- Combine unrelated financial operations into one ambiguous status
- Make destructive schema changes without a migration plan
- Implement a major feature from a one-line request without reviewing product context

---

## Definition of Done

A change is complete only when:

- The behavior matches `docs/PRODUCT_CONTEXT.md`.
- Permissions and consent are enforced server-side.
- Financial operations are idempotent.
- Sensitive data is protected.
- State transitions are explicit.
- Provider events are safely reconciled.
- Tests cover success, failure, duplicate, and unauthorized paths.
- Migrations and rollback behavior are documented.
- Observability and audit events are included where required.
- Documentation is updated.
- Validation passes.
