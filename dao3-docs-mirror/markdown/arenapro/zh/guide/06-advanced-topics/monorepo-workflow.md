---
title: "教程：用 Monorepo 管理你的多个神岛项目"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/monorepo-workflow.html"
---

# 教程：用 Monorepo 管理你的多个神岛项目

## 你是否遇到过这样的烦恼？

假设你正在同时开发两个地图项目：《天际跑酷》和《寻宝奇兵》。

在开发《天际跑酷》时，你写了一个很方便的工具函数，比如`getPlayerExtraData(player)`，用来获取玩家的附加信息。

javascript

```
// 在《天际跑酷》项目里
function getPlayerExtraData(player) {
  // ...一堆复杂的逻辑...
  return { level: 10, vip: true };
}
```

几天后，在开发《寻宝奇兵》时，你发现：“这个函数我也需要用！”

这时候，你通常会怎么做？

1. **复制粘贴**：把函数代码从《天际跑酷》复制到《寻宝奇兵》。
2. **问题出现**：过了一周，你修复了`getPlayerExtraData`的一个 Bug，但你只在《天际跑酷》里修复了，却**忘记**了《寻宝奇兵》也有一份同样的代码。

这正是许多创作者的噩梦：**一份代码，多个副本，维护起来一团糟。**

Monorepo（单一代码仓库）就是解决这个问题的最佳方案。它能让你把所有相关的项目（比如你的所有地图、所有共享工具）都放在一个大文件夹里，并且可以**轻松地共享代码，而无需复制粘贴**。

本教程将用最简单的方式，带你一步步搭建一个属于你自己的 Monorepo。

## 准备工作

你只需要电脑上安装了[Node.js](https://nodejs.org/)即可，它已经自带了`npm`包管理器，我们全程只用它。

## 一步步搭建你的第一个 Monorepo

我们的目标是：创建一个共享工具库`common-utils`，然后让我们的游戏项目`my-cool-map`来使用它。

### 步骤 1：创建“总基地”

首先，我们需要一个“总基地”文件夹来存放我们所有的项目。

bash

```
# 1. 创建一个总文件夹，名字你随便取
mkdir my-projects
cd my-projects

# 2. 初始化项目，生成一个 package.json 文件
npm init -y
```

接下来，是最关键的一步：编辑刚刚生成的`package.json`文件，告诉`npm`：“嘿，我这个文件夹是个 Monorepo，请帮我管理一下里面的子项目”。

json

```
// my-projects/package.json
{
  "name": "my-projects",
  "private": true, // 必须设置为 true，防止你把整个“总基地”发布出去
  "workspaces": [
    "packages/*" // 告诉 npm，所有在 packages 文件夹里的子项目，都由我来管理
  ]
}
```

### 步骤 2：创建你的“共享工具箱”

现在，我们在“总基地”里创建一个`packages`文件夹，专门用来放那些需要被共享的工具。

bash

```
# 确保你当前在 my-projects 文件夹里
mkdir packages
cd packages

# 1. 在 packages 里，创建我们第一个共享工具项目
mkdir common-utils
cd common-utils

# 2. 同样，为它创建一个 package.json
npm init -y
```

编辑`common-utils/package.json`，给它起个名字。这个名字很重要，因为我们之后会用它来引用这个工具箱。

json

```
// my-projects/packages/common-utils/package.json
{
  "name": "common-utils", // 这就是工具箱的名字
  "version": "1.0.0",
  "main": "index.js"
}
```

现在，我们来编写那个我们心心念念的共享函数：

javascript

```
// my-projects/packages/common-utils/index.js

// 我们的第一个共享函数！
export function getPlayerExtraData(player) {
  console.log("成功调用了共享的工具函数！");
  return { level: 10, vip: true };
}
```

### 步骤 3：创建并使用你的“游戏项目”

工具箱准备好了，现在我们来创建使用它的游戏项目。

bash

```
# 回到 my-projects/packages 目录
cd ..

# 1. 创建游戏项目
mkdir my-cool-map
cd my-cool-map

# 2. 初始化
npx create-arena-project@latest .
```

编辑`my-cool-map/package.json`，并声明它需要依赖我们的`common-utils`工具箱。

json

```
// my-projects/packages/my-cool-map/package.json
{
  "name": "my-cool-map",
  "version": "1.0.0",
  "dependencies": {
    "common-utils": "1.0.0" // 声明依赖，版本号要对应上
  }
}
```

**注意：**ArenaPro 项目默认使用`import`语法，所以我们也要在`package.json`中声明模块类型。

json

```
// my-projects/packages/my-cool-map/package.json
{
  "name": "my-cool-map",
  "version": "1.0.0",
  "type": "module", // <-- 加上这行
  "dependencies": {
    "common-utils": "1.0.0"
  }
}
```

### 步骤 4：把所有东西“连接”起来！

现在，我们所有的材料都准备好了。回到“总基地”的根目录，执行最后一步，让`npm`把所有项目都关联起来。

bash

```
# 回到总基地 my-projects
cd ../..

# 运行安装！
npm install
```

`npm install`这时会做一件神奇的事：它看到`my-cool-map`依赖`common-utils`，并且发现`common-utils`就在本地的工作区里，于是它不会去网上下载，而是直接在`my-cool-map/node_modules`里创建了一个指向`packages/common-utils`的**快捷方式（符号链接）**。

这意味着，你将来对`common-utils`的任何修改，`my-cool-map`都能**立刻感知到**！

### 步骤 5：验证成果

让我们在游戏项目里调用一下共享函数。

创建`my-projects/packages/my-cool-map/index.js`文件：

javascript

```
// my-projects/packages/my-cool-map/index.js
import { getPlayerExtraData } from "common-utils";

// 模拟一个 player 对象
const fakePlayer = { id: "player-1" };

// 调用共享函数
const extraData = getPlayerExtraData(fakePlayer);

console.log("在游戏地图中拿到的数据:", extraData);
```

现在，我们怎么运行这个`index.js`呢？很简单，使用`npm`的`-w`(workspace) 参数，告诉它你要在哪个子项目里执行命令。

bash

```
# 确保你在“总基地” my-projects 目录下
# -w my-cool-map 的意思是“在 my-cool-map 这个项目里执行后面的命令”
node packages/my-cool-map/index.js
```

如果一切顺利，你将看到激动人心的输出：

```
成功调用了共享的工具函数！
在游戏地图中拿到的数据: { level: 10, vip: true }
```

恭喜你！你已经成功搭建并理解了 Monorepo 的核心工作流程。现在，你再也不用为复制粘贴代码而烦恼了。如果需要修改`getPlayerExtraData`，只需在`common-utils`中修改一次，所有依赖它的项目都会自动更新！
