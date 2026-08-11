# Uniform Circle Card Design

**Date:** August 10, 2026
**Status:** Approved for implementation

## Purpose

Create one compact, reusable Circle Card so every Circle in a list has the same height, internal alignment, health placement, and profile-picture behavior. The component replaces the mismatched Apartment crew and Family circle card layouts.

## Approved direction

- Use a fixed `390 × 108` card, matching the approved compact Family circle height.
- Use a `26 px` corner radius, white surface, and subtle Potluck border.
- Make the entire card tappable; do not show an `Open` label.
- Shrink the large Circle identity bubble from `56 px` to `48 px` so the member row has adequate room.
- Preserve the Apartment crew member-row placement along the lower-left portion of the card.
- Keep the health face fixed at the upper right.

## Component anatomy

1. **Circle identity:** A 48 px Circle image or initial bubble near the upper left.
2. **Primary text:** Circle name in the approved title style.
3. **Secondary text:** People count and concise attached-asset summary.
4. **Health:** One accessible health-face state at the upper right.
5. **Member stack:** Four 26 px profile-picture bubbles positioned at the lower left.

The identity bubble and member stack must not overlap. Text must remain readable with typical Circle names and summaries without changing the component height.

## Member-stack behavior

- One to four members: show every available profile picture, up to four bubbles.
- Five or more members: show the first three profile pictures and replace the fourth bubble with `…`.
- The ellipsis bubble has an accessible label containing the hidden count, such as `2 more people`.
- Adjacent metadata remains the source of truth for total membership.
- Initials are acceptable design placeholders when profile photography is unavailable.

## Reusable properties

The Figma component exposes or represents these changeable values:

- Circle name
- Circle image or initial
- Summary text
- Health state: All good, Needs attention, or Act now
- First three profile images
- Fourth profile image or overflow state
- Accessible overflow count

## Screen application

- Replace both existing Circle cards on the Circles home with the uniform component design.
- Apartment crew shows all four member bubbles.
- Family circle shows three member bubbles plus `…` because it has five members.
- Both cards use identical dimensions, padding, title position, summary position, health position, and member-stack position.

## Accessibility

- Maintain a minimum 44 px tap target for the full card.
- Do not rely on profile images or health color alone to convey meaning.
- Preserve adjacent people-count text and accessible health labels.
- Provide a meaningful accessible label for the overflow bubble.

## Product placement and measurement

- **Target user:** Friends, families, and roommates scanning shared Circles.
- **Promise:** Every Circle is immediately recognizable and consistently scannable.
- **Plan placement:** Ungated core interface.
- **Acquisition and retention:** Recognizable people and stable Circle identity make invitations and recurring shared coordination easier to understand.
- **Differentiation:** People remain visually primary instead of reducing Circles to financial rows.
- **Primary measurement:** Reduced mis-taps or repeated navigation when selecting a Circle, supported by usability testing.

## Validation

- Confirm both example cards render at exactly `390 × 108`.
- Confirm the 48 px identity bubble does not collide with the member stack.
- Confirm four people render as four profiles.
- Confirm five people render as three profiles plus `…`.
- Confirm the component remains reusable and independently selectable in Figma.
- Visually inspect the completed Circles home at its 430 px design width.
