---
title: "Code Debugging (IV): Differences Between the Two Build Modes"
source: "https://docs.dao3.fun/arenapro/en/guide/04-development-workflow/compilationPrinciple.html"
---

# Code Debugging (IV): Differences Between the Two Build Modes

In ArenaPro, you have two main ways to compile and update your code:**HMR (Hot Module Replacement)**and**Full Build (`Alt+Q`)**.

You might wonder: What's the difference? When should I use which one?

This guide will explain it with a simple analogy.

## The Restaurant Kitchen Analogy

Imagine you are the head chef of a restaurant:

- **HMR (Hot Module Replacement)**is like**testing a dish**. You are simmering a pot of soup, and you feel it's a bit bland, so you add a pinch of salt and taste it immediately. You don't need to throw out the whole pot and start over; you just make a small adjustment to what you have. This process is**fast and immediate**, designed for development and debugging.
- **Full Build (`Alt+Q`)**is like the**final preparation before the restaurant officially opens**. You need to prepare every dish on the menu from scratch, meticulously, ensuring that the process, ingredients, and final product are all perfect. This process is**slower and more thorough**, intended for delivering a final, optimized product.

## Core Differences

| Feature | HMR (Hot Module Replacement) | Full Build (`Alt+Q`) |
| --- | --- | --- |
| **Use Case** | **Daily development, debugging** | **Publishing projects, final testing** |
| **Speed** | Extremely fast, only compiles what you changed (incremental update) | Slower, compiles all files (full update) |
| **How it Works** | "Watches" files in the background, automatically updates in-game upon saving | Manually triggered, packages the entire project into optimized code |
| **Core Advantage** | **Efficiency**: Keeps you immersed in coding without being distracted by the build process | **Performance**: Ensures the published game code is minimal in size and runs fastest |

## How Do They Work?

### HMR Workflow: Updating Only the Changes

When you start HMR and modify a file, it precisely identifies this "change point," recompiles only that module, and then injects it into the running game like a patch.

### Full Build Workflow: Starting from Scratch

When you press`Alt+Q`, it executes a complete two-step process:

1. **TypeScript Compilation (TSC)**: First, it translates all your`.ts`source files one by one into`.js`files that the browser can understand.
2. **Webpack Bundling**: Then, Webpack takes these`.js`files, analyzes their dependencies, and intelligently bundles and minifies them into the final, highly optimized game code.

## Conclusion: Which One Should I Use?

The answer is simple:**Use both, but at different stages.**

- **For 99% of your development time, you should use HMR**. It provides the smoothest and most efficient "code-and-see" loop.
- **When you are ready to publish your work for others to play, perform a "Full Build"**. This ensures that your players get the best performance experience.

Understanding these underlying differences will help you gain a deeper insight into ArenaPro's build process and enable you to more accurately locate and solve problems when they arise.
