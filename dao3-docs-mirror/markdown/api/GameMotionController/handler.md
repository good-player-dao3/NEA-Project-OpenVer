---
title: "动作处理器"
source: "https://docs.dao3.fun/api/GameMotionController/handler.html"
---

# 动作处理器

信息

**GameMotionHandler**，作为`loadByName()`方法的统一返回类型，支持后续的动作操作。

## 属性

#### 只读target:[GameEntity](/api/GameEntity/index.md)

得到当前entity对象

## 方法

#### play(): void

播放当前实体动作

- 会打断当前动作，开始对应动作/序列动作的播放
- 当配置中包含的动作播放结束时，触发`onFinish`事件

---

#### cancel(): void

中途打断此动作播放，并触发`onFinish`事件

---

#### 事件onFinish(handler:(event:[GameMotionEvent](./handler.md#GameMotionEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

响应结束状态的监听函数

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到实体动作结束时的处理函数 |

## 接口

#### GameMotionEvent

动作事件

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| cancelled | boolean | 动作是否被中途打断 |
| tick | number | 事件发生时间 |
| target | [GameEntity](/api/GameEntity/index.md) | entity对象 |
| motionHandler | [GameMotionHandler](./handler.md) | 本身的动作处理器 |
