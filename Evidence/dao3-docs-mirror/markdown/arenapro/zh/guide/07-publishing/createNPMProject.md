---
title: "从 0 到 1：发布你人生中的第一个 NPM 包"
source: "https://docs.dao3.fun/arenapro/zh/guide/07-publishing/createNPMProject.html"
---

# 从 0 到 1：发布你人生中的第一个 NPM 包

## 你也想成为社区的“大神”吗？

想象一下，在开发游戏的过程中，你积累了很多好用的工具函数：

- 一个能让数字显示得更漂亮的`formatNumber`函数。
- 一个超好用的`TweenAnimation`缓动动画类。
- 一个能帮你处理复杂背包逻辑的`InventoryManager`。

你觉得这些代码非常棒，其他的神岛创作者们也一定会喜欢。这时，一个想法油然而生：“**我能把我的代码分享出去，让别人也能用吗？**”

答案是：**当然能！**

通过将你的代码发布为一个**NPM 包**，你就可以让全世界的创作者通过一句简单的`npm install your-cool-lib`来使用你的杰作。这不仅能让你收获社区的赞誉，更是成为一名优秀创作者的必经之路。

本教程将手把手地带你走完从 0 到 1 的全过程，让你也能成为一名 NPM 包的发布者。

## 阶段一：创建你的“代码工具箱”

首先，我们需要一个专门的项目来存放我们准备要分享的代码。

### 步骤 1：创建项目

ArenaPro 的脚手架为我们提供了专门的“组件库”模板，它已经预设好了所有正确的配置。

1. 在你的电脑上创建一个**空文件夹**（比如`my-awesome-lib`），然后在 VS Code 中打开它。
2. 按下`F1`打开命令面板，选择**`Arena-Ts: 新建Arena-Ts项目`**。
3. 在弹出的模板中，选择**`神岛组件库 (npm package)`**。
4. 根据提示填写信息（或一路回车），等待依赖安装完毕。

现在，你的“代码工具箱”项目就已经创建好了！

### 步骤 2：编写你的第一个“工具”

打开`src/index.ts`文件，把你的工具函数写进去。记住两个关键点：

- **`export`**：只有用`export`导出的函数或类，才能被别人使用。
- **JSDoc 注释 (`/** ... \*/`)**：为你所有导出的函数写上清晰的注释。这些注释会变成其他用户代码里的“智能提示”，非常重要！

typescript

```
// src/index.ts

/**
 * 将一个字符串的首字母转换为大写。
 * @param str 要转换的字符串。
 * @returns 转换后的字符串。
 * @example
 * capitalize('hello world'); // => 'Hello world'
 */
export function capitalize(str: string): string {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 将一个数字限制在指定的最小值和最大值之间。
 * @param value 要限制的数字。
 * @param min 最小值。
 * @param max 最大值。
 * @returns 限制在范围内的数字。
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
```

### 步骤 3：打包你的“工具箱”

代码写好后，我们需要把它打包成标准的 JavaScript 文件。

按下快捷键`Alt + Q`，等待终端显示“打包成功”。这时，你的项目里会多出一个`dist`文件夹，里面包含了编译好的`.js`文件和提供代码提示的`.d.ts`类型文件。

## 阶段二：在发布前，先在本地“演习”一下

直接发布一个未经测试的包是非常危险的。我们必须在本地模拟“别人使用我的包”这一过程，确保它能正常工作。

`npm link`命令就是为此而生的“创作者利器”。

### 步骤 1：在“工具箱”项目里，创建“快捷方式”

在你的“工具箱”项目 (`my-awesome-lib`) 的根目录，打开终端并运行：

bash

```
npm link
```

这会在你的电脑上为这个“工具箱”创建一个全局的“快捷方式”，让其他项目可以找到它。

### 步骤 2：在“游戏项目”里，使用“快捷方式”

现在，打开一个你自己的神岛**游戏项目**，在根目录打开终端并运行：

bash

```
# 将 "my-awesome-lib" 替换成你工具箱的真实名字 (即 package.json 中的 name 字段)
npm link my-awesome-lib
```

这会在你的游戏项目里，装上一个指向你“工具箱”的“快捷方式”。

### 步骤 3：在游戏里测试

现在，你可以在游戏代码里，像使用任何其他库一样，导入并使用你的工具函数了！

typescript

```
import { capitalize, clamp } from "my-awesome-lib";

const newName = capitalize("arena"); // 'Arena'
const safeHealth = clamp(120, 0, 100); // 100
```

最棒的是，这个链接是**实时**的。如果你发现 Bug，只需回到“工具箱”项目修改代码、重新打包 (`Alt+Q`)，游戏项目里就会立刻生效，无需任何额外操作！这极大地提升了调试效率。

## 阶段三：发布！让世界看到你的作品

当你通过本地“演习”，确认一切完美后，就可以正式发布了。

### 步骤 1：注册并登录 NPM

> 如果你还没有 NPM 账号，请先去[npmjs.com](https://www.npmjs.com)网站免费注册一个。

在“工具箱”项目的终端里运行`npm login`，并根据提示输入你的用户名、密码和邮箱。

### 步骤 2：检查你的“身份证” (`package.json`)

`package.json`就是你这个包的“身份证”，在发布前请确保关键信息无误：

- `name`: 包名，必须是**全局唯一**的。如果名字已被占用，一个常见的做法是使用带作用域的包名，如`@你的NPM用户名/my-awesome-lib`。
- `version`: 版本号，比如`1.0.0`。每次更新发布，都需要提升这个版本号。

### 步骤 3：执行发布命令

万事俱备，在“工具箱”项目的根目录运行：

bash

```
npm publish
```

如果你的包名是带作用域的（比如`@username/my-lib`），则需要添加`--access=public`参数，来告诉 NPM 这是一个公开包：

bash

```
npm publish --access=public
```

几秒钟后，你的包就会出现在 NPM 网站上，等待被世界各地的创作者发现和使用！

## 阶段四：像使用 lodash 一样，使用你自己的包

现在，你的包已经是一个真正的、公开的 NPM 包了。告别`npm link`，让我们用最标准的方式来使用它。

在任何一个全新的项目中，你只需两步就可以使用它：

1. **安装**：`npm install my-awesome-lib`
2. **使用**：`import { capitalize } from "my-awesome-lib";`

因为你之前精心编写了 JSDoc 注释，所有使用你这个包的创作者，都能享受到和你一样的、完美的“智能提示”。

恭喜你！你已经走完了从 0 到 1 的所有步骤，为开源社区贡献了自己的一份力量。这绝对是值得在朋友面前炫耀的成就！
