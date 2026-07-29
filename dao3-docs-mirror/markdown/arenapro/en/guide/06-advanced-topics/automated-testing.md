---
title: "Give Your Code a \"Health Check\": Guard Your Hard Work with Automated Testing"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/automated-testing.html"
---

# Give Your Code a "Health Check": Guard Your Hard Work with Automated Testing

In the world of game development, there's a simple truth: "Any code that hasn't been tested is likely to give you an unexpected 'surprise' late at night." This is especially true as your game logic becomes more complex, where a tiny change can trigger a "butterfly effect."

Have you ever experienced these scenarios?

- You modified the damage calculation formula and, to verify the result, had to repeatedly enter the game, find a monster, attack, and observe the numbers that pop up...
- You refactored a core algorithm but were anxious about whether it would affect other features, so you had to manually click through every function...

Automated testing is the "magic tool" that liberates you from this "primitive" way of testing. It's like a tireless "health check center" for your code that can perform hundreds of checks on your core logic in seconds and give you a clear "health report."

> **Important Note: What can this "health check center" inspect?**
>
> The "unit testing" introduced in this article runs in an isolated environment and is specifically designed to verify the**pure business logic in your project that is independent of the game engine**.
>
> - **Can be checked ✅**: "Component code" that does not directly call Box3 APIs, such as algorithms (e.g., damage calculation, pathfinding logic), data processing, and utility functions.
> - **Cannot be checked ❌**: This method**cannot directly test or debug any Box3 APIs that require the game to be online to run**(e.g.,`world.onPlayerJoin`,`player.hp`, and other functions that interact directly with the game world).

In this tutorial, we will use the industry's most popular testing framework,[Jest](https://jestjs.io/), to build a reliable quality "safety net" for the "pure logic" parts of your ArenaPro project, step by step.

### Step 1: Set Up Your "Code Health Check Center"

First, we need to install the necessary equipment to set up the "health check center" for our project.

bash

```
npm install --save-dev jest ts-jest @types/jest
```

This "equipment" consists of:

- `jest`: The core machine of the "health check center," responsible for executing all checks.
- `ts-jest`: A TypeScript adapter that allows the`jest`machine to understand`.ts`files.
- `@types/jest`: The "instruction manual" for Jest, providing TypeScript type hints for all its features.

Next, we need to configure this machine. Create a`jest.config.js`file in your project root.

javascript

```
// jest.config.js
module.exports = {
  // Specify the preset; ts-jest will handle TypeScript files
  preset: "ts-jest",
  // Specify the "health check" environment; for pure logic tests, we use the default node environment
  testEnvironment: "node",
  // Tell the machine where to look for code to be checked
  roots: ["<rootDir>/server/src", "<rootDir>/client/src", "<rootDir>/shares"],
  // How to identify "health check forms" (test files)
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  // File types the machine can recognize
  moduleFileExtensions: ["ts", "tsx", "js", "cjs", "mjs", "jsx", "json"],
};
```

Finally, let's install a "master switch" in`package.json`so we can start all health checks with a single command:

json

```
// package.json
{
  // ... other configurations
  "scripts": {
    "jest:test": "jest" // <-- Add or modify this line
  }
  // ... other configurations
}
```

With that, our "code health check center" is built!

### Step 2: Perform the First "Health Check"

Let's start with the most common scenario: testing a damage calculation function.

#### A. Prepare the "Subject for Check-up"

Let's assume we have a`damage.ts`module in the`server/src/`directory. This is the subject of our check-up.

typescript

```
// server/src/damage.ts

// Use the 'export' keyword to export a TypeScript interface.
// An interface is used to define the "shape" or "contract" of an object,
// i.e., what properties an object should have and their types.
// Here, it defines all the parameters needed for damage calculation.
export interface DamageOptions {
  // Attacker's attack power, must be a number.
  attack: number;
  // Defender's defense power, must be a number.
  defense: number;
  // '?' indicates an optional property.
  // Critical hit chance, a number between 0 and 1, e.g., 0.1 for a 10% chance.
  criticalChance?: number;
  // Critical hit damage multiplier, also an optional property.
  criticalMultiplier?: number;
}

/**
 * Calculates the final damage dealt to the target.
 * This is a JSDoc-style comment that provides a detailed description,
 * parameter explanations, and return value explanation for the function.
 * When you call this function elsewhere, your IDE (like VS Code) will display this information.
 * @param options - An object containing the parameters for damage calculation, adhering to the DamageOptions interface.
 * @returns The calculated final damage value.
 */
export function calculateDamage(options: DamageOptions): number {
  // Use object destructuring to extract properties from the 'options' parameter.
  // This syntax allows us to easily set default values for optional parameters.
  const {
    attack,
    defense,
    criticalChance = 0,
    criticalMultiplier = 1.5,
  } = options;

  // Input validation: Perform some basic checks to ensure input values are within a reasonable range.
  if (attack <= 0 || defense < 0) {
    return 0;
  }

  // Calculate base damage, using Math.max(1, ...) to ensure damage is at least 1.
  const baseDamage = Math.max(1, attack - defense);

  // Determine if a critical hit occurs. Math.random() generates a random number between 0 and 1.
  const isCritical = Math.random() < criticalChance;

  // Return the final damage based on whether a critical hit occurred.
  // Using a ternary operator, if it's a critical hit, return the base damage multiplied by the critical multiplier (rounded down).
  return isCritical ? Math.floor(baseDamage * criticalMultiplier) : baseDamage;
}
```

#### B. Fill Out the "Health Check Form"

Now, let's write a "health check form" to tell the machine how to check the`calculateDamage`function. By convention, test files are usually placed alongside the source files and end with`.test.ts`.

Create the`server/src/damage.test.ts`file:

typescript

```
// server/src/damage.test.ts
// This is a "health check form" written using the Jest framework.

// Import the calculateDamage function to be tested from the './damage' file.
import { calculateDamage } from "./damage";
// Import global testing tools provided by Jest from '@jest/globals'
import { describe, it, expect, jest } from "@jest/globals";

// 'describe' is used to group a set of related checks into a "check-up package."
describe("Health Check Package: Damage Calculation Function", () => {
  // 'it' defines a specific "check-up item," describing the scenario it's checking.
  it("Check Item 1: When attack is greater than defense, but the difference is less than 1, damage should be 1", () => {
    // 'expect(actualResult)' returns an "expectation object" on which you can perform various assertions.
    // '.toBe(expectedResult)' is a "matcher" that uses Object.is (similar to ===) to check if the actual result is strictly equal to the expected result.
    // We expect the result of calculateDamage({ attack: 10, defense: 9.5 }) to be 1.
    expect(calculateDamage({ attack: 10, defense: 9.5 })).toBe(1);
  });

  // Our function has Math.random(), which is unacceptable in a check-up because the result will vary.
  // We must control this "random" factor to ensure the result of each check is identical.
  it("Check Item 2: When no critical hit occurs, it should return base damage", () => {
    // 'jest.spyOn' is a "cheating" tool that can temporarily control the behavior of a function.
    // Here, we "hack" Math.random() to always return 0.5 for this check, so a critical hit will never occur.
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);

    expect(
      calculateDamage({ attack: 100, defense: 20, criticalChance: 0.1 })
    ).toBe(80);

    // The 'mockRestore()' method removes the mock implementation we set up with '.mockReturnValue()',
    // restoring Math.random to its original state.
    // This is a very good practice to ensure tests are isolated from each other, preventing the mock state of one test from "polluting" another.
    spy.mockRestore();
  });

  it("Check Item 3: When a critical hit is guaranteed, it should return critical damage", () => {
    // Similarly, this time we make Math.random() return a value that guarantees a critical hit.
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.05);

    expect(
      calculateDamage({
        attack: 100,
        defense: 20,
        criticalChance: 0.1,
        criticalMultiplier: 2,
      })
    ).toBe(160);

    spy.mockRestore();
  });

  it("Check Item 4: When the input is invalid (e.g., negative), it should return 0", () => {
    expect(calculateDamage({ attack: -10, defense: 20 })).toBe(0);
    expect(calculateDamage({ attack: 100, defense: -20 })).toBe(0);
  });
});
```

> **Core Idea**: A reliable unit test must be**predictable and repeatable**. By controlling the output of`Math.random`with`jest.spyOn`, we remove the uncertainty from the code, making the "health check" precise and reliable. This is a key technique in writing tests.

### Step 3: Run and Interpret the "Health Report"

Open your terminal and run the "master switch" we defined earlier:

bash

```
npm run jest:test
```

If everything goes well, you will see a reassuring report from the "health check center":

bash

```
PASS  server/src/damage.test.ts
  Health Check Package: Damage Calculation Function
    ✓ Check Item 1: When attack is greater than defense, but the difference is less than 1, damage should be 1 (2ms)
    ✓ Check Item 2: When no critical hit occurs, it should return base damage
    ✓ Check Item 3: When a critical hit is guaranteed, it should return critical damage (1ms)
    ✓ Check Item 4: When the input is invalid (e.g., negative), it should return 0

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        1.246 s
```

Each item in this report tells you:

- **Test Suites**: 1 "health check package" was executed in total, and all passed.
- **Tests**: 4 "check-up items" were executed in total, and all passed.
- **Time**: The total time taken for this health check.

This green "PASS" sign is strong proof of your code's health. From now on, every time you modify your code, just run`npm run jest:test`, and you'll know within seconds if your changes are safe.

## Conclusion

Although the initial setup can be a bit tedious, establishing an automated "health check" mechanism for your core business logic (algorithms, data transformations, etc.) is an investment with an extremely high return. It will allow you to iterate and refactor with confidence in your future development, saying goodbye to the nightmare of "fixing one thing and breaking three."

You have now mastered the core skill of introducing automated testing to your ArenaPro project. Try writing a "health check form" for the most important algorithm in your project and take the first step towards code health!
