# Potluck Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Potluck Figma landing page as a responsive, static HTML/CSS website in a dedicated `marketing-site` directory and publish the implementation branch to GitHub.

**Architecture:** The site is a single semantic HTML document styled by one CSS file with local Figma-exported artwork and self-hosted fonts. It has no framework, JavaScript, form, analytics, cookies, backend, or personal-data collection. A Node built-in test validates public copy, local asset integrity, absence of registration/tracking surfaces, and responsive styling.

**Tech Stack:** HTML5, CSS3, local SVG/JPEG/WOFF2 assets, Node.js built-in test runner, Git.

## Global Constraints

- Implement Figma file `kqGtmy8PFwqvVjmzD70a9u`, node `7:2`.
- Preserve the approved copy, including `Shared bills, made simple.` and `BUILT TO LAST`.
- Do not add a waitlist, email field, contact form, analytics, cookies, JavaScript, or backend.
- Use Manrope for body copy and Epilogue for display copy.
- Preserve the app-authentic cards and icons without stretching them.
- Keep the existing root prototype untouched; all website files live under `marketing-site/`.
- Support desktop, tablet, and mobile widths without horizontal overflow.

---

### Task 1: Static-site contract

**Files:**
- Create: `marketing-site/tests/site.test.mjs`
- Test: `marketing-site/tests/site.test.mjs`

**Interfaces:**
- Consumes: `marketing-site/index.html`, `marketing-site/styles.css`, and local paths referenced by HTML/CSS.
- Produces: a zero-dependency validation command: `node --test marketing-site/tests/site.test.mjs`.

- [ ] **Step 1: Write the failing test**

Create Node tests that require semantic landmarks, approved headline and section copy, zero forms/email inputs/scripts, local-only asset references, existing referenced files, and responsive CSS media queries.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test marketing-site/tests/site.test.mjs`

Expected: FAIL because `marketing-site/index.html` and `marketing-site/styles.css` do not exist.

- [ ] **Step 3: Keep the test unchanged while implementing Tasks 2–3**

The production change that makes the test pass is the addition of the complete static site and its local assets.

### Task 2: Figma assets and typography

**Files:**
- Create: `marketing-site/assets/*.svg`
- Create: `marketing-site/assets/*.jpg`
- Create: `marketing-site/assets/fonts/*.woff2`
- Create: `marketing-site/assets/fonts/OFL-Manrope.txt`
- Create: `marketing-site/assets/fonts/OFL-Epilogue.txt`

**Interfaces:**
- Consumes: Figma-exported asset bytes and Google Fonts source files.
- Produces: stable local asset paths consumed by HTML and CSS.

- [ ] **Step 1: Download exact Figma assets**

Download the source JPEGs and SVG layers returned by Figma for node `7:2`; inspect and rename them semantically without editing their contents.

- [ ] **Step 2: Self-host the approved fonts**

Download Manrope and Epilogue variable font sources plus their OFL licenses, convert to WOFF2, and reference only those local files.

- [ ] **Step 3: Verify asset integrity**

Confirm every SVG parses as XML, each JPEG has a valid image signature, each WOFF2 begins with `wOF2`, and no production file references a temporary Figma asset URL.

### Task 3: Responsive landing page

**Files:**
- Create: `marketing-site/index.html`
- Create: `marketing-site/styles.css`
- Create: `marketing-site/README.md`
- Test: `marketing-site/tests/site.test.mjs`

**Interfaces:**
- Consumes: the local assets from Task 2 and the exact copy/layout from Figma node `7:2`.
- Produces: a deployable folder whose top-level entry point is `marketing-site/index.html`.

- [ ] **Step 1: Implement semantic HTML**

Build a fixed header, hero, audience strip, product pillars, three-step flow, editorial use cases, trust section, and footer. Use decorative images with empty alt text and meaningful section labels for assistive technology.

- [ ] **Step 2: Implement desktop styling**

Reproduce the cream/white palette, teal and gold accents, typography, 1280px content width, app-authentic preview cards, spacing, borders, and subtle shadows.

- [ ] **Step 3: Implement responsive styling**

At tablet and mobile breakpoints, stack multi-column layouts, keep preview cards at their intrinsic aspect ratio, reduce display type safely, and prevent horizontal overflow.

- [ ] **Step 4: Run tests to verify green**

Run: `node --test marketing-site/tests/site.test.mjs`

Expected: PASS with all contract tests green.

- [ ] **Step 5: Run browser QA**

Serve `marketing-site/` locally and inspect desktop, tablet, and mobile viewports for clipping, overflow, broken assets, and unexpected registration UI.

### Task 4: Publish the implementation branch

**Files:**
- Add only: `marketing-site/**`
- Add: `docs/superpowers/plans/2026-08-15-potluck-marketing-site.md`

**Interfaces:**
- Consumes: verified static-site files.
- Produces: pushed branch `codex/marketing-site` on `origin`.

- [ ] **Step 1: Run final verification**

Run the Node contract tests, link/asset checks, HTML parsing check, responsive browser smoke test, and `git diff --check`.

- [ ] **Step 2: Stage only intended files**

Run: `git add -- marketing-site docs/superpowers/plans/2026-08-15-potluck-marketing-site.md`

- [ ] **Step 3: Commit**

Run: `git commit -m "feat: add Potluck marketing site"`

- [ ] **Step 4: Push**

Run: `git push -u origin codex/marketing-site`
