---
title: "动画&模型动作"
source: "https://docs.dao3.fun/api/GameEntity/animate.html"
---

# 动画&模型动作

## 属性

#### motion:[GameMotionController](/api/GameMotionController/index.md)

索引与模型动作相关的全部状态和方法

## 方法

#### animate(keyframes:Partial<[GameEntityKeyframe](./animate.md#GameEntityKeyframe)>[],playbackInfo?:Partial<[GameAnimationPlaybackConfig](/api/GameWorld/animate.md#GameAnimationPlaybackConfig)>):[GameAnimation](/api/GameAnimation/index.md)

创建一个关键帧动画

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| keyframes | 是 |  | Partial‹GameEntityKeyframe[]› | 关键帧的数据 |
| playbackInfo |  |  | Partial‹GameAnimationPlaybackConfig› | 动画播放参数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation | 创建出来的动画对象 |

点击查看示例代码

javascript

```
//需要提前在编辑器中添加'单元方块'的模型。 
const vox = world.querySelector('#单元方块-1') //获取实体
vox.meshScale = vox.meshScale.scale(4) //让实体变大4倍

const ani = vox.animate([
  { position: [0, 12, 0], meshColor: [1, 1, 0, 1] },
  { position: [0, 12, 127], meshColor: [1, 0, 0, 1] },
  { position: [127, 12, 127], meshColor: [0, 1, 0, 1] },
  { position: [127, 12, 0], meshColor: [0, 0, 1, 1] },
], {
  iterations: 3,//兜3圈
  direction: GameAnimationDirection.WRAP,//从终点回到起点
  duration: 16 * 5, //兜一圈5秒(每秒16帧)
})

ani.onReady(() => {//当动画开始播放时
  world.say('开始兜圈')
})

ani.onFinish(() => {//当动画结束播放时
  world.say('兜圈结束')
})
```

---

#### getAnimations():[GameAnimation](/api/GameAnimation/index.md)[]

获取实体的所有已创建的动画

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation[] | 创建出来的动画对象列表 |

## 接口

#### GameEntityKeyframe

Entity实体动画关键帧参数，可对Entity除音效外的大部分属性做动画效果，例如位移、大小、模型、颜色等等

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| duration | number | 播放时长 |
| easeIn | [GameEasing](/api/GameWorld/animate.md#GameEasing) | 缓入效果 |
| easeOut | [GameEasing](/api/GameWorld/animate.md#GameEasing) | 缓出效果 |
| velocity | [GameVector3](/api/GameVector3/index.md) | 实体朝向某个方向运动的作用力 |
| collides | boolean | 实体是否可碰撞 |
| mesh | string | mesh决定了实体的外形。'mesh/*.vb' |
| meshColor | [GameRGBAColor](/api/GameRGBAColor/index.md) | 实体的颜色 |
| meshScale | [GameVector3](/api/GameVector3/index.md) | 实体的缩放比例 |
| meshOrientation | [GameQuaternion](/api/GameQuaternion/index.md) | 实体的旋转角度 |
| meshMetalness | number | 实体的金属感 |
| meshEmissive | number | 实体的发光度 |
| meshShininess | number | 实体的反光度 |
| gravity | boolean | 实体是否会下落 |
| fixed | boolean | 实体的位置是否固定不动 |
| mass | number | 实体质量 |
| friction | number | 实体的粘性(0 = 滑，1 = 粘) |
