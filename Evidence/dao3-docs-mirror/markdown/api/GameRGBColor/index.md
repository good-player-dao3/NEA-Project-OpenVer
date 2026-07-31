---
title: "S-RGB 颜色"
source: "https://docs.dao3.fun/api/GameRGBColor/index.html"
---

# S-RGB 颜色

RGB 颜色是计算机中表示颜色的常用方法，分别由红、绿、蓝三个颜色通道组成，每个颜色通道的值为 0-1 之间的浮点数，0 表示无颜色，1 表示纯色。例如，(1, 0, 0) 表示红色，(1, 1, 0) 表示黄色。

## 构造函数

#### GameRGBColor(r: number, g: number, b: number): GameRGBColor

实例化一个颜色对象

**输入参数**r

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| r | 是 |  | number(0-1) | red 颜色值 |
| g | 是 |  | number(0-1) | green 颜色值 |
| b | 是 |  | number(0-1) | blue 颜色值 |

javascript

```
//如果需要使用 RGB 255，可以将颜色值除于255，即可得到0-1的数值。
function rgb(r, g, b) {
  return new GameRGBColor(r / 255, g / 255, b / 255);
}

let red = rgb(255, 0, 0); // return GameRGBColor(1, 0, 0)
```

## 属性

#### r: number

red 颜色值，范围 0~1

#### g: number

green 颜色值，范围 0~1

#### b: number

blue 颜色值，范围 0~1

## 静态方法

#### random(): GameRGBColor

返回随机颜色

## 方法

#### set(r: number, g: number, b: number): GameRGBColor

设置颜色值，返回当前颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| r | 是 |  | number(0-1) | red 颜色值 |
| g | 是 |  | number(0-1) | green 颜色值 |
| b | 是 |  | number(0-1) | blue 颜色值 |

#### copy(c:GameRGBColor): GameRGBColor

将颜色复制到当前颜色中，返回当前颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| c | 是 |  | GameRGBColor | 颜色 |

#### clone(): GameRGBColor

克隆当前颜色，返回新的颜色

#### add(rgb:GameRGBColor): GameRGBColor

颜色相加，返回新的颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### sub(rgb:GameRGBColor): GameRGBColor

颜色相减，返回新的颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### mul(rgb:GameRGBColor): GameRGBColor

颜色相乘，返回新的颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | *是* |  | GameRGBColor | 颜色 |

#### div(rgb:GameRGBColor): GameRGBColor

颜色相除，返回新的颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### addEq(rgb:GameRGBColor): GameRGBColor

颜色相加，并覆盖当前颜色，返回当前颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### subEq(rgb:GameRGBColor): GameRGBColor

颜色相减，并覆盖当前颜色，返回当前颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### mulEq(rgb:GameRGBColor): GameRGBColor

颜色相乘，并覆盖当前颜色，返回当前颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | *是* |  | GameRGBColor | 颜色 |

#### divEq(rgb:GameRGBColor): GameRGBColor

颜色相除，并覆盖当前颜色，返回当前颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### lerp(rgb:GameRGBColor,n: number): GameRGBColor

颜色插值，返回新的颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 目标颜色 |
| n | 是 |  | number(0-1) | 插值百分比 |

#### equals(rgb:GameRGBColor): boolean

检测两颜色的值在容差内是否近似相等

容差值：0.000001

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### toRGBA(): GameRGBAColor

将当前颜色 转换为 透明颜色（alpha 透明值 为 1），返回新的透明颜色

#### toString(): string

返回颜色格式化的字符串
