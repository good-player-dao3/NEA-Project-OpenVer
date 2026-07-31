---
title: "服务端：客户端->服务端通讯"
source: "https://docs.dao3.fun/api/RemoteChannel/Server/clientToServer.html"
---

# 服务端：客户端->服务端通讯

## 方法

#### 事件onServerEvent(handler:(event:[ServerEvent](./clientToServer.md#ServerEvent))=>void):[GameEventHandlerToken](/api/GameEventHandlerToken/index.md)

监听`客户端`发来的事件

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 监听到客户端传过来的数据时处理函数 |

## 接口

#### ServerEvent

从客户端发往服务器的自定义事件。

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| entity | [GamePlayerEntity](/api/GameEntity/isPlayer.md) | 事件产生的来源用户。 |
| args | JSONValue | 发送的数据。 |
| tick | number | 事件产生时的客户端 Tick。 |

**JSONValue**

typescript

```
declare type JSONValue = string | number | boolean | {
  [x: string]: JSONValue;
} | Array<JSONValue>;
```
