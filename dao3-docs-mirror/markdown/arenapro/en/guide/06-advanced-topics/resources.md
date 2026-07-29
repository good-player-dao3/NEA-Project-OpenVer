---
title: "🗂️ Resource Manager: Manage Your Game Assets in VS Code"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/resources.html"
---

# 🗂️ Resource Manager: Manage Your Game Assets in VS Code

In game development, you frequently need to switch between code and game assets (like models, images, and UI). To simplify this workflow, ArenaPro includes a powerful**Resource Manager**built into VS Code, allowing you to easily manage all your cloud-based map assets without leaving the editor.

> **👉[Open Resource Manager with One Click](vscode://box3lab.box3arenapro/command?type=ap.file.openArena)**

![Arena Resource Manager Overview](/arenapro/QQ20241129-201037.png)

## 📦 Supported Asset Types

In "Expanded Map" mode, the Resource Manager lets you access and manage the shared resources of the current map and all its sub-maps.

| Asset Type | Description |
| --- | --- |
| 🧊**Models** | 3D models, scene props |
| 🖼️**Images** | UI textures, icons, textures |
| 🖥️**UI Interfaces** | Interface layouts created with the UI editor |
| 💾**Data Spaces** | For storing persistent game data |
| 👤**Player Skins** | Custom character appearances |
| 🎵**Audio** | Background music, skill sound effects |

## ⚙️ Core Functions and Operations

### Browsing and Copying

The core function of the Resource Manager is to help you quickly find assets and get their paths.

| Operation | Description |
| --- | --- |
| **Centralized Browsing** | Browse all cloud resources directly in the VS Code sidebar. |
| **Copy Path** | **Click**on an asset to quickly copy its path for pasting into your code. |
| **Context Menu** | **Right-click**on an asset for more options like previewing and renaming. |

### Refresh Mechanism

To ensure you are always seeing the latest assets, the Resource Manager provides both automatic and manual refresh methods.

#### Automatic Refresh Triggers

| Trigger | Refresh Behavior |
| --- | --- |
| **Initial List Expansion** | Automatically pulls the latest list of resources. |
| **Account Login/Logout** | Automatically syncs map resources for the current account. |
| **Project Config Change** | Automatically refreshes resources when linking to a new map. |

#### Manual Refresh

When you modify assets in the Box3 Editor (e.g., uploading a new model), you need to sync them manually.

| Operation | Description |
| --- | --- |
| **Click Refresh Button** | Click the "Refresh" icon in the top-right corner of the panel. |
| **Right-Click to Refresh** | Right-click in an empty area of the resource panel and select "Refresh". |

Tip

**💡 Best Practice**While manually copying paths is convenient, it doesn't provide compile-time safety checks. For core game logic, we highly recommend using the**[Type-Safe Asset Synchronization](./asset-synchronization.md)**feature, which provides autocompletion and error checking as you code.

---
