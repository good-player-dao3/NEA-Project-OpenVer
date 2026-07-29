---
title: "请求响应"
source: "https://docs.dao3.fun/api/ClientHttp/requestAndResponse.html"
---

# 请求响应

## 方法

#### fetch(url: string, options?:[RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)): Promise‹[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)›

请求指定网站，获取响应数据

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| url | 是 |  | string | 网址 |
| options |  |  | RequestInit | 请求配置项 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹Response› | 异步返回响应数据 |
