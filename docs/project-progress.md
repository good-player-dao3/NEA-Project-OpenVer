# Project Progress

**Updated:** 2026-07-31
**Branch:** `beta`
**Source of truth:** this file for active work; `HANDOFF.md` for historical handoff context.

For the evidence-backed public work order and deferred implementation boundaries, see `Docs/development-backlog.md`.

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

**Status:** P0 loop verified; broader gameplay remains partial

Outcome: client UI, client-to-server events, server-to-client events, directed delivery, and broadcast delivery are proven by conformance fixtures and a visible `demo-map` behavior.

### M3 ? High-value gameplay compatibility

**Status:** Later

Order: remote channel edge cases, UI/input, world events, entity lifecycle, voxel/storage behavior, player state, then collision and physics replication.

### M4 ? Public release hygiene

**Status:** Later

Outcome: deterministic reports, sanitized fixtures, documented limitations, and an auditable public/private boundary.

## Now

### [#103 UI-002] Native Player startup and Script Runtime loop - P0 complete

**Owner:** current agent
**Scope:** real `Frontend/demo-map/src/server.mjs` -> `Backend/local-player/backend/box3-server.cjs` startup, client script admission, and remote-channel loop; no Player rewrite.
**Acceptance:** an isolated local instance starts the native Player, serves `clientIndex.js`, exposes `remote-channel`, and preserves the server-event/client-input loop without shared build-root collisions.
**Evidence:** `Frontend/demo-map/test/native-player-startup.test.mjs` starts the real server chain with an isolated build root and verifies `project-package-v1`, `clientIndex.js`, `/p/local-bedwars`, and `remote-channel`; `Frontend/demo-map/test/client-server-remote-ui-loop.test.mjs` proves the bidirectional Script Runtime behavior.
**Validation:** focused runtime/startup command passed 5 tests; an Edge headless smoke against the running Player reached `document.readyState=complete`, `GameIframe` bridge `ready`, increased backend connections by 1, and increased `remote-channel.sendServerEvent` by 1. Runtime-package launches now verify the recovered project bootstrap manifest and SHA-256 bytes before starting the backend, bind the runtime package identity to `dao3.project.json` and the client runtime manifest, and the recovered package builder verifies both the bootstrap template and every declared client-runtime template asset before copying or projecting them.
**Known limitation:** this proves the native Player startup and Script Runtime handshake path, not full historical gameplay, physics, or every Player API surface.

### [RT-001] Generate the real-map compatibility gap report — complete

**Owner:** current agent; completed 2026-08-01
**Scope:** `Middleware/runtime-compat/`, sanitized report output only
**Acceptance:** compare real-map API usage with the current ABI; classify missing behavior; do not copy private script source or payloads.
**Evidence:** `Middleware/runtime-compat/generated/script-corpus-gap-report.json` and its conformance tests. The report contains 74 classified requirements: 40 executable, 19 partial, and 15 assignment-backed custom extensions.
**Validation:** `node --test Middleware/runtime-compat/test/script-corpus-gap-report.test.mjs`; `node --test Middleware/runtime-compat/test/capability-gate-audit.test.mjs`; bounded privacy and summary consistency scan passed.
**Known limitation:** private source, identities, paths, payloads, and event names remain intentionally unreproducible in the public report.

### [RT-002] Select one client remote-channel/UI slice - complete

**Owner:** current agent; completed 2026-08-01
**Scope:** one runtime path plus focused tests and demo proof
**Acceptance:** one client/server behavior is implemented, tested, and visibly exercised in `demo-map`.
**Evidence:** `Frontend/demo-map/project/scripts/client.js` now registers its client-event listener before sending the ready handshake.
**Validation:** `node --test Frontend/demo-map/test/client-server-remote-ui-loop.test.mjs Frontend/demo-map/test/client-script-ui-input.test.mjs Frontend/demo-map/test/runtime.test.mjs Frontend/demo-map/test/backend-event-bridge.test.mjs` passed 49 tests.
**Known limitation:** full historical gameplay remains outside this slice; the live browser startup and handshake smoke is now covered separately by the P0 validation above.

### [RT-003] Add bidirectional remote-channel conformance fixtures - complete

**Owner:** current agent; completed 2026-08-01
**Scope:** protocol fixture and focused transport tests only
**Acceptance:** client-to-server and server-to-client delivery contracts are independently validated, including malformed payload rejection and tick preservation.
**Evidence:** `Middleware/runtime-compat/conformance/client-remote-channel.mjs` now exposes independent client and server fixtures with shared tick/args decoding.
**Validation:** `node --test Middleware/runtime-compat/test/remote-channel-conformance.test.mjs Frontend/demo-map/test/runtime.test.mjs Frontend/demo-map/test/client-server-remote-ui-loop.test.mjs` passed 51 tests.
**Known limitation:** fixtures prove the local contract only; no live wire compatibility claim is made.

### [RT-004] Add directed and broadcast server-to-client event coverage - complete

**Owner:** current agent; completed 2026-08-01
**Scope:** server-to-client recipient targeting and broadcast conformance only
**Acceptance:** directed delivery reaches exactly the selected client, broadcast reaches all connected clients, and disconnected recipients are handled without leakage.
**Evidence:** `Frontend/demo-map/test/remote-channel-recipient-isolation.test.mjs` verifies directed delivery, broadcast delivery, and post-disconnect isolation.
**Validation:** `node --test Frontend/demo-map/test/remote-channel-recipient-isolation.test.mjs Frontend/demo-map/test/runtime.test.mjs Middleware/runtime-compat/test/remote-channel-conformance.test.mjs` passed 51 tests.
**Known limitation:** live session behavior remains evidence-limited.

### [UI-001] Prove client-script-owned UI creation and input handling - complete

**Owner:** current agent; completed 2026-08-01
**Scope:** client script UI ownership, input event handling, and runtime boundary proof
**Acceptance:** a client script creates or updates UI and handles documented input through the runtime boundary.
**Evidence:** `Frontend/demo-map/test/client-script-ui-input.test.mjs` verifies client-owned `UiText` creation and pointer-lock input; `Frontend/demo-map/test/client-server-remote-ui-loop.test.mjs` verifies server events update that UI and the input event returns to Script Runtime.
**Validation:** `node --test Frontend/demo-map/test/client-script-ui-input.test.mjs Frontend/demo-map/test/client-server-remote-ui-loop.test.mjs` passed.
**Known limitation:** browser visual smoke remains separate.

### [QA-001] Add a sanitized end-to-end real-map smoke fixture - complete

**Owner:** current agent; completed 2026-08-01
**Scope:** neutral package fixture and local launch/conformance validation only
**Acceptance:** the public runtime launches the fixture and exercises the agreed client/server loop without private assets.
**Evidence:** `Frontend/demo-map/project/nea.map.json` and its imported `dao3-project/v1` package are used as the neutral fixture.
**Validation:** `node --test Frontend/demo-map/test/importer.test.mjs Frontend/demo-map/test/client-server-remote-ui-loop.test.mjs Frontend/demo-map/test/client-script-ui-input.test.mjs` passed 5 tests; bounded fixture privacy scan passed.
**Known limitation:** this is a sanitized local smoke fixture, not proof that an unreleased private map is fully compatible.

### [IMP-001] Map core recovered `project.json` fields into the public import format - complete (partial admission)

**Owner:** current agent; completed 2026-08-02
**Scope:** recovered descriptor admission plan, evidence-gated terrain mapping, recovered spawn/entity placement admission, and Player body profile binding
**Acceptance:** preserve confirmed fields, reject malformed spawn/body/entity placement values, bind admitted world and physics inputs to the capability manifest, and do not claim a runnable recovered package until all required fields are mapped.
**Evidence:** `Frontend/demo-map/src/recovered-project-import-plan.mjs` classifies all seven confirmed migration fields as admitted, preservation-only, partial, or evidence-blocked, and remains non-runnable for deferred semantics. `Frontend/demo-map/src/world-spawn.mjs` accepts only finite three-dimensional coordinates inside the declared voxel shape; `Frontend/demo-map/src/recovered-entity-placement.mjs` accepts only exact finite entity position vectors without string coercion. `Evidence/preservation-dump/editor-runtime-projection.mjs` applies the same strictness to required captured model and entity bounds before projection. `Evidence/preservation-dump/build-editor-runtime-package.mjs` maps `project.player.initialPosition`, entity placement, confirmed body profile, `physics.gravity`, and `physics.velocityDamping -> airFriction` into admitted inputs, while explicitly deferring `useOBB` and `defaultSkinName`. `Frontend/demo-map/src/server.mjs` rechecks world spawn, Player body, and world physics capability digests before Native Player startup. All recovered top-level schemas are structurally preflighted while unsupported value semantics remain partial.
**Validation:** focused placement/bounds/spawn/body/import/launch/builder/capability command passed 107 tests; syntax checks for the recovered placement boundary, projection, preflight, capability normalizer, launch gate, server, and package builder passed.
**Known limitation:** recovered entity values, environment values, physics values, other player values, feature behavior, and UI tree value semantics remain unavailable for complete package admission.

## Next

- Select the next active runtime compatibility slice from the completed queue without widening the recovered-field admission contract.

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
