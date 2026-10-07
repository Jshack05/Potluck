# Potluck flow restoration implementation plan

> **For agentic workers:** Use the implementation and review workflow in the current isolated worktree. The founder approved recovery of the audited existing Figma flows. Keep independent changes in separate files and coordinate shared contracts with the root implementer.

**Goal:** Restore the existing Potluck interaction designs in the real app, including optional bank setup, without inventing financial execution.

**Architecture:** Retain Expo Router, the shared React Native design system, the authenticated server API, PostgreSQL-compatible local persistence, consent/state machines and provider boundaries. Separate planning and organization resources from provider-backed activation, banking and money movement. Adapt Figma components into interactive native layouts, never screenshots as UI.

**Tech stack:** Expo 57 / React Native / TypeScript; local Node API; existing domain/contracts/database packages.

**Specification:** October 6 live Figma audit in the conversation, Figma file `1hAy3kcZAEvqq8ZNjKU7CD`, existing screen IDs below, and the founder's instruction to recover those flows. This is a continuation of approved designs, not a redesign. Latest optional-bank instruction supersedes October 5 blanket Cards/Bills access gating.

## Global constraints

- Preserve authentication repair at `57f63a7`; retain sign-in for the full app.
- Do not modify Figma or redesign Splitfinder.
- Reuse existing Potluck screens, assets, colors, typography, artwork, buttons, sheets and layout hierarchy.
- Keep the global creation plus consistent; main tab changes must not slide horizontally; keyboard avoidance must not lift bottom navigation.
- Existing permissions, ownership, consent, idempotency, audit records and financial data protections remain server enforced.
- Planning a Card/Bill/Goal is not bank confirmation, issuance, a spending grant, debit consent or a successful transfer. No invented accounts, balances, payment records or provider outcomes.
- Bank setup is contextual to Card activation, Bill import and bank-funded actions. Unconnected manual Bills and Card setup shells are available after login.
- No added paid gates, production operations, secret logging, unrelated dependencies or destructive migrations.
- Preserve dynamic user data; Figma's people, amounts and bank accounts are illustrative fixtures, not production defaults.

## Product purpose

Target: hosts, Circle organizers and contributors. Promise: organize your people and shared plans, then connect banking when it is useful. Free/core placement; invitations drive acquisition, recurring coordination and clear status drive retention. Paid conversion is deferred. The connected Circle, Bill and Card experience differentiates Potluck from a passive tracker. Measure account-to-first-arrangement creation, invitation acceptance, flow completion and contextual bank setup completion.

## Tasks

- [x] Foundation: route transitions, stable navigation/keyboard layout, global plus sheet, optional-bank access policy, server authorization regression tests. Owner: root. Shared files: design/system.tsx, services/navigation.ts, API app.ts/contracts and context docs.
- [x] Circles: recover home/detail composition, Create Circle image/people/settings, Add People sheet, invitation review/pending/cancel, members/admin/privacy and host handover outcomes. Sources: 7:423, 335:506, 542:1632, 488:1203, 218:314, 2019:38309–39408. Owner: circle implementer; owns Circle-specific app/features files and isolated backend support after coordination.
- [x] Cards and Goals: restore Card details → appearance → Circle → review; role-aware detail/actions; funding/control/spender screens must expose truthful setup boundaries. Restore Goal creation/detail/terms using existing design and safe persisted planning state. Sources: 854:3466, 928:4751, 854:3495, 855:3408, 573:1920, 1151:5159–5290, 1606 role family, 793:3211–3386, 812:3466, 839:3372. Owner: card/goal implementer; owns Card/Goal-specific app/features and isolated new modules.
- [x] Bills: restore page-by-page identity/icons/color/schedule/people/allocation/connection/review, All bills then Shared, import/manual entry, two-step agreement choice and outcomes, payment-review entry, detail/management/history/ending/recovery. Sources: 714:2708, 1056:5016 and schedule variants, 1052:5012–5015, 1330:10437–10901, 1348:10898, 1480 and 1525 families. Owner: bill implementer; owns Bill/agreement app/features files. Keep all calculations and consent contracts intact.
- [x] Account: restore Potluck settings/profile/banking/security/privacy/notifications/help structure from 652:2589 and 669 family. Owner: root. Persist only supported settings, clearly explain unavailable provider actions; no fabricated success.
- [x] Integrate contract/schema changes using new migrations and meaningful permission/retry tests. Review each domain against the live Figma design context and complete a whole-diff review.
- [x] Validate: formatting, lint, strict types, backend/domain/mobile tests, dependency audit and all-platform exports. Browser-walk the restored local flows at phone dimensions. Inspect assets, alignment, overflow, enabled actions, back paths and keyboard container structure. Physical-phone verification remains separately identified.

## Review focus

1. An unbanked authenticated user can create an unconnected manual Bill and an unissued Card setup, but cannot read another user's resources or invoke bank/issuer actions.
2. Circle membership, contribution acceptance and spending access remain distinct; canceled/expired/duplicate invitations and hosting changes are enforced server-side.
3. Back/resume/retry preserves entered values and creation idempotency; no duplicate records or unintended proposals are produced.
4. No blank generic page substitutes for an existing designed flow; provider-dependent paths remain navigable to an honest setup boundary without simulated success.
5. Small screens, keyboard changes and long dynamic names preserve bottom actions/navigation, readable fields and accessible controls.

## Migration and rollback

Use forward migrations for additional planning metadata. Keep existing records and audit history; default old rows to current behavior. Reverting UI/access changes must not delete arrangements or accepted agreements. Do not enable any provider without separate integration and program approval.

## Progress

- Baseline: clean integration worktree at 57f63a7; audit completed against live Figma and current code. Original repository has unrelated work and is not the implementation target.
- Approval: founder explicitly requested implementation after the audit. Continue without additional design approval questions.

- October 7: recovery implemented and independently reviewed. Final local gate passed (47 backend/domain and 39 mobile tests; iOS/Android/web exports). Full gate ran but mobile audit remains blocked at 23 findings. Device keyboard verification remains outstanding. See [review and evidence](../../ui-concepts/2026-10-07-potluck-restoration-review.md).
