# AGENTS.md — dao3-docs-mirror/

## 1. 核心使命（Project DNA）

Local mirror of public dao3.fun documentation. Evidence input for ABI extraction. A docs declaration establishes a surface name/signature — never engine behavior.

## 2. 目录导航地图（Path Mapping）

- `site/` — raw static mirror (README.txt, mirror-manifest.json, view.goboxgame.com_*.js bundles, `api/`, `arena/`, `arenapro/`, `voxa/`).
- `markdown/` — markdown export (`api/`, `arena/`, `arenapro/`, `voxa/`, `conversion-manifest.json`). Source for `runtime-compat` extraction.
- `mirror_docs.py` — refreshes the raw mirror.
- `convert_to_markdown.py` — converts raw pages to `markdown/`.
- `rendered-pages.json` — record of rendered page URLs.

## 3. 技术栈与环境约束（Tech Stack）

- Python tooling; static HTML/JS evidence payloads.

## 4. 给 AI 的特殊指令（Behavior Rules）

- Static evidence: refresh via `mirror_docs.py` / `convert_to_markdown.py`, don't hand-edit exported pages.
- `markdown/` feeds `runtime-compat/tools/extract-doc-api.mjs`. Regenerate `runtime-compat/generated/` when the mirror changes.

## 5. 常用自动化指令（Commands）

```bash
python mirror_docs.py
python convert_to_markdown.py
```
