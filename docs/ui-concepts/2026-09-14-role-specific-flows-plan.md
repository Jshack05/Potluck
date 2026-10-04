# Card and bill role-specific Figma flows — proposed design

Status: approved by the user on September 14, 2026 and implemented in Figma. See [implementation record and prototype boundaries](2026-09-14-role-specific-flows-implementation.md).

## Scope and approach

Reuse existing screen compositions and component instances wherever possible. Add role variants rather than build separate visual systems. New screen compositions are reserved for spending-access tasks that have no existing equivalent. This is a Figma prototype plan, not implementation of permissions, provider approval, financial operations, or backend state.

Sources: current Figma inventory in `03 Screens` and `02 Components`; `docs/PRODUCT_CONTEXT.md`, `docs/BILLS_CONTEXT.md`, and `docs/UI_FLOW.md`. Figma file: `1hAy3kcZAEvqq8ZNjKU7CD`.

## Role model

- Card host: manages their card, its funding, applicable activity, and approved spending grants.
- Trusted Spender: uses only their assigned credential under its permitted limits and controls. Cannot manage the shared card or funding simply because they can spend.
- Bill host: manages that bill and proposes terms. Has no authority to change another person's funding source or accept their terms.
- Bill contributor: manages their own accepted contribution and its funding authorization. No card access through contribution.
- Circle Host: administers the Circle. Does not automatically host its attached cards or bills.
- Roles belong to each resource, not the account globally. A person can host one bill, contribute to another, and spend on a separately assigned card.
- A person with both spending and contribution roles enters two independent flows. Stopping a contribution does not revoke card access, and card-access removal does not cancel a bill agreement.
- A card host does not gain bill-management authority solely from card ownership. The prototype should not invent support for another person's card funding a hosted bill; that cross-owner arrangement needs a separate product decision if requested.

## Proposed visibility and actions

| Information or action | Card host | Trusted Spender only | Bill contributor only |
| --- | --- | --- | --- |
| Cards index | Owned cards plus separately assigned cards | Assigned cards only | No card gained from contributing |
| Card detail | Management view | Assigned-card use view | No access |
| Spendable funds | Applicable provider-confirmed amount | Amount actually usable under the spending grant; separately show personal limit/remaining allowance | Hidden |
| Total pool balance, individual bill reserves, pending general card deposits | Host management view | Hidden by default; explanation that displayed spendable funds exclude unavailable money is sufficient | Hidden |
| Card credentials | Only own assigned credential | Only own assigned credential | Hidden |
| Activity | Applicable shared-card activity and spender attribution | Own assigned-credential activity by default | Own contribution history and permitted bill payment records; no card ledger |
| Card controls | Manage supported controls | Read own applicable restrictions | Hidden |
| Rename, appearance edit, add bills, manage spenders, close shared card | Host only | Hidden | Hidden |
| General card funding | Host-authorized flow | No access from spending role alone | Contribute through own bill agreement, not general card funding |
| Funding account information | Own accounts; no contributor banking details | None through spending role | Own account only |
| Other bill participants | Determined by separate bill role | None through spending role | Only what bill visibility permits |
| Bill changes | Determined by separate bill-host role | No authority through spending role | Review own changes; accept or decline own terms |

Bill contribution transparency already exists in the product context. Preserve normal/shared bill views of permitted names, agreed shares, and payment status. Do not turn those into banking-detail views. Private/anonymous arrangements hide other participants' identities and amounts; show the viewer's own agreement and only aggregate bill information permitted by that arrangement. Never expose details through row counts, avatar stacks, notifications, deep links, or disabled controls when the details themselves are private.

For contributor bill detail, remove the full attached-card visual, balance, reserves, and card navigation. Keep the bill name, Circle identity if permitted, bill host, own amount, due date, payment mode, and bill-level payment state. A separately approved spender can still access their card from Cards; do not force that linkage into the contributor view.

## Existing screen mapping

| Planned screen/state | Reuse or new composition | Existing source and adjustment |
| --- | --- | --- |
| Cards / mixed ownership and spender-only | Adjust | `547:1625` and expanded states `563:1705`, `570:1755`, `570:1824`, `570:1893`. Preserve card stack; use Host / Trusted Spender consistently. Show only authorized cards. Setup prompts only for owned cards. |
| Cards / no card access | Adjust | `766:3012`. Contributor-only user sees no funding-card preview; can independently create their own card. |
| Card detail / Trusted Spender | Adjust | `573:1988` Grocery and `573:2126` Trip. Remove edit, Fund card, Add bill, and shared-card Freeze. Add host identity/contact and Your spending permissions. Keep own credential reveal and own activity. |
| Card detail / Host | Adjust | `573:1920` Family and `573:2058` Apartment. Preserve management actions; wire people, activity, and host controls to proper destinations. |
| Your spending permissions | Adjust | `622:2671`, `622:2832`. Replace editable settings with read-only restrictions, limit, remaining allowance, and host contact. Do not list other spenders. |
| Host card settings | Adjust | `622:2591`, `622:2752`. Keep host-only controls; distinguish card-wide policy from an individual's limit. |
| Available to spend / spender | Adjust | `1151:5159`. Explain usable amount and applicable personal limit without total pool balance, named reserves, or Fund card. |
| Host balance and funding | Reuse with restricted entry | `1151:5159`, `1151:5189`, `1151:5263`, `1151:5290`. General card funding remains on an eligible host path. |
| Own card details reveal | Adjust existing state | Existing `Card details / ...` reveal layers and Show details action. Label the assigned user; prototype fixture must be distinct from host credential. Do not recreate card artwork. |
| Transaction list and record / host vs spender | New composed screens using existing rows | Expand the Card Detail transaction rows into reusable list/detail screens. Host sees applicable shared activity with attribution; spender sees own credential's purchases, reversals, refunds, and relevant declines. No host deposits in spender activity. |
| Trusted Spender invitation review | Adjust | Circle invite `515:1456` and agreement review `1330:10437` visual shells. Replace contribution terms with card access, host, applicable restrictions, acceptance, and required approval explanation. No contribution bank-account selection. |
| Card access / required checks | Adjust | Existing authentication/getting-started shells and status cards. Represent provider handoff generically, with returned pending/action-required states. Do not invent provider forms or successful eligibility. |
| Card access / ready or invitation declined | Adjust | Existing confirmation/declined components. Ready only after approval and assigned credential; invitation acceptance alone is insufficient. |
| Card access / paused, removed, closed, approval unsuccessful | Adjust | Existing notice/error/status compositions. Distinct copy and next actions; hide unavailable credential actions and new spending. Preserve permitted historical/support access. |
| Card transaction declined | Adjust | Existing help/status shell with own transaction summary, permitted reason, and contact host/support actions. Never imply a funding obligation. |
| Host / Trusted Spenders list and person detail | New composed screens using existing people rows | New spending-grant management content. Invited, pending approval, active, paused, and removed states; per-person permitted controls. Reuse avatars and list components. |
| Host / invite spender and review permissions | Adjust plus new permission form | Reuse people picker from Add People and review shell. The spending-permission form is new content. Individually invite; Circle selection never grants access automatically. |
| Host / pause or remove spending access | Adjust | Existing review/confirmation shells, with card-access-specific copy. Explain exact scope; preserve history and do not alter bill agreements. |
| Bills / ownership distinction | Adjust | `714:2708`. Use My hosted bills / Bills I contribute to filters or sections; role is bill-specific. A bill appears once in All bills even if host also contributes. |
| Bill detail / Host | Adjust | Five `714:*` Bill Detail screens. Host role label; manage bill, propose change, manage contributors, view bill readiness/history, end bill. |
| Bill detail / Contributor | Adjust | Same Bill Detail shell plus `1490:18488` and `1480:17474`. Emphasize Your contribution, payment action/status, own agreement/history, and message host. Remove card preview and host management. |
| Bill detail / private contributor | Adjust variant | Same contributor shell with other people's rows, avatar stacks, and amounts omitted according to visibility. Keep own financial information accessible. |
| Bill changes, payment, funding update, stop contributions | Reuse | Existing `1330:*`, `1348:*`, `1375:*`, `1377:*`, `1480:*`, `1489:*`, `1490:*` agreement and follow-up flows. Connect to contributor overview, not host resolution flow. No duplicate rebuild. |
| Bill ended / contributor | Adjust | `1525:18787` and history screens. Explain own future contributions stopped and own records; no End bill or management actions. Pending transfers remain distinct. |
| Circle detail / member permissions | Adjust | `218:314`, `371:521`, `371:551`, `463:750`. Filter attached assets by access; card/bill taps route by that asset's role. Circle Host status must not override access. |
| Inbox / card invitation and role-aware alerts | Adjust | `1209:7402` and existing update cards. Distinguish card invitation from bill agreement and Circle invite. Spender alerts and contributor alerts have independent destinations. |

New compositions are mainly transaction list/detail and spending-grant management. The remaining work is screen variants, state variants, and wiring using existing layouts. A final frame count should follow component assembly; do not duplicate every card name for every state.

## Prototype paths

1. Spender-only: Inbox card invite -> review -> accept -> required checks -> pending -> ready -> assigned card -> own details / permissions / own activity.
2. Existing spender: Cards -> Grocery or Trip -> permissions / activity / contact host. No route to host settings or general card funding.
3. Host: owned card -> Trusted Spenders -> choose person -> permission review -> invite; existing spender -> review pause/remove -> result.
4. Contributor-only: bill invitation -> own agreement -> funding method -> acceptance -> contributor bill detail -> payment/history/change agreement. No route to the attached card.
5. Bill host: Bills / My hosted bills -> bill detail -> existing proposal, contributor management, and ending flows.
6. Combined roles: Cards opens spending tools; Bills opens own agreement or bill-host management according to that bill's role. Role permissions do not propagate between resources.

## Recommended boundaries needing design approval

- Spender sees only own assigned-credential transaction history by default, not the entire group's purchases.
- Spender sees usable funds and personal limits but not named bill reserves or total shared-pool funds.
- Contributor detail omits the attached funding card entirely. Bill-level status remains visible as permitted.
- Preserve contribution visibility already configured for the bill; no new privacy selector or silent migration of existing visibility is introduced here.
- Do not add spender self-freeze/unfreeze until its provider-supported scope is confirmed. Initial spender security action can be Contact host / Get help; host pause/removal is a clearly labeled prototype of the approved intended model.
- Managed-minor-specific onboarding is excluded from this adult Trusted Spender design. It depends on separate eligibility and provider decisions.

## Build and validation sequence

1. Promote repeated role-sensitive content to reusable variants on `02 Components`; keep linked instances on `03 Screens` and preserve old references.
2. Complete host vs spender card detail, settings, spendable amount, and Cards entry states first.
3. Complete host vs contributor bill overview and Circle/Inbox routing next; reuse existing contribution flows.
4. Add invitation/approval/access-status and host spender-management paths.
5. Add scoped transaction list/detail variants and security/help states.
6. Verify each path visually and inspect every reaction destination, including all Grocery/Trip and Family/Apartment entry points.
7. Verify contributor-only access contains no card credentials, balances, general funding, card settings, or card deep links.
8. Verify spender-only access contains no bill management, contribution enrollment, shared-card edit controls, or other people's credentials/banking data.
9. Verify mixed roles, normal/private/anonymous visibility, pending approval, paused/removed access, long names, empty lists, larger groups, and scrolling. Permission-hidden information must not survive through alternate links.
10. Preserve current sizing, navigation, artwork, editable text, and role-neutral icon geometry. Validate counts and absence of clipped/overlapping content before reporting completion.

## Product and implementation boundaries

- Target: hosts coordinating shared bills/cards, approved adult spenders, and invited bill contributors.
- Promise: See and control exactly the part of the arrangement that belongs to you.
- Placement: Free/core; no new paid gates or upgrade prompts.
- Acquisition: independent, understandable bill and spending invitations.
- Retention: clear recurring responsibilities and dependable access/status explanations.
- Differentiation: explicit contribution consent and independently assigned spending access rather than shared credentials or a passive expense ledger.
- Metric: completion of the correct invitation/role path; permission misrouting and unauthorized-information exposure are guardrails. No monetization claim is made for this correctness work.
- Source of truth: future provider-backed card/credential/transaction state, accepted contribution agreements, and server-side grants. Figma uses clearly illustrative fixtures only.
- No real money movement, migrations, or credential handling occur in this design task. Prototype variants are not security enforcement. Runtime implementation requires server authorization, provider support, auditability, consent, idempotency, and relevant failure/permission tests.
- Product context is not changed by this proposed plan; record approved visibility decisions after review.
