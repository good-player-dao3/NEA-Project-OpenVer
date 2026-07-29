---
title: "💬 Chat Ji PT: Only Knowledge Base Mode (onlyKnowledgeBase)"
source: "https://docs.dao3.fun/arenapro/en/mcp/chat-only-knowledgebase.html"
---

# 💬 Chat Ji PT: Only Knowledge Base Mode (onlyKnowledgeBase)

A quick story: you just want the “correct Box3 API usage,” but general chat often mixes in speculation. Switch to onlyKnowledgeBase: answers come strictly from the official indexed docs, with citations and links—reliable and time-saving.

---

## 1. What this mode does

- Scope: limits retrieval to the Box3 API knowledge base, avoiding hallucinations/off-topic content.
- Output: shows matched doc snippets, key facts, common errors and debugging steps, with source links.
- Good for: API usage, field semantics, error codes, permission/auth requirements—anything with authoritative docs.

---

## 2. How to open in the IDE

- Open the MCP/Agent panel and select “ArenaPro-MCP”.
- In the tool list, choose`chatjpt_onlyKnowledgeBase`(only knowledge base).
- Type your question and send.

> Tip: provide specific details (endpoint path, field name, error code, version). It improves retrieval accuracy.

---

## 3. Example and expected result

- Example prompt

text

```
Query the Box3 knowledge base: what parameters does the /maps/upload endpoint require? If it returns 401, what are common causes?
```

- Expected
  - Auth/parameter details (from doc excerpts);
  - Common causes and troubleshooting steps;
  - Links to the docs for deeper reading.

---

## 4. FAQ

- Low hit rate?
  - Use precise keywords: endpoint path, parameter names, error codes, and add context (version/module).
- Stale info?
  - Include your target version, or refresh the knowledge base index, then retry.
- Need general reasoning or cross-knowledge sources?
  - Switch out of onlyKnowledgeBase to the general chat mode.
