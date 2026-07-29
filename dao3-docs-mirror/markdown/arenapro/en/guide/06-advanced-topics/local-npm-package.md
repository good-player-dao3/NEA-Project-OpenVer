---
title: "Guide: Using Local Private NPM Packages in Your Team"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/local-npm-package.html"
---

# Guide: Using Local Private NPM Packages in Your Team

This guide targets team-internal libraries (utils/ui/core, etc.) that are not publicly published. It explains how to use local, private packages in ArenaPro projects without pushing them to a public registry.

## When should you use a local package?

- You have reusable libraries shared across multiple maps/projects, but you don’t want to expose them publicly.
- You want fast iteration and validation without a full publish workflow.
- You need a reproducible installation process in CI/CD, while avoiding dependency on public registries.

## Option 1:`file:`dependency (simple and stable)

If your package folder sits nearby your project, point to it in your project’s`package.json`via`file:`.

1. Example structure:

```
my-project/              # your ArenaPro project
../my-utils/             # your local package (a sibling folder)
```

1. Declare the dependency in`my-project/package.json`:

json

```
{
  "name": "my-project",
  "type": "module",
  "dependencies": {
    "my-utils": "file:../my-utils"
  }
}
```

1. Install dependencies:

bash

```
npm install
```

After installation,`node_modules/my-utils`will be a local link to`../my-utils`(not downloaded from the internet).

1. Use it in code:

ts

```
// client/src/index.ts
import { clampToRange } from "my-utils";

export function heal(player, amount) {
  const hp = player.getData("hp");
  player.setData("hp", clampToRange(hp + amount, 0, 100));
}
```

- Pros: Simple, stable, works across platforms; CI/CD friendly.
- Cons: When editing`../my-utils`, you might need to restart the build or reinstall if caches don’t pick up changes.

> Tip: In your local package, set`"sideEffects": false`and export as ESM to enable better tree-shaking.

## Option 2:`npm pack`+ install tarball

When you want to validate your package under conditions close to a real publish (e.g., ignored files, build outputs,`exports`field), package it into a tarball and install it.

1. In the local package directory:

bash

```
npm pack
```

This generates a tarball like`my-utils-1.0.0.tgz`.

1. Install the tarball in the project directory:

bash

```
npm install ../my-utils/my-utils-1.0.0.tgz
```

- Pros: Very close to real publish behavior; ideal for pre-publish self-testing.
- Cons: You need to repack and reinstall after each change.

## FAQ

- Import fails:`ERR_MODULE_NOT_FOUND`
  - Check that`exports`/`main`point to actual built outputs.
  - Ensure`type: "module"`and ESM entry are consistent.
- ESM/CJS incompatibility:`require is not defined`or`Cannot use import statement outside a module`
  - Standardize on ESM output, or provide both ESM/CJS via`exports`and prefer ESM in the project.
- Edits in the local package don’t take effect immediately
  - With`file:`: restart the build or reinstall; clear bundler caches.
  - With`npm pack`: re-run`npm pack`and reinstall the new`.tgz`in the project.
- Missing types: editor cannot find`.d.ts`
  - Add`"types": "dist/index.d.ts"`in`package.json`and ensure the file exists.

## Which option should I choose?

- Prefer`file:`for simple, stable, and out-of-the-box workflows.
- Prefer`npm pack`+ tarball installation for pre-publish validation and CI/CD reproducibility.

> For distributed teams, non-co-located folders, or advanced access control, consider a private registry (e.g., Verdaccio / GitHub Packages / GitLab Package Registry). That follows a “private publish” route and is out of scope for this page.
