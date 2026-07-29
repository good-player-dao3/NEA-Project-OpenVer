---
title: "服务端：服务端->客户端通讯"
source: "https://docs.dao3.fun/api/RemoteChannel/Server/serverToClient.html"
---

# 服务端：服务端->客户端通讯

## 方法

#### sendClientEvent(entities:[GamePlayerEntity](/api/GamePlayerEntity/index.md)|[GamePlayerEntity](/api/GamePlayerEntity/index.md)[],clientEvent:any): void

`服务端`发送至`客户端`，向**指定玩家**发送事件。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| entities | 是 |  | GamePlayerEntity \| GamePlayerEntity[] | 玩家实体列表，代表发送对象，传入空数组时不会产生任何效果 |
| clientEvent | 是 |  | any | 自定义事件，在客户端接收到时，传入监听器的参数，仅允许可序列化的值 |

#### broadcastClientEvent(clientEvent:any): void

`服务端`发送至`客户端`，向**所有玩家**发送事件。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| clientEvent | 是 |  | any | 自定义事件，在客户端接收到时，传入监听器的参数，仅允许可序列化的值 |
