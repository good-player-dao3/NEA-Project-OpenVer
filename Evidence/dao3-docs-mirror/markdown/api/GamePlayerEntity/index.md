---
title: "S-👤 游戏玩家"
source: "https://docs.dao3.fun/api/GamePlayerEntity/index.html"
---

# S-👤 游戏玩家

**GamePlayerEntity**是整个游戏世界的可由玩家自主控制的实体，它提供了以下核心功能：

- 玩家信息：管理玩家的基本信息、社交关系和统计数据
- 外观系统：控制玩家的外观、皮肤、穿戴物品等视觉效果
- 相机系统：管理玩家的视角模式、视场角、跟随目标等
- 音效系统：控制玩家听到的音乐、音效和环境声
- 输入系统：处理玩家的键盘、鼠标、触屏等输入
- 战斗系统：管理玩家的生命、死亡、重生等状态
- 交互系统：处理玩家的对话、商店、传送等功能

你可以通过实体的`player`属性来使用这些功能。

## 类定义

typescript

```
declare class GamePlayerEntity {
  //...
}
```

## 属性列表

### 基础信息

- [`name`](./info.md#name): 玩家的昵称
- [`userId`](./info.md#userId): 玩家的用户 ID，个人中心昵称下方可见
- [`boxId`](./info.md#boxId): 玩家的 Box ID(3-15 字符)
- [`userKey`](./info.md#userKey): 玩家的唯一识别码(16 字符)
- [`avatar`](./info.md#avatar): 玩家的头像 url 直链
- [`movementBounds`](./info.md#movementBounds): 玩家的活动范围限制，如超出此范围，则传回出生点
- [`url`](./info.md#url): 获取该玩家进入地图时所用的 URL 链接地址

### 外观系统

- [`color`](./appearance.md#color): 玩家的颜色
- [`emissive`](./appearance.md#emissive): 玩家的发光度
- [`invisible`](./appearance.md#invisible): 玩家是否隐身
- [`showName`](./appearance.md#showName): 玩家名字是否显示
- [`showIndicator`](./appearance.md#showIndicator): 玩家标记是否显示
- [`scale`](./appearance.md#scale): 玩家的缩放比例
- [`metalness`](./appearance.md#metalness): 玩家的金属感
- [`shininess`](./appearance.md#shininess): 玩家的反光度
- [`skin`](./appearance.md#skin): 此玩家的皮肤配置，用于管理当前玩家皮肤的展示
- [`skinInvisible`](./appearance.md#skinInvisible): 是否隐藏玩家模型部件

### 相机系统

- [`cameraMode`](./camera.md#cameraMode): 视角模式
- [`cameraEntity`](./camera.md#cameraEntity): 在第一人称视角(FPS)或第三人称跟随视角(FOLLOW)下，玩家视角所跟随的实体
- [`cameraPosition`](./camera.md#cameraPosition): 固定视角(FIXED)和相对视角(RELATIVE)下，摄像机本身所处的位置
- [`cameraTarget`](./camera.md#cameraTarget): 固定视角(FIXED)和相对视角(RELATIVE)下，摄像机看向的目标点
- [`cameraUp`](./camera.md#cameraUp): 固定视角(FIXED)和相对视角(RELATIVE)下，摄像机镜头向上的矢量
- [`cameraFovY`](./camera.md#cameraFovY): 垂直方向的视场角
- [`enable3DCursor`](./camera.md#enable3DCursor): 启动玩家的 3D 光标
- [`cameraFreezedAxis`](./camera.md#cameraFreezedAxis): 相对视角(RELATIVE)下，冻结相机轴
- [`freezedForwardDirection`](./camera.md#freezedForwardDirection): 如果不为 null，眼睛看向指定方向且锁定左右旋转，只可以上下移动
- [`cameraDistance`](./camera.md#cameraDistance): 摄像机离跟随目标的距离，这决定了相机在场景中观察目标时的相对位置

### 音效系统

- [`music`](./music.md#music): 为指定的玩家播放背景音乐（循环播放），此声音仅该玩家能听见，其他玩家无法听到
- [`action0Sound`](./music.md#action0Sound): 当玩家按下 'action0' 按键（鼠标左键 / 虚拟按钮 A）时，播放的音效
- [`action1Sound`](./music.md#action1Sound): 当玩家按下 'action1' 按键（鼠标右键 / 虚拟按钮 B）时，播放的音效
- [`crouchSound`](./music.md#crouchSound): 当玩家按下 'crouchButton' 按键进行蹲下时，播放的音效
- [`jumpSound`](./music.md#jumpSound): 当玩家按下 'jumpButton' 按键进行跳跃时，播放的音效
- [`doubleJumpSound`](./music.md#doubleJumpSound): 当玩家触发二段跳时，播放的音效
- [`landSound`](./music.md#landSound): 玩家落地时，播放的音效
- [`enterWaterSound`](./music.md#enterWaterSound): 当玩家进入液体时，播放的音效
- [`leaveWaterSound`](./music.md#leaveWaterSound): 当玩家离开液体时，播放的音效
- [`swimSound`](./music.md#swimSound): 当玩家正在游泳时，播放的音效
- [`spawnSound`](./music.md#spawnSound): 当玩家重生时，播放的音效
- [`stepSound`](./music.md#stepSound): 当玩家行走时，每迈出一步，播放的音效
- [`startFlySound`](./music.md#startFlySound): 玩家开始飞行时的音效
- [`stopFlySound`](./music.md#stopFlySound): 玩家结束飞行时播放的音效

### 渲染效果

- [`colorLUT`](./colorLUT.md#colorLUT): 用于渲染玩家所见游戏世界的色调

### 战斗系统

- [`dead`](./fight.md#dead): 玩家是否已死亡，生命值 hp 低于 0。若玩家死亡，则会倒在地上
- [`spawnPoint`](./fight.md#spawnPoint): 玩家复活后的出生点

### 输入系统

- [`gamepad`](./input.md#gamepad): 设置虚拟按键图片
- [`disableInputDirection`](./input.md#disableInputDirection): 禁用指定方向的摇杆输入偏移量
- [`enableAction0`](./input.md#enableAction0): 启动鼠标左键/移动端虚拟按钮 A 键
- [`enableAction1`](./input.md#enableAction1): 启动鼠标右键/移动端虚拟按钮 B 键
- [`action0Button`](./input.md#action0Button): 鼠标左键/移动端虚拟按钮 A 键
- [`action1Button`](./input.md#action1Button): 鼠标右键/移动端虚拟按钮 B 键
- [`jumpButton`](./input.md#jumpButton): 跳跃按钮
- [`walkButton`](./input.md#walkButton): 步行按钮
- [`swapInputDirection`](./input.md#swapInputDirection): 是否交换方向按键
- [`reverseInputDirection`](./input.md#reverseInputDirection): 反转指定方向的摇杆
- [`facingDirection`](./input.md#facingDirection): 玩家朝向

### 移动控制

- [`canFly`](./input.md#canFly): 是否允许玩家飞行
- [`spectator`](./input.md#spectator): 玩家是否是一个幽灵，可以穿墙
- [`enableJump`](./input.md#enableJump): 是否允许玩家跳跃
- [`enableDoubleJump`](./input.md#enableDoubleJump): 是否允许玩家二段跳跃
- [`walkSpeed`](./input.md#walkSpeed): 最大步行速度
- [`runSpeed`](./input.md#runSpeed): 最大奔跑速度
- [`runAcceleration`](./input.md#runAcceleration): 奔跑加速度
- [`jumpPower`](./input.md#jumpPower): 跳跃力度
- [`jumpSpeedFactor`](./input.md#jumpSpeedFactor): 跳跃速度
- [`jumpAccelerationFactor`](./input.md#jumpAccelerationFactor): 跳跃加速率
- [`doubleJumpPower`](./input.md#doubleJumpPower): 二段跳力度
- [`crouchSpeed`](./input.md#crouchSpeed): 蹲着走路的速度
- [`crouchAcceleration`](./input.md#crouchAcceleration): 蹲着走路的加速度
- [`flySpeed`](./input.md#flySpeed): 最大飞行速度
- [`flyAcceleration`](./input.md#flyAcceleration): 飞行加速度
- [`swimAcceleration`](./input.md#swimAcceleration): 游泳加速度
- [`swimSpeed`](./input.md#swimSpeed): 最大游泳速度
- [`walkAcceleration`](./input.md#walkAcceleration): 步行加速度
- [`moveState`](./input.md#moveState): 玩家的运动状态
- [`walkState`](./input.md#walkState): 玩家的步行状态
- [`cameraPitch`](./input.md#cameraPitch): 玩家视角准心绕水平方向的旋转弧度
- [`cameraYaw`](./input.md#cameraYaw): 玩家视角准心绕垂直方向的旋转弧度

## 方法

### 基础信息

- [`querySocial`](./info.md#querySocial): 查询当前玩家的社交关系
- [`querySocialStatistic`](./info.md#querySocialStatistic): 查询当前玩家的社交统计信息
- [`openUserProfileDialog`](./info.md#openUserProfileDialog): 对当前玩家，调起指定 ID 玩家的个人主页

### 外观系统

- [`setSkinByName`](./appearance.md#setSkinByName): 将指定皮肤套装应用到此玩家上
- [`resetToDefaultSkin`](./appearance.md#resetToDefaultSkin): 重置此玩家的皮肤配置为默认皮肤配置
- [`clearSkin`](./appearance.md#clearSkin): 清除地图对此玩家应用的皮肤配置
- [`addWearable`](./appearance.md#addWearable): 在玩家某身体部位附上穿戴配件物体
- [`removeWearable`](./appearance.md#removeWearable): 把玩家身体部位已附上的穿戴配件物体删除
- [`wearables`](./appearance.md#wearables): 列举在玩家上所有的穿戴配件物体

### 动画系统

- [`animate`](./animate.md#animate): 创建一个关键帧动画
- [`getAnimations`](./animate.md#getAnimations): 获取玩家的所有已创建的动画

### 相机系统

- [`setCameraPitch`](./camera.md#setCameraPitch): 设置玩家视角准心绕水平方向的旋转弧度
- [`setCameraYaw`](./camera.md#setCameraYaw): 设置玩家视角准心绕垂直方向的旋转弧度

### 音效系统

- [`sound`](./music.md#sound): 为指定的玩家播放声音，此声音仅该玩家能听见

### 战斗系统

- [`forceRespawn`](./fight.md#forceRespawn): 让玩家强制重生，立即返回出生点

### 交互系统

- [`kick`](./input.md#kick): 把玩家"踢出
