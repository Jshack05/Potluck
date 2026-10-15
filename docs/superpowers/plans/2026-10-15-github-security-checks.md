# GitHub security checks implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement and verify this configuration.

**Goal:** Detect leaked secrets, vulnerable dependencies and unsafe code without automatically merging changes.

**Architecture:** GitHub repository settings enable Dependabot alerts/security PRs, secret scanning/push protection and extended CodeQL default setup. Versioned workflows add dependency review and independent lockfile audits. Weekly Dependabot updates cover each package-manager root and Actions.

**Tech stack:** GitHub Actions, Dependabot, CodeQL, npm and pnpm.

**Spec:** Joseph's October 15 request to install Codex Security, configure recommended GitHub checks, scan Potluck and report needed fixes; no automatic merge.

## Constraints and impact

This protects all users through developer security checks; it adds no product feature, acquisition mechanism, subscription gate, permission, consent, provider operation or money movement. Safety is core/Free infrastructure. Measure time to resolve validated alerts and vulnerable changes prevented. No migration. Roll back workflow files through a reviewed revert; change repository settings separately if needed. No app dependencies are added. Existing vulnerability failures must remain visible.

## Work

- [x] Inspect repository settings, branch state and current official GitHub documentation.
- [x] Enable and read back supported GitHub protections; leave auto-merge disabled.
- [x] Add `.github/dependabot.yml` for root workspaces, mobile, website and Actions.
- [x] Add read-only, SHA-pinned dependency review and audit workflows. Do not run untrusted PR code with write permissions or secrets.
- [x] Validate YAML and exact Actions refs; exercise the checks on draft PR #10. Dependency review/API audit passed; mobile/website audit failures match known advisories.
- [x] Record enabled versus pending protections, scan scope, known advisories and rollback guidance in `docs/security/github-checks.md`.

## Review focus

GitHub `main` is still the initial prototype. This configuration is stacked on the current integrated app and needs human-reviewed integration into the default branch before scheduled/default-branch checks cover the app. Keep backend/mobile/website lockfiles separate. Audit jobs must fail independently without hiding other results. Dependency review must cover development dependencies too. Do not add permanent ignores for unpatched vulnerabilities. Scan source remains at immutable `deb1d35`; configuration work uses a separate worktree.
