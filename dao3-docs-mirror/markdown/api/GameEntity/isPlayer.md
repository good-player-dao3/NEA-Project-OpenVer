---
title: "是否为玩家"
source: "https://docs.dao3.fun/api/GameEntity/isPlayer.html"
---

# 是否为玩家

- **GamePlayerEntity**是包含玩家属性的实体，可以同时访问[**GameEntity**](/api/GameEntity/index.md)和[**GamePlayerEntity**](/api/GamePlayerEntity/index.md)。

## 类型

typescript

```
declare type GamePlayerEntity = GameEntity & {
  player: GamePlayerEntity;
  isPlayer: true;
};
```

## 属性

#### 只读isPlayer: boolean

如果为真，则实体为玩家。

#### player:[GamePlayerEntity](/api/GamePlayerEntity/index.md)| undefined

如果是玩家，可以访问此属性。索引与玩家相关的全部状态和方法
