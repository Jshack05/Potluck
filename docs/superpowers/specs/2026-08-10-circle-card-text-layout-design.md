# Circle Card Text Layout Refinement

**Date:** August 10, 2026  
**Status:** Approved design; awaiting written-spec review

## Purpose

Improve the reusable Circle Card's reading order and use its lower row more efficiently without changing the approved compact component size.

## Approved layout

- Keep the reusable Circle Card exactly `390 × 108`.
- Keep the Circle identity bubble at `48 × 48` on the upper left.
- Keep the health face fixed at the upper right.
- Move the Circle name down approximately `5 px` from its current position and increase it from `18 px` to `20 px`.
- Move the people/shared-item summary to the lower row and increase it from `13 px` to `14 px`.
- Keep the profile-picture stack at the lower left.
- Place the summary immediately to the right of the fourth profile bubble, with enough separation that the text never looks attached to the bubble.
- Use the same geometry for every Circle Card instance; content must not change card height or list rhythm.

The component therefore has two clear reading rows:

1. Circle identity and name.
2. Member profiles followed by the people/shared-item summary.

## Member-stack behavior

- Four or fewer people show up to four profile pictures.
- Five or more people show the first three profile pictures and an ellipsis in the fourth bubble.
- The summary always begins after the fixed four-bubble slot, even when fewer than four bubbles are visible. This keeps metadata aligned across the Circle list.
- The ellipsis retains an accessible hidden-count label such as `2 more people`.

## Application

- Update the main Figma component `Circle Card / State=Default`.
- Keep Apartment crew and Family circle as linked instances of that component.
- Apartment crew shows `J`, `M`, `T`, `S`, followed by `4 people · 2 shared bills`.
- Family circle shows `J`, `M`, `T`, `…`, followed by `5 people · 1 shared card`.
- Do not add an `Open` label or another nested navigation control; the full card remains tappable.

## Accessibility and resilience

- Maintain readable contrast and the full-card tap target.
- The adjacent summary remains the membership source of truth; profile images are recognition cues.
- Typical Circle names and summaries must fit without overlapping the health face or clipping at the card edge.
- Long content should truncate rather than increase the card height.

## Product and marketability gate

- **Target user:** Friends, families, and roommates scanning their shared Circles.
- **User-facing promise:** Recognize the people and purpose of each Circle at a glance.
- **Acquisition:** Clear group identity makes an invitation-created Circle immediately understandable to new members.
- **Conversion:** This is core usability and remains ungated; future paid value may add scale or administration without degrading the card.
- **Retention:** Stable, people-first summaries reduce repeated effort when returning to recurring shared arrangements.
- **Differentiation:** Potluck presents the group and its people before financial detail instead of resembling a banking ledger.
- **Plan placement:** Free core experience.
- **Primary metric:** Successful Circle selection without backtracking in usability testing.

## Validation

- Confirm the main component and both instances remain exactly `390 × 108`.
- Confirm the title is `20 px` and visibly lower than the previous version.
- Confirm the summary is `14 px` and begins immediately after the reserved four-profile slot.
- Confirm Apartment crew renders four profiles and Family circle renders three profiles plus `…`.
- Confirm both screen cards remain linked instances of the reusable main component.
- Inspect the complete `430 × 932` Circles home for clipping, overlap, and consistent list rhythm.

## Scope and risk

This is a presentation-only refinement. It changes no Circle membership, permissions, invitations, Card access, Bill agreements, money movement, provider state, or consent behavior. The primary risk is visual crowding on the lower row, controlled by the fixed profile slot, stable summary origin, and truncation rule.
