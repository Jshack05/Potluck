# Bills flow restoration

The approved October 6–7 recovery implements the original Figma flows in the existing Expo app. It is Free/core organization for hosts and contributors: save personal bills, propose shared terms, and see what comes next. Invitations support acquisition; recurring review supports retention. Paid conversion is deferred. This adds no provider, bank confirmation, payment execution or spending right.

## Source mapping

Figma file: `1hAy3kcZAEvqq8ZNjKU7CD`. Design context and screenshots were inspected before implementation. Original SVG assets are saved under `my-app/assets/potluck/bill`, with source node provenance in `sources.json`.

| Figma source                                                                                                      | App implementation                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `714:2708` Bills home; `1303:11718` summary                                                                       | `bills.tsx`, `bill-summary.tsx`: All bills left, Shared right/default, Import at bottom left and shared create menu                                      |
| `1056:5016`, schedule variants `5260`, `5337`, `5394`, `5474`; `859:3441`; `861:3585`, `3598`; `881:3646`, `3751` | `create/bill.tsx`: identity, schedule/calendar, people, allocation, Card, review                                                                         |
| `1052:5012`–`5015`                                                                                                | `import-bills.tsx`: source and account entry; real detection is unavailable, so results/confirmation are not fabricated                                  |
| `1330:10437`, `10511`, `10587`, `10657`, `10694`, `10825`, `10886`                                                | `agreement/[id].tsx`: review, manual/auto choice, acceptance, funding boundary, host-contact boundary                                                    |
| `1348:10898`, `10951`, `11048`, `11099`                                                                           | `bill/[id]/payment.tsx`: real terms and funding setup boundary; no simulated pending or settled payment                                                  |
| `714:2789`; `1480:17474`, `17547`, `17896`, `18256`, `18329`; `1525:18671`, `18787`, `18886`                      | Bill detail/manage/history, full terms, stop authorization, end review and persisted ended result                                                        |
| `1375`/`1377` recovery families                                                                                   | `bill-attention.tsx`, `bill/[id]/recovery.tsx`: offered/revised terms, accepted cap exceedance and host-visible declined terms derived from real records |

## Behavior and boundaries

- Private self-only Bills with no agreement history skip allocation. Forward goes from people to Card; Back returns to people. Old private drafts saved at allocation resume at Card. Their full amount and Flexible maximum derive from the Bill, so stale custom split/cap entries cannot block a private save.
- Private creation saves `planningOnly` without contribution offers. Bills with any prior agreement retain the allocation and renewed-consent flow. Drafts preserve explicit null Circle/Card choices. Failed validation permits editing; uncertain requests keep the immutable idempotent retry snapshot.
- Direct people selection uses the authenticated, block-aware `/people` endpoint. Circle membership never implies contribution acceptance. Bill icons/colors persist independently of financial status styling.
- `/bill-summary` keeps accepted `totalMinor`/`occurrences` separate from `planningTotalMinor`/`planningOccurrences`. Personal occurrences require the current actor to own a draft with no agreement history. Shared includes only connected Bills; All includes disconnected personal Bills. Dates follow the saved one-time, weekly or monthly schedule; Flexible values are identified as estimates. Proposed and ended Bills are excluded from personal totals, preventing double counting when consent is later accepted.
- A personal-only summary displays Personal plans. Mixed summaries separately show agreed shares and personal plans, including weekly totals. Personal next links open Bill detail; accepted shares open contribution review. No summary initiates a transfer or implies debit authorization.
- The import source explicitly says bank import is not connected in this build. Account suggestions, automatic contribution activation, actual bank transfers and settlement outcomes remain unavailable until implemented against an approved provider.

## Validation

Focused regression coverage includes private forward/back navigation, shared/prior-agreement allocation retention, draft migration and explicit detach restoration, full-cent allocations through the existing domain model, pending-request replay, actor-scoped attention, and UTC calendar boundaries.

`tests/integration/bill-planning-summary.test.ts` exercises the real API for account isolation, authentication, scoped connected plans, one-time/weekly/month-end schedules, Flexible estimates, conversion from private plan to offered then accepted terms, and ending. Accepted shares remain zero until acceptance; personal totals exclude the converted Bill afterward.

October 7 focused run: 13/13 tests passed across Bill flow, creation retry, planning summary, optional banking and arrangement lifecycle. Root and mobile TypeScript checks passed. The root integration task performs the final phone-width browser walkthrough, full repository validation and export. Its browser check already verified saving an unbanked personal Internet Bill and returning to All bills; summary/navigation refinements require the refreshed API and app.

No new dependency or migration is required for the summary/read-path refinement. The wider restoration uses the root-owned forward Bill metadata migration. Rollback retains Bills, agreements and audit history; no financial records are deleted.
