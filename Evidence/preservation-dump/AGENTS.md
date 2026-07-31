# AGENTS.md — preservation-dump/

## 1. 核心使命（Project DNA）

Bounded capture/export tooling for DAO3 sessions (Chromium DevTools-based). Privacy is a hard rule: output stays in gitignored paths, and builder output never embeds private script source — only capability manifests and validated assets leave a capture.

## 2. 目录导航地图（Path Mapping）

- `start-live-dump.ps1` — live capture entrypoint (fresh Edge profile, records editor + play sessions).
- `capture-cdp.mjs` — CDP recorder; `--self-test` validates.
- `export-editor-scripts.mjs` / `export-editor-project.mjs` / `analyze-exported-scripts.mjs` — direct editor export via React state (`codeEditorController.getFileList()`).
- `build-editor-runtime-package.mjs` — builds a `dao3-project/v1` package from a capture + matching export (validates audio/picture assets, writes capability manifest + `compat/player-entity-projection.json`).
- `summarize-capture.mjs`, `analyze-exported-scripts.mjs` — capture summaries.
- `probe/` — `server.js` / `client.js` probe scripts to paste into the editor before preview.
- `test/` — validation tests.

## 3. 技术栈与环境约束（Tech Stack）

- Node ESM scripts + PowerShell entrypoint; validation via `node capture-cdp.mjs --self-test` and `node --check` on each tool.

## 4. 给 AI 的特殊指令（Behavior Rules）

- Output is written under `dump/private/live-captures/` and `dump/private/live-browser-profile/` — both gitignored. Never copy them into tracked paths.
- Authorization/cookie values are redacted in generated reports; the browser profile stays private, forever.
- `build-editor-runtime-package.mjs` must never embed private script source; only capability manifests and validated assets leave the capture.
- Run via `start-live-dump.ps1` from the repo root with a fresh Edge profile — do not reuse existing browser windows (misses early requests).
- Builder diagnostics: missing meshes are "unmapped", not inferred. Never synthesize model data.

## 5. 常用自动化指令（Commands）

```bash
node capture-cdp.mjs --self-test
node --check <tool>.mjs
```
