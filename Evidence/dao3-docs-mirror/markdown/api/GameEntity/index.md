---
title: "S-🏠 游戏实体"
source: "https://docs.dao3.fun/api/GameEntity/index.html"
---

# S-🏠 游戏实体

**GameEntity**是游戏世界中的基础对象，提供了以下核心功能：

- 外观控制：管理实体的形状、位置、旋转、颜色等视觉属性
- 物理系统：控制实体的碰撞、重力、质量等物理特性
- 粒子效果：创建和管理实体的粒子系统
- 交互系统：处理实体与玩家的互动、点击等操作
- 战斗系统：管理实体的生命值、伤害、死亡等状态

## 类定义

typescript

```
declare class GameEntity {
  //...
}
```

## 属性列表

### 基础信息

- [`isPlayer`](./isPlayer.md#isPlayer): 实体是否为玩家
- [`player`](./isPlayer.md#player): 索引与玩家相关的全部状态和方法
- [`id`](./label.md#id): 已在编辑器中添加的实体名称

### 外观系统

- [`mesh`](./appearance.md#mesh): 实体形状数据(mesh)的 hash
- [`position`](./appearance.md#position): 实体的位置
- [`meshOrientation`](./appearance.md#meshOrientation): 实体的旋转角度
- [`meshScale`](./appearance.md#meshScale): 实体的缩放比例
- [`meshColor`](./appearance.md#meshColor): 实体的颜色
- [`meshInvisible`](./appearance.md#meshInvisible): 控制实体隐形
- [`meshEmissive`](./appearance.md#meshEmissive): 实体的发光度
- [`meshMetalness`](./appearance.md#meshMetalness): 实体的金属感
- [`meshShininess`](./appearance.md#meshShininess): 实体的反光度
- [`meshOffset`](./appearance.md#meshOffset): 实体的位移

#### 名称显示

- [`showEntityName`](./appearance.md#showEntityName): 是否展示实体的默认名称
- [`customName`](./appearance.md#customName): 自定义需要展示的名称
- [`nameRadius`](./appearance.md#nameRadius): 名称展示范围，数值越小，则需要靠近实体才会出现名称
- [`nameColor`](./appearance.md#nameColor): 进入实体名称展示范围时，实体名称的颜色

### 物理系统

- [`bounds`](./physics.md#bounds): 实体边界框的半径
- [`collides`](./physics.md#collides): 实体是否碰撞
- [`fixed`](./physics.md#fixed): 实体是否移动
- [`friction`](./physics.md#friction): 控制实体的粘性(0 = 滑，1 = 粘)
- [`gravity`](./physics.md#gravity): 实体是否下落
- [`mass`](./physics.md#mass): 实体物理质量
- [`restitution`](./physics.md#restitution): 控制实体的弹性(0 = 软, 1 = 弹)
- [`velocity`](./physics.md#velocity): 实体的速度
- [`contactForce`](./physics.md#contactForce): 实体受到的碰撞力
- [`entityContacts`](./physics.md#entityContacts): 返回正在和玩家/实体发生碰撞的全部实体列表
- [`voxelContacts`](./physics.md#voxelContacts): 返回正在和玩家/实体发生碰撞的全部方块列表
- [`fluidContacts`](./physics.md#fluidContacts): 返回正在被玩家/实体触碰的全部液体方块列表

### 音效系统

- [`chatSound`](./music.md#chatSound): 当实体说话时，播放聊天音效。通过`say()`触发
- [`hurtSound`](./music.md#hurtSound): 当实体触发受伤事件时，播放受伤音效。通过`onTakeDamage()`触发
- [`dieSound`](./music.md#dieSound): 当实体触发死亡事件时，播放死亡音效。通过`onDie()`触发
- [`interactSound`](./music.md#interactSound): 当实体进行互动时，播放互动音效。此音效仅互动的玩家可听见。通过`onInteract()`触发

### 粒子系统

- [`particleRate`](./particle.md#particleRate): 实体平均每秒产生粒子的数量
- [`particleRateSpread`](./particle.md#particleRateSpread): 如果设定了该属性的值，实体每一秒产生粒子的数量将不再是个固定值
- [`particleLimit`](./particle.md#particleLimit): 实体可产生的粒子总数的上限
- [`particleLifetime`](./particle.md#particleLifetime): 粒子的存活时间，以秒为单位
- [`particleLifetimeSpread`](./particle.md#particleLifetimeSpread): 如果设定了该属性的值，粒子的存活时间将不再是固定值
- [`particleSize`](./particle.md#particleSize): 该属性的值可以是一个长度为 0 至 5 的数组。每个粒子的存活时间被平均分为五个阶段
- [`particleSizeSpread`](./particle.md#particleSizeSpread): 如果设定了该属性，但没设定 particleSize 的值，每产生一个粒子，会从区间[0， particleSizeSpread)里选取的一个随机数作为它的大小
- [`particleColor`](./particle.md#particleColor): 类似 particleSize，该属性的值可以是一个长度为 0 至 5 的数组，数组里的每个值分别指定了粒子在各个阶段的颜色
- [`particleVelocity`](./particle.md#particleVelocity): 该实体产生的所有粒子的初始速度
- [`particleVelocitySpread`](./particle.md#particleVelocitySpread): 增加该实体产生的所有粒子初始速度的不确定性
- [`particleDamping`](./particle.md#particleDamping): 如果该属性的值为正数，会短暂减少该实体所产生粒子的初始速度，数值越大，减少初始速度的效果持续得越久
- [`particleAcceleration`](./particle.md#particleAcceleration): 该实体所产生粒子的加速度
- [`particleNoise`](./particle.md#particleNoise): 指定粒子相对于之前运动方向的最大偏离值，数值越大，各个粒子的运动相对原有方向的偏离越明显
- [`particleNoiseFrequency`](./particle.md#particleNoiseFrequency): 指定粒子改变运动方向的频率，数值越大，各个粒子的运动方向越没有规律

### 交互系统

- [`enableInteract`](./input.md#enableInteract): 是否允许实体进行互动
- [`interactRadius`](./input.md#interactRadius): 实体互动范围。数值越小，则需要靠近实体才会出现互动提示
- [`interactHint`](./input.md#interactHint): 进入实体互动范围时，实体身上出现的提示文本
- [`interactColor`](./input.md#interactColor): 进入实体互动范围时，提示文本的颜色

### 战斗系统

- [`destroyed`](./fight.md#destroyed): 实体是否销毁
- [`enableDamage`](./fight.md#enableDamage): 实体是否显示可以进行伤害
- [`showHealthBar`](./fight.md#showHealthBar): 实体是否显示生命值 HP
- [`hp`](./fight.md#hp): 实体的当前生命值 hp
- [`maxHp`](./fight.md#maxHp): 实体的最大生命值 hp

## 方法列表

### 外观控制

- [`lookAt`](./appearance.md#lookAt): 将实体旋转至面向指定位置的方向
- [`animate`](./animate.md#animate): 创建一个关键帧动画
- [`getAnimations`](./animate.md#getAnimations): 获取实体的所有已创建的动画

### 音效控制

- [`sound`](./music.md#sound): 在实体所在的位置播放声音

### 标签系统

- [`addTag`](./label.md#addTag): 为实体添加一个新标签
- [`hasTag`](./label.md#hasTag): 判断实体是否带有某个标签
- [`removeTag`](./label.md#removeTag): 从实体移除标签
- [`tags`](./label.md#tags): 获取编辑器中给实体添加的全部标签

### 交互控制

- [`say`](./input.md#say): 让实体说话

### 战斗控制

- [`destroy`](./fight.md#destroy): 销毁实体
- [`hurt`](./fight.md#hurt): 对实体的伤害数值

## 事件监听

### 交互事件

- [`onClick`](./input.md#onClick): 当玩家用鼠标点击实体时触发
- [`onInteract`](./input.md#onInteract): 当实体进行互动时触发

### 碰撞事件

- [`onEntityContact`](./input.md#onEntityContact): 当实体触碰另一个实体时触发
- [`onEntitySeparate`](./input.md#onEntitySeparate): 当实体停止触碰另一个实体时触发
- [`onFluidEnter`](./input.md#onFluidEnter): 当实体进入液体时触发
- [`onFluidLeave`](./input.md#onFluidLeave): 当实体离开液体时触发
- [`onVoxelContact`](./input.md#onVoxelContact): 当实体触碰方块时触发
- [`onVoxelSeparate`](./input.md#onVoxelSeparate): 当实体停止触碰方块时触发

### 战斗事件

- [`onDestroy`](./fight.md#onDestroy): 当实体被销毁时触发
- [`onTakeDamage`](./fight.md#onTakeDamage): 实体受到伤害时触发的事件
- [`onDie`](./fight.md#onDie): 实体死亡时触发的事件

## 接口定义

### 动画接口

- [`GameEntityKeyframe`](./animate.md#GameEntityKeyframe): Entity 实体动画关键帧参数

### 事件接口

- [`GameEntityContactEvent`](./input.md#GameEntityContactEvent): 当两个实体碰撞时触发的事件
- [`GameFluidContactEvent`](./input.md#GameFluidContactEvent): 当实体进入或离开液体时触发的事件
- [`GameVoxelContactEvent`](./input.md#GameVoxelContactEvent): 当实体触碰方块时触发的事件
- [`GameHurtOptions`](./fight.md#GameHurtOptions): 攻击/伤害的相关参数
- [`GameDamageEvent`](./fight.md#GameDamageEvent): 当实体收到伤害时触发的事件
- [`GameDieEvent`](./fight.md#GameDieEvent): 当实体死亡时触发的事件

### 碰撞接口

- [`GameEntityContact`](./physics.md#GameEntityContact): 活跃实体对接触
- [`GameVoxelContact`](./physics.md#GameVoxelContact): 活跃方块接触状态
- [`GameFluidContact`](./physics.md#GameFluidContact): 活跃流体接触
