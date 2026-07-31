---
title: "Dual-End Development (II): Sharing Data Structures (Type-Safe Events)"
source: "https://docs.dao3.fun/arenapro/en/guide/05-best-practices/communicationAgreement.html"
---

# Dual-End Development (II): Sharing Data Structures (Type-Safe Events)

In dual-end development, besides sharing functions, a more common scenario is**communication between the client and the server**.

**Consider this scenario**:

- The**server**detects that a player has defeated a monster. It needs to notify the client to play a victory sound effect and display the loot obtained.
- The**client**needs to receive this notification and safely parse the data within it, such as the monster ID, experience points, and dropped items.

If you rely solely on verbal agreements, you are likely to make a spelling mistake in one of the communications: the server sends`{ exp: 100 }`, but the client tries to read`{ xp: 100 }`. This kind of error is very difficult to track down.

To solve this problem, we can use the`shares/`folder mentioned in the previous guide to define a shared**data structure "contract"**.

## `interface`: Defining Your Communication "Contract"

TypeScript's`interface`is the perfect tool for defining the "shape" of an object. By defining an`interface`in the`shares/`folder, the client and server can agree on a legally binding "contract" for the structure of their communication data.

If either party fails to adhere to this contract (e.g., misspelling a field name, using the wrong type), the TypeScript compiler will immediately report an error, helping you eliminate a large number of potential bugs during the development phase.

## Practical Exercise: Sending a "Monster Defeated" Event

Let's define a dual-end event with a type-safe payload.

### Step 1: Define the Data Interface in`shares/`

1. Create a new file in the`shares/`directory, for example,`events.ts`.
2. In`events.ts`, use`interface`to define the data structure that the "Monster Defeated" event needs to carry. At the same time, we'll define a unique event name constant.

ts

```
// shares/events.ts

// Define the structure for a dropped item
export interface LootItem {
  itemId: number;
  quantity: number;
}

// Define the payload structure for the "Monster Defeated" event
export interface MonsterDefeatedPayload {
  monsterId: string;
  xpGained: number;
  loot: LootItem[];
}

// Define a globally unique event name
export const MONSTER_DEFEATED_EVENT = "MonsterDefeated";
```

### Step 2: Server Sends a Type-Safe Event

Now, when a monster is defeated, the server can construct a data object that strictly adheres to this "contract" and broadcast it to the client.

ts

```
// server/src/App.ts
import {
  MONSTER_DEFEATED_EVENT,
  MonsterDefeatedPayload
} from '../../shares/events';

// ...
  onMonsterDefeated(monster, player) {
    // Construct the payload object. If a field name or type is wrong here, TS will report an error immediately!
    const payload: MonsterDefeatedPayload = {
      monsterId: monster.id,
      xpGained: 50,
      loot: [
        { itemId: 101, quantity: 1 },
        { itemId: 204, quantity: 3 }
      ]
    };

    // Broadcast this event and payload to the player's client
    this.box.broadcastToClient(player, MONSTER_DEFEATED_EVENT, payload);
  }
// ...
```

### Step 3: Client Listens and Safely Uses the Data

The client can listen for this event. Since it also references the same`interface`, it can be completely confident about the structure and types of the data it receives.

ts

```
// client/src/App.ts
import {
  MONSTER_DEFEATED_EVENT,
  MonsterDefeatedPayload
} from '../../shares/events';

// ...
  onLoad() {
    // Listen for events from the server
    this.box.listenToServer<MonsterDefeatedPayload>(MONSTER_DEFEATED_EVENT, (payload) => {
      // Here, the `payload` object has full type hints and safety guarantees
      console.log(`You defeated monster ${payload.monsterId}!`);
      console.log(`Gained ${payload.xpGained} XP!`);

      // VS Code can even autocomplete field names after `payload.`
      for (const item of payload.loot) {
        console.log(`Obtained item ${item.itemId}, quantity ${item.quantity}`);
      }

      // Call functions here to play victory sounds, show UI, etc.
      // playVictorySound();
      // showLootToast(payload.loot);
    });
  }
// ...
```

## Benefits of Shared Data Structures

- **Type Safety**: Fundamentally eliminates dual-end communication problems caused by typos and type mismatches.
- **Code IntelliSense**: As you write code, VS Code will automatically suggest the fields available in the payload object, greatly increasing development efficiency.
- **Confidence in Refactoring**: If you need to add a field to an event in the future, you only need to modify the`interface`in`shares/events.ts`, and TypeScript will automatically identify all the server and client code that needs to be updated.
- **Code as Documentation**: The shared`interface`file itself serves as a clear, accurate, and always-up-to-date communication protocol document.

Now, your client-server communication is fully type-safe. This will save you countless hours of debugging in large projects and significantly improve the robustness of your code.

---
