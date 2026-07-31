---
title: "输入输出"
source: "https://docs.dao3.fun/api/ClientMedia/media.html"
---

# 输入输出

该录音所生成的 Blob 文件是`audio/wav`格式音频文件。

## 方法

#### playAudio(spec?:Partial<{blob:[Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob),gain:number}>): Promise‹void›

播放录音后的音频，可以传入指定的音频 Blob 文件。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| spec.blob |  |  | Blob | 音频内容 |
| spec.gain |  |  | number | 音频声音增益 |

#### stopPlayAudio(): void

停止播放录音音频。

#### startRecording(): Promise‹void›

开始录音。

初次在本浏览器调用时，会弹出录音权限请求，只有通过权限确认，才能进行录音。

#### stopRecording(): Promise‹[Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)›

停止录音，并返回录音的音频 Blob 文件。
