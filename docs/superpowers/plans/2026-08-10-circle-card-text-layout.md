# Circle Card Text Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the reusable Circle Card so its larger, lower title sits above a single people-and-summary row.

**Architecture:** The editable SVG files remain the deterministic visual source, while Figma contains one reusable main component and two linked screen instances. The fixed profile slot gives all metadata a stable starting position without changing the approved card dimensions.

**Tech Stack:** Figma Design, editable SVG, Markdown product documentation, PowerShell validation

## Global Constraints

- Circle Card remains exactly `390 × 108`.
- Circle identity remains `48 × 48` at the upper left.
- Health face remains fixed at the upper right.
- Circle name is `20 px` and moves down approximately `5 px`.
- Summary is `14 px` and starts after the reserved four-profile slot.
- Four or fewer people show up to four profiles; five or more show three profiles plus `…`.
- Apartment crew and Family circle remain linked instances of `Circle Card / State=Default`.
- The full card remains tappable and has no `Open` label.
- This work changes no permissions, consent, money movement, or provider state.

---

### Task 1: Update deterministic Circle Card artwork

**Files:**
- Modify: `docs/ui-flow/figma-circle-card-v1.svg`
- Modify: `docs/ui-flow/figma-components-v1.svg`
- Modify: `docs/ui-flow/figma-circles-home-v1.svg`

**Interfaces:**
- Consumes: geometry in `docs/superpowers/specs/2026-08-10-circle-card-text-layout-design.md`
- Produces: matching reusable-component and screen-instance artwork

- [x] **Step 1: Add a layout regression check**

Create a temporary PowerShell assertion that reads all three SVGs and fails until each contains a `20` px Circle title, a `14` px summary, and the summary origin positioned after the four-bubble member slot.

- [x] **Step 2: Verify the check fails**

Run the assertion against the current files and confirm it reports the previous `18` px title or `13` px summary.

- [x] **Step 3: Apply the approved geometry**

Move each Circle name approximately `5 px` lower, set it to `20 px`, move each summary to the lower row after the fourth profile bubble, and set it to `14 px`. Preserve the card, identity, health, and member-stack dimensions.

- [x] **Step 4: Validate the SVG sources**

Parse all three files as XML, rerun the layout assertion, and run `git diff --check` on them. Expected: all commands exit `0`.

### Task 2: Synchronize the living UI documentation

**Files:**
- Modify: `docs/UI_FLOW.md`

**Interfaces:**
- Consumes: verified geometry from Task 1
- Produces: durable Circle Card typography and row-placement rules

- [x] **Step 1: Record the stable text rules**

Document the `20 px` name, `14 px` lower-row summary, reserved four-profile slot, and truncation behavior in the reusable Circle summary card section.

- [x] **Step 2: Check documentation consistency**

Confirm the new rules do not contradict the existing `390 × 108`, `48 × 48`, health placement, overflow, or no-`Open` rules.

### Task 3: Rebuild and apply the Figma component

**Files:**
- Reference: `docs/ui-flow/figma-circle-card-v1.svg`
- Modify externally: `Potluck — Core UI v1`, pages `02 Components` and `03 Screens`

**Interfaces:**
- Consumes: validated standalone SVG from Task 1
- Produces: one updated main component and two linked screen instances

- [x] **Step 1: Replace the main component artwork**

On `02 Components`, replace only `Circle Card / State=Default` with the updated `390 × 108` artwork and restore the exact component name.

- [x] **Step 2: Restore linked instances**

On `03 Screens`, place two instances at the existing Apartment crew and Family circle positions. Preserve their content overrides and member-stack states.

- [x] **Step 3: Verify component linkage and geometry**

Confirm both screen cards are instances, both are `390 × 108`, the lower-row summaries align, and the Family overflow bubble remains `…`.

- [x] **Step 4: Perform visual QA**

Inspect the full `430 × 932` Circles home for clipping, overlap, and list rhythm. Leave the completed screen visible for review.

### Task 4: Complete repository verification

**Files:**
- Modify: `docs/superpowers/plans/2026-08-10-circle-card-text-layout.md`

**Interfaces:**
- Consumes: completed repository and Figma changes
- Produces: checked plan and verification evidence

- [x] **Step 1: Mark completed plan steps**

Change every executed checkbox to `[x]` only after its verification succeeds.

- [x] **Step 2: Run repository checks**

Parse the three SVGs as XML, run `git diff --check` on the focused files, and run the existing Node test suite with the bundled runtime. Expected: XML parsing succeeds, diff check exits `0`, and all tests pass.

- [x] **Step 3: Review the final diff**

Confirm only the approved card refinement and its documentation are included in the focused change.
