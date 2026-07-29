---
title: "In-depth Debugging: A Guide to VS Code Breakpoint Debugging"
source: "https://docs.dao3.fun/arenapro/en/guide/04-development-workflow/debugger.html"
---

# In-depth Debugging: A Guide to VS Code Breakpoint Debugging

`console.log()`is a great tool for quick checks, but when facing complex logic, you need a more professional weapon:**Breakpoint Debugging (Debugger)**. It allows your code to "pause" at any point, letting you inspect every detail like a detective.

Warning

**⚠️ Note**: Currently, setting breakpoints directly on Box3's built-in APIs (like`world.createEntity()`) is not supported.

## Core Concept Before Debugging: Compilation Mode

Before starting to debug, you need to choose a code compilation mode. This determines how your code is packaged and how convenient debugging will be.

| Compilation Mode | Characteristics | Recommendation |
| --- | --- | --- |
| **HMR Compilation** | Automatically watches for file changes and compiles incrementally.**Supports breakpoints directly in`.ts`files**. | ⭐⭐⭐⭐⭐<br>**Highly Recommended** |
| **Full Compilation** | Repackages all code every time. Breakpoints can only be set in the compiled`.js`files. | ⭐⭐<br>**Alternative Choice** |

**Conclusion: When using breakpoint debugging, always use the HMR compilation mode.**

## TypeScript Breakpoint Debugging Workflow (HMR Mode)

This is the most common and efficient debugging process.

### 1️⃣ Create a Debug Configuration File (`launch.json`)

If this is your first time debugging in the project, you need to generate a`launch.json`file to tell VS Code how to start.

1. Click the "Run and Debug" icon (🐞) on the left side of VS Code.
2. Click the**“create a launch.json file”**link.![Create launch.json file](/arenapro/QQ20241101-111306.png)
3. In the list that appears, select a debug type.![Select debug configuration](/arenapro/QQ20241101-111542.png)After selection, VS Code will automatically generate the configuration for you in`.vscode/launch.json`. You can add more debug types by clicking the "Add Configuration" button in the bottom right.
  - **`ArenaPro Server Debugger`**: Debugs server-side code (`server/`)
  - **`ArenaPro Client Debugger`**: Debugs client-side code (`client/`)

### 2️⃣ Start and Configure HMR

1. Click the**`HMR Compile`**button in the bottom-left corner of VS Code to start the HMR service.
2. **(Recommended)**To avoid interference, click the "gear" icon next to HMR and**disable "Auto Upload After Compilation"**.![Disable upload feature](/arenapro/QQ20241101-112658.png)
3. **(Recommended)**Click the "gear" icon and**enable "Debugger Mode"**.![Enable debugger mode](/arenapro/QQ20241101-142736.png)

### 3️⃣ Set Breakpoints and Start Debugging

1. Open any**`.ts`**file you want to debug (e.g.,`server/App.ts`).
2. **Click**to the left of the line number to set a**red dot**breakpoint.
3. Press the**`F5`**key (or click the green start button in the "Run and Debug" sidebar) to start debugging!

![Debugging process](/arenapro/QQ20241101-125949.png)

When the game logic executes to your breakpoint, the code will pause, and you can view the real-time status of all variables in VS Code.

## Debugging Tips and Tools

### Debug Toolbar

| Icon | Name | Shortcut | Function Description |
| --- | --- | --- | --- |
| ▶️ | **Continue** | `F5` | Continue execution until the next breakpoint or the program ends. |
| ↪️ | **Step Over** | `F10` | Execute the current line; if it's a function, execute it completely without stepping into it. |
| ⤵️ | **Step Into** | `F11` | Execute the current line; if it's a function, step into it. |
| ⤴️ | **Step Out** | `Shift+F11` | Finish executing the current function and step out to where it was called. |
| 🔄 | **Restart** | `Ctrl+Shift+` | Restart the current debugging session. |
| ⏹️ | **Stop** | `Shift+F5` | End the current debugging session. |

### Breakpoint Types

| Breakpoint Type | Use Case | How to Set |
| --- | --- | --- |
| Regular Breakpoint | Pause execution at a specific line | Click to the left of the line number |
| Conditional Breakpoint | Pause only when a condition is met | Right-click the breakpoint →`Edit Condition...` |
| Logpoint | Output a log message instead of pausing | Right-click the breakpoint →`Add Log Message...` |

### Debug Sidebar Windows

| Window | Function Description |
| --- | --- |
| **Variables** | View and modify the values of variables in the current scope. |
| **Watch** | Add custom expressions to continuously monitor their value changes. |
| **Call Stack** | Shows how the current code was called, layer by layer. |
| **Breakpoints** | Centrally manage all breakpoints set in the project. |

With this tutorial, you have mastered the core skills of using VS Code for breakpoint debugging in an ArenaPro project. This will be a powerful weapon for solving complex problems and improving code quality.
