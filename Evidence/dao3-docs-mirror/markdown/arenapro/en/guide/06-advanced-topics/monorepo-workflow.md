---
title: "Tutorial: Managing Your Multiple Box3 Projects with a Monorepo"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/monorepo-workflow.html"
---

# Tutorial: Managing Your Multiple Box3 Projects with a Monorepo

## Have You Ever Faced This Frustration?

Imagine you are developing two map projects simultaneously: "Sky Parkour" and "Treasure Hunt."

While developing "Sky Parkour," you write a very convenient utility function, say`getPlayerExtraData(player)`, to get additional information about a player.

javascript

```
// In the "Sky Parkour" project
function getPlayerExtraData(player) {
  // ... a bunch of complex logic ...
  return { level: 10, vip: true };
}
```

A few days later, while developing "Treasure Hunt," you realize, "I need to use this function too!"

What would you typically do at this point?

1. **Copy and Paste**: Copy the function code from "Sky Parkour" to "Treasure Hunt."
2. **The Problem Arises**: A week later, you fix a bug in`getPlayerExtraData`, but you only fix it in "Sky Parkour" and**forget**that "Treasure Hunt" has an identical copy of the code.

This is a nightmare for many creators:**one piece of code, multiple copies, and a mess to maintain.**

A Monorepo (single code repository) is the best solution to this problem. It allows you to put all related projects (like all your maps, all your shared tools) in one large folder, and you can**easily share code without copying and pasting**.

This tutorial will guide you step-by-step in building your own Monorepo in the simplest way.

## Prerequisites

You only need to have[Node.js](https://nodejs.org/)installed on your computer, which comes with the`npm`package manager. We will only use`npm`throughout this tutorial.

## Building Your First Monorepo Step-by-Step

Our goal is to create a shared utility library`common-utils`and have our game project`my-cool-map`use it.

### Step 1: Create the "Main Base"

First, we need a "main base" folder to store all our projects.

bash

```
# 1. Create a main folder, you can name it whatever you like
mkdir my-projects
cd my-projects

# 2. Initialize the project to generate a package.json file
npm init -y
```

Next, the most crucial step: edit the`package.json`file you just generated to tell`npm`: "Hey, this folder is a Monorepo, please help me manage the sub-projects inside."

json

```
// my-projects/package.json
{
  "name": "my-projects",
  "private": true, // Must be set to true to prevent you from publishing the entire "main base"
  "workspaces": [
    "packages/*" // Tells npm that all sub-projects in the packages folder are managed by me
  ]
}
```

### Step 2: Create Your "Shared Toolbox"

Now, let's create a`packages`folder in our "main base" specifically for holding tools that need to be shared.

bash

```
# Make sure you are currently in the my-projects folder
mkdir packages
cd packages

# 1. In packages, create our first shared tool project
mkdir common-utils
cd common-utils

# 2. Similarly, create a package.json for it
npm init -y
```

Edit`common-utils/package.json`and give it a name. This name is important because we will use it to reference this toolbox later.

json

```
// my-projects/packages/common-utils/package.json
{
  "name": "common-utils", // This is the name of the toolbox
  "version": "1.0.0",
  "main": "index.js"
}
```

Now, let's write the shared function we've been longing for:

javascript

```
// my-projects/packages/common-utils/index.js

// Our first shared function!
export function getPlayerExtraData(player) {
  console.log("Successfully called the shared utility function!");
  return { level: 10, vip: true };
}
```

### Step 3: Create and Use Your "Game Project"

The toolbox is ready. Now let's create the game project that will use it.

bash

```
# Go back to the my-projects/packages directory
cd ..

# 1. Create the game project
mkdir my-cool-map
cd my-cool-map

# 2. Initialize
npx create-arena-project@latest .
```

Edit`my-cool-map/package.json`and declare its dependency on our`common-utils`toolbox.

json

```
// my-projects/packages/my-cool-map/package.json
{
  "name": "my-cool-map",
  "version": "1.0.0",
  "dependencies": {
    "common-utils": "1.0.0" // Declare the dependency, the version number must match
  }
}
```

**Note:**ArenaPro projects use the`import`syntax by default, so we also need to declare the module type in`package.json`.

json

```
// my-projects/packages/my-cool-map/package.json
{
  "name": "my-cool-map",
  "version": "1.0.0",
  "type": "module", // <-- Add this line
  "dependencies": {
    "common-utils": "1.0.0"
  }
}
```

### Step 4: "Connect" Everything!

Now, all our materials are ready. Go back to the root directory of the "main base" and execute the final step to let`npm`link all the projects together.

bash

```
# Go back to the main base my-projects
cd ../..

# Run the installation!
npm install
```

`npm install`will now do something magical: it sees that`my-cool-map`depends on`common-utils`, and it finds that`common-utils`is right here in the local workspace. So, instead of downloading it from the internet, it creates a**shortcut (symbolic link)**in`my-cool-map/node_modules`that points directly to`packages/common-utils`.

This means that any future changes you make to`common-utils`,`my-cool-map`will**immediately be aware of**!

### Step 5: Verify the Results

Let's call the shared function in our game project.

Create the file`my-projects/packages/my-cool-map/index.js`:

javascript

```
// my-projects/packages/my-cool-map/index.js
import { getPlayerExtraData } from "common-utils";

// Simulate a player object
const fakePlayer = { id: "player-1" };

// Call the shared function
const extraData = getPlayerExtraData(fakePlayer);

console.log("Data obtained in the game map:", extraData);
```

Now, how do we run this`index.js`? It's simple, use npm's`-w`(workspace) parameter to tell it which sub-project you want to execute the command in.

bash

```
# Make sure you are in the "main base" my-projects directory
# -w my-cool-map means "execute the following command in the my-cool-map project"
node packages/my-cool-map/index.js
```

If all goes well, you will see the exciting output:

```
Successfully called the shared utility function!
Data obtained in the game map: { level: 10, vip: true }
```

Congratulations! You have successfully built and understood the core workflow of a Monorepo. Now, you no longer have to worry about copying and pasting code. If you need to modify`getPlayerExtraData`, you only need to change it once in`common-utils`, and all projects that depend on it will be automatically updated!
