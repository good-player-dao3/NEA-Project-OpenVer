---
title: "From 0 to 1: Publishing Your First-Ever NPM Package"
source: "https://docs.dao3.fun/arenapro/en/guide/07-publishing/createNPMProject.html"
---

# From 0 to 1: Publishing Your First-Ever NPM Package

## Do You Want to Become a "Guru" in the Community?

Imagine that in the process of developing your game, you have accumulated many useful utility functions:

- A`formatNumber`function that makes numbers display more beautifully.
- A super useful`TweenAnimation`class for easing animations.
- An`InventoryManager`that helps you handle complex inventory logic.

You think this code is great, and other Box3 creators will surely love it. At this moment, an idea pops into your head: "**Can I share my code so that others can use it too?**"

The answer is:**Of course, you can!**

By publishing your code as an**NPM package**, you can let creators worldwide use your masterpiece with a simple command:`npm install your-cool-lib`. This not only earns you praise from the community but is also an essential step to becoming an excellent creator.

This tutorial will guide you step-by-step through the entire process from 0 to 1, allowing you to become an NPM package publisher yourself.

## Phase 1: Creating Your "Code Toolbox"

First, we need a dedicated project to store the code we are preparing to share.

### Step 1: Create the Project

ArenaPro's scaffolding provides us with a dedicated "component library" template, which has all the correct configurations preset.

1. Create an**empty folder**on your computer (e.g.,`my-awesome-lib`), and then open it in VS Code.
2. Press`F1`to open the command palette and select**`Arena-Ts: New Arena-Ts Project`**.
3. In the pop-up templates, select**`Box3 Component Library (npm package)`**.
4. Fill in the information as prompted (or just press Enter all the way), and wait for the dependencies to be installed.

Now, your "code toolbox" project has been created!

### Step 2: Write Your First "Tool"

Open the`src/index.ts`file and write your utility functions in it. Remember two key points:

- **`export`**: Only functions or classes exported with`export`can be used by others.
- **JSDoc Comments (`/** ... \*/`)**: Write clear comments for all your exported functions. These comments will become the "intelligent tooltips" in other users' code and are very important!

typescript

```
// src/index.ts

/**
 * Capitalizes the first letter of a string.
 * @param str The string to convert.
 * @returns The converted string.
 * @example
 * capitalize('hello world'); // => 'Hello world'
 */
export function capitalize(str: string): string {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clamps a number within the inclusive lower and upper bounds.
 * @param value The number to clamp.
 * @param min The lower bound.
 * @param max The upper bound.
 * @returns The clamped number.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
```

### Step 3: Package Your "Toolbox"

After the code is written, we need to package it into standard JavaScript files.

Press the shortcut`Alt + Q`and wait for the terminal to show "Build successful." At this point, a`dist`folder will appear in your project, containing the compiled`.js`files and the`.d.ts`type files that provide code completion.

## Phase 2: Have a "Rehearsal" Locally Before Publishing

Publishing an untested package directly is very dangerous. We must simulate the process of "others using my package" locally to ensure it works correctly.

The`npm link`command is the "creator's power tool" born for this purpose.

### Step 1: Create a "Shortcut" in the "Toolbox" Project

In the root directory of your "toolbox" project (`my-awesome-lib`), open a terminal and run:

bash

```
npm link
```

This will create a global "shortcut" for this "toolbox" on your computer, allowing other projects to find it.

### Step 2: Use the "Shortcut" in the "Game Project"

Now, open one of your own Box3**game projects**, open a terminal in the root directory, and run:

bash

```
# Replace "my-awesome-lib" with the actual name of your toolbox (i.e., the name field in package.json)
npm link my-awesome-lib
```

This will install a "shortcut" pointing to your "toolbox" in your game project.

### Step 3: Test in the Game

Now, in your game code, you can import and use your utility functions just like any other library!

typescript

```
import { capitalize, clamp } from "my-awesome-lib";

const newName = capitalize("arena"); // 'Arena'
const safeHealth = clamp(120, 0, 100); // 100
```

The best part is that this link is**live**. If you find a bug, you just need to go back to the "toolbox" project, modify the code, and repackage (`Alt+Q`). The changes will take effect immediately in the game project without any extra steps! This greatly improves debugging efficiency.

## Phase 3: Publish! Let the World See Your Work

When you've confirmed everything is perfect through your local "rehearsal," you can officially publish.

### Step 1: Register and Log in to NPM

> If you don't have an NPM account yet, please go to the[npmjs.com](https://www.npmjs.com)website to register for one for free.

In the terminal of your "toolbox" project, run`npm login`and enter your username, password, and email as prompted.

### Step 2: Check Your "ID Card" (`package.json`)

`package.json`is the "ID card" of your package. Before publishing, make sure the key information is correct:

- `name`: The package name must be**globally unique**. If the name is already taken, a common practice is to use a scoped package name, such as`@your-npm-username/my-awesome-lib`.
- `version`: The version number, e.g.,`1.0.0`. You need to increment this version number for each new release.

### Step 3: Execute the Publish Command

With everything ready, run the following in the root directory of your "toolbox" project:

bash

```
npm publish
```

If your package name is scoped (e.g.,`@username/my-lib`), you need to add the`--access=public`parameter to tell NPM that this is a public package:

bash

```
npm publish --access=public
```

A few seconds later, your package will appear on the NPM website, waiting to be discovered and used by creators around the world!

## Phase 4: Use Your Own Package Just Like You Use Lodash

Now, your package is a real, public NPM package. Say goodbye to`npm link`and let's use it in the most standard way.

In any new project, you can use it in just two steps:

1. **Install**:`npm install my-awesome-lib`
2. **Use**:`import { capitalize } from "my-awesome-lib";`

Because you carefully wrote JSDoc comments before, all creators who use your package will enjoy the same perfect "intelligent tooltips" as you do.

Congratulations! You have completed all the steps from 0 to 1 and contributed your own strength to the open-source community. This is definitely an achievement worth showing off to your friends!
