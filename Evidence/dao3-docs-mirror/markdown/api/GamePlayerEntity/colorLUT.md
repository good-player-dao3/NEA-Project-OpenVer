---
title: "画面滤镜"
source: "https://docs.dao3.fun/api/GamePlayerEntity/colorLUT.html"
---

# 画面滤镜

## 属性

#### colorLUT: string

> 默认值：''

用于渲染玩家所见游戏世界的色调

javascript

```
world.onPlayerJoin(({ entity:{ player } }) => {
  // 玩家进入游戏的时候随机更改游戏世界的色调
  const luts = resources.ls('lut');
  const randLut = luts[(luts.length * Math.random()) | 0].path;
  player.directMessage('lut = ' + randLut)
  player.colorLUT = randLut;
});
```
