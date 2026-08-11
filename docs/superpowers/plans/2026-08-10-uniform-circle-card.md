# Uniform Circle Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the two mismatched Circles-home cards with one reusable compact Circle Card design in Figma.

**Architecture:** The editable SVG remains the deterministic source for the compact layout, while Figma contains a reusable main component and two visually consistent screen applications. The component uses a fixed frame and predictable content slots so member-count changes never alter card height.

**Tech Stack:** Figma Design, editable SVG, Potluck design variables and text styles, Markdown product documentation

## Global Constraints

- Card size is exactly `390 × 108` on the 430 px Circles screen.
- Large Circle identity bubble is exactly `48 px`.
- Card corner radius is `26 px`.
- The health face remains at the upper right.
- The member stack remains along the lower-left portion of the card.
- Four or fewer members show all profiles; five or more show three profiles plus `…`.
- The whole card is tappable and no `Open` label is shown.
- Initials are placeholders for real profile pictures.

---

### Task 1: Update the deterministic Circle Card source

**Files:**
- Create: `docs/ui-flow/figma-circle-card-v1.svg`
- Modify: `docs/ui-flow/figma-components-v1.svg`
- Modify: `docs/ui-flow/figma-circles-home-v1.svg`

**Interfaces:**
- Consumes: approved dimensions and avatar behavior from `docs/superpowers/specs/2026-08-10-uniform-circle-card-design.md`
- Produces: one compact SVG component reference and two matching screen-card examples

- [x] **Step 1: Change the reusable component to the compact geometry**

Set the Circle Card root rectangle to `390 × 108` on the component-reference board, use a 48 px identity bubble, and place title, summary, health, and member bubbles in the same locations used by the screen component.

- [x] **Step 2: Normalize both screen cards**

Set Apartment crew and Family circle to `390 × 108`, align their identity, text, health, and member-stack slots, and shift following screen elements upward to preserve spacing.

- [x] **Step 3: Preserve member-stack states**

Apartment crew must render `J`, `M`, `T`, `S`. Family circle must render `J`, `M`, `T`, `…`.

- [x] **Step 4: Validate both SVG files**

Run:

```powershell
$files = @('docs/ui-flow/figma-components-v1.svg','docs/ui-flow/figma-circles-home-v1.svg')
foreach ($file in $files) { [xml](Get-Content -Raw $file) | Out-Null }
git diff --check -- $files
```

Expected: both XML parses succeed and `git diff --check` exits `0`.

### Task 2: Rebuild the reusable Figma Circle Card

**Files:**
- Reference: `docs/ui-flow/figma-components-v1.svg`
- Modify externally: `Potluck — Core UI v1`, page `02 Components`

**Interfaces:**
- Consumes: compact Circle Card SVG geometry from Task 1
- Produces: reusable Figma component `Circle Card / State=Default`

- [x] **Step 1: Remove the superseded main component**

Delete only the existing `Circle Card / State=Default` main component. Preserve the other eight components and the component-reference board.

- [x] **Step 2: Import the compact Circle Card artwork**

Place the updated compact card on `02 Components`, resolve Epilogue and Manrope through Figma fonts if prompted, and confirm its rendered size is `390 × 108`.

- [x] **Step 3: Create and name the component**

Convert the imported compact card group into a component named `Circle Card / State=Default`.

- [x] **Step 4: Verify reusability**

Confirm the Assets panel still reports nine components and the new Circle Card is independently selectable.

### Task 3: Apply the uniform card on the Circles home

**Files:**
- Reference: `docs/ui-flow/figma-circles-home-v1.svg`
- Modify externally: `Potluck — Core UI v1`, page `03 Screens`

**Interfaces:**
- Consumes: normalized screen artwork from Task 1 and the component geometry from Task 2
- Produces: updated `Circles / Home` screen with two uniform Circle cards

- [x] **Step 1: Replace the existing screen artwork**

Delete only the existing `Circles / Home` frame, paste the updated screen SVG, and restore the frame name `Circles / Home`.

- [x] **Step 2: Confirm identical card geometry**

Verify Apartment crew and Family circle each render at `390 × 108` with matching padding and health placement.

- [x] **Step 3: Confirm avatar behavior**

Verify Apartment crew shows four member bubbles and Family circle shows three member bubbles plus `…`, both in the same lower-left slot.

- [x] **Step 4: Inspect the full mobile frame**

Zoom to the 430 × 932 screen and confirm no overlap with `Needs attention`, the invitation card, create action, or bottom navigation.

### Task 4: Synchronize documentation and complete QA

**Files:**
- Modify: `docs/UI_FLOW.md`
- Modify: `C:/Users/Joseph/AppData/Local/Temp/design-system-state-potluck-core-ui-v1.json`

**Interfaces:**
- Consumes: verified Figma result from Tasks 2 and 3
- Produces: durable Circle Card rule and updated Figma inventory state

- [x] **Step 1: Record the uniform-card requirement**

Add the compact reusable card dimensions, 48 px identity bubble, stable member-stack slot, and no-`Open` rule to the Circle-card guidance in `docs/UI_FLOW.md`.

- [x] **Step 2: Update the Figma state ledger**

Record the Circle Card and component-reference size as `390 × 108`, identity size as `48`, and QA status as visually verified.

- [x] **Step 3: Run final repository checks**

Run:

```powershell
git diff --check -- docs/UI_FLOW.md docs/ui-flow/figma-components-v1.svg docs/ui-flow/figma-circles-home-v1.svg docs/superpowers/plans/2026-08-10-uniform-circle-card.md
```

Expected: exit code `0`.

- [x] **Step 4: Leave the deliverable open**

Leave `03 Screens` focused on `Circles / Home` at zoom-to-selection for user review.
