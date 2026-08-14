# Potluck Promo App-Authentic Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a preserved, app-authentic Figma variant of the Potluck coming-soon website using reusable local components derived from the approved Core UI.

**Architecture:** Keep the imported promo page untouched and build a separate page containing a duplicate of the landing-page frame plus a labeled off-canvas component source area. Because the Core UI components are unpublished in another file, recreate only the four approved marketing derivatives with local variables and styles, then place undetached instances in the hero and How It Works section.

**Tech Stack:** Figma Design, Figma Plugin API through `use_figma`, Figma screenshot validation

## Global Constraints

- Leave promo file page `Page 1` and frame `1:2` unchanged.
- Create page `Website / App-authentic v1` and duplicate the complete 1280px landing-page frame there.
- Keep Circle Preview Card at 390x108, Connected Card Row at 390x62, Connected Bill Row at 390x62, and Health Face at 44x44.
- Use local component instances; do not detach website placements.
- Use Epilogue and Manrope inside the app-derived components.
- Keep amounts secondary to people, group identity, consent, and readiness.
- Keep the waitlist email-only and do not add paid-plan or unavailable provider claims.
- Do not change repository application code or implement the Kit form in this task.

---

### Task 1: Create the Isolated Page and Marketing Foundations

**Files:**
- Modify: Figma file `kqGtmy8PFwqvVjmzD70a9u`
- Reference: `docs/superpowers/specs/2026-08-14-potluck-promo-app-components-design.md`

**Interfaces:**
- Consumes: existing promo page `0:1`, landing-page frame `1:2`
- Produces: page `Website / App-authentic v1`, duplicated landing-page frame ID, `Potluck Marketing Tokens` collection, marketing text style IDs

- [ ] **Step 1: Record the original page/frame fingerprint**

Run a read-only `use_figma` script that returns the original page child IDs and the `1:2` name, width, height, x, and y. Save these values for final comparison.

- [ ] **Step 2: Create the new page and duplicate the page frame**

Use a single write call:

```js
const original = await figma.getNodeByIdAsync("1:2");
const page = figma.createPage();
page.name = "Website / App-authentic v1";
await figma.setCurrentPageAsync(page);
const duplicate = original.clone();
duplicate.name = "Potluck Promo / App-authentic v1";
page.appendChild(duplicate);
duplicate.x = 0;
duplicate.y = 0;
return { createdNodeIds: [page.id, duplicate.id] };
```

- [ ] **Step 3: Create scoped marketing variables**

Create `Potluck Marketing Tokens` with mode `Value`. Create COLOR variables scoped to fills/text and FLOAT variables scoped to gaps, radii, and dimensions. Set exact values derived from the Core UI reference and bind them when components are created.

- [ ] **Step 4: Create marketing text styles**

Load Epilogue Bold and Manrope Regular/Medium/Bold. Create `marketing/title`, `marketing/body-strong`, `marketing/body`, and `marketing/label` styles with the Core UI sizes used by the four source components.

- [ ] **Step 5: Validate the isolated setup**

Read back the page name, duplicate dimensions, collection name/mode, variable scopes, and font families. Expected: the duplicate is 1280px wide, the collection mode is `Value`, and no app-derived text uses Liberation Serif.

### Task 2: Build the Reusable Marketing Components

**Files:**
- Modify: Figma page `Website / App-authentic v1`

**Interfaces:**
- Consumes: token collection and text styles from Task 1
- Produces: component IDs for Circle Preview Card, Connected Card Row, Connected Bill Row, and Health Face

- [ ] **Step 1: Create a labeled off-canvas component source area**

Create a `Marketing Components` section to the right of the 1280px website frame with enough space for 390px components and annotations. Do not overlap the duplicated website.

- [ ] **Step 2: Build Health Face / All good**

Create a 44x44 component with mint fill and a deep-teal face made from editable vector geometry. Add a description naming Core UI source node `1:215` and the originating file key.

- [ ] **Step 3: Build Circle Preview Card**

Create a 390x108 white rounded component with a 20px left inset, Apartment crew title, four varied member bubbles, metadata `4 people · 1 card · 2 bills`, and a Health Face instance. Add Circle-name and metadata TEXT component properties. Describe Core UI source node `7:535`.

- [ ] **Step 4: Build Connected Card Row**

Create a 390x62 white rounded component with the source-aligned coral icon bubble, `Apartment card`, and deep-teal SVG chevron. Add a title TEXT property. Describe Core UI source node `224:370`.

- [ ] **Step 5: Build Connected Bill Row**

Create a 390x62 white rounded component with the Internet icon, title `Internet bill`, status `Review pending agreement`, and secondary amount `$84`. Add title, status, and amount TEXT properties. Describe Core UI source node `224:387`.

- [ ] **Step 6: Validate the source components**

Screenshot the component area and read back dimensions, node types, component property definitions, font families, and variable bindings. Expected: four COMPONENT nodes, correct fixed dimensions, and no clipped text or overlapping layers.

### Task 3: Replace the Hero Product Preview

**Files:**
- Modify: duplicated landing-page frame on `Website / App-authentic v1`

**Interfaces:**
- Consumes: duplicate frame ID and component IDs from Tasks 1–2
- Produces: rebuilt hero visual containing component instances

- [ ] **Step 1: Locate the duplicated hero by stable layer names**

Find `Hero Visual / Modular Card` inside the duplicated landing-page frame, then find its current `Main App Card`. Return IDs and bounds before mutation.

- [ ] **Step 2: Replace only the hero mockup content**

Preserve the hero wrapper and decorative background. Remove the duplicated `Main App Card` and insert an auto-layout preview stack containing one Circle Preview Card instance, one Connected Card Row instance, and one Connected Bill Row instance. Keep each instance at 390px width and center the stack inside the existing 568x433 hero visual.

- [ ] **Step 3: Validate the hero**

Screenshot the hero node at high resolution. Expected: all three components are readable, undistorted, centered, and not clipped; website headline and form remain unchanged.

### Task 4: Replace How It Works Previews and Complete QA

**Files:**
- Modify: duplicated landing-page frame on `Website / App-authentic v1`

**Interfaces:**
- Consumes: component IDs and duplicated How It Works containers corresponding to original nodes `1:171`, `1:185`, and `1:200`
- Produces: three app-authentic preview compositions and final verified page

- [ ] **Step 1: Replace Step 1 preview**

Keep the existing 384px wrapper and replace its mismatched UI with a compact people/invitation composition using the same member-bubble styling as the Circle component. This may be a clipped instance-based composition, but must not detach or distort a source component.

- [ ] **Step 2: Replace Step 2 preview**

Place a Connected Bill Row instance in a centered clipped viewport where needed. Preserve `Review pending agreement` so the preview communicates explicit consent rather than an automatic obligation.

- [ ] **Step 3: Replace Step 3 preview**

Place a Circle Preview Card instance in a clipped or masked viewport that preserves its 390x108 geometry and shows the all-good state.

- [ ] **Step 4: Validate each modified How It Works card**

Take individual screenshots of all three preview containers. Expected: no text clipping, non-uniform scaling, placeholder copy, or overlap.

- [ ] **Step 5: Validate the full page and original preservation**

Screenshot the complete duplicated landing-page frame and compare the original page/frame fingerprint captured in Task 1. Confirm the waitlist still contains only an email field and CTA; confirm the original page child list and `1:2` dimensions/position did not change.

- [ ] **Step 6: Report implementation evidence**

Return the new page ID, duplicated frame ID, four source component IDs, hero preview ID, three How It Works preview IDs, screenshot results, font assertion, and any remaining limitation. The expected limitation is that unpublished cross-file components do not automatically sync.
