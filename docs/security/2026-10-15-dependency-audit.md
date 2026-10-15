# Dependency security review — October 15, 2026

## Result

Published fixes applied without changing the Expo SDK, React Native, React or application contracts. Backend audit remains zero. Mobile audit reduced from **23 entries (1 critical, 19 high, 3 moderate) to 18 high entries**, arising from two upstream advisories with no published fixed release. **The security gate is still failing. This is not a clean-security or production-readiness claim.**

An audit entry is an affected package in the dependency graph, not necessarily an independent vulnerability. The initial 23 entries trace to four underlying advisories.

| Package | Before → after | Advisory / disposition |
| --- | --- | --- |
| shell-quote | 1.10.0 → 1.12.0 | [GHSA-pqg4-j6r4-53mv](https://github.com/advisories/GHSA-pqg4-j6r4-53mv): fixed upstream; comment-following newline tokens now throw. |
| decode-uri-component | 0.2.2 → 0.5.0 | [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr): fixed upstream; malformed input no longer hangs the tested query-parser path. |
| @expo/metro-file-map | 57.0.3 → 57.0.4 | Removes this package's micromatch dependency. Other Metro packages still require it. |
| braces | 3.0.3 unchanged | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): latest published version remains affected; [upstream issue](https://github.com/micromatch/braces/issues/73). |
| node-forge | 1.4.0 unchanged | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv): latest published version remains affected; [proposed upstream patch](https://github.com/digitalbazaar/forge/pull/1152) is still open. |

Only three installed package versions changed. No new library, native SDK upgrade, schema migration, provider operation, permission change or product feature was introduced. npm's `--force` suggestion would downgrade Expo to 44 and React Native to 0.72; it is not a compatible remediation.

## Decoder compatibility

Expo Router 57.0.24 requires query-string 7.1.3, which calls its decoder as a CommonJS function. The fixed decoder 0.5.0 exports an ES-module default. A version override alone breaks parsing.

The scoped override selects the genuine upstream 0.5.0 package. `my-app/scripts/patch-query-string.cjs`, run by postinstall, changes only query-string's import to use `.default`. It checks exact package version and SHA-256 before writing, accepts an already-patched hash, and fails on unknown source. It does not modify the security algorithm or disguise the installed version. No patching dependency is required.

Do not skip the app's postinstall. With a policy that disables lifecycle scripts, run `node my-app/scripts/patch-query-string.cjs` explicitly before testing/building. Remove the override and bridge when a supported Expo Router release natively uses a patched decoder; the source/version guard intentionally requires review when that consumer changes. Node 24 was used for validation; Node's ESM interoperability and Metro's module handling were exercised independently.

## Remaining exposure and follow-up

There are no direct imports of these vulnerable packages in Potluck's `my-app/src`, `packages` or `services` sources. That is narrower evidence than a complete reachability analysis and does not prove the packages harmless.

- **braces:** `expo / react-native → Metro → metro-file-map → micromatch → braces`. The installed Metro watcher code passes configured globs into micromatch. Deeply nested untrusted glob patterns can exhaust the stack. Expo's own updated file map no longer imports micromatch, but the legacy Metro paths remain installed. Do not feed untrusted patterns into build/watch configuration.
- **node-forge:** `expo → @expo/cli → node-forge` and `@expo/code-signing-certificates → node-forge`. The certificate helper actually calls certificate/public-key/CSR verification; therefore it cannot safely be replaced with a dummy package. Signature verification is security-sensitive even in developer tooling. No provider or backend financial signature path uses this dependency in the inspected source. Keep code-signing inputs trusted; obtain a maintained upstream fix before treating the gate as resolved.
- The proposed forge patch is unmerged. No bespoke crypto patch, third-party replacement, broad dependency alias, vulnerability allowlist, severity-threshold change or audit suppression was introduced.
- Follow-up: adopt reviewed fixed releases when available, or undertake a separately reviewed build-tool migration/backport with relevant upstream regression suites. These remain open blockers, not accepted exceptions. No monitoring automation was created.

## Verification

- Clean `npm --prefix my-app ci`: succeeds and applies the bridge. Running the bridge again returns `already patched`.
- New executable tests reproduce two pre-update failures: shell-quote accepted comment-following line breaks; malformed query parsing exceeded a 5-second subprocess limit. Both pass after updates.
- Four added tests cover unsafe shell tokens, normal encoded destinations/Unicode/plus/arrays, bounded malformed query decoding, and patch idempotence/source/version drift. No real shell payload is executed.
- Full `npm run validate`: **58 backend/domain tests and 147 mobile tests pass**; formatting, lint, types and iOS/Android/web exports pass. Backend audit passes; mobile audit fails with the 18 high entries above. The audit step and failure status are unchanged.
- Root dependency tree and targeted mobile tree pass. Full mobile `npm ls --all` reports missing Zod 4 under the external file-linked contracts package, although resolution from that package successfully loads root Zod 4.6.5, root `npm ls --all` is clean, and builds/tests pass. This is a graph-reporting limitation in this separate mobile/file-link layout, not proof that every dependency-tree check passes.
- Online Expo compatibility check recommends eight newer SDK-57 patch releases already outside this patch's unchanged direct dependency versions. Offline checking against the installed SDK's bundled recommendations passes, with Expo's explicit offline reliability warning. This does not establish compatibility with every newer patch release. Those broader native patch updates were not bundled into this targeted remediation.
- npm 12.2.0 clean install warned that unrs-resolver's dependency postinstall was blocked by its existing install-script policy; lint/types/builds still succeeded. No script-policy relaxation was made.
- Browser smoke tests on the restarted local server: sign-in with encoded returnTo → Cards; Card details → Edit; change name/design, save, reopen and confirm persistence; restore the synthetic fixture; Settings → Manage arrangement; Circles/Bills/Splitfinder tabs. Zero captured console errors. Existing require-cycle warning remains.
- No physical-device or signed native-build verification was performed. Exports and browser tests do not substitute for those checks.

Local evidence logs (ignored, not committed): `.local/security-{backend,mobile}-before.json`, `.local/security-mobile-after.json`, `.local/security-clean-install.log`, `.local/security-full-validation.log`.

## Recommended security integrations

Research checked October 15, 2026. These are recommendations, not claims that the services are configured or have scanned Potluck.

1. **GitHub security as the baseline:** Dependabot alerts/security-update PRs, CodeQL for JavaScript/TypeScript, and secret scanning/push protection where the repository plan supports them. Dependency review can additionally gate newly introduced vulnerable packages. These fit the existing GitHub repository and review workflow. [GitHub setup](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository), [Dependabot](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates), [CodeQL language support](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/).
2. **Codex Security as an additional review layer:** project-specific threat modeling, finding validation and proposed fixes. Installation/connection was suggested; no scan or confirmed installation occurred in this task. [Official overview](https://openai.com/index/codex-security-now-in-research-preview/).
3. **Semgrep as an optional dedicated platform:** custom rules and supply-chain reachability/prioritization. Its documentation distinguishes direct dependency reachability from transitive dependencies it cannot fully trace. [Supply Chain overview](https://docs.semgrep.dev/semgrep-supply-chain/overview).

Snyk is another dependency/code scanner with npm lockfile support, but duplicates much of that stack; its published TypeScript support needs checking against this repository's TypeScript 6 before adoption. [Snyk TypeScript support](https://docs.snyk.io/supported-languages/supported-languages-list/typescript). No paid service, new repository access or external code upload was configured. The connected GitHub plugin itself is not evidence that GitHub security features are enabled.

## Reproduction and rollback

Use the repository's supported Node runtime (tested Node 24.19.0) and npm (tested 12.2.0):

```text
npm ci
npm --prefix my-app ci
node --test my-app/tests/dependency-security.test.mjs
npm run validate
```

On this machine npm was invoked via `node .local/tooling/npm-cli/package/bin/npm-cli.js` because npm was not on PATH. Revert the focused change and repeat installs to restore prior behavior if needed; this also restores the fixed vulnerabilities. Preserve all app data and audit history. No database rollback is needed. Work stays on an unmerged branch based on the current Card-editor branch.
