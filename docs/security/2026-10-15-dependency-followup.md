# Dependency follow-up — October 15, 2026

## Scope and plan

Follow-up to [the initial remediation](2026-10-15-dependency-audit.md) and
[GitHub checks](github-checks.md), starting with the website:

1. Verify current advisories and actual dependency consumers.
2. Reproduce the website failure under time and memory limits, with a valid-input control.
3. Update only the affected transitive package, then run the complete website validation.
4. Independently review the patch and reassess the remaining mobile findings.
5. Publish a reviewable branch/PR without merging.

This maintenance protects the website development/build pipeline and its maintainers.
It introduces no user-facing feature, pricing, acquisition or conversion mechanism.
Safety remains part of the core product. The useful metric is unresolved validated
dependency advisories, alongside passing regression tests. No financial operations,
provider state, permissions, consent, database records or schemas change.

## Website: fixed

Updated `source-map-js` from **1.2.1 to 1.2.2** in `website/pnpm-lock.yaml`.
Both PostCSS and css-tree now resolve the fixed package. No direct dependencies,
application code or UI changed. An incidental Babel runtime update produced by the
package manager was excluded from the final lockfile.

- [Advisory GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)
- [Maintainer fix #79](https://github.com/7rulnik/source-map-js/pull/79)

The vulnerable parser consumes source-map input in the CSS build/test toolchain.
No visitor-controlled upload-to-parser path was found in the website application.
This limits the observed exposure; it does not justify retaining the vulnerable package.

`website/src/DependencySecurity.test.ts` resolves the real dependency copies used by
css-tree and PostCSS. Child processes have a three-second timeout and 128 MiB heap
limit. Tests cover excessive/invalid offsets, nested offsets exceeding the total
bound, large valid gaps, deeply nested source lookup, and ordinary indexed mappings
with preserved source contents.

Before the update, four security tests failed (including bounded heap exhaustion and
timeout); the valid-input control passed. After the update, all five pass.

### Validation

Using Node 24.19.0 and pnpm 10.33.1:

- Frozen-lockfile install succeeds.
- `pnpm validate` passes formatting, ESLint, TypeScript, production build,
  prerendering, **71 tests across 10 files**, and dependency audit.
- Website audit: **zero known vulnerabilities**.
- Existing tests include page hydration, route/404 HTTP responses, and interactive
  product demonstrations. No physical-device or new visual-browser claim is made.
- The first format check stopped because Windows `core.autocrlf=true` had converted
  committed LF files to CRLF. Restoring their original LF endings locally resolved
  it; no formatting rule or unrelated source file was changed in the Git diff.
- Backend audit refreshed: **zero findings**. Backend/mobile code and lockfiles are
  unchanged; their earlier test results are not represented as newly rerun tests.

## Mobile: still blocked by upstream releases

Current npm registry metadata still lists `braces@3.0.3` and `node-forge@1.4.0` as
latest. The mobile audit still fails with **18 high affected-package entries from
two underlying advisories**. These are unresolved findings, not accepted exceptions.

| Dependency | Evidence and remaining work |
| --- | --- |
| `braces` | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) has no published patched version. Metro's file watcher calls micromatch/braces with patterns generated from trusted configuration; filenames are match candidates. The upstream report uses Node 26.5.0. Bounded deep-pattern probes returned normally on Windows Node 24.19.0, so this environment did not reproduce stack exhaustion. This does not disprove the advisory or make the dependency safe across supported runtimes. A maintained fix or reviewed Metro matcher migration is needed. |
| `node-forge` | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) has no published patched version; [maintainer PR #1152](https://github.com/digitalbazaar/forge/pull/1152) remains open. A disposable-key test confirmed acceptance of an extra nested DigestAlgorithm element. Valid signatures passed and a wrong digest failed. Because the test used its own private key, this demonstrates malformed ASN.1 acceptance, not an independent signature-forgery exploit. Expo uses this library for certificate/signature verification and keychain parsing; replacing it requires security and compatibility review. |

No application-source imports of these two libraries were found. Tooling reachability
is narrower than a public financial API attack path, but remains relevant. No forced
Expo downgrade, custom cryptography patch, package version disguise, advisory
allowlist or reduced audit threshold was introduced. GitHub's mobile audit must
remain red until a verified remediation is available. A clean whole-repository
security result is **not** claimed.

## Reproduction and rollback

From `website`, run `pnpm install --frozen-lockfile` then `pnpm validate`.
From the repository root, run `npm audit` and `npm --prefix my-app audit`.
On this Windows machine npm is invoked through the existing local npm CLI runtime;
pnpm is invoked with `npm exec --yes --package=pnpm@10.33.1 -- pnpm`.

Reverting this focused commit and reinstalling the prior lockfile restores the old
dependency, including its vulnerability. No data rollback or migration is required.
Work remains unmerged and does not update a deployed website or running app checkout.
