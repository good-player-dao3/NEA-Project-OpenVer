---
title: "成为构建大师：用 Webpack 插件实现流程自动化"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/webpackPlugins.html"
---

# 成为构建大师：用 Webpack 插件实现流程自动化

## 手动修改版本号的“最后一次”

想象一下，你正在维护一个快速迭代的项目。每次发布新版本前，你可能都需要做一个重复性的工作：

> 打开某个`config.ts`文件，手动将版本号从`1.2.0`改成`1.2.1`，再更新一下发布时间。

这个操作虽然简单，但却充满了“工业时代”的笨拙感：

- **容易忘记**：一忙起来，你就可能忘记修改，导致线上版本信息不正确。
- **信息孤岛**：这个版本号与`package.json`里的版本号是脱节的，你实际上在维护两个版本号。

如果有一种方法，能让构建过程**自动读取**`package.json`的版本号，并把它**注入**到我们的代码里，那该多好？

答案是：你可以做到！通过自定义 ArenaPro 项目的**Webpack**构建流程，你可以成为一名“构建大师”，让许多重复性工作自动化。

## ⚠️ 在成为“大师”之前，请务必阅读！

Danger

**这是一个非常高级的功能，请谨慎使用。**

- **责任自负**: 一旦你创建了自定义的`webpack.config.js`，你就接管了项目的构建配置。如果因配置不当导致构建失败或运行时错误，你需要自行排查解决。
- **高风险**: 很多 Webpack 插件，特别是那些会修改代码逻辑的（如混淆、压缩），可能会与 ArenaPro 引擎产生冲突，导致游戏无法正常运行。
- **从小处着手**: 不要直接复制粘贴网上复杂的配置。从一个最简单的配置开始，一次只增加或修改一个选项，并立即测试其效果。
- **充分测试**: 每次修改配置后，请务必完整地测试你的游戏，确保所有功能都正常。

如果你不确定自己在做什么，我们强烈建议你**不要**使用这个功能。

## 实战：打造一个“版本信息自动注入器”

我们的目标是：在代码中能直接使用`__APP_VERSION__`和`__BUILD_DATE__`这两个全局变量，并且它们的值是在每次构建时自动生成的。

我们将通过 Webpack 内置的`DefinePlugin`插件轻松实现这个目标。

### 第 1 步：创建`webpack.config.js`

在你的项目根目录（与`package.json`同级）创建一个名为`webpack.config.js`的文件。

这个文件的基本结构如下，它导出一个函数，该函数需要返回一个 Webpack 配置对象。ArenaPro 会将你返回的对象与默认配置进行智能合并。

javascript

```
// webpack.config.js

// 默认的 webpack 配置会作为参数传入，方便你进行微调
module.exports = function (defaultConfig) {
  // 你可以在这里修改 defaultConfig
  // ...

  // 或者完全返回一个新的配置对象
  return {
    ...defaultConfig, // 推荐继承默认配置
    // 在这里添加你的自定义配置
    plugins: [
      ...(defaultConfig.plugins || []), // 继承默认插件
      // ... 在这里添加你的新插件
    ],
  };
};
```

### 第 2 步：配置`DefinePlugin`

现在，我们来配置`DefinePlugin`，让它为我们注入想要的变量。

javascript

```
// webpack.config.js
const webpack = require("webpack");
const packageJson = require("./package.json"); // 引入 package.json 文件，以读取版本号

module.exports = function (defaultConfig) {
  //...
    plugins: [
      // 使用 DefinePlugin 注入全局常量
      new webpack.DefinePlugin({
        // 注入版本号，值从 package.json 读取
        __APP_VERSION__: JSON.stringify(packageJson.version),
        // 注入构建日期，值为当前构建时的时间戳
        __BUILD_DATE__: JSON.stringify(new Date().toLocaleString()),
      }),
    ],
  //...
};
```

### 第 3 步：在代码中享受自动化成果

配置完成后，你需要**重启一下构建进程**（如果正在运行的话）才能让`webpack.config.js`生效。

然后，你就可以在代码中直接使用这两个新变量了！为了获得更好的代码提示，建议在你的`types`目录下创建一个`.d.ts`文件（如`types/global.d.ts`），声明一下这两个全局变量。

typescript

```
// types/global.d.ts
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
```

现在，在你的游戏入口处，你可以这样写：

typescript

```
// server/src/index.ts
console.log(`欢迎来到游戏！`);
console.log(`当前版本: ${__APP_VERSION__}`);
console.log(`构建于: ${__BUILD_DATE__}`);
```

当你运行游戏时，就会看到：

```
欢迎来到游戏！
当前版本: 1.2.1
构建于: 2025/6/26 10:30:00 AM
```

从此以后，你再也无需手动管理版本信息了！每次构建，最新的信息都会被自动烧录进你的代码中。

## 进阶挑战：保护你的代码 (代码混淆)

如果你对构建流程的自定义意犹未尽，可以挑战一个更高级的任务：代码混淆。

代码混淆是一种通过重命名变量、加密字符串等方式，让你的代码变得极难阅读的技术。这可以有效地保护你的核心逻辑不被轻易地逆向破解。

> **警告**：这是一个高风险操作，请务必在充分理解和测试后再使用。

我们将使用`webpack-obfuscator`插件来实现这个目标。

1. **安装插件**:`npm install webpack-obfuscator javascript-obfuscator --save-dev`
2. **配置`webpack.config.js`**:

javascript

```
// webpack.config.js
const WebpackObfuscator = require("webpack-obfuscator");
const webpack = require("webpack");
const packageJson = require("./package.json");

module.exports = function (defaultConfig) {

//  ...
    plugins: [
      // ... 此处省略我们上面已添加的 DefinePlugin ...
      new webpack.DefinePlugin({
        __APP_VERSION__: JSON.stringify(packageJson.version),
        __BUILD_DATE__: JSON.stringify(new Date().toLocaleString()),
      }),

        new WebpackObfuscator({
          // 一个相对安全的配置集，可以有效混淆，同时降低与引擎冲突的风险
          compact: true,
          stringArray: true,
          rotateStringArray: true,
          selfDefending: false,
          shuffleStringArray: true,
          splitStrings: true,
          stringArrayEncoding: ["base64"],
          stringArrayThreshold: 0.75,
        }),
    ].filter(Boolean), // 使用 .filter(Boolean) 优雅地移除数组中的 false 值
//  ...
};
```

配置完成后，当你执行**完整构建 (`Alt+Q`)**时，最终输出的代码就会被加密混淆。
