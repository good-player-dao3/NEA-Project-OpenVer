# NEA Project Development Requirements for AI Agents

Use this document as the mandatory operating contract for any AI agent working on NEA Project.

## 1. Mission

Build an evidence-first, self-hostable compatibility platform for maps from the same DAO3 / `dao3.fun` generation.

The final platform must be able to:

1. Import preserved project packages and vetted public assets.
2. Execute both Server and Client Script Runtimes.
3. Provide a unified DAO3 Runtime API/ABI rather than map-specific compatibility branches.
4. Bridge scripts through recovered MuDB transports and the authoritative runtime to the preserved Player browser client.
5. Evaluate every project before launch through a Capability Manifest and launch gate.
6. Report supported, partial, blocked, evidence-blocked, recovered-only, declared-only, and script-owned behavior accurately.

The immediate priority is the general runtime and ABI required by real maps. Do not optimize for running only one captured BedWars package.

## 2. Required Reading Before Work

Read the applicable `AGENTS.md` files first, then read these files before meaningful implementation:

1. `HANDOFF.md`
2. `NEXT_AGENT_HANDOFF.md`
3. `Middleware/runtime-compat/generated/gap-report.md`
4. `Middleware/runtime-compat/generated/phase-5-audit.md`
5. `Middleware/runtime-compat/abi/current-runtime.json`
6. `Frontend/demo-map/docs/map-import-format.md`
7. `Frontend/demo-map/docs/script-runtime.md`
8. `preservation-dump/README.md`
9. `Docs/repository-layout.md`
10. `Docs/runtime-architecture.md`
11. `Docs/architecture-governance.md`
12. `Docs/open-version.md`
13. `Docs/ai/project-context.md`
14. One task-specific file under `Docs/ai/`, when applicable.

Then inspect:

- `git status --short --branch`
- applicable package tests and adjacent implementation
- current ABI reports and conformance declarations
- the latest ignored `script-abi-usage.json` under `dump/private/live-captures/`, when ABI prioritization requires it

Private usage reports and capture inputs may be inspected locally when the task explicitly declares them as evidence. Use the minimum required input, keep the inspection output bounded, and derive only anonymous facts such as counts, schemas, capability classifications, or non-secret hashes. Never copy private script text, map identity, payloads, credentials, token-bearing URLs, browser state, or private paths into tracked files, logs, prompts, screenshots, or user-facing output.

## 3. Evidence Rules

Use sources in this priority order:

1. Local documentation and generated declarations.
2. Recovered historical source and bundles.
3. Saved local protocol and transport evidence.
4. Anonymous real-map API usage.
5. Existing executable local substrate.
6. Upstream Git or web research only when local evidence is insufficient and the user permits it.

Never invent DAO3 APIs, protocol fields, timing, physics, browser behavior, geometry, bounds, identities, resources, or error semantics.

Every compatibility conclusion must cite direct local evidence in the relevant ABI entry, conformance declaration, report, or implementation analysis.

Use the following classifications honestly:

- `native`: supplied by the selected preserved provider.
- `compatible`: executable behavior is directly proven to match the recovered contract.
- `partial`: executable behavior exists but one or more semantic gaps remain.
- `recovered-only`: historical behavior is recovered but not implemented by the selected local provider.
- `declared-only`: only the declaration is available.
- `unavailable`: the selected provider directly proves the feature is unavailable.
- `evidence-blocked` or evidence-deferred: implementation would require inventing unrecovered behavior.
- `script-owned`: the surface is created by the project script and is not a DAO3 ABI claim.

Do not call partial behavior complete.

## 4. Architecture Boundaries

Keep these layers separate:

- project package and importer
- Client Script Runtime
- Server Script Runtime
- shared value/runtime ABI
- MuDB and recovered transports
- authoritative local game runtime
- Player browser client
- preservation/evidence tooling

Do not replace the architecture with a single compatibility server or map-specific adapter.

Historical evidence directories such as `Evidence/origin/`, `Shared/mudb/`, `Evidence/dao3-docs-mirror/`, and vetted `Evidence/dump/` content are evidence inputs, not the architecture for new application code.

Dynamic entity projection must accept only captured and validated mesh names. Unknown or dynamic mesh names remain script-local. Never fabricate geometry, bounds, collision bodies, authoritative IDs, or resource metadata.

## 5. Privacy and Publication Rules

Local reading is permitted for a declared audit or implementation task. The following remain non-publishable and non-modifiable:

- `NEA-Project.7z`
- `dump/private/`
- `works/private/`
- `.workspace/`
- ignored external/reference worktrees
- private map exports or scripts
- browser profiles or login databases
- cookies, OAuth data, tokens, credentials, session state, or token-bearing URLs
- private capture payloads or identifiable work names

Tracked reports may include sanitized counts, API names, classifications, non-secret hashes, and generalized findings only. A report must state its source class, redaction status, public/private status, and reproducibility limits without naming private paths or identities.

Before publishing to OpenVer, inspect changed paths and diffs for secrets and private references. OpenVer must contain only vetted publishable material.

## 6. Work Planning

Before a meaningful phase:

1. Create a four-to-seven-step plan.
2. Select one small phase only.
3. State the exact API surface or subsystem.
4. Identify direct evidence files.
5. Identify affected runtime layers and transports.
6. Define acceptance criteria.
7. Define the focused conformance test.

Work on one task ID, one acceptance contract, and one declared write scope at a time.

Prioritize an ABI gap only when it has both:

- direct local evidence; and
- an existing implementable substrate.

If either is missing, record the gap precisely instead of creating a speculative implementation.

### 6.1 Analysis-only phases

Architecture, migration, and refactor analysis phases are read-only.

During an analysis-only phase, the agent must not modify:

- source code;
- tests;
- generated outputs;
- package manifests;
- configuration;
- directory structure;
- ignore rules;
- evidence fixtures.

The analysis must produce:

1. a responsibility map;
2. a dependency map;
3. a module-level mutable-state map;
4. an external IO/network/subprocess boundary map;
5. an external-reference dependency map;
6. a concrete test and failure-handling gap list;
7. one smallest safe implementation task;
8. explicit non-goals.

After the analysis, stop and request explicit approval before editing.

### 6.2 Refactor safety

- Do not rewrite a large module wholesale.
- Do not split a large file into forwarding modules without moving cohesive responsibility and reducing coupling.
- Before moving or renaming a path, audit all callers, generators, tests, reports, documentation, ignore rules, and provenance.
- Treat hidden initialization order, module-level mutable state, event listeners, timers, process shutdown, and WebSocket lifecycle as migration risks.

## 7. Editing Rules

- Use `D:\Projects\Gaming\NEA-Project\tools\apply_patch.ps1` for edits.
- After implementation approval, this patched wrapper is mandatory for every source, test, documentation, configuration, and fixture edit.
- Do not use `Set-Content`, `Out-File`, `Add-Content`, direct shell redirection, ad hoc Python/Node rewrite scripts, or shell replacement commands to edit files.
- The wrapper writes patch input through a UTF-8 temporary file before invoking Python. Do not bypass it because direct Windows PowerShell-to-native-process pipelines may corrupt non-ASCII text.
- Before applying a patch, confirm explicit approval, task write scope, and that private, generated, or forbidden paths are excluded.
- After applying a patch, run `git diff --check`, inspect `git diff --stat`, and inspect only the changed regions required for verification.
- Analysis-only phases must not call the patch tool.
- Read relevant docs, implementation, and tests before editing.
- Prefer a small root-cause fix over broad cleanup.
- Do not modify unrelated code or overwrite another agent's uncommitted work.
- Inspect `git status` before and after the phase.
- Use short, inspectable commands and bounded output.
- Do not start opaque background jobs.
- Do not edit generated bundles or catalogs manually when a generator owns them.
- Backend compatibility changes must persist through the documented patch workflow and target hash.
- Do not make a generated report look cleaner by replacing provenance strings manually; update its generator or source fixture and regenerate.

### 7.1 Evidence fixture rules

- Evidence fixtures must be reconstructed from approved local evidence, not copied wholesale from an external reference project.
- A fixture must record source class, redaction status, public/private status, provenance hash where safe, and known limitations.
- File existence, a guessed default, or a plausible schema is not behavioral evidence.
- Missing facts remain `evidence-blocked` or `evidence-deferred`.

## 8. Maintainability Requirements

- Separate interface, service/application, evidence/data access, utility, transport, and orchestration concerns.
- Ordinary business functions should be no longer than 80 lines.
- Utility functions should be no longer than 50 lines.
- Ordinary hand-written implementation files should be no longer than 500 lines.
- Generated catalogs, archived evidence, minified bundles, and compatibility patches are exempt but must not be treated as ordinary hand-written architecture.
- Keep conditional nesting to three levels or fewer where practical.
- Validate external input for presence, type, format, and range.
- Add timeout and failure handling at filesystem, network, subprocess, and runtime bridge boundaries.
- Never swallow exceptions.
- Use named constants or configuration instead of unexplained magic values.
- Extract shared logic when the same behavior appears three or more times.
- Add focused regression or conformance coverage for behavior changes.
- Do not introduce a new dependency without justification and compatibility review.
- Do not use a large-file limit as a reason for speculative abstraction or meaningless file fragmentation.

## 9. Tests and Validation

Add or update focused conformance tests for every Runtime, ABI, transport, lifecycle, or evidence-classification change.

The user currently runs tests personally. Unless the user explicitly asks:

- do not run test suites;
- do not run broad builds;
- do not launch long-running services.

Allowed static validation normally includes:

- `node --check`
- focused read-only probes
- runtime-compat generators
- patch replay or hash checks
- `git diff --check`
- secret/private-path audits

Report tests as not run rather than implying they passed.

## 10. Runtime-Compat Generator Sequence

After Script Runtime, ABI, transport evidence, or compatibility-report changes, run the documented sequence:

```text
node Middleware/runtime-compat/tools/analyze-local-server-runtime.mjs
node Middleware/runtime-compat/tools/build-server-object-model.mjs
node Middleware/runtime-compat/tools/build-runtime-entity-adapter-map.mjs
node Middleware/runtime-compat/tools/build-runtime-player-adapter-map.mjs
node Middleware/runtime-compat/tools/compose-current-runtime.mjs
node Middleware/runtime-compat/tools/compose-runtime-catalogs.mjs
node Middleware/runtime-compat/tools/build-compatibility-matrix.mjs
node Middleware/runtime-compat/tools/build-runtime-contracts.mjs
node Middleware/runtime-compat/tools/build-api-abi-completeness.mjs
node Middleware/runtime-compat/tools/generate-gap-report.mjs
node Middleware/runtime-compat/tools/build-script-corpus-gap-report.mjs
node Middleware/runtime-compat/tools/build-capability-gate-audit.mjs
node Middleware/runtime-compat/tools/build-phase-5-audit.mjs
```

Run any prerequisite analyzer first, such as `analyze-local-shared-runtime.mjs`, when that analyzer's inputs changed.

Do not manually change generated compatibility counts to make reports look complete.

## 11. Known Evidence Boundaries

Preserve these current conclusions unless stronger local evidence is found:

- `world.onChat` has a recovered historical event shape and local downstream delivery, but no recovered native browser-to-server chat ingress.
- `world.addCollisionFilter` has historical schema evidence, while the local backend marks the corresponding field unused. Do not fake either path.
- Automatic entity sound fields have declarations and binding references but lack recovered serialization, diff, and consumer behavior.
- Unknown meshes must not be projected into authoritative entities.
- Player facade identity is partial because the local Runtime merges the entity shell and player facade, while historical `ScriptEntitySync` creates a distinct object.
- Epsilon-dependent value-object methods remain partial when the historical `EPSILON$2` binding cannot be linked directly.
- API/ABI completeness with zero structural gaps does not mean all behavior is compatible; matrix classifications remain authoritative.

## 12. Git and GitHub Rules

Do not commit, push, merge, reset, clean, rebase, change remotes, delete branches, or create PRs unless the user explicitly requests the Git operation.

When the user requests GitHub work:

- Private repository: `ForgottenArch/NEA-Project`.
- Private development branch: `Beta`.
- Public repository: `ForgottenArch/NEA-Project-OpenVer`.
- Public integration branch: `main`.
- Audit the OpenVer diff for private material before pushing.
- Prefer a separate OpenVer branch and PR for publishable changes.
- Review external PRs for architecture, evidence, privacy, patch persistence, and semantic compatibility before merging.
- Do not merge a conflicting or behavior-changing PR merely because it is buildable.

## 13. Communication Language

- AI development plans, implementation reasoning, task descriptions, commit-style summaries, validation reports, and documents intended for another agent must be written in English.
- Code identifiers, diagnostics, tests, and engineering documentation should be in English.
- Chinese user-facing guidance belongs under `Docs/zh/`.
- The agent may answer a Chinese-speaking user in Chinese, but the transferable development artifact must remain English.

## 14. Acceptance Standard

A phase is complete only when:

1. The implementation uses direct local evidence.
2. Runtime layer boundaries remain intact.
3. Unknown behavior is still classified as unknown or partial.
4. Focused conformance coverage exists.
5. Required generated reports have been regenerated.
6. Static checks and repository hygiene checks pass.
7. No private or secret material is present in tracked changes.
8. Remaining gaps are reported precisely.

Do not mark the full project complete while declared-only, partial, evidence-blocked, transport, browser, or authoritative-runtime requirements remain unresolved.

## 15. Required End-of-Turn Handoff

End implementation work with exactly one next action and this structure:

```text
Changed:
- path: short description

Validation:
- command: result or not run

Risks:
- unresolved behavior or privacy concern

Next:
- one concrete follow-up task
```

