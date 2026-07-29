---
title: "C-🧭 游戏导航器"
source: "https://docs.dao3.fun/api/ClientNavigator/index.html"
---

# C-🧭 游戏导航器

**ClientNavigator**是客户端导航的主要接口，它提供了以下核心功能：

- 设备信息：获取客户端设备类型、屏幕分辨率等硬件信息
- 用户代理：识别和管理客户端的用户代理信息
- 界面导航：提供对玩家界面和屏幕数据的操作能力

你可以在`客户端脚本`中通过全局对象`navigator`来使用这些功能。

## 类定义

typescript

```
declare const navigator: ClientNavigator;

declare class ClientNavigator {
  //...
}
```

## 属性列表

### 客户端信息

- [`userAgent`](./navigator.md#userAgent): 获取客户端的用户代理字符串，用于识别客户端类型和版本
- [`language`](./navigator.md#language): 获取客户端的首选语言，通常是浏览器 UI 的语言。

## 方法列表

### 设备管理

- [`getDeviceInfo`](./navigator.md#getDeviceInfo): 获取当前设备的详细信息，包括设备类型和屏幕分辨率

## 接口定义

### 设备接口

- [`DeviceInfo`](./navigator.md#DeviceInfo): 定义了设备信息的数据结构，包含设备类型和屏幕分辨率等属性
