---
title: "实体的创建/销毁"
source: "https://docs.dao3.fun/api/GameWorld/entityCD.html"
---

# 实体的创建/销毁

## 方法

#### createEntity(config:Partial<[GameEntityConfig](./entityCD.md#GameEntityConfig)>): GameEntity | null

创建一个新实体 GameEntity 或复制一个现有的实体，若实体数量(entityQuota)达到上限，则返回 null

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| config | *是* |  | `Partial<GameEntityConfig>` | 指定实体的一组初始配置 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameEntity \| null | 根据指定参数创建的一个新实体对象，如达到上限将无法创建 |

警告

需要提前在编辑器中添加'花'的模型。

添加后可以在地图中删除 (只需确保 设置-文件 页面中已加载 花.vb 模型文件)。

点击查看示例代码

javascript

```
/* 在地图中央随机位置创建50朵花。*/
for(let i=0;i<50;i++){
  world.createEntity({
    mesh:'mesh/花.vb',
    position:new GameVector3(64+ 10*Math.random(), 9, 64 + 10*Math.random()),
    meshScale:new GameVector3(0.1, 0.1, 0.1),
    collides:false,
    fixed:true,
    gravity:false,
  })
}
```

---

#### entityQuota(): number

返回脚本当前仍可创建的实体数量

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 当前仍可创建的实体数量 |

点击查看示例代码

javascript

```
// 在控制台输出目前还可以创建的实体数量
console.log(`还可以创建 ${world.entityQuota()} 个实体`)
```

---

#### 事件onEntityCreate(handler:(event:[GameEntityEvent](./entityCD.md#GameEntityEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体被创建时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 监听到有实体创建时的处理函数 |

点击查看示例代码

javascript

```
// 非玩家的实体被创建时，广播一条消息
world.onEntityCreate(({ entity }) => {
  if (entity.isPlayer) { return }  // 如果实体是玩家类型则跳过
  entity.say(`我是 {entity.id}，我在这个位置：{JSON.stringify(entity.position)}`)
})
```

---

#### 事件onEntityDestroy(handler:(event:[GameEntityEvent](./entityCD.md#GameEntityEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当实体被销毁时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | *是* |  | function | 监听到有实体销毁时的处理函数 |

点击查看示例代码

javascript

```
// 拥有 'box' 标签的实体被销毁时，广播一条消息
world.onEntityDestroy(({ entity }) => {
  if (entity.isPlayer || !entity.hasTag('box')) return;   // 如果实体是玩家类型，并且不包含'box'标签则跳过
  world.say(`${entity.id} 已被销毁。`)
})
```

## 接口

#### GameEntityEvent

实体创建与销毁事件

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GameEntity](/api/GameEntity/index.md) | 销毁的实体 |
| tick | number | 事件发生时间 |

---

#### GameEntityConfig

用于控制实体的参数组

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| position | [GameVector3](/api/GameVector3/index.md) | 实体的位置 |
| velocity | [GameVector3](/api/GameVector3/index.md) | 实体朝向某个方向运动的作用力 |
| collides | boolean | 实体是否可碰撞 |
| mesh | string | mesh决定了实体的外形。'mesh/*.vb' |
| meshColor | [GameRGBAColor](/api/GameRGBAColor/index.md) | 实体的颜色 |
| meshScale | [GameVector3](/api/GameVector3/index.md) | 实体的缩放比例 |
| meshOrientation | [GameQuaternion](/api/GameQuaternion/index.md) | 实体的旋转角度 |
| meshMetalness | number | 实体的金属感 |
| meshEmissive | number | 实体的发光度 |
| meshShininess | number | 实体的反光度 |
| anchorOffset | [GameVector3](/api/GameVector3/index.md) | 实体几何中心与锚点的偏移量 |
| gravity | boolean | 实体是否会下落 |
| fixed | boolean | 实体的位置是否固定不动 |
| mass | number | 实体质量 |
| friction | number | 实体的粘性(0 = 滑，1 = 粘) |
| restitution | number | 实体的弹性(0 = 软, 1 = 弹) |
| enableInteract | boolean | 允许实体进行互动 |
| interactRadius | number | 进入实体互动的范围。范围越小，需更靠近。 |
| interactHint | string | 进入实体互动范围时，实体身上出现的提示文本 |
| interactColor | [GameRGBAColor](/api/GameRGBAColor/index.md) | 进入实体互动范围时，提示文本的字体颜色 |
| particleRate | number | 实体每秒产生粒子的数量 |
| particleRateSpread | number | 增加实体每秒产生粒子数量的随机性 |
| particleLimit | number | 实体可产生粒子总数的上限 |
| particleLifetime | number | 实体所产生粒子能存活的秒数 |
| particleLifetimeSpread | number | 增加实体所产生粒子存活时间的随机性 |
| particleSize | number[] | 实体所产生粒子的大小变化 |
| particleSizeSpread | number | 增加实体所产生粒子大小的随机性 |
| particleColor | [GameRGBColor](/api/GameRGBColor/index.md)[] | 实体所产生粒子的颜色变化 |
| particleVelocity | [GameVector3](/api/GameVector3/index.md) | 实体所产生粒子的初始速度 |
| particleVelocitySpread | [GameVector3](/api/GameVector3/index.md) | 增加实体所产生粒子初始速度的随机性 |
| particleDamping | number | 实体所产生粒子的阻尼系数 |
| particleAcceleration | [GameVector3](/api/GameVector3/index.md) | 实体所产生粒子的加速度 |
| particleNoise | number | 实体所产生粒子摆动的最大幅度 |
| particleNoiseFrequency | number | 实体所产生粒子摆动的频率 |
| chatSound | [GameSoundEffect](/api/GameWorld/music.md#GameSoundEffect) | 实体触发说话事件时播放的音效 |
| interactSound | [GameSoundEffect](/api/GameWorld/music.md#GameSoundEffect) | 实体触发互动事件时播放的音效 |
| hurtSound | [GameSoundEffect](/api/GameWorld/music.md#GameSoundEffect) | 实体触发受伤事件时播放的音效 |
| dieSound | [GameSoundEffect](/api/GameWorld/music.md#GameSoundEffect) | 实体触发死亡事件时播放的音效 |
