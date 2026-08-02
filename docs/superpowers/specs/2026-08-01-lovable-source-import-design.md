# Lovable Source Import and Repository Layout Design

## Objective

Import the existing Lovable-generated Potluck interface into the GitHub repository as maintainable source code, preserve the original single-file prototype as a prior version, and establish GitHub as the authoritative source for future interface and database changes.

## Approved Repository Layout

```text
Potluck/
|-- AGENTS.md
|-- README.md
|-- apps/
|   `-- web/                 # Current Lovable-generated application
|-- docs/
|   |-- PRODUCT_CONTEXT.md
|   `-- superpowers/
|       `-- specs/
`-- legacy/
    `-- prototype-v1/        # Original front-end-only prototype
```

The redundant `potluck/` directory will be removed after its contents are moved to the repository root. `AGENTS.md` will move to the root so its rules govern the entire repository. `PRODUCT_CONTEXT.md` will move to the root `docs/` directory.

## Lovable Import

The Lovable project is a TanStack/TypeScript application rather than a standalone HTML file. Its exact source at Lovable commit `4681b32e00124e4ea4d2ce182369d1597c32e126` will be imported into `apps/web/`.

The import will preserve the generated source structure, package manifest, lockfile, formatting configuration, lint configuration, and `.lovable/project.json` metadata. Binary assets will be transferred without text conversion. The imported application will receive a short local README documenting its Lovable project ID, imported commit, setup commands, validation commands, and synchronization policy.

## Legacy Preservation

The current root prototype will be preserved under `legacy/prototype-v1/`. The snapshot will include the original `index.html`, `provider-adapter.js`, and `assets/` directory because those files form one working prototype. Its README will state that it is historical, front-end-only, and must not be treated as the current application.

After the snapshot is verified, the active root copies of legacy-only files will be removed to avoid two apparent application entry points. If repository documentation still needs to refer to provider-boundary concepts, those references will point to the legacy snapshot or current application documentation explicitly.

## Source-of-Truth and Change Flow

GitHub becomes authoritative after import. Normal interface changes will be made in `apps/web/`, validated locally, committed on focused branches, and reviewed through pull requests.

Lovable remains an optional design-generation source. A later Lovable change must be imported from a specific Lovable commit and reviewed as a source diff before it can replace local files. Local GitHub changes must never be overwritten blindly by a newer Lovable export. If both sources changed, the update is treated as a merge with conflicts resolved in Git.

Future database schemas and migrations will also live in GitHub. Live database state, deployment platforms, and visual builders must not become the sole record of a schema or application change.

## Import Integrity and Error Handling

The importer will enumerate the full Lovable file list at the pinned commit, read every text file, and obtain every binary file without altering its bytes. It will fail rather than silently skip an unreadable file.

A manifest will record the Lovable project ID, source commit, initial import timestamp, and imported file paths. Re-importing the same commit will preserve that timestamp and produce no source changes. Importing a different commit must be explicit and produce a reviewable Git diff.

Existing unrelated working-tree changes will remain untouched. Moves and additions will be scoped only to the approved repository layout and imported application.

## Documentation Updates

Repository references to `potluck/docs/PRODUCT_CONTEXT.md` will change to `docs/PRODUCT_CONTEXT.md`. Root documentation will explain:

- `apps/web/` is the current application.
- `legacy/prototype-v1/` is the preserved prior interface.
- `docs/` contains repository-wide product and engineering documentation.
- GitHub is authoritative for code, migrations, and schema history.

## Verification

The implementation is complete only after all of the following pass:

1. The imported file inventory matches the Lovable project inventory at the pinned commit.
2. A second dry-run import reports no differences.
3. Dependencies install using the imported lockfile.
4. Formatting, linting, type checking, tests, and the production build run successfully where scripts exist.
5. The imported application starts locally and its primary host and contributor routes render.
6. The legacy prototype still opens from `legacy/prototype-v1/index.html` with its relative assets and adapter available.
7. Repository documentation contains no stale `potluck/docs` paths.
8. No secrets, credentials, production data, generated dependency directories, or build outputs are added to Git.

## Out of Scope

- Redesigning the Lovable interface during the import.
- Adding a production backend or database.
- Publishing or deploying the imported application.
- Automatically maintaining two-way synchronization between Lovable and GitHub.
