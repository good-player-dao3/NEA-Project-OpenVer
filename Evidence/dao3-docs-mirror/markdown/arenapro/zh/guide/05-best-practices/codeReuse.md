---
title: "双端开发(一)：共享代码 (Single Source of Truth)"
source: "https://docs.dao3.fun/arenapro/zh/guide/05-best-practices/codeReuse.html"
---

# 双端开发(一)：共享代码 (Single Source of Truth)

在开发游戏时，很多逻辑需要在**服务端**和**客户端**同时用到。

**思考这个场景**：

- **服务端**需要根据玩家的等级和装备，计算出他应该造成的实际伤害。
- **客户端**为了有更好的用户体验，需要在玩家悬停在技能按钮上时，提前显示一个伤害预览的 Tooltip。

如果这两处的伤害计算逻辑你写了两遍，一旦伤害公式需要调整，你很可能会忘记修改其中一处，导致客户端预览和服务器实际结算不一致的 Bug。

这就是我们需要**代码共享**的原因。ArenaPro 提供了一个专门的`shares/`文件夹，来解决这个问题。

## 🤔 为什么需要共享代码？

在很多游戏中，客户端（玩家看到的界面、操作）和服务端（游戏逻辑、数据处理）都需要处理一些相同的概念。例如：

- **游戏公式**：伤害计算、经验值曲线、掉落率等。
- **数据结构定义**：背包物品、玩家属性、技能数据等 TypeScript`interface`或`type`。
- **常量**：例如`const MAX_PLAYERS = 16;`。
- **纯工具函数**：不依赖任何端环境的通用函数（如数学计算、字符串处理）。

在 VS Code 的文件浏览器中，在你的项目根目录（与`client`和`server`同级）下，**手动创建一个名为`shares`的新文件夹**。

这个目录就是我们未来存放所有共享代码的“圣地”。创建完成后，你的项目结构看起来应该是这样的：

![](/arenapro/QQ20250709-210731.png)

## 2. 如何使用共享代码

现在，你可以在`shares`目录中创建任何你想要共享的`.ts`文件。例如，我们创建一个`shares/config.ts`文件来存放游戏的核心配置：

## `shares/`文件夹：你的“唯一真相来源”

`shares/`文件夹里的代码非常特殊：它既可以被`server/`目录下的服务端代码引用，也可以被`client/`目录下的客户端代码引用。

这让它成为了定义**“唯一真相来源 (Single Source of Truth)”**的完美场所。对于游戏规则、数据结构、计算公式等核心逻辑，你只需要在这里写一次，客户端和服务端就能共享这套标准。

## 实战演练：共享一个经验值计算函数

让我们来创建一个共享的函数，用于根据等级计算升到下一级所需的经验值。

### 第 1 步：在`shares/`中创建文件并编写逻辑

1. 在`shares/`目录下创建一个新文件，例如`gameplay.ts`。
2. 在`gameplay.ts`中，编写我们的等级计算函数，并使用`export`关键字将其导出。

ts

```
// shares/gameplay.ts

/**
 * 根据玩家当前等级，计算升到下一级所需的总经验值
 * @param level 当前等级
 * @returns 升到下一级所需的经验值
 */
export function getXPForLevel(level: number): number {
  // 等级越高，所需经验越多 (例如，每级增加15%)
  return Math.floor(100 * Math.pow(1.15, level - 1));
}
```

### 第 2 步：在服务端使用共享函数

现在，服务端可以在处理玩家获得经验的逻辑时，调用这个函数来判断是否升级。

ts

```
// server/src/App.ts
import { getXPForLevel } from '../../shares/gameplay';

// ...
  async onPlayerGetKill(player) {
    const currentXP = player.getData('xp');
    const currentLevel = player.getData('level');

    const newXP = currentXP + 50; // 每次击杀获得 50 点经验
    player.setData('xp', newXP);

    const xpForNextLevel = getXPForLevel(currentLevel);

    if (newXP >= xpForNextLevel) {
      player.setData('level', currentLevel + 1);
      player.setData('xp', 0); // 重置经验值
      player.sendChat(`恭喜！你已升到 ${currentLevel + 1} 级！`);
    }
  }
// ...
```

### 第 3 步：在客户端使用同一个函数

同时，客户端可以在 UI 界面上调用**完全相同**的函数，来显示升级进度条。

ts

```
// client/src/App.ts
import { getXPForLevel } from "../../shares/gameplay";

function updateUserXPBar(currentXP: number, currentLevel: number) {
  const xpForNextLevel = getXPForLevel(currentLevel);
  const progress = (currentXP / xpForNextLevel) * 100;

  // 假设我们有一个更新UI的函数
  // updateProgressBar('xp-bar', progress, `${currentXP} / ${xpForNextLevel}`);
  console.log(`当前升级进度: ${progress.toFixed(1)}%`);
}

// 监听服务端数据变化
box.watchData("xp", (newXP) => {
  const currentLevel = box.getData("level");
  updateUserXPBar(newXP, currentLevel);
});
```

现在，如果将来你想调整经验值曲线，**只需要修改`shares/gameplay.ts`中那一个函数**，客户端和服务端的表现就会自动保持一致！

## 什么应该放进`shares/`？

✅**适合共享的：**

- **游戏公式**：伤害计算、经验值曲线、掉落率等。
- **数据结构定义**：背包物品、玩家属性、技能数据等 TypeScript`interface`或`type`。
- **常量**：例如`const MAX_PLAYERS = 16;`。
- **纯工具函数**：不依赖任何端环境的通用函数（如数学计算、字符串处理）。

🚫**不适合共享的：**

- 任何调用了**仅限服务端 API**的代码 (例如`player.kick()`、`world.createEntity()`)。
- 任何调用了**仅限客户端 API**的代码 (例如`ui.findChildByName()`、操作 UI 元素)。
- 包含密钥、数据库地址等敏感信息的代码。

通过遵循这种“单一数据源”的原则，你可以编写出更简洁、更健壮、更易于维护的代码。

---

在下一篇指南中，我们将探讨如何通过定义“类型安全”的事件，来让客户端与服务端的通信变得同样健壮。
