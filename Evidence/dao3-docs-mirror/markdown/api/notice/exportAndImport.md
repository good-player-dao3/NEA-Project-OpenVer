---
title: "代码编写规范指南"
source: "https://docs.dao3.fun/api/notice/exportAndImport.html"
---

# 代码编写规范指南

### Arena 环境

在 Arena 环境中，服务端与客户端采用不同的架构体系和编写规范：

- **服务端**：采用`CommonJS`规范
- **客户端**：采用`ES6`规范

### ArenaPro 环境

ArenaPro 环境实现了统一架构，为开发带来更简洁高效的体验：

- **推荐规范**：统一使用`ESNext`规范
- **主要优势**：
  - 代码更简洁易读
  - 支持最新 JavaScript 特性
  - 开发体验更统一

## 服务端开发规范

### 模块导出（CommonJS）

服务端使用`CommonJS`规范进行模块导出。主要通过`module.exports`实现：

javascript

```
// 示例1：导出多个函数和变量
const playerUtils = {
  getPlayerHealth(player) {
    return player.health;
  },
  healPlayer(player, amount) {
    player.health += amount;
  },
  MAX_HEALTH: 100,
};

module.exports = playerUtils;

// 示例2：分别导出多个内容
module.exports.createEnemy = function (type, level) {
  return {
    type,
    level,
    power: level * 10,
  };
};

module.exports.ENEMY_TYPES = ["goblin", "dragon", "boss"];
```

### 模块导入（require）

使用`require()`函数导入模块：

javascript

```
// 示例1：导入整个模块
const playerUtils = require("./playerUtils.js");

// 使用导入的功能
const player = { health: 50 };
playerUtils.healPlayer(player, 20);
console.log(playerUtils.getPlayerHealth(player)); // 输出: 70

// 示例2：使用解构赋值导入特定功能
const { createEnemy, ENEMY_TYPES } = require("./enemyUtils.js");

const newEnemy = createEnemy(ENEMY_TYPES[0], 5);
console.log(newEnemy); // 输出: { type: 'goblin', level: 5, power: 50 }
```

### 最佳实践

- 模块文件名使用小写，采用驼峰或下划线命名
- 相关功能打包在同一个模块中导出
- 为导出的函数和变量添加清晰的注释
- 避免循环依赖

## 客户端开发规范

### 模块导出（ES6）

客户端使用 ES6 模块化规范，支持命名导出和默认导出：

javascript

```
// 示例1：UI组件导出
export class GameUI {
  constructor() {
    this.elements = new Map();
  }

  addElement(id, element) {
    this.elements.set(id, element);
  }

  render() {
    // 渲染逻辑
  }
}

// 示例2：工具函数导出
export const formatScore = (score) => `Score: ${score.toLocaleString()}`;
export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

// 默认导出主游戏类
export default class Game {
  constructor() {
    this.ui = new GameUI();
    this.score = 0;
    this.time = 0;
  }

  start() {
    // 游戏启动逻辑
  }
}
```

### 模块导入（import）

javascript

```
// 示例1：导入游戏核心功能
import Game, { GameUI, formatScore, formatTime } from "./game.js";

// 初始化游戏
const game = new Game();
const ui = new GameUI();

// 使用工具函数
console.log(formatScore(1000000)); // 输出: Score: 1,000,000
console.log(formatTime(125)); // 输出: 2:05

// 示例2：按需导入
import { GameUI as UserInterface } from "./game.js";
const ui = new UserInterface();
```

### 最佳实践

- 使用有意义的模块名和导出名
- 优先使用命名导出，便于代码追踪和重构
- 一个文件只包含一个默认导出
- 保持模块功能单一，避免过度耦合

## 注意事项

- 在 Arena 环境中严格遵循服务端和客户端的不同规范
- 在 ArenaPro 中统一使用 ES6+ 规范
- 确保导入路径正确，包含文件扩展名
- 避免在模块中直接修改全局状态
