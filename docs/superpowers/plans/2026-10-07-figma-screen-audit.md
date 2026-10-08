# Potluck Figma Screen Audit and Navigation Reference Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Checkboxes represent work still to do, not completed audit coverage.

**Goal:** Make every existing Potluck design discoverable, explain its actual and intended connections, and map it to the app so existing flows are reused accurately.

**Architecture:** Refresh the existing dated audit evidence and searchable explorer under `docs/flow-audit/`. Maintain one human entry point in `docs/APP_FLOW_MAP.md`, backed by structured screen/connection records. Add a separate, clearly named reference area in the existing Figma file containing flow indexes and annotation panels outside product screens.

**Tech stack:** Figma Plugin API and native prototype inspection; existing JSON/Markdown/HTML audit tooling; Expo Router source and app visual verification. No new application dependencies.

**Spec:** October 7 founder directions recorded in `docs/PRODUCT_CONTEXT.md` and `AGENTS.md`: inventory all existing designs, document connections, prevent unnecessary replacements, and design for the finished product assuming program availability.

**Status (October 8 resumed):** Incomplete. All 809 reaction trees and 8,553 transition references captured; 25 families reconciled with product documents; 271 readable visual reviews; all 55 Expo route files read and 218 designs partially mapped to source states. Five app visual comparisons and zero live prototype journeys. Figma quota recurred during remaining visual work. Permanent notes are drafted locally but not created.

**Planning verification:** The existing `validate-flow-audit.mjs` currently fails its documentation-link check because `docs/2026-09-20-launch-and-conversation-decisions.md` and `docs/2026-09-23-onboarding-research-and-decisions.md` are absent in this checkout. Both links also occur in the unchanged HEAD version of `APP_FLOW_MAP.md`; this is a pre-existing finding. Locate authoritative copies or explicitly reconcile the references during the audit; do not invent their contents or weaken the validator. New planning links and diff whitespace are checked separately.

## Global constraints

- Scope covers the entire Potluck design file, including Circles, Cards, Bills, Goals, Splitfinder, authentication, onboarding, roles, settings, messages, overlays and continuation/alternative states. Inspect all pages; distinguish reusable components from actual screens.
- Preserve node IDs, linked instances, screen geometry, user edits and prototype behavior. Do not move, rename, delete, reparent or rewire original screens as part of an inventory. Suggest organization changes separately.
- Assume approved/available programs for intended UI design. Track actual integration and approval evidence separately; never fabricate runtime issuance, balances, payments, bank connections or accepted consent.
- Use final-product flows/copy. Existing limitations are engineering gaps; they do not justify demo replacements. This plan does not reopen deferred paid plans or other features.
- Never equate missing wiring with a missing screen, or a missing route with a missing design. Never choose the newest-looking frame as canonical without evidence.
- Notes are ordinary searchable text outside phone frames, not hidden plugin metadata or product UI. Create them in an isolated reference section with a manifest of created node IDs for easy removal.
- Preserve October 2 snapshots. Existing counts are historical and must be refreshed; tool quota or inaccessible content means incomplete coverage, not permission to infer it.

## Review focus

- Nested frames, hidden alternatives and component states may be missed by top-level searches.
- Multiple variants may serve distinct actors, states or permissions; they are not automatically duplicates.
- Conditional, ordered or overlay actions may be misrepresented as simple navigation links.
- A matching app route/name may implement a different screen or only part of a flow.
- Design assumptions may be accidentally reported as operational provider facts, or a stale inventory may be treated as current.

## Existing assets and intended outputs

Read `docs/flow-audit/README.md`, `build-flow-audit.mjs`, `validate-flow-audit.mjs`, the dated JSON snapshots, `docs/APP_FLOW_MAP.md`, `docs/UI_FLOW.md` and current product decisions first. The October 2 audit captured 786 records and only 240 reaction trees; these are historical counts, not a current total. It explicitly missed nested Authentication, Getting started and Bill import sections. Inspect whether those IDs still resolve before continuing.

Outputs will extend the existing register/explorer with a newly dated snapshot, measured coverage, app mappings and annotation manifest. The exact snapshot date must reflect execution. Figma annotations live in file `1hAy3kcZAEvqq8ZNjKU7CD`, alongside existing screens/components, with a clearly labeled audit index in a verified clear canvas location. Do not create another design file.

Each screen record must include: file/page/node ID and direct link; current name and parent path; type and visibility; flow and purpose; actor/role; state/variant; source component references; design status with evidence; captured/inferred/unresolved connections; matching route and source file; implementation status; visual verification status; capture date and repository commit; unresolved questions. Use null/unknown where evidence is absent.

Each connection record must identify the source control, trigger, ordered actions/conditions, destination, back/dismiss behavior and evidence type. Preserve raw reactions. Intended but unwired edges must be labeled separately. Include variable dependencies and whether the relevant dictionary was fully inspected.

## Task 1 — Establish complete inventory coverage

- [x] Record repository branch/commit, dirty files, Figma pages and capture time. Read applicable instructions and identify current product decisions without changing scope.
- [x] Enumerate all screen containers recursively in bounded resumable batches. Separately record labels, illustrations and component libraries so they do not inflate screen counts.
- [x] Reconcile live IDs against October 2 snapshots and subsequent documented additions. Resolve apparently absent nodes directly before labeling them removed; retain provenance.
- [x] Record expected versus inspected containers and reasons for any gaps. Save checkpoints so a later session resumes rather than repeats extraction.
- [ ] Validate unique IDs, parent relationships, resolvable links and completeness of the enumerated containers. Visually inspect each actual screen/state at readable scale; record issues and render coverage without redesigning it.

Deliverable: refreshed dated inventory with explicit coverage and a list of unresolved classifications. Inventory complete does not mean prototype or app verified.

## Task 2 — Reconstruct the flow graph from evidence

- [x] Capture reactions for every inventoried screen/state, including nested controls, component interactions, hidden controls, overlays, conditional branches and ordered actions.
- [x] Resolve referenced targets and variables; preserve unresolvable IDs as findings. Differentiate prototype wiring from documented intended behavior and visual inference.
- [x] Identify entry/exit points and actor-specific success, rejection, cancellation, retry and return paths. Record disconnected screens, dead ends and alternative generations without deleting or fixing them.
- [x] Reconcile canonical candidates against dated decisions. Mark uncertain choices for founder review rather than silently selecting one.
- [ ] Extend the existing validator with representative nested, hidden, conditional, multiple-action and unresolved-target fixtures before changing its extraction assumptions. Validate the full graph; manually exercise critical prototype paths for each actor and record what was actually tested.

Deliverable: searchable connection map with observed wiring, intended-but-unwired paths and unresolved decisions clearly separated.

## Task 3 — Map designs to the actual app

- [x] Enumerate current Expo routes, route aliases/redirects, shared components and conditional screen states. Read the implementation, not just route filenames.
- [ ] Map every design to zero, one or multiple route/state combinations as appropriate; also list app screens with no verified Figma reference.
- [ ] Compare each mapped screen visually and inspect key interactions. Use owned local QA fixtures; do not trigger real financial operations or infer backend capability from a screen.
- [x] Give separate statuses for designed, wired, implemented, visually verified and provider-integrated. Record generic replacements, partial flows and missing states with exact Figma links/code locations.
- [x] Prioritize findings by correctness/consent/security, broken navigation, design mismatch, then cosmetic issues. Propose restoration using existing designs; implementation is a separate task.

Deliverable: evidence-backed design-to-route matrix and prioritized restoration backlog. No app edits during the audit.

## Task 4 — Add searchable Figma reference notes

- [ ] Inspect free canvas space and create one clearly named audit/reference section outside original frames. Keep all new annotation nodes under this section and record their IDs.
- [ ] Add a compact top-level directory by product area, with direct links to flow starts and the repository audit entry point. Use existing typography/tokens where practical; annotations must look distinct from app screens.
- [ ] Add concise flow panels using consistent labels: Purpose, Actor, Entry, Screen IDs, Variants, Actual connections, Intended connections, App mapping, Open questions, Last verified.
- [ ] Link to original frames without duplicating screenshots as substitute designs. Use readable flow summaries rather than hundreds of overlapping connector lines. Do not attach prototype actions to product controls for navigation of the audit.
- [ ] Verify links, readable text, placement and section containment through metadata and renders. Confirm original screen bounds, source-instance links and reaction hashes are unchanged.

Deliverable: a human- and agent-readable directory that can be deleted as one isolated section, with original screens untouched.

## Task 5 — Validate and hand off the living reference

- [ ] Refresh `APP_FLOW_MAP.md` and the existing explorer's entry point to the new snapshot. Retain historical evidence and explicitly mark superseded assertions.
- [ ] Validate schema/counts, IDs, local links, graph references, app source paths and annotation targets. Report visual/prototype/app verification coverage independently; do not call partial work complete.
- [ ] Audit samples across all flow families for correct mapping; ensure every identified screen has a purpose/status or an explicit unresolved classification.
- [ ] Report findings, canonical-version decisions requiring input, implementation gaps, annotation section link, source commit/date and rollback manifest.
- [ ] Commit the coherent audit/documentation results on a focused branch, exclude secrets/test-user data, and include validation/rollback details in the review. Do not auto-merge.

## Ongoing maintenance rule

Before future UI work, consult the register and verify the relevant nodes live. Record the references used before building. After a design or route changes, update its affected records, edges, verification date and Figma notes in the same task. A removed/replaced node gets a retained historical record and replacement pointer, not an unexplained disappearance. Approval to implement a feature does not excuse skipping this lookup.

## Risks and rollback

The main risks are stale evidence, tool limits, overly dense annotations, incorrect canonical choices and accidental source changes. Mitigate them with resumable checkpoints, measured coverage, isolated notes and explicit unknowns. No money movement, schema, provider, authorization or consent changes are included. Remove only the newly created annotation section to roll back Figma notes; revert the audit-documentation commit to restore repository references. Preserve original designs and historical snapshots.
