# GitHub security checks

Configured October 15, 2026 for `Jshack05/Potluck`.

## Enabled repository settings

- Dependabot vulnerability alerts and security update pull requests.
- Secret scanning and push protection.
- CodeQL default setup for JavaScript/TypeScript, extended query suite, GitHub-hosted runner and weekly scanning.
- Automatic merging remains disabled. Security update proposals still require review.

The first CodeQL setup run succeeded: <https://github.com/Jshack05/Potluck/actions/runs/38798033043>. A successful scan run does not mean zero alerts. It reported two weak-randomness alerts in the old browser prototype (`index.html:1093,1096`, source `uid()` at line 483). Those IDs select same-browser mock users; they are not the current API's cryptographic bearer tokens. Keep scanner alerts visible until their dispositions are reviewed. Secret scanning returned no open alerts at setup; that is not a guarantee against unsupported secret formats.

## Versioned checks in this change

| Check                        | Behavior                                                                                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency review            | Pull requests fail when newly introduced dependencies have moderate-or-higher known vulnerabilities, including development dependencies. No advisory suppressions or PR comments. |
| API/domain and mobile audits | Independent lockfile audits on PRs, main pushes, weekly schedule and manual dispatch. Moderate-or-higher failures stay visible. No package installation or project scripts.       |
| Website audit                | Independent pnpm lockfile audit with the website's existing high threshold. Uses pinned pnpm 10.33.1; no application installation/build.                                          |
| Dependabot version updates   | Weekly proposals for the root npm workspace, mobile, website and GitHub Actions. Five open version-update PRs per ecosystem/directory.                                            |

Actions are pinned to verified upstream commit hashes, use read-only repository permissions, disable checkout credential persistence and require no repository secrets. They run on ordinary `pull_request`, never privileged `pull_request_target`. No automatic merge, alert dismissal, package ignore or weakened audit threshold is configured.

## Branch coverage matters

At setup, `main` is still the initial static prototype (`c3a8924`); the current integrated app is on the unmerged development stack. The local Codex Security scan targets integrated-app revision `deb1d35`, not `main`. GitHub's empty Dependabot alert list on the old default branch does not clear the app's dependencies.

This configuration is stacked on dependency-remediation PR #9. Pull-request workflows can be exercised on this PR; scheduled/default-branch workflows and the Dependabot configuration need human-reviewed integration into `main`. CodeQL default setup must then be verified on the integrated app. Do not add required status names to branch protection before the workflows exist and have produced those checks on the target branch. Recommended integration follow-up: require pull requests, dependency review and CodeQL results; require the full audits once the existing advisories are resolved. This change does not claim those merge requirements are already enforced.

## Findings requiring follow-up

- API/domain lockfile: zero advisory findings in the October 15 refresh.
- Mobile: 18 high package entries arise from two upstream advisories, `braces` GHSA-vfj7-8cjw-p6xm and `node-forge` GHSA-86w9-cpqp-85rv. No compatible published remedy was established in the prior remediation. `npm audit fix --force` proposes an incompatible Expo downgrade and must not be used as a blanket fix. See [dependency remediation](2026-10-15-dependency-audit.md).
- Website: `source-map-js` GHSA-68fv-2mgg-jv7q, through jsdom/css-tree, is high; the refreshed advisory now identifies `>=1.2.2` as patched. Update and verify that separate website dependency tree in a focused change.
- Hosted authentication/sign-out, least-privilege database-role separation and verified deployment TLS/storage/security headers remain release prerequisites. Local beta behavior does not establish production readiness.

These are separate from any first-party findings in the Codex Security report. Dependency scanner severity is not a claim that an internet attacker can reach every affected dependency through the app.

## Validation and rollback

YAML parsed successfully; action pins were verified against upstream refs/releases. Fresh lockfile audits pass for API/domain and fail for the documented mobile/website advisories. Remote [dependency review](https://github.com/Jshack05/Potluck/actions/runs/38799496779) passed. The [audit workflow](https://github.com/Jshack05/Potluck/actions/runs/38799496920) passed API/domain and failed mobile/website; job logs confirm the exact advisories listed above, with no setup failure. An independent configuration review found no remaining actionable issue after explicitly selecting runtime, development and unknown dependency scopes. No runtime application, schema, consent or money-movement code changes. The existing full application validation remains blocked by the known mobile audit, as documented in PR #9.

Rollback the versioned configuration through a reviewed revert. Repository toggles are separate from Git commits and should be changed explicitly in GitHub settings if ever required. Removing a workflow does not dismiss its alerts, erase audit history or revoke existing tokens.

References: [GitHub security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository), [dependency review action](https://github.com/actions/dependency-review-action), [CodeQL default setup API](https://docs.github.com/en/rest/code-scanning/code-scanning#update-a-code-scanning-default-setup-configuration).
