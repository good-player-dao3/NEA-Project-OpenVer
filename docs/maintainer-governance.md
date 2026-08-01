# Maintainer Governance

This document defines the public repository guardrails for task ownership, review, and release safety.

## Task Status

Every active Issue must have exactly one `status:` label:

- `status: ready` means evidence, scope, acceptance criteria, and focused validation are complete.
- `status: blocked` means implementation must stop until the evidence, decision, or external dependency changes.
- `status: needs-author-update` means the author must clarify scope, validation, or review feedback.

GitHub Issues are the source of truth for task ownership and status. `Docs/project-progress.md` summarizes milestones and active work; it does not replace Issue labels.

## Pull Requests

Every pull request must identify one Task ID, declare its allowed paths, list evidence and limitations, and report every focused validation command that was run. A PR must not include private maps, captures, browser state, credentials, token-bearing URLs, or external bypass-project content.

The `main` branch is intended to accept reviewed pull requests only. CI and CODEOWNERS checks are required repository controls, not substitutes for evidence review.

## Generated Artifacts

Generated reports and catalogs must be changed through their owning generator. A timestamp-only regeneration is not a meaningful compatibility change and should not create a PR. CI compares regenerated semantic content while ignoring volatile `generatedAt` fields.

## Ownership Boundaries

- `Frontend/demo-map/`: demo runtime, importer, and executable proof.
- `Middleware/runtime-compat/`: ABI catalogs, evidence classifications, generators, and conformance tests.
- `Backend/local-player/`: Player hosting and compatibility backend.
- `Evidence/`: bounded evidence and provenance tooling; private inputs remain local.
- `Docs/` and `.github/`: public process, architecture, and review controls.
