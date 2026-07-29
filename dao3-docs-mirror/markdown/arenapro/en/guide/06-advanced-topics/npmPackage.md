---
title: "Advanced Guide: Safely Using External NPM Packages"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/npmPackage.html"
---

# Advanced Guide: Safely Using External NPM Packages

You want to use an open-source state management library (like`zustand`) or a powerful date handling tool (like`dayjs`) in your project. You open the terminal and skillfully prepare to type`npm install`.

But, you should ask yourself a crucial question: "Will this package run in ArenaPro?"

The answer is**"maybe."**This guide will teach you how to make wise, safe choices, allowing you to confidently leverage the powerful ecosystem of NPM while avoiding the "traps" that can crash your project.

## The Golden Rule: Compatibility Above All

Before you install any NPM package, you must understand this golden rule:**Not all NPM packages can run in the ArenaPro environment**.

ArenaPro's script execution environment is a unique sandbox; it is neither a standard Node.js nor a standard browser. If an NPM package depends on APIs specific to Node.js or the browser, it will fail to run in ArenaPro.

**A package is usually incompatible for two reasons**:

1. **Depends on Node.js-specific APIs**: The package internally uses`require('fs')`(file system),`require('http')`(network services),`require('path')`, etc., which are Node.js backend modules.
2. **Depends on browser-specific APIs**: The package internally uses`document`,`window`,`localStorage`, etc., which are browser DOM and global objects.

**What kind of packages are most likely to be compatible?**

- **Pure algorithm/utility libraries**: Such as math calculations, data structures, functional programming tools (like Lodash).
- **Libraries with few or no dependencies**: On the NPM website, its "Dependencies" list is empty or very small.
- **Libraries explicitly marked as "Isomorphic" / "Universal"**: This usually means the author has specifically designed it to run in any JavaScript environment.

## Practical Exercise: Installing and Using`lodash-es`

`lodash-es`is the ES Module version of the legendary utility library`lodash`. It consists entirely of pure utility functions that do not depend on any specific environment.

### Step 1: Install the Package

Open your terminal and run the following command:

bash

```
npm install lodash-es
```

Also, to help TypeScript understand Lodash's types, we need to install its type definition file (as a development dependency):

bash

```
npm install @types/lodash-es --save-dev
```

### Step 2: Import and Use in Your Code

Now, you can import functions provided by`lodash-es`in your code just like any local module.

**Example: Using`clamp`and`debounce`**

ts

```
// client/src/inputManager.ts

// Import the required functions from lodash-es
import { clamp, debounce } from "lodash-es";

// 1. Use the clamp function to ensure health does not exceed or fall below a preset range
function applyDamage(player, amount) {
  const currentHealth = player.getData("health");
  const newHealth = currentHealth - amount;
  // clamp(number, min, max)
  player.setData("health", clamp(newHealth, 0, 100));
}

// 2. Use the debounce function to prevent the player from triggering a skill too frequently
function onPlayerUseSkill() {
  console.log("Skill has been cast! Cooling down...");
  // Actual skill logic
}

// Create a debounced version of the function that will only execute 2 seconds after the last call
// Perfect for handling skill cooldowns, preventing multiple clicks, etc.
const debouncedSkillHandler = debounce(onPlayerUseSkill, 2000, {
  leading: true, // Execute immediately on the first click
  trailing: false, // Do not execute again after the end
});

// In the event listener, use our debounced handler function
// player.onKey('Q', debouncedSkillHandler);
```

`lodash-es`provides hundreds of useful utility functions like these that can greatly simplify your code.

## Checklist: How to Review a Package's Compatibility?

Before you`npm install`a new package, take two minutes to do a quick "security check":

1. **Visit[npmjs.com](https://www.npmjs.com/)**: Search for the package you want.
2. **Check Dependencies**: On the right side of the package page, check the dependency list. The fewer and "purer" the dependencies, the higher the chance of compatibility.
3. **Look for Keywords**: In its`README`, use`Ctrl+F`to search for terms like "isomorphic", "universal", "zero dependency", "browser support".
4. **Browse the Code (Spot Check)**: Click the "Repository" link to go to its GitHub repository. Randomly open a few files in the`src`directory and use`Ctrl+F`to search for keywords like`require('fs')`or`window.`. If you find them, it's likely incompatible.
5. **Check`package.json`**: Find the`package.json`file in the GitHub repository. If it contains both`"main"`and`"browser"`fields, this is a very strong signal that the author has considered cross-environment compatibility.

## Official Guarantee: The`@dao3fun`Namespace

To make it easier for creators, ArenaPro also provides a series of NPM packages, all published under the`@dao3fun`namespace (e.g.,`@dao3fun/arena-rich`).

**All packages under`@dao3fun`have been tested and optimized, and are 100% guaranteed to be compatible with the ArenaPro environment.**

When you need to implement a certain feature (like rich text, UI components, etc.), we recommend that you**first**look for a ready-made solution in`@dao3fun`. This is much safer and more efficient than finding and testing third-party packages from the community yourself.

---

With these steps, you can safely introduce, manage, and update third-party NPM packages in your ArenaPro project, greatly expanding your development capabilities.
