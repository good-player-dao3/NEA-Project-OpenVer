---
title: "屏幕信息"
source: "https://docs.dao3.fun/api/ClientNavigator/navigator.html"
---

# 屏幕信息

## 属性

#### 只读userAgent: string

获取该客户端的用户代理

值以及属性特性与浏览器本身的属性保持一致。

#### 只读language: string

获取用户的首选语言，通常是浏览器 UI 的语言。

有效的语言代码示例包括“en”、“zh-CN”、“fr”、“fr-FR”、“es-ES”等。

值以及属性特性与浏览器本身的属性保持一致。

## 方法

#### getDeviceInfo():[DeviceInfo](./navigator.md#DeviceInfo)

获取该客户端当前设备以及屏幕分辨率

javascript

```
const deviceInfo = navigator.getDeviceInfo();
console.log(JSON.stringify(deviceInfo)); // {"deviceType":"Desktop","screen":{"width":1800,"height":913}}
```

## 接口

#### DeviceInfo

设备信息

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| deviceType | 'Desktop' \| 'Mobile' | 屏幕的类型，Desktop 桌面端，Mobile 移动端 |
| screen.width | number | 屏幕宽度 |
| screen.height | number | 屏幕高度 |
