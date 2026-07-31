---
title: "媒体播放错误码"
source: "https://docs.dao3.fun/api/ClientAudio/mediaError.html"
---

# 媒体播放错误码

客户端脚本音频用于构建 error 对象（不是浏览器自己的 MediaError） 具体：[https://developer.mozilla.org/en-US/docs/Web/API/MediaError](https://developer.mozilla.org/en-US/docs/Web/API/MediaError)

## 构造函数

#### MediaError(code:[MediaErrorCode](./mediaError.md#MediaErrorCode),message:string): MediaError

实例化一个音频播放错误码对象

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| code | 是 |  | MediaErrorCode | 错误码 |
| message | 是 |  | string | 错误信息 |

## 属性

#### code:[MediaErrorCode](./mediaError.md#MediaErrorCode)

错误码

#### message: string

错误信息

## 枚举

#### MediaErrorCode

错误码

| **属性** | **说明** |
| --- | --- |
| MEDIA_ERR_ABORTED | 播放被用户终止 |
| MEDIA_ERR_DECODE | 播放时解码错误 |
| MEDIA_ERR_NETWORK | 播放时网络错误 |
| MEDIA_ERR_SRC_NOT_SUPPORTED | 播放时源不支持 |
