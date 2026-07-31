---
title: "输入"
source: "https://docs.dao3.fun/api/ClientScreen/input.html"
---

# 输入

## 玩家屏幕变化监听事件

#### resize:[UiEvent](/api/ClientUI/UiEvent.md)‹{ screenWidth , screenHeight }›

屏幕尺寸变化事件，返回变化后的屏幕宽高。

javascript

```
// 监听玩家改变屏幕分辨率时触发
screen.events.add("resize", ({ screenWidth, screenHeight }) => {
  //...
});
```

**最佳实践**

> UI 框架根据屏幕分辨率自动缩放 UI 元素，以达到适配效果。

javascript

```
//监听玩家屏幕分辨率产生变化事件
screen.events.add("resize", (evt) => {
  console.log("evt", evt.screenWidth, evt.screenHeight);
  scaleScreen(evt.screenHeight, evt.screenWidth);
});

//元素盒子
const box = ui.findChildByName("box");
//设置元素缩放
function scaleScreen(sH, sW) {
  let widthScaleFactor = 1;
  if (sW < 1300) {
    widthScaleFactor = sW / 1300;
  }
  if (!box.uiScale) box.uiScale = UiScale.create();
  box.uiScale.scale = widthScaleFactor;
}
//进入游戏时设置缩放一次
scaleScreen(screenHeight, screenWidth);
```
