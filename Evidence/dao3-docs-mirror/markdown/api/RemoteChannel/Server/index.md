---
title: "S-🔊 游戏跨端通讯"
source: "https://docs.dao3.fun/api/RemoteChannel/Server/index.html"
---

# S-🔊 游戏跨端通讯

**ServerRemoteChannel**是整个游戏跨端通信的服务端接口，它提供了以下核心功能：

- 服务端消息发送：向指定玩家或全体玩家发送事件消息
- 客户端消息接收：监听并处理来自客户端的事件消息
- 跨端数据传输：支持结构化数据的跨端安全传递

你可以通过全局对象`remoteChannel`来使用这些功能。

## 类定义

typescript

```
declare const remoteChannel: ServerRemoteChannel;
declare class ServerRemoteChannel {
  //...
}
```

## 方法列表

### 服务端发送

- [`sendClientEvent`](/api/RemoteChannel/Server/serverToClient.md#sendClientEvent): 向**指定玩家**发送事件消息
- [`broadcastClientEvent`](/api/RemoteChannel/Server/serverToClient.md#broadcastClientEvent): 向**所有玩家**广播事件消息

### 客户端监听

- [`onServerEvent`](/api/RemoteChannel/Server/clientToServer.md#onServerEvent): 监听并处理来自客户端的事件消息
