---
title: "响应数据"
source: "https://docs.dao3.fun/api/GameHttpAPI/response.html"
---

# 响应数据

## 属性

#### 只读ok: boolean

响应是否成功。 HTTP 状态码的范围在 200-299

---

#### 只读status: number

响应数字状态码。

---

#### 只读statusText: string

响应文本状态信息。

---

#### 只读headers:[GameHttpFetchHeaders](/api/GameHttpAPI/request.md#GameHttpFetchHeaders)

响应的请求头。

## 方法

#### json(): Promise‹any›

获取JSON格式化响应网址数据。

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹any› | 异步JSON格式化后返回网址数据 |

---

#### text(): Promise‹string›

获取字符串化响应网址数据。

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹string› | 异步返回网址字符串数据 |

---

#### arrayBuffer(): Promise‹ArrayBuffer›

获取二进制数据缓冲区响应网址数据。

**返回值**

| **类型** | **说明** |
| --- | --- |
| Promise‹ArrayBuffer› | 异步二进制数据缓冲区返回网址字符串数据 |

---

#### close(): Promise‹void›

关闭连接。
