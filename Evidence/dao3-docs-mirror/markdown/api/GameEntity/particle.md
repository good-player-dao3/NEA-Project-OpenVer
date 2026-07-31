---
title: "粒子效果"
source: "https://docs.dao3.fun/api/GameEntity/particle.html"
---

# 粒子效果

## 属性

#### particleRate: number

> 默认值：0

实体平均每秒产生粒子的数量。如果希望实体停止释放粒子，可以将该属性改为 0

点击查看示例代码

javascript

```
// 玩家身上每秒产生5个粒子
world.onPlayerJoin(({ entity }) => {
  Object.assign(entity, {
    particleRate: 5,
  });
});
```

---

#### particleRateSpread: number

> 默认值：0

如果设定了该属性的值，实体每一秒产生粒子的数量将不再是个固定值，而是从区间 [particleRate, particleRate + particleRateSpread) 里随机选取的一个整数。

例如，假设 particleRate=0，particleRateSpread=3，每秒产生的粒子数量是[0, 0+3) ，即[0, 3)区间里的一个随机整数，也就是可能为 0，1，或 2

点击查看示例代码

javascript

```
// 玩家身上每秒产生5～14个粒子
world.onPlayerJoin(({ entity }) => {
  Object.assign(entity, {
    particleRate: 5,
    particleRateSpread: 10,
  });
});
```

#### particleLimit: number

> 默认值：100

实体可产生的粒子总数的上限

---

#### particleLifetime: number

> 默认值：10

粒子的存活时间，以秒为单位

点击查看示例代码

javascript

```
// 粒子存活1秒
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 30;
  entity.particleLifetime = 1;
  entity.particleVelocity = new GameVector3(0, 0.5, 0);
});
```

#### particleLifetimeSpread: number

> 默认值：0

如果设定了该属性的值，粒子的存活时间将不再是固定值，而是区间 [particleLifetime, particleLifetime + particleLifetimeSpread) 里的一个随机数，可能为小数

点击查看示例代码

javascript

```
// 粒子存活1～6秒
world.onPlayerJoin(({ entity }) => {
  Object.assign(entity, {
    particleRate: 30,
    particleLifetime: 1,
    particleLifetimeSpread: 5,
    particleVelocity: new GameVector3(0, 0.5, 0),
  });
});
```

#### particleSize: number[]

> 默认值：[1, 1, 1, 1, 1]

该属性的值可以是一个长度为 0 至 5 的数组。每个粒子的存活时间被平均分为五个阶段，对于长度为 5 的数组，数组里的每个值分别指定粒子在各个阶段的大小，其中，第一个值为粒子刚产生是的大小，第五个值为粒子消失时的大小。举几个例子，*假设粒子的存活时间被设定为 5 秒*，如果 particleSize 的值为

- [25, 25, 25, 25, 25]，在粒子存活的 5 秒内大小不会发生变化，产生时是 25，消失时也是 25
- [0, 25, 0, 25, 15]，粒子产生时大小为 0，然后逐渐变为 25，之后又逐渐变为 0，再逐渐变为 25，最后变为 15，可以让该实体所产生的粒子具有逐渐放大缩小的效果
- [15， 25], 粒子产生时大小为 15，1 秒后逐渐变大至 25，之后又逐渐缩小至最小值

点击查看示例代码

javascript

```
// 粒子放大缩小最后膨胀消失
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 30;
  entity.particleSize = [2, 4, 8, 4, 10];
  entity.particleLifetime = 1;
  entity.particleVelocity = new GameVector3(0, 0.5, 0);
});
```

#### particleSizeSpread: number

> 默认值：0

- 如果设定了该属性，但没设定 particleSize 的值，每产生一个粒子，会从区间[0， particleSizeSpread)里选取的一个随机数作为它的大小
- 如果同时设定了 particleSize 和 particleSizeSpread 两个属性，每产生一个粒子，从区间[0， particleSizeSpread)里选取一个随机数 x，这个粒子第 i 个阶段的大小将为 particleSize[i]+x

---

#### particleColor:[GameRGBColor](/api/GameRGBColor/index.md)[]

> 默认值：[ new GameRGBColor(1,1,1), new GameRGBColor(1,1,1), new GameRGBColor(1,1,1), new GameRGBColor(1,1,1), new GameRGBColor(1,1,1) ]

类似 particleSize，该属性的值可以是一个长度为 0 至 5 的数组，数组里的每个值分别指定了粒子在各个阶段的颜色。类似地，可以通过该属性使粒子具有颜色渐变的效果

点击查看示例代码

javascript

```
// 玩家身上着火了
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 30;
  entity.particleSize = [2, 4, 8, 4, 10];
  entity.particleColor = [
    new GameRGBColor(10, 9, 2),
    new GameRGBColor(5, 0.25, 0.1),
    new GameRGBColor(3, 0.05, 0.05),
    new GameRGBColor(0, 0, 0),
    new GameRGBColor(0, 0, 0),
  ];
  entity.particleLifetime = 1;
  entity.particleVelocitySpread = new GameVector3(2, 2, 2);
});
```

#### particleVelocity:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

该实体产生的所有粒子的初始速度，如果将该属性设为 new GameVector3(x, y, z)，x，y，z 三个值分别指定粒子在对应三个方向上的速率

点击查看示例代码

javascript

```
// 从玩家的位置向一个点发射粒子
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 30;
  entity.particleSize = [2, 2, 2, 2, 10];
  entity.particleLifetime = 2;
  entity.particleVelocity = new GameVector3(0, 0, 50);
});
```

#### particleVelocitySpread:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

增加该实体产生的所有粒子初始速度的不确定性，如果将该属性设为 new GameVector3(sx, sy, sz)，每产生一个粒子，会基于这三个值分别产生一个随机值加到 x/y/z 三个方向所对应的速率上。通过设定这个属性，可以使粒子具有向随机方向运动的效果

点击查看示例代码

javascript

```
// 从玩家的位置扇形发射粒子
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 100;
  entity.particleSize = [2, 2, 2, 2, 10];
  entity.particleLifetime = 2;
  entity.particleVelocity = new GameVector3(0, 0, 50);
  entity.particleVelocitySpread = new GameVector3(30, 2, 2);
});
```

#### particleDamping: number

> 默认值：0

- 如果该属性的值为正数，会短暂减少该实体所产生粒子的初始速度，数值越大，减少初始速度的效果持续得越久
- 如果为负值，会短暂增加粒子的初始速度，数值越小，增加初始速度的效果越明显

点击查看示例代码

javascript

```
// 蓄力发射
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 100;
  entity.particleSize = [2, 2, 2, 2, 10];
  entity.particleLifetime = 2;
  entity.particleVelocity = new GameVector3(0, 0, 50);
  entity.particleVelocitySpread = new GameVector3(30, 2, 2);
  entity.particleDamping = 3;
});
```

#### particleAcceleration:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

该实体所产生粒子的加速度

---

#### particleNoise: number

> 默认值：0

指定粒子相对于之前运动方向的最大偏离值，数值越大，各个粒子的运动相对原有方向的偏离越明显

---

#### particleNoiseFrequency: number

> 默认值：1

指定粒子改变运动方向的频率，数值越大，各个粒子的运动方向越没有规律

点击查看示例代码

javascript

```
// 风飘雪
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 30;
  entity.particleSize = [2, 2, 2, 2, 10];
  entity.particleLifetime = 2;
  entity.particleVelocity = new GameVector3(0, 0, 50);
  entity.particleNoise = 20;
  entity.particleNoiseFrequency = 10;
});
```

#### particleTarget:[GameEntity](/api/GameEntity/index.md)| null

> 默认值：null

指定粒子的追踪目标实体。将该属性设为某个实体后，粒子会在运动过程中向该目标靠拢（具体效果取决于`particleTargetWeight`）。将其设为`null`表示关闭目标追踪。

点击查看示例代码

javascript

```
// 将粒子朝向某个实体
world.onPlayerJoin(({ entity }) => {
  entity.particleRate = 50;
  entity.particleLifetime = 2;
  entity.particleVelocity = new GameVector3(0, 0, 20);
  entity.particleTarget = targetEntity; // 设为 null 则不追踪
  entity.particleTargetWeight = 5; // 吸引强度，数值越大越明显
});
```

#### particleTargetWeight: number

> 默认值：0

控制粒子朝向`particleTarget`的吸引强度。数值越大，粒子越倾向于向目标运动；当为 0 时，无吸引效果。
