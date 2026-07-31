---
title: "Code Debugging (II): Using HMR for Hot Updates"
source: "https://docs.dao3.fun/arenapro/en/guide/04-development-workflow/hmr.html"
---

# Code Debugging (II): Using HMR for Hot Updates

If you find it troublesome to manually press`Alt+Q`to rebuild your project every time you modify the code, then**Hot Module Replacement (HMR)**will be your "super accelerator."

## What is HMR?

Imagine you are building a complex scene. Every time you move a block, the entire structure has to be torn down and rebuilt, which is extremely inefficient.

- **Regular Build (`Alt+Q`)**: This is like tearing down and rebuilding. It packages all your code, no matter how small the change.
- **HMR**: This is like an intelligent robot that only replaces the block you just moved, while the rest of the structure remains intact.

When HMR is enabled, it starts a local server to "watch" your code files. As soon as you press`Ctrl+S`to save a file, HMR will:

1. **Automatically and incrementally**recompile the code that has changed.
2. **Instantly and without a full refresh**, push the updates to the running game.

This means you can write code in VS Code and see the effects**in real-time**in the adjacent creator client, greatly improving development efficiency and debugging experience.

![HMR real-time update demo](https://static.codemao.cn/pickduck/HJBNk__g1x.gif?hash=Fq9hwMXyh-2yGkZY1t42TXPsw57i)

## How to Use HMR?

### 1. Start the HMR Server

In the bottom-left corner of the VS Code interface, you will see the status button for the HMR server.

- **Click "Start HMR Server"**to enable this feature.

![Start HMR Server](/arenapro/QQ20241128-233644.png)

### 2. Understand the Status Indicator

Once the server is started, the button's color will tell you its working status:

| Color | Status | Meaning |
| --- | --- | --- |
| 🟠**Orange** | Not Started | The HMR service is currently off. |
| 🟢**Green** | Running Normally | **Everything is normal!**The server is watching for your file changes. |
| 🔴**Red** | Exception Occurred | The server has encountered a problem, and auto-compilation has stopped. |

### 3. Start Real-Time Coding!

1. Ensure the HMR server is in the**🟢 Green**state.
2. Open any code file in the`server/`or`client/`directory.
3. Modify a line of code, then press`Ctrl+S`to save.
4. Observe the VS Code terminal; you will see HMR automatically start compiling.
5. After successful compilation, switch to the creator client. Without clicking "Run," your changes are already in effect!

### 4. Stop the Server

When you are done debugging and ready to close the project,**click the 🟢 green button in the bottom-left corner again**to stop the HMR server.

## FAQ and Advanced Usage

**Q: Why isn't HMR reacting after I modify a file?**

**A:**By default, HMR only watches the entry files in the`server/`and`client/`directories and their dependencies. If you modify configuration files like`node_modules`or`webpack.config.js`, it will not trigger a hot update; you will need to restart the HMR server.

**Q: What should I do if the status is red ("Exception")?**

**A:**This is usually due to a serious syntax error in the code that prevents Webpack from compiling. First, check the error message in the terminal output and fix your code. If the problem persists,**clicking the 🔴 red button**can try to restart the server.

**Q: What is the relationship between HMR and multiple entry files?**

**Click to see: HMR's multi-entry configuration (Advanced)**

One of HMR's powerful features is its ability to watch multiple independent entry files simultaneously, which is crucial for**code splitting**in large projects.

You can configure multiple entries in the`outputAndUpdate`array in`dao3.config.json`:

jsonc

```
// dao3.config.json
"outputAndUpdate": [
    // Entry one: packages the main business logic
    {
      "name": "bundle.js",
      "serverEntry": "src/App.ts",
      "clientEntry": "src/clientApp.ts"
    },
    // Entry two: packages a separate admin tool
    {
      "name": "admin-tool.js",
      "serverEntry": "src/admin/index.ts"
    }
]
```

- **Full Build (`Alt+Q`)**: Will only build the**first item**in the array (`bundle.js`).
- **HMR Mode**: Will watch and build**all items**in the array simultaneously. When you modify`src/admin/index.ts`, only`admin-tool.js`will be recompiled and hot-updated.

This method is very suitable for separating modules like core gameplay, event gameplay, and admin tools, achieving more efficient development and loading.

Now you have mastered how to use HMR to accelerate your development cycle. This will greatly enhance your creative experience in ArenaPro.

Make good use of HMR, and you will enjoy a silky-smooth development experience, allowing you to focus more energy on creating the core fun of the game.
