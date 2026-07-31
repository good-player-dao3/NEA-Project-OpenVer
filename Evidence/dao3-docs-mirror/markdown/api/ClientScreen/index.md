---
title: "C-📺 游戏屏幕"
source: "https://docs.dao3.fun/api/ClientScreen/index.html"
---

# C-📺 游戏屏幕

**ClientScreen**是管理客户端下的屏幕的对象，它提供了以下核心功能：

- 屏幕控制：管理客户端屏幕的尺寸、分辨率等属性
- 事件监听：监听屏幕尺寸变化等事件
- 屏幕适配：提供屏幕自适应和 UI 缩放功能

在`客户端脚本`中，可以通过全局对象`screen`来使用它。

## 类定义

typescript

```
declare const screen: ClientScreen;

declare class ClientScreen {
  //...
}
```

## 事件监听

### 屏幕事件

- [`resize`](./input.md#resize): 当屏幕尺寸发生变化时触发

## 接口定义

### 事件接口

- [`UiEvent`](/api/ClientUI/UiEvent.md): UI 事件的基础接口，包含屏幕事件的参数类型定义
