---
title: "动画"
source: "https://docs.dao3.fun/api/GameWorld/animate.html"
---

# 动画

### 方法

#### animate(keyframes:Partial<[GameWorldKeyframe](./animate.md#GameWorldKeyframe)>[],playbackInfo?:Partial<[GameAnimationPlaybackConfig](./animate.md#GameAnimationPlaybackConfig)>):[GameAnimation](/api/GameAnimation/index.md)

创建一个关键帧动画

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| keyframes | 是 |  | Partial‹GameWorldKeyframe[]› | 关键帧的数据 |
| playbackInfo |  |  | Partial‹GameAnimationPlaybackConfig› | 动画播放参数 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation | 创建出来的动画对象 |

点击查看示例代码

javascript

```
const ani = world.animate([
  { rainDensity: 0.0 },
  { rainDensity: 1.0 },
], {
  iterations: Infinity,//无限循环
  direction: GameAnimationDirection.REVERSE,//雨量反复变大变小
  duration: 16 * 5,//5秒1个周期(每秒16帧)
})

world.onPress(({ button }) => {
  if (button === GameButtonType.ACTION0) {//左键停雨
    ani.cancel()
    world.rainDensity = 0
  }
})
```

---

#### getAnimations():[GameAnimation](/api/GameAnimation/index.md)[]

获取当前世界的所有已创建的动画

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation[] | 创建出来的动画对象列表 |

---

#### getEntityAnimations():[GameAnimation](/api/GameAnimation/index.md)[]

获取实体的所有已创建的动画

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation[] | 创建出来的动画对象列表 |

---

#### getPlayerAnimations():[GameAnimation](/api/GameAnimation/index.md)[]

获取玩家的所有已创建的动画

**返回值**

| **类型** | **说明** |
| --- | --- |
| GameAnimation[] | 创建出来的动画对象列表 |

## 接口

#### GameWorldKeyframe

World世界动画关键帧参数，可对World的大部分属性做动画效果，例如重力、雨、雾、雪、光照等等

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| duration | number | 播放时长 |
| easeIn | [GameEasing](./animate.md#gameeasing) | 缓入效果 |
| easeOut | [GameEasing](./animate.md#gameeasing) | 缓出效果 |
| gravity | number | 世界重力 |
| airFriction | number | 空气阻力 |
| maxFog | number | 最大雾量 |
| fogColor | [GameRGBColor](/api/GameRGBColor/index.md) | 雾的颜色 |
| fogHeightFalloff | number | 雾衰减的速率 |
| fogHeightOffset | number | 雾起始高度 |
| fogStartDistance | number | 雾起始距离 |
| fogUniformDensity | number | 雾均匀密度 |
| rainColor | [GameRGBAColor](/api/GameRGBAColor/index.md) | 雨的颜色 |
| rainDensity | number | 雨的密度 |
| rainDirection | number | 雨的方向 |
| rainInterference | number | 雨的扰动幅度 |
| rainSizeHi | number | 雨滴的最大直径 |
| rainSizeLo | number | 雨滴的最小直径 |
| rainSpeed | number | 雨的速度 |
| snowColor | [GameRGBAColor](/api/GameRGBAColor/index.md) | 雪花颜色 |
| snowDensity | number | 雪花密度 |
| snowFallSpeed | number | 雪花速度 |
| snowSizeHi | number | 雪花最大直径 |
| snowSizeLo | number | 雪花最小直径 |
| snowSpinSpeed | number | 雪花自旋速度 |
| snowTexture | string | 雪花纹理 |
| lightMode | string | 作用于天空和环境光的照明类型 |
| sunFrequency | number | 太阳运动的频率 |
| sunDirection | number | 太阳光照明方向 |
| sunLight | number | 太阳光颜色亮度 |
| sunPhase | number | 太阳从升起至落下，在天空的位置 |
| lunarPhase | number | 月亮的相位 |
| skyLeftLight | number | 环境光在-X轴方向的颜色亮度 |
| skyRightLight | number | 环境光在+X轴方向的颜色亮度 |
| skyBottomLight | number | 环境光在-Y轴方向的颜色亮度 |
| skyTopLight | number | 环境光在+Y轴方向的颜色亮度 |
| skyFrontLight | number | 环境光在+Z轴方向的颜色亮度 |
| skyBackLight | number | 环境光在-Z轴方向的颜色亮度 |

---

#### GameAnimationPlaybackConfig

用于动画播放配置的参数组

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| delay | number | 播放延迟 |
| direction | [GameAnimationDirection](./animate.md#gameanimationdirection) | 播放方向 |
| duration | number | 播放时长 |
| endDelay | number | 结束延迟 |
| iterationStart | number | 反复播放开始时间 |
| iterations | number | 反复播放次数 |
| startTick | number | 开始时间 |

## 枚举

#### GameEasing

动画的缓动效果

| 属性 | 说明 |
| --- | --- |
| BACK | 反向 |
| BOUNCE | 弹性 |
| CIRCLE | 圆 |
| ELASTIC | 橡皮筋 |
| EXP | 指数 |
| LINEAR | 线性 |
| NONE | 无 |
| QUADRATIC | 二次方 |
| SINE | 正弦波 |

---

#### GameAnimationDirection

**动画的缓动效果**

| 属性 | 说明 |
| --- | --- |
| ALTERNATE | 交替 |
| ALTERNATE_REVERSE | 交替倒放 |
| NORMAL | 普通 |
| REVERSE | 倒放 |
| WRAP | 循环 |
| WRAP_REVERSE | 循环倒放 |
