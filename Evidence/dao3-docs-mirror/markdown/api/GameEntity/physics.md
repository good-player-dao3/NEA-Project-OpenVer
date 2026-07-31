---
title: "物理"
source: "https://docs.dao3.fun/api/GameEntity/physics.html"
---

# 物理

## 属性

#### 只读bounds:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(1, 1, 1)

实体边界框的半径，沿着 x/y/z 方向，每帧都会重新计算

#### 只读entityContacts:[GameEntityContact](./index.md#GameEntityContact)[]

> 默认值：[]

返回正在和玩家/实体发生碰撞的全部实体列表。

#### 只读voxelContacts:[GameVoxelContact](./index.md#GameVoxelContact)[]

> 默认值：[]

返回正在和玩家/实体发生碰撞的全部方块列表。

#### 只读fluidContacts:[GameFluidContact](./index.md#GameFluidContact)[]

> 默认值：[]

返回正在被玩家/实体触碰的全部液体方块列表。

#### collides: boolean

> 默认值：true

如果为假(false)，则实体不会碰撞

#### fixed: boolean

> 默认值：false

如果为真(true)，则实体不会移动

#### meshScale:[GameVector3](/api/GameVector3/index.md)

实体的缩放比例。

#### friction: number

> 默认值：0

范围：0-1

控制实体的粘性(0 = 滑，1 = 粘)

#### gravity: boolean

> 默认值：true

如果为假(false)，则实体不会下落

#### mass: number

> 默认值：1

实体物理质量。

#### restitution: number

> 默认值：0

范围：0-1

控制实体的弹性(0 = 软, 1 = 弹)

#### velocity:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

实体的速度。

点击查看示例代码

javascript

```
// 让所有玩家每五秒跳一下
setInterval(() => {
  console.log("jump around!");
  world.querySelectorAll("player").forEach((e) => {
    e.velocity.y += 1;
  });
}, 5000);
```

#### contactForce:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

实体受到的碰撞力。

## 接口

#### GameEntityContact

活跃实体对接触

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| other | [GameEntity](/api/GameEntity/index.md) | 接触的另一个实体 |
| force | [GameVector3](/api/GameVector3/index.md) | 接触力 |
| axis | [GameVector3](/api/GameVector3/index.md) | 接触轴 |

#### GameVoxelContact

活跃方块接触状态

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| x | number | 方块的 X 坐标 |
| y | number | 方块的 Y 坐标 |
| z | number | 方块的 Z 坐标 |
| voxel | number | 方块 ID |
| force | [GameVector3](/api/GameVector3/index.md) | 接触力 |
| axis | [GameVector3](/api/GameVector3/index.md) | 接触轴 |

#### GameFluidContact

活跃流体接触

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| voxel | number | 方块 ID |
| volume | number | 流体体积 |
