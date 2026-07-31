---
title: "给你的代码做“体检”：用自动化测试守护你的心血"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/automated-testing.html"
---

# 给你的代码做“体检”：用自动化测试守护你的心血

在游戏开发的世界里，有一条朴素的真理：“任何未经测试的代码，都可能在某个深夜给你一个意外的‘惊喜’。” 尤其是当你的游戏逻辑越来越复杂时，一个微小的改动，都可能引发一场“蝴蝶效应”。

你是否经历过这样的场景：

- 你修改了伤害计算公式，为了验证结果，不得不反复进入游戏、寻找怪物、攻击、观察跳出的数字...
- 你重构了一段核心算法，却因为不确定是否会影响其他功能而提心吊胆，只能把所有功能都手动点一遍...

自动化测试，就是将你从这种“刀耕火种”的测试方式中解放出来的“神器”。它就像一个为你代码服务的、不知疲倦的“体检中心”，能在几秒钟内，对你的核心逻辑进行上百次检查，并给你一份清晰的“体检报告”。

> **重要提示：这个“体检中心”能检查什么？**
>
> 本文介绍的“单元测试”，是在一个独立的环境中运行的，它专门用于验证你项目中**独立于游戏引擎的、纯粹的业务逻辑**。
>
> - **可以体检 ✅**：算法（如伤害计算、寻路逻辑）、数据处理、工具函数等不直接调用神岛 API 的“零件代码”。
> - **不能体检 ❌**：本方法**无法直接测试或调试任何需要游戏在线才能运行的神岛 API**（例如`world.onPlayerJoin`、`player.hp`等与游戏世界直接交互的功能）。

在本教程中，我们将使用业界最流行的测试框架[Jest](https://jestjs.io/)，一步步为你的 ArenaPro 项目中的“纯逻辑”部分，构建起一张可靠的质量“安全网”。

### 第一步：搭建你的“代码体检中心”

首先，我们需要为项目安装搭建“体检中心”所需的设备。

bash

```
npm install --save-dev jest ts-jest @types/jest
```

这些“设备”分别是：

- `jest`: “体检中心”的核心机器，负责执行所有检查。
- `ts-jest`: 一个 TypeScript 适配器，让`jest`这台机器能看懂`.ts`文件。
- `@types/jest`: Jest 的“说明书”，为它的所有功能提供 TypeScript 类型提示。

接下来，我们需要配置这台机器。在你的项目根目录下创建一个`jest.config.js`文件。

javascript

```
// jest.config.js
module.exports = {
  // 指定预设，ts-jest 会处理 TypeScript 文件
  preset: "ts-jest",
  // 指定“体检”环境，对于纯逻辑测试，我们使用默认的 node 环境
  testEnvironment: "node",
  // 告诉机器应该去哪些房间（目录）寻找需要体检的代码
  roots: ["<rootDir>/server/src", "<rootDir>/client/src", "<rootDir>/shares"],
  // 如何识别哪些是“体检单”（测试文件）
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  // 机器能识别的文件类型
  moduleFileExtensions: ["ts", "tsx", "js", "cjs", "mjs", "jsx", "json"],
};
```

最后，在`package.json`中安装一个“总开关”，方便我们一键启动所有体检项目：

json

```
// package.json
{
  // ... 其他配置
  "scripts": {
    "jest:test": "jest" // <-- 新增或修改这一行
  }
  // ... 其他配置
}
```

至此，我们的“代码体检中心”就建设完毕了！

### 第二步：进行第一次“体检”

我们从一个最常见的场景开始：测试一个伤害计算函数。

#### A. 准备“体检对象”

假设在`server/src/`目录下，我们有一个`damage.ts`模块，它就是我们这次要体检的对象。

typescript

```
// server/src/damage.ts

// 使用 'export' 关键字导出一个 TypeScript 接口。
// 接口（Interface）用于定义对象的“形状”或“契约”，即一个对象应该包含哪些属性以及这些属性的类型。
// 这里定义了计算伤害时所需要的所有参数。
export interface DamageOptions {
  // 攻击方的攻击力，必须是数字类型。
  attack: number;
  // 防御方的防御力，必须是数字类型。
  defense: number;
  // '?' 表示这是一个可选属性。
  // 暴击率，一个 0 到 1 之间的数字，例如 0.1 代表 10% 的暴击率。
  criticalChance?: number;
  // 暴击伤害倍率，也是一个可选属性。
  criticalMultiplier?: number;
}

/**
 * 计算最终对目标造成的伤害。
 * 这是一个 JSDoc 风格的注释，用于为函数提供详细的描述、参数说明和返回值说明。
 * 当你在其他地方调用这个函数时，IDE（如 VS Code）会显示这些信息。
 * @param options - 包含伤害计算所需参数的对象，遵循 DamageOptions 接口。
 * @returns 返回计算后的最终伤害数值。
 */
export function calculateDamage(options: DamageOptions): number {
  // 使用对象解构赋值从 'options' 参数中提取属性。
  // 这种语法可以让我们方便地为可选参数设置默认值。
  const {
    attack,
    defense,
    criticalChance = 0,
    criticalMultiplier = 1.5,
  } = options;

  // 输入验证：进行一些基本的检查，确保输入值在合理范围内。
  if (attack <= 0 || defense < 0) {
    return 0;
  }

  // 计算基础伤害，使用 Math.max(1, ...) 确保伤害至少为 1。
  const baseDamage = Math.max(1, attack - defense);

  // 判断是否触发暴击。Math.random() 会生成一个 0 到 1 之间的随机数。
  const isCritical = Math.random() < criticalChance;

  // 根据是否暴击，返回最终伤害。
  // 使用三元运算符，如果暴击，则返回基础伤害乘以暴击倍率的结果（向下取整）。
  return isCritical ? Math.floor(baseDamage * criticalMultiplier) : baseDamage;
}
```

#### B. 填写“体检单”

现在，我们来编写一张“体检单”，告诉机器要如何检查`calculateDamage`这个函数。按照约定，测试文件通常与源文件放在一起，并以`.test.ts`结尾。

创建`server/src/damage.test.ts`文件：

typescript

```
// server/src/damage.test.ts
// 这是一张使用 Jest 框架编写的“体检单”。

// 从 './damage' 文件中导入待体检的 calculateDamage 函数。
import { calculateDamage } from "./damage";
// 从 '@jest/globals' 导入 Jest 提供的全局体检工具
import { describe, it, expect, jest } from "@jest/globals";

// 'describe' 用于将一组相关的检查项目打包成一个“体检套餐”。
describe("体检套餐：伤害计算函数", () => {
  // 'it' 定义一个具体的“体检项目”，描述它在检查什么场景。
  it("检查项目1：当攻击力大于防御力，但差值小于1时，伤害应为1", () => {
    // 'expect(实际结果)' 返回一个“期望对象”，你可以对它进行各种断言。
    // '.toBe(期望结果)' 是一个“匹配器”，它会使用 Object.is（类似于 ===）来检查实际结果是否与期望结果完全相等。
    // 我们期望 calculateDamage({ attack: 10, defense: 9.5 }) 的结果是 1。
    expect(calculateDamage({ attack: 10, defense: 9.5 })).toBe(1);
  });

  // 我们的函数里有 Math.random()，这在体检中是不可接受的，因为结果会变来变去。
  // 我们必须控制住这个“随机”因素，让每次检查的结果都完全一致。
  it("检查项目2：当不发生暴击时，应返回基础伤害", () => {
    // 'jest.spyOn' 是一个“作弊”工具，可以暂时控制某个函数的行为。
    // 这里我们“黑”了 Math.random()，让它在本次检查中总是返回 0.5，这样就永远不会暴击了。
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);

    expect(
      calculateDamage({ attack: 100, defense: 20, criticalChance: 0.1 })
    ).toBe(80);

    // 'mockRestore()' 方法会移除我们之前通过 '.mockReturnValue()' 设置的模拟实现，
    // 将 Math.random 恢复到它原始的状态。
    // 这是一个非常好的习惯，可以确保测试之间相互独立，避免一个测试的模拟状态“污染”了另一个测试。
    spy.mockRestore();
  });

  it("检查项目3：当必定发生暴击时，应返回暴击伤害", () => {
    // 同样，我们这次让 Math.random() 返回一个必定触发暴击的值。
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.05);

    expect(
      calculateDamage({
        attack: 100,
        defense: 20,
        criticalChance: 0.1,
        criticalMultiplier: 2,
      })
    ).toBe(160);

    spy.mockRestore();
  });

  it("检查项目4：当输入无效（如负数）时，应返回0", () => {
    expect(calculateDamage({ attack: -10, defense: 20 })).toBe(0);
    expect(calculateDamage({ attack: 100, defense: -20 })).toBe(0);
  });
});
```

> **核心思想**：一个可靠的单元测试必须是**可预测、可重复的**。通过`jest.spyOn`控制`Math.random`的输出，我们移除了代码中的不确定性，让“体检”变得精确可靠，这是编写测试的关键技巧。

### 第三步：运行并解读“体检报告”

打开你的终端，运行我们之前定义好的“总开关”：

bash

```
npm run jest:test
```

如果一切顺利，你将看到“体检中心”出具的、令人安心的报告：

bash

```
PASS  server/src/damage.test.ts
  体检套餐：伤害计算函数
    ✓ 检查项目1：当攻击力大于防御力，但差值小于1时，伤害应为1 (2ms)
    ✓ 检查项目2：当不发生暴击时，应返回基础伤害
    ✓ 检查项目3：当必定发生暴击时，应返回暴击伤害 (1ms)
    ✓ 检查项目4：当输入无效（如负数）时，应返回0

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        1.246 s
```

这份报告中的每一项都告诉你：

- **Test Suites**: 本次体检共执行了 1 个“体检套餐”，全部通过。
- **Tests**: 本次体检共执行了 4 个“体检项目”，全部通过。
- **Time**: 本次体检总耗时。

这个绿色的 "PASS" 标志，就是你代码健康的有力证明。从此以后，每次你修改了代码，只需运行`npm run jest:test`，就能在几秒内知道你的改动是否安全。

## 结论

虽然初次配置会有些繁琐，但为你的核心业务逻辑（算法、数据转换等）建立起一套自动化“体检”机制，是一项回报率极高的投资。它能让你在未来的开发中，充满信心地进行迭代和重构，告别“改一处、坏三处”的噩梦。

现在，你已经掌握了为 ArenaPro 项目引入自动化测试的核心技能。尝试为你项目中最重要的那部分算法写一份“体检单”吧，迈出代码健康的第一步！
