---
title: "UI 文本"
source: "https://docs.dao3.fun/api/ClientUI/node/UiText.html"
---

# UI 文本

> UiText 是继承自[UiRenderable](/api/ClientUI/UiRenderable.md)类

![](/api/QQ20240923-102346.png)

## 属性

#### textContent: string

> 默认值：'Text'

文本元素的内容，支持转义字符与换行，会对自身元素的自适应大小产生影响。

换行后，所有受到元素大小影响的属性，均需以新的大小进行计算，包括且不限于：

- textXAlignment
- textYAlignment

#### richText: boolean

> 默认值：false

文本元素的内容是否支持`富文本`。支持的 xml 语法请看：[富文本](/api/ClientUI/RichText.md)

#### textFontSize: number

> 默认值：14

节点显示的文本的字体大小。

#### 只读textColor:[Vec3](/api/ClientUI/maths/Vec3.md)

节点显示的文本的颜色。

#### textXAlignment: 'Center' | 'Left' | 'Right'

> 默认值：'Center'

节点显示的文本的水平对齐方式。

#### textYAlignment: 'Center' | 'Top' | 'Bottom'

> 默认值：'Center'

节点显示的文本的垂直对齐方式。

#### autoWordWrap: boolean

> 默认值：false

是否开启自动换行。

#### textLineHeight: number

> 默认值：1.2

文本的行高。

#### 只读textStrokeColor:[Vec3](/api/ClientUI/maths/Vec3.md)

文本的描边颜色。

#### textStrokeOpacity: number

> 默认值：1

文本描边的不透明度。

#### textStrokeThickness: number

> 默认值：0

文本描边的厚度。范围 0-25

描边粗细效果不影响元素“尺寸”，即不会影响自适应、布局计算、以及交互热区，但是会受到[UIScale](/api/ClientUI/maths/UiScale.md)的影响

#### textFontFamily:[UITextFontFamily](./UiText.md#UITextFontFamily)

> 默认值：UITextFontFamily.Default

文本使用的字体。

由官方提供的可免费商用字体。

## 静态方法

#### create(): UiText

创建并返回一个新的 Ui 文本，初始`parent`为空。

**返回值**

| **类型** | **说明** |
| --- | --- |
| UiText | 新建 UiText 元素实例 |

## 枚举

#### UITextFontFamily

字体样式

| **属性** | **说明** |
| --- | --- |
| Default | 默认字体 |
| BoldRound | 粗圆体 |
| CodeNewRomanBold | Code New Roman Bold |
| ENSerif | EN-Serif |
