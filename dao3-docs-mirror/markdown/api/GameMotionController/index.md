---
title: "S-🕺 游戏模型动作"
source: "https://docs.dao3.fun/api/GameMotionController/index.html"
---

# S-🕺 游戏模型动作

**GameMotionController**是控制实体模型动作的主要接口，它提供了以下核心功能：

- 动作管理：加载、播放、暂停和恢复模型动作
- 默认动作：设置和管理模型的默认动作状态
- 动作控制：支持动作的中断和状态监听

你可以通过实体对象的`motion`属性来使用这些功能。

## 类定义

typescript

```
declare class GameMotionController {
  //...
}
```

## 属性列表

### 基础信息

- [`target`](./handler.md#target): 获取当前控制器所属的实体对象

## 方法列表

### 动作管理

- [`loadByName`](./controller.md#loadByName): 加载指定名称的动作或动作序列，返回对应的动作对象
- [`play`](./handler.md#play): 播放当前加载的动作
- [`pause`](./controller.md#pause): 暂停当前正在播放的动作
- [`resume`](./controller.md#resume): 恢复已暂停的动作播放

### 动作控制

- [`setDefaultMotionByName`](./controller.md#setDefaultMotionByName): 设置实体的默认动作
- [`cancel`](./handler.md#cancel): 中断当前动作的播放，并触发 onFinish 事件

### 事件监听

- [`onFinish`](./handler.md#onFinish): 监听动作播放结束事件，包括正常结束和被中断的情况

## 接口定义

### 配置接口

- [`GameMotionConfig`](./controller.md#GameMotionConfig): 单个动作的配置参数
- [`GameMotionClipConfig`](./controller.md#GameMotionClipConfig): 动作序列的配置参数

### 事件接口

- [`GameMotionEvent`](./handler.md#GameMotionEvent): 动作事件的数据结构，包含动作状态和相关信息
