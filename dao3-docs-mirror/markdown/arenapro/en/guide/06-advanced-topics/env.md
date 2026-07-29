---
title: "Managing Your \"Secrets\": Using Environment Variables for Feature Toggles and Keys"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/env.html"
---

# Managing Your "Secrets": Using Environment Variables for Feature Toggles and Keys

In your game development journey, you will almost certainly encounter this scenario:

> You are developing a "special event" for a holiday, like a "Christmas Treasure Hunt."
>
> 1. **Feature Toggle**: You want to be able to enable and test this event on your own computer at any time, but you don't want regular players to see it before the event officially goes live.
> 2. **Key Management**: This event needs to call an external "Weather API" to create a snow effect, and this API requires a paid, private`API_KEY`.

The most direct but most dangerous approach is to hard-code these "secrets" in your code:

typescript

```
// Feature toggle for the event
const ENABLE_CHRISTMAS_EVENT = true;

// Private key
const WEATHER_API_KEY = "abc-123-xyz-a-very-secret-key";
```

This method is fraught with risks:

- **Easy to Forget**: When releasing a regular game version, you are very likely to forget to change`ENABLE_CHRISTMAS_EVENT`back to`false`, causing the unfinished event to be leaked to players prematurely.
- **Key Leakage**: You write the`WEATHER_API_KEY`in the code. Once you upload the project to Git, all collaborators can see your key. If it's a public repository, your key is exposed to the world and could be stolen, leading to high costs.

So, how can you elegantly manage these "secrets" and allow your project to automatically enable/disable features and use different keys based on different environments? The answer is—**environment variables**.

## Core Concept: Why Does My Configuration Work Locally but Fail After Uploading?

Before revealing the specific steps, we must first understand a core concept: "build time" vs. "runtime."

Many creators with Node.js development experience try to use the`dotenv`library. Everything works fine on their local computers, but after uploading the code to the platform, the server immediately crashes, reporting that the`.env`file cannot be found.

This is because the ArenaPro server receives the`.js`file that was**"built" on your local computer**. All your source files, like`package.json`,`.env`,`tsconfig.json`, etc., are not uploaded to the server.

- **`dotenv`(Runtime solution - ❌ Incorrect)**: Its working principle is:**when the code is running on the server**, it looks for and reads the`.env`file. Since the`.env`file is not uploaded at all, it is doomed to fail. This is like giving a friend a shopping list without giving them money—they can't do anything when they get to the store.
- **`dotenv-webpack`(Build-time solution - ✅ Correct)**: Its working principle is:**when the code is being "built" on your local computer**, it reads the`.env`file in advance and then, like a "find and replace," directly replaces the references to environment variables in your code with the actual values from the`.env`file. This is like you buying everything for your friend in advance and just handing them the**backpack**full of goods—they can use it immediately.

**Visual Comparison**

| Your Local Code (`.ts`) | Your`.env`File (Local) | Final Code Uploaded to the Platform (`.js`) |
| --- | --- | --- |
| `console.log(process.env.EVENT_MESSAGE);` | `EVENT_MESSAGE=Merry Christmas!` | `console.log("Merry Christmas!");` |

The final uploaded code no longer contains references to`process.env`; it has been directly replaced with the actual value. This is the only correct way to use environment variables in ArenaPro.

## Quick Start: Using`.env`

In your project root (at the same level as`package.json`), there is a file named`.env`. This file stores your personal configuration and secrets.**This file should never be committed to a Git repository.**

ini

```
# .env file
# This is a comment. The contents of this file are only visible to you.
ENABLE_CHRISTMAS_EVENT=true
WEATHER_API_KEY="abc-123-xyz-a-very-secret-key"
```

After setting up your`.env`file, your project is already "smart" and "secure" enough! Now, you can write your code like this:

typescript

```
// server/src/App.ts

// Use the feature toggle
if (process.env.ENABLE_CHRISTMAS_EVENT === "true") {
  console.log("Christmas event is enabled! Loading related logic...");
  // ... load event-related code here
}

// Use the key securely
function getWinterWeather() {
  const apiKey = process.env.WEATHER_API_KEY;
  // fetch(`https://api.weather.com/snow?apiKey=${apiKey}`);
  console.log(`Requesting weather using key ${apiKey}...`);
}

if (process.env.ENABLE_CHRISTMAS_EVENT === "true") {
  getWinterWeather();
}
```

When you need to release a regular version**without**the Christmas event, you just need to change`ENABLE_CHRISTMAS_EVENT`to`false`in your`.env`file before release, then rebuild and upload.**You don't need to change any business logic code at all**. Your key will also never appear in the code or in a public repository.

## Type Safety: Make Environment Variables and Flags Safer

The simplest and most practical approach is to create an`env.d.ts`file at the project root and declare the environment variables you plan to use. This immediately provides editor IntelliSense, typo checking, and constrained value types.

Note that environment variable values must be of type`string`. Do not annotate them as non-strings (e.g., do not write`readonly ENABLE_CHRISTMAS_EVENT: boolean`).

typescript

```
// env.d.ts (at project root)
interface ProcessEnv {
  readonly WEATHER_API_KEY: string; // required, string type
  readonly ENABLE_CHRISTMAS_EVENT: "true" | "false"; // only allow "true" | "false" strings
  readonly EVENT_MODE?: "off" | "beta" | "on"; // optional, limited to three values
  readonly ENABLE_NEW_TUTORIAL?: "true" | "false"; // optional, limited to "true" | "false"
}
```

Important:`env.d.ts`only provides type hints and constraints at edit time. On ArenaPro, runtime code still relies on the framework's built-in build-time replacement. Make sure matching variables are defined in`.env`/`.env.example`to avoid`process is not defined`errors.

## 💥**Security Notice**: How to Avoid the Fatal`process is not defined`Error

This is the**most common, 100% crash-inducing**error when using this feature.

**Reason**: If you use`process.env.SOME_VAR`in your code, but the build tool**cannot find**a definition for`SOME_VAR`in the`.env`file, it will not perform any "find and replace" operation.

Ultimately, the code`process.env.SOME_VAR`will be bundled into the final`.js`file**as is**. When this code runs on the ArenaPro platform, which does not have a full Node.js environment, your program will crash immediately because the platform does not recognize the`process`object.

**Solution**: A simple principle:**Ensure that every environment variable you reference in your code is defined in your`.env`file.**Even if a variable doesn't need a value for now, give it an empty definition or an explicit default value.

**Correct`.env`file example**:

ini

```
# The weather API key is required and cannot be empty
WEATHER_API_KEY="some-real-key"
# The Christmas event is temporarily disabled, but since it's referenced in the code, it must be given a value
ENABLE_CHRISTMAS_EVENT=false
```

## Best Practices for Team Collaboration

### 1. Add the`.env`file to`.gitignore`

The`.env`file contains your personal keys and other sensitive information.**Never**commit it to a Git repository.

```
# .gitignore
# Ignore all .env files to protect your secret information
.env
```

### 2. Create a`.env.example`file as a template

To help other team members get up to speed quickly, you should create a`.env.example`file in your project. It lists all the environment variable names needed for the project but leaves their actual values blank. This file**should**be committed to the Git repository.

ini

```
# .env.example
# Team members should copy this file, rename it to .env, and fill in their own configurations

WEATHER_API_KEY=
ENABLE_CHRISTMAS_EVENT=false
```

This way, when a new member joins the project, they just need to copy`.env.example`to`.env`and fill in their own keys to start developing and testing immediately.
