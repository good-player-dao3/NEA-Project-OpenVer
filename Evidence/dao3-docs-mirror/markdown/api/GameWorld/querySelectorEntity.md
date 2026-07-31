---
title: "搜索实体"
source: "https://docs.dao3.fun/api/GameWorld/querySelectorEntity.html"
---

# 搜索实体

## 方法

#### querySelector(selector:[GameSelectorString](./querySelectorEntity.md#GameSelectorString)):[GameEntity](/api/GameEntity/index.md)| null

搜索满足条件的第一个实体。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| selector | *是* |  | GameSelectorString | 选择器的搜索方式 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameEntity \| null | 如有，返回搜索到的实体对象，反之为空 |

点击查看示例代码

javascript

```
const thePoint = world.querySelector('#出生点-1'); // 搜索模型名字为"出生点-1"的首个实体
```

---

javascript

```
const thePoint = world.querySelector('#出生点-1');

// 将玩家出生点设置在模型的位置
world.onPlayerJoin(({ entity }) => {  
  entity.player.spawnPoint.copy(thePoint.position)
});
```

---

#### querySelectorAll(selector:[GameSelectorString](./querySelectorEntity.md#GameSelectorString)):[GameEntity](/api/GameEntity/index.md)[]

搜索满足条件的所有实体，返回一个列表。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| selector | *是* |  | GameSelectorString | 选择器的搜索方式 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameEntity | 如有，返回搜索到的实体对象列表，反之为空列表 |

信息

**💡提示**

**querySelector**和**querySelectorAll**两者区别是

**querySelector**搜索满足条件的第一个实体，如果没有搜索到，则返回 null

**querySelectorAll**搜索满足条件的所有实体，返回是一个数组，如果没有搜索到实体，则返回空的数组。

点击查看示例代码

javascript

```
// 按下左键，在控制台输出当前所有玩家的生命状态
world.onRelease(({ button }) => {
  if (button === 'action0'){
    world.querySelectorAll('player').forEach((user)=>{
      console.log(`{user.player.name} : {user.hp}`)
    })
    console.log('---------------------------')
  }
})
```

---

#### searchBox(bounds:[GameBounds3](/api/GameBounds3/index.md)):[GameEntity](/api/GameEntity/index.md)[]

搜索指定范围中的全部实体

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| bounds | *是* |  | GameBounds3 | 要搜索的范围边界 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameEntity[] | 范围内的全部实体 |

点击查看示例代码

javascript

```
// 搜索范围 { x: 48-72, y:8-20, z: 48-72 }
const bounds = new GameBounds3(new GameVector3(48, 8, 48), new GameVector3(72, 20, 72));

// 使用 forEach 遍历实体列表，输出玩家的名称。
world.searchBox(bounds).forEach( (entityInBounds) => {
  // 在区域的玩家
  if (entityInBounds.isPlayer) {
    console.log(`在区域内的玩家：${entityInBounds.player.name}`)
  }
});
```

---

#### raycast(origin:[GameVector3](/api/GameVector3/index.md),direction:[GameVector3](/api/GameVector3/index.md),options?:Partial<[GameRaycastOptions](./querySelectorEntity.md#GameRaycastOptions)>):[GameRaycastResult](./querySelectorEntity.md#GameRaycastResult)

射线检测，从 origin原点位置向 direction 方向投射一条隐形的射线，返回碰到的实体或方块。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| origin | *是* |  | GameVector3 | 射线的起点 |
| direction | *是* |  | GameVector3 | 射线的方向 |
| options |  |  | Partial‹GameRaycastOptions› | 选项配置参数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameRaycastResult | 发射射线后的结果 |

点击查看示例代码

javascript

```
/* 按下左键，在玩家位置向脚下发射一条射线，在控制台输出检测结果 */
world.onPress(({ button, entity }) => {
  if(button === 'action0'){
    const res = world.raycast( entity.position, new GameVector3(0,-1,0))
    console.log(JSON.stringify(res))
  }
})
```

## 接口

#### GameSelectorString

选择器(Selectors)可以方便搜索游戏内的全部对象。选择器接口是参照 DOM APIs 而设。

搜索方式类似[jQuery选择器](https://www.runoob.com/jquery/jquery-ref-selectors.html)的语法，例如：

| **标识前缀** | **类型** | **说明** |
| --- | --- | --- |
| * | string | 搜索世界中的全部实体 |
| # | string | 搜索该模型名称的实体 |
| . | string | 搜索该模型标签实体 |
| player | string | 搜索游戏中的全部玩家 |

javascript

```
const entities = world.querySelector('*'); // 世界中的全部实体
const theChair = world.querySelector('#chair'); // 模型名称为"chair"的首个实体
const players = world.querySelectorAll('player'); // 游戏中的全部玩家
const boxes = world.querySelectorAll('.box'); // 标签带有"box"的全部实体
const redBox = world.querySelector('.box .red');// 标签同时带有"box"和“red”的首个实体
```

---

#### GameRaycastOptions

进行射线检测的参数配置

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| maxDistance | number | 允许射线穿越的最大距离 |
| ignoreFluid | boolean | 如果为真，则射线无视液体 |
| ignoreVoxel | boolean | 如果为真，则射线无视方块 |
| ignoreEntities | boolean | 如果为真，则射线无视实体 |
| ignoreSelector | GameSelectorString | 被射线检测忽略的实体选择器 |

---

#### GameRaycastResult

射线检测(raycast)的结果，包含射线和所击中目标的信息。

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| origin | [GameVector3](/api/GameVector3/index.md) | 射线的起点 |
| direction | [GameVector3](/api/GameVector3/index.md) | 射线的方向 |
| distance | number | 射线穿越的距离 |
| hit | boolean | 如果为真，则射线击中了目标 |
| hitEntity | [GameEntity](/api/GameEntity/index.md)\| null | 射线所击中的实体 |
| hitPosition | [GameVector3](/api/GameVector3/index.md) | 射线击中的位置 |
| hitVoxel | number | 射线所击中的方块 id (如未击中方块，则为 0) |
| voxelIndex | [GameVector3](/api/GameVector3/index.md) | 如果射线击中的是方块，则返回所击中方块的网格坐标。 |
| normal | [GameVector3](/api/GameVector3/index.md) | 射线所击中平面的法向量 |
