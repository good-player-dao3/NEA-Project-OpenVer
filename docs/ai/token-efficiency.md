# AI Token Efficiency

## Context layers

Use three layers in this order:

1. `AGENTS.md` for permanent repository rules.
2. `Docs/ai/project-context.md` for the short current project state.
3. One task prompt containing only the relevant files, evidence, scope, and acceptance criteria.

Do not paste the same architecture or privacy rules into every task prompt.

## Inspection pattern

```text
status -> locate symbol -> read narrow context -> patch -> inspect diff -> run focused validation
```

Avoid full recursive listings, full generated reports, complete logs, minified bundles, and repeated reads of unchanged files.

## Tool-call budget

For a bounded task, aim for:

- 1 grouped inspection call;
- 1 implementation call;
- 1 focused validation call;
- 1 final diff/status call.

Add calls only when an error or ambiguity requires them.

## Output contract

Agents should return only:

```text
Changed:
- path: short description

Validation:
- command: result or not run

Risks:
- unresolved issue

Next:
- one concrete follow-up
```

## Local summarization

Use `tools/summarize-output.ps1` before sending long command output to an AI agent. Keep the first matching failure, its nearby context, and the final output tail.
