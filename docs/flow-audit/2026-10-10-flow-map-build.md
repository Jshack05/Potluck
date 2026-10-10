# Shared screen graph build

Approved brief: turn the existing audit into a graph Joseph can review visually and a future implementation agent can traverse directly. Preserve exact Figma IDs, actor/state distinctions, capture dates, conditions, ordered actions and app-verification boundaries. Do not create or repair product screens, infer missing routes, or replace unresolved variants with invented authority.

Plan:
1. Derive a graph with explicit outgoing/incoming adjacency from the existing capture, and attach the 26 sampled journey records. Add meaningful tests for conditions, dynamic returns, external component targets and evidence separation.
2. Generate a self-contained clickable graph view plus editable FigJam journey diagrams. Keep the complete graph searchable by screen/family; keep large journeys separate so Joseph can inspect them.
3. Link the graph into the audit entry points, verify counts/links/rendering, review the changes, commit and push to the existing draft PR without merging.

This is audit tooling for Joseph and future builders, not a product feature, entitlement, transaction or provider integration. Financial/authorization behavior is unchanged. The source capture owns recorded wiring; user approval and product context own intended behavior; provider state cannot be inferred from either diagram.

## Progress

- Clean focused audit worktree confirmed at f56a2ca. Reuse existing capture rather than a competing inventory.
- Test-first graph contract written. Raw captured edges and recorded sequence links remain separate because the live journey notes are not complete click logs.
- Created [the separate FigJam map](https://www.figma.com/board/dixKHtlmlibkxTYuEvIBW9): six chapters, 26 sampled journeys, 122 linked screen occurrences, 96 sequence arrows and an overview. No original design frame or app route was changed.
- Added `flow-graph.json`, a derived adjacency graph over the existing capture; `graph-query.mjs` can search, inspect incoming/outgoing actions and find candidate captured paths. It preserves all 8,553 transition records, complete ordered reaction programs, hidden controls and conditions. Back/Close destinations remain dynamic. Source fingerprints detect stale evidence.
- Added the offline interactive graph, generated Mermaid sources and the shared review guide. The structured graph covers all 809 captured screen/state records and two external component states; the FigJam projection contains the 26 sampled journeys only.
- Updated `AGENTS.md`, `APP_FLOW_MAP.md` and the audit README so future builders start with graph traversal, then verify the current Figma screen and its authority. No product-scope decision changed.

## Verification

- 12 focused tests passed: six existing audit-data tests and six new graph/view tests. New coverage checks conditions, ordered actions, hidden controls, dynamic returns, external component targets, evidence separation, action-only controls and Previous-screen history.
- `validate-flow-graph.mjs` passed: all 809 records, 8,553 exact transition references, full reactions, 25 families, 26 journeys, embedded HTML data/script syntax, Mermaid sources, and recorded native FigJam endpoint/link mappings.
- `validate-flow-audit.mjs` passed its existing artifact checks and correctly continues to report `auditStatus: INCOMPLETE`.
- Formatting checked for the six new JavaScript modules. No dependencies, migrations, application routes, financial behavior or provider configuration changed.
- Native FigJam readback found 122 correct original-screen hyperlinks, 26 journey sections and no overflowing text nodes. Rendered Cards, Bills and the board overview were visually inspected. The first render exposed hidden arrows and missing visible journey IDs; both were repaired and the final screenshots rechecked. See `graph-previews/` and `figjam-map.json`.
- Independent review identified missing action-only controls in the viewer, a dropped failing-control ID, and a journey-selection history bug. Each was repaired; regression checks passed. The link validator initially compared two equivalent Figma URL encodings literally; it now verifies the exact file and normalized node identity.

## Limits and maintenance

The browser tool rejected local `file:` navigation. No alternate serving/upload workaround was attempted. Browser rendering and interaction of the standalone HTML remain unverified; offline logic tests and FigJam screenshot inspection are separately identified above. Full mobile/backend validation was not rerun for this documentation/tooling-only change.

This map preserves observed Figma evidence. It does not repair the recorded prototype problems, prove current app parity, execute conditional branches or record Joseph's approval. New Figma comments/edits do not automatically update repository data. Save explicit dated decisions separately, reconcile the board and captured graph, and verify the live counterpart before implementation.

Rollback: revert the graph tooling commit and delete/archive the separate FigJam board. Original product screens and dated audit evidence are unaffected. Native board IDs are in `figjam-map.json`. Publish on the existing audit branch and draft PR #3; do not merge automatically.
