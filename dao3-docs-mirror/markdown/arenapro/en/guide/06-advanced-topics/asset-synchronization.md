---
title: "Goodbye Manual Copying: The Path to Seamless Collaboration Between Programmers and Artists"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/asset-synchronization.html"
---

# Goodbye Manual Copying: The Path to Seamless Collaboration Between Programmers and Artists

## The "Nightmare" of Traditional Workflows

Imagine a classic team collaboration scenario:

> **Artist Alice**: I've finished a new monster model,`golem.vb`, and placed it in the map!

> **Programmer Bob**: Got it!

Then, Bob confidently writes in the code:

typescript

```
world.createEntity({
  // ...
  mesh: "model/golen.vb", // Manually typed model path
});
```

He enters the game, only to find the model doesn't appear. After some communication, he discovers he misspelled the model name as`golen`while coding.

The next day, Alice optimizes the model and renames it to`stone_golem.vb`, but only mentions it once in the chat group. Bob, engrossed in his code, doesn't notice...

This way of working, which relies on verbal communication and manually copying and pasting asset paths, is an efficiency killer and a breeding ground for bugs in team development. If only there were a way for the programmer to know**in real-time, precisely**what assets are actually in the editor.

ArenaPro's**"Asset Synchronization"**feature was created to solve this collaboration dilemma.

## Unveiling the Magic: "Seeing" All Editor Assets in Your Code

The "Asset Synchronization" feature does something very clever:

It scans**all**the assets (models, images, sound effects, etc.) in the map your project is currently connected to, and then automatically generates a real-time, updated "**Project Asset Manifest**" (a special file named`types/GameAssets.d.ts`) in your code project.

Once this "manifest" is generated, VS Code has a "memory" of all your assets. From then on, your programming experience will undergo a qualitative leap:

1. **Path Autocompletion**: When you need to enter an asset path, VS Code acts like an "intelligent assistant," popping up a dropdown list containing all available assets. You just select it with your keyboard, saying goodbye to manual typing.
2. **Real-time Error Checking**: If an asset you're referencing is**deleted**or**renamed**by an artist, VS Code will immediately draw a red wavy line under that line of code, telling you: "Hey, this asset can't be found!"

You no longer have to wait until you're in the game to discover that an asset failed to load.

## The Modern Workflow: One-Click Sync, Goodbye Communication Costs

The operation is very simple; you just need to develop a simple habit.

### When Do You Need to Sync?

Think of "Asset Synchronization" as a "refresh" button. Whenever the assets in the editor change, you need to press it to update your local "asset manifest."

The most common scenarios are:

- When your artist/designer has**added, deleted, or renamed**any assets in the editor.
- When you've just pulled the latest project from Git and are unsure if the assets have changed.

### How to "Sync Assets"?

We provide multiple ways to refresh your "asset manifest":

- **Shortcut (Highly Recommended)**: Press`Alt + Y`
- **Command Palette (`F1`)**: Type and run`Sync Map Assets`

### Enjoy Seamless Collaboration

Now, let's look at the new workflow:

> **Artist Alice**: I've updated/added a bunch of assets!

> **Programmer Bob**: Got it!

Bob just needs to press`Alt + Y`in VS Code. A second later, when he writes code again, the prompts will appear automatically:

When he types the first quote, all the latest, correct asset paths will be listed for him to choose from. He can be 100% sure that he is using the real assets that exist in the editor.

This simple habit can save you and your team from countless bugs caused by incorrect asset paths, greatly enhancing development happiness.

## Automatic Sync and Silent Mode

To further reduce collaboration costs, ArenaPro adds an automatic synchronization capability:

- Automatic sync (background interval)
  - The extension periodically checks for asset changes in the background and updates`types/GameAssets.d.ts`when needed.
  - The interval is controlled by the setting`nodeJsTool.GameAssetsSync`(unit: minutes).
    - 0 or unset: disable automatic sync
    - 0: check at the specified minute interval
  - Changes take effect immediately; no plugin reload is required.
- Silent sync
  - Only when a difference is detected and a local overwrite of`GameAssets.d.ts`is necessary will a single confirmation dialog be shown, avoiding accidental overwrites.
- First-time generation
  - If`types/GameAssets.d.ts`does not exist yet, automatic sync will generate it once assets are detected.

## FAQ

- Q: I don’t want background automatic sync. What should I do?
  - A: Set`nodeJsTool.GameAssetsSync`to 0 to disable it.
- Q: Will automatic sync interrupt my coding?
  - A: No. Background detection runs in silent mode—no progress or info popups; only when a local file needs to be overwritten will a single confirmation dialog appear.
- Q: Why are differences sometimes detected but no update occurs?
  - A: Differences such as comments or timestamps are ignored; they won’t trigger an update.
- Q: How do I trigger an immediate manual sync?
  - A: Use the shortcut`Alt + Y`or run “Sync Map Assets” from the command palette.

## Summary

With one-click sync plus background automatic sync, you can “see” all editor assets directly in VS Code, enjoying path autocompletion and real-time error checks. Team collaboration becomes smoother and development more reassuring.
