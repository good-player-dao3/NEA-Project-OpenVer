# Architecture Governance

**Status:** Project-wide source of truth for architecture decisions  
**Updated:** 2026-07-31

This document prevents parallel contributors and AI agents from creating incompatible runtime designs. It complements `Docs/runtime-architecture.md`: the runtime document describes the system; this document defines who may change that system and how competing proposals are resolved.

## Authority Order

When documents, models, or implementations disagree, use this order:

1. A maintainer-approved architecture decision recorded in this document or an Architecture Decision Record.
2. `Docs/runtime-architecture.md` and package-level contracts, tests, and public schemas.
3. Reviewed local evidence and generated compatibility reports.
4. `Docs/project-progress.md` and `Docs/development-backlog.md`.
5. A contributor or model proposal.

An implementation, generated report, or model response never overrides an approved architecture decision silently. If the architecture is wrong, propose a focused change to the contract first.

## System Boundaries

The only supported runtime direction is:

```text
Project package
  -> Client Script Runtime / Server Script Runtime
  -> MuDB transport and explicit runtime contracts
  -> Authoritative Game Runtime
  -> Player client projection
```

| Module | Owns | May depend on | Must not own |
| --- | --- | --- | --- |
| `Frontend/demo-map/` | Importing public project data, client/server script execution, capability checks, demo proof | Runtime contracts, public package data, explicit transport facades | Private map logic, Player internals, direct browser storage, hidden server state |
| `Middleware/runtime-compat/` | ABI catalogs, evidence classification, generators, reports, conformance fixtures | Reviewed evidence and executable contract descriptions | Runtime business behavior, private captures, hand-edited generated output |
| `Shared/mudb/` | MuDB schemas, transport primitives, shared protocol data | Stable schema inputs and transport dependencies | Map policy, API compatibility decisions, Player UI behavior |
| `Backend/local-player/` | Player hosting, authoritative state bridge, browser-facing projection | Explicit runtime/transport contracts and validated package descriptors | Script parsing, evidence classification, guessed historical behavior |
| `Evidence/` | Reviewed evidence and bounded capture/export tooling | Approved local sources and provenance records | New runtime architecture or compatibility claims without a generator/test path |
| `Docs/` and `.github/` | Architecture decisions, task workflow, review gates, contributor guidance | Repository facts and validated process | Runtime implementation or private operational data |

Generated catalogs and reports are data products. Consumers may read them; contributors must update their generators or evidence inputs instead of editing the generated result.

## Call Rules

Cross-module calls must follow these rules:

1. Call through a named public contract or adapter owned by the receiving boundary.
2. Pass validated data objects, not mutable internals or filesystem/browser handles.
3. Keep protocol parsing in transport/schema code, business decisions in the owning runtime, and filesystem/network orchestration at an explicit service boundary.
4. Return structured domain failures and preserve system causes; do not swallow exceptions.
5. Define timeout, cancellation, and cleanup behavior for network, subprocess, filesystem, and runtime-bridge calls.
6. Add focused conformance coverage whenever a boundary signature, event direction, lifecycle order, or compatibility classification changes.

Deep imports across a boundary are an architecture change, even when the code compiles. Stop and document the reason before adding one.

## Change Classes

| Class | Example | Required review |
| --- | --- | --- |
| `L0` | Documentation wording or focused test data | One task owner; normal review |
| `L1` | Implementation inside one established module | Owning module review and focused validation |
| `L2` | Public contract, ABI, event direction, generated report, or cross-module dependency | Owning module review plus architecture impact section in the PR |
| `L3` | New runtime layer, changed source of truth, lifecycle redesign, directory ownership change, or new dependency | Maintainer approval before implementation and an ADR or update here |

If the class is uncertain, treat the change as the higher class. A larger model or more confident proposal does not lower the review class.

## AI and Multi-Model Work

Each task has exactly one **lead**. The lead owns the task scope, decision log, final patch, and validation. Other models or contributors may act as **supporting reviewers** only when their role is explicit.

- Supporting models may inspect, compare, test, or propose; they do not merge their own conflicting architecture.
- Do not run multiple models in parallel against the same mutable scope without a lead and a declared write boundary.
- Every model receives the same task ID, architecture baseline, allowed paths, forbidden paths, evidence, and acceptance criteria.
- When outputs disagree, stop implementation and resolve the disagreement against the Authority Order above.
- A model must not invent a new task, dependency, module, API, or historical behavior to make its assigned task pass.
- The final PR description must identify AI-assisted work when it materially changed implementation or architecture reasoning.

Recommended task flow:

```text
Maintainer sets task -> lead writes plan -> supporting review is read-only
  -> lead implements -> focused validation -> maintainer reviews boundary impact
```

## Architecture Change Protocol

For an `L2` or `L3` change, the contributor must include:

- Current boundary and proposed boundary.
- Why the existing owner cannot implement the behavior.
- Dependency direction before and after.
- Mutable state and lifecycle implications.
- Evidence or public contract establishing the change.
- Alternatives rejected and the reason for rejection.
- Migration, rollback, and focused validation plan.

Do not merge a cross-layer workaround first and promise to document it later. If the workaround is necessary for compatibility, record why and its removal condition in the same PR.

## Definition of Done

A task is complete only when:

1. The implementation stays within its declared module and task scope.
2. The architecture class and compatibility classification are explicit.
3. Focused tests or a documented evidence blocker cover the changed boundary.
4. Generated outputs are reproducible and were not hand-edited.
5. The active task board and relevant navigation links are synchronized.
6. A reviewer can identify the next owner without reconstructing the design from chat history.
