# Repository Layout

This repository contains both executable compatibility code and historical preservation evidence. The existing top-level directories are retained because tests, reports, and evidence records reference their paths directly.

## Active implementation

| Path | Responsibility | Validation |
| --- | --- | --- |
| `demo-map/` | Map importer, server Script Runtime, demo project, client script publication, physics prototype | `npm --prefix demo-map test` |
| `runtime-compat/` | Machine-readable API/ABI, evidence generators, compatibility reports, conformance tests | `npm --prefix runtime-compat test` |
| `local-player/` | Recovered Player hosting, compatibility backend, launchers, Player-side adapters | `npm --prefix local-player test` when applicable |
| `preservation-dump/` | Live capture and editor export tools | Individual `node --check` and self-tests |
| `works/` | Local catalog for recovered works and import-development fixtures | Private work contents remain ignored |

New executable behavior should normally belong to one of these directories. Do not create another runtime or Player implementation at the repository root.

## Preserved evidence

| Path | Classification | Rules |
| --- | --- | --- |
| `dao3-docs-mirror/` | Public documentation mirror | Regenerate through its existing tools; do not hand-edit generated pages without recording why. |
| `origin/` | Recovered server/runtime evidence and ignored external reference clones | Evidence only; do not make it the new architecture. |
| `mudb/` | Historical transport source | Preserve upstream structure and local provenance. |
| `box-go/` | Ignored duplicate/reference worktree | The preserved snapshot under `Lokibox/box-go` remains the evidence source. |
| `dump/` | Recovered assets and private live captures | Never commit `dump/private/`. |
| `Lokibox/` | Private local Player/runtime evidence | Never publish or commit this directory. |

## Generated and local output

- Commit compatibility reports under `runtime-compat/generated/` when they are deterministic outputs used by review or tests.
- Keep demo build output under `demo-map/build/`; it remains ignored and rebuildable.
- Keep logs, PID files, and operator output under `.workspace/`; the directory remains ignored.
- Keep the user-owned `NEA-Project.7z` at the root and ignored. Never modify, delete, unpack over the repository, or commit it.
- Keep browser profiles, cookies, OAuth tokens, private maps, and token-bearing URLs only in their existing ignored private locations.
- Keep recovered work exports under `works/private/<work-id>/`; retain their original capture paths as immutable provenance.

## Naming rules

- Use `docs/` for repository-wide documentation.
- Use each package's own `docs/`, `test/`, `tools/`, and generated-output conventions for package-specific material.
- Do not add vague root directories such as `new`, `backup`, `temp`, or `final`.
- Name evidence by source and purpose; name implementation by runtime responsibility.

## Workspace cleanup

Preview transient log collection:

```powershell
.\tools\organize-workspace.ps1
```

Move only root-level transient files from the repository root, `demo-map/`, and `local-player/` into `.workspace/logs/`:

```powershell
.\tools\organize-workspace.ps1 -Apply
```

The helper does not recurse, delete files, touch private captures, or move source and evidence directories.
It also skips `demo-map/` or `local-player/` when an active process references that directory and leaves individually locked files in place. Stop the relevant service before collecting those logs; `-IncludeActiveLocations` is available only for deliberate manual overrides.
