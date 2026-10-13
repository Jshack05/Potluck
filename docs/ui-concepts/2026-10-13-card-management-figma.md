# Card management and Trusted Spenders — Figma handoff

Date: October 13, 2026. Status: editable Figma designs authored; application implementation remains pending.

## Delivered design

[Open Manage arrangement](https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2412-46435). The prototype starting point is **Card management and Trusted Spenders**.

| New composition              | Figma node   | Intended app location                    |
| ---------------------------- | ------------ | ---------------------------------------- |
| Manage arrangement           | `2412:46435` | Existing `/manage/cards/[id]` menu       |
| Change Circle                | `2412:46539` | Connection editor in the same route      |
| Close card                   | `2412:46632` | Confirmation in the same route           |
| Cards after last Card closes | `2417:47063` | `/cards`, reusing empty state `766:3012` |

Thirty-eight existing host-side role screens were refined in place for Apartment and Family Cards: people, active/pending permissions, person selection, invitation review/sent, editing limits, permission results, pause/restore and removal. Existing IDs and invitation-state logic are retained. No second invitation implementation was created.

The [machine-readable mapping](../flow-audit/2026-10-13-card-management-mapping.json) records sources, screen variants, entry points, prototype variables and verification evidence.

## Flow and reusable sources

Settings → Manage arrangement → Trusted Spenders → existing person or Invite trusted spender → person selection → review access → invitation sent → Trusted Spenders.

Existing-person branches reuse permission editing, pause, restore and remove flows. Invitation accepted, approval pending and active access remain distinct. Circle membership does not grant Card access.

People Back uses its recorded origin: management, settings or Card detail. Invite Back/Cancel and invitation completion return to People; review Back returns to person selection. The app still needs its approved navigation repair; Figma destinations must not be translated indiscriminately into router pushes.

The Circle editor starts with the saved choice. Cancel discards the draft. Save changes only that Card's example association and member summary. Apartment and Family selections remain independent. The personal choice uses the existing person icon. Circle creation remains separate: no competing creation screen or unverified return link was added.

Shared sources include the existing 88 px Card context, 104 px miniature variants, header/back, primary CTA, Cards navigation, Circle rows, role rows and icons. New action-row source `2411:48076` exposes icon, title and detail properties, using existing semantic variables. The screens use editable component instances, Inter typography and the existing 20 px icon inset.

**Close card** is the approved wording. Confirmation provides Keep card and Close card. The new outcome illustrates an eligible last-card closure with the existing No cards yet state. It is not a simulation of settlement, refunds or provider closure. Actual closure must remain server-confirmed and preserve eligibility, active-Bill restrictions, authorization, audit records and history.

## Verification and limits

- Composition screenshots reviewed for management, Circle selection, closure, key invitation/permission states, pause/removal, settings and Family identity.
- Read-only structural evaluation covered 42 screens and 52 referenced destinations, with no missing destinations.
- Twenty-four action-state checks passed for management entry, Card-specific navigation, Back origins, invitation returns, Cancel/reset, independent saved choices and closure destinations.
- No horizontal text overflow was detected in the 38 refined host-role content areas after wrapping corrections.
- These checks evaluated saved Figma reactions. They are **not** a live presentation click-through or affected-phone test.
- Long names, accessibility scaling, empty Circle choices, native gestures and asynchronous app errors remain acceptance work.
- No app code, API, migration or dependency changed. App tests/builds were not rerun for this design task. No commit, push or merge was performed.

## Deferred profile History

Joseph requested a section reached from profile/You showing past Circles, Cards and associated Card transactions. This is recorded in PRODUCT_CONTEXT.md only. No History screen, navigation item or app feature was added. A later approved design must define retained-record access without exposing other users' private activity.

## Product purpose and next phase

This serves the Card Host with a clear place to manage association, access and closure. It belongs to the core experience; essential access and safety are not paywalled. Existing invitations support acquisition, and reliable administration supports retention. Successful management completion and fewer abandoned return journeys are the primary measures. This does not reopen paid plans or financial launch scope.

The [approved app plan](../superpowers/plans/2026-10-13-intuitive-back-and-card-management.md) remains pending implementation against these exact Figma sources.
