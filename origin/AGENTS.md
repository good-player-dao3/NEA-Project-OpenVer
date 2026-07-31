# AGENTS.md — origin/

## 1. 核心使命（Project DNA）

Historical server bundle evidence. Input to `runtime-compat` extraction. Evidence, read-only — it is never the new architecture.

## 2. 目录导航地图（Path Mapping）

- `origin/` — recovered server bundle: `origin/origin/` contains `api/`, `data/`, and ScriptShell classes (`FetchWrapper.js`, `Logger.js`, `QueryWrapper.js`, `RigidBody.js`, `ScriptAnimationManager.js`, …).
- `server-protocols.json` — recovered server protocol declarations.

## 3. 技术栈与环境约束（Tech Stack）

- Historical JavaScript bundle (not ESM); do not run or refactor it.

## 4. 给 AI 的特殊指令（Behavior Rules）

- API extraction happens in `runtime-compat/tools/extract-origin-api.mjs`; change conclusions there, never here.
- Regenerate `runtime-compat/generated/origin-server-api.json` when this evidence changes.

## 5. 常用自动化指令（Commands）

- None — evidence only.
