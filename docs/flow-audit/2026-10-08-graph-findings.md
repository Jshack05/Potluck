# October 8 graph and product-decision audit

Read alongside [the complete family assignment](2026-10-08-flow-families.json) and [captured connection map](2026-10-08-connection-map.json). This pass assigns all **809** captured phone/screen states to **25** human flow families and reviews reaction references against approved product decisions. It changes no application or original Figma content.

**Scope:** graph/document review, not a live prototype test or visual sign-off. The 8,553 transition references include 4,511 conditional references and 56 references on controls hidden at capture. They are not 8,553 independent user actions. Variables and ordered actions remain in the original capture. Zero unresolved variable IDs means reference resolution succeeded; it does not mean all branches are feasible or all variable behavior is correct.

## Decision authority

1. [AGENTS.md](../../AGENTS.md) and independent consent/permission rules remain mandatory.
2. The explicit [October 7 product decisions](../PRODUCT_CONTEXT.md) control current combined-app behavior: authenticate first; banking is optional for organizing Circles, Card setups, manual Bills and Goal plans. Contextual activation/import/funding still requires appropriate provider evidence. This supersedes the earlier October 5 Cards/Bills gate and blanket bank prerequisite.
3. October 4 reopened full-app integration. September 20 discovery-only implementation scope cannot be treated as the present whole-app boundary. October 7 finished-product design does not authorize fabricated runtime financial success or reopen paid plans.
4. [Bills context](../BILLS_CONTEXT.md), [Splitfinder context](../SPLITFINDER_CONTEXT.md), and dated flow records determine semantics. Where old prose conflicts, identify explicit supersession rather than treating the entire document as equally current.
5. Captured wiring shows what a prototype currently points to. A higher node ID, recent copy or an interconnected continuation section is not sufficient evidence of canonical approval.

## Actionable graph findings

### GF-01 — Original email sign-in bypasses its password design

**High prototype-flow gap.** [Sign in 940:4770](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=940-4770) contains email entry. Its visible control `940:4805` (Email continue CTA) navigates straight to `7:423` (Circles / Home). The password screen `942:4800` exists and has recovery/continue actions; it is not the email-continue destination. Google and Apple controls also jump to the home fixture without representing their handoff. This is evidence of prototype shortcut wiring, **not** proof that application authentication is bypassed. Preserve the frames and nominate email → password and provider → external handoff as intended connections; verify with the chosen authentication implementation before separately authorized rewiring.

### GF-02 — Original four-category entry leads to back-only preference screens

**High prototype-flow gap.** [Entry 1784:24235](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1784-24235) has four captured category actions to Plans `1833:24398`, Memberships `1833:24458`, Subscriptions `1833:24517` and Spaces `1833:24613`. Each destination has **only one captured transition: Back** to the original picker. Their provider/membership/service/location choices and Explore actions have no captured destinations. The September 23 decision calls for one category choice followed by opportunities, with no separate mandatory broad preference gate. The continuation entry `2015:33052` does point to substantive category views, making it a useful connection reference; this does not by itself make its entire guest-entry generation canonical. Do not recreate missing discovery designs: their references already exist.

### GF-03 — Splitfinder has incompatible entry and return paths

**Medium navigation reconciliation.** The original shell `7:423` uses the `VariableID:1207:6491` first-visit branch to `1209:6717` or `1209:6796`. Welcome → `1224:8773` → Browse Spaces still teaches three categories, unlike the approved four-category entry. In the continuation, `2015:33052` selects phone plans, memberships, subscriptions or housing, but many shared Splitfinder-tab actions return to subscription-brand fixtures `2015:33137` / `2028:42734`; this occurs in the phone-plan screen `2018:37345`. Reconcile first-use, later-use and category-preserving returns as separate decisions. A generic graph cannot determine whether a fixed fixture destination is intended production navigation.

### GF-04 — Account/bank policy is stale in secondary documents

**High implementation-risk documentation conflict.** [SPLITFINDER_CONTEXT.md](../SPLITFINDER_CONTEXT.md), lines 3–5, still says account **and bank connection** precede all full-app destinations. [PRODUCT_CONTEXT.md](../PRODUCT_CONTEXT.md), lines 25–43, explicitly supersedes that: sign in, organize first, connect banking when useful. [BILLS_CONTEXT.md](../BILLS_CONTEXT.md), lines 13–19, permits unconnected manual Bills. The older [UI_FLOW.md](../UI_FLOW.md) requirement to choose a funding Card before every Bill is finalized must also yield to that explicit personal-draft exception. Preserve history but mark superseded statements at their point of use before using them as requirements. The continuation account gates `2014:32810` / `2025:40401` belong to an older contextual-registration generation and cannot establish current permission to browse the combined app as a guest.

### GF-05 — Request acceptance correctly stops at conversation; names can misidentify actors

**Verified consent boundary plus medium traceability issue.** The requester outcome `2012:32453` says the conversation is open and joining is separate. The host review `2012:32825` explicitly says acceptance does not add Alex to a Circle or reserve a spot, and its Accept action `2012:32873` opens `2012:33060`; that screen's Message Alex action `2012:33092` opens `2017:36460`. Phone and membership accepted outcomes `2020:39792` / `2020:40110` likewise lead to conversations. Circle acceptance remains a distinct `2020:40277` → `2020:40334` path. **No automatic-membership defect is established by these inspected paths.**

Several frame names are stale relative to captured content: `2012:32825 / Meet Joseph` currently says Meet Alex; `2012:32902 / Meet Alex` currently shows Jordan's withdrawn request; `2017:36460 / Joseph Shackelford` shows Alex Rivera; `2017:37421 / Joseph Shackelford` is Alex's public profile. Searchable annotations should include both immutable ID/current node name and visible persona. Do not infer the actor from the node name alone or rename product nodes as part of this audit.

### GF-06 — Older welcome makes a blanket identity-verification claim

**Medium product-copy conflict.** `1209:6717` says “Explore listings from identity-verified people.” Current residential policy requires **posters** to verify at Publish and allows inquiries without discovery ID verification; it does not establish universal verification for all membership, phone-plan or subscription organizers. See [residential decisions](../SPLITFINDER_CONTEXT.md#residential-rental-discovery--september-15-2026). Treat this introductory copy as superseded/unreconciled. No verification provider or cross-category assurance can be inferred from the prototype.

### GF-07 — Goal success/reference handling needs explicit separation from current planning

**Medium intent/integration gap.** Goal review `793:3292` describes proposed monthly charges and individual acceptance, but its final action `793:3342` returns to Circle home `7:423`. Goal detail `793:3345` and terms `793:3386` have no captured incoming edges. This identifies a missing captured continuation from creation to a saved Goal view; it does not prove the screens are absent or authorize real proposals/charges. [October 6 restoration](../ui-concepts/2026-10-06-card-goal-flow-restoration.md) explicitly maps the existing detail/terms and limits app persistence to host-owned planning drafts. October 7 places eventual Goals with Bills/Circles and defers relocation. Keep intended finished-design behavior, currently implemented planning behavior and navigation gaps separate.

### GF-08 — Newer designs do not settle all policy or visual alternatives

**Open canonical decisions.** Preserve logo and generic-icon variants, monthly calendar fixtures, three/twelve-contributor examples and role-specific variants. The large review guide `2034:44493` was verified to exist by the parent capture, but [its content review is still incomplete](2026-10-08-reference-boards.json). It cannot yet supply authority for choosing one continuation generation. Branding permission, housing estimate denominator, exact-address visibility, mandatory move-in-date rule, verification operations and reputation scoring remain open in the product records. No graph property resolves those choices.

## Checks that avoid false positives

- **Received payment is deliberately disconnected.** `1348:11099` has no incoming edge because [the payment decision](../ui-concepts/2026-09-10-contribution-payment-flow.md) expressly forbids automatic progression from pending to Received. Review `1348:10898` → Pending `1348:10951` → Pending details `1348:11048` is captured. Settlement belongs to provider events.
- **Role variants are intentional.** [Role implementation](../ui-concepts/2026-09-14-role-specific-flows-implementation.md) documents Grocery/Trip as spender views, Family/Apartment as host views, the mixed-role collection, a contributor-without-card-access Circle, and standalone provider outcome scenarios. Earlier role layouts are preserved references. No blanket deduplication or automatic linking is justified.
- **A custom service's category chooser is not necessarily redundant.** The generic create-custom action at `2016:35940` points to `2016:36112` (Choose once), then `2016:36046` preserves the selected category with an optional Change category action. The known-subscription picker `2093:43925` goes directly to `2016:36046` on Add your own service. This graph distinguishes generic unknown-category entry from known-category entry; no repeated mandatory category selection was established on this inspected path. Variable execution must still be tested.
- **Overlay states are not duplicate screens.** Closed/open/tap-catch/closing states use OVERLAY, SWAP and CLOSE. Component targets `424:646` and `424:648` are resolved toggle variants, not broken screen links.
- **Loading states are asynchronous fixtures.** The six `2182:*` / `2187:*` loading states have no incoming edges. This does not invalidate the October 7 under/over-500-ms contract; these reactions do not execute a request or timer. Older Splitfinder loading/error fixtures need that contract applied in runtime without using unresolved data as empty or zero.
- **Bill-ending scope is a clear-to-end fixture.** [Ending flow](../ui-concepts/2026-09-13-ending-shared-bill.md) expressly assumes no pending transfers or unresolved funds. The existing success/history path cannot be reused as evidence that all settlement edge cases have been designed or implemented.

## Connectivity measurements and limits

- 65 screens have no captured incoming transition; all remain in the JSON with family, identity, status and uncertainty.
- Only two screens have zero captured outgoing references: `1782:24235` and `1816:24418`. Both are explicit artwork/minimal reference alternatives. This does **not** mean all other screens have working primary actions: GF-02 has Back actions but lacks forward actions.
- A conservative traversal from `7:423` reaches 330 screens; from `2015:33052`, 612; from `940:4770`, 335; from review index `1611:21935`, 330. These counts follow every possible conditional branch and target. They are **not user-test completion counts** and do not prove that remaining nodes are bugs.
- Recorded transition types: 8,145 NAVIGATE, 47 OVERLAY, 24 SWAP, 288 CLOSE, 10 CHANGE_TO and 39 BACK. Explicit BACK/CLOSE actions need origin/overlay-stack context, while many other visually labeled Back actions use fixed fixture destinations.
- Two destinations outside the 809-screen inventory are known component variants; unresolved variable references: zero. The captured map is not a production authorization/state-machine proof.

## Validation and remaining work

The companion JSON preserves all 809 IDs, each assigned exactly once, plus curated entry/exit/reference IDs and selected observed edge examples. It records a SHA-256 of the ordered edge array so regenerated edge indices cannot silently be treated as the same graph; the initial whole-map hash is retained as provenance. Exact observed cross-family boundaries, hidden/conditional counts, source-component IDs, screen status and uncertainty are retained.

Not validated by this pass: readable visual review of all states, live variable execution, branch feasibility, prototype back-stack behavior, full component-interaction coverage beyond captured inventories, exact per-screen app route/role mapping, provider behavior, or canonical choices requiring founder evidence. Preserve original frames and use these findings as review notes. App or prototype repair is a separate authorized implementation task.

## Human flow directory

Entry and exit IDs are curated reference points, not a promise that every listed pair is directly wired. Exact observed boundaries are in the JSON; every screen remains assigned once.

| Family | Screens | Entry references | Exit or outcome references |
| --- | ---: | --- | --- |
| Shared creation and people overlays | 9 | [199:266](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=199-266), [199:317](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=199-317), [488:1134](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=488-1134), [488:1203](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=488-1203) | [335:506](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=335-506), [854:3466](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=854-3466), [1056:5016](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1056-5016), [793:3211](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=793-3211) |
| Authentication and recovery | 31 | [940:4770](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=940-4770), [941:4785](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=941-4785), [2014:32810](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-32810), [2025:40401](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2025-40401) | [7:423](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=7-423), [999:4999](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=999-4999), [2014:33169](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-33169) |
| Account settings and public profiles | 24 | [652:2589](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=652-2589), [1540:19118](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1540-19118), [2017:37238](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37238) | [669:2864](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=669-2864), [2017:37421](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37421) |
| Circle organization, invitations and administration | 55 | [7:423](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=7-423), [335:506](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=335-506), [515:1456](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=515-1456), [2019:38407](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2019-38407), [2020:40277](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-40277) | [218:314](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=218-314), [2020:40334](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-40334), [2020:40381](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-40381), [2019:39363](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2019-39363), [2038:42969](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2038-42969) |
| Card collection, detail and settings | 14 | [547:1625](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=547-1625), [573:1920](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=573-1920), [573:1988](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=573-1988) | [622:2591](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=622-2591), [1606:18320](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-18320), [1606:19916](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-19916) |
| Card setup creation | 5 | [854:3466](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=854-3466) | [855:3408](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=855-3408), [861:3572](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=861-3572), [547:1625](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=547-1625) |
| Spender invitations, permissions and card-access states | 83 | [1611:21935](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1611-21935), [1606:19083](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-19083), [1606:19916](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-19916), [1609:21358](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1609-21358) | [1606:19397](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-19397), [1959:32303](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1959-32303), [1606:19473](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-19473), [1606:19612](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1606-19612) |
| Card balance and funding | 4 | [1151:5159](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1151-5159), [1151:5189](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1151-5189) | [1151:5290](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1151-5290) |
| Goal planning and proposed terms | 15 | [793:3211](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=793-3211), [794:3257](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=794-3257) | [793:3292](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=793-3292), [793:3345](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=793-3345), [793:3386](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=793-3386) |
| Bill collection and role-specific details | 24 | [714:2708](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=714-2708), [1608:20963](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-20963), [1608:21025](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-21025) | [714:2789](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=714-2789), [714:3018](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=714-3018), [1608:21376](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-21376) |
| Bill creation, import and connection | 16 | [1052:5012](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1052-5012), [1056:5016](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1056-5016), [1056:5137](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1056-5137) | [1052:5015](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1052-5015), [861:3585](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=861-3585), [861:3598](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=861-3598), [881:3751](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=881-3751) |
| Contributor agreement review and acceptance | 11 | [1330:10437](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1330-10437) | [1330:10657](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1330-10657), [1330:10694](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1330-10694), [1330:10860](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1330-10860), [1330:10901](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1330-10901) |
| Bill payment, changed-share review and recovery | 16 | [1348:10898](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1348-10898), [1375:11172](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1375-11172), [1375:11493](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1375-11493) | [1348:11048](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1348-11048), [1348:11099](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1348-11099), [1377:13061](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1377-13061), [1378:13227](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1378-13227) |
| Host allocation, proposals and declined-share resolution | 33 | [1377:13124](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1377-13124), [1420:13562](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1420-13562), [1462:15167](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1462-15167) | [1408:12212](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1408-12212), [1462:15768](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1462-15768), [1462:16027](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1462-16027), [1462:16278](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1462-16278), [1462:16527](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1462-16527) |
| Agreement management, future contribution cancellation and Bill ending | 32 | [1480:16596](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1480-16596), [1480:17474](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1480-17474), [1525:18671](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1525-18671) | [1480:17969](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1480-17969), [1480:18183](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1480-18183), [1525:18787](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1525-18787), [1525:18886](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1525-18886) |
| Splitfinder introduction and category entry | 8 | [1784:24235](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1784-24235), [2015:33052](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-33052) | [2018:37345](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-37345), [2015:35390](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-35390), [2015:33137](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-33137), [2015:34313](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-34313) |
| Splitfinder browsing, search, filters and saved opportunities | 65 | [1209:6796](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-6796), [1720:22982](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1720-22982), [2015:33137](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-33137), [2018:37345](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-37345) | [2015:33669](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-33669), [2018:37606](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-37606), [2018:38362](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-38362), [2015:34488](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-34488) |
| Listing detail, eligibility and sharing rules | 27 | [1894:25470](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1894-25470), [2015:33669](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-33669), [2018:37606](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-37606), [2018:38362](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-38362) | [2012:31975](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-31975), [2018:37784](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-37784), [2018:38467](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-38467) |
| Listing drafting, publication and management | 144 | [1209:8066](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-8066), [2016:35940](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-35940), [2015:33815](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-33815), [2093:43925](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2093-43925) | [2016:35167](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-35167), [2016:35292](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-35292), [2016:35892](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-35892), [2016:36407](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-36407), [2018:38210](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-38210) |
| Residential discovery, inquiries and property posting | 44 | [1662:23381](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1662-23381), [1662:22425](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1662-22425), [2015:34313](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-34313), [2015:34553](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-34553) | [1662:23546](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1662-23546), [2015:35245](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-35245), [2016:36629](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-36629), [1662:23933](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1662-23933) |
| Listing requests, acceptance, withdrawal and outcomes | 79 | [2012:31975](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-31975), [2012:32640](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-32640), [2012:32825](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-32825), [2018:37784](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-37784), [2018:38467](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-38467) | [2012:33060](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-33060), [2012:32453](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-32453), [2012:32407](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-32407), [2012:33014](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-33014), [2020:39792](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-39792), [2020:40110](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-40110) |
| Inbox, direct/Circle/listing conversations and message actions | 35 | [1209:7268](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-7268), [1209:7339](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-7339), [1209:7402](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-7402), [2017:36146](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36146) | [2017:36337](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36337), [2017:36400](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36400), [2020:39905](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-39905), [2020:40222](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-40222) |
| Reporting, blocking, support and account closure | 21 | [2017:36648](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36648), [2017:36790](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36790), [2017:37484](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37484), [2017:37722](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37722) | [2017:36934](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36934), [2017:37040](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37040), [2017:37191](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37191), [2017:37595](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37595), [2017:37840](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37840), [2017:37862](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37862) |
| Initial and delayed loading states | 8 | [2182:44978](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2182-44978), [2182:45048](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2182-45048), [2182:45109](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2182-45109) | [2187:46411](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2187-46411), [2187:46453](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2187-46453), [2187:46495](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2187-46495) |
| Explicitly preserved visual/reference alternatives | 6 | [1782:24235](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1782-24235), [1816:24418](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1816-24418) |  |

## No-incoming states retained for review

These are candidates for external outcomes, direct review starts, references or missing wiring, not a defect list. The two pure references, loading states and Received outcome have explicit explanations above. Other states remain unresolved until the actual starting points, guide and lifecycle are checked.

### Authentication and recovery

- [2014:32923](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-32923) — Continuation / signupError / Check your email
- [2014:33012](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-33012) — Continuation / passwordError / Try your password again
- [2014:33111](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-33111) — Continuation / emailExpired / That link has expired
- [2014:33233](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-33233) — Continuation / authOffline / Let’s try that again
- [2014:33306](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-33306) — Continuation / newPassword / Choose a new password
- [2014:33351](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2014-33351) — Continuation / resetExpired / Use a fresh reset link

### Account settings and public profiles

- [2015:33755](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-33755) — Continuation / profile / Existing design reference

### Circle organization, invitations and administration

- [427:662](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=427-662) — Circles / Empty
- [463:750](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=463-750) — Circle Detail / No Cards
- [2019:39103](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2019-39103) — Continuation / handoverComplete / Jordan is now Circle Host
- [2020:40277](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-40277) — Continuation / circleInviteReceived / You’re invited
- [2023:40281](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2023-40281) — Continuation / handoverMayaComplete / Maya is now Circle Host
- [2028:46711](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2028-46711) — Continuation / handoverMayaDeclined / Handover declined

### Card collection, detail and settings

- [622:2671](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=622-2671) — Card Settings / Grocery
- [622:2832](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=622-2832) — Card Settings / Trip

### Goal planning and proposed terms

- [793:3345](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=793-3345) — Goal / Road trip fund
- [793:3386](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=793-3386) — Goal / Contribution terms
- [801:3338](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=801-3338) — Goal / Target amount

### Bill collection and role-specific details

- [1608:21235](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-21235) — Role / bGrocery / Bill details
- [1608:21307](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-21307) — Role / bTrip / Bill details
- [1608:21941](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-21941) — Role / bEnded / Bill ended

### Bill payment, changed-share review and recovery

- [1348:11099](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1348-11099) — Bill payment / Received

### Host allocation, proposals and declined-share resolution

- [1377:13177](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1377-13177) — Bill host / Proposal preview

### Agreement management, future contribution cancellation and Bill ending

- [1480:17401](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1480-17401) — Bill / Follow-up / Revision declined again

### Splitfinder browsing, search, filters and saved opportunities

- [1720:23481](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1720-23481) — Splitfinder / Spaces / No results / Approved image
- [1720:25297](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1720-25297) — Splitfinder / Experiences / No results / Approved image
- [1720:25837](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1720-25837) — Splitfinder / Memberships / No results / Approved image
- [2015:35307](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-35307) — Continuation / noResults / Existing design reference
- [2015:35546](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-35546) — Continuation / membershipEmpty / Existing design reference
- [2015:35629](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-35629) — Continuation / saved / Existing design reference

### Listing drafting, publication and management

- [1209:8132](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-8132) — Splitfinder / Create Spaces
- [1209:8194](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-8194) — Splitfinder / Create Experiences
- [1209:8256](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1209-8256) — Splitfinder / Create Memberships
- [2015:34200](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-34200) — Continuation / time / Existing design reference
- [2015:34281](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2015-34281) — Continuation / timezone / Existing design reference
- [2016:35236](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-35236) — Continuation / publishError / Your draft is safe
- [2028:43467](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2028-43467) — Continuation / Generic icons / published
- [2028:43536](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2028-43536) — Continuation / Generic icons / publishError

### Residential discovery, inquiries and property posting

- [2016:36512](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-36512) — Continuation / housingVerified / You’re ready to publish
- [2016:36569](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2016-36569) — Continuation / housingRetry / A little more is needed

### Listing requests, acceptance, withdrawal and outcomes

- [2012:32453](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-32453) — Continuation / accepted / Maya wants to connect
- [2012:32527](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-32527) — Continuation / declined / Keep looking
- [2012:32581](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2012-32581) — Continuation / unavailable / This spot is unavailable
- [2020:39792](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-39792) — Continuation / phoneAccepted / Jordan is ready to talk
- [2020:40110](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2020-40110) — Continuation / membershipAccepted / Casey is ready to connect
- [2028:42440](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2028-42440) — Continuation / Generic icons / accepted
- [2028:42508](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2028-42508) — Continuation / Generic icons / declined
- [2028:42562](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2028-42562) — Continuation / Generic icons / unavailable

### Inbox, direct/Circle/listing conversations and message actions

- [2017:36595](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36595) — Continuation / inboxEmpty / Your next hello starts here

### Reporting, blocking, support and account closure

- [2017:36733](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-36733) — Continuation / conversationRemoved / Maya Chen
- [2017:37862](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2017-37862) — Continuation / deleteError / Your account hasn’t been deleted

### Initial and delayed loading states

- [2018:38629](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-38629) — Continuation / discoveryLoading / Finding opportunities
- [2018:38676](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2018-38676) — Continuation / discoveryError / We couldn’t load listings
- [2182:44978](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2182-44978) — Loading / Circles / Initial (under 500 ms)
- [2182:45048](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2182-45048) — Loading / Cards / Initial (under 500 ms)
- [2182:45109](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2182-45109) — Loading / Bills / Initial (under 500 ms)
- [2187:46411](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2187-46411) — Loading / Circles / Delayed (500 ms+)
- [2187:46453](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2187-46453) — Loading / Cards / Delayed (500 ms+)
- [2187:46495](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2187-46495) — Loading / Bills / Delayed (500 ms+)

### Explicitly preserved visual/reference alternatives

- [1608:22114](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-22114) — Reference before role update / Card Settings / Grocery
- [1608:22136](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-22136) — Reference before role update / Card Settings / Trip
- [1608:22158](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-22158) — Reference before role update / Bill Detail / Groceries
- [1608:22185](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1608-22185) — Reference before role update / Bill Detail / Trip lodging
- [1782:24235](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1782-24235) — Reference / Approved onboarding artwork — overlap retained
- [1816:24418](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1816-24418) — Potluck / Onboarding / Minimal reference

Structural checks passed on October 8: exact 809-ID equality/uniqueness, 25-family partition, every curated reference, incoming/outgoing edge-index source/destination, observed examples, source snapshot hash, no-incoming/no-outgoing counts, and local Markdown links. These are audit-artifact checks, not application tests.
