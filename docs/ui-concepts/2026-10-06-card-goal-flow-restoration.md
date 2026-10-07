# Card and Goal flow restoration — October 6, 2026

The founder approved recovery of the existing Figma flows in the local app. These are Free/core organization flows for hosts and their invited people. The promise is to organize a shared purpose and prepare a Card before banking becomes relevant. Circle invitations support acquisition; saved arrangements and agreed plans support retention. Paid conversion remains deferred. Measure completion from account to first arrangement and contextual banking handoff. This connects people, planned contributions, Bills and Cards beyond a passive tracker without implying that funds are currently available.

## Source-to-route mapping

All source nodes are in Figma file `1hAy3kcZAEvqq8ZNjKU7CD`. Design context and screenshots were retrieved before implementation. Figma's names, bank accounts, balances and transaction fixtures are not application defaults.

| Figma source | Application route / behavior |
| --- | --- |
| `854:3466`, `928:4751`, `854:3495`, `855:3408` | `/create/card`: details, appearance, Circle, review; one persisted idempotent creation draft |
| `547:1625`, `563:1705` | `/cards`: real Card stack with expansion, setup entry and global creation menu |
| `573:1920`, `573:1988` | `/card/:id`: host actions vs assigned-spender action structure driven by the authorized Card response |
| `1151:5159` | `/card/:id/balance`: unavailable balances remain unavailable; Bill amounts never become a balance |
| `1151:5189`, `1151:5263` | `/card/:id/fund`: amount selection and transfer review, stopping at an eligible account / issuing-program boundary |
| `1606:19916`, `1606:20151`, `1606:20515`, `1606:20227` | `/card/:id/people` and `/card/:id/invite`: actual Circle people, proposed limit and review; no invitation is sent |
| `1606:21248` | `/card/:id/activity`: truthful unissued state, with no fabricated transactions |
| `793:3211`, `794:3257` | `/create/goal`: target or time-based choice and planning preferences |
| `801:3338`, `812:3466`, `793:3256`, `801:3313`, `801:3363`, `839:3372`, `793:3292` | Goal target/duration, Circle, people, allocations, schedule, Card and review steps |
| `793:3345`, `793:3386` | `/goal/:id`, `/goal/:id/terms`: saved Goal plan and readable proposed terms |

Card setup, secure-detail and control pages connect the designed navigation to the supported setup shell. No issuer-approved spender exists in the current backend. Accordingly, the app does not show a fictional active credential, pause/restore outcome, funding-pending record, approval outcome or removal result. The rendered spender invitation review stops before sending or granting access. The real provider grant/revoke, secure credential display, transfer submission, settlement and issuer decision screens require a later approved integration.

## Persistence and boundaries

- Card draft fields and wizard position survive navigation. The existing creation command freezes the submitted body and idempotency identity through uncertain retries.
- Card ownership is enforced by the API. The current response includes the host role, empty spenders and null financial balances. Circle membership is never converted into card access.
- `POST /v1/goals`, `GET /v1/goals` and `GET /v1/goals/:id` persist and read host-owned planning records. Lists are paginated with `offset` / `nextOffset`.
- Goal state is `draft` only. There are no Goal contribution agreements, invitations, outbox deliveries, transfers or provider identifiers. `fundedMinor` stays null; progress is not presented as a provider balance.
- Contribution amounts are integer USD minor units. The target, schedule, distinct selected people, Circle permissions, Card ownership, blocking rules, currency and date range are checked on the server. A draft may contain no contributors.
- `lockFundsRequested` and `showContributions` are planning preferences. They do not lock money or expose contributions. Showing contributions requires an attached non-anonymous Circle; Goal drafts themselves remain host-only.
- Target Goals have a positive target and no end date. Time-based Goals have a finite duration-derived end date or an explicit indefinite duration. The UI clamps calendar-month ends and preserves local calendar dates.

## Assets and appearance

`goal-target.svg` is the original 24 × 24 Figma target (`687:2701`); `goal-target-hero.svg` is the 36 × 36 hero (`828:3389`). They retain those rendered dimensions in their 56 / 64 px icon wells. The original local photographic Aurora and Graphite backgrounds remain dynamic Card backgrounds. The six appearance tiles use the editable Figma fills: Aurora gradient, Sunset gradient, Evergreen, Coral, Ocean and Violet. The last is stored under the stable internal value `berry`. No rendered screen is used as an image asset.

## Migration and rollback

`0007_goal_planning.sql` adds Goal drafts and proposed-contribution rows with foreign keys, distinct people, amount, currency, date and state constraints. Creation plus its immutable audit event runs in the API mutation transaction. `0008_card_appearance.sql` widens the Card appearance check without changing old choices. Rollback disables the added routes or reverts the UI while retaining records, audit history and the widened appearance values. Do not delete plans or rewrite appearance choices during rollback.

## Validation

Focused API tests cover owner-only reads, unauthorized attachments, exact duplicate retries, changed-body conflicts, privacy, invalid dates / amounts / people, and indefinite Goals. Storage tests cover audit creation, no financial or notification side effects, transaction rollback, database constraints and complete pagination across 51 owned drafts without exposing another host's plan. Calendar tests cover leap years, month-end clamping, year boundaries and invalid durations. The combined journey and arrangement-consent regression tests also pass. TypeScript and scoped ESLint pass. Whole-app visual/export validation is reported in the integration task; physical-device and real-provider testing are separate and have not occurred.

## Card / Goal file inventory

Shared Shell, navigation, access policy and Card contract changes are integrated by the parent task. The Card / Goal implementation owns:

- `my-app/src/app/cards.tsx`
- `my-app/src/app/create/card.tsx`
- `my-app/src/app/card/[id].tsx`
- `my-app/src/app/card/access-info.tsx`
- `my-app/src/app/card/[id]/activity.tsx`
- `my-app/src/app/card/[id]/balance.tsx`
- `my-app/src/app/card/[id]/controls.tsx`
- `my-app/src/app/card/[id]/details.tsx`
- `my-app/src/app/card/[id]/fund.tsx`
- `my-app/src/app/card/[id]/invite.tsx`
- `my-app/src/app/card/[id]/people.tsx`
- `my-app/src/app/card/[id]/setup.tsx`
- `my-app/src/app/create/goal.tsx`
- `my-app/src/app/goal/[id].tsx`
- `my-app/src/app/goal/[id]/terms.tsx`
- `my-app/src/app/goals.tsx`
- `my-app/src/features/potluck/card-preview.tsx`
- `my-app/src/features/potluck/card-scene.tsx`
- `my-app/src/features/potluck/planning-controls.tsx`
- `my-app/src/features/potluck/goal-model.ts`
- `my-app/src/features/potluck/goal-ui.tsx`
- `my-app/assets/potluck/goal-target.svg`
- `my-app/assets/potluck/goal-target-hero.svg`
- `my-app/tests/goal-planning.test.mjs`
- `packages/contracts/src/goals.ts`
- `services/potluck-api/src/application/goals.ts`
- `services/potluck-api/src/modules/goals.ts`
- `db/migrations/0007_goal_planning.sql`
- `db/migrations/0008_card_appearance.sql`
- `tests/integration/goal-planning.test.ts`
- `tests/integration/goal-storage.test.ts`
- `docs/ui-concepts/2026-10-06-card-goal-flow-restoration.md`
