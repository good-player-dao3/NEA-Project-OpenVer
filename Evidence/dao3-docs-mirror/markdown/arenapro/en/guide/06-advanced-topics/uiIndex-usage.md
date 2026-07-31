---
title: "ArenaPro UI Index Usage Guide"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/uiIndex-usage.html"
---

# ArenaPro UI Index Usage Guide

## Still stuck in "path hell"?

> You hunt for nodes in the UI tree: deep nesting, inconsistent naming, and one structure change breaks everything. You keep asking:
>
> - “What is the exact full path for this`UiText`?”
> - “After changing UI hierarchy, all my string paths broke!”
> - “I just want the element, not another round of path spelunking…”

Starting from V1.4.0, ArenaPro provides a “UI Index” feature—like a map index, reach target elements via “ScreenName + NodeName” and stop wrestling with paths.

### Example

ts

```
// Before (path hell): any hierarchy change forces manual string updates
const el = UiScreen.getAllScreen()
  .find((e) => e.name === "blackground")
  .findChildByName("blackground")
  .findChildByName("root")
  .findChildByName("container")
  .findChildByName("panel")
  .findChildByName("box")
  .findChildByName("unit")
  .findChildByName("list")
  .findChildByName("0")
  .findChildByName("content")
  .findChildByName("content1");
console.log(el?.name);

// Now (UI Index): strongly-typed direct access by "Screen + Node"
const idx = find("blackground");
console.log(idx?.uiText_content1.name); // type-safe, autocompletion; re-sync index after structure changes
```

## What does UI Index bring?

UI Index is a strongly-typed projection of your UI tree. For each screen, it generates a screen-specific index class and exposes a unified entry to retrieve index instances:

| You’ll get… | Which means… |
| --- | --- |
| **🔎 Strongly-typed access** | Access UI elements via properties with IDE autocomplete and visible types. |
| **🧭 Free from string paths** | No more hardcoded paths; hierarchy changes won’t force mass string updates. |
| **⚡ Warm up once, then fast** | Pre-warms a cache at construction using a path table; subsequent reads are O(1). |
| **🧩 Naming conflict handling** | Uses leaf name first, then full path, then adds suffix numbers to ensure usable names. |
| **✅ Types enforce contracts** | Nonexistent screen names are`never`at type level; runtime missing screens return`undefined`. |

Tip

💡 Core advantage: The UI Index is an auto-generated, auto-maintained “strongly-typed mirror” of your UI. You fetch by screen name; the type system and cache do the rest.

## How to get and use it

### Generate index files

- Trigger “Sync map resources” (e.g., press`Alt+Y`) or related commands; the extension scans the UI tree and generates the index files automatically.
- Generated directory structure (auto-generated; do not edit):

```
client/UiIndex/
  ├─ index.ts                // Entry, default export: find()
  ├─ ClientUIWindow.ts       // Base class (cache, find-by-path, warmup)
  └─ screens/
      ├─ UiIndex_home.ts     // Example: home screen index class
      └─ UiIndex_xxx.ts      // Other screen index classes
```

> If you see imports like`@client/UiIndex`, it means an alias is configured in your project and can be used directly.

### Quick start

ts

```
import find from "@client/UiIndex";

// 1) Get a strongly-typed index instance by screen name
const idx = find("blackground");
if (idx) {
  // 2) Access UI elements via strongly-typed properties
  idx.uiText_content1;
  idx.uiImage_logo;
}
```

Key points:

- The return type of`find(name)`depends on`name`:
  - If the screen name exists in the type map -> returns the corresponding`UiIndex_xxx`instance type.
  - If the screen name does not exist -> the return type is`never`(compile-time error surfaces immediately).
- At runtime, if the screen is indeed missing,`find()`returns`undefined`; hence the null-check in the example.
- Performance:`find(name)`is cached per screen; repeated calls reuse the same instance and do not reconstruct.

### Common actions checklist

- **Get index instance**:`const idx = find("home")`and add a null-check.
- **Access elements**:`idx.uiText_title`,`idx.uiImage_logo`, etc.
- **Inspect real paths**: Open`UiIndex_<Screen>.ts`and check`static PATHS`or getter comments.
- **After structure changes**: Re-sync resources to regenerate indexes and avoid path maintenance toil.

## Feature overview

- Get a “screen index instance” by screen name, then access UI elements via strongly-typed properties.
- Auto-generates a`UiIndex_<Screen>`class per screen, plus a unified`index.ts`entry and`ClientUIWindow.ts`base class.
- Automatic naming conflict resolution: prefer leaf name; fall back to full path; if still conflicting, append a numeric suffix.
- Cache warmup: on first construction, caches nodes according to a`PATHS`table; later reads don’t re-search.
- Type safety: passing a nonexistent screen name returns`never`at the type level; runtime missing screens return`undefined`.

## How it’s generated

- After sync or relevant commands, the extension scans the UI tree and generates the files above (automated flow).
- The generated files are tool-managed; do not edit them directly. If you need changes (naming/output style), please file a request.

> If you see imports like`@client/UiIndex`, it means an alias is configured in your project and can be used directly.

## UI Data

- **Unified META (strongly typed)**
  - Each screen class generates`static readonly META`, one-to-one with`PATHS`.
  - `META[i].path`now references`PATHS[i]`instead of duplicating strings for a single source of truth.
  - `META[i].type`is narrowed to the union:`'UiBox' | 'UiImage' | 'UiInput' | 'UiScrollBox' | 'UiText'`.
- **findBy moved to base class with stronger types**
  - Now located in`ClientUIWindow`and inherited by all screen classes.
  - Supported call forms:
    - `findBy(predicate)`– filter by predicate, where`el`is typed as`UiElement | undefined`.
    - `findBy(kind, predicate?)`– first filter by kind;`el`will be narrowed according to`kind`(e.g.,`UiImage | undefined`).
  - Return value: when there are matches -> returns the hits array; when no matches ->`undefined`.
  - Examples:ts`consttexts=idx?.findBy("UiText");constimgs=idx?.findBy("UiImage", (meta,el)=>el?.visible===true);consthits=idx?.findBy((meta,el)=>meta.name.includes("btn"));`
- **Instance methods: getPaths / getMeta**
  - `getPaths(): ReadonlyArray<string>`returns the current screen's`PATHS`.
  - `getMeta(): ReadonlyArray<{ path: string; type: UiKind; name: string }>`returns`META`(handy for debugging/visualization).

## API Reference

### 1) Default export: find(screenName)

- Purpose: Get the UI index instance for the given screen name.
- Types:ts`exportdefaultfunctionfind<Nameextendsstring>(screenName:Name):Nameextendskeyoftypeof__UiIndexCtorMap?InstanceType<(typeof__UiIndexCtorMap)[Name]>:never;`
- Runtime return: A`UiIndex_xxx`instance or`undefined`(if the screen does not exist).
- Typical usage:ts`constidx=find("home");if(idx) {idx.uiText_title;}`

### 2) Screen index class:`UiIndex_<Screen>`

- Each screen has a dedicated class extending`ClientUIWindow`.
- Key members:
  - `static readonly PATHS: readonly string[]`: Full path table of nodes to cache under this screen.
  - Strongly-typed getters: e.g.,`get uiText_title(): UiText`reading from cache by`PATHS[i]`and casting to type.

### 3) Base class: ClientUIWindow

- Responsibilities:
  - Maintains a cache table keyed by full path (`__cache`).
  - Provides`getByPath(path)`to look up elements by full path.
  - Warms up the cache on construction using`PATHS`.
- Key methods:
  - `protected getByPath(path: string): UiScreen | UiElement | undefined`
  - `private __warmup(): void`

## Naming rules

- Prefixes bound to types:
  - `UiText`->`uiText_...`
  - `UiImage`->`uiImage_...`
  - `UiBox`->`uiBox_...`
  - `UiScrollBox`->`uiScrollBox_...`
  - `UiInput`->`uiInput_...`
- Base naming uses the last path segment; on conflicts, fall back to full path; if still conflicting, append`_2/_3/...`.
- Supports Chinese/Unicode; invalid characters are replaced with underscores while ensuring a valid first character.

## uiIndexPrefix configuration and behavior

- Location:`dao3.config.json -> file.typescript.client.uiIndexPrefix`
- Type and default: string, default empty`""`(filter disabled)
- What it does:
  - If set, e.g.`"U_"`, only UI nodes with names starting with this prefix will be collected to generate the index.
  - The generated getter names will automatically strip this prefix to avoid`uiText_U_title`style names.
  - When not set or empty, all nodes are indexed.

Example config:

json

```
{
  "file": {
    "typescript": {
      "client": {
        "uiIndexPrefix": "U_"
      }
    }
  }
}
```

Example effect:

- Actual node names:`U_title`,`U_logo`,`desc`
- Generated results:
  - `U_title`-> getter:`uiText_title`
  - `U_logo`-> getter:`uiImage_logo`
  - `desc`-> not generated (prefix not matched)
- `PATHS`keeps real names (e.g.,`.../U_title`); only getter names strip the prefix; runtime lookups are unaffected.

## Best practices

- Store screen names in constants to avoid typos:ts`constSCREEN_HOME="home"asconst;consthome=find(SCREEN_HOME);`
- Add a null-check for`find()`returns to gracefully degrade when a screen is not mounted at runtime.
- If you want to tweak generation style (comments, blank lines, indentation, export style), do it in the generator layer rather than editing generated outputs.

## FAQ

- Q: I passed a screen name and the type is`never`?
  - A: The screen name is not in the type map—likely the cache hasn’t been regenerated or the name is misspelled. Please ensure the screen name and generated outputs are up to date.
- Q: Runtime returns`undefined`?
  - A: The screen was not found at instantiation. Ensure the screen exists/is mounted; add null-checks at call sites.
- Q: How to find the real path behind a getter?
  - A: Open the corresponding`UiIndex_<Screen>.ts`and inspect`static PATHS`or the`@description`in getter comments.

## Feedback

If you have requests for naming conventions, directory structure, comment templates, or import styles, please send feedback. We’ll iterate on the generator and type hints to improve the experience.
