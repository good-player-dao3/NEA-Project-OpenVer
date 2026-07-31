---
title: "外部请求"
source: "https://docs.dao3.fun/api/GameHttpAPI/request.html"
---

# 外部请求

## 方法

#### fetch(url:[URL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL), options?:Partial<[GameHttpFetchRequestOptions](./request.md#GameHttpFetchRequestOptions)>): Promise<[GameHttpFetchResponse](/api/GameHttpAPI/response.md)>

请求指定网站，获取响应数据

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| url | 是 |  | URL | 网址 |
| options |  |  | Partial‹GameHttpFetchRequestOptions› | 请求配置 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹GameHttpFetchResponse› | 异步返回响应数据 |

## 接口

#### GameHttpFetchRequestOptions

请求时的配置。

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| timeout | number | 超时时间（毫秒ms），超过后断开请求 |
| method | 'OPTIONS' \| 'GET' \| 'HEAD' \| 'PUT' \| 'POST' \| 'DELETE' \| 'PATCH' | 请求方式 |
| headers | [GameHttpFetchHeaders](./request.md#GameHttpFetchHeaders) | 请求头对象 |
| body | string \| ArrayBuffer | 请求体 |

---

#### GameHttpFetchHeaders

请求头配置。

| **参数** | **类型** | **说明** |
| --- | --- | --- |
| [name: string] | string \| string[] | 请求头列表 |
