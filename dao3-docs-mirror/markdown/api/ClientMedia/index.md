---
title: "C-🎙 游戏录音"
source: "https://docs.dao3.fun/api/ClientMedia/index.html"
---

# C-🎙 游戏录音

**ClientMedia**是客户端管理游戏录音的主要接口，它提供了以下核心功能：

- 录音控制：管理设备录音的开始和停止
- 音频播放：控制录制音频的播放和停止

你可以通过全局对象`media`来使用这些功能。

## 类定义

typescript

```
declare const media: ClientMedia;

declare class ClientMedia {
  //...
}
```

## 方法列表

### 录音控制

- [`startRecording`](./media.md#startRecording): 开始录制音频，调用设备的麦克风进行录音
- [`stopRecording`](./media.md#stopRecording): 停止当前的录音过程，完成音频录制

### 音频播放

- [`playAudio`](./media.md#playAudio): 播放已录制的音频内容
- [`stopPlayAudio`](./media.md#stopPlayAudio): 停止正在播放的录音音频
