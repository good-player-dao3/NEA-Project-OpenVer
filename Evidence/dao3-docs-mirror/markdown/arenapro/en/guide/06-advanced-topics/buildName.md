---
title: "Tutorial: One Codebase, Two Packages: \"Standard Edition\" and \"Event Edition\""
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/buildName.html"
---

# Tutorial: One Codebase, Two Packages: "Standard Edition" and "Event Edition"

## Phase 1: Define multi-entry and output names in JSON

As your sub-maps grow with different logic, hard-coding entries and output names in scripts becomes hard to maintain. Separate data from logic: let`dao3.config.json`decide “which entry to build and what the output is called.”

json

```
{
  "ArenaPro": {
    "file": {
      "outputAndUpdate": [
        "bundle.js",
        {
          "name": "bundle2.js",
          "serverEntry": "src/App2.ts",
          "clientEntry": "src/clientApp2.ts",
          "description": "Second module example; customize as needed."
        }
      ]
    }
  }
}
```

Conventions (aligned with detailed sections below):

- The first array item is the “active” build config.
- Each item can be a string or an object:
  - String: only specifies the output file name (e.g.,`"bundle.js"`).
  - Object: specifies output name and multiple entries (`serverEntry`/`clientEntry`).
- HMR only processes object items, not string items.

## Phase 2: Type your “config contract” with TypeScript

Add a type-safe contract so your editor can auto-complete fields and catch typos.

ts

```
// types/build.ts

/** A single build item (string or object) */
export type OutputAndUpdateItem =
  | string
  | {
      /** Output file name (without _server_/_client_ prefixes) */
      readonly name: string;
      /** Server entry file path */
      readonly serverEntry?: string;
      /** Client entry file path */
      readonly clientEntry?: string;
      /** Description for teamwork communication */
      readonly description?: string;
    };

/** Top-level (partial) config */
export interface ArenaProFileConfig {
  readonly outputAndUpdate: ReadonlyArray<OutputAndUpdateItem>;
}

export interface Dao3Config {
  readonly ArenaPro: {
    readonly file: ArenaProFileConfig;
  };
}
```

Benefits:

- Auto-completion for`name`,`serverEntry`,`clientEntry`.
- Immediate feedback for misspelled fields.
- Clear semantics per field, improving team communication.

## Phase 3: Safely read the config in your build script

Read the first item as the current target and derive unified output names:

ts

```
// scripts/build.ts
import fs from "node:fs";
import path from "node:path";
import type { Dao3Config, OutputAndUpdateItem } from "./types/build";

const configPath = path.resolve(process.cwd(), "dao3.config.json");
const raw = fs.readFileSync(configPath, "utf-8");
const config = JSON.parse(raw) as Dao3Config;

const list = config.ArenaPro.file.outputAndUpdate;
if (!list?.length) throw new Error("outputAndUpdate is empty; please provide at least one item");

const active: OutputAndUpdateItem = list[0]; // Only read the first item as the active build

// Normalize name, serverEntry, clientEntry
const name = typeof active === "string" ? active : active.name;
const serverEntry = typeof active === "string" ? "src/App.ts" : active.serverEntry ?? "src/App.ts";
const clientEntry = typeof active === "string" ? "src/clientApp.ts" : active.clientEntry ?? "src/clientApp.ts";

// Output file naming convention
const serverOut = `_server_${name}`;
const clientOut = `_client_${name}`;

console.log({ serverEntry, clientEntry, serverOut, clientOut });
// Then pass these to your bundler (esbuild/rollup/vite etc.)
```

> Tip: Want to switch the build target? Reorder the array—put the desired config at index 0. No script changes needed.

## Summary

- Separation of concerns: Describe “what to build and how to name outputs” in`dao3.config.json`.
- Type-safe guardrails: Use TypeScript types to reduce typos and ambiguity.
- Decoupled build script: Only reads the first item; outputs follow`_server_*.js`/`_client_*.js`convention.
- Fast switching: Choose target by array order; HMR only supports object items, so prefer object items during development.

## Your Map is Having a "Christmas Event"!

Imagine your map "Dream Town" is very popular. To celebrate Christmas, you're planning to launch a "Christmas Special Edition." This version needs:

- A brand new UI with falling snow.
- A special "Find Santa" quest.
- The features of the standard version need to be temporarily disabled.

The first problem you encounter is:**How do I do this?**

- **Option A (The dumbest way)**: Copy the entire project, rename it to`DreamTown-ChristmasEdition`, and then make extensive changes in the new project.
  - **Consequence**: After the event, you have to manually merge the new features back into the original project, a painful and error-prone process. Maintaining two projects at the same time doubles the cost.
- **Option B (The smart way)**: Use only**one set of code**. By modifying the configuration, you can have it package two different files:`standard.js`and`christmas.js`.

This is exactly where ArenaPro's "multi-entry" or "code splitting" feature comes in. It allows you to build different versions from the same source code, like magic.

## Unveiling the Magic:`dao3.config.json`

All our "magic" happens in one core configuration file:`dao3.config.json`.

In this file, there is a key setting called`outputAndUpdate`. It's like a "build blueprint" where you can define all the versions you want to package.

### Practical Exercise: From One Version to Two

Let's say your project's original directory structure is simple:

```
src/
├── server.ts  # Server-side main entry
└── client.ts  # Client-side main entry
```

The configuration in`dao3.config.json`might look like this:

jsonc

```
// dao3.config.json
{
  "ArenaPro": {
    "file": {
      "outputAndUpdate": [
        // --- Blueprint 1: Standard Edition ---
        {
          "name": "index.js", // Packaged file name
          "serverEntry": "src/server.ts",
          "clientEntry": "src/client.ts"
        }
      ]
    }
  }
}
```

Now, we want to add the "Christmas Edition":

**Step 1: Create a dedicated code file for the Christmas Edition**

Create a new`xmas/`folder inside the`src/`directory to store all the code specific to the Christmas event.

```
src/
├── server.ts
├── client.ts
└── xmas/       # Christmas event code
    ├── server.ts  // Server-side entry for Christmas edition
    └── client.ts  // Client-side entry for Christmas edition (e.g., loading snow UI)
```

In`xmas/client.ts`, you can write completely different UI logic.

**Step 2: Add the new version to the "blueprint"**

Now, let's modify`dao3.config.json`and add the build blueprint for the "Christmas Edition" to the`outputAndUpdate`array.

jsonc

```
// dao3.config.json
{
  "ArenaPro": {
    "file": {
      "outputAndUpdate": [
        // --- Blueprint 1: Standard Edition (unchanged) ---
        {
          "name": "index.js",
          "serverEntry": "src/server.ts",
          "clientEntry": "src/client.ts",
          "description": "The regular version of 'Dream Town'"
        },
        // --- Blueprint 2: Christmas Edition (this is new) ---
        {
          "name": "xmas.js", // New packaged file name
          "serverEntry": "src/xmas/server.ts", // Points to the Christmas edition entry
          "clientEntry": "src/xmas/client.ts", // Points to the Christmas edition entry
          "description": "The Christmas Special Edition of 'Dream Town', including special quests and UI"
        }
      ]
    }
  }
}
```

**Tip**: It is highly recommended to add a`description`field for each version. This description will be displayed when you package, helping you distinguish which version to build.

## How to Package the Version You Want?

Once the blueprints are configured, the next steps are very simple.

- If you select "index.js", it will only package the standard version.
- If you select "xmas.js", it will only package the Christmas version.

You no longer have to worry about getting them mixed up!

### In HMR (Hot Module Replacement) Mode

HMR mode is even smarter. When you start HMR, it will**monitor and compile all the versions you have defined simultaneously**.

- If you modify`xmas/client.ts`locally, HMR will immediately recompile the latest`xmas.js`.
- At this point, if you have a map open in the Box3 editor that is configured to load`xmas.js`, the game screen will be automatically hot-updated.

You don't need to do any manual switching; HMR will automatically handle the synchronization based on the file required by the map you are currently editing.

## Summary

By using the`outputAndUpdate`configuration, you have mastered a powerful ability:

- **Single Codebase, Multiple Outputs**: Maintain multiple versions like standard, event, and test versions with the same set of code.
- **Separation of Concerns**: The specific logic for different versions is clearly separated into different folders, making the code structure clearer.
- **Safe Building**: Packaging through a graphical selection box effectively avoids mistakes that might be caused by manual configuration changes.

Now, you can confidently prepare various event versions for your map!
