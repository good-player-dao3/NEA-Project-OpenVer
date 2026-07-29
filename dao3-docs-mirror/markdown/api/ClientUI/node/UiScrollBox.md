---
title: "UI 滚动框"
source: "https://docs.dao3.fun/api/ClientUI/node/UiScrollBox.html"
---

# UI 滚动框

> UiScrollBox 是继承自[UiRenderable](/api/ClientUI/UiRenderable.md)类

![](/api/QQ20250404-134923.png)

## 静态方法

#### create(): UiScrollBox

创建一个新的 Ui 滚动框 实例。

**返回值**

| **类型** | **说明** |
| --- | --- |
| UiScrollBox | 新建 UiScrollBox 元素实例 |

## 属性

#### 只读scrollPosition:[Vec2](/api/ClientUI/maths/Vec2.md)

滚动的位置。

- 通常为 {x:0,y:0}，表示滚动条处于最顶部（垂直滚动）或最左侧（水平滚动）。
- 如果尝试设置一个负值，滚动条会自动调整到`0`。
- 如果尝试设置一个超过这个值的滚动位置，滚动条会自动调整到最大值。
