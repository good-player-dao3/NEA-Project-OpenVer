# AGENTS.md

## 1. 核心使命（Project DNA）

- Evidence-first preservation/compat project for the discontinued dao3.fun runtime. Source-available (PolyForm Noncommercial).
- Every compatibility claim must be evidence-backed and reproducible: when evidence is absent, record an explicit gap (`runtime-compat/generated/gap-report.md`) instead of synthesizing an API. Declarations never count as implementations.
- Never commit private captures, credentials, browser state, or token-bearing URLs (`dump/private/`, `works/private/`, `Lokibox/`, `.workspace/`, `NEA-Project.7z`).
- Generated artifacts are deterministic: `runtime-compat` asserts byte-exact SHA-256 hashes — keep randomness and wall-clock time out of evidence-affecting paths.

## 2. 目录导航地图（Path Mapping）

- `docs/runtime-architecture.md` — read first: layered architecture (Project package -> Client/Server Script Runtime -> MuDB transport -> Authoritative Game Runtime -> preserved Player).
- `docs/repository-layout.md` — what each top-level directory contains; read before touching any package.
- `docs/open-version.md` — publish vs. keep-private policy; read before pushing to the OpenVer remote.
- `runtime-compat/generated/gap-report.md` — known compatibility gaps; consult before compat work.
- Each package has its own `AGENTS.md` (layout, commands, rules) — read the relevant one before working inside a package.
- Keep reads lean: prefer targeted reads over full-file dumps; never cat large artifacts under `runtime-compat/generated/` (consult `gap-report.md` or the generator instead).

## 3. 技术栈与环境约束（Tech Stack）

- ESM JavaScript (`"type": "module"`), Node 20.11+ (`import.meta.dirname`); CI runs Node 24.
- Node built-in test runner (`node --test`) — except `mudb/` upstream tests (tape/ts-node).
- No root `package.json` — run package commands with `npm --prefix <pkg>`.
- `mudb/schema` + `mudb/stream` are gitignored compiled output: on a fresh clone, imports of `../../mudb/schema` fail until `node tools/build-mudb.mjs` runs (demo-map pretest/prestart auto-run it).

## 4. 给 AI 的特殊指令（Behavior Rules）

- Keep layers separate: no parallel Player or Script Runtime; never branch runtime behavior on work names/identifiers.
- Evidence dirs (`mudb/`, `origin/`, `dao3-docs-mirror/`, tracked parts of `dump/`) are read-only inputs: change conclusions in `runtime-compat/tools/` generators, never in evidence.
- `runtime-compat/abi/` + `generated/` are derived artifacts: never hand-edit; change the generator, then run `npm --prefix runtime-compat run build`.
- Add conformance coverage next to the affected package.
- Use `tools/apply_patch.ps1` for edits when working in the Windows workspace; keep LF checkout (`core.autocrlf false`).
- Do NOT add code comments unless asked. Reply with deltas only — don't echo back content you read.

## 5. 常用自动化指令（Commands）

```bash
npm --prefix runtime-compat run build   # regenerate ABI + reports (extract, report, audit; incl. gap-report.md)
npm --prefix runtime-compat test       # node --test
npm --prefix demo-map run validate     # fast import check (CI step 1; no server needed)
npm --prefix demo-map run build
npm --prefix demo-map test
npm --prefix demo-map start            # http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008
```

Run the narrowest relevant command first; don't fix unrelated failures.
