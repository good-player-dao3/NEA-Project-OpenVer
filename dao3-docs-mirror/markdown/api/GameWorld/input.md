---
title: "点击与互动"
source: "https://docs.dao3.fun/api/GameWorld/input.html"
---

# 点击与互动

## 方法

#### 事件onInteract(handler:(event:[GameInteractEvent](./input.md#GameInteractEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

若实体开启了互动功能`enableInteract = true`，则玩家与实体进行互动时触发。

当玩家走进实体的互动范围，实体身上就会出现按键提示，玩家按下互动按钮(默认为键盘 E 按键)与该实体进行互动。fight

触发 onInteract 事件同时还会触发实体默认的互动音效

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到互动时的处理函数 |

点击查看示例代码

javascript

```
/* 在场景中搜索名称为 NPC 的模型，允许和它进行互动 */
const npc = world.querySelector("#NPC");
npc.enableInteract = true; // 开启实体互动功能
npc.interactHint = "NPC"; // 进入互动范围时提示的文字
npc.interactRadius = 32; // 互动范围大小

// 场景中所有可以互动的实体，互动时都会触发此事件
world.onInteract(({ entity, targetEntity }) => {
  targetEntity.say("你好! " + entity.player.name);
});
```

#### 事件onClick(handler:(event:[GameClickEvent](./input.md#GameClickEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当玩家用鼠标点击实体时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到鼠标点击时的处理函数 |

点击查看示例代码

javascript

```
// 被点击到的实体y方向速度增加
world.onClick(({ entity }) => {
  console.log("clicked");
  entity.velocity.y += 1;
});
```

#### 事件onPress(handler:(event:[GameInputEvent](./input.md#GameInputEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当玩家按下按钮时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到鼠标按下时的处理函数 |

点击查看示例代码

javascript

```
/* 按下左键时，在控制台输入记录 */
world.onPress(({ button, entity }) => {
  if (button === "action0") {
    console.log(` ${entity.player.name} 按下了左键`);
  }
});
```

---

javascript

```
/* 按下左键时，弹出一个简单对话框 */
world.onPress(({ button, entity }) => {
  if (button != "action0" || !entity.isPlayer || entity.player.dead) return;
  entity.player.dialog({
    type: "text",
    content: `你好，${entity.player.name}，很高兴认识你。`,
  });
});
```

---

javascript

```
/* 点击左键，将鼠标指针位置的方块替换为石头。点击右键，销毁方块。 */
world.onPress(({ button, raycast }) => {
  const pos = raycast.voxelIndex; // 射线击中的方块网格坐标
  if (button === "action0") {
    // 鼠标左键
    voxels.setVoxel(pos.x, pos.y, pos.z, "stone"); // 将方块替换为石头
  } else if (button === "action1") {
    // 鼠标右键
    voxels.setVoxel(pos.x, pos.y, pos.z, "air"); // 将方块替换为空气
  }
});
```

#### 事件onRelease(handler:(event:[GameInputEvent](./input.md#GameInputEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当玩家松开按钮时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到鼠标松开时的处理函数 |

信息

**💡 提示**

提示：GameWorld 和 GamePlayerEntity 都有触发点击/按下按钮的事件。他们的区别就是：

- **GameWorld**会监听世界所有实体的事件
- **GamePlayerEntity**只监听玩家本身的事件

点击查看示例代码

javascript

```
world.onRelease(({ button, position }) => {
  console.log(`press: {button} {position}`);
});
```

#### 事件onEntityContact(handler:(event:[GameEntityContactEvent](./input.md#GameEntityContactEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体与实体发生碰撞时触发。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 碰撞时的处理函数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameEntityContactEvent | 碰撞结果 |

点击查看示例代码

javascript

```
/* 两个实体进行碰撞时，广播一条消息 */
world.onEntityContact(({ entity, other }) => {
  const entityA = entity.isPlayer ? entity.player.name : entity.id;
  const entityB = other.isPlayer ? other.player.name : other.id;
  world.say(`{entityA}和{entityB}发生了激烈的碰撞`);
});
```

---

javascript

```
/* 玩家碰到包含 'healpoint' 标签的实体，回复全部HP */
world.onEntityContact(({ entity, other }) => {
  if (!entity.isPlayer || !other.hasTag("healpoint")) return;
  if (entity.hp < entity.maxHp) {
    // 恢复全部HP
    entity.hp = entity.maxHp;
    entity.player.directMessage("你回复了全部的HP");
  }
});
```

---

javascript

```
/* 玩家碰到实体时，将自身变成实体的造型 */
world.onEntityContact(({ entity, other }) => {
  if (entity.isPlayer && !other.isPlayer) {
    fakeObject(entity, other);
  }
});

function fakeObject(player, object) {
  player.mesh = object.mesh;
  player.meshOrientation = object.meshOrientation;
  player.meshScale = object.meshScale;
  player.player.showName = false;
}
```

#### 事件onEntitySeparate(handler:(event:[GameEntityContactEvent](./input.md#GameEntityContactEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体与实体结束碰撞时触发。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 碰撞后时的处理函数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameEntityContactEvent | 碰撞结果 |

点击查看示例代码

javascript

```
// 实体开始碰撞
world.onEntityContact(({ entity, other }) => {
  console.log("开始碰撞");
});

// 实体停止碰撞
world.onEntitySeparate(({ entity, other }) => {
  console.log("停止碰撞");
});
```

---

javascript

```
/* 玩家碰到实体时，将自身变成实体的造型 */
world.onEntityContact(({ entity, other }) => {
  if (entity.isPlayer && !other.isPlayer) {
    fakeObject(entity, other);
  }
});

function fakeObject(player, object) {
  player.mesh = object.mesh;
  player.meshOrientation = object.meshOrientation;
  player.meshScale = object.meshScale;
  player.player.showName = false;
}
```

---

javascript

```
/* 玩家碰到包含 'healpoint' 标签的实体，回复全部HP */
world.onEntityContact(({ entity, other }) => {
  if (!entity.isPlayer || !other.hasTag("healpoint")) return;
  if (entity.hp < entity.maxHp) {
    // 恢复全部HP
    entity.hp = entity.maxHp;
    entity.player.directMessage("你回复了全部的HP");
  }
});
```

#### 事件onVoxelContact(handler:(event:[GameVoxelContactEvent](./input.md#GameVoxelContactEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体与方块发生碰撞时触发。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 碰撞后时的处理函数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameVoxelContactEvent | 碰撞结果 |

点击查看示例代码

javascript

```
/* 如果实体碰到冰块，冰块会被打破 */
world.onVoxelContact(({ x, y, z, voxel }) => {
  const voxelName = voxels.name(voxel); // 将方块id转换名称
  if (voxelName === "ice") {
    // 如果方块名称是冰块
    voxels.setVoxel(x, y, z, 0); // 将方块变成空气
  }
});
```

---

javascript

```
// 检测玩家脚下的方块是否为石头
world.onVoxelContact(({ entity, voxel, axis }) => {
  if (!entity.isPlayer) return; // 如果碰到方块的不是玩家，则跳过
  const voxelName = voxels.name(voxel); // 将方块id转换名称
  if (voxelName === "stone" && axis.y === 1) {
    // 如果方块名称是石头，并且在玩家下方
    console.log(`{entity.player.name} 脚下踩着 {voxelName} 方块`);
  }
});
```

---

javascript

```
/* 玩家碰到包含 'healpoint' 标签的实体，回复全部HP */
world.onEntityContact(({ entity, other }) => {
  if (!entity.isPlayer || !other.hasTag("healpoint")) return;
  if (entity.hp < entity.maxHp) {
    // 恢复全部HP
    entity.hp = entity.maxHp;
    entity.player.directMessage("你回复了全部的HP");
  }
});
```

#### 事件onVoxelSeparate(handler:(event:[GameVoxelContactEvent](./input.md#GameVoxelContactEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体与方块结束碰撞时触发。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 碰撞后时的处理函数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameVoxelContactEvent | 碰撞结果 |

点击查看示例代码

javascript

```
// 实体接触到方块
world.onVoxelContact(({ entity, voxel }) => {
  console.log("碰撞到方块");
});

// 实体停止接触方块
world.onVoxelSeparate(({ entity, voxel }) => {
  console.log("停止碰撞");
});
```

#### 事件onFluidEnter(handler:(event:[GameFluidContactEvent](./input.md#GameFluidContactEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体进入水里/液体时触发。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 进入后时的处理函数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameFluidContactEvent | 碰撞结果 |

点击查看示例代码

javascript

```
// 有玩家接触到液体时，在控制台提示玩家的名字
world.onFluidEnter(({ entity, voxel }) => {
  if (!entity.isPlayer) return;
  const voxelName = voxels.name(voxel);
  console.log(`{entity.player.name} 进入了 {voxelName}`);
});
```

#### 事件onFluidLeave(handler:(event:[GameFluidContactEvent](./input.md#GameFluidContactEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体离开水里/液体时触发。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 离开后时的处理函数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameFluidContactEvent | 碰撞结果 |

点击查看示例代码

javascript

```
// 实体接触到液体时
world.onFluidEnter(({ entity, voxel }) => {
  console.log("接触到液体");
});

// 实体离开液体时
world.onFluidLeave(({ entity, voxel }) => {
  console.log("停止接触液体");
});
```

## 接口

#### GameInteractEvent

当实体互动时触发的事件

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | GamePlayerEntity | 发起互动的实体 |
| targetEntity | GameEntity | 收到互动请求的实体 |
| tick | number | 事件发生时间 |

#### GameInputEvent

输入事件，在玩家按下或松开按钮时触发

事件发生的时刻，即为玩家按下/松开按钮的同一刻

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GamePlayerEntity](/api/GameEntity/isPlayer.md) | 被点击的实体 / 按下按钮的玩家 |
| button | [GameButtonType](./input.md#gamebuttontype) | 点击的按钮，ACTION0 = 左键，ACTION1 = 右键 |
| raycast | [GameRaycastResult](./querySelectorEntity.md#gameraycastresult) | 按下按钮瞬间，从玩家视角投射的射线检测结果 |
| tick | number | 事件发生时间 |
| position | number | 按下按钮瞬间，玩家的位置 |
| pressed | boolean | 是否按下了按钮。若为 true，则为按下了按钮。 |

#### GameClickEvent

游戏点击事件

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GameEntity](/api/GameEntity/index.md) | 被点击的实体 |
| clicker | [GamePlayerEntity](/api/GameEntity/isPlayer.md) | 发起点击事件的实体 |
| tick | number | 事件发生时间 |
| button | ACTION0 = 左键，ACTION1 = 右键 | 按下的按钮 |
| distance | number | 玩家到被点击实体的距离 |
| clickerPosition | [GameVector3](/api/GameVector3/index.md) | 点击鼠标的瞬间玩家所在位置 |
| raycast | [GameRaycastResult](./querySelectorEntity.md#gameraycastresult) | 按下按钮瞬间，从玩家视角投射的射线检测结果 |

#### GameEntityContactEvent

当两个实体碰撞时触发的事件。

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| axis | [GameVector3](/api/GameVector3/index.md) | 碰撞的分离轴，也就是碰撞后物体弹飞的方向 |
| entity | [GameEntity](/api/GameEntity/index.md) | 碰撞中的第一个实体 |
| force | [GameVector3](/api/GameVector3/index.md) | 碰撞所产生的力 |
| other | [GameEntity](/api/GameEntity/index.md) | 碰撞中的第二个实体 |
| tick | number | 两个实体碰撞的时间 |

#### GameVoxelContactEvent

当实体触碰方块时触发的事件。

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| axis | [GameVector3](/api/GameVector3/index.md) | 碰撞后物体弹飞的方向 |
| entity | [GameEntity](/api/GameEntity/index.md) | 触碰方块的实体 |
| force | [GameVector3](/api/GameVector3/index.md) | 碰撞所产生的力 |
| voxel | number | 被触碰的方块 id |
| tick | number | 事件发生时间 |
| x | number | 被触碰方块的 x 坐标 |
| y | number | 被触碰方块的 y 坐标 |
| z | number | 被触碰方块的 z 坐标 |

#### GameFluidContactEvent

当实体进入或离开液体时触发的事件。

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GameEntity](/api/GameEntity/index.md) | 触碰液体的实体 |
| voxel | number | 触碰的液体方块 |
| tick | number | 事件发生时间 |

## 枚举

#### GameButtonType

玩家按下的按钮类型

| **属性** | **说明** |
| --- | --- |
| WALK | 步行按钮 |
| RUN | 奔跑按钮 |
| CROUCH | 下蹲按钮 |
| JUMP | 跳跃按钮 |
| DOUBLE_JUMP | 二段跳按钮 |
| FLY | 飞行按钮 |
| ACTION0 | 鼠标左键 / 虚拟按钮 A |
| ACTION1 | 鼠标右键 / 虚拟按钮 B |
