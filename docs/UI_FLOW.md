# Potluck UI Flow

**Status:** Living product-flow source of truth
**Approved baseline:** August 10, 2026
**Last updated:** August 10, 2026

## Purpose and authority

This document records the approved structure, navigation, permissions, attention model, and shortest safe paths for Potluck's mobile interface. It is the starting point for future UI design, prototypes, implementation plans, and reviews.

The supplied PNGs are rough product maps and visual references. They do not define final colors, typography, spacing, iconography, or component styling. When a future PNG changes an approved flow, preserve the old PNG, add the new PNG as a dated version, and update this document with the approved change.

Financial consent, provider capability, security, and data-integrity rules in `AGENTS.md`, `PRODUCT_CONTEXT.md`, and `BILLS_CONTEXT.md` still apply. A shorter interface may combine review steps, but it must never remove required consent, provider approval, identity checks, or accurate status.

## Preserved visual references

- [`2026-08-10-potluck-screen-map-v1.png`](ui-flow/2026-08-10-potluck-screen-map-v1.png) — original multi-screen layout map
- [`2026-08-10-centered-navigation-reference.png`](ui-flow/2026-08-10-centered-navigation-reference.png) — reference for making the central destination visually primary
- [`2026-08-10-health-face-reference.png`](ui-flow/2026-08-10-health-face-reference.png) — rough reference for the simple health face

The bright green highlights, black background, connector lines, rough boxes, sample circles, and sample text in these images are demonstrative only. They are not approved production styling.

## Product model

Potluck has three primary user-facing assets:

1. **Circles** — reusable, consent-based groups of people and the main shared-attention surface.
2. **Cards** — host-controlled payment containers that may have individually approved Trusted Spenders.
3. **Bills** — one-time or recurring obligations with individually accepted contribution agreements.

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

The persistent bottom navigation order is:

```text
Cards     Circles     Bills
```

Circles is centered because it is Potluck's primary destination and people-first home surface. Cards and Bills are supporting destinations on either side. The exact visual treatment is not defined by the rough PNG, but the center placement and hierarchy are intentional.

### Entry behavior

- The default app entry is Circles.
- An invitation, notification, or status action may deep-link directly to the affected Circle, Card, Bill, agreement, or account screen.
- The bottom navigation remains available on the primary Cards, Circles, and Bills screens.
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
- When it has more than four people, show the first three profile pictures and replace the fourth bubble with `…`.
- The `…` bubble must have an accessible label that states the hidden count, such as `2 more people`.
- Keep the total people count in adjacent text; the bubbles are a quick identity cue, not the membership source of truth.

### Reusable Circle summary card

- Circle lists use one reusable `390 × 108` summary-card component.
- The Circle identity bubble is `48 × 48`, leaving a separate lower-left slot for member profiles.
- Circle name and concise membership/asset summary use stable positions beside the identity bubble.
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
- Simple health face and text status
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

## Three-level health-face system

Every active Circle, Card, and Bill has a simple, friendly health indicator.

| Face | Meaning | Use |
| --- | --- | --- |
| Green smile | **All good** | The asset is on track and has no unresolved visible issue. |
| Yellow slanted face | **Needs attention** | A non-urgent action, pending decision, incomplete setup, or emerging risk needs review. |
| Red frown | **Act now** | A serious or time-sensitive issue threatens access, funding, consent, or successful completion. |

### Visual requirements

- The face uses two dot eyes and one simple mouth curve or slant.
- Shape communicates the state in addition to color.
- Every face has adjacent or accessible status text.
- The production colors must use approved Potluck design tokens and meet contrast requirements; the reference PNG's green is not a final token.
- Loading or genuinely unknown status shows no health face until Potluck can determine an accurate state.
- Closed or intentionally archived assets use their explicit lifecycle label rather than a misleading red frown.

### Example triggers

**Bill**

- Green: current occurrence is on track or provider-confirmed paid with no unresolved action.
- Yellow: agreement review pending, setup incomplete, funding-source update needed before the risk window, or another non-urgent action exists.
- Red: required contribution failed near the deadline, a cap is exceeded, the Bill is underfunded, consent is missing at a critical point, or provider-reconciled payment status shows failure.

**Card**

- Green: active and able to support its expected approved use with no unresolved action.
- Yellow: setup is required, a Trusted Spender approval is pending, or a non-urgent control/funding issue needs review.
- Red: the Card is unexpectedly frozen or compromised, an imminent approved Bill cannot be supported, or another serious provider-reconciled problem requires immediate action.

**Circle**

- Green: no visible connected asset or Circle action needs attention.
- Yellow: an invitation, agreement, setup step, or other visible non-urgent action is pending.
- Red: at least one visible connected Card or Bill has an urgent issue.

### Roll-up and privacy rules

Severity order is:

```text
red > yellow > green
```

- A Bill's visible health rolls up to its funding Card and attached Circle.
- A Card's visible direct health rolls up to its attached Circle.
- Each asset displays the most serious unresolved issue the current viewer is authorized to see.
- Tapping the face opens the exact visible issue and shortest safe action, not a generic status page.
- The Circle Host may see full Circle-wide health subject to legitimate permissions.
- Other members see only health derived from assets, agreements, and issues they are permitted to access.
- Anonymous-Circle roll-up must not leak another member's identity, contribution state, private asset, or hidden problem.

The face is a summary, not a replacement for precise status. The detail view must still identify the affected occurrence or resource, reason, responsible actor, deadline, and safe next action.

## Screen-map analysis

The original PNG is a general layout map. It does not flow from left to right, and the green circles merely identify which destination is being demonstrated in each rough screen.

The depicted concepts are:

1. **You/profile screen** — general profile, settings, security, password, and related private account controls.
2. **Bill or transaction detail** — merchant identity, amount, provider merchant identifier, back navigation, and an association with the relevant Circle or Card.
3. **Lightweight Card creation** — begins with a Card name and remains intentionally short.
4. **Cards overview** — stacked Cards with strong visual identity and quick access.
5. **Circles overview/home** — group summaries, people, upcoming shared work, and attention items.
6. **Bills overview** — concise Bill rows with identity, related Circle, and health/readiness.
7. **Global creation menu** — New Card, New Circle, and New Bill.
8. **Centered-navigation reference** — demonstrates that the central destination is the main product surface; it is not a Potluck visual template.
9. **Circle people search/invitation** — username search, selected people, and add/invite action.
10. **Expanded Cards list** — Cards can show a relevant amount, connected people, controls, and health without becoming a dense dashboard.
11. **Circle detail** — responsive people and attached-asset view; selecting a Card or Bill opens the appropriate destination and detail screen.
12. **Bill type selection** — Fixed or Flexible starts the Bill flow.
13. **Card detail and permissions** — back navigation, Card presentation, Host information, protected credential reveal, recent activity, locking/controls, and role-aware access.

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
8. Keep all status explanations direct and specific, for example: `Internet bill is $24 short — Jordan's agreement is still pending.`

## Superseded directions and repository conflicts

This approved baseline supersedes these earlier UI/product directions:

- A four-tab `Home · Cards · Bills · Circles` shell. There is no separate Home tab; Circles is the centered shared-home surface.
- Treating Circles as only a presentation label around Card people. Circles are now primary, reusable, consent-based shared spaces, but they do not create financial ownership.
- Requiring every Bill contributor to be added to the funding Card first. Bill participation and Card access are separate.
- Using a generic person-on-Card relationship. The user-facing Card-access role is Trusted Spender; the backend and provider role remains authorized user or authorized spender.
- Treating the rough PNG's green active marks as production styling.

## Approved versus unresolved

### Approved

- Three primary assets: Circles, Cards, Bills
- Navigation order: Cards, centered Circles, Bills
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
- Permission-aware green/yellow/red health faces and severity roll-up
- Profile-picture stacks show all people up to four, then three pictures plus an ellipsis bubble
- One reusable `390 × 108` Circle summary card with a 48 px identity bubble and stable member-stack placement

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

### August 10, 2026 — Initial approved living flow

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
