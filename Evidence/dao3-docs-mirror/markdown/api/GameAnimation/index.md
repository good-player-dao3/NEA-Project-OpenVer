---
title: "S-动画对象"
source: "https://docs.dao3.fun/api/GameAnimation/index.html"
---

# S-动画对象

信息

**GameAnimation**，作为`animate()`方法的统一返回类型，支持后续的动画操作。

Animation 动画，可对 World 世界、Entity 实体及 Player 玩家等对象添加动画。动画将在本地播放运行，获得更好的性能，播放更流畅、平滑。

## 属性

#### currentTime: number

> 默认值：0

动画的当前播放时间（多少动画帧）

#### 只读playState:[GameAnimationPlaybackState](./index.md#GameAnimationPlaybackState)

> 默认值：GameAnimationPlaybackState.PENDING

当前动画播放状态

#### playbackRate: number

> 默认值：1

每 tick 动画播放速度

#### startTime: number

> 默认值：0

动画开始的时间 tick

#### 只读target:[GameWorld](/api/GameWorld/index.md)|[GameEntity](/api/GameEntity/index.md)|[GamePlayerEntity](/api/GamePlayerEntity/index.md)

动画作用的对象

## 方法

#### play(playback?:Partial‹[GameAnimationPlaybackConfig](./index.md#GameAnimationPlaybackConfig)›): void

播放或者恢复动画的播放

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| playback | 否 |  | Partial‹GameAnimationPlaybackConfig› | 播放的参数 |

#### cancel(): void

暂停动画的播放

#### keyframes(): Partial‹KeyframeType›[]

获取所有的动画关键帧

**返回值**

| **类型** | **说明** |
| --- | --- |
| Partial‹KeyframeType›[] | 已配置的动画关键帧列表 |

#### 事件onFinish(handler:(event:[GameAnimationEvent](./index.md#GameAnimationEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当动画结束播放时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到动画播放完毕时的处理函数 |

#### 事件onReady(handler:(event:[GameAnimationEvent](./index.md#GameAnimationEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

当动画开始播放时触发

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到动画开始播放时的处理函数 |

## 接口

#### GameAnimationEvent

**动画事件**

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| animation | GameAnimation | 动画对象 |
| target | TargetType | 播放动画的目标对象 |
| cancelled | boolean | 动画是否被取消 |
| tick | number | 事件发生时间 |

#### GameAnimationPlaybackConfig

用于动画播放配置的参数组

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| delay | number | 播放延迟 |
| direction | [GameAnimationDirection](#krLiY) | 播放方向 |
| duration | number | 播放时长 |
| endDelay | number | 结束延迟 |
| iterationStart | number | 反复播放开始时间 |
| iterations | number | 反复播放次数 |
| startTick | number | 开始时间 |

#### GameAnimationPlaybackState

动画播放状态

| **属性** | **说明** |
| --- | --- |
| FINISHED | 已完成 |
| PENDING | 挂起等待 |
| RUNNING | 播放中 |

### 示例代码

javascript

```
//先从模型库搜索"电梯"的模型, 并把它拖入场景中
const elevator = world.querySelector("#电梯-1"); //获取电梯板实体
elevator.fixed = true; //不受外力影响
elevator.collides = true; //允许碰撞
const startPos = [64, 11, 64]; //电梯的最低位置
const endPos = [64, 50, 64]; //电梯的最高位置

const ani = elevator.animate(
  [
    // 1+5+1+2=9, 总时间15秒被切成9份
    { position: startPos, duration: 1 }, // 1/9 的时间停留在地面
    { position: startPos, duration: 5 }, // 5/9 的时间用于地面往楼顶移动
    { position: endPos, duration: 1 }, // 1/9 的时间停留在楼顶
    { position: endPos, duration: 2 }, // 2/9 的时间从楼顶回到地面
  ],
  {
    duration: 16 * 15, //播放一个循环共用时15秒,
    iterations: 1, //动画只播放1次
    direction: GameAnimationDirection.WRAP, //让动画实体从终点回到起点
  }
);

ani.onReady(() => {
  //当动画开始播放时
  world.say("电梯准备启动");
});

ani.onFinish(() => {
  //当动画结束播放时
  world.say("电梯自己停了");
});

world.onPress(({ button }) => {
  if (button === GameButtonType.ACTION0) {
    //左键重新播放动画
    ani.play({
      duration: 16 * 15, //播放一个循环共用时15秒(每秒16帧),
      iterations: Infinity, //动画无限次循环播放
      direction: GameAnimationDirection.WRAP, //让动画实体从终点回到起点
    });
  } else if (button === GameButtonType.ACTION1) {
    //右键停止动画
    ani.cancel();
  }
});
```

---

javascript

```
//先从模型库搜索"单元方块"的模型, 并把它拖入场景中
const vox = world.querySelector("#单元方块-1"); //获取实体
vox.meshScale = vox.meshScale.scale(4); //让实体变大4倍

const ani = vox.animate(
  [
    { position: [0, 12, 0], meshColor: [1, 1, 0, 1] },
    { position: [0, 12, 127], meshColor: [1, 0, 0, 1] },
    { position: [127, 12, 127], meshColor: [0, 1, 0, 1] },
    { position: [127, 12, 0], meshColor: [0, 0, 1, 1] },
  ],
  {
    iterations: 3, //兜3圈
    direction: GameAnimationDirection.WRAP, //从终点回到起点
    duration: 16 * 5, //兜一圈5秒(每秒16帧)
  }
);

ani.onReady(() => {
  //当动画开始播放时
  world.say("开始兜圈");
});

ani.onFinish(() => {
  //当动画结束播放时
  world.say("兜圈结束");
});
```
