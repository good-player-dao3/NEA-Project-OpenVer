# Contributing to NEA Project OpenVer

Thank you for helping preserve and implement an evidence-first DAO3 compatibility path. This repository is public, source-available work: contributions must improve the runnable compatibility path without exposing private captures, accounts, maps, or browser data.

## Start Here

Read these documents before opening an issue or changing code:

1. [Repository layout](Docs/repository-layout.md) for ownership and validation by directory.
2. [Open-version policy](Docs/open-version.md) for publication and privacy limits.
3. [Project progress](Docs/project-progress.md) for the active milestone and current tasks.
4. [Development backlog](Docs/development-backlog.md) for evidence-backed next work.
5. [Architecture governance](Docs/architecture-governance.md) for module boundaries and multi-model rules.
6. [Cold-start guide](Docs/cold-start.md) to run the complete public runtime.

The goal is a real recovered map running through this explicit path:

```text
project package -> client/server Script Runtimes -> MuDB transport -> authoritative runtime -> Player client
```

Do not add a parallel Player implementation, Script Runtime, or undocumented transport path when an existing layer owns the behavior.

## Choose and Scope Work

Before implementation:

1. Check the active tasks in `Docs/project-progress.md`; do not start work that conflicts with a listed owner or task scope.
2. Open an issue or discuss the task with maintainers before a large feature, API surface, evidence migration, or refactor.
3. Assign one lead contributor or agent; other models are supporting reviewers unless a maintainer explicitly changes that role.
4. State one task ID, the allowed paths, the observable acceptance criteria, and the focused validation command.
5. Find direct local evidence before changing compatibility behavior. Valid source classes include reviewed documentation, declarations, historical bundles, recorded transport, preserved runtime code, and real script usage.
6. Record an evidence gap when the evidence does not establish behavior. Do not replace unknown historical behavior with a plausible default.

For AI-assisted work, start from [the task template](Docs/ai/task-template.md). Development plans, task descriptions, diagnostics, and handoff notes intended for other contributors must be written in English.

## Contribution Types

### Runtime and compatibility changes

- Keep client Script Runtime, server Script Runtime, MuDB transport, authoritative runtime, and Player bridge changes separate and explicit.
- Prefer the smallest root-cause change that has a concrete acceptance condition.
- Add or update focused conformance coverage next to the affected runtime package.
- Regenerate deterministic ABI and report artifacts under `Middleware/runtime-compat/` when their generator inputs or mappings change. Never hand-edit generated reports.
- Mark behavior honestly as `compatible`, `partial`, `recovered-only`, `declared-only`, or evidence-deferred when appropriate.

### Evidence and fixture changes

- Keep evidence, generated reports, and executable implementation separate.
- Include the source class, provenance, redaction status, public/private status, and reproducibility limits in fixture metadata or the related documentation.
- A declaration can establish a member name or signature; it does not prove unobserved engine behavior.
- Rebuild neutral in-repository evidence instead of importing external worktree paths, bypass-project names, dependencies, or private source.

### Documentation changes

- Keep repository-wide engineering documentation in English under `Docs/`.
- Put Chinese user-facing guidance only under `Docs/zh/`.
- Update links, task status, validation commands, and architecture facts when a merged change makes them stale.

## Branches and Commits

For public contributions, fork the repository, branch from the current public integration branch (`main`), and open a pull request back to it. Use a short descriptive branch name, such as `fix/remote-channel-delivery`, `docs/contribution-workflow`, or `evidence/contact-binding-inventory`.

Keep one logical change per pull request. Use a concise conventional-style commit subject consistent with the project history:

```text
fix: preserve directed remote delivery
docs: clarify public evidence review
test: cover client input event dispatch
```

Avoid force-pushing after review begins unless a maintainer asks. Do not merge, rebase, reset, clean, change remotes, or publish releases on behalf of the project without explicit maintainer approval.

## Validate Before a Pull Request

Run the narrowest relevant check first. Package ownership and validation commands are listed in `Docs/repository-layout.md`; common commands include:

```powershell
node tools/build-mudb.mjs
npm --prefix Frontend/demo-map run validate
npm --prefix Frontend/demo-map run test:control-bridge
node --test Middleware/runtime-compat/test/recovered-player-protocol.test.mjs
```

Run broader package tests only when the task needs them or a maintainer requests them. Report every command actually run and any unrelated pre-existing failure; do not fix unrelated failures in the same pull request.

Before requesting review:

- Inspect `git status --short` and the complete diff.
- Run `git diff --check`.
- Confirm changed paths are inside the declared scope.
- Confirm no generated artifact was edited by hand.
- Confirm evidence classifications and limitations are preserved.

## Open a Pull Request

Use a clear title and include the following in the PR description:

```text
Task ID: [RT-000]

Goal:
- [observable user or runtime outcome]

Scope:
- [changed directories or files]

Evidence:
- [source class and what it establishes]

Compatibility impact:
- [compatible, partial, recovered-only, declared-only, or evidence-deferred]

Validation:
- [command]: [result]

Risks and follow-up:
- [remaining limitation or one concrete next task]
```

Reviewers check layer ownership, evidence provenance, privacy, test coverage, generated artifacts, patch persistence, and semantic compatibility. A passing CI job does not prove historical behavior that has no evidence.

## Report an Issue

Use issues for reproducible public bugs, evidence gaps, documentation errors, and bounded feature proposals. Include the runtime side, affected API or behavior, expected and actual result, public reproduction steps, logs with secrets removed, and the smallest relevant environment details.

Do not open a public issue for credentials, browser profiles, cookies, OAuth data, passwords, session tokens, token-bearing URLs, private maps, private script source, or private captures. If a disclosure requires private handling and no private reporting channel is configured, ask a maintainer for a secure channel without including the sensitive material.

## Never Submit

- Browser profiles, cookie stores, OAuth data, passwords, session tokens, or token-bearing URLs.
- `Evidence/dump/private/`, `Evidence/works/private/`, local reference worktrees, `.workspace/`, `NEA-Project.7z`, or private map and script source.
- Large rebuilt outputs that can be deterministically regenerated unless an existing policy explicitly tracks them.
- Guessed historical behavior, fabricated assets, or evidence whose publication status is unclear.

## Maintainer Notes

Maintainers should keep `Docs/project-progress.md` limited to active work and update `Docs/development-backlog.md` only after a task outcome or evidence classification is verified. Keep public integration changes auditable against the OpenVer policy before merging or releasing.
