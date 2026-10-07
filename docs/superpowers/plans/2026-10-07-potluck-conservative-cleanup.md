# Potluck conservative cleanup — October 7, 2026

## Scope and safety

Preserve observable behavior while removing proven-unused presentation code. The signed-in organizer and contributor keep the restored Circles, Cards, Bills, Goals and Splitfinder flows. Authentication, resource permissions, consent, integer money, state transitions, provider boundaries, audit records and data retention are unchanged. No provider action, dependency change, migration or product-scope change is part of this cleanup.

This is maintenance of the Free/core experience, not a new feature or entitlement. The existing promise remains: organize your people and shared plans, then connect banking when it is useful. Invitations support acquisition, recurring coordination supports retention, and connected arrangements distinguish Potluck from a passive tracker. Paid conversion is deferred. Existing creation-completion and invitation-acceptance metrics must not regress.

## Recovery point and baseline

- Worktree: `potluck-full-integration/Potluck`; the separate website checkout is untouched.
- Backup: `codex/backup-potluck-pre-cleanup-2026-10-07`, commit `ad93968a80e210a83909221c54a6383fa878b0d6`, pushed and verified before cleanup.
- Cleanup: `codex/potluck-conservative-cleanup-2026-10-07`; a review-only draft PR targets the backup branch to isolate this cleanup from the preceding restoration. Keep the backup unchanged. Before any later integration, retarget onto the approved integration branch containing the restoration. Do not merge automatically.
- Baseline: 47 backend/domain tests, 39 mobile tests, formatting, lint, strict types and iOS/Android/web exports pass. Backend audit is clean. The full gate fails only the existing mobile audit: 23 findings (19 high, 3 moderate, 1 critical). Dependencies and lockfiles remain unchanged.
- Backup history and staged snapshot were scanned with Gitleaks 8.30.1. The only reviewed false positive was the public Figma file identifier, not an authentication credential. Local environment files, databases, logs and scanner reports remain ignored.

## Findings and implementation batches

### 1. Remove the unused Expo starter island

**Locations:** `my-app/src/components/{animated-icon,app-tabs,external-link,hint-row,themed-text,themed-view,web-badge}`, `components/ui/collapsible`, `constants/theme`, `hooks/use-{color-scheme,theme}`, and their platform/CSS companions.

**Evidence:** the mobile entry is `expo-router/entry`; every one of the 55 `src/app` route/layout modules and every mobile test was treated as a root in an import/require graph, including side-effect imports and platform companions. These 16 files only refer to one another. No nonliteral dynamic module imports were found. Whole-repository searches found no external consumers, registrations, re-exports or configuration references outside this island. The package is private and has no public exports. The actual app uses `src/app/_layout.tsx` and `design/system.tsx`; it does not mount the starter Home/Explore tabs or splash overlay.

Remove the island plus the 14 unreferenced starter images: Expo badges/logo/glow, Home/Explore icons including density variants, React logos including density variants, and `tutorial-web.png`. Confirmed no references outside the deleted island, no public/static-directory publishing contract and no wildcard asset registration. Preserve the app icon, native adaptive icons, splash icon, favicon and `assets/expo.icon`, which are configured build inputs.

**Benefit/risk:** removes a competing navigation/theme implementation and obsolete sample graphics. Low regression risk after entry/config/asset checks. Preserve every route, including `/explore`, which remains a valid redirect/deep-link entry. Run mobile lint, types and tests after the batch; cross-platform export is the final asset-resolution gate.

### 2. Narrow the legacy Splitfinder UI module to its live primitives

**Location:** `my-app/src/features/splitfinder/ui.tsx`.

**Evidence:** its only consumers are `welcome.tsx` (`colors`, `Heading`, `Txt`) and `search-row.tsx` (`colors`, `Txt`). No namespace consumer, public package export, dynamic import or re-export uses the other declarations. `Screen`, `ListingCard`/`ServiceCard`, `MissingListing`, `Button`, `Panel`, `Note`, `Avatar`, the asset registry and their styles belong to a previous sample UI. The real routes use the active Potluck feature components and `design/system.tsx`.

Keep the three live exports, their import path, props, accessibility role and exact style values. Remove only the unused declarations and imports. Preserve the Splitfinder assets: some remain live and others are retained design/reference material.

**Benefit/risk:** the small module has one responsibility, the typography used by welcome/search, and no longer imports routing, preview data or an obsolete screen hierarchy. Low risk; no visual redesign or semantic unification with Potluck typography. Run affected checks and verify welcome/search in the browser before and after. Existing tests remain intact; do not add source-text assertions that merely mirror deletions.

### 3. Verify and review

Run `node scripts/validate.mjs` with `npm_execpath` pointing to the existing npm CLI. Distinguish the unchanged dependency-audit failure from functional results. Review all deletions and changed exports, check the route inventory and unchanged dependency/security/domain files, scan the final staged changes for secrets, and obtain a fresh-context branch review. Commit/push the reviewed cleanup and open a PR with evidence and rollback instructions. No automatic merge.

## Deferred findings

- `design/system.tsx` and `features/potluck/creation-menu.tsx` have a circular dependency. Separating low-level presentation primitives would improve layering, but defer until interaction coverage can characterize the shell/menu, context and navigation contracts before moving active code.
- `create/bill.tsx`, `create/goal.tsx` and `agreement/[id].tsx` are large stateful flows. Extracting steps without additional component-level coverage risks draft state, validation, consent and navigation. Do not fragment them solely by line count.
- Keep domain compatibility re-exports, API response placeholders, preview fixtures covered by tests and apparently unlinked file-based routes. They have compatibility or test consumers and are not proven dead.
- Keep `reset-project` and its README for now: it is a documented package command, not unused merely because application code does not import it. Recommend separately retiring this destructive starter workflow and updating mobile setup documentation.
- Keep dependencies, native configuration, website/prototype entry points and source/reference assets. Dependency remediation needs a separate compatibility-tested change; forced Expo downgrades are inappropriate here.

## Rollback

There are no migrations or data changes. Revert the cleanup commits in reverse order, or use the immutable backup branch in a separate worktree to recover the exact previous source. Rebuild/restart the app after reverting. Do not reset over user work, remove local data, or revert the earlier authentication/flow restoration as part of this rollback.

## Execution record

Implemented in two reviewable batches:

1. `2d347af`: remove the 16 unused starter files and 14 unused starter images listed above. Mobile lint, strict types (including unused locals/parameters), and all 39 mobile tests passed after this batch.
2. `37f9ac0`: remove unused declarations from the legacy UI module. The same mobile checks passed again. An AST comparison against the backup confirmed the three retained declarations and their two style entries are text-identical, apart from line endings.

All 55 route/layout source files are unchanged. So are the application services, backend/domain/contracts, tests, scripts, package manifests, lockfiles and native configuration. No tests were weakened or removed. No new source-text tests were added merely to assert that deleted code is absent: import/configuration proof, existing behavior tests, cross-platform exports and browser checks provide the relevant evidence for these low-impact deletions. The residual risk is an unknown consumer outside the inspected private app; there is no published package export or known external import contract for these files.

Final full validation used `node scripts/validate.mjs` with `npm_execpath` set to the existing npm CLI:

| Check                               | Before                  | After                                             |
| ----------------------------------- | ----------------------- | ------------------------------------------------- |
| Backend formatting and strict types | Pass                    | Pass                                              |
| Backend/domain tests                | 47 pass                 | 47 pass                                           |
| Mobile lint and strict types        | Pass                    | Pass                                              |
| Mobile tests                        | 39 pass                 | 39 pass                                           |
| iOS, Android and web exports        | Pass                    | Pass; 56 static routes                            |
| Backend dependency audit            | 0 findings              | 0 findings                                        |
| Mobile dependency audit             | 23 findings             | Same 23 findings: 19 high, 3 moderate, 1 critical |
| Full gate                           | Fails mobile audit only | Fails mobile audit only                           |

Browser verification used the existing local QA account: sign-in, search, clear search, category selection and sign-out worked. The welcome screenshot was byte-identical before/after; search screenshots visually matched, with the blinking text caret differing. No provider operations or real financial transactions were performed. This browser check does not substitute for a physical-device smoke test.

Staged scans for both code batches and the two-commit cleanup range passed Gitleaks with the reviewed Figma-identifier exception described above. Ignored redacted reports and validation logs remain local.

The independent fresh-context review found no Critical, Important or Minor issues. It examined all 219 tracked JavaScript/TypeScript files at the baseline, confirmed no surviving importer of any deleted file, and independently matched the retained declarations/styles against the backup. It also inspected baseline/final validation receipts rather than repeating the full export.

Review boundaries: physical-device rendering/accessibility remains unverified; platform exports establish bundling, not device behavior. Financial/provider readiness was not recertified: those implementations are unchanged, and their existing provider limits remain. Dependency remediation stays deferred and the audit failure remains a release blocker. These boundaries do not justify weakening the gate or claiming production readiness. The draft PR is for review only; do not merge into the backup branch.
