# Dependency security remediation

> Execute with the systematic-debugging, executing-plans and verification workflows. User has authorized implementation and testing; do not merge.

**Goal:** Fix published dependency vulnerabilities without breaking Expo 57 or concealing unresolved advisories.

**Architecture:** Preserve the current React/React Native/Expo SDK and all domain/API contracts. Update affected transitive packages, with a checked, repeatable CommonJS-to-ESM bridge only where required by Expo Router's existing query-string dependency.

**Scope:** Existing isolated integration worktree; focused branch from `06f327a`. No provider actions, database migrations, entitlement or UI changes. All users benefit from safer dependencies; this is core maintenance, with no acquisition/paywall mechanism. Measure resolved advisories and passing regression checks. Consent, authorization and financial sources of truth remain unchanged.

## Findings and tooling research

Fresh npm audit: backend 0; mobile 23 (3 moderate, 19 high, 1 critical). These are dependency graph entries arising from four underlying advisories. npm's force-fix suggestions downgrade Expo/React Native incompatibly and must not be used.

- shell-quote: fixed in 1.11.0+, update to current compatible 1.12.0.
- decode-uri-component: fixed in 0.5.0; ESM-only. query-string 7.1.3 currently calls the CommonJS module directly. A raw override is incompatible.
- braces 3.0.3 and node-forge 1.4.0: no published fixed release as of October 15, 2026. Inspect exposure and retain honest audit failures. Do not fork cryptographic validation or claim safety solely from development-tool placement.
- @expo/metro-file-map 57.0.4 removes its micromatch edge, but other Metro paths may remain.

Recommended foundation: GitHub Dependabot, CodeQL, secret scanning/push protection where the account supports them. Codex Security is an additional review option; Semgrep is an optional dedicated platform. Plugin suggestion is not installation or proof that scanning is enabled. External paid services/account permissions are not being configured in this dependency fix.

## Task 1: Compatible remediation

- [x] Add executable regression coverage for shell-quote comment/newline rejection and bounded malformed URL decoding through the real query-string consumer. Verify failures before updates.
- [x] Update shell-quote and @expo/metro-file-map within supported ranges. Pin decode-uri-component 0.5.0 under query-string 7.1.3 only.
- [x] Add an idempotent postinstall compatibility bridge for query-string's default import, guarded by exact version and file hashes. Unexpected source must fail closed. Test repeat installation and drift rejection.
- [x] Compare manifest/lock diff; no native SDK upgrades, force flags, audit suppression or unrelated package churn.

## Task 2: Verification and delivery

- [x] Prove clean-lockfile installation, npm dependency-tree consistency, Expo SDK compatibility, and targeted regression tests.
- [x] Run the full existing validate command: backend formatting/types/domain/integration; mobile lint/types/tests; iOS, Android and web exports; both dependency audits.
- [x] Restart the local app with the updated dependencies and smoke-test sign-in return routing, Card navigation/editing, and shared app tabs. Native device build/touch verification must be reported separately if unavailable.
- [x] Document remaining advisories, reachability evidence, package paths, rollback and exact commands. Keep full audit gate intact.
- [x] Review the diff, commit, push a focused draft PR, and leave it unmerged.

## Review focus

Malformed query strings must not hang; encoded return URLs and Unicode/plus/arrays must preserve semantics. ESM bridging must work in Metro and Node. A fresh npm ci must apply the same patch and reject upstream drift. Build tools remain an exposure even if omitted from exported bundles. Existing authorization/consent tests must still pass.

## Rollback

Revert this focused commit and reinstall from the prior lockfile; do not delete app data. That restores the previous dependency vulnerabilities, so rollback is for compatibility recovery, not a security fix.

## Execution result

Published fixes and regression coverage are implemented. Full validation passes all functional checks (58 backend, 147 mobile, three platform exports) but remains blocked by the two documented upstream advisories (18 high dependency entries). See ../../security/2026-10-15-dependency-audit.md for evidence, compatibility-check limitations and rollback. Independent review found no actionable issues. Delivery is a focused draft PR against the unmerged Card-editor branch; no merge is authorized.
