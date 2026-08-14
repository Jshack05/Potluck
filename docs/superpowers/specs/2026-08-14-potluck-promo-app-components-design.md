# Potluck Promo Website: App-Authentic Components Design

Date: 2026-08-14
Status: Approved design, pending implementation plan

## Objective

Create an app-authentic variant of the existing one-page Potluck promotional website in Figma. Preserve the original imported landing page and replace the website's mismatched miniature product illustrations with reusable marketing components derived from the approved Potluck Core UI.

The website remains a coming-soon page with an email-only waitlist. This task changes the Figma design only; it does not implement the live Kit form or modify application code.

## Product and Marketability Gate

- **Target user:** Friends, families, couples, and roommates who coordinate recurring shared expenses; the initial host is the primary acquisition user and invites contributors into Potluck.
- **User-facing promise:** Potluck keeps shared expenses organized without awkward chasing or unclear expectations.
- **Plan placement:** The landing page and waitlist are free acquisition surfaces. No Plus or Premium paywall, entitlement, or upgrade treatment appears.
- **Acquisition:** A clear coming-soon explanation and email waitlist capture early hosts; the product story emphasizes that hosts naturally bring their people into Potluck.
- **Conversion:** Out of scope for this page. The design may communicate the value of coordinated shared expenses, but it must not imply a paid plan or unavailable premium capability.
- **Retention:** The product story focuses on recurring household coordination, clear contribution expectations, and shared readiness rather than one-time expense splitting.
- **Differentiation:** Potluck is presented as a people-first coordination utility connecting Circles, Cards, Bills, and accepted contribution terms—not a bank dashboard, generic bill tracker, or after-the-fact expense ledger.
- **Primary metric:** Completed email waitlist submissions, with secondary review of hero-to-form engagement and submission conversion rate.

## Affected Actors and Financial Scope

The marketing visitor and prospective host are affected. No existing Potluck user, Circle, Card, Bill, contribution agreement, invitation, transaction, or provider record changes.

No money movement, card authorization, recurring withdrawal, provider integration, or financial source of truth is involved. Product mockups must not imply that Circle membership automatically creates a financial obligation or spending right. The connected Bill preview may show a pending agreement state to reinforce consent.

## Chosen Approach

Use a non-destructive duplicated-page approach:

1. Leave the existing `Page 1` and its `Html → Body` frame unchanged.
2. Create a new page named `Website / App-authentic v1`.
3. Duplicate the full 1280px landing-page frame into the new page.
4. Create a compact local marketing foundation and component area on the new page, positioned outside the website frame.
5. Replace only the product-preview artwork that conflicts with the app UI; retain the approved Stitch page composition, copy hierarchy, section order, and waitlist placement.

This approach is preferred because the source Core UI components are local and unpublished in a separate Figma file. They cannot be imported as live cross-file instances. Local marketing derivatives provide reusable structure without pretending they are linked to an unavailable published library.

## Foundations

Create one local variable collection named `Potluck Marketing Tokens`, with one mode named `Value`. It contains only the colors and dimensions needed by the marketing components:

- Dirty-white page background
- Pure-white component surface
- Deep-teal primary text/action
- Muted body text
- Lavender Circle avatar
- Mint health state
- Coral Card icon accent
- Pale Bill icon accent
- Standard card radius
- Standard 20px card inset
- Standard internal row gaps

Create local text styles aligned with the Core UI:

- `marketing/title`: Epilogue Bold
- `marketing/body-strong`: Manrope Bold
- `marketing/body`: Manrope Regular
- `marketing/label`: Manrope Medium or Bold as required by the source component

The promo file's existing imported typography and layout remain unchanged outside the new app-derived components.

## Reusable Marketing Components

Build four local source components at their production dimensions:

1. **Marketing / Circle Preview Card** — 390x108
   - Apartment crew
   - Four member bubbles
   - `4 people · 1 card · 2 bills`
   - All-good Health Face
   - Text properties for Circle name and metadata

2. **Marketing / Connected Card Row** — 390x62
   - Apartment card
   - Coral Card icon treatment
   - Deep-teal disclosure chevron
   - Text property for title

3. **Marketing / Connected Bill Row** — 390x62
   - Internet bill
   - `Review pending agreement`
   - `$84`
   - Text properties for title, status, and amount

4. **Marketing / Health Face / All good** — 44x44
   - Mint status circle and deep-teal smile treatment matching the Core UI source

Component sources remain in a clearly labeled off-canvas `Marketing Components` section. Website placements are undetached instances.

## Website Placement

### Hero

Replace the current `Hero Visual / Modular Card` contents in the duplicated page with an app-authentic product preview. Use the Circle Preview Card at 390px wide with the Connected Card and Connected Bill rows beneath it. The group sits inside the existing 568x433 hero visual area with layered accent shapes retained or refined as background decoration.

The components remain at 1x production scale. Adjust the surrounding composition rather than stretching the components.

### How It Works

Replace the mismatched miniature UI in the three existing step cards while preserving each card's text and overall 384px content width:

- Step 1 uses a compact invitation/people treatment derived from the Circle member bubbles.
- Step 2 uses the Connected Bill Row to show a review-pending agreement state.
- Step 3 uses the Circle Preview Card or a cropped, masked instance-based composition to show the group becoming ready.

If a full 390px component exceeds the 384px inner preview width, place it inside a clipped viewport or increase the local preview wrapper by the minimum amount available in the existing column. Do not non-uniformly scale or distort the component.

### Other Sections

Retain existing illustrations unless they visibly contradict the approved Core UI. This pass does not redesign the entire landing page or create a mobile page.

## Accessibility and Content Rules

- Maintain readable contrast between deep teal, muted text, and white or dirty-white surfaces.
- Do not encode readiness only through color; the Bill row includes the explicit status `Review pending agreement`.
- Do not imply that contributing grants spending access.
- Keep dollar amounts secondary to people, group identity, and readiness.
- Preserve meaningful text rather than baking the UI into raster images.

## Validation

Implementation is complete when:

1. The original `Page 1` is unchanged.
2. The new page contains one duplicated full landing-page frame and a separate local component-source area.
3. Website placements are component instances, not detached copies.
4. Circle and row components retain their 390px/108px and 390px/62px production geometry; Health Face remains 44x44.
5. Epilogue and Manrope are confirmed on the new component text.
6. Screenshots of the hero, each modified How It Works preview, the component source area, and the full page show no clipping, overlap, placeholder copy, or distorted components.
7. The waitlist remains email-only in the design.

## Risks and Boundaries

- The local marketing components will not automatically update when the separate unpublished Core UI file changes. Their descriptions should identify the originating file and source node IDs.
- This Figma pass does not make the waitlist functional. Kit embed configuration and production website implementation require a later code task.
- No mobile landing-page variant is included in this scope.
- No repository product context update is required because this work does not change product behavior, roles, consent, pricing, or provider assumptions.
