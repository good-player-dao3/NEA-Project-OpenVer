---
title: "Dual-End Development (I): Sharing Code (Single Source of Truth)"
source: "https://docs.dao3.fun/arenapro/en/guide/05-best-practices/codeReuse.html"
---

# Dual-End Development (I): Sharing Code (Single Source of Truth)

When developing a game, much of the logic needs to be used on both the**server**and the**client**.

**Consider this scenario**:

- The**server**needs to calculate the actual damage a player should deal based on their level and equipment.
- The**client**, for a better user experience, needs to display a damage preview tooltip when the player hovers over a skill button.

If you write the damage calculation logic twice, once for each end, and the damage formula needs to be adjusted later, you might forget to modify one of them, leading to a bug where the client's preview doesn't match the server's actual calculation.

This is why we need**code sharing**. ArenaPro provides a dedicated`shares/`folder to solve this problem.

## 🤔 Why Share Code?

In many games, both the client (the interface and interactions the player sees) and the server (game logic, data processing) need to handle some of the same concepts. For example:

- **Game Formulas**: Damage calculation, experience curves, drop rates, etc.
- **Data Structure Definitions**: TypeScript`interface`or`type`for things like inventory items, player attributes, and skill data.
- **Constants**: For example,`const MAX_PLAYERS = 16;`.
- **Pure Utility Functions**: General-purpose functions that don't depend on any specific environment (like math calculations, string processing).

In your VS Code file explorer, at the root of your project (on the same level as`client`and`server`),**manually create a new folder named`shares`**.

This directory will be the "sacred ground" where we store all our shared code. After creating it, your project structure should look like this:

![](/arenapro/QQ20250709-210731.png)

## 2. How to Use Shared Code

Now, you can create any`.ts`file you want to share in the`shares`directory. For example, let's create a`shares/config.ts`file to store the game's core configuration:

## The`shares/`Folder: Your "Single Source of Truth"

The code in the`shares/`folder is special: it can be imported by both the server-side code in the`server/`directory and the client-side code in the`client/`directory.

This makes it the perfect place to define the**"Single Source of Truth"**. For core logic like game rules, data structures, and calculation formulas, you only need to write it here once, and both the client and server can share this standard.

## Practical Exercise: Sharing an Experience Calculation Function

Let's create a shared function to calculate the experience needed to level up.

### Step 1: Create a File in`shares/`and Write the Logic

1. Create a new file in the`shares/`directory, for example,`gameplay.ts`.
2. In`gameplay.ts`, write our level calculation function and export it using the`export`keyword.

ts

```
// shares/gameplay.ts

/**
 * Calculates the total experience required to advance to the next level based on the player's current level.
 * @param level The current level.
 * @returns The experience required for the next level.
 */
export function getXPForLevel(level: number): number {
  // The higher the level, the more experience required (e.g., a 15% increase per level)
  return Math.floor(100 * Math.pow(1.15, level - 1));
}
```

### Step 2: Use the Shared Function on the Server

Now, the server can call this function when processing a player gaining experience to determine if they level up.

ts

```
// server/src/App.ts
import { getXPForLevel } from '../../shares/gameplay';

// ...
  async onPlayerGetKill(player) {
    const currentXP = player.getData('xp');
    const currentLevel = player.getData('level');

    const newXP = currentXP + 50; // Gain 50 XP per kill
    player.setData('xp', newXP);

    const xpForNextLevel = getXPForLevel(currentLevel);

    if (newXP >= xpForNextLevel) {
      player.setData('level', currentLevel + 1);
      player.setData('xp', 0); // Reset XP
      player.sendChat(`Congratulations! You have reached level ${currentLevel + 1}!`);
    }
  }
// ...
```

### Step 3: Use the Same Function on the Client

Simultaneously, the client can call the**exact same**function to display an XP progress bar in the UI.

ts

```
// client/src/App.ts
import { getXPForLevel } from "../../shares/gameplay";

function updateUserXPBar(currentXP: number, currentLevel: number) {
  const xpForNextLevel = getXPForLevel(currentLevel);
  const progress = (currentXP / xpForNextLevel) * 100;

  // Assuming we have a function to update the UI
  // updateProgressBar('xp-bar', progress, `${currentXP} / ${xpForNextLevel}`);
  console.log(`Current level up progress: ${progress.toFixed(1)}%`);
}

// Watch for data changes from the server
box.watchData("xp", (newXP) => {
  const currentLevel = box.getData("level");
  updateUserXPBar(newXP, currentLevel);
});
```

Now, if you want to adjust the experience curve in the future,**you only need to modify that one function in`shares/gameplay.ts`**, and the behavior on both the client and server will automatically stay consistent!

## What Should Go into`shares/`?

✅**Good for Sharing:**

- **Game Formulas**: Damage calculation, experience curves, drop rates, etc.
- **Data Structure Definitions**: TypeScript`interface`or`type`for inventory items, player attributes, skills, etc.
- **Constants**: For example,`const MAX_PLAYERS = 16;`.
- **Pure Utility Functions**: General-purpose functions that don't depend on any specific environment (like math calculations, string processing).

🚫**Not Suitable for Sharing:**

- Any code that calls**server-only APIs**(e.g.,`player.kick()`,`world.createEntity()`).
- Any code that calls**client-only APIs**(e.g.,`ui.findChildByName()`, manipulating UI elements).
- Code containing sensitive information like secret keys or database addresses.

By following this "single source of truth" principle, you can write cleaner, more robust, and more maintainable code.

---

In the next guide, we will explore how to make client-server communication just as robust by defining "type-safe" events.
