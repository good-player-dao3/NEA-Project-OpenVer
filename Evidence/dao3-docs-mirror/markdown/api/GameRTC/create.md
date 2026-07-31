---
title: "新建通道"
source: "https://docs.dao3.fun/api/GameRTC/create.html"
---

# 新建通道

## 方法

#### createChannel(channelId?:string): Promise‹[GameRTCChannel](/api/GameRTC/operate.md)›

新建一个rtc通道

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| channelId |  |  | string | 自定义通道标识 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹GameRTCChannel› | 异步返回rtc对象 |
