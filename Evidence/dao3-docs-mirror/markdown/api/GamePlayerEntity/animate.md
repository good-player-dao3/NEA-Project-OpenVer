---
title: "动画"
source: "https://docs.dao3.fun/api/GamePlayerEntity/animate.html"
---

# 动画

## 方法

#### animate(keyframes:Partial<[GamePlayerKeyframe](./animate.md#GamePlayerKeyframe)>[],playbackInfo?:Partial<[GameAnimationPlaybackConfig](/api/GameWorld/animate.md#GameAnimationPlaybackConfig)>):[GameAnimation](/api/GameAnimation/index.md)

创建一个关键帧动画

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| keyframes | 是 |  | Partial‹GamePlayerKeyframe[]› | 关键帧的数据 |
| playbackInfo |  |  | Partial‹GameAnimationPlaybackConfig› | 动画播放参数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation | 创建出来的动画对象 |

点击查看示例代码

javascript

```
// 点击让玩家变色
world.onPress(({ entity, button }) => {
  if (button === GameButtonType.ACTION0) {
    // 设置好关键帧
    let frames = [
      {
        duration: 1, // 关键帧的时长，默认为1tick
        color: [1, 1, 1],
      },
      {
        color: [1, 0, 0],
      },
    ];
    // 为玩家对象添加动画
    entity.player.animate(frames, {
      duration: 50, // 动画时长
      direction: GameAnimationDirection.NORMAL, // 播放方向 普通
      iterations: Infinity, // 播放次数无限次
    });
  }
});
```

---

javascript

```
// 让玩家闪烁
world.sunPhase = 0.75; //天黑
world.onPlayerJoin(({ entity }) => {
  entity.player.animate([{ emissive: 0.0 }, { emissive: 0.5 }], {
    iterations: Infinity, //无限循环
    direction: GameAnimationDirection.WRAP, //亮度反复变大变小
    duration: 16 * 2, //2秒1个周期(每秒16帧)
  });
});
```

#### getAnimations():[GameAnimation](/api/GameAnimation/index.md)[]

获取玩家的所有已创建的动画

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation[] | 创建出来的动画对象列表 |

## 接口

#### GamePlayerKeyframe

Player 玩家动画关键帧参数，可对 Player 的大部分属性做动画效果，例如尺寸、颜色、隐身等等

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| duration | number | 播放时长 |
| easeIn | [GameEasing](/api/GameWorld/animate.md#GameEasing) | 缓入效果 |
| easeOut | [GameEasing](/api/GameWorld/animate.md#GameEasing) | 缓出效果 |
| cameraEntity | [GameEntity](/api/GameEntity/index.md) | 在第一人称视角(FPS)或第三人称跟随视角(FOLLOW)下，玩家视角所跟随的实体 |
| cameraMode | [GameCameraMode](/api/GamePlayerEntity/camera.md#GameCameraMode) | 视角模式 |
| cameraPosition | [GameVector3](/api/GameVector3/index.md) | 固定视角(FIXED)下，镜头的眼睛位置 |
| cameraTarget | [GameVector3](/api/GameVector3/index.md) | 固定视角(FIXED)下镜头所朝向的目标点 |
| cameraUp | [GameVector3](/api/GameVector3/index.md) | 固定视角(FIXED)下，镜头向上的矢量 |
| scale | [GameVector3](/api/GameVector3/index.md) | 玩家的缩放比例 |
| color | [GameRGBColor](/api/GameRGBColor/index.md) | 玩家的颜色 |
| colorLUT | string | 用于渲染玩家所见游戏世界的色调 |
| invisible | boolean | 玩家是否隐身 |
| emissive | number | 玩家的发光度 |
| metalness | number | 玩家的金属感 |
| shininess | number | 玩家的反光度 |
| showName | boolean | 玩家名字是否显示 |
