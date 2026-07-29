---
title: "S-三维空间"
source: "https://docs.dao3.fun/api/GameBounds3/index.html"
---

# S-三维空间

三维空间是指由长、宽、高三个维度所构成的空间，是我们日常生活中能够看得见、感受得到的空间。

## 构造函数

#### GameBounds3(lo:GameVector3,hi:GameVector3): GameBounds3

实例化一个三维空间对象

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| lo | 是 |  | GameVector3 | 区域的低处顶点 |
| hi | 是 |  | GameVector3 | 区域的高处顶点 |

## 属性

#### hi: GameVector3

区域的高处顶点

#### lo: GameVector3

区域的低处顶点

## 静态方法

#### fromPoints(...points:GameVector3[]): GameBounds3

任意数量的 3d 坐标点, 用来形成包围盒

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| ...points | 是 |  | GameVector3[] | 三维向量列表 |

## 方法

#### set(lox:number, loy:number, loz:number, hix:number, hiy:number, hiz:number): GameBounds3

设置空间值，返回该三维空间

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| lox | 是 |  | number | 区域的低处顶点的 X 坐标 |
| loy | 是 |  | number | 区域的低处顶点的 Y 坐标 |
| loz | 是 |  | number | 区域的低处顶点的 Z 坐标 |
| hix | 是 |  | number | 区域的高处顶点的 X 坐标 |
| hiy | 是 |  | number | 区域的高处顶点的 Y 坐标 |
| hiz | 是 |  | number | 区域的高处顶点的 Z 坐标 |

#### copy(b:GameBounds3): GameBounds3

将三维空间复制到当前三维空间中，返回当前三维空间

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| b | 是 |  | GameBounds3 | 三维空间 |

#### intersect(b:GameBounds3): GameBounds3

计算与此包围盒相交的部分

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| b | 是 |  | GameBounds3 | 三维空间 |

#### intersects(b:GameBounds3): boolean

检测是否与此包围盒相交

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| b | 是 |  | GameBounds3 | 三维空间 |

#### contains(b:GameVector3): boolean

检测是否包围了这个 3d 点

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| b | 是 |  | GameVector3 | 三维向量 |

#### containsBounds(b:GameBounds3): boolean

检测是否完全包围了此盒

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| b | 是 |  | GameBounds3 | 三维空间 |

#### toString(): string

返回三维空间格式化的字符串
