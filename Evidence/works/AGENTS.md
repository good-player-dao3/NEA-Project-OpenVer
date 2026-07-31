# AGENTS.md — works/

## 1. 核心使命（Project DNA）

Public work catalog. Maps used for validation are cataloged here; their material lives under `works/private/<work-id>/` (gitignored). Work names/identifiers must never appear in runtime branches, ABI identifiers, conformance behavior, or generated reports (anonymous script-corpus samples only).

## 2. 目录导航地图（Path Mapping）

- `README.md` — the only tracked file; defines the catalog and the required `work-manifest.json` schema for private work dirs.

## 3. 技术栈与环境约束（Tech Stack）

- No code, no tests — catalog and manifests only.

## 4. 给 AI 的特殊指令（Behavior Rules）

- Never move private work sources into tracked fixtures. Convert only minimum behavior into redacted ABI evidence, conformance fixtures, or reports.
- `dump/private/live-captures/` stays the immutable provenance; `works/private/` is a development copy, never a replacement.
- Each private work dir should carry `work-manifest.json` (id, label, capture dir, completeness, analysis paths).

## 5. 常用自动化指令（Commands）

- None — catalog only.
