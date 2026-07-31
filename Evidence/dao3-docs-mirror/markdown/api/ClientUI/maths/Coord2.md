---
title: "C-图像映射中区域的坐标"
source: "https://docs.dao3.fun/api/ClientUI/maths/Coord2.html"
---

# C-图像映射中区域的坐标

typescript

```
declare class Coord2 {
  //...
}
```

![](/api/Coord2.png)

## 属性

#### 只读offset:[Vec2](/api/ClientUI/maths/Vec2.md)

元素的相对偏移量。

#### 只读scale:[Vec2](/api/ClientUI/maths/Vec2.md)

元素的相对缩放量，每个坐标轴的范围为 0-1。

## 静态方法

#### create(val?:Coord2): Coord2

按创建并返回一个新的 Coord2，该 Coord2 初始 offset 和 scale 为空。

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| val |  |  | Coord2 | 规定图像映射中区域的坐标 |

**返回值**

| **类型** | **说明** |
| --- | --- |
| Coord2 | 规定图像映射中区域的坐标 |
