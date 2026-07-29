---
title: "S-🌏 游戏世界"
source: "https://docs.dao3.fun/api/GameWorld/index.html"
---

# S-🌏 游戏世界

**GameWorld**是整个游戏世界的主要接口，它提供了以下核心功能：

- 控制环境：管理天气、物理重力、画面滤镜等全局场景属性
- 实体管理：创建和搜索游戏中的实体对象
- 事件系统：监听实体和玩家的碰撞、伤害、互动等事件

你可以通过全局对象`world`来使用这些功能。

## 类定义

typescript

```
declare const world: GameWorld;
declare class GameWorld {
  //...
}
```

## 属性列表

### 基础信息

- [`projectName`](./mapInfo.md#projectName): 本张地图名称，对应项目设置中的名称
- [`serverId`](./mapInfo.md#serverId): 当前服务器 ID
- [`currentTick`](./mapInfo.md#currentTick): 世界当前的 Tick 计数
- [`useOBB`](./mapInfo.md#useOBB): 是否切换为 OBB 包围盒计算方式

### 物理系统

- [`gravity`](./physics.md#gravity): 世界重力
- [`airFriction`](./physics.md#airFriction): 空气阻力

### 天气效果

#### 雾效果

- [`maxFog`](./weather/fog.md#maxFog): 最大雾量
- [`fogColor`](./weather/fog.md#fogColor): 雾的颜色
- [`fogStartDistance`](./weather/fog.md#fogStartDistance): 雾起始距离
- [`fogHeightOffset`](./weather/fog.md#fogHeightOffset): 雾高度
- [`fogUniformDensity`](./weather/fog.md#fogUniformDensity): 均匀雾量
- [`fogHeightFalloff`](./weather/fog.md#fogHeightFalloff): 高度衰减系数

#### 雨天效果

- [`rainSpeed`](./weather/rain.md#rainSpeed): 雨的速度
- [`rainColor`](./weather/rain.md#rainColor): 雨的颜色
- [`rainDirection`](./weather/rain.md#rainDirection): 雨的方向
- [`rainDensity`](./weather/rain.md#rainDensity): 雨的密度
- [`rainInterference`](./weather/rain.md#rainInterference): 雨的不规则性
- [`rainSizeLo`](./weather/rain.md#rainSizeLo): 雨滴的最小直径
- [`rainSizeHi`](./weather/rain.md#rainSizeHi): 雨滴的最大直径

#### 下雪效果

- [`snowColor`](./weather/snow.md#snowColor): 雪花颜色
- [`snowTexture`](./weather/snow.md#snowTexture): 雪花纹理
- [`snowDensity`](./weather/snow.md#snowDensity): 雪的密度
- [`snowFallSpeed`](./weather/snow.md#snowFallSpeed): 雪花下落速度
- [`snowSpinSpeed`](./weather/snow.md#snowSpinSpeed): 雪花自旋速度
- [`snowSizeLo`](./weather/snow.md#snowSizeLo): 雪花的最小直径
- [`snowSizeHi`](./weather/snow.md#snowSizeHi): 雪花的最大直径

### 光照系统

- [`lightMode`](./weather/illumination.md#lightMode): 作用于天空和环境光的照明类型
- [`sunFrequency`](./weather/illumination.md#sunFrequency): 太阳运动的频率
- [`sunPhase`](./weather/illumination.md#sunPhase): 太阳的初始位置
- [`sunDirection`](./weather/illumination.md#sunDirection): 太阳光照明方向
- [`sunLight`](./weather/illumination.md#sunLight): 太阳光颜色亮度
- [`skyLeftLight`](./weather/illumination.md#skyLeftLight): 环境光在-X 轴方向的亮度
- [`skyRightLight`](./weather/illumination.md#skyRightLight): 环境光在+X 轴方向的亮度
- [`skyBottomLight`](./weather/illumination.md#skyBottomLight): 环境光在-Y 轴方向的亮度
- [`skyTopLight`](./weather/illumination.md#skyTopLight): 环境光在+X 轴方向的亮度
- [`skyFrontLight`](./weather/illumination.md#skyFrontLight): 环境光在-Z 轴方向的亮度
- [`skyBackLight`](./weather/illumination.md#skyBackLight): 环境光在+Z 轴方向的亮度

### 音效系统

- [`ambientSound`](./music.md#ambientSound): 设置背景音乐，从地图运行开始循环播放
- [`playerJoinSound`](./music.md#playerJoinSound): 当玩家进入地图时，播放的音效
- [`playerLeaveSound`](./music.md#playerLeaveSound): 当玩家离开地图时，播放的音效
- [`placeVoxelSound`](./music.md#placeVoxelSound): 方块被放置时，播放的音效
- [`breakVoxelSound`](./music.md#breakVoxelSound): 方块被销毁时，播放的音效

## 方法

### 聊天系统

- [`say`](./chat/resident.md#say): 向所有玩家广播一条消息
- [`createTempChat`](./chat/temporary.md#createTempChat): 创建临时聊天频道
- [`destroyTempChat`](./chat/temporary.md#destroyTempChat): 批量销毁临时聊天频道
- [`addTempChatPlayer`](./chat/temporary.md#addTempChatPlayer): 向临时聊天频道添加玩家
- [`removeTempChatPlayer`](./chat/temporary.md#removeTempChatPlayer): 向临时聊天频道移除玩家
- [`getTempChats`](./chat/temporary.md#getTempChats): 获取当前地图存在的临时聊天频道
- [`getTempChatUsers`](./chat/temporary.md#getTempChatUsers): 获取临时聊天频道中的玩家

### 实体管理

- [`createEntity`](./entityCD.md#createEntity): 创建一个新实体 GameEntity 或复制一个现有的实体
- [`entityQuota`](./entityCD.md#entityQuota): 返回脚本当前仍可创建的实体数量
- [`querySelector`](./querySelectorEntity.md#querySelector): 搜索满足条件的第一个实体
- [`querySelectorAll`](./querySelectorEntity.md#querySelectorAll): 搜索满足条件的所有实体，返回一个列表
- [`searchBox`](./querySelectorEntity.md#searchBox): 搜索指定范围中的全部实体
- [`raycast`](./querySelectorEntity.md#raycast): 射线检测，返回碰到的实体或方块

### 区域管理

- [`addZone`](./mapZone.md#addZone): 创建一个区域
- [`removeZone`](./mapZone.md#removeZone): 删除指定区域
- [`zones`](./mapZone.md#zones): 返回所有的区域列表

### 物理系统

- [`addCollisionFilter`](./physics.md#addCollisionFilter): 添加碰撞过滤器，关闭两个实体组之间的碰撞
- [`removeCollisionFilter`](./physics.md#removeCollisionFilter): 移除碰撞过滤器
- [`clearCollisionFilters`](./physics.md#clearCollisionFilters): 清除全部碰撞过滤器
- [`collisionFilters`](./physics.md#collisionFilters): 返回当前有效的全部碰撞过滤器
- [`testSelector`](./physics.md#testSelector): 测试实体是否符合某个选择器的条件

### 音效与动画

- [`sound`](./music.md#sound): 播放一段声音，所有玩家都能听到
- [`animate`](./animate.md#animate): 创建一个关键帧动画
- [`getAnimations`](./animate.md#getAnimations): 获取当前世界所有已创建的动画
- [`getEntityAnimations`](./animate.md#getEntityAnimations): 获取实体所有已创建的动画
- [`getPlayerAnimations`](./animate.md#getPlayerAnimations): 获取玩家所有已创建的动画

### 地图传送

- [`teleport`](./teleport.md#teleport): 地图组内传送能力，能够让玩家被传送到指定地图中

## 事件监听

### 基础事件

- [`onTick`](./mapInfo.md#onTick): 这是世界的计时事件，每 64 毫秒触发一次，Tick 计数加 1
- [`onPlayerJoin`](./playerJL.md#onPlayerJoin): 当玩家加入地图时触发
- [`onPlayerLeave`](./playerJL.md#onPlayerLeave): 当玩家离开地图时触发
- [`onChat`](./chat/resident.md#onChat): 当玩家在聊天窗口说话时触发

### 实体事件

- [`onEntityCreate`](./entityCD.md#onEntityCreate): 当实体被创建时触发
- [`onEntityDestroy`](./entityCD.md#onEntityDestroy): 当实体被销毁时触发
- [`onInteract`](./input.md#onInteract): 玩家与实体进行互动时触发
- [`onClick`](./input.md#onClick): 当玩家用鼠标点击实体时触发

### 输入事件

- [`onPress`](./input.md#onPress): 当玩家按下按钮时触发
- [`onRelease`](./input.md#onRelease): 当玩家松开按钮时触发

### 战斗事件

- [`onTakeDamage`](./fight.md#onTakeDamage): 当实体受到伤害时触发
- [`onDie`](./fight.md#onDie): 当实体死亡时触发
- [`onRespawn`](./fight.md#onRespawn): 当实体复活时触发

### 碰撞事件

- [`onEntityContact`](./input.md#onEntityContact): 当实体与实体发生碰撞时触发
- [`onEntitySeparate`](./input.md#onEntitySeparate): 当实体与实体结束碰撞时触发
- [`onVoxelContact`](./input.md#onVoxelContact): 当实体与方块发生碰撞时触发
- [`onFluidEnter`](./input.md#airFriction): 当实体进入水里/液体时触发
- [`onFluidLeave`](./input.md#airFriction): 当实体离开水里/液体时触发

### 区域事件

- [`onEnter`](./mapZone.md#GameZone): 当玩家进入该区域时触发
- [`onLeave`](./mapZone.md#GameZone): 当玩离开该区域时触发

### 商城事件

- [`onPlayerPurchaseSuccess`](./shopping.md#onPlayerPurchaseSuccess): 当玩家成功购买物品时触发

## 接口定义

### 事件接口

- [`GameTickEvent`](./mapInfo.md#GameTickEvent): 每一刻(tick)触发一次的事件
- [`GamePlayerEntityEvent`](./playerJL.md#GamePlayerEntityEvent): 当创建或销毁实体时触发的事件
- [`GameChatEvent`](./chat/resident.md#GameChatEvent): 由聊天触发的事件
- [`GameEntityEvent`](./entityCD.md#GameEntityEvent): 实体创建与销毁事件
- [`GameInteractEvent`](./input.md#GameInteractEvent): 当实体互动时触发的事件
- [`GameInputEvent`](./input.md#GameInputEvent): 输入事件，在玩家按下或松开按钮时触发
- [`GameClickEvent`](./input.md#GameClickEvent): 游戏检查事件
- [`GameDamageEvent`](./fight.md#GameDamageEvent): 当实体收到伤害时触发的事件
- [`GameDieEvent`](./fight.md#GameDieEvent): 当实体死亡时触发的事件
- [`GameRespawnEvent`](./fight.md#GameRespawnEvent): 当实体复活时触发的事件
- [`GameTriggerEvent`](./mapZone.md#GameTriggerEvent): 当实体/玩家触发区域的事件
- [`GameEntityContactEvent`](./input.md#GameEntityContactEvent): 当两个实体碰撞时触发的事件
- [`GameVoxelContactEvent`](./input.md#GameVoxelContactEvent): 当实体触碰方块时触发的事件
- [`GameFluidContactEvent`](./input.md#GameFluidContactEvent): 当实体进入或离开液体时触发的事件
- [`GamePurchaseSuccessEvent`](./shopping.md#GamePurchaseSuccessEvent): 当玩家成功购买物品时触发的事件

### 配置接口

- [`GameEntityConfig`](./entityCD.md#GameEntityConfig): 用于控制实体的参数组
- [`GameSelectorString`](./querySelectorEntity.md#GameSelectorString): 选择器可以方便搜索游戏内的全部对象
- [`GameRaycastOptions`](./querySelectorEntity.md#GameRaycastOptions): 进行射线检测的参数配置
- [`GameRaycastResult`](./querySelectorEntity.md#GameRaycastResult): 射线检测的结果，包含射线和所击中目标的信息
- [`GameZoneConfig`](./mapZone.md#GameZoneConfig): 用于区域的参数
- [`GameZone`](./mapZone.md#GameZone): 用于区域的配置
- [`GameSoundEffect`](./music.md#GameSoundEffect): 使用 Sound()方法播放声音时，传入的参数
- [`GameWorldKeyframe`](./animate.md#GameWorldKeyframe): World 世界动画关键帧参数
- [`GameAnimationPlaybackConfig`](./animate.md#GameAnimationPlaybackConfig): 用于动画播放配置的参数组
- [`TeleportResult`](./teleport.md#TeleportResult): 传送结果

## 枚举值

- [`GameButtonType`](./input.md#GameButtonType): 玩家按下的按钮类型
- [`GameEasing`](./animate.md#GameEasing): 动画的缓动效果
