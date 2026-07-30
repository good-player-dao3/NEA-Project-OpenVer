# Contributing to NEA Project OpenVer

Thank you for helping preserve and implement the DAO3 runtime evidence base.

## Before You Change Code

1. Read [the repository layout](docs/repository-layout.md) and [the open-version policy](docs/open-version.md).
2. Find the existing runtime layer that owns the behavior. Do not introduce a parallel Player or Script Runtime.
3. Locate direct local evidence: documentation, declarations, historical bundles, recorded transport, preserved runtime code, or real script usage.
4. Record a compatibility gap instead of guessing when the evidence does not establish behavior.

## Change Boundaries

- Keep client Script Runtime, server Script Runtime, MuDB transport, and authoritative runtime changes separate and explicit.
- Prefer narrow, reviewable changes with a concrete acceptance condition.
- Regenerate affected ABI/report artifacts under `runtime-compat/` when source behavior or evidence mapping changes.
- Add or update conformance coverage next to the affected runtime package.
- Use `tools/apply_patch.ps1` for repository edits when working in the Windows workspace.

## Never Submit

- Browser profiles, cookie stores, OAuth data, passwords, session tokens, or token-bearing URLs.
- `dump/private/`, `works/private/`, `Lokibox/`, `.workspace/`, `NEA-Project.7z`, or private map/script source.
- Large rebuilt outputs that can be deterministically regenerated unless an existing policy explicitly tracks them.

## Evidence Contributions

State the source category and provenance in the changed documentation or generator metadata. A declaration alone may establish a surface name and signature, but it does not establish unobserved engine behavior.

## Validation

Run the narrowest relevant command first. The standard project checks are documented in the root README. Do not ?fix? unrelated failures as part of an evidence or compatibility change.
