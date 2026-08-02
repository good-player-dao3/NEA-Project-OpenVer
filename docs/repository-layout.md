# Repository Layout

This repository contains executable compatibility code alongside historical preservation evidence. The existing top-level directories are retained because package scripts, generated reports, and evidence records reference their paths directly. Repository cleanup therefore means improving navigation, ownership, and publication boundaries?not moving evidence blindly.

## Active implementation

| Path | Responsibility | Validation |
| --- | --- | --- |
| `Frontend/demo-map/` | Map importer, server Script Runtime, demo project, client script publication, physics prototype | `npm --prefix Frontend/demo-map test` |
| `Middleware/runtime-compat/` | Machine-readable API/ABI, evidence generators, compatibility reports, conformance tests | `npm --prefix runtime-compat test` |
| `Backend/local-player/` | Recovered Player hosting, compatibility backend, launchers, Player-side adapters | `npm --prefix local-player test` when applicable |
| `Evidence/preservation-dump/` | Live capture and editor export tools | Individual `node --check` and self-tests |
| `Evidence/works/` | Local catalog for recovered works and import-development fixtures | Private work contents remain ignored |
| `Docs/` | Repository-wide layout, architecture, architecture governance, cold-start guide, open-version policy, progress, development backlog, cleanup, and AI context | Documentation review |
| `tools/` | Small Windows-safe maintenance helpers | Tool-specific checks |

New executable behavior should normally belong to one of these directories. Do not create another runtime or Player implementation at the repository root.

## Preserved evidence

| Path | Classification | Rules |
| --- | --- | --- |
| `Evidence/dao3-docs-mirror/` | Public documentation mirror | Regenerate through its existing tools; do not hand-edit generated pages without recording why. |
| `Evidence/origin/` | Recovered server/runtime evidence | Evidence only; do not make it the new architecture. |
| `Shared/mudb/` | Historical transport source | Preserve upstream structure and local provenance. |
| `Evidence/dump/` | Vetted recovered assets and private live captures | Never commit `Evidence/dump/private/`; audit new public assets before tracking. |

Ignored local reference worktrees are operator-only material, not part of the OpenVer repository contract. Never publish or commit them. Any evidence needed from them must be rebuilt into neutral, reviewed project fixtures.

## Generated and local output

- Commit compatibility reports under `Middleware/runtime-compat/generated/` when they are deterministic outputs used by review or tests.
- Keep demo build output under `Frontend/demo-map/build/`; it remains ignored and rebuildable.
- Keep logs, PID files, and operator output under `.workspace/`; the directory remains ignored.
- Keep the user-owned `NEA-Project.7z` at the root and ignored. Never modify, delete, unpack over the repository, or commit it.
- Keep browser profiles, cookies, OAuth tokens, private maps, and token-bearing URLs only in their existing ignored private locations.
- Keep recovered work exports under `Evidence/works/private/<work-id>/`; retain their original capture paths as immutable provenance.
- Keep public repository policy under `Docs/open-version.md`; use it before pushing to the OpenVer remote.

## Naming rules

- Use `Docs/` for repository-wide documentation.
- Use each package's own `Docs/`, `test/`, `tools/`, and generated-output conventions for package-specific material.
- Do not add vague root directories such as `new`, `backup`, `temp`, or `final`.
- Name evidence by source and purpose; name implementation by runtime responsibility.

## Workspace cleanup

Preview transient log collection:

```powershell
.\tools\organize-workspace.ps1
```

Move only root-level transient files from the repository root, `Frontend/demo-map/`, and `Backend/local-player/` into `.workspace/logs/`:

```powershell
.\tools\organize-workspace.ps1 -Apply
```

The helper does not recurse, delete files, touch private captures, or move source and evidence directories.
It also skips `Frontend/demo-map/` or `Backend/local-player/` when an active process references that directory and leaves individually locked files in place. Stop the relevant service before collecting those logs; `-IncludeActiveLocations` is available only for deliberate manual overrides.

## Project management

- Use `Docs/project-progress.md` as the active task board.
- Use `Docs/development-backlog.md` for the evidence-backed public work order; do not treat it as a live ownership board.
- Use `Docs/architecture-governance.md` as the source of truth for module boundaries, architecture review classes, and multi-model collaboration.
- Use `Docs/repository-cleanup-plan.md` before proposing any directory move.
- Use `Docs/ai/project-context.md` and `Docs/ai/task-template.md` for bounded AI-assisted work.
- Use `Docs/ai/token-efficiency.md` and `tools/summarize-output.ps1` to keep AI context and diagnostics small.
- Use `Docs/ai/code-quality.md` and `tools/check-maintainability.ps1` for maintainability review.
- Keep `HANDOFF.md` and `NEXT_AGENT_HANDOFF.md` as local handoff context rather than daily progress boards.
- Use `Docs/zh/` for Chinese explanations and user-facing project guidance.
