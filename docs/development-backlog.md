# Development Backlog

**Updated:** 2026-07-31
**Status source:** `Docs/project-progress.md` is the active task board. This document is an evidence-backed planning reference, not a claim that every listed behavior is fully specified.

## Purpose

This backlog gives contributors one public, reviewable order of work toward a real recovered map running through the client/server Script Runtimes, MuDB transport, authoritative runtime, and Player client. It does not authorize work outside the evidence and privacy policies.

Each implementation task must declare one task ID, an allowed write scope, evidence, acceptance criteria, focused validation, and an honest compatibility classification. Use [the AI task template](ai/task-template.md) when applicable.

## Planning Sources

- `Docs/project-progress.md`: current ownership, milestones, and blockers.
- `Middleware/runtime-compat/generated/gap-report.md`: ABI coverage and evidence limits, generated 2026-07-31.
- `Middleware/runtime-compat/generated/script-corpus-gap-report.md`: sanitized real-script usage priorities, generated 2026-07-31.
- `Middleware/runtime-compat/generated/phase-5-audit.md`: generation and audit status.

Generated reports are evidence snapshots. Regenerate them through their documented tools when their inputs or mappings change; do not edit them by hand.

## Work Order

### P0 - Establish the real-map priority signal

| Task | Outcome | Evidence and boundary | Acceptance |
| --- | --- | --- | --- |
| `RT-001` | Generate a sanitized real-map compatibility gap report. | Private usage must stay local; report only safe, anonymous API requirements. | Compare usage with the current ABI and classify missing behavior without copying private source or payloads. |
| `IMP-001` | Map core recovered `project.json` fields into the public import format. | Use recovered public structure only; unknown fields remain unimplemented or deferred. | Public importer preserves the agreed core fields with focused validation. |
| `QA-001` | Add a sanitized end-to-end real-map smoke fixture. | Fixture must be neutral, reviewed, and reproducible. | The public runtime launches the fixture and exercises the agreed loop without private assets. |

`RT-001` is the current dependency for selecting the next runtime slice. Do not rank broad API work only by declaration count.

### P1 - Prove the client/server runtime loop

| Task | Outcome | Acceptance |
| --- | --- | --- |
| `RT-002` | Select one client remote-channel or UI slice after `RT-001`. | One visible `demo-map` behavior proves the path end-to-end with focused tests. |
| `RT-003` | Add bidirectional remote-channel conformance fixtures. | Client-to-server and server-to-client delivery contracts are tested independently. |
| `RT-004` | Add directed and broadcast server-to-client event coverage. | Recipient targeting and broadcast semantics are both proven by conformance tests. |
| `UI-001` | Prove client-script-owned UI creation and input handling. | A client script creates or updates UI and handles documented input through the runtime boundary. |

These tasks are the primary path because the current project priority is the real-map client/server runtime loop, not broad physics coverage or frontend polish.

### P2 - Resolve high-value partial requirements

The sanitized corpus report identifies these highest-frequency partial server requirements. Start only after a task-specific evidence review and select one cohesive behavior at a time:

1. `server.world.onChat` and `server.world.onTick`.
2. `server.world.raycast`.
3. `server.GameStorage.getDataStorage` and `server.GameStorage.getGroupStorage`.
4. World interaction and contact events: `onVoxelContact`, `onClick`, `onFluidEnter`, and `onEntityContact`.
5. World controls: `addCollisionFilter`, `addZone`, `airFriction`, and `onPlayerPurchaseSuccess`.

The report currently identifies 19 partial requirements in the sanitized corpus. A partial implementation is not automatically a defect: retain that classification until the remaining behavioral gap has evidence and conformance coverage.

### P3 - Evidence-gated compatibility work

The following work is not ready for speculative implementation:

- `GameEntity.contactForce` aggregation and contact-object reuse require ContactBinding or equivalent server evidence.
- Per-contact impulse force integration requires an authoritative solver compatible with the recovered formula; do not graft it onto the current sweep approximation.
- Historical crouch and flying posture shapes remain evidence-deferred. Preserve the current collider rather than invent dimensions.
- Server-to-client captured binary traffic is absent from the currently indexed safe corpus. New fixtures need reviewed evidence before claiming wire compatibility.
- The selected archived provider has one confirmed unavailable surface, `UiInput.placeholderOpacity`; search evidence-compatible providers before changing its classification.

Record new evidence with its source class, redaction status, public/private status, provenance, and reproducibility limits. Missing evidence remains `evidence-blocked`, `evidence-deferred`, `partial`, or another honest classification.

### P4 - Maintainability and release hygiene

| Task | Outcome | Guardrail |
| --- | --- | --- |
| `MT-001` | Extract one cohesive helper or boundary adapter from `Backend/local-player/backend/box3-server.cjs`. | No wholesale rewrite; preserve lifecycle order and add focused validation. |
| `MT-002` | Isolate one proven seam in `Frontend/demo-map/src/runtime/script-runtime.mjs` or `Frontend/demo-map/src/capability-manifest.mjs`. | Do not create forwarding-only modules or change runtime behavior incidentally. |
| `RH-001` | Keep deterministic reports, fixtures, and public/private audit guidance synchronized. | Regenerate outputs from source; audit release diffs for private material. |

These tasks are not substitutes for the runtime-loop milestones. Take them only when they unblock a scoped compatibility task or prevent a concrete release-risk regression.

## Completion Standard

Move a task in `Docs/project-progress.md` only when it has:

1. A focused implementation or evidence outcome within the declared scope.
2. Evidence and compatibility classification recorded without historical overclaiming.
3. Focused conformance tests or a documented validation blocker.
4. Privacy review confirming that no private capture, token, map, source, or external-worktree dependency entered the change.
5. One concrete follow-up task or an explicit statement that no follow-up is required.

## Backlog Maintenance

- Add a task here after a generated report, reviewed evidence, or accepted design decision establishes its priority.
- Keep `Docs/project-progress.md` concise: no more than two items in `Now`.
- Remove or reclassify a task only with the evidence, tests, and documentation links that justify the change.
- Do not turn this document into a list of every declared API member; the generated compatibility reports remain the complete catalogs.
