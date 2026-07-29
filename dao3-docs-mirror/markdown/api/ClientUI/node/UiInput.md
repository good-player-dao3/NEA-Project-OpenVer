---
title: "UI 输入"
source: "https://docs.dao3.fun/api/ClientUI/node/UiInput.html"
---

# UI 输入

> UiInput 是继承自[UiText](/api/ClientUI/node/UiText.md)类

![](/api/QQ20240923-102409.png)

- 输入框是特殊的可交互文本框，允许在用户聚焦时输入文本内容
- 输入框存在提示文本，用于在无内容时提示输入信息，提示文本可以配置内容及字体颜色，其余属性将与文本内容一致（对齐方式、文本换行等）

## 属性

#### placeholder: string

> 默认值：'Type something here'

输入框的未输入时文本提示内容。

#### 只读placeholderColor:[Vec3](/api/ClientUI/maths/Vec3.md)

输入框显示的占位文本的颜色。

#### 只读placeholderOpacity: number

> 默认值：1

输入框提示文本的不透明度。

#### 只读isFocus: boolean

输入框是否聚焦。

## 静态方法

#### create(): UiInput

创建并返回一个新的 Ui 输入，初始`parent`为空。

**返回值**

| **类型** | **说明** |
| --- | --- |
| UiInput | 新建 UiInput 元素实例 |

## 方法

#### focus(): void

使输入框聚焦。

#### blur(): string

使输入框失去焦点。

**返回值**

| **类型** | **说明** |
| --- | --- |
| string | 输入框当前的输入值。 |

## 单元素焦点变化监听事件

#### focus:[UiEvent](/api/ClientUI/UiEvent.md)‹UiInput›

使输入框聚焦。

#### blur:[UiEvent](/api/ClientUI/UiEvent.md)‹UiInput›

使输入框失去焦点。

javascript

```
const inputDemo = UiInput.create(); // 静态方法，直接通过类上面的方法来使用。

//当监听到该输入框得到焦点时
inputDemo.events.add("focus", (uiInput) => {
  //xxx
});

//当监听到该输入框失去焦点时
inputDemo.events.add("blur", (uiInput) => {
  //xxx
});
```
