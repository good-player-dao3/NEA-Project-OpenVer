# AGENTS.md — dump/

## 1. 核心使命（Project DNA）

Historical evidence and capture output home. Vetted tracked evidence is read-only; live captures stay private, forever.

## 2. 目录导航地图（Path Mapping）

- `recovered-engine-assets/` — vetted engine assets (`engine/`, `manifest.json`).
- `recovered-avatar-assets/` — vetted avatar assets (`avatar/`, `manifest.json`).
- `dump/private/` — live captures, browser profile, archives (gitignored).
- `dump/` (subdir) — historical dump evidence.

## 3. 技术栈与环境约束（Tech Stack）

- Asset payloads only — no code, no tests.

## 4. 给 AI 的特殊指令（Behavior Rules）

- `recovered-engine-assets/`, `recovered-avatar-assets/`: vetted, tracked evidence — read-only, never regenerate.
- `dump/private/` (live captures, browser profile, archives): gitignored, private, never committed or referenced in tracked files except as anonymous inventories (`runtime-compat` posture/network inventories already redact payloads, URLs, session IDs).
- Generated reports may count items but must not publish names or content from private captures.

## 5. 常用自动化指令（Commands）

- None — evidence only.
