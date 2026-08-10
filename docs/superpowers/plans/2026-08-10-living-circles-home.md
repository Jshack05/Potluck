# Living Circles Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a versioned high-fidelity mobile visual reference for the approved Living Circles home.

**Architecture:** Preserve the current v1 source as historical context and create a new raster mockup from the approved specification. The new artifact is presentation-only and does not change application behavior, financial state, consent, or provider integrations.

**Tech Stack:** Built-in image generation, PNG visual inspection, Git version control

## Global Constraints

- Keep `Good morning, Joseph` with no subtitle.
- Use one conditional `Needs attention` surface.
- Make Circle cards the dominant content and fully tappable in the future implementation.
- Replace the ambiguous floating plus on this screen with `Start a circle`.
- Preserve `Cards · Circles · Bills` with Circles centered and selected.
- Use minimum 44 by 44 pixel touch targets and never rely on color alone.
- Do not alter financial behavior or claim provider capabilities.

---

### Task 1: Create the Living Circles v2 visual

**Files:**
- Reference: `docs/ui-flow/figma-circles-home-v1.svg`
- Reference: `docs/superpowers/specs/2026-08-10-living-circles-home-design.md`
- Create: `docs/ui-flow/2026-08-10-living-circles-home-v2.png`

**Interfaces:**
- Consumes: Approved screen copy, layout hierarchy, Potluck colors, and mobile navigation from the design spec.
- Produces: A portrait PNG visual reference suitable for product review and later deterministic implementation.

- [ ] **Step 1: Generate the v2 mockup**

  Use the v1 image as a content reference, rebuild the hierarchy, and request all approved text verbatim. Preserve a warm, people-first mobile-app appearance and avoid finance-dashboard cues.

- [ ] **Step 2: Inspect the generated image**

  Open the PNG at original detail and verify the greeting, alert, Circle cards, `Start a circle` action, navigation, alignment, text legibility, and absence of decorative unexplained status faces.

- [ ] **Step 3: Correct one targeted issue if needed**

  If the first output misses an approved requirement, regenerate with one focused correction while repeating all layout and copy invariants.

- [ ] **Step 4: Save the accepted artifact**

  Copy the accepted image to `docs/ui-flow/2026-08-10-living-circles-home-v2.png` without overwriting v1.

- [ ] **Step 5: Validate repository state**

  Run `git diff --check -- docs/superpowers/specs/2026-08-10-living-circles-home-design.md docs/superpowers/plans/2026-08-10-living-circles-home.md` and confirm the PNG opens successfully.
