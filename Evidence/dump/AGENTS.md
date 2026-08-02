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
- `dump/private/` (live captures, browser profile, archives): gitignored and private, but may be read locally for a declared audit or implementation task. Use the minimum required files and do not modify, stage, commit, or expose the source, private paths, payloads, URLs, session IDs, identities, or browser state.
- Derived reports may publish only anonymous inventories, counts, schemas, capability classifications, or non-secret hashes. Each report must record source class, redaction status, public/private status, and reproducibility limits without identifying the private source.

## 5. 常用自动化指令（Commands）

- None — evidence only.
