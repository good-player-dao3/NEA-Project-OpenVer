---
title: "客户端：服务端->客户端通讯"
source: "https://docs.dao3.fun/api/RemoteChannel/Client/serverToClient.html"
---

# 客户端：服务端->客户端通讯

## 方法

#### 事件onClientEvent(handler:(args:any)=>void): void

监听`服务端`发来的事件

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| handler | 是 |  | function | 服务端通过该事件发送的数据。 |
