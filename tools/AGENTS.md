# AGENTS.md — tools/

## 1. 核心使命（Project DNA）

Small maintenance helpers (repo root, no package.json, no tests). Keep dependency-light.

## 2. 目录导航地图（Path Mapping）

- `build-mudb.mjs` — compiles vendored `mudb/schema` + `mudb/stream`; no-op when outputs are fresh; installs pinned TypeScript into gitignored `tools/.mudb-toolchain/` on first run. Reused by demo-map prebuild. Flags: `--check`, `--force`.
- `apply_patch.ps1` / `apply_patch.py` — required patch wrapper for the Windows workspace.
- `organize-workspace.ps1` — workspace layout maintenance.

## 3. 技术栈与环境约束（Tech Stack）

- ESM scripts; PowerShell for Windows helpers.

## 4. 给 AI 的特殊指令（Behavior Rules）

- Keep dependency-light. See `mudb/AGENTS.md` for build output policy.

## 5. 常用自动化指令（Commands）

```bash
node tools/build-mudb.mjs [--check|--force]
.\tools\organize-workspace.ps1 [-Apply]
```
