---
title: "Develop with VS Code Workspaces"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/vscode-workspace.html"
---

# Develop with VS Code Workspaces

Many teams maintain multiple map projects, toolkits, and shared modules at the same time. Instead of juggling multiple VS Code windows, use a Workspace to open them in a single window and get unified search, tasks, and settings.

This page shows how to create and use a VS Code Workspace in the ArenaPro context to improve multi-project collaboration.

## Recommended structure (example)

```
my-workbench/                   # Your working bench (any name)
  my-map/                       # Map project A (ArenaPro project)
  my-map-2/                     # Map project B (optional)
  my-utils/                     # Team local/private toolkit (local package)
  my-workbench.code-workspace   # The workspace file (core)
```

> You can also keep projects in different locations. Just “Add Folder to Workspace…” in VS Code; they don’t have to be siblings.

## Create the Workspace file

1. In VS Code:

- File → Add Folder to Workspace… → add`my-map`,`my-utils`, etc.
- File → Save Workspace As… → save as`my-workbench.code-workspace`in a convenient location (ideally a common parent folder).

1. Later, open the`.code-workspace`file to launch all related projects at once.

## One-click open for your team

- Pin`my-workbench.code-workspace`to your dock/taskbar or “Recent” list in VS Code for one-click access to the multi-project environment.
- Share this file with teammates (mind path differences) to align on environment and extensions quickly.

---

By consolidating related projects into a single VS Code Workspace, you’ll get smoother collaboration: unified search/formatting/task views and clearer switching between projects. Pair it with npm workspaces or a monorepo to cover both editor and package-management workflows.
