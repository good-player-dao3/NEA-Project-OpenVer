---
title: "UI 可渲染基类"
source: "https://docs.dao3.fun/api/ClientUI/UiRenderable.html"
---

# UI 可渲染基类

> UiRenderable 是继承自[UiNode](/api/ClientUI/UiNode.md)类

## 属性

#### 只读anchor:[Vec2](/api/ClientUI/maths/Vec2.md)

节点的锚点，用于确定节点的位置。

每个坐标轴的范围为 0-1。

#### 只读position:[Coord2](/api/ClientUI/maths/Coord2.md)

节点的位置，相对于父节点的位置。

#### 只读backgroundColor:[Vec3](/api/ClientUI/maths/Vec3.md)

节点的背景颜色。

#### backgroundOpacity: number

> 默认值：1

节点的背景透明度。

#### rotation: number

> 默认值：0

节点的旋转角度。

控制 UI 元素的旋转角度，旋转参考点默认为元素外框的几何中心点，即默认旋转参考点为 (0.5, 0.5) 锚点位置（不受实际锚点变化影响）

角度取值范围：-179 到 180

#### 只读size:[Coord2](/api/ClientUI/maths/Coord2.md)

节点的尺寸。

#### zIndex: number

> 默认值：1

节点的层级，用于确定节点的渲染顺序。

#### autoResize: 'NONE' | 'X' | 'Y' | 'XY'

> 默认值：'NONE'

节点的自动调整尺寸的方式。

#### visible: boolean

> 默认值：true

节点的可见性。

#### pointerEventBehavior:[PointerEventBehavior](./UiRenderable.md#PointerEventBehavior)

> 默认值：PointerEventBehavior.ENABLE

配置鼠标指针事件的响应方式，鼠标指针事件包括：

- pointerdown
- pointerup

## 枚举

#### PointerEventBehavior

表示界面元素对鼠标指针按下事件的行为方式。

无论是哪种行为方式，鼠标指针事件在 UI 元素上触发时，都不会产生对应的玩家输入。

| **属性** | **说明** |
| --- | --- |
| DISABLE_AND_BLOCK_PASS_THROUGH | 不响应，且不允许位于元素后方的其他元素响应。 |
| DISABLE | 不响应。 |
| BLOCK_PASS_THROUGH | 不允许位于元素后方的其他元素响应。 |
| ENABLE | 正常响应。 |
