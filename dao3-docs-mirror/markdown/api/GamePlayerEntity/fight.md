---
title: "战斗与生命值"
source: "https://docs.dao3.fun/api/GamePlayerEntity/fight.html"
---

# 战斗与生命值

## 属性

#### 只读dead: boolean

> 默认值：false

玩家是否已死亡，生命值hp低于0。若玩家死亡，则会倒在地上。

---

#### spawnPoint:[GameVector3](/api/GameVector3/index.md)

> 默认值：new GameVector3(64, 140, 64)

玩家复活后的出生点

## 方法

#### forceRespawn(): void

让玩家强制重生，立即返回出生点

---

#### 事件onRespawn(handler:(event:[GameRespawnEvent](/api/GameWorld/fight.md#GameRespawnEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

玩家复活时调用的事件

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听玩家复活后的处理函数 |
