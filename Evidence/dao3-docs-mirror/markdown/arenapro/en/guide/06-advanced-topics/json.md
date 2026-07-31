---
title: "Managing Game Data Professionally: Starting with JSON"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/json.html"
---

# Managing Game Data Professionally: Starting with JSON

Imagine you're creating a large RPG game with hundreds or even thousands of pieces of equipment, items, and monsters.

Initially, for convenience, you might write this data directly into your code:

typescript

```
function getItemData(itemId: string) {
  if (itemId === "item_001") {
    return { name: "Health Potion", effect: "Restores 50 HP" };
  }
  if (itemId === "item_002") {
    return {
      name: "Strength Scroll",
      effect: "Temporarily increases attack by 10",
    };
  }
  // ... hundreds of if/else statements omitted here ...
}
```

This "hard-coding" approach might seem fine in the early stages of a project. But as the project scale grows, it becomes a disaster:

- **Difficult to Modify**: Every time you want to adjust an item's effect, you have to find that one small line in thousands of lines of code.
- **Prone to Errors**: When the number of items increases, copy-pasting can easily lead to mistakes, like misspelling`effect`as`effcet`.
- **Impossible to Collaborate**: You can't let a game designer who doesn't know how to program help you configure and adjust values.

To solve this problem, we need to introduce a professional development philosophy:**separation of data and logic**. Let the code be responsible only for "how to use an item," while the specific information about the item is stored in a dedicated "data warehouse."

The most common format for this "data warehouse" is**JSON**.

## Phase 1: Building Your "Data Warehouse" with JSON

JSON is a lightweight text format specifically for storing data. It is very easy to read and write. Our goal is to move all the item data out of the code and into an`items.json`file.

1. In your`src`directory (or wherever you see fit), create a new`gamedata`folder.
2. Inside the`gamedata`folder, create a new file named`items.json`.

Now, let's write the item data into it:

json

```
// src/gamedata/items.json
[
  {
    "id": "item_001",
    "name": "Health Potion",
    "description": "A red potion that can heal wounds.",
    "effect": "heal",
    "value": 50
  },
  {
    "id": "item_002",
    "name": "Strength Scroll",
    "description": "Feel limitless power after using it.",
    "effect": "buff_attack",
    "value": 10
  },
  {
    "id": "item_003",
    "name": "Newbie Village Map",
    "description": "Mom no longer has to worry about me getting lost.",
    "effect": "none",
    "value": 0
  }
]
```

See how clear that is? You can easily add, modify, or delete items here without touching a single line of game logic code.

## Phase 2: Using an Interface to Add a "Safety Lock" to the "Data Warehouse"

Now that we have the data, there's a crucial problem:**How do we use it safely in our code?**

- What if I mistakenly interpret`value`as "price" when it's actually the "healing amount"?
- What if the designer accidentally writes`effects`instead of`effect`during configuration? How does the program find out?

This is where**TypeScript Interfaces**come into play. We can create a "**data contract**" for our item data to put a "safety lock" on this "warehouse." This contract will strictly stipulate: Hey, all items stored in the warehouse must include the properties`id`,`name`,`description`,`effect`, and`value`, and their types must also be as specified!

Create a`types.ts`file in the`src`directory (if you don't have one already), and write the following content:

typescript

```
// src/types.ts

/**
 * Represents the data structure of an item in the game.
 * Every JSDoc comment will bring you great convenience in subsequent development.
 */
export interface ItemData {
  /** The unique identifier for the item, cannot be duplicated. */
  readonly id: string;

  /** The name of the item displayed in the game. */
  readonly name: string;

  /** The description text of the item. */
  readonly description: string;

  /**
   * The effect type of the item.
   * 'heal': Healing
   * 'buff_attack': Attack buff
   * 'none': No special effect
   */
  readonly effect: "heal" | "buff_attack" | "none";

  /**
   * The value associated with the effect.
   * - When effect is 'heal', this is the amount of healing.
   * - When effect is 'buff_attack', this is the amount of attack increase.
   */
  readonly value: number;
}
```

This`interface`is the "safety lock" we put on our "data warehouse." It not only defines the**type**of each field but also clearly defines the**meaning**of each field through comments and**literal union types**(`'heal' | 'buff_attack'`).

## Phase 3: Safely Opening the "Locked Warehouse" in Your Code

The ArenaPro development environment allows you to**import JSON files directly**, just like importing a regular TypeScript module. Now, we can tie everything together.

typescript

```
// server/src/itemManager.ts

// 1. Import both the JSON data and its "data contract"
import allItems from "../gamedata/items.json";
import type { ItemData } from "../types";

// 2. Create an item database for quick lookup by ID
//    We use a Map to store it, where the key is the item ID and the value is the item data.
const itemDatabase = new Map<string, ItemData>();

// 3. Iterate through the imported JSON array to populate the database
//    Here, we use a type assertion `as ItemData[]` to tell TypeScript:
//    "Please trust me, every member of this allItems array conforms to the ItemData contract."
//    If a field in the JSON file is misspelled (e.g., name is written as Name), TypeScript might not error here,
//    but the error will still be caught during subsequent use.
for (const item of allItems as ItemData[]) {
  itemDatabase.set(item.id, item);
}

// 4. Create a function to get item data
export function getItem(itemId: string): ItemData | undefined {
  return itemDatabase.get(itemId);
}

// 5. Call it elsewhere and enjoy the benefits of the "safety lock"
const potion = getItem("item_001");

// When you type `potion.`, VS Code will automatically suggest properties like name, description, effect, value!
if (potion) {
  console.log(`You used: ${potion.name}`);

  // You can safely use value because you know it represents the healing amount when effect is 'heal'
  if (potion.effect === "heal") {
    player.hp += potion.value;
  }

  // If you write value as potion.Value (case error),
  // or write the effect check as if (potion.effect === 'heall') (spelling error),
  // TypeScript will immediately underline it in red, helping you avoid a bug before you even run the game!
}
```

## Summary

By separating your game data into JSON files and combining it with TypeScript's`interface`, you get a professional, powerful, and easy-to-maintain workflow:

- **Separation of Data and Logic**: Adjusting game values becomes extremely simple and can even be handed over to designers who don't know how to program.
- **Cleaner Code**: Say goodbye to heaps of unmaintainable`if/else`statements in your code.
- **Ultimate Type Safety**: Protected by the "safety lock" of the`interface`, you can use this data with confidence in your code, enjoying autocompletion and real-time error checking from your IDE, which significantly reduces bugs caused by data inconsistencies or spelling errors.

Now, go and liberate your game data from your code!
