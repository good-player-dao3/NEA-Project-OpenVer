---
title: "Advanced Feature (IX): Exporting Code to Arena"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/toArena.html"
---

# Advanced Feature (IX): Exporting Code to Arena

After you've built powerful features using ArenaPro, you might wonder:

> "How can I share these complex features with teammates who aren't familiar with ArenaPro, or reuse them in other projects?"

The answer is**code exporting**.

Through this mechanism, you can package your ArenaPro project into a simple, easy-to-use "black box" of functionality. This allows other creators (even game designers who don't know how to code) to call your code as easily as they would call an official API in the standard Arena editor.

## Core Concept: Professional Division of Labor

The essence of code exporting is to completely separate**"underlying system development"**from**"upper-level gameplay implementation."**

- **Core Creator (You)**: In ArenaPro, you use TypeScript to build stable, reusable underlying systems like combat frameworks, UI component libraries, inventory systems, etc.
- **Game Designer / Scripter**: In the Arena editor, they don't need to worry about the underlying implementation. They can directly call the functions you provide to quickly implement gameplay and build levels.

This is a model for team collaboration.

## How to Export Code from ArenaPro?

Exposing your code to the outside world is very simple, requiring just one keyword:`export`.

1. Open your entry file (e.g.,`server/App.ts`).
2. Add the`export`keyword before the function, class, or variable you wish to share.

**That's it, you're done!**Webpack will automatically handle the rest during the bundling process, organizing everything you've exported into a single module.

### Example: Exporting a Function

ts

```
// server/App.ts

// Use the export keyword to expose this function
export function createEnemy(type: "goblin" | "orc", position: Vector) {
  // ... contains complex logic inside ...
  const model =
    type === "goblin" ? "asset/goblin.item.json" : "asset/orc.item.json";
  world.createEntity({ model, position });
  console.log(`Created a ${type} at ${position}`);
}

// This function is not exported, so it cannot be accessed from the outside
function internalHelper() {
  // ...
}

export default {
  // ... the main logic of the game ...
};
```

## How to Call it in the Arena Editor?

Now, your teammates can easily use your exported functions in the Arena editor.

Depending on the code's execution environment (server-side or client-side), the Arena editor uses different module systems, so the import syntax differs slightly.

| Environment | Import Syntax | Description |
| --- | --- | --- |
| **Server-side Script** | `require`(CommonJS) | Arena's server-side environment uses a Node.js-style module system. |
| **Client-side Script** | `import`(ESM) | Arena's client-side environment supports the more modern ES Module standard. |

### Example: Calling the Exported Function

In a server-side script in Arena, your teammate only needs to write these few simple lines of code to call the complex functionality you've carefully encapsulated:

javascript

```
// In an Arena server-side script

// 1. Use require to import your built JS file
const myGameLib = require("./_server_bundle.js");

// 2. Call your exported function
myGameLib.createEnemy("goblin", { x: 0, y: 10, z: 0 });
myGameLib.createEnemy("orc", { x: 10, y: 10, z: 10 });
```

They don't need to care at all about how`createEnemy`is implemented internally; they just need to know how to call it.

## Value and Advantages

- **Lowered Development Barrier**: Members unfamiliar with ArenaPro can still participate efficiently in development.
- **Increased Development Efficiency**: Core code is developed once and used everywhere, avoiding reinventing the wheel.
- **Guaranteed Code Quality**: Core functions are maintained by dedicated personnel, while upper-level logic can be iterated on quickly.
- **Accelerated Iteration Speed**: A clear division of responsibilities makes parallel development possible.
