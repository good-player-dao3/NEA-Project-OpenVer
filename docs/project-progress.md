# Project Progress

**Updated:** 2026-07-31  
**Branch:** `beta`  
**Source of truth:** this file for active work; `HANDOFF.md` for historical handoff context.

## Project outcome

Run a real recovered map locally through the layered path:

```text
project package -> client/server Script Runtimes -> MuDB transport -> authoritative runtime -> Player client
```

The project must remain evidence-first: unknown historical behavior is reported rather than guessed.

## Operating rules

- `Now` contains at most two tasks.
- Every task has an ID, scope, acceptance criteria, and blocker.
- Private captures and source remain local and ignored.
- Generated reports are committed only when deterministic and safe to publish.
- A task is complete only when its focused validation passes or the remaining gap is explicitly documented.

## Milestones

### M0 ? Repeatable local start

**Status:** Mostly complete

Evidence: root `README.md`, `Docs/cold-start.md`, recent runtime/bootstrap commits.

Remaining: keep startup instructions and generated capability reports aligned with implementation.

### M1 ? Real-map import and gap report

**Status:** Now

Outcome: derive a sanitized real-map ABI usage report, compare it with `Middleware/runtime-compat/abi/current-runtime.json`, and import the core public structure of `project.json` without leaking private data.

### M2 ? Client/server script loop

**Status:** Next

Outcome: client UI, client-to-server events, server-to-client events, directed delivery, and broadcast delivery are proven by conformance fixtures and a visible `demo-map` behavior.

### M3 ? High-value gameplay compatibility

**Status:** Later

Order: remote channel edge cases, UI/input, world events, entity lifecycle, voxel/storage behavior, player state, then collision and physics replication.

### M4 ? Public release hygiene

**Status:** Later

Outcome: deterministic reports, sanitized fixtures, documented limitations, and an auditable public/private boundary.

## Now

### [RT-001] Generate the real-map compatibility gap report

**Owner:** current agent  
**Scope:** `Middleware/runtime-compat/`, sanitized report output only  
**Acceptance:** compare real-map API usage with the current ABI; classify missing behavior; do not copy private script source or payloads.  
**Blocker:** private usage data must be inspected locally and redacted before publication.

### [RT-002] Select one client remote-channel/UI slice

**Owner:** after RT-001  
**Scope:** one runtime path plus focused tests and demo proof  
**Acceptance:** one client/server behavior is implemented, tested, and visibly exercised in `demo-map`.  
**Blocker:** depends on RT-001 priority ranking.

## Next

- [IMP-001] Map core recovered `project.json` fields into the public import format.
- [RT-003] Add bidirectional remote-channel conformance fixtures.
- [RT-004] Add directed and broadcast server-to-client event coverage.
- [UI-001] Prove client-script-owned UI creation and input handling.
- [QA-001] Add a sanitized end-to-end real-map smoke fixture.

## Blocked / deferred

- Full physics and posture compatibility: insufficient evidence for safe implementation.
- Full historical API completion: not prioritized without real usage evidence.
- Player rewrite: explicitly deferred; extend the existing bridge incrementally.
- Repository-wide directory moves: deferred until references, ignore rules, and provenance are audited.

## Cleanup audit checkpoint

Completed on 2026-07-31:

- Confirmed `HANDOFF.md`, `NEXT_AGENT_HANDOFF.md`, and `NEXT_AI_PROMPT.md` are local handoff material and are ignored or intentionally outside the public tracked set.
- Confirmed `NEA-Project.7z`, `.workspace/`, ignored reference worktrees, `dump/private/`, and `works/private/` must remain local and untouched.
- Confirmed active implementation directories already have documented ownership and validation commands.
- No safe directory move has been approved yet.

Next cleanup action: audit duplicate/stale documentation and package-local layout without moving runtime or evidence paths.

Completed in C2 on 2026-07-31:

- Added progress, cleanup, and AI-context links to the root README.
- Clarified repository-management ownership in `Docs/repository-layout.md`.
- Added package-scope notices to the `Frontend/demo-map/`, `Middleware/runtime-compat/`, and `preservation-dump/` README files.
- Removed duplicate navigation entries introduced during the documentation pass.
- Left `Docs/work-summary-2026-07-31.md` untouched pending provenance review.

## External reference detachment checkpoint

Started on 2026-07-31:

- Removed external bypass/reference names from public engineering guidance.
- Replaced direct scanner imports with `NEA_PROTOCOL_EVIDENCE_PATH` and a neutral `Middleware/runtime-compat/evidence/protocol.ts` default.
- Direct code and script searches no longer contain the retired external names.
- Generated ABI and evidence reports still contain historical provenance strings and require regeneration from rebuilt local evidence before this checkpoint is complete.
- Recreated recovered Player protocol declarations and custom schemas under `Middleware/runtime-compat/evidence/`; the ABI scanner now loads this neutral evidence path without an external workspace.
- Removed the owner-authorized local external reference worktrees after the neutral evidence import passed focused validation.

## Maintainability audit checkpoint

Completed on 2026-07-31:

- Added mandatory maintainability gates to `AGENTS.md`.
- Added `Docs/ai/code-quality.md` and `tools/check-maintainability.ps1`.
- Classified large generated catalogs as data artifacts rather than business-code debt.
- Identified `Backend/local-player/backend/box3-server.cjs` as the first refactor target at approximately 17,000 lines.
- Identified `Frontend/demo-map/src/runtime/script-runtime.mjs` and `Frontend/demo-map/src/capability-manifest.mjs` as the next runtime seams.

Required approach: extract one pure helper or boundary adapter at a time, add focused validation, then continue. Do not rewrite the large backend wholesale.

## Weekly review

Record only:

```text
Completed:
Added:
Blocked:
Validated:
```
