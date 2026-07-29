---
title: "Your Code's \"Smart Guard\": A Deep Dive into TypeScript"
source: "https://docs.dao3.fun/arenapro/en/guide/03-basic-tutorial/typescript-vs-javascript.html"
---

# Your Code's "Smart Guard": A Deep Dive into TypeScript

In our[Hello World Hands-on Tutorial](./01-hello-world-tutorial.md), you successfully wrote your first script using TypeScript (TS).

You might be wondering:

- Why do we strongly recommend using`.ts`files instead of plain`.js`files?
- What exactly are`entity`,`player`, and`<GameTextDialogParams>`in the code?
- What really happens behind the scenes when we press`Alt+Q`?

This guide will unveil the mystery behind these backstage heroes, helping you understand how TypeScript acts like a "smart guard," ensuring your code quality and development efficiency at all times.

## Core Advantage: Why is TS Your Best Choice?

You can think of TypeScript as**"JavaScript with superpowers."**It builds on JS by adding a powerful "type system," which is like putting clear, unchangeable labels on every part of your code.

typescript

```
// JavaScript: This is a regular variable that can hold anything.
let myPower = 100;
myPower = "very strong"; // In JS, this is perfectly allowed, but it might cause issues at runtime.

// TypeScript: We've labeled the variable as "must be a number."
let myPower: number = 100;
myPower = "very strong"; // 🔴 TS will immediately report an error: Cannot assign a string to a number type!
```

This system brings you three core advantages:

### 1. Catch Errors While Coding (Type Safety)

**Without TS**, many errors only surface when the game is actually "running," which greatly increases debugging difficulty.**With TS**, VS Code can tell you what's wrong with a red squiggly line the "moment" you write the code.

**Practical Example:**

In`Hello World`, we called the`dialog`API. If we accidentally misspelled a parameter name:

typescript

```
entity.player.dialog({
  type: GameDialogType.TEXT,
  title: "System Message",
  conent: "Welcome!", // 🔴 Intentionally misspelled 'content' as 'conent'
});
```

`TypeScript`will immediately draw a red line under`conent`and suggest: "'conent' does not exist in type 'GameTextDialogParams'. Did you mean to write 'content'?"

**It catches the bug the moment you make the mistake**, saving you from the frustration of testing in-game only to find the dialog doesn't appear.

### 2. Unparalleled Code Autocompletion

Because TS knows the "type definitions" of all ArenaPro APIs, it can provide you with extremely accurate autocompletion suggestions.

**Practical Example:**

When you type`entity.player.dialog({...})`, you might not remember what parameters a standard text dialog needs.

No problem! Since we told TS we want to open a "text dialog" using the generic`<GameTextDialogParams>`, when you press`Ctrl + Space`, VS Code will clearly list all available properties (`type`,`title`,`content`, etc.) for you to choose from.

You no longer need to frequently consult the documentation; you can code smoothly just by following the code hints.

### 3. Easier to Read and Maintain

When your project becomes complex, types are the best documentation. Months later, when you look back at your code, you can immediately understand what parameters a function needs and what it returns, without having to guess.

## ArenaPro's Behind-the-Scenes Workflow

You might also wonder, since the game engine only understands`.js`, how do our`.ts`files work in the game?

When we press`Alt+Q`(or click`Build`), ArenaPro's "magic packager" (Webpack) gets to work. It executes a standard modern front-end engineering process:

1. **Write (VS Code)**: We write TypeScript (`.ts`) code in VS Code because it's safer and smarter.
2. **Build (ArenaPro)**: When you press`Alt+Q`, the ArenaPro plugin acts like a factory, compiling and packaging all our`.ts`code (and possibly other modules) into a single, merged JavaScript file that the game engine understands, usually named`_server_bundle.js`or`_client_bundle.js`.
3. **Upload (ArenaPro)**: The plugin automatically uploads this packaged`.js`file to the cloud and associates it with your map.
4. **Load (Game Editor)**: The game editor itself doesn't know about the existence of this bundle file. The`require("./_server_bundle.js");`we add in the creator end's`index.js`is an explicit instruction telling the game engine: "Go load and execute the code package we uploaded from VS Code!"

This process can be clearly represented by the following diagram:

![](/arenapro/QQ20250709-210249.png)

## Can I Still Use Pure JavaScript?

**Of course.**

If you find the learning curve for TS steep, or if your project is very small, you can absolutely write only`.js`files. The ArenaPro build toolchain also supports pure JavaScript.

However, you will lose all the advantages mentioned above. We believe the long-term boost in development efficiency from spending a few minutes understanding the core value of TypeScript is invaluable.

**Our recommendation**: Bravely start your ArenaPro journey with`.ts`files. You will quickly find that it is not a constraint, but your most powerful guard.
