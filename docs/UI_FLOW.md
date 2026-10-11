# Potluck UI Flow

> **October 7, 2026 workflow:** Read the [whole-file audit plan](superpowers/plans/2026-10-07-figma-screen-audit.md) and latest product decisions before UI work. Reuse verified existing Figma screens; distinguish missing designs from missing app implementation. The intended experience is the finished product, assuming program availability for design, while actual integration status remains separately documented. The older baseline and October 2 inventory below are historical evidence, not a complete current screen map.

> **October 2, 2026 audit:** See [APP_FLOW_MAP.md](APP_FLOW_MAP.md) for the newer screen inventory, captured prototype connections, app-code comparison, and conflicts with this older baseline. That audit is explicitly incomplete: Figma quota interrupted connection verification, and three nested sections still need inventory. Do not treat either document as proof that the entire app is wired or implemented.

**Status:** Living product-flow source of truth
**Approved baseline:** August 10, 2026
**Last updated:** September 13, 2026

## Purpose and authority

This document records the approved structure, navigation, permissions, attention model, and shortest safe paths for Potluck's mobile interface. It is the starting point for future UI design, prototypes, implementation plans, and reviews.

The supplied PNGs are rough product maps and visual references. They do not define final colors, typography, spacing, iconography, or component styling. When a future PNG changes an approved flow, preserve the old PNG, add the new PNG as a dated version, and update this document with the approved change.

Financial consent, provider capability, security, and data-integrity rules in `AGENTS.md`, `PRODUCT_CONTEXT.md`, and `BILLS_CONTEXT.md` still apply. A shorter interface may combine review steps, but it must never remove required consent, provider approval, identity checks, or accurate status.

## Preserved visual references

- [`2026-08-10-potluck-screen-map-v1.png`](ui-flow/2026-08-10-potluck-screen-map-v1.png) â€” original multi-screen layout map
- [`2026-08-10-centered-navigation-reference.png`](ui-flow/2026-08-10-centered-navigation-reference.png) â€” reference for making the central destination visually primary
- [`2026-08-10-health-face-reference.png`](ui-flow/2026-08-10-health-face-reference.png) â€” rough reference for the simple health face

The bright green highlights, black background, connector lines, rough boxes, sample circles, and sample text in these images are demonstrative only. They are not approved production styling.

## Product model

Potluck has three primary user-facing assets:

1. **Circles** â€” reusable, consent-based groups of people and the main shared-attention surface.
2. **Cards** â€” host-controlled payment containers that may have individually approved Trusted Spenders.
3. **Bills** â€” one-time or recurring obligations with individually accepted contribution agreements.

These assets are related but remain distinct:

- A person may be invited directly to a Bill without receiving Card access.
- A person may be invited directly to a Card as a Trusted Spender without becoming a Bill contributor.
- A Circle may be attached to a Bill as an invitation shortcut for the selected members.
- A Circle may be attached to a Card as an invitation shortcut for the selected members.
- The same person may be both a Bill contributor and a Trusted Spender, but accepting one role never grants the other.
- A Bill must select the Card that will fund it before the Bill is finalized. The Card is selected at the end of Bill creation.

### Relationship summary

| Action | Result | Does not imply |
| --- | --- | --- |
| Invite a person or Circle to a Bill | Included people receive individual contribution agreements | Card access, spending rights, or ownership |
| Invite a person or Circle to a Card | Included people receive individual Trusted Spender invitations | A contribution obligation or Bill participation |
| Add a Card or Bill to a Circle | The asset appears in that Circle subject to permissions and individual acceptance | Automatic enrollment of every current or future Circle member |
| Add a person to a Circle | The person receives a Circle invitation | Access to existing Cards, Bills, credentials, or financial details |

## Navigation and screen hierarchy

The September 13 [ending-a-shared-bill flow](ui-concepts/2026-09-13-ending-shared-bill.md) adds Host review → ended confirmation → retained bill history, with separate bill-payment and contributor records. The example has no pending transfers or unresolved funds. Ending in Potluck does not cancel external service or remove Circle/Card access. Prior general flow evidence is preserved at [before-bill-ending-v12](ui-flow/2026-09-13-before-bill-ending-v12.png).

The September 11 [bill recovery and contribution-change flow](ui-concepts/2026-09-11-bill-recovery-flow.md) adds contextual issue entry from Bills, failed-transfer review, secure reconnection handoff, eligible-account review, changed-share acceptance or decline, and host proposal preview with an optional reason. Prior visual reference preserved at [2026-09-11-before-bill-recovery-v11.png](ui-flow/2026-09-11-before-bill-recovery-v11.png). Prototype screens use a consistent 430 × 932 shell with scrolling content and stationary actions; real provider and consent state remains application work.

See [Splitfinder context](SPLITFINDER_CONTEXT.md) for the September 8 discovery and messaging extension. The prior flow image is preserved at [2026-09-08-before-splitfinder-v6.png](ui-flow/2026-09-08-before-splitfinder-v6.png); it is a historical snapshot, not an updated map.

The persistent bottom navigation order is:

```text
Circles     Cards     Bills     Splitfinder
```

Circles remains the default people-first home and now sits at the far left. Cards, Bills, and Splitfinder follow. Splitfinder is a separate discovery destination connected to the three existing assets. This September 8 decision supersedes the prior centered three-tab layout.

### Entry behavior

- The first Splitfinder visit opens its introductory landing page. Continue opens the category explanation screen; Explore Splitfinder there records completion and opens listings. Later visits open listings directly.
- Inbox sits next to You. Messages, Splitfinder inquiries, and Invites are separate sections. Messaging a listing host opens an inquiry without creating membership or financial consent.
- The default app entry is Circles.
- An invitation, notification, or status action may deep-link directly to the affected Circle, Card, Bill, agreement, or account screen.
- The bottom navigation remains available on the primary Circles, Cards, Bills, and Splitfinder screens.
- Detail and creation screens may use a back action while retaining the user's place.

### Global creation

A persistent `+` action offers:

- New Card
- New Circle
- New Bill

Creation is context-aware. When the user begins from a Circle, Potluck carries that Circle into the new Card or Bill flow automatically. The user can change the selection before sending invitations.

### Profile and private attention

The top-right **You** bubble opens personal profile and account areas such as:

- General profile
- Settings
- Security and password
- Personal funding sources
- Private identity or provider requirements
- Help and sign-out

A small red exclamation marker on the You bubble means the user's private account needs attention. It is reserved for actionable identity, security, funding-source, or account issues. It is not used for ordinary activity, marketing, or shared Circle updates. The marker must have an accessible name such as `Account needs attention`; color alone is not sufficient.

## Circles as the shared home

Circles replaces the need for a separate Home tab. The main Circles screen combines a concise shared-attention surface with the user's Circle list.

It may show:

- `Needs attention` items involving shared Cards, Bills, invitations, or agreements
- Circle invitations
- Bill contribution invitations and changed agreements
- Trusted Spender invitations
- Important shared notifications and recent updates
- The user's Circles
- A direct path into the affected Circle, Card, Bill, or agreement

This is not a finance dashboard. People, group identity, shared purpose, readiness, and next actions appear before balances or charts.

### Profile-picture stacks

- A Circle, Card, or Bill summary that shows its people displays up to four profile-picture bubbles.
- When the asset has four or fewer people, show each person's profile picture.
- When it has more than four people, show visible people plus a `+x` bubble for hidden members; do not use an ellipsis bubble in current UI.
- The `+x` bubble must have an accessible label that states the hidden count, such as `4 more people`.
- Keep the total people count in adjacent text; the bubbles are a quick identity cue, not the membership source of truth.
- Current visual rules, including avatar-to-metadata spacing, live in `docs/DESIGN_GUIDELINES.md`.

### Reusable Circle summary card

- Circle lists use one reusable `390 Ã— 108` summary-card component.
- The Circle identity bubble is `48 Ã— 48`, leaving a separate lower-left slot for member profiles.
- The Circle name uses a `20 px` title treatment beside the identity bubble and sits slightly lower than the original compact-card layout.
- The member stack occupies the lower left. The `14 px` people/shared-item summary keeps a `20 px` gap after the final visible member bubble; when fewer than four bubbles are visible, the summary shifts left rather than preserving an empty four-bubble slot.
- Long Circle names or summaries truncate rather than changing the component height or colliding with the health face.
- The health face stays in the upper-right position on every Circle card.
- The member stack follows the profile-picture rules above and remains in the same lower-left position regardless of member count.
- The entire card is the navigation target; do not add redundant labels such as `Open`.
- Content changes must not alter the card's height or list rhythm.

## Circle behavior and permissions

### Membership

- A Circle is a mutually joined group, not a private contact label.
- Every person must accept a Circle invitation before becoming a member.
- Joining a Circle does not add the person to any existing Card or Bill.
- Later Circle membership changes never propagate automatically to connected Cards or Bills.
- A newly joined person may appear as `Not yet added` beside eligible Cards or Bills with a direct invitation action.

### Circle Host

Each Circle has one primary **Circle Host**. The Circle Host controls:

- Removing members
- The Circle's anonymous/private-membership mode
- Circle-level administrative settings
- Adding Cards or Bills when the Circle is anonymous

Circle Host status does not make that person the Host of every Card or Bill in the Circle. Each Card and Bill retains its own Host.

### Normal Circles

In a non-anonymous Circle:

- Accepted members can see the Circle's members and shared assets they are permitted to view.
- Any accepted member may attach a Card or Bill that they host.
- Attaching an asset prepares individual invitations; it does not enroll everyone automatically.
- Members accept or reject their own Bill agreement or Trusted Spender invitation.

### Anonymous Circles

In an anonymous Circle:

- Members can see the Circle and Circle Host.
- Members cannot see one another's identities, profiles, contributions, or attached assets.
- Only the Circle Host may attach Cards or Bills.
- Each invited member sees only their own Bill terms or Trusted Spender invitation.
- Status and notifications must not reveal the existence or nature of another member's hidden issue.

### Attachment-specific exclusions

When attaching a Circle to a Card or Bill, the Host can exclude one or more members before sending invitations. An exclusion affects only that attachment. It does not remove the person from the Circle or change their access to other assets.

Example: excluding Maya when attaching `Apartment Gang` to the Walmart Card leaves Maya in `Apartment Gang`; she simply does not receive a Trusted Spender invitation for that Card.

## Card behavior

### Card creation

The shortest safe Card flow is:

1. Enter a Card name.
2. Choose a visual color or design and optionally add a description.
3. Optionally select a Circle or individual people.
4. Exclude any selected Circle members who should not receive Card access.
5. Review the people who will receive Trusted Spender invitations.
6. Create the Card shell and send invitations when explicitly confirmed.
7. Complete required Card settings and provider prerequisites before activation.

Creating a Card shell does not silently activate a provider card, choose a shortfall policy, issue credentials, send invitations, or move money.

### Trusted Spender terminology

**Trusted Spender** is the approved user-facing term for the backend authorized-user or authorized-spender role.

Recommended interface language:

- `Invite trusted spender`
- `Card access pending`
- `Can spend`
- `Remove card access`

A Trusted Spender:

- Must receive an individual invitation.
- Must complete any issuer-required identity, eligibility, consent, or approval steps.
- Receives a unique credential through an approved provider flow.
- Has no ownership of the Host's account or funds.
- Receives only the Card access, limits, controls, available-to-spend information, and activity permitted by the approved program.
- Never receives the Host's credential or another person's credential.

### Card list and detail

The Cards index shows Cards in a scannable list or stack. Each item should prioritize:

- Card name and visual identity
- Card name and visual identity without a generic good-standing health face
- Available-to-spend or relevant readiness information when accurate
- Connected Bills or Trusted Spenders only when useful for the next action

Card detail is the management surface for Card setup, funding/readiness, Bills funded by the Card, Trusted Spenders, controls, and activity. Host-only controls and credential visibility must be enforced server-side. A Trusted Spender must never see Host-only credentials, private funding details, or another person's credential.

## Bill behavior

### Bill creation with Card selection last

The shortest safe Bill flow is:

1. Choose `New Bill`.
2. Choose Fixed or Flexible.
3. Enter Bill identity and optional merchant information.
4. Enter amount or maximum/estimate, frequency, expected date, and first occurrence as applicable.
5. Select a Circle or individual people and apply attachment-specific exclusions.
6. Potluck calculates an equal split by default.
7. The Bill Host confirms the calculation or proposes changes.
8. Select the existing Card that will fund the Bill, or create a lightweight Card shell inline if none exists.
9. Review the complete Bill, Card, included people, amounts/formulas, schedule, funding timing, and effective date.
10. Send individual contribution agreements.

Inline Card creation must return the Host to the Bill without losing entered information. Selecting a funding Card does not add Bill contributors as Trusted Spenders.

### Agreement acceptance

September 10 payment follow-through: Bills next contribution → review one-time payment → pending → contribution details. The received example remains separate until settlement. [Payment screen IDs and reusable artwork](ui-concepts/2026-09-10-contribution-payment-flow.md).

September 10 Figma implementation: Inbox → Invites → Review your share → Choose how you’ll contribute → Your contribution is set up. Supporting states cover manual/automatic terms, connected-account choice, decline, and an illustrative host question. Headings remain standardized across bills. See [screen IDs and validation](ui-concepts/2026-09-10-contribution-agreement-flow.md). The earlier map is preserved as `docs/ui-flow/2026-09-10-before-contribution-agreement-v9.png`.

- Each included person receives their own exact contribution agreement.
- Sending an agreement does not activate it.
- A person must accept the amount or calculation method, schedule, funding source, effective date, and maximum or variable rule where applicable.
- A new invitee contributes `$0` until their agreement is accepted.
- Potluck never silently redistributes a missing or unaccepted share.

### Adding someone to an existing Bill

For a new Circle member or another eligible person:

1. The Host selects `Invite to bill` from the Circle or Bill context.
2. Potluck calculates the revised split.
3. The Bill Host reviews and may adjust the proposed shares.
4. The Host confirms and sends new individual agreements to affected members.
5. Existing accepted agreements remain in force until replaced, canceled, revoked, or expired.
6. The new person's contribution remains `$0` until accepted.
7. Any uncovered amount appears as an explicit Bill gap and follows the approved shortfall rules.

The host-side invitation can begin with one tap, but any change to financial terms still requires a compact review and confirmation.

## Status and standing indicators

Potluck uses different status treatments for Circles, Cards, and Bills.

### Circles

Circle health faces summarize Circle readiness/status only.

| Face | Meaning | Use |
| --- | --- | --- |
| Green smile | **All good** | The Circle has no unresolved visible issue. |
| Yellow slanted face | **Needs attention** | A non-urgent Circle, invitation, agreement, setup, or visible connected-asset action needs review. |
| Red frown | **Act now** | A serious or time-sensitive visible issue threatens access, funding, consent, or successful completion. |

Rules:

- Health/smiley faces are reserved for Circle readiness/status.
- Every face has adjacent or accessible status text.
- Shape communicates the state in addition to color.
- The production colors must use approved Potluck design tokens and meet contrast requirements.
- Loading or genuinely unknown status shows no health face until Potluck can determine an accurate state.

### Bills

Bills communicate standing through the bill amount color instead of a smiley face.

```text
good / normal = current deep green
warning / unpaid past threshold = yellow
serious issue / declined charge / substantial nonpayment = red
```

Rules:

- Apply the standing color to both the dollar sign and the numeric amount.
- Yellow covers warning states such as someone not paying past a defined threshold.
- Red covers serious states such as a declined charge or substantial nonpayment when payment should already have happened.
- Exact timing thresholds that move a Bill from green to yellow to red remain a product/design decision until explicitly specified.

### Cards

Cards do not have a generic “good standing” health-face pattern. Cards are simply cards unless a separate card-specific action or state is explicitly designed.
## Screen-map analysis

The original PNG is a general layout map. It does not flow from left to right, and the green circles merely identify which destination is being demonstrated in each rough screen.

The depicted concepts are:

1. **You/profile screen** â€” general profile, settings, security, password, and related private account controls.
2. **Bill or transaction detail** â€” merchant identity, amount, provider merchant identifier, back navigation, and an association with the relevant Circle or Card.
3. **Lightweight Card creation** â€” begins with a Card name and remains intentionally short.
4. **Cards overview** â€” stacked Cards with strong visual identity and quick access.
5. **Circles overview/home** â€” group summaries, people, upcoming shared work, and attention items.
6. **Bills overview** â€” concise Bill rows with identity, related Circle, and health/readiness.
7. **Global creation menu** â€” New Card, New Circle, and New Bill.
8. **Centered-navigation reference** â€” demonstrates that the central destination is the main product surface; it is not a Potluck visual template.
9. **Circle people search/invitation** â€” username search, selected people, and add/invite action.
10. **Expanded Cards list** â€” Cards can show a relevant amount, connected people, controls, and health without becoming a dense dashboard.
11. **Circle detail** â€” responsive people and attached-asset view; selecting a Card or Bill opens the appropriate destination and detail screen.
12. **Bill type selection** â€” Fixed or Flexible starts the Bill flow.
13. **Card detail and permissions** â€” back navigation, Card presentation, Host information, protected credential reveal, recent activity, locking/controls, and role-aware access.

Exact final layouts, copy, information density, icon shapes, active-tab styling, and responsive behavior remain design work. The approved requirements are the relationships, permissions, navigation hierarchy, health model, and shortest safe flows described here.

## Product and marketability gate

- **Target user:** Friends, roommates, families, couples, and stable informal groups coordinating repeated shared expenses.
- **User-facing promise:** Keep the people, Cards, and Bills you share in one place and know at a glance whether everything is okay.
- **Acquisition:** Circle, Bill, and Trusted Spender invitations bring real participants into an active arrangement.
- **Plan placement:** The three-asset navigation, consent, accurate health states, invitations, and essential alerts belong to the ungated core.
- **Conversion:** Future paid value may add scale, automation, advanced controls, analytics, history, and administration; it must not gate consent, accurate status, essential alerts, disputes, or access to existing arrangements.
- **Retention:** Recurring Bills, reusable Circles, accepted agreements, and visible readiness reduce repeated coordination every cycle.
- **Differentiation:** Potluck coordinates accepted group terms, funding readiness, host-controlled payment, and role-specific Card access rather than acting as only a bill tracker, reimbursement ledger, or generic card product.
- **Primary metric:** Recurring Bill occurrences completed as intended without manual Host follow-up.

## UX recommendations

1. Keep the central Circles surface concise: shared attention first, Circle list second, and no unrelated dashboard widgets.
2. Carry Circle context into New Bill and New Card so users do not select the same group twice.
3. Preserve entered Bill data when inline Card creation is required at the final step.
4. Use `Invite to bill` and `Invite trusted spender` rather than a vague `Add person` action.
5. Let Hosts exclude people inline instead of forcing duplicate Circles.
6. Use a compact confirmation when Potluck recalculates a split; do not hide the change behind a one-tap action.
7. Reserve badges, the You-bubble exclamation, and yellow/red faces for actionable information.
8. Keep all status explanations direct and specific, for example: `Internet bill is $24 short â€” Jordan's agreement is still pending.`

## Superseded directions and repository conflicts

This approved baseline supersedes these earlier UI/product directions:

- A four-tab `Home Â· Cards Â· Bills Â· Circles` shell. There is no separate Home tab; Circles is the default shared-home surface. The new four-tab navigation adds Splitfinder, not Home.
- Treating Circles as only a presentation label around Card people. Circles are now primary, reusable, consent-based shared spaces, but they do not create financial ownership.
- Requiring every Bill contributor to be added to the funding Card first. Bill participation and Card access are separate.
- Using a generic person-on-Card relationship. The user-facing Card-access role is Trusted Spender; the backend and provider role remains authorized user or authorized spender.
- Treating the rough PNG's green active marks as production styling.

## Approved versus unresolved

### Approved

- Three primary assets: Circles, Cards, Bills
- Navigation order: Circles, Cards, Bills, Splitfinder; Circles is leftmost and remains the default
- Circles as the default shared-home surface
- You bubble for private account and security attention
- Circle membership requires acceptance
- One Circle Host; normal and anonymous Circle behavior
- Non-anonymous members may attach assets they host
- Attachment-specific exclusions
- No automatic propagation when Circle membership changes
- Independent Bill contributor and Trusted Spender roles
- Trusted Spender as user-facing terminology
- Equal split as the default Bill calculation with Host review
- Card selection last in Bill creation, with inline Card creation when needed
- Previous agreements remain active until validly replaced or ended
- Circle-only green/yellow/red health faces; Bills use amount color for standing and Cards do not have generic good-standing status
- Profile-picture stacks show visible people and use a centered `+x` bubble for hidden members
- One reusable `390 Ã— 108` Circle summary card with a 48 px identity bubble and stable member-stack placement
- Current visual design rules are recorded in `docs/DESIGN_GUIDELINES.md`

### Not yet approved or provider-dependent

- Exact production SVG geometry, animation, colors, and dimensions for the health faces
- Exact timing thresholds that move a yellow state to red
- Final Card-detail visibility for Trusted Spenders beyond the approved minimum
- Issuer and sponsor-bank support for the intended Trusted Spender model
- Whether later app launches always return to Circles or restore the last non-detail destination
- Circle Host transfer, succession, and recovery behavior
- Final user-facing choice between `agreement`, `terms`, and `contract`
- Detailed notification preferences and delivery channels

## Updating this document

When a new flow PNG is supplied:

1. Save it under `docs/ui-flow/` with an ISO date and descriptive versioned filename.
2. Do not overwrite or delete earlier flow PNGs.
3. Add the image to **Preserved visual references**.
4. Record what the new image changes, confirms, or leaves unclear.
5. Ask about any product, permission, consent, or navigation ambiguity one question at a time.
6. Update the approved sections only after the user confirms the change.
7. Add a dated change-log entry.
8. Reconcile `PRODUCT_CONTEXT.md`, `BILLS_CONTEXT.md`, and other affected source documents.

## Change log

### September 8, 2026 - Splitfinder listing creation

- New listing -> Spaces, Experiences, or Memberships -> category details -> price -> group size -> split summary -> required photo -> audience -> review -> publication confirmations -> listing management.
- Spaces branches into Living / Working and secured place / planned search. Homes keep exact addresses private and show neighborhoods; workspaces show business addresses. Experiences collect destination, venue, dates, inclusions, and practical requirements. Memberships collect provider, access, eligibility, and renewal terms.
- Imported membership -> Bills selection -> existing charge or Import bills -> membership confirmation -> remaining setup. Ordinary import still returns to All bills; listing-originated import returns to the selection screen. Both require a selected charge.
- Save and exit -> saved draft -> resume the same step. Missing photos and unchecked publication confirmations route to correction states. Publishing does not join people, create a Circle, or start contributions.
- Added 33 screens with reusable body components and a shared labeled field. All retain the shared 430 x 932 viewport and bottom-navigation position. See [Splitfinder context](SPLITFINDER_CONTEXT.md#september-8-2026---listing-creation) for fields, node IDs, and design limitations.
- Preserved [the prior visual map](ui-flow/2026-09-08-before-listing-creation-v7.png) before this update. This is a historical snapshot; the listing extension is specified here and in Figma.
- Validation: 46 routing/state cases passed; destination and placement checks passed. Form data are populated Figma examples, not runtime input or persistence.

### September 5, 2026 - Bill people contributions

- All five Bill Detail screens use a larger reusable people panel with contribution amounts and explicit payment-status labels. Three-, four-, and five-person layouts share reusable person tiles.
- Person tile -> selected person's contribution details -> Back to the originating Bill. Detail includes paid / agreed amount, payment date, recurring schedule where applicable, accepted date, Circle join date, and membership duration.
- Monthly, weekly, and one-time progress are labeled by the relevant period. Paid is settled money, not merely a scheduled or pending transfer. Figma fixtures demonstrate Paid, Not paid, and Overdue; production must also distinguish partial payments and unsuccessful or unaccepted agreements.
- Bill content scrolls below the fixed header and above bottom navigation, keeping the larger panel and attached Circle/Card accessible. The prior general flow map was preserved as `docs/ui-flow/2026-09-05-before-bill-people-v5.png`.

### September 5, 2026 - Card balances and funding

- Card previews and details lead with Available to spend and separately show Reserved for bills. Tapping a detail card opens the reconciled balance and bill-reserve breakdown.
- Fund card -> select own connected account and amount -> review one-time transfer -> confirm -> pending -> return to the originating Card. Review Back preserves choices; leaving before confirmation does not change balances.
- Current Figma amount choices are $25, $50, $100, and $250. Live amount entry, eligibility validation, provider errors, and transfer submission remain application implementation work. No real debit is initiated by these design interactions.
- Confirmation does not increase available or reserved balances. General Card funding becomes spendable only after settlement; Bill-specific contributions stay earmarked. Host covers may use eligible unreserved funds, never another Bill's reserve.
- New reusable funding sources and summary rows live in 02 Components; the four flow screens live in 03 Screens. The historical general map was preserved as `docs/ui-flow/2026-09-05-before-card-funding-v4.png`; this entry specifies the added flow.

### September 9, 2026 - Bills Overview and By week

- Shared remains the first/default collection tab, with All bills second. These primary tabs sit above the smaller Overview / By week tabs in a fixed-height summary.
- Overview shows the selected month's personal contribution estimate and next contribution. By week shows the selected collection's weekly breakdown. Collection changes update both summary views without filtering historical items out of the saved list.
- Month arrows demonstrate August–October 2026. The next contribution opens its existing bill detail; Back returns to the collection and summary state. Import completion still opens All bills.
- The existing bottom navigation, import action, create button, sharing actions, and bill-detail links are preserved. The Figma data are fixtures, not a financial calculation engine; see `BILLS_CONTEXT.md`.
- Preserved the prior general map as [2026-09-09-before-bills-summary-v8.png](ui-flow/2026-09-09-before-bills-summary-v8.png). Current screen evidence: [Overview](ui-concepts/2026-09-09-bills-overview-figma-v1.png), [By week](ui-concepts/2026-09-09-bills-by-week-figma-v1.png).

### September 5, 2026 - All bills and Shared

- Bills now uses All bills and Shared tabs with a Potluck-green active underline. All bills retains the complete saved collection across import dates; Shared filters for Circle or funding-Card connections.
- Import -> choose account -> review detected bills -> confirm -> Save to All bills. Sharing is optional after saving.
- All bills -> Share bill -> choose a Circle or continue without one -> review connection -> Save sharing -> Shared. The bill remains in All bills. A Card-only connection has no Circle badge.
- Circle choices carry the chosen identity into review and the saved row. Saving a connection does not activate contributions or enroll members.
- Import bills sits at the bottom left, beside the persistent create (+) button at the bottom right. Cards, Circles, and Bills use the same create button and menu. Tabs and the scrolling bill list begin directly below the page header.
- Preserved the prior general screen-map PNG as `docs/ui-flow/2026-09-05-before-bills-library-v2.png`. This is a historical snapshot; the new Bills flow is specified here and in the Figma Bills screen.

### August 10, 2026 â€” Initial approved living flow

- Preserved the original multi-screen map and two supporting visual references.
- Established Cards, Circles, and Bills as the three primary assets.
- Centered Circles as the people-first shared-home surface.
- Separated Bill contributors from Card Trusted Spenders.
- Defined Circle Host, normal Circle, anonymous Circle, exclusions, and non-propagating membership.
- Put Card selection at the end of Bill creation.
- Defined Host-reviewed recalculation and agreement replacement behavior.
- Added the permission-aware three-level health-face system.
- Added the four-bubble profile-picture stack rule.
- Standardized Circle summaries on one compact reusable card component.

### August 12, 2026 â€” Circles visual design rules

- Consolidated current visual-design and Figma QA guidance into `docs/DESIGN_GUIDELINES.md`; superseded `docs/CIRCLES_DESIGN_RULES.md` and the separate Figma QA checklist.
- Updated the Circle summary metadata rule: metadata now keeps a `20 px` gap after the final visible member bubble, including one-, two-, and three-person rows, instead of always starting after a fixed four-avatar slot.
