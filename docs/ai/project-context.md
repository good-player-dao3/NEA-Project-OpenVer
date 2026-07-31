# AI Project Context

**Updated:** 2026-07-31

## Mission

Make the evidence-first OpenVer repository run a real map with both client and server Script Runtimes through the preserved Player path.

## Architecture

```text
project package
-> client/server Script Runtimes
-> MuDB transport
-> authoritative runtime
-> preserved Player browser client
```

## Directory map

- `Frontend/demo-map/`: executable demo, importer, runtime integration, and validation.
- `Middleware/runtime-compat/`: ABI catalogs, reports, fixtures, and conformance tests.
- `Backend/local-player/`: Player hosting and compatibility backend.
- `preservation-dump/`: bounded capture/export tooling.
- `Evidence/origin/`, `Shared/mudb/`, `Evidence/dao3-docs-mirror/`, `Evidence/dump/`: evidence only.
- `Docs/`: governance, architecture, progress, and AI context.

## Current milestone

M1: real-map import and the client/server script loop.

## Current tasks

- RT-001: generate a sanitized real-map compatibility gap report.
- RT-002: implement one highest-value client remote-channel/UI slice after RT-001.

## Evidence policy

Do not invent behavior. Preserve uncertainty as `partial`, `recovered-only`, `declared-only`, or evidence-deferred. Private captures, credentials, browser state, private maps, and token-bearing URLs never enter tracked files.

## Working style

Inspect first. Change the smallest relevant surface. Add focused tests for runtime behavior. Do not perform broad refactors or directory moves during feature work. Do not run broad builds or tests unless requested.

For token efficiency, locate symbols before reading files, keep command output bounded, summarize logs locally, and do not repeat unchanged context.

## Output contract

Return only:

```text
Changed:
- ...

Validation:
- ...

Risks:
- ...

Next:
- ...
```
