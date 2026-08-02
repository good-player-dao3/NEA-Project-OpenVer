# NEA Project Agent Rules

## Mission

Build an evidence-first, self-hostable DAO3 / dao3.fun compatibility path that can run a real map with both client and server Script Runtimes.

## Repository boundaries

- `Frontend/demo-map/`: executable demo, importer, runtime integration, and validation.
- `Middleware/runtime-compat/`: ABI catalogs, reports, fixtures, and conformance tests.
- `Backend/local-player/`: Player hosting and compatibility backend.
- `Evidence/preservation-dump/`: bounded capture/export tooling.
- `Evidence/origin/`, `Shared/mudb/`, `Evidence/dao3-docs-mirror/`, `Evidence/dump/`: evidence and historical inputs, not new runtime architecture.
- `Evidence/works/`: public catalog and ignored private work sources.
- `Docs/`: project governance, architecture, progress, and AI context.
- `Docs/zh/`: Chinese user-facing guidance only.
- `tools/`: maintenance helpers.

## Safety and evidence

- Private evidence may be read locally for a declared audit or implementation task. It must never be modified, copied into tracked files, staged, committed, published, or exposed in command output, logs, reports, screenshots, or prompts. This includes credentials, browser state, token-bearing URLs, private maps, ignored reference worktrees, `Evidence/dump/private/`, `Evidence/works/private/`, `.workspace/`, and `NEA-Project.7z`.
- Local private inspection must use the minimum required files and produce only anonymous, redacted derived data such as counts, schemas, capability classifications, or non-secret hashes. Keep the private source path out of tracked artifacts and user-facing diagnostics.
- Do not invent historical behavior. Use `compatible`, `partial`, `recovered-only`, `declared-only`, or evidence-deferred classifications.
- Keep evidence, generated reports, and executable implementation separate.
- Do not use names, paths, imports, or runtime dependencies belonging to external bypass/外挂 projects in scripts or implementation code.
- Replace external references with a neutral in-repository evidence path, an explicit configuration input, or a rebuilt local fixture before implementation work continues.

## Change discipline

- Read the relevant package docs and tests before editing.
- Work on one task ID at a time and keep the change within its declared scope.
- Prefer the smallest root-cause fix; avoid unrelated refactors and broad cleanup during feature work.
- Add or update focused conformance tests for runtime behavior changes.
- Do not run broad tests or builds unless the user asks; report the exact commands that should be run.
- Do not commit, push, reset, clean, rebase, change remotes, or move repository directories without explicit user approval.

## Patch tool requirement

- After implementation approval, all file edits must use `D:\Projects\Gaming\NEA-Project\tools\apply_patch.ps1`.
- Do not edit files with `Set-Content`, `Out-File`, `Add-Content`, direct redirection, ad hoc Python/Node rewrites, or shell replacement commands.
- The patch wrapper preserves UTF-8 input through a temporary UTF-8 file before invoking Python; do not bypass it on Windows.
- Before applying a patch, confirm approval, allowed write scope, and exclusion of private/generated/forbidden paths. Reading a private source for a declared audit is allowed; writing to it or publishing derived sensitive content is not.
- After applying a patch, inspect `git diff --check`, `git diff --stat`, and only the changed regions required for verification.
- Analysis-only tasks must not call the patch tool.

## Analysis and refactor gate

- Architecture-analysis tasks are read-only. Do not modify source code, tests, generated outputs, package manifests, configuration, or directory structure during analysis.
- Before editing, produce a responsibility map, dependency map, mutable-state map, external-IO map, test-gap list, and one smallest safe implementation task.
- Do not approve a refactor merely because a file is large. Identify cohesive responsibilities, hidden initialization order, event listeners, timers, process lifecycle, and circular-dependency risks first.
- Do not split a large file into thin forwarding modules. Every extracted module must own a cohesive responsibility and reduce coupling.
- Do not rename or delete a referenced path until callers, generators, tests, reports, documentation, ignore rules, and provenance have been audited.
- After analysis, stop and request approval before implementation when the task is an architecture or migration phase.

## Token efficiency

- Start with `git status --short`, a targeted file search, or a narrow test; do not dump the whole repository tree or large files.
- Use `rg -n` to locate symbols first, then read only the surrounding lines required for the task.
- Do not reread a file after a successful patch unless verification requires it; inspect the diff instead.
- Keep shell output bounded with `Select-Object -First`, `-Last`, or a focused pattern filter.
- Never send complete logs, generated bundles, caches, or minified assets to an AI agent. Summarize failures locally first.
- Reuse `Docs/ai/project-context.md` and one task-specific context instead of repeating repository background in every prompt.
- One task ID, one acceptance contract, and one declared write scope per agent turn.
- End each turn with a compact handoff containing changed files, validation, risks, and exactly one next action.
- Prefer a single grouped shell command over many overlapping inspection calls.

## Maintainability gate

The project prioritizes maintainability over one-off execution. These rules are mandatory for new or substantially modified implementation code.

## Code Formatting and Syntax

These rules apply unless an existing package formatter or local package convention is stricter:

- Use spaces, never tabs. Use two spaces per indentation level; increase indentation consistently for nested blocks and continuation lines.
- Put opening braces on the same line as the declaration or control statement. Put the closing brace on its own line, except for short object literals and single-line callbacks that remain readable.
- Keep `else`, `catch`, and `finally` on the same line as the preceding closing brace: `} else {`, `} catch (error) {`.
- Do not put spaces immediately inside parentheses, brackets, or braces: `if (ready)`, `items[index]`, and `{ name, value }`.
- Use semicolons in JavaScript and TypeScript where the surrounding package uses semicolons. Do not mix semicolon styles within one file.
- Use trailing commas in multiline arrays, objects, argument lists, and parameter lists when the surrounding package supports them.
- Keep one statement per line. Split chained calls, long conditions, and object literals when they become difficult to review; do not use formatting to hide complex control flow.
- Use `camelCase` for variables and functions, `PascalCase` for classes and types, and `UPPER_SNAKE_CASE` only for true constants.
- Match the existing package formatter and line-ending policy before applying broad formatting. Do not reformat unrelated lines in a feature patch.
- Code identifiers, diagnostics, and implementation comments must remain in English unless a user-facing product requirement requires another language.

- Keep interface, application/service, evidence/data access, and utility concerns separated. Do not place protocol parsing, business decisions, filesystem access, and HTTP/Player orchestration in one function.
- Keep ordinary business functions at or below 80 lines and utility functions at or below 50 lines. Split longer functions unless the file is generated or a compatibility adapter requires a documented exception.
- Keep ordinary implementation files at or below 500 lines. Generated catalogs, manifests, minified bundles, and archived evidence are exempt but must not be edited as hand-written source.
- Extract shared logic when similar behavior appears three or more times. Do not copy and paste protocol, validation, logging, or error handling branches.
- Replace magic numbers and strings with named constants or configuration. Validate all external input for presence, type, format, and range.
- Keep conditional nesting at three levels or less. Prefer guard clauses, extracted functions, and explicit strategy maps over long conditional ladders or chained ternaries.
- Never swallow exceptions. Distinguish expected domain failures from system failures, preserve the cause, and emit useful structured diagnostics at important boundaries.
- Add boundary validation, timeout behavior, and failure handling for filesystem, network, subprocess, and runtime bridge calls.
- Explain why for non-obvious compatibility workarounds. Do not leave stale commented-out code or debug output.
- New dependencies require a short justification, a version/compatibility check, and confirmation that the standard library or an existing dependency is insufficient.
- Add focused tests for new behavior and regression tests for fixed failures. Do not mark a task complete based only on a successful happy path.
- Do not use the maintainability limits to justify speculative over-abstraction. Prefer small cohesive modules and a clear seam over a framework.

## Current Development Queue

The detailed, evidence-backed queue is maintained in `Docs/development-backlog.md`; the active ownership board is `Docs/project-progress.md`. The current order is:

1. `[RT-001]` Generate a sanitized real-map compatibility gap report.
2. `[IMP-001]` Map core recovered `project.json` fields into the public import format.
3. `[QA-001]` Add a sanitized end-to-end real-map smoke fixture.
4. `[RT-002]` Select one client remote-channel or UI slice after the real-map report.
5. `[RT-003]` Add bidirectional remote-channel conformance fixtures.
6. `[RT-004]` Add directed and broadcast server-to-client event coverage.
7. `[UI-001]` Prove client-script-owned UI creation and input handling.
8. `[MT-001]` Extract one cohesive boundary helper from the local Player backend, without a wholesale rewrite.

Do not start a queue item without claiming its task ID, write scope, acceptance criteria, and validation command. Full physics, historical API completion, speculative posture behavior, and a Player rewrite remain blocked or deferred until stronger evidence exists.

## Evidence migration gate

- A neutral evidence fixture may contain only facts traceable to an approved local source, capture, declaration, or reviewed artifact.
- Never replace missing evidence with plausible defaults, inferred values, copied external source, or path-existence claims.
- Missing evidence must remain `evidence-blocked`, `evidence-deferred`, `partial`, or another honest classification.
- Never hand-edit generated ABI, compatibility, or evidence reports to remove old provenance or make counts look complete. Change the generator or evidence input, then regenerate.
- Every evidence fixture must identify its source class, redaction status, public/private status, and reproducibility limits.

## AI self-review before completion

Before reporting completion, check:

1. Is each changed function within the size limit, or is the exception documented?
2. Did any similar logic get copied instead of extracted?
3. Are external inputs, IO, timeouts, and errors handled explicitly?
4. Are magic values named and configuration-driven where appropriate?
5. Is nesting shallow and are branches easy to test?
6. Are logs actionable without exposing private data or tokens?
7. Is there a focused test or a clearly recorded validation blocker?
8. Did the change preserve the repository layer boundaries and evidence policy?

## Current priority

Make the real-map client/server runtime loop work through the preserved Player browser client before broad physics coverage, full API completion, frontend polish, or Demo-only gameplay work.

## Native Player integration guardrail

- The target is not a replacement game client or a standalone Demo. The target is a local backend and compatibility path that let the preserved Player consume a recovered project package, bootstrap data, resources, client/server scripts, and runtime transport with the smallest evidence-backed adaptation.
- Every runtime, importer, backend, or Player task must name the integration edge it advances: `project package -> Script Runtimes`, `Script Runtimes -> MuDB`, `MuDB -> authoritative runtime`, or `authoritative runtime -> preserved Player`.
- A Demo-only feature is lower priority unless it supplies a focused fixture or conformance test for one of those integration edges. Do not treat a Player shell launch, a custom map, or a custom script as proof that a recovered map is natively importable.
- When a recovered field or protocol value encoding is unknown, add a preflight, inventory, or explicit `evidence-blocked` result before adding a substitute format. Do not silently replace the preserved client contract with a new frontend contract.
- Read `Docs/native-player-integration-goal.md` before planning migration, Player backend, importer, or Script Runtime work.

## Language requirement

- All AI-assisted development instructions, plans, code reasoning, task descriptions, commit-style summaries, and validation reports must be written in English.
- Code identifiers, tests, diagnostics, and technical documentation created for the implementation should use English unless a user-facing product requirement explicitly requires another language.
- Chinese project guidance belongs under `Docs/zh/`; do not mix Chinese prose into the English engineering docs.
- If the user asks a question in Chinese, the agent may answer the user in Chinese, but any development artifact or instruction intended for another AI agent must remain in English.

## Task completion format

End implementation work with:

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
