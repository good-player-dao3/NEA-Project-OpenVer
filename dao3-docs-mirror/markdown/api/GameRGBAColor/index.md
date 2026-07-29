---
title: "S-RGBA 颜色"
source: "https://docs.dao3.fun/api/GameRGBAColor/index.html"
---

# S-RGBA 颜色

RGBA 颜色基于 RGB 颜色新增 alpha 通道，用来表示颜色的不透明度。

## 构造函数

#### GameRGBAColor(r: number, g: number, b: number, a: number): GameRGBAColor

实例化一个透明颜色对象

**输入参数**r

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| r | 是 |  | number(0-1) | red 颜色值 |
| g | 是 |  | number(0-1) | green 颜色值 |
| b | 是 |  | number(0-1) | blue 颜色值 |
| a | 是 |  | number(0-1) | alpha 透明值 |

javascript

```
//如果需要使用 RGB 255，可以将颜色值除于255，即可得到0-1的数值。
function rgba(r, g, b, a = 255) {
  return new GameRGBAColor(r / 255, g / 255, b / 255, a / 255);
}

let red = rgba(255, 0, 0, 1); // return GameRGBAColor(1, 0, 0, 1)
```

## 属性

#### r: number

red 颜色值，范围 0~1

#### g: number

green 颜色值，范围 0~1

#### b: number

blue 颜色值，范围 0~1

#### a: number

alpha 透明值，范围 0~1

## 方法

#### set(r: number, g: number, b: number, a: number): GameRGBAColor

设置透明颜色值，返回该透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| r | 是 |  | number(0-1) | red 颜色值 |
| g | 是 |  | number(0-1) | green 颜色值 |
| b | 是 |  | number(0-1) | blue 颜色值 |
| a | 是 |  | number(0-1) | alpha 透明值 |

#### copy(c:GameRGBAColor): GameRGBAColor

将透明颜色复制到当前透明颜色中，返回该透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| c | 是 |  | GameRGBAColor | 透明颜色 |

#### clone(): GameRGBAColor

克隆当前透明颜色，返回新的透明颜色

#### add(rgba:GameRGBAColor): GameRGBAColor

颜色相加，返回新的透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### sub(rgba:GameRGBAColor): GameRGBAColor

颜色相减，返回新的透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### mul(rgba:GameRGBAColor): GameRGBAColor

颜色相乘，返回新的透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### div(rgba:GameRGBAColor): GameRGBAColor

颜色相除，返回新的透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### addEq(rgba:GameRGBAColor): GameRGBAColor

颜色相加，并覆盖当前颜色，返回当前透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### subEq(rgba:GameRGBAColor): GameRGBAColor

颜色相减，并覆盖当前颜色，返回当前透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### mulEq(rgba:GameRGBAColor): GameRGBAColor

颜色相乘，并覆盖当前颜色，返回当前透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### divEq(rgba:GameRGBAColor): GameRGBAColor

颜色相除，并覆盖当前颜色，返回当前透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### lerp(rgba: GameRGBAColor, n: number): GameRGBAColor

颜色插值，返回新的透明颜色

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 目标透明颜色 |
| n | 是 |  | number(0-1) | 插值百分比 |

#### equals(rgba:GameRGBAColor): boolean

检测两颜色的值在容差内是否近似相等

容差值：0.000001

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgba | 是 |  | GameRGBAColor | 透明颜色 |

#### blendEq(rgb:GameRGBColor): GameRGBColor

基于给定的参数颜色作为背景，返回该背景颜色与当前透明颜色叠加后的最终显示颜色。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| rgb | 是 |  | GameRGBColor | 颜色 |

#### toString(): string

返回颜色格式化的字符串
