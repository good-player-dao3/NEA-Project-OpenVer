---
title: "跳转网站"
source: "https://docs.dao3.fun/api/GamePlayerEntity/link.html"
---

# 跳转网站

## 方法

#### link(href:[URL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL),options?:Partial<{isConfirm: boolean,isNewTab: boolean}>): void

在玩家弹出一个“传送门”窗口，可以跳转到其他地图或任意链接。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| href | 是 |  | URL | 网址（目前支持神奇代码岛、编程猫、微信文章、Bilibili视频等链接） |
| options.isConfirm |  | true | boolean | 是否弹出跳转提示框 |
| options.isNewTab |  | false | boolean | 是否新窗口打开网页 |

点击查看示例代码

javascript

```
//先在地图放一个名为“门”的模型
//玩家跟“门"点击互动按钮，就会弹出一个传送门，进入神岛实验室地图
const door = world.querySelector('#门');

door.enableInteract = true;
door.interactHint = `转去 神岛实验室`;
door.interactRadius = 3;
door.onInteract(async ({entity}) => {
  entity.player.link('https://dao3.fun/play/b0e2846e6cc10cfdc52e') // 将玩家传送到此地图链接
});
```
