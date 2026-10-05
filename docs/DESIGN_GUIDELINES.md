# Potluck Design Guidelines

## October 5, 2026 — Full-app entry and shared shell

- Existing Figma compositions and components remain the visual authority; integration work does not authorize generic replacements.
- Account entry precedes all four destinations and has no app navigation. Bank setup is contextual to Cards and Bills; Circles and Splitfinder open after sign-in, and remain reachable through navigation during bank setup.
- Primary flow actions stay in the fixed lower action area, above navigation when present or above the safe area otherwise. Content scrolls independently. Field toggles and per-item/retry actions stay near their context.
- Replace repeated guest cards and inline sign-in buttons with one entry flow that preserves the intended destination.
- Core Inbox uses teal Figma source `1555:19208`; the blue Inbox belongs to Splitfinder.
- Account source: `940:4770`. Bank handoff source: `1489:18043` / `1486:17690`. Adapt old inline action placement to the current bottom-action rule. Do not fabricate bank confirmation or working social authentication.
- Empty-home sources: Cards `766:3012` / component `776:3168`; Circles `766:3056` / component `427:649`; Bills `766:3098` / component `765:3333`. Use the original 164×128 Lucky/table artwork and distinct pink card, teal Circle and amber bill details. Center the illustration and standalone copy; do not replace them with a generic icon in a circle or an information card. For bank-required states, adapt the description and use a bottom Connect bank account action. For available empty areas, use the appropriate creation action in that same bottom area.

**Status:** Current design and Figma QA guidance  
**Last updated:** August 13, 2026  
**Applies to:** Potluck Figma files, Circles home, Circle Detail, Cards/Bills rows, bottom navigation, overlays, and reusable UI components.

## Purpose

This document is the active design-source companion to `docs/UI_FLOW.md` and `docs/PRODUCT_CONTEXT.md`.

Use it before making or reviewing Figma changes. If this document conflicts with older plans, specs, Stitch prompts, or generated mockups, this document wins for visual and component guidance.

## Current Visual Direction

**September 23, 2026 brand clarification:** Potluck uses its existing green/deep-teal identity; Splitfinder uses its established blue section theme. Keep headings dark as documented in Splitfinder context. Purple controls, prices, and branding in recent generated onboarding concepts were not approved and must not become design tokens. Existing decorative lilac artwork is not a purple interaction palette. See [the listing-card research and user correction](2026-09-23-listing-card-research-and-critique.md).

Potluck should feel like a warm social utility, not a bank dashboard.

Current surface rules:

```text
screen background = muddy / dirty white
content cards and buttons = pure or near-pure white
primary action = deep teal
```

Rules:

- Use a muddy-white app background instead of the old creamy beige.
- Use pure white, borderless cards over the background.
- Avoid visible card borders unless a card genuinely blends into the background and needs separation.
- Use deep teal for selected navigation, primary actions, and strong financial emphasis.
- Do not hardcode one-off background values in screen elements when a Foundation/token value should control the color.

## Figma Component Rules

- Reusable UI belongs in `02 Components`.
- Screens in `03 Screens` should use component instances, not detached duplicates, whenever the element is intended to be reusable.
- If a source component should update multiple screens, edit the source component first and verify the screen instance updated.
- If an instance visually drifts from its source, replace it with a fresh source-backed instance rather than patching a stale duplicate.
- Do not manually resize component instances in a way that smushes icons, bubbles, indicators, or internal layout.
- When reusing icon components at a different size, proportionally rescale the instance so stroke/line weights and internal ratios remain visually consistent. Do not create a new icon file or duplicate icon component just to change size; record the rule in this existing guideline file and reuse the appropriate source component.
- Lock aspect ratios for components where distortion would break the design.
- Text, images, colors, labels, amounts, counts, and names that vary by account should be exposed as component properties or otherwise kept easy to update.

## Components Page Placement

- Place new components near related components but in a clear, non-overlapping area.
- Do not overlap existing components, annotations, sections, or prototypes.
- Do not move, squeeze, or resize unrelated Components-page objects unless explicitly requested.
- Keep Components organized by family: foundations, navigation, cards, bill icons, health faces, identity/avatar elements, action buttons, overlays, and screen-specific composites.

## Typography and Text Alignment

- Matching section headings must use matching font family, weight, size, and line height.
- On Circle Detail, `People`, `Cards`, and `Bills` use Inter Bold, 24px.
- Repeated row titles use consistent font size, weight, color, and vertical placement.
- Text attached to an icon, bubble, row, or button must align intentionally with that element.
- If subtext is removed from a row, vertically center the remaining title.
- Text boxes should not contain extra invisible width that creates visual imbalance.
- Do not add redundant helper/subtext by default. Before adding secondary copy, ask whether it gives the user new decision-making value, reduces ambiguity, or prevents a likely mistake. If it only restates the obvious action, remove it.

## Circle Home Screen

The Circles home screen structure is:

1. Page title.
2. Top-right You bubble for private account/profile attention.
3. Needs attention section, only when action exists.
4. Invite item, when relevant.
5. Your circles section.
6. Circle cards.
7. Floating plus action.
8. Persistent bottom navigation.

Rules:

- The old subtitle `Your people and shared plans` is not necessary on the current screen.
- Keep the top area compact so three Circle cards can be visible at once where practical.
- The gap between major Circle home sections should feel intentionally larger than the 12px intra-card rhythm.
- Bottom navigation and floating plus stay fixed to the screen, not part of scrollable list content.
- Circle card taps that navigate to Circle Detail screens should use `Dissolve`, `Ease out`, around `0.18s` if `Smart animate` causes the detail screen to start in the wrong position and snap into place.

## Circle Summary Cards

Current Circle summary card rule:

```text
card width = 390px
card height = 108px
card gap inside Your circles list = 12px
```

Each Circle summary card contains:

- Circle identity icon/photo at upper left.
- Circle name.
- Circle health face at upper right.
- Member avatar stack at lower left.
- Simple metadata: `x people · y card(s) · z bill(s)`.

Metadata rules:

- Omit zero-count categories. Use `5 people · 1 card`, not `5 people · 1 card · 0 bills`.
- Use `card`/`cards` and `bill`/`bills` correctly.
- Keep the text simple. Avoid `shared card` or `shared bill` in compact metadata.

## Circle Detail Screen

Spacing rules:

```text
hero / intro card to first section heading = 16px
major section content to next section heading = 37px
rows inside the same section = 12px
```

Rules:

- If one section moves, dependent sections below it move consistently.
- The People section heading should match Cards and Bills typography.
- People lists show all people in the section and grow when needed; there is no `See all` for people.
- The People section includes an Add person bubble after the last person.
- In Circle Detail people rows, distribute visible member bubbles and the Add person bubble evenly between 20px left and 20px right insets. For 4 people plus Add, use 30px gaps between bubbles. For 3 people plus Add, use about 55.33px gaps between bubbles.
- If a Circle has more than 5 displayed people in the detail people section, start a second row rather than squeezing people or widening gaps.
- Cards and Bills use section-header add pills rather than add-row cards.

## Create Circle Screen

Create Circle should feel like creating a shared place for people, not opening a financial product.

Rules:

- Keep the first version as one clean page rather than a long wizard.
- Start with Circle name and a friendly Circle identity preview.
- Empty input fields should show muted placeholder text, not account-specific sample values. The Create Circle name field uses `Name your circle` as placeholder text and should not include helper/description copy underneath.
- Do not include redundant setup helper copy like `Start with a name, then invite people.` on Create Circle; the form fields already communicate the task.
- Matching input placeholders in the same flow should use matching font family, size, line height, and muted color treatment.
- People can be searched by name, phone, or username.
- Do not include a Suggestions list on the Create Circle screen. Known or already-added people belong in the add-person popup; search is for explicit lookup or new people.
- Selected people appear as avatar/name chips, with profile/photo and initial rules matching the rest of the Circle system.
- Creating a Circle with selected people sends Circle invitations; it does not automatically add members.
- Use a broader `Settings` section rather than a narrow `Visibility` section.
- Create Circle settings should use one rounded card block with compact internal switch-style rows. Current rows are `Members can invite people`, `Require host approval`, and `Anonymous circle`.
- Anonymous should stay last in the Settings section and default off unless the user explicitly changes it.
- Anonymous copy should stay precise: members stay private from one another, and the Circle Host controls the full member list.
- The primary action can read `Create Circle` when no people are selected and `Create and invite` when invitees are selected.
- Reusable Create Circle elements should live in `02 Components`, and the screen in `03 Screens` should be a source-backed instance.

## Avatars, Bubbles, and People Arrays

- Leftmost bubbles or avatars inside card-like surfaces start 20px from the card's left edge.
- If fewer than four people are visible, shift the following metadata so there is 20px between the final visible avatar and the metadata text.
- If more than four people exist, show visible people plus a `+x` bubble for hidden members. Do not use `...` for current UI.
- Center `+x` inside the circle and make it heavy enough to read.
- If a person has a profile photo, place that photo first in the visible avatar array.
- Placeholder initials and Circle icons should use varied colors where helpful; do not make every group/circle icon the same color.
- Counts must match visible avatars and metadata.

## Icons Inside Circles

- Icons inside circles must be centered geometrically and visually.
- Icons should not touch the edge of a circle or fill it to the maximum possible size.
- Leave clean interior breathing room.
- Use production-sized source components rather than redrawing or resizing icons loosely inside each instance.
- If an icon needs to appear smaller or larger inside a circle, use proportional rescaling and then verify the icon still has clean breathing room; do not squash the component with independent width/height resizing.

## Health Faces and Status

Health/smiley faces are reserved for Circle readiness/status.

Circle health face rules:

- Author health face components at production size: 44px x 44px.
- In Circle cards, place the health face 14px from the top and 22px from the right unless a new source component intentionally changes the standard.
- Use the already-made health face components; do not draw one-off custom faces inside cards.
- Shape must carry meaning in addition to color.

Current severity language:

```text
All good = green smile
Needs attention = yellow slanted face
Act now = red frown
```

Cards do not have a generic "good standing" status pattern. Cards are simply cards unless a separate card-specific action or state is explicitly designed.

## Bills and Amount Standing

Bills communicate standing through the bill amount color:

```text
good / normal = current deep green
warning / unpaid past threshold = yellow
serious issue / declined charge / substantial nonpayment = red
```

Rules:

- Apply the standing color to both the dollar sign and the numeric amount.
- Do not use Circle smiley faces to communicate Bill standing in bill rows.
- Bill/category icons must be intuitive, centered, and support editable icon/background colors where needed.

## Card Rows

- Card rows are simply cards, not readiness/status cards.
- Do not use Circle health faces on Card rows.
- Use a right-facing disclosure chevron when a row navigates into card details.
- Card/category icons must be centered, properly scaled, and visually distinct from bill icons.
- Right-side row affordances should sit about 20px from the card right edge.

## Needs Attention and Invite Items

Needs-attention items should feel related to the other white cards.

Rules:

- Use the same white, borderless card language as the rest of the screen.
- Avoid red backgrounds for non-urgent invitations or review items.
- Use deep teal for review/action buttons.
- Remove accidental white backing rectangles behind rounded content.
- Place the relevant face/status affordance on the right side when the item is Circle-related.
- Align secondary text with the review button when they appear in the same action row.
- Keep card widths aligned with the other cards.

## Floating Plus Action

- The floating plus should remain visually distinct from white cards.
- Use a deep teal circular button with a white plus unless a later source component replaces it.
- Keep it fixed with the screen, not inside scrollable content.
- It opens the global creation popup.

## Section Add Actions

Cards and Bills section add actions use the same compact icon-only add button because the section title already tells the user whether they are adding a Card or Bill.

Rules:

- Use one shared reusable add button for both Cards and Bills section headers.
- Place the button edge-aligned in the section header, not jammed into the title.
- Keep the visual button compact while preserving a usable tap target.
- The plus icon inside a pill should be a geometric/vector icon inside a fixed icon frame, not a raw text glyph.
- Center the plus icon structurally inside the button.

## Bottom Navigation

Use exactly four persistent mobile tabs:

```text
Circles · Cards · Bills · Splitfinder
```

Rules:

- Circles is far left and remains the default destination.
- Do not reintroduce the older centered three-tab navigation or Home shell.
- Treat bottom navigation as location chrome, not content/action iconography.
- Active navigation uses the deep teal selected treatment.
- Inactive navigation icons and labels use the dedicated neutral `#667371` unless the source component changes.
- Floating/glass navigation experiments must keep icons and labels readable and must lock aspect ratios.
- Screen nav should be source-backed; do not manually patch nav duplicates on individual screens.

## Popup and Overlay Prototypes

- The plus popup opens from the bottom when prototyped.
- Background dimming fades or appears separately from the popup movement.
- Dimming should be slight, not full black.
- Tapping outside the popup dismisses it.
- Tapping inside the popup does not dismiss it.
- Popup option icons use established Core Icons components.
- Popup-specific icon scaling should not change source sample icons.
- For popup-to-full-screen navigation, prefer `Dissolve` around `0.18s` unless the source and destination share stable matching layers. Do not use `Smart animate` if it causes the destination screen to appear in the wrong position before snapping into place.

## Back Navigation Prototypes

- Any screen with a back button should support a left-to-right dismissal feel.
- Use the reusable `Back Button / Default` component as the source for the visual button.
- The reusable source component can use Figma's generic `Back` action, but actual screen instances should be checked directly because component-source prototype targets may not reliably point across pages.
- When the previous screen is known, wire the screen instance to that destination with `Navigate to`, `Move out`, `Right`, `Ease out`, around `0.18s`.
- For the current Circle flow, back buttons on Circle Detail and Create Circle should return to `Circles / Home`.

## Cross-screen consistency standard — 2026-09-12

- Use Inter for interface text. Preserve deliberate wordmark/card artwork typography and existing single-character navigation glyphs until replaced with vectors.
- Standard canvas: `#F3F2EF`; primary action: `#006D67`. Bind to semantic variables. Preserve Splitfinder's intentional blue theme, transparent overlays, and larger hero illustrations.
- Ordinary white content cards use 24px corners, without decorative borders or shadows. Selection states, floating navigation, popovers, and image/virtual-card artwork retain their functional treatments.
- Bill identities use a teal glyph on a mint rounded-square tile at every size. Use `Bill Icon / …` and `Bill Mini Icon / …` sources; scale proportionately. Do not introduce white-on-teal or circular variants for the same bill identity.
- Ordinary bank-account rows use a proportionately scaled 24px bank icon. Hero bank illustrations are a separate role.
- Person colors follow stable identity, not list order. Current fixtures use Maya=mint, Jordan=lilac, Taylor=peach. Preserve uploaded photos and editable initials.
- Radio controls use an outlined ring and teal center when selected. The 22px compact and 28px standard components share this construction.
- Standard single-line inputs use 56px height, 16px corners, Inter text and the shared muted placeholder color. Multiline fields remain content-sized.
- Explanatory information notices use the reusable neutral information card with a black outlined information icon and muted text. Keep accepted authorization terms intact; do not replace them with generic notice copy.
- Pending/awaiting badges use soft orange (`#FFECD7`) with dark orange text. Ended/removed badges are neutral; accepted/received may use mint. Visual consistency must never merge pending, settled, failed, canceled, or unaccepted states.
- Existing compatibility components remain connected to their instances; new work should use the canonical sources above. Source changes must be checked against screen overrides.
- After binding paint variables, verify the rendered RGB fallback as well as the variable ID. Preserve theme-specific values when resolving aliases.

## Pre-Reply Figma QA Checklist

Before saying a Figma change is done:

- [ ] The changed reusable UI is source-backed in `02 Components`.
- [ ] Affected screens use instances, not detached duplicates.
- [ ] Source changes were verified on the actual screen where they matter.
- [ ] Components-page additions do not overlap anything.
- [ ] Matching headings and repeated row text have consistent font sizes and alignment.
- [ ] Icons inside circles fit cleanly with interior breathing room.
- [ ] Text attached to elements is properly aligned.
- [ ] Agreed spacing rules are measured, not guessed.
- [ ] Left/right insets are consistent.
- [ ] Icons are centered, not clipped, and not text-glyph hacks when vector icons are needed.
- [ ] Bill amount color reflects standing when relevant.
- [ ] Cards are not given generic "good standing" status.
- [ ] A screenshot of the source component was rendered if the source changed.
- [ ] A screenshot of the affected screen was rendered if a screen changed.
- [ ] If verification shows a miss, fix it before reporting back.

