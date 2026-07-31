---
title: "C-🖼️ 游戏用户界面"
source: "https://docs.dao3.fun/api/ClientUI/index.html"
---

# C-🖼️ 游戏用户界面

**ClientUI**是管理游戏界面的主要接口，它提供了以下核心功能：

- 界面布局：管理 UI 节点的层级、位置、尺寸等布局属性
- 节点管理：创建和操作各类 UI 节点（屏幕、盒子、图片、文本、输入框等）
- 事件系统：处理用户交互、节点状态变化等事件
- 样式控制：自定义节点的颜色、透明度、旋转等视觉效果

提示

在推出此功能前，已有 GUI 功能（基于 xml 编写）。但已不推荐使用，因有更优方案且支持可视化编辑。推荐使用最新的 ClientUI。 对旧版 GUI 感兴趣可查阅[d.ts 文件](https://github.com/box3lab/arena_dts/blob/main/GameAPI.d.ts#L13224)。

## 类定义

typescript

```
declare const ui: UiNode;
declare const input: InputSystem;
declare const screenWidth: number; // 全局对象，获取当前玩家屏幕宽度
declare const screenHeight: number; // 全局对象，获取当前玩家屏幕高度

declare class InputSystem {
  //...
}
declare class UiNode {
  //...
}
```

## 属性列表

### 基础属性

- [`name`](./UiNode.md#name): 节点的标识符，可重复
- [`visible`](./UiRenderable.md#visible): 节点的可见性
- [`zIndex`](./UiRenderable.md#zIndex): 节点的层级，用于确定渲染顺序

### 节点结构

- [`parent`](./UiNode.md#parent): 父节点，非根节点的父节点为空时不会被渲染
- [`children`](./UiNode.md#children): 子节点列表，通过修改子节点的`parent`属性调整结构
- [`events`](./UiNode.md#events): 节点事件管理器

### 布局与变换

- [`anchor`](./UiRenderable.md#anchor): 节点锚点，用于确定位置
- [`position`](./UiRenderable.md#position): 相对于父节点的位置
- [`size`](./UiRenderable.md#size): 节点尺寸
- [`rotation`](./UiRenderable.md#rotation): 旋转角度
- [`uiScale`](./UiNode.md#uiScale): 等比例缩放数据
- [`autoResize`](./UiRenderable.md#autoResize): 自动调整尺寸的方式

### 外观样式

- [`backgroundColor`](./UiRenderable.md#backgroundColor): 背景颜色
- [`backgroundOpacity`](./UiRenderable.md#backgroundOpacity): 背景透明度
- [`pointerEventBehavior`](./UiRenderable.md#pointerEventBehavior): 鼠标指针事件响应方式

### 图片节点

- [`image`](./node/UiImage.md#image): 图片内容（路径或 URL）
- [`imageOpacity`](./node/UiImage.md#imageOpacity): 图片透明度
- [`imageDisplayMode`](./node/UiImage.md#imageDisplayMode): 图像显示模式
- [`complete`](./node/UiImage.md#complete): 图片加载状态

### 滚动框节点

- [`scrollPosition`](./node/UiScrollBox.md#scrollPosition): 滚动的位置

### 文本节点

- [`textContent`](./node/UiText.md#textContent): 文本内容
- [`richText`](./node/UiText.md#richText): 是否支持富文本
- [`textFontSize`](./node/UiText.md#textFontSize): 字体大小
- [`textColor`](./node/UiText.md#textColor): 文本颜色
- [`textFontFamily`](./node/UiInput.md#textFontFamily): 字体样式
- [`textXAlignment`](./node/UiText.md#textXAlignment): 水平对齐方式
- [`textYAlignment`](./node/UiText.md#textYAlignment): 垂直对齐方式
- [`autoWordWrap`](./node/UiText.md#autoWordWrap): 自动换行
- [`textLineHeight`](./node/UiText.md#textLineHeight): 行高
- [`textStrokeColor`](./node/UiText.md#textStrokeColor): 描边颜色
- [`textStrokeOpacity`](./node/UiText.md#textStrokeOpacity): 描边透明度
- [`textStrokeThickness`](./node/UiText.md#textStrokeThickness): 描边厚度

### 输入节点

- [`placeholderColor`](./node/UiInput.md#placeholderColor): 占位文本颜色
- [`placeholderOpacity`](./node/UiInput.md#placeholderOpacity): 占位文本透明度
- [`isFocus`](./node/UiInput.md#isFocus): 是否处于焦点状态

## 方法

### 节点操作

- [`findChildByName`](./UiNode.md#findChildByName): 按名称查找子节点
- [`clone`](./UiNode.md#clone): 复制节点

### 节点创建

- [`create`](./UiScreen.md#create): 创建 UI 屏幕实例
- [`create`](./node/UiBox.md#create): 创建 UI 盒子实例
- [`create`](./node/UiScrollBox.md#create): 创建 UI 滚动框实例
- [`create`](./node/UiImage.md#create): 创建 UI 图片实例
- [`create`](./node/UiText.md#create): 创建 UI 文本实例
- [`create`](./node/UiInput.md#create): 创建 UI 输入实例

### 屏幕管理

- [`getAllScreen`](./UiScreen.md#getAllScreen): 获取所有屏幕实例

### 输入控制

- [`focus`](./node/UiInput.md#isFocus): 使输入框获得焦点
- [`blur`](./node/UiInput.md#blur): 使输入框失去焦点
- [`unlockPointer`](./input.md#unlockPointer): 显示鼠标指针
- [`lockPointer`](./input.md#lockPointer): 隐藏鼠标指针

### 事件处理

- [`on`](./UiEvent.md#on): 监听事件
- [`once`](./UiEvent.md#once): 监听一次性事件
- [`add`](./UiEvent.md#add): 添加事件监听器（同 on）
- [`emit`](./UiEvent.md#emit): 触发事件
- [`remove`](./UiEvent.md#remove): 移除第一个匹配的监听器
- [`off`](./UiEvent.md#off): 移除事件监听器（同 remove）
- [`removeAll`](./UiEvent.md#removeAll): 移除所有监听器

## 枚举值

- [`PointerEventBehavior`](./UiRenderable.md#PointerEventBehavior): 鼠标指针事件行为
- [`ImageDisplayMode`](./node/UiImage.md#ImageDisplayMode): 图像显示模式
- [`UITextFontFamily`](./node/UiText.md#UITextFontFamily): 字体样式
