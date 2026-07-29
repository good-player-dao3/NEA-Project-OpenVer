---
title: "进阶功能(九)：导出代码到 Arena"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/toArena.html"
---

# 进阶功能(九)：导出代码到 Arena

当你使用 ArenaPro 构建了强大的功能后，你可能会想：

> “我如何将这些复杂的功能，分享给不熟悉 ArenaPro 的队友，或者在其他项目中复用它们呢？”

答案就是**代码导出**。

通过这个机制，你可以将你的 ArenaPro 项目封装成一个简单易用的“功能黑盒”，让其他创作者（甚至是不懂编程的游戏策划）可以在普通的 Arena 编辑器中，像调用官方 API 一样轻松地调用你的代码。

## 核心理念：专业分工

代码导出的本质，是将**“底层系统开发”**与**“上层玩法实现”**彻底分离开。

- **核心创作者 (你)**：在 ArenaPro 中，使用 TypeScript 构建稳定、可复用的底层系统，如战斗框架、UI 组件库、背包系统等。
- **游戏策划 / 脚本创作者**：在 Arena 编辑器中，无需关心底层实现，直接调用你提供的功能，快速实现上层玩法、搭建关卡。

这是一种团队协作模式。

## 如何从 ArenaPro 导出代码？

将你的代码暴露给外部世界非常简单，只需一个关键字：`export`。

1. 打开你的入口文件（例如`server/App.ts`）。
2. 在你希望分享的函数、类或变量前，添加`export`关键字。

**就这样，完成了！**Webpack 在打包时会自动处理剩下的事情，将你导出的所有内容组织成一个模块。

### 示例：导出一个函数

ts

```
// server/App.ts

// 使用 export 关键字，将这个函数暴露出去
export function createEnemy(type: "goblin" | "orc", position: Vector) {
  // ... 内部包含复杂的逻辑 ...
  const model =
    type === "goblin" ? "asset/goblin.item.json" : "asset/orc.item.json";
  world.createEntity({ model, position });
  console.log(`在 ${position} 创建了一个 ${type}`);
}

// 这个函数没有 export，所以外部无法访问
function internalHelper() {
  // ...
}

export default {
  // ... 游戏的主要逻辑 ...
};
```

## 如何在 Arena 编辑器中调用？

现在，你的队友就可以在 Arena 编辑器中轻松使用你导出的功能了。

根据代码运行的环境（服务端或客户端），Arena 编辑器使用了不同的模块系统，因此导入语法也略有不同。

| 环境 | 导入语法 | 说明 |
| --- | --- | --- |
| **服务端脚本** | `require`(CommonJS) | Arena 的服务端环境使用 Node.js 风格的模块系统。 |
| **客户端脚本** | `import`(ESM) | Arena 的客户端环境支持更现代的 ES 模块标准。 |

### 示例：调用导出的函数

你的队友在 Arena 的服务端脚本中，只需写下面这几行简单的代码，就可以调用你精心封装的复杂功能：

javascript

```
// 在 Arena 服务端脚本中

// 1. 使用 require 导入你构建好的 JS 文件
const myGameLib = require("./_server_bundle.js");

// 2. 调用你导出的函数
myGameLib.createEnemy("goblin", { x: 0, y: 10, z: 0 });
myGameLib.createEnemy("orc", { x: 10, y: 10, z: 10 });
```

他们完全不需要关心`createEnemy`内部是如何实现的，只需要知道如何调用即可。

## 价值与优势

- **开发门槛降低**：不熟悉 ArenaPro 的成员也能高效参与开发。
- **开发效率提升**：核心代码一次开发，处处使用，避免重复造轮子。
- **代码质量保障**：核心功能由专人维护，上层逻辑可以快速迭代。
- **迭代速度加快**：清晰的职责分工让并行开发成为可能。
