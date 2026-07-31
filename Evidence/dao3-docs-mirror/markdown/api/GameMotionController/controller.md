---
title: "动作控制器"
source: "https://docs.dao3.fun/api/GameMotionController/controller.html"
---

# 动作控制器

javascript

```
const entity = world.querySelector('#npc')
const entityMotionControl = entity.motion; // GameMotionController
const motion = entityMotionControl.loadByName('hello'); // GameMotionHandler 'hello'指代'npc'实体上的其中一个motion动作名称
motion.onFinish(() => {
  console.log('Motion End');
});
motion.play()
```

## 方法

#### loadByName(configs:string |[GameMotionConfig](./controller.md#GameMotionConfig)[] |[GameMotionClipConfig](./controller.md#GameMotionClipConfig)):[GameMotionHandler](/api/GameMotionController/handler.md)

加载特定动作或动作序列，并返回对应的动作对象

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| configs | 是 |  | string \| GameMotionConfig[] \| GameMotionClipConfig | 动作名称或配置 |

---

#### pause(): void

暂停实体上的动作播放

---

#### resume(): void

恢复实体上的动作播放

---

#### setDefaultMotionByName(motionName:undefined | string): void

设置默认动作

- 没有其他动作在播放的情况下，默认动作会在游戏运行时自动循环播放
- 调用此函数时，如当前处于默认动作执行状态，则将打断旧默认动作，播放新的默认动作
- 动作名不存在时，此方法不产生任何效果，并抛出包含实体、模型与动作信息的错误

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| motionName |  |  | undefined \| string | 动作名称 |

javascript

```
const entity = world.querySelector('#npc')
entity.motion.setDefaultMotionByName('FirstMotion');
entity.motion.setDefaultMotionByName(''); // 报错，不存在对应动作
entity.motion.setDefaultMotionByName(); // 设置默认动作为空，即不播放默认动作
```

## 接口

#### GameMotionConfig

动作配置

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| iterations | number | 输入Infinity就是无限循环，此时会覆盖掉默认动作，能cancel或者播放新的动作覆盖。可选项，默认 1 次 |
| name | string | 动作名字 |

---

#### GameMotionClipConfig

动作序列配置

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| iterations | number | 输入Infinity就是无限循环，此时会覆盖掉默认动作，能cancel或者播放新的动作覆盖。可选项，默认 1 次 |
| motions | (string \|[GameMotionConfig](./controller.md#GameMotionConfig))[] | 可填写指定动作名或motion动作配置 |
