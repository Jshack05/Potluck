# Potluck app flow map

**Audit date:** October 2, 2026. **Status: broad app map, partial connection verification.**

This maps the existing design and documents for implementation planning. It does not authorize a new release scope, change Figma, implement a backend, or approve financial operations.

## Read this first

The app is not one clean, current prototype. The Figma file contains older full-product flows, newer Splitfinder discovery, role-specific financial views, duplicated visual treatments, and an October 2 continuation section. They must be reconciled before being turned into one navigation tree.

The audit captured **786 frame/instance records**, including alternate states, references, and a review guide. These are **not 786 distinct application pages**. Full reaction trees were captured for **240 records**, containing **1,524 controls and 1,602 transition references**. Multiple child hotspots can represent one user action. Figma's tool quota then stopped extraction.

The remaining **546 captured records have not had their complete connections checked**. Three older sections—Authentication (`955:4752`), Getting started (`985:4904`), and Bill import (`1052:5011`)—were identified but their children were not inventoried. Other nested component states may also exist. Consequently, this is **not an exhaustive verified map of every node in the file**. No live prototype click-through or rendered-screen audit was completed in this task.

- [Searchable screen and connection explorer](flow-audit/index.html): every captured record, incoming/outgoing captured links, conditions, hidden controls, and raw actions.
- [Screen register](flow-audit/2026-10-02-screen-register.md): all 786 captured names and Figma links.
- [Connections CSV](flow-audit/2026-10-02-connections.csv): individual transition references, including branch conditions and visibility.
- [Coverage and limitations](flow-audit/2026-10-02-coverage.json).
- [Raw reaction evidence](flow-audit/2026-10-02-screen-reactions.json).

In the explorer, `REACTIONS_CAPTURED` means the prototype instructions were read, not that their business logic or runtime behavior passed testing. `INVENTORY_AND_DOCUMENT_REFERENCE` means the node exists in the inventory and is mentioned in a repository document. `INVENTORY_ONLY` means only identity/name/size were captured.

## 1. How to interpret the map

| Mark | Meaning |
|---|---|
| **R** | Connection/action found in this audit's captured Figma reactions. |
| **D** | Intended behavior documented in a repository source; not necessarily reverified in current Figma. |
| **I** | Screen exists in the captured inventory; outgoing behavior remains unverified. |
| **P** | Proposed implementation mapping or reconciliation, awaiting validation/decision. |

An arrow in a **D** or **P** row describes the intended journey, not proof that Figma currently wires those nodes together. A frame title such as “Published” or “Card ready” is not evidence of a working service or provider approval.

IDs below refer to Figma file `1hAy3kcZAEvqq8ZNjKU7CD`. Use the register/explorer to open any ID. Raw reaction trees preserve conditional order and variable writes; flattened CSV conditions should not be evaluated independently of earlier actions. Only a partial variable dictionary was captured.

### Authority and conflicting generations

1. [AGENTS.md](../AGENTS.md) governs authorization, consent, financial state, and implementation safety.
2. [PRODUCT_CONTEXT.md](PRODUCT_CONTEXT.md), [BILLS_CONTEXT.md](BILLS_CONTEXT.md), and [SPLITFINDER_CONTEXT.md](SPLITFINDER_CONTEXT.md) define product rules. Later explicit dated decisions take precedence over contradictory older prose.
3. [September 20 decisions](2026-09-20-launch-and-conversation-decisions.md), [September 23 onboarding](2026-09-23-onboarding-research-and-decisions.md), and dated implementation records explain subsequent changes.
4. [UI_FLOW.md](UI_FLOW.md) is the older overall flow baseline, last dated September 13. It is useful but no longer a complete current map.
5. Figma is visual/interaction evidence. A newer frame is not automatically approval to change roles, financial behavior, or launch scope.
6. [Mobile preview documentation](../my-app/MOBILE_PREVIEW.md) and actual Expo routes show what exists in code.

The October 1 conditional combined-launch direction is the latest product positioning: Splitfinder and financial Potluck may launch together **if integration, approval, and readiness permit**. It does not make financial prototypes operational. The actual release navigation still needs a scope decision.

## 2. Whole-app structure

The full-product shell remains **Circles · Cards · Bills · Splitfinder**, with Circles as the default. The current Expo implementation is a narrower discovery preview with contextual navigation. Do not silently add financial tabs to it merely because the broader prototype has them.

```text
Entry / deep link
  ├─ Public discovery → category → service or housing results → listing → profile
  │                     ├─ save
  │                     ├─ request / inquiry → account gate when needed → resume
  │                     └─ create listing → draft → preview → publish checks
  ├─ Account → sign in / sign up / recovery → restore intended destination
  ├─ Circles → Circle → people / invitations / attached authorized assets
  ├─ Cards → owned or assigned card → role-specific actions
  ├─ Bills → All bills / Shared → bill → role-specific agreement or management
  ├─ Inbox → messages / Splitfinder requests / invitations → affected resource
  └─ You → profile / account / privacy / support / sign out
```

### Shared navigation contract

| Entry/action | Destination | Evidence / decision |
|---|---|---|
| Full-product Circles tab | `7:423` | R; default in D. |
| Cards tab | `547:1625` | R. |
| Bills tab | `714:2708` | R. |
| Older Splitfinder tab | First visit `1209:6717`; otherwise `1209:6796`, using a prototype variable | R; conflicts with newer onboarding. |
| Older Welcome → Continue | `1224:8773` category explanation | R; do not adopt as new default without reconciliation. |
| New first opening | Category choice `1784:24235` → relevant opportunities | D + I; implemented in Expo. Complete Figma transitions not audited. |
| Global Inbox | `1209:7268`; tabs lead to `1209:7339` and `1209:7402` | R; newer continuation inbox is a different design generation. |
| Global You | `652:2589` | R; newer continuation account screens also exist. |
| Global + | Overlay `199:266` → `199:317`; internal stay state `207:267` | R. New Circle → `335:506`; New Card → `854:3466`; New Bill points to `1056:5016`; New Goal → `793:3211`. |
| Back from detail, picker, or review | Restore originating list/resource/context | D/P; many older Figma backs are fixed fixture destinations. |
| Invitation or alert deep link | Exact resource and permitted action after authentication | D/P; server authorization required, including stale/revoked links. |

**Implementation recommendation:** use one screen per purpose with resource IDs and explicit state. Do not make separate production routes for Maya versus Jordan, branded versus generic icons, January versus February, or pending versus received examples when one stateful screen can safely represent them.

## 3. Onboarding and account access

### Public entry

**D:** Choose one of Plans, Memberships, Subscriptions, or Spaces, then immediately show relevant opportunities. Change returns to the category picker. Preserve a direct link to a listing rather than diverting the person through unrelated onboarding. The older three-category introduction is historical.

| Screen family | Figma inventory | Mapping |
|---|---|---|
| Current colorful entry | `1784:24235` | D/I: category choice → relevant discovery. |
| Category treatments | `1833:24398`, `1833:24458`, `1833:24517`, `1833:24613` | I: onboarding variants; consolidate behavior rather than adding four mandatory steps. |
| Older/minimal reference | `1782:24235`, `1816:24418` | I: retain as reference; not another onboarding gate. |
| Old Welcome / introduction | `1209:6717`, `1224:8773` | R: old entry remains connected in older tabs. |

### Account and recovery continuation

The following October 2 screens are **I**. The sequence is a **P** implementation mapping supported by the onboarding document's action-specific account-gate recommendation; it is not a verified Figma chain.

| Journey | Proposed sequence using existing screens | Return / failure behavior |
|---|---|---|
| Account needed to contact/publish | Action-specific gate `2014:32810` / `2014:32846`, or account access `2025:40401` → sign in or sign up | Keep listing ID, action, draft, and return target. Cancel returns to the original public screen. |
| Sign up | `2014:32888` → email verification `2014:33037` → profile `2014:33135` → resume `2014:33169` | Error `2014:32923`; resend `2014:33078`; expired `2014:33111`. Verification must be real server state. |
| Sign in | `2014:32958` → password `2014:32986` → intended destination | Error `2014:33012`; provider issue `2014:33205`; offline `2014:33233`. |
| Password recovery | Reset `2014:33257` → check inbox `2014:33279` → new password `2014:33306` → updated `2014:33330` | Expired link `2014:33351`; return to sign in without losing intended action where appropriate. |

**Unverified:** completeness of token expiry, resend throttling, signed-in redirect behavior, account switching, logout, and recovery return paths. Older Authentication/Getting started sections still require inventory. Do not mistake email verification for housing-poster ID verification or financial-provider verification.

## 4. Splitfinder discovery

### Directory versus actionable listing

A service directory answers “What could I share?” A person's listing answers “Who is offering this arrangement?” Keep these as separate screens and data models. Selecting a provider must not imply a partnership, available inventory, sharing eligibility, or a commitment.

| Area | Screen anchors | Intended mapping / evidence |
|---|---|---|
| Subscriptions | Current feed `1763:24097`; community directory `1894:24857`; continuation entry `2015:33052`, brands `2015:33137`, search `2015:33239` | I/D: category → service directory/filter → people's listings. Exact newer wiring unverified. |
| Service listing collections | Netflix `2015:33351`, Spotify `2015:33445`, Dropbox `2015:33509` | I: service-specific collection states; one parameterized collection route in implementation. |
| Service listing detail and profile | `2015:33669`, `2015:33755` | I/P: listing → organizer profile or request. |
| Phone Plans | Plans `2018:37345` → provider search `2018:37433` → listings `2018:37492` → detail `2018:37606` / profile `2018:37686` | I/P; empty `2018:37554`. Carrier-directory variants also exist at `2093:44342`, `2093:44441`. |
| Memberships | Browse `2015:35390`, filters `2015:35478`, empty `2015:35546`, detail `2018:38362` | I/P: collection → listing → organizer/request. Provider eligibility remains arrangement-specific. |
| Spaces / housing | Older main browse `1209:6796` → residential browse `1662:23381` | R into target; residential subflow D. New continuation `2015:34313`, filters `2015:34388`, detail `2015:34488` are I. |
| Saved listings | Older `1209:7461`; newer `2015:35629` | R older fixture actions; I newer. P: saved list → same listing route, retaining category and list position. |
| Search / filters / empty recovery | September 17 twelve-screen set `1720:*`; newer filters `2015:33573`, no results `2015:35307`, loading `2018:38629`, error `2018:38676` | D + I. Preserve query, category, filters, and scroll on detail/back or retry. |
| New subtype picker variants | `2093:43925`, `2093:44018`, `2093:44085`, `2093:44152`, `2093:44219`; generic equivalents `2100:*` | I: separate visual examples, not independent product categories. |
| Experiences and older Working-space paths | `1209:6860`, `1209:7084`, `1246:8693` onward; Working branch `1246:8024` etc. | R older interactions; later/undecided release scope. Do not remove them from the design register or silently include them in launch. |

**Map button:** the September 17 Spaces Map control was intentionally left without a destination. This is an explicit design constraint in [the search implementation record](ui-concepts/2026-09-17-splitfinder-approved-search-screens.md), not a proven broken link.

### Search and back behavior

**D/P:** Search entry → results; filters → Apply → results; Reset/Clear removes only selected search criteria. No results offers broaden/edit/create where approved. Opening a listing and returning must restore the results, selected category, and query. Sort, saved-search alerts, live inventory, and a real map remain implementation/scope work. Example filters and date pickers in Figma are not a search service.

## 5. Requests, inquiries, and accepted conversations

Two journeys must remain distinct: **housing inquiries can start a conversation immediately**; subscription/plan/membership request designs contain review/pending/acceptance states. Do not impose the request acceptance gate on housing by reusing a generic component.

### New request flow — I inventory; P sequence until connections are checked

| Actor / action | Screen sequence | Required distinction |
|---|---|---|
| Visitor introduces themselves | Request `2012:31975` → edited `2012:32042` → ready `2012:32100` → sending `2012:32166` → sent `2012:32215` → pending `2012:32283` | Editing and readiness are state variants. Sending must not be marked sent before persistence succeeds. |
| Visitor withdraws | Pending → review `2012:32348` → withdrawn `2012:32407` | Preserve conversation/request history and update both parties' permitted views. |
| Visitor checks outcome | Accepted `2012:32453`, declined `2012:32527`, unavailable `2012:32581` | Acceptance to talk is not Circle membership, financial consent, or spending access. |
| Organizer reviews | Requests `2012:32640` → host review `2012:32825` / Alex `2012:32902` → accept result `2012:33060` or decline `2012:32957` / `2012:33014` | Request must still be pending and belong to the organizer's listing. |
| Visitor sees sent requests | `2012:32703`; empty `2012:32761` | Distinguish withdrawn, accepted, declined, and unavailable states. Later `2028:*`/`2031:*` frames cover variants. |

Plans use request `2018:37784`, ready `2018:37846`, sent `2018:37910`, pending `2020:39630`, withdraw `2020:39692`, withdrawn `2020:39747`, accepted `2020:39792`, conversation `2020:39844`.

Memberships use request `2018:38467`, ready `2018:38526`, sent `2018:38582`, pending `2020:39961`, withdraw `2020:40015`, withdrawn `2020:40065`, accepted `2020:40110`, conversation `2020:40162`.

Earlier community-discovery `1894:*` includes separate unchecked/checked join declarations and Sharing Rules. **P:** retain a distinct versioned rules/declaration checkpoint where required by the approved arrangement; verify how the October 2 request flow incorporates it before implementation. A prechecked declaration or a missing eligibility step should not be inferred from a newer title.

### Housing contact — D, with older R examples

`Housing results → individual property → organizer profile (optional) → inquiry composer → conversation`.

- Residential source: detail `1662:23035` / `23119` / `23203`; profile `1662:23287`; inquiry `1662:23465`; chat `1662:23546`.
- New continuation: inquiry `2015:35184`; chat `2015:35245` (I).
- Old apartment fixture: detail `1212:8306` → compose `1212:8442` → chat `1212:8530` (R; inspect exact actions in explorer).
- Public inquiry does not require poster ID verification or host acceptance before chatting. Account access and anti-abuse enforcement are separate concerns.
- Separate alternative properties appear on the poster's profile, not grouped on each individual property listing.

## 6. Listing creation, publication, and management

### Current continuation candidates — I/P

| Journey | Proposed sequence using captured frames | Alternate outcomes |
|---|---|---|
| Subscription/service listing | Choose service `2016:35940` → create `2015:33815` → arrangement `2015:33879` → Circle setup `2015:33962` → preview `2015:34027` → publish checks `2016:34995` / checked `2016:35055` → publishing `2016:35120` → published `2016:35167` | Draft `2016:35292`; publish error `2016:35236`. Circle setup in a listing must not automatically enroll others. |
| Custom service | Custom `2016:36046` → category `2016:36112` → arrangement `2016:36163` → preview `2016:36231` → publish `2016:36296` / ready `2016:36352` → published `2016:36407` | Draft `2016:36464`; management `2025:40573`; edit `2094:44380`. |
| Phone plan | Create `2018:37968` → arrangement `2018:38024` → preview `2018:38092` → ready `2018:38154` → published `2018:38210` | Draft `2018:38259`; manage `2025:40647`; edit `2094:44307`. |
| Membership | Create `2018:38306` | Remaining shared/custom creation route must be checked; do not invent a verified complete branch. |
| Manage listings | My listings `2016:35347` / phone `2025:40500` / custom `2025:40428` → active item `2016:35546`, drafts `2016:35422`, inactive `2016:35497` | Own listing `2016:35647`; edit `2016:35716`; saved `2016:35781`. |
| Take down listing | Manage → review `2016:35834` → removed `2016:35892` → refreshed my listings `2020:39512` or inactive `2020:39576` | Preserve associated messages/history. Removing a listing is not deleting a financial arrangement. |
| Timing | Calendar `2015:34107`, time `2015:34200`, timezone `2015:34281`; earlier `1921:*` equivalents | Return to exact field/draft; preserve date, timezone, and purpose. Fixed example months are not new routes. |

### Residential publishing — D; newer continuation screens I

`Address → property details → estimated share → photos/review → optional second/third property → Publish → poster verification if required → publication/management`.

Existing documented anchors: address `1662:22425`, details `1662:22507`, estimate `1662:22621`, review `1662:22713`, add2 `1662:22799`, add3 `1662:22917`, photos `1666:23384`, override `1666:23456`, draft `1666:23311`, verification `1662:23625`, pending `1662:23702`, manage `1662:23777`, remove `1662:23858`, removed `1662:23933`.

New continuation anchors: create `2015:34553`, details `2015:34615`, estimate `2015:34711`, preview `2015:34783`, photos `2015:34849`, verify `2015:34901`, pending `2015:34958`, manage `2015:35013`, remove `2015:35076`, removed `2015:35131`, verified/retry/published `2016:36512` / `36569` / `36629`, ready variants `2023:40399` / `40473`.

Rules from [residential implementation](ui-concepts/2026-09-15-residential-splitfinder-implementation.md): one to three independent searchable properties, draft preserved through verification, no up-front ID gate before composition, verified poster may publish directly, inquiry senders do not need ID verification, manual removal affects only the selected post. Exact-address visibility and the default rent-share denominator remain unresolved. Do not manufacture application/lease/deposit flows.

### Older create wizard — R, retained as reference

`1209:8066` selects creation type. The captured `1246:*` wizard covers living/working state, location, property search/details, dates, experience kind/details, membership source/details/access/rules, pricing, group, split, photos/error, audience, review, publish checks/error/success, manage, and save/resume draft.

This is a substantial older flow, not a mandate to put every one of its steps into the new simpler service-specific flow. In particular, older audience options do not override public residential-post rules. Two explicit accuracy/permission checks gate the older Publish action (`1246:10164`); missing checks return to its error state. New continuation accuracy/permission variants `2020:39117` / `39174` exist, but their exact logic remains unverified.

Membership import handoff is D/R at its entry: membership source → Bills selector `1246:10496` → select charge → membership confirmation `1246:9200`. Import another bill points to `1052:5012`; listing-originated import should return to the selector, while ordinary import returns to All bills.

## 7. Inbox, messaging, reporting, and blocking

### Existing captured inbox — R

| Inbox section | Destination | Child actions |
|---|---|---|
| Messages | `1209:7268` | Regular Apartment `1209:7904`, Family `1209:7958`, Direct `1209:8012`. |
| Splitfinder | `1209:7339` | Listing-related conversations; preserve listing identity. |
| Invites | `1209:7402` | Circle → `515:1456`; bill agreement → `1330:10437`; Trusted Spender → `1606:19083`. |

### October 2 conversation and safety screens — I/P

- Inbox `2017:36146` → conversation `2017:36210` → composer `2017:36280` → message sent `2017:36337`; failed send `2017:36400` should preserve the draft and allow a deduplicated retry.
- Organizer conversation `2017:36460` → reply `2017:36525`; empty `2017:36595`; options `2017:36648`.
- Removed listing conversation `2017:36733` should retain permissible message history, with no working action to join an inactive listing.
- Report reason `2017:36790` → details `2017:36878` → sent `2017:36934`.
- Block review `2017:36983` → blocked `2017:37040`; blocked people `2017:37093` → unblock `2017:37141` → result `2017:37191`.
- Message-options overlay closed/open/tap-catch `2060:43022` / `43035` / `43048` are overlay states, not three independent app pages.

**Needs verification/definition:** reporting evidence rules, block effects on requests and existing messages, post-unblock behavior, message deletion/retention, real delivery state, notification deep links, and which inbox presentation becomes canonical. Do not automatically report when a user only blocks unless the product explicitly asks for both.

## 8. Circles

### Existing Circle browsing and creation — R

`Circles Home 7:423 → Apartment 218:314 / Family 371:521 / Study 371:551`.

Other captured views: empty `427:662`, no attention `434:660`, no cards `463:750`; contributor-without-card-access `1611:22333` is I/D.

`+ → New Circle 335:506 → Add People overlay 488:1134 → compact/expanded selection states 488:1203 / 488:1272 → selected-people screen 542:1632` contains reusable overlay states and dismiss/tap-catch helpers (`488:1396`, `490:1331`, `490:1335`). **The captured New Circle and People Selected records have no create/submit reaction.** They only contain Back, Add People, and switches. Treat creation completion as unfinished in this captured legacy path; do not claim a working end-to-end create flow.

Circle invitation `515:1456` has Join and Decline actions that both navigate to `434:660`. That shared landing destination is a fixture, not evidence that accepted and declined membership states are persisted differently.

### October 2 Circle administration — I/P

| Actor / purpose | Proposed mapping using existing frames |
|---|---|
| Circle Host manages | Home `2019:38407` → admin `2019:38309` → members `2019:38472` / privacy `2019:39408`. |
| Invite person | Invite `2019:38539` → review `2019:38592` → pending `2019:38651`; cancel `2019:38713` → updated members `2020:39290`. |
| Recipient accepts/declines | Received `2020:40277` → accepted `2020:40334` or declined `2020:40381`; Circle with Alex `2020:40426` is an accepted-state candidate. |
| Remove member | Review `2019:38758` → removed `2019:38814` → updated members `2020:39231`. |
| Transfer Circle Host | Choose `2019:38862` → review `2019:38923` → pending `2019:38973` → recipient accepts `2019:39029` → complete `2019:39103`; declined `2019:39149`. Maya equivalents `2023:40101` / `40151` / `40207` / `40281`. |
| Host leaves | Host notice `2019:39195`; resolve a valid handover before leaving. Exact sole-member/archive handling is not verified. |
| Member leaves | Member Circle `2019:39253` → review `2019:39313` → left `2019:39363` → Circles after leave `2020:39350`. |

Recipient/current-host variants at `2028:*`, `2031:*`, and `2038:*` represent identities and post-handover views, not new powers. Circle Host transfer does not transfer card ownership, bill hosting, accepted contributions, or legal financial responsibility. Exact handover expiry/cancellation and linked-resource handling require checking before implementation.

## 9. Cards and spending roles

### Card home, detail, and creation

| Journey | Mapping | Evidence |
|---|---|---|
| Browse cards | `547:1625` → expanded Grocery `563:1705`, Family `570:1755`, Apartment `570:1824`, Trip `570:1893` → matching detail `573:1988`, `573:1920`, `573:2058`, `573:2126` | R; role guards/variables may alter entry. |
| Create shell | Details `854:3466` → appearance `928:4751` → attach Circle `854:3495` → review `855:3408` or no-Circle `861:3572` → Cards | R. Shell creation is not provider issuance or activation. |
| Host settings | Family `622:2591`, Apartment `622:2752` | R entry; many displayed settings do not have captured actions. |
| Host balance / funding | Balance `1151:5159`; Fund `1151:5189` → review `1151:5263` → pending `1151:5290` → originating card | R. Return depends on card-context variable. No settled balance increase implied. |
| Spender detail | Grocery/Trip detail → read-only permissions `1606:18320` / `1606:18392` | R entry; targets I/D. Hidden inherited Fund card reactions still exist in Grocery capture; they are not authorized spender actions. |
| Credential reveal | Show details changes display variables; Hide details reverses them | R. Production must reveal only the user's assigned credential through approved provider UI. |

### Trusted Spender lifecycle — D, inventory I

`Inbox card invitation 1606:19083 → review/accept → checks 1606:19164 → provider handoff 1606:19240 → pending 1606:19316 → approved assigned-card ready 1606:19397`.

These are documented lifecycle scenarios, **not a user-click path that grants approval**. Declined `1606:19473`, paused `1606:19536`, removed `1606:19612`, closed `1606:19688`, unsuccessful `1606:19764`, purchase declined `1606:19840`, setup saved `1959:32303`, unavailable `1963:33475` remain distinct.

Host administration: Trusted Spenders `1606:19916` → person `1606:19992` / pending `1606:20070`; invite picker `1606:20151` → grant review `1606:20227` / `20308` → invited `1606:20389` / `20452`. Existing spender → edit `1606:20515` → review limits `1606:20596` / `20677` / `1958:30558` → saved variants. Pause `1606:20884` → paused `1606:20960`; restore `1606:21028`; remove `1606:21104` → removed `1606:21180`. Family equivalents are under `1609:*` and `1958:30703` / `30783`.

Spender activity and records: Grocery `1606:18640` → purchase/refund `1606:18797` / `18878`; Trip `1606:18721` → `1606:18946` / `19015`. Host activity `1606:21248` and Family `1609:21900` have their own transaction/transfer records. Contact-host and help variants exist at `1606:21520` onward, `1963:33555`, `1970:31927` / `31977`.

Use the [role implementation manifest](ui-concepts/2026-09-14-role-specific-flows-implementation.md) for every named role variant. It reports prior validation, not verification performed in this audit.

## 10. Bills: collection, importing, and creation

### Collection and import

**R/D:** Bills home `714:2708` switches between **All bills (left)** and **Shared (right)**. September 20 reversed the earlier documented order. The current captured fixture shows the Shared collection content. A changed visual order does not establish a changed default selection.

- All bills retains confirmed imports and created bills, including personal/unshared items and connected/shared items.
- Shared is a connection filter, not proof that multiple people accepted an obligation. A Card-only connection can qualify without a Circle or other contributors.
- Overview / By week are summary states inside the selected collection. Month navigation changes summary context, not historical saved-bill retention.
- Bills rows open the matching Internet `714:2789`, Electric `714:2847`, Phone `714:2903`, Trip `714:2960`, or Groceries `714:3018` detail.
- “Next contribution” currently points to payment review `1348:10898` (R), not merely bill detail as an older UI_FLOW entry says.

**D intended import path:** `Import → choose/link own account → detected bills → choose bills → review → confirm save → All bills`.

**R entry only:** Import bills points to `1052:5012`, with selection flags reset. The parent Bill import section was not expanded before quota exhaustion, so the intermediate nodes, cancellation, provider errors, and success routes remain unverified.

**D sharing path:** All bills → Share bill → choose Circle/connection or continue without Circle → review connection → save → Shared. Captured attachment/review screens include `859:3441`, `861:3585`, `861:3598`. The existing bill retains identity and import history; saving a connection does not send financial agreements, enroll people, or move money.

The website's “Import → Choose → Review” animation is an explanation of this capability. It must not be mistaken for an implemented bank import, an approved provider connection, or the complete app consent flow.

### New shared bill — D, partially R

`Fixed/Flexible → identity → amount/maximum/estimate → schedule → people/Circle and exclusions → equal or custom proposal → funding Card or lightweight shell → review → send individual contribution agreements`.

Older + points to `1056:5016`; fixed/flexible previous steps are referenced by `1056:5260` / `1056:5394`. Their contents were not captured. Fixed Circle attachment/review `859:3441` / `861:3585` / `861:3598` and Flexible variants `881:3646` / `881:3751` were captured.

**Important gap:** the old review fixture returns to Bills and says no contributions are scheduled. Do not infer that it completes the fuller documented people/allocation/funding/invitation workflow. Keep “save a personal/imported bill,” “connect an existing bill,” and “send contribution agreements” as distinct use cases.

## 11. Bills: agreement, payment, changes, and ending

These families are reaction-audited **R**, with product semantics from the linked dated documents. Individual control and return targets are in the explorer.

| Journey | Main path | Side paths / meaning |
|---|---|---|
| Invitation acceptance | Inbox Invites → review `1330:10437` → manual `1330:10511` or automatic `1330:10587` → respective confirmation `1330:10657` / `10694` → bill `714:3018` | Accounts `1330:10825`; full terms `1330:10731` / `10778`; decline `1330:10860`; ask host `1330:10886` → sent `1330:10901`. Acceptance is not settlement. |
| Manual contribution | Review `1348:10898` → pending `1348:10951` → pending details `1348:11048`; return to bill | Received `1348:11099` is a separate settlement fixture, not a button the contributor uses to declare payment received. |
| Failure/reconnection | Attention `1375:11172` → unsuccessful `1375:11314` → reconnect `1375:11413` → provider handoff `1377:13092` → eligible account `1378:13204` → appropriate review/retry | Preserve independent transfer state; retry must not duplicate a debit. Message host `1377:13249` → sent `1378:13227`. |
| Contributor reviews change | Higher amount `1375:11493`, changed group `1375:11617`, or above maximum `1375:11740` → terms `1377:13017` → result `1377:13061` | Accept/decline must apply to a specific version. Old accepted terms are not silently replaced. |
| Host allocation proposal | Equal `1377:13124`, dollars `1408:12182`, percentages `1408:12188` → matching preview `1408:12194` / `12200` / `12206` → sent `1408:12212` → responses `1420:13562` | Larger-group and all-contributor review variants `1428:*`, `1430:*`, `1448:14903`; wait-for-Maya `1555:19881`. |
| Declined proposal resolution | Declined share `1462:15167` → message, revise, keep current share, withdraw changes, or review removal | Message `15426` → `15533`; current share `15895` → `16027`; withdrawal `16159` → `16278`; revision `16657` → `16397` → `16527` (all `1462:`). |
| Removal with changed allocation | Review removal `1462:15640`; redistribution `1464:16013` → plan proposed `1464:16139` → accepted plan `1480:16958` → confirm `1480:17153` → updated contributors `1480:17226` | Do not turn pending redistribution into immediate changed obligations. Other removal fixtures exist; apply the documented preconditions. |
| Everyone accepts / later cycle | `1480:16596` → scheduled shares `1480:16675` → updated October bill `1480:16885` | Scheduled does not mean collected or merchant-paid. Repeated decline `1480:17401` returns to resolution. |
| Manage own funding | Agreement `1480:17474` → account `1480:17547` → review `1480:17823` → updated `1480:18183` | Current selection `1489:17891`; new connection `1489:18043`; authorization details `1480:18329`. |
| Stop future contributions | Agreement → review `1480:17896` → stopped `1480:17969` | Cancel returns to agreement. Processing transfers and historical obligations remain separate. |
| Contribution history | `1480:18256`; pending-history variant `1490:18415`; October review `1489:18240` → pending `1489:18313` | Manual terms `1490:18336`; automatic bill `1490:18488`; ended-agreement bill `1489:18621`. |
| End a shared bill (Host) | Review `1525:18671` → ended `1525:18787` → history `1525:18886` | September/August/July bill-payment records `1528:18888` / `19006` / `19124`; contributor records `1528:19242` are separate. Ending does not cancel the merchant service or delete records. |

**Role-specific entry mapping (D/I):** Hosted bills `1608:20963`; contributing bills `1608:21025`; host Internet `1608:21094`; private contributor `1608:21166`; Grocery/Trip contributor `1608:21235` / `21307`; agreement/history/payment/stop variants `1608:21376` through `21767`; message host `1608:21829`; ended contributor bill `1608:21941`. Existing Bills home contains hidden hosted/contributing entry controls in the capture; therefore those controls are not proven discoverable in the currently visible state.

Sources: [agreement](ui-concepts/2026-09-10-contribution-agreement-flow.md), [payment](ui-concepts/2026-09-10-contribution-payment-flow.md), [recovery](ui-concepts/2026-09-11-bill-recovery-flow.md), [allocation](ui-concepts/2026-09-11-bill-allocation.md), [resolution](ui-concepts/2026-09-12-proposal-resolution.md), [follow-up](ui-concepts/2026-09-12-bill-followup-screens.md), [ending](ui-concepts/2026-09-13-ending-shared-bill.md).

## 12. Account, public profile, and support

### Older account surfaces — R

You `652:2589` opens account profile `669:2591`, banking/funding `669:2629`, login/security `669:2664`, personal details `669:2703`, friends `669:2734`, privacy `669:2768`, notifications `669:2798`, help `669:2834`, and logout confirmation overlay `669:2864`. Profile opens phone `700:2647` and email `700:2670`.

These are not all functional settings flows. For example, the captured Login & Security screen has only a Back reaction despite displaying password, passkeys, two-step verification, devices, and sign-out-everywhere rows. Phone also only has Back. Do not claim these settings are implemented or fully wired.

Public member profile `1540:19118` opens contribution track record `1540:19120` and member reviews `1540:19122`. The documents explicitly leave scoring, review eligibility, evidence, privacy, and appeals unresolved. Preserve the two distinct concepts; do not populate production reputation with the fixtures.

### New continuation candidates — I/P

Account `2017:37238` → edit `2017:37357` → profile `2017:37421`; help `2017:37484` → support listing `2017:37542` → sent `2017:37595`. Terms/privacy hub `2017:37642` links conceptually to terms `2020:39408` and privacy `2020:39460`; their document content and legal approval were not audited.

Deletion flow candidates: consequences `2017:37722` → confirm `2017:37791` → request received `2017:37840`; failure `2017:37862`. Account deletion cannot be assumed to erase retained financial/audit records or resolve open obligations. Actual deletion policy, pending-finance handling, and state transitions remain implementation/legal work.

## 13. Goals and excluded/later work

Goal prototypes are present and connected from the older create menu: details `793:3211`, time-based details `794:3257`, schedules `801:3363` / `812:3426` / `833:3346` / `833:3393`, attach Circle `812:3466`, attach Card `839:3372`, people `793:3256`, invite `801:3281`, target `801:3338`, contribution `801:3313`, review `793:3292`, goal detail `793:3345`, terms `793:3386`.

**R inventory/actions; release scope unresolved.** The old review's Create goal returns to Circles. Do not infer active collection, fund locking, a provider balance, or a completed goal engine. “Pledge” is provisional terminology in PRODUCT_CONTEXT; this audit does not rename it or merge it with Splitfinder requests.

Plus/Premium paywalls, upgrade prompts, subscription checkout, and the Premium Bills workspace remain excluded from current core implementation under AGENTS.md. Managed-minor spending flows, maps, saved-search notifications, shared shortlists, and provider-specific onboarding require their own approved scope.

## 14. Current Expo app versus designed app

Verified by reading current route files and preview state, not by running the app during this audit:

| Current route | What it does | Connection |
|---|---|---|
| `/` | Category welcome | Choose category → `/discover`; Change revisits with `?change=1`. |
| `/discover` | Local listing discovery, category/subtype/search/price controls | Listing → `/listing/[id]`; saved → `/saved`. |
| `/explore` | Alias | Redirects to `/discover`. |
| `/listing/[id]` | Sample detail and save action | Organizer → `/profile/[id]`; contact → `/inquiry/[id]`. |
| `/profile/[id]` | Sample organizer and listings | Selected listing → `/listing/[id]`; preserve origin. |
| `/saved` | Session saved listings | Selected listing → same detail route. |
| `/inbox` | Session Splitfinder inquiries | Selected inquiry → `/inquiry/[id]`; empty recovery → discovery. |
| `/inquiry/[id]` | Editable local draft and practice messages | Profile and listing links return to their same resource routes. |

State lives in `my-app/src/features/splitfinder/state.tsx` using local React state. It survives navigation but not a full reload. The code does not yet implement real accounts, publishing, identity verification, remote messaging, bank import, financial Circles/Cards/Bills, or settlement. Newer Figma screens are therefore not automatically on the phone.

## 15. Reconciliation decisions and unresolved work

| Priority | Finding | Smallest recommended resolution |
|---|---|---|
| Before wiring | Old tabs still open the mandatory Splitfinder introduction; newer approved entry is category → opportunities | Use the September 23/25 entry for discovery. Decide how first visit inside the full financial shell enters it. Preserve older screens as references. |
| Before wiring | October 2 continuation is not represented in the old living map | Verify all continuation reactions and make explicit canonical screen/state assignments before replacing older routes. |
| Before wiring | Authentication, Getting started, and Bill import nested sections were not inventoried | Expand these three sections and capture child screens/actions. The inventory count cannot be considered final until this is done. |
| Before wiring | Logos/generic icons and named-person examples are duplicated | Implement shared screen components with data/visual variants; retain all design references. Do not choose a logo policy from duplication alone. |
| Before wiring | Old Create Circle has no captured completion action | Confirm intended save/invite checkpoint and current continuation replacement; wire only after the actual destination/state is known. |
| Before wiring | Create menu has a parent-level New Bill action; older open variants use SWAP while other options use NAVIGATE | Click-test option hit areas and overlay dismissal. This is a risk observed in reactions, not a confirmed runtime click-through defect. |
| Before wiring | Older settings display many controls without reactions | Separate intentional display-only rows from unfinished actions; specify edit/save/error/cancel routes before making them look operational. |
| Before bills implementation | All/Shared order contradicts older docs | Apply dated All-left/Shared-right decision. Preserve scope semantics and independently confirm default selection. |
| Before bills implementation | Old review saves a bill/connection; docs describe sending agreements after allocation | Model these as separate operations and add/check the missing review-to-agreement path. |
| Before implementation | UI_FLOW next-contribution description differs from live reaction | Use captured payment-review destination as current prototype evidence; confirm intended product action for each contribution state. |
| Before launch | Full financial shell versus discovery-only navigation remains unsettled | Select release scope based on actual approved capabilities. Do not expose financial actions merely to match marketing previews. |
| Before housing launch | Public address precision, default share denominator, and ID operations remain unresolved | Resolve explicitly; keep approximate public location and honest estimates meanwhile. |
| Before requests launch | New introduction/request chain may differ from earlier sharing-rule declaration flow | Inspect new reactions and visible terms; preserve required explicit eligibility/declaration before submission. |
| Before social launch | Block/report/deletion and host-handover production semantics are not established by frame titles | Define server state, permissions, retention, invalidation, and return routes. |
| Before financial launch | Provider names and readiness vary across older docs | Treat all provider behavior as conditional. October 1 prefers Stripe where supported/approved; older Lithic wording is not current approval evidence. |

Six destination IDs referenced by captured reactions fall outside the captured inventory: `1052:5012`, `1056:5016`, `1056:5260`, `1056:5394`, `424:646`, `424:648`. The last two are CHANGE_TO targets, likely component states. These are **unresolved in this capture, not proven missing or broken**.

## 16. Implementation mapping and persistence boundaries

This is a proposed contract for the next planning step, not an approved schema or code change.

| Persistent concept | Flows that depend on it | Preserve / distinguish |
|---|---|---|
| Account and profile | Authentication, gate/resume, organizer identity, settings | Verified account status versus provider verification; return target; own editable versus public fields. |
| Listing and draft | Discovery, publishing, editing, removal | Author, category/service, independent property ID, explicit listing status, version, draft fields, photos, publication checks. |
| Request | Join/introduction review, organizer response, withdrawal | Requester, listing, pending/accepted/declined/withdrawn state, accepted rules version/timestamp where required. |
| Conversation/message | Inquiry, reply, failed send/retry, moderation | Participants, listing context, server-confirmed send state, client retry key, block/report policy. |
| Circle and invitation | Membership, host transfer, privacy | Accepted membership separate from invitation; host role independent of financial ownership. |
| Bill and occurrence | Import, All/Shared, monthly summary, history | Confirmed import versus detection suggestion; source references; connection versus contribution; full bill versus own share. |
| Agreement and proposal | Acceptance, change, stop, funding change | Versioned terms, actor consent, effective date, schedule, own funding source, caps and replacement rules. |
| Card and spending grant | Shell, issuer checks, assigned credential, controls | Shell versus issued/active card; host versus spender; permitted scope and provider source of truth. |
| Transfer/authorization/event | Funding, pending, received, failure, settlement | Idempotency, provider identifiers, immutable audit, independent financial states and reconciliation. |

Search filters, scroll position, open overlays, and current wizard step can be local navigation state. Drafts, saved listings, messages, invitations, consent, and financial records need durable persistence before those flows are described as functional. A backend should be introduced alongside the first real end-to-end journey, not after every screen has been wired to disposable fixtures.

## 17. Completion checklist for the remaining audit

1. Restore available Figma inspection access and capture the 546 inventory-only/document-referenced records, plus children of the three unexpanded sections. Check for any additional nested screen containers.
2. Read the October 2 review guide `2034:44493` and prototype notes; inspect current flow starting points and intended canonical variants.
3. Capture complete variables, bindings, component-state targets, visibility branches, and source-component references needed to evaluate conditions.
4. Trace every visible action, including back/cancel, save/resume, retry, stale links, notification/deep-link returns, and cross-flow pickers. Confirm no navigation accidentally changes resource identity or role.
5. Click through the main journeys with both actors where applicable: guest/member, requester/organizer, Circle Host/member, Card Host/Trusted Spender, Bill Host/contributor. Include declines, withdrawals, blocked users, pending verification, and removal.
6. Visually check phone-size viewports, scroll areas, keyboard states, long content, overlays, and disabled actions. Reactions alone do not establish usable layouts.
7. Reconcile canonical screens and open product decisions; only then mark the map implementation-ready and update old context prose without erasing historical decisions.

This task changed documentation and audit artifacts only. No Figma nodes, application behavior, database, provider configuration, or financial state were changed. Existing historical validation claims in dated documents remain historical; they are not tests run by this audit.
