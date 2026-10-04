# Role-specific Figma implementation — September 14, 2026

Approved plan: [role-specific flows plan](2026-09-14-role-specific-flows-plan.md).

## Delivered
- 90 role-flow frames plus a contributor-without-card-access Circle variant, built from existing follow-up screen shells, action components, neutral information cards, and a reusable detail-row component.
- 68 reusable role-content components on 02 Components, plus a shared detail-row source and two spender-specific card variants. Text remains native/editable.
- Grocery and Trip card detail now omit Fund card, shared Freeze, Edit card, attached bills and bill reserves. Their menus open read-only spending permissions; balance taps show spender-safe explanations.
- Grocery and Trip activity previews show assigned-card activity rather than general card deposits.
- Grocery and Trip lodging bill details are contributor views without funding-card previews. Host labels added to Internet, Electric and Phone plan; Internet links to existing proposal/ending flows.
- Bills home provides hosted/contributing entry links. Existing contribution-agreement and history flows remain in use.
- Family and Apartment have distinct host-management destinations, with prototype variables for Taylor's limit and paused/removed state.
- Inbox has a separate Trusted Spender invitation entry. Card approval and interrupted-access states are separate prototype scenarios.
- Previous settings and bill-detail layouts are preserved as reference frames, not used as new role-entry destinations.
- Existing mixed-role home remains a mixed-role fixture: a user may host some cards and spend on others. Separate review entries demonstrate spender-only and contributor-only cases.

## Validation
- Screen inventory and visible-text checks on current Grocery/Trip card details, spender settings, contributor bill details, and contributor Circle variant.
- Rendered: spender permissions, Grocery card, Grocery contributor detail, Bills home, contributor Circle, invitation, host permissions and Inbox.
- Checked 670 destination references at the initial full graph pass: no missing destination nodes. Checked new screen action bounds and content width: no overflow reported.
- Subsequent targeted changes added guarded Grocery access routes and corrected the limit selector/restore view.
- Final verification checked 679 destination references across 90 role-flow frames: no missing targets. Visible-content checks found no forbidden host actions/reserves in the checked spender screens and no card balances/credential actions in the checked contributor views.
- No application tests or provider calls: this change affects Figma and documentation only.

## Prototype limitations
- Provider verification is a labeled preview handoff; it does not collect identity details or grant real access.
- Invitation delivery, transaction history, funding sources, payment submission and message sending are illustrative prototype data/actions.
- Permission hiding and role-specific navigation in Figma are specifications, not runtime security enforcement.
- Managed-minor onboarding and provider-specific credential/verification forms remain outside this approved adult-spender design.
- Prototype inputs offer selected example values; they are not a full freeform application form implementation.
- Some outcomes are standalone review scenarios rather than a simulated provider lifecycle. Existing unrelated host-card controls are not completed by this role-flow task.

## Review entry
[Open role review in Figma](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=1611-21935)

## Frame manifest
- gp: 1606:18320
- tp: 1606:18392
- gb: 1606:18478
- tb: 1606:18559
- ga: 1606:18640
- ta: 1606:18721
- gr: 1606:18797
- grefund: 1606:18878
- tr: 1606:18946
- travel: 1606:19015
- invite: 1606:19083
- checks: 1606:19164
- handoff: 1606:19240
- pending: 1606:19316
- ready: 1606:19397
- declined: 1606:19473
- paused: 1606:19536
- removed: 1606:19612
- closed: 1606:19688
- unsuccessful: 1606:19764
- decline: 1606:19840
- hostPeople: 1606:19916
- hostPerson: 1606:19992
- hostPending: 1606:20070
- pick: 1606:20151
- grant: 1606:20227
- grantJordan: 1606:20308
- invited: 1606:20389
- invitedJordan: 1606:20452
- editGrant: 1606:20515
- grant150: 1606:20596
- grant250: 1606:20677
- saved150: 1606:20758
- saved250: 1606:20821
- pauseReview: 1606:20884
- pauseDone: 1606:20960
- restoreReview: 1606:21028
- removeReview: 1606:21104
- removeDone: 1606:21180
- ha: 1606:21248
- hr: 1606:21316
- hdeposit: 1606:21384
- ht: 1606:21452
- msgG: 1606:21520
- msgT: 1606:21578
- msgSentG: 1606:21636
- msgSentT: 1606:21694
- help: 1606:21752
- bHosted: 1608:20963
- bContrib: 1608:21025
- bInternet: 1608:21094
- bPrivate: 1608:21166
- bGrocery: 1608:21235
- bTrip: 1608:21307
- gAgreement: 1608:21376
- gHistory: 1608:21441
- gPay: 1608:21500
- gPending: 1608:21569
- gStop: 1608:21635
- gStopped: 1608:21701
- tHistory: 1608:21767
- msgBillT: 1608:21829
- billMessageSent: 1608:21885
- bEnded: 1608:21941
- index: 1611:21935
- spenderCards: 1611:22006
- contributorCards: 1611:22072
- states: 1611:22131
- circleMember: 1611:22333

### Family host variants
- hostPeople: 1609:21358
- hostPerson: 1609:21389
- hostPending: 1609:21422
- pick: 1609:21456
- grant: 1609:21487
- grantJordan: 1609:21521
- invited: 1609:21555
- invitedJordan: 1609:21579
- editGrant: 1609:21603
- grant150: 1609:21637
- grant250: 1609:21671
- saved150: 1609:21705
- saved250: 1609:21729
- pauseReview: 1609:21753
- pauseDone: 1609:21784
- restoreReview: 1609:21811
- removeReview: 1609:21842
- removeDone: 1609:21873
- ha: 1609:21900
- hr: 1609:21927
- hdeposit: 1609:21954
- ht: 1609:21981
