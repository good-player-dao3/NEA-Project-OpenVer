---
title: "客户端音频"
source: "https://docs.dao3.fun/api/ClientAudio/index.html"
---

# 客户端音频

> Audio 是继承自[UiEvent](/api/ClientUI/UiEvent.md)类

客户端音频播放不受引擎内下水等声音变化的影响，但是会受玩家客户端整体音量控制（主音量）

## 构造函数

#### Audio(src:string): Audio

实例化一个客户端音频对象

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| src | 是 |  | string | 音频路径 |

javascript

```
let url =
  "https://static.dao3.fun/block/QmSkEpcxqFYvZNwZg2EwzTz7y9XNxQnChZ18CDCM8Q8uvE";

const audio = new Audio(url);
```

## 属性

#### src: string

音频路径，目前仅支持白名单内的 URL，不支持项目内音频路径。

技巧：项目内的音频，请复制音频`Hash`，然后拼接在`https://static.dao3.fun/block/{Hash}`

#### volume: number

> 范围：0-1

音频播放音量，但最终音量受玩家客户端整体音量控制。

#### error:[MediaError](./mediaError.md)| null

音频播放错误码

## 方法

#### play(): Promise‹void›

播放音频

#### pause(): void

暂停音频

#### load(): void

预加载音频

## 事件

#### loadeddata:[UiEvent](/api/ClientUI/UiEvent.md)‹Audio›

音频加载完成事件

#### ended:[UiEvent](/api/ClientUI/UiEvent.md)‹Audio›

音频播放结束事件

#### error:[UiEvent](/api/ClientUI/UiEvent.md)‹Audio›

音频播放错误事件

javascript

```
let url =
  "https://static.dao3.fun/block/QmSkEpcxqFYvZNwZg2EwzTz7y9XNxQnChZ18CDCM8Q8uvE";

const audio = new Audio(url);

//当监听到音频加载完成时触发
audio.add("loadeddata", (e) => {
  //xxx
});

//当监听到音频播放结束时触发
audio.add("ended", (e) => {
  //xxx
});

//当监听到音频发送错误时触发
audio.add("error", (e) => {
  //xxx
});
```
