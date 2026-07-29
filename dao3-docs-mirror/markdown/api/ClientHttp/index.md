---
title: "C-🔗 游戏外部数据请求"
source: "https://docs.dao3.fun/api/ClientHttp/index.html"
---

# C-🔗 游戏外部数据请求

**ClientHttp**是客户端网络请求的核心接口，它提供了以下功能：

- 网络请求：支持向指定网站发送 HTTP 请求并获取响应数据
- 数据交互：实现与外部服务器的数据交换和 API 调用
- 异步操作：处理异步网络请求，支持 Promise 形式的响应处理

你可以通过全局对象`http`来使用这些功能。

## 类定义

typescript

```
declare const http: ClientHttp;

declare class ClientHttp {
  //...
}
```

## 方法列表

### 网络请求

- [`fetch`](./requestAndResponse.md#fetch): 发送 HTTP 请求并获取响应数据，支持 GET、POST 等多种请求方式

## 接口定义

### 请求配置

- [`RequestInit`](./requestAndResponse.md#RequestInit): 用于配置 HTTP 请求的参数，包括请求方法、请求头、请求体等
- [`Response`](./requestAndResponse.md#Response): HTTP 响应对象，包含响应状态、响应头、响应数据等信息
