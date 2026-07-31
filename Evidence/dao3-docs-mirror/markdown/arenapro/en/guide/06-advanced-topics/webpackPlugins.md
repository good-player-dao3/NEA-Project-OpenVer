---
title: "Become a Build Master: Automate Your Workflow with Webpack Plugins"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/webpackPlugins.html"
---

# Become a Build Master: Automate Your Workflow with Webpack Plugins

## The "Last Time" You Manually Change a Version Number

Imagine you are maintaining a rapidly iterating project. Before each new release, you might need to do a repetitive task:

> Open a`config.ts`file, manually change the version number from`1.2.0`to`1.2.1`, and then update the release date.

This operation, though simple, is filled with the clumsiness of an "industrial era":

- **Easy to Forget**: When you're busy, you might forget to make the change, leading to incorrect version information online.
- **Information Silo**: This version number is disconnected from the version number in`package.json`; you are essentially maintaining two version numbers.

Wouldn't it be great if there were a way for the build process to**automatically read**the version number from`package.json`and**inject**it into our code?

The answer is: you can! By customizing the**Webpack**build process of your ArenaPro project, you can become a "build master" and automate many repetitive tasks.

## ⚠️ Before Becoming a "Master," Please Read This!

Danger

**This is a very advanced feature. Please use it with caution.**

- **At Your Own Risk**: Once you create a custom`webpack.config.js`, you take over the project's build configuration. If the build fails or a runtime error occurs due to improper configuration, you need to troubleshoot and resolve it yourself.
- **High Risk**: Many Webpack plugins, especially those that modify code logic (like obfuscation, compression), may conflict with the ArenaPro engine, causing the game to not run properly.
- **Start Small**: Do not directly copy and paste complex configurations from the internet. Start with the simplest configuration, add or modify one option at a time, and test its effect immediately.
- **Thorough Testing**: After each configuration change, be sure to fully test your game to ensure all functions are normal.

If you are not sure what you are doing, we strongly recommend that you**do not**use this feature.

## Practical Example: Creating a "Version Info Auto-Injector"

Our goal is to be able to directly use the global variables`__APP_VERSION__`and`__BUILD_DATE__`in our code, with their values automatically generated during each build.

We will easily achieve this with Webpack's built-in`DefinePlugin`.

### Step 1: Create`webpack.config.js`

In your project root (at the same level as`package.json`), create a file named`webpack.config.js`.

The basic structure of this file is as follows. It exports a function that needs to return a Webpack configuration object. ArenaPro will intelligently merge the object you return with the default configuration.

javascript

```
// webpack.config.js

// The default webpack config is passed as an argument, making it easy for you to fine-tune.
module.exports = function (defaultConfig) {
  // You can modify defaultConfig here
  // ...

  // Or return a completely new configuration object
  return {
    ...defaultConfig, // It's recommended to inherit the default config
    // Add your custom configuration here
    plugins: [
      ...(defaultConfig.plugins || []), // Inherit default plugins
      // ... Add your new plugins here
    ],
  };
};
```

### Step 2: Configure`DefinePlugin`

Now, let's configure`DefinePlugin`to inject the variables we want.

javascript

```
// webpack.config.js
const webpack = require("webpack");
const packageJson = require("./package.json"); // Import the package.json file to read the version number

module.exports = function (defaultConfig) {
  //...
    plugins: [
      // Use DefinePlugin to inject global constants
      new webpack.DefinePlugin({
        // Inject the version number, value read from package.json
        __APP_VERSION__: JSON.stringify(packageJson.version),
        // Inject the build date, value is the timestamp of the current build
        __BUILD_DATE__: JSON.stringify(new Date().toLocaleString()),
      }),
    ],
  //...
};
```

### Step 3: Enjoy the Automation in Your Code

After configuration, you need to**restart the build process**(if it's running) for`webpack.config.js`to take effect.

Then, you can directly use these two new variables in your code! For better code completion, it's recommended to create a`.d.ts`file in your`types`directory (e.g.,`types/global.d.ts`) to declare these two global variables.

typescript

```
// types/global.d.ts
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
```

Now, at your game's entry point, you can write:

typescript

```
// server/src/index.ts
console.log(`Welcome to the game!`);
console.log(`Current Version: ${__APP_VERSION__}`);
console.log(`Built on: ${__BUILD_DATE__}`);
```

When you run the game, you will see:

```
Welcome to the game!
Current Version: 1.2.1
Built on: 2025/6/26 10:30:00 AM
```

From now on, you will no longer need to manage version information manually! The latest information will be automatically burned into your code with every build.

## Advanced Challenge: Protecting Your Code (Code Obfuscation)

If you're still eager for more customization of the build process, you can take on a more advanced task: code obfuscation.

Code obfuscation is a technique that makes your code extremely difficult to read by renaming variables, encrypting strings, etc. This can effectively protect your core logic from being easily reverse-engineered.

> **Warning**: This is a high-risk operation. Please use it only after full understanding and testing.

We will use the`webpack-obfuscator`plugin to achieve this.

1. **Install the plugin**:`npm install webpack-obfuscator javascript-obfuscator --save-dev`
2. **Configure`webpack.config.js`**:

javascript

```
// webpack.config.js
const WebpackObfuscator = require("webpack-obfuscator");
const webpack = require("webpack");
const packageJson = require("./package.json");

module.exports = function (defaultConfig) {

//  ...
    plugins: [
      // ... Omit the DefinePlugin we added above ...
      new webpack.DefinePlugin({
        __APP_VERSION__: JSON.stringify(packageJson.version),
        __BUILD_DATE__: JSON.stringify(new Date().toLocaleString()),
      }),

        new WebpackObfuscator({
          // A relatively safe set of configurations that can effectively obfuscate
          // while reducing the risk of conflicts with the engine
          compact: true,
          stringArray: true,
          rotateStringArray: true,
          selfDefending: false,
          shuffleStringArray: true,
          splitStrings: true,
          stringArrayEncoding: ["base64"],
          stringArrayThreshold: 0.75,
        }),
    ].filter(Boolean), // Elegantly remove false values from the array using .filter(Boolean)
//  ...
};
```

After configuration, when you perform a**full build (`Alt+Q`)**, the final output code will be encrypted and obfuscated.
