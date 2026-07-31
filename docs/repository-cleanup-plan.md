# Repository Cleanup Plan

This is a staged organization plan. It does not authorize moving or deleting files.

## Principles

- Prefer navigation and ownership improvements over physical moves.
- Preserve paths referenced by package scripts, generated reports, provenance, and ignored private tooling.
- Never move private or evidence directories into executable implementation paths.
- Every cleanup step must be previewed with `git status`, `git ls-files`, and reference searches.

## Current classification

### Active implementation

- `Frontend/demo-map/`
- `Middleware/runtime-compat/`
- `Backend/local-player/`
- `preservation-dump/`
- `tools/`

### Evidence and historical inputs

- `origin/`
- `mudb/`
- `dao3-docs-mirror/`
- `dump/`

### Catalogs, documentation, and local-only material

- `works/`
- `Docs/`
- `Docs/zh/`
- `.workspace/`
- local reference worktrees
- `NEA-Project.7z`

## Phased cleanup

### C0 ? Navigation first

Status: started

- Add root `AGENTS.md`.
- Use `Docs/project-progress.md` as the active status source.
- Keep `HANDOFF.md` as handoff/history, not a live task board.
- Add AI context and task templates under `Docs/ai/`.

### C1 ? Audit references before moves

Status: audited on 2026-07-31. No moves approved.

Findings:

- Root-level package and evidence directories are referenced by README, handoff documents, package scripts, generated reports, and provenance notes.
- `HANDOFF.md`, `NEXT_AGENT_HANDOFF.md`, and `NEXT_AI_PROMPT.md` are operator handoff files, not public implementation sources.
- `NEA-Project.7z`, `.workspace/`, local reference worktrees, `dump/private/`, and `works/private/` are local/private boundaries.
- `Frontend/demo-map/`, `Middleware/runtime-compat/`, `Backend/local-player/`, `preservation-dump/`, `Docs/`, and `tools/` already have clear documented responsibilities.

The following inventory remains the prerequisite for any future move:

- package scripts and import paths;
- generated report locations;
- provenance references;
- `.gitignore` and `.gitattributes` rules;
- ignored/private folders and archive boundaries;
- duplicate or stale documentation.

Decision: do not physically move directories during the current runtime milestone unless an owner explicitly authorizes a bounded, audited exception. On 2026-07-31, two local external reference worktrees were removed after their protocol declarations and custom schemas were recreated as neutral recovered evidence under `Middleware/runtime-compat/evidence/`. Continue with documentation deduplication and package-local audits only.

### C2 ? Reduce root noise safely

Candidate actions after the audit:

- keep only repository-level policy, README, license, handoff, and archive files at root;
- move only clearly unreferenced public notes into `Docs/`;
- never move `NEA-Project.7z`, private folders, or reference worktrees;
- update links and scripts in the same change.

### C3 ? Package-local organization

Before C3 begins, C2 requires documentation-only changes to be reviewed. No directory move is approved. The untracked `Docs/work-summary-2026-07-31.md` remains an open provenance review item and must not be deleted automatically.

For each active package, keep a predictable shape:

```text
src/   test/   Docs/   tools/   generated/   package.json
```

Only normalize a package when the change is isolated and its tests/imports are understood.

### C4 ? Archive and ownership review

- Mark stale experiments as archived in documentation before deleting anything.
- Separate generated output from hand-authored source.
- Record provenance for evidence rather than duplicating files.
- Review public/private boundaries before any commit or push.

## Definition of done

- No executable path changes without reference audit.
- No private or ignored material is staged.
- README and repository layout agree with the tree.
- Each active directory has a clear owner and validation command.
- Cleanup reduces ambiguity without changing runtime behavior.

## External-reference detachment

The local workspace contains an external bypass/reference project whose names and paths must not remain part of scripts, implementation code, or public project language.

Required migration:

1. Inventory every reference in scripts, source, generated reports, manifests, and documentation.
2. Replace script imports and hard-coded paths with a neutral in-repository evidence path or an explicit environment/configuration input.
3. Rebuild copied protocol/schema fixtures from approved evidence; do not copy external project source wholesale.
4. Regenerate ABI and evidence reports so stale provenance paths disappear.
5. Rewrite public documentation using neutral evidence classifications.
6. Keep the external workspace local and ignored until migration is complete; do not delete it before all required evidence has been rebuilt and validated.

Current known direct script dependencies:

- `Backend/local-player/tools/scan-abi.mjs`
- `Backend/local-player/tools/scan-runtime-abi.mjs`

Direct script references were removed on 2026-07-31. The ABI scanner now uses `NEA_PROTOCOL_EVIDENCE_PATH` or the neutral project path `Middleware/runtime-compat/evidence/recovered-player-protocol.ts`.

An owner-authorized cleanup on 2026-07-31 recreated recovered Player protocol declarations and custom schemas under `Middleware/runtime-compat/evidence/`, updated the ABI scanner to use the neutral evidence path, and removed the local external worktrees. Generated reports that retain earlier provenance remain `recovered-only` until they are regenerated from the neutral evidence set.

Current known generated-output dependencies:

- `Middleware/runtime-compat/abi/`
- `Middleware/runtime-compat/generated/`

This migration is a prerequisite for C3 package-local organization.

## Maintainability refactor sequence

The repository must be cleaned in this order:

1. Classify generated/data/evidence files so large artifacts are not mistaken for business-code debt.
2. Extract pure helpers and boundary adapters from `Backend/local-player/backend/box3-server.cjs`.
3. Move protocol parsing, session/bootstrap handling, runtime bridge handling, and diagnostics behind separate modules.
4. Add focused tests at each seam before moving the next responsibility.
5. Remove compatibility aliases only after all callers and generated reports use the rebuilt local evidence paths.

Do not perform a whole-file rewrite or a directory move as the first refactor step.
