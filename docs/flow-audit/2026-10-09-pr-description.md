# Prepared update for draft PR #3

Publication status: audit commit `ea8d554` was pushed and its remote SHA verified. Updating PR metadata through the GitHub connector returned HTTP 403 (`Resource not accessible by integration`). The browser is signed out of GitHub. The existing draft title/body therefore remain stale; the replacement below is saved for an authenticated update. No merge was attempted.

Suggested title: **Audit 809 Figma layouts and add removable flow directory**

---

The Figma file contains multiple generations and actor/state variants, making existing designs easy to overlook. This draft adds a searchable evidence-backed directory and app source mappings so implementation can reuse the correct designs.

## Current coverage

- All 809 captured screen/state records have readable source-layout reviews and captured reaction subtrees; 8,553 transition references are preserved.
- All records belong to 25 flow families. The continuation review board and its 22 entry links were also reviewed.
- A permanent Figma directory links every original from one removable section: https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2244-45190
- Eight sampled live prototype checks: four pass, two pass with scroll findings, one unwired Freeze failure, one cross-conversation blocking design inconsistency.
- Baseline source coverage: 55 Expo routes and 218 partial design correspondences. Later Cards revision c202144 received source-delta review, not runtime/visual acceptance.
- Five app visual comparisons remain historical. Full prototype branch coverage and current app/native parity remain incomplete.

## Findings

Freeze is drawn but unwired. The blocked Maya subscription conversation can lead to a housing conversation showing a composer. Some transitions retain scroll and obscure headings. Live Taylor permission limits retained $150 through pause/restore, disproving a suspected reset from static defaults. Existing resume/photo/delete/message-failure refinements were located, alongside stale names, prototype-only copy, calendar alignment issues and missing legal content.

No application behavior, authorization, consent, financial operation or schema changed. All 809 original screen subtree fingerprints match before/after note creation. All 118 note nodes are contained in the new section; no overflowing panel or escaped descendant was found.

## Validation and limits

- Six audit-tool tests, audit builder and current artifact validator passed.
- Checks cover graph projections, family assignments, source hashes, IDs, links, annotation targets, review-board links, preservation fingerprints and embedded explorer syntax.
- Staged whitespace and credential-pattern checks passed.
- Initial source-hash failures were Windows line-ending differences; tested normalization preserves detection of real code changes.
- App/provider tests and production exports were not rerun for this documentation-only change.
- Automatic approval review blocked local server startup and alternate offline-browser app review; those were not retried through another surface. No fresh app visual verification is credited.
- The Cloudflare deployment bot reported failure for both the previous checkpoint and ea8d554. Cause was not investigated in this Figma audit; deployment success is not claimed.

## Resume and rollback

Start with `docs/flow-audit/2026-10-09-findings.md` and `2026-10-09-checkpoint.json`. No source-layout records remain unreviewed. Continue untested actor/branch/return/failure journeys and current app comparisons; do not repeat complete extraction.

Figma rollback: delete only section `2244:45190`. Exact descendants are listed in `2026-10-09-annotation-manifest.json`. Do not delete original continuation screens/components/variables.

Repository rollback: revert `ea8d554` to undo the October 9 audit checkpoint, plus the subsequent publication-handoff documentation commit if needed. Earlier checkpoints are `5a58783` and `065c8fe` if the entire audit addition must be removed. No migration or app deployment needs rollback.

Base remains `codex/potluck-ui-stability`. Keep draft; do not merge automatically.
