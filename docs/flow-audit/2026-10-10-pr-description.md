The existing Figma file was difficult to navigate, and a screen's presence was being confused with a complete prototype or a matching app implementation. This audit adds a searchable source-backed directory and records design, wiring, source-code and runtime evidence separately.

Current checkpoint: 809 captured screen/state layouts reviewed, 8,553 transition references, 25 flow families, 26 sampled live prototype journeys, 55 baseline app routes read, 218 partial state correspondences, and five historical app visual comparisons. Full actor/branch coverage and current app/native parity remain incomplete. Eighteen new live checks expose actor-return, agreement-state, payment-state, Card appearance and Goal schedule inconsistencies; no product fixes are included.

Figma notes are isolated in section 2244:45190 with 809 links. All 809 original fingerprints matched before/after initial note creation. October 10 changes only existing coverage text 2244:45194 with unchanged geometry. App/provider code and original product-screen wiring are untouched.

Validation: six audit tests, audit builder/validator and git diff --check pass. The full backend/domain command passes 47/47 tests. Current app/native display, mobile exports and dependency audits were not rerun in this audit pass. Local server startup and alternate browser app verification were previously rejected by automatic approval review; those actions were not retried through another surface.

Read docs/flow-audit/2026-10-10-findings.md and 2026-10-10-checkpoint.json for exact journeys, remaining checks, uncertainties and evidence boundaries. Figma: https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2244-45190

Rollback: revert the audit commits for repository changes. Delete only Figma section 2244:45190 to remove the entire directory, using docs/flow-audit/2026-10-09-annotation-manifest.json. To undo only October 10's coverage update, restore the text from 2026-10-10-directory-update.json. No schema migration, app deployment or financial-state rollback is involved. Keep this PR a draft; do not merge automatically.
