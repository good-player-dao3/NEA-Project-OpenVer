---
title: "事件回调函数与异步处理机制"
source: "https://docs.dao3.fun/api/notice/eventDiff.html"
---

# 事件回调函数与异步处理机制

事件处理在 BOX3 中主要有两种形式：回调函数（onXXX）和异步处理（nextXXXX）。这两种方式各有特点，适用于不同的场景。

## 回调函数形式 (onXXXX)

回调函数形式通过监听器持续监听事件，每次事件发生时都会执行。

### 特点

- 持续监听：可以处理多次事件
- 即时响应：事件发生时立即执行
- 适合：需要持续响应事件的场景

### 示例代码

javascript

```
// 示例1：基础用法 - 玩家进入地图时发送欢迎消息
world.onPlayerJoin(({ entity }) => {
  entity.player.directMessage(`欢迎来到游戏，${entity.player.name}！`);
});

// 示例2：条件判断 - 只对特定玩家发送消息
const VIP_PLAYERS = ["玩家A", "玩家B", "玩家C"];
world.onPlayerJoin(({ entity }) => {
  if (VIP_PLAYERS.includes(entity.player.name)) {
    world.say(`尊贵的VIP玩家 ${entity.player.name} 进入了游戏！`);
  }
});

// 示例3：组合多个事件 - 玩家聊天和移动监听
world.onChat(({ entity, message }) => {
  console.log(`${entity.player.name} 说: ${message}`);
});

world.onPlayerInput(({ entity, input }) => {
  if (input.jump) {
    console.log(`${entity.player.name} 跳跃了！`);
  }
});
```

## 异步形式 (nextXXX)

异步形式使用 await 等待单次事件发生，执行完成后结束。

### 特点

- 单次执行：只处理一次事件
- 异步等待：可以配合 async/await 使用
- 适合：需要等待特定事件发生后继续执行的场景

### 示例代码

javascript

```
// 示例1：等待玩家加入并执行欢迎流程
async function welcomeNextPlayer() {
  const { entity } = await world.nextPlayerJoin();
  entity.player.directMessage("欢迎来到游戏！");
  await world.nextTick();
  entity.player.directMessage('请输入"help"获取帮助。');
}

// 示例2：等待玩家输入特定指令
async function waitForCommand() {
  while (true) {
    const { entity, message } = await world.nextChat();
    if (message === "start") {
      entity.player.directMessage("游戏开始！");
      startGame(entity);
      break;
    }
  }
}

// 示例3：连续等待多个事件
async function tutorial() {
  const { entity } = await world.nextPlayerJoin();
  entity.player.directMessage("按空格键跳跃");

  await world.nextPlayerInput({ entity, input: { jump: true } });
  entity.player.directMessage("做得好！现在按W键前进");

  await world.nextPlayerInput({ entity, input: { forward: true } });
  entity.player.directMessage("教程完成！");
}
```

## 两种方式的对比

### 回调函数 (onXXXX)

- 持续监听所有事件
- 适合需要重复处理的场景
- 可以添加复杂的条件判断
- 不会阻塞后续代码执行
- 适用于：全局事件监听、游戏状态管理

### 异步函数 (nextXXX)

- 只处理下一次事件
- 代码结构更线性直观
- 易于实现顺序控制流程
- 等待期间会暂停函数执行
- 适用于：新手教程、关卡流程、临时事件处理

## 使用建议

- 当需要持续监听事件时，使用回调函数形式
- 当需要等待特定事件后继续执行时，使用异步形式
- 在复杂的业务逻辑中，可以组合使用两种方式
- 选择合适的方式取决于具体的业务场景需求
