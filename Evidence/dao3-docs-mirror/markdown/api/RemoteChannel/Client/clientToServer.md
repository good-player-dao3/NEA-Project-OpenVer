---
title: "客户端：客户端->服务端通讯"
source: "https://docs.dao3.fun/api/RemoteChannel/Client/clientToServer.html"
---

# 客户端：客户端->服务端通讯

## 方法

#### sendServerEvent(event:any): void

`客户端`发送至`服务端`的事件。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| event | 是 |  | any | 在服务端接收到的自定义事件，作为传入服务端脚本里监听器的参数，仅允许可序列化的值 |
