---
title: "S-四元数"
source: "https://docs.dao3.fun/api/GameQuaternion/index.html"
---

# S-四元数

四元数是一种用于描述物体在三维空间中旋转的量。四元数由四个分量组成：`x`,`y`,`z`和`w`。虽然比起欧拉角、矩阵等方式，四元数略显晦涩，但由于四元数的运算更加高效、造成的数值误差更低，在 3D 游戏领域发挥着很大作用。

更多有关的数学知识可以观看[3Blue1Brown 相关视频](https://www.bilibili.com/video/BV1SW411y7W1/)。

## 构造函数

#### GameQuaternion(w: number, x: number, y: number, z: number): GameQuaternion

实例化一个四元数对象

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| w | 是 |  | number | w 实部 |
| x | 是 |  | number | x 虚部 |
| y | 是 |  | number | y 虚部 |
| z | 是 |  | number | z 虚部 |

## 属性

#### w: number

w 实部

#### x: number

x 虚部

#### y: number

y 虚部

#### z: number

z 虚部

静态方法

#### fromAxisAngle(axis:GameVector3,rad:number): GameQuaternion

根据旋转轴和旋转弧度计算四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| axis | 是 |  | GameVector3 | 三维向量 |
| rad | 是 |  | number | 旋转弧度 |

#### fromEuler(x:number,y:number,z:number): GameQuaternion

根据欧拉角信息计算四元数，旋转顺序为 YZX，即先绕 Y 旋转，再绕 Z，最后绕 X 旋转。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| x | 是 |  | number | x 虚部 |
| y | 是 |  | number | y 虚部 |
| z | 是 |  | number | z 虚部 |

#### rotationBetween(a:GameVector3,b:GameVector3): GameQuaternion

从两个向量计算并创建一个四元数。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| a | 是 |  | GameVector3 | 三维向量 |
| b | 是 |  | GameVector3 | 三维向量 |

## 方法

#### set(w: number, x: number, y: number, z: number): GameQuaternion

设置四元数值，返回当前四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| w | 是 |  | number | w 实部 |
| x | 是 |  | number | x 虚部 |
| y | 是 |  | number | y 虚部 |
| z | 是 |  | number | z 虚部 |

#### copy(v:GameQuaternion): GameQuaternion

将四元数复制到当前四元数中，返回当前四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| v | 是 |  | GameQuaternion | 四元数 |

#### clone(): GameQuaternion

克隆当前四元数，返回新的四元数

#### rotateX(_rad: number): GameQuaternion

四元数 X 虚部旋转，返回新的四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| _rad | 是 |  | number | 旋转弧度 |

#### rotateY(_rad: number): GameQuaternion

四元数 Y 虚部旋转，返回新的四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| _rad | 是 |  | number | 旋转弧度 |

#### rotateZ(_rad: number): GameQuaternion

四元数 Z 虚部旋转，返回新的四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| _rad | 是 |  | number | 旋转弧度 |

#### add(v:GameQuaternion): GameQuaternion

四元数加法，返回新的四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| v | 是 |  | GameQuate |  |

#### sub(v:GameQuaternion): GameQuaternion

四元数减法，返回新的四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| v | 是 |  | GameQuaternion | 四元数 |

#### mul(q:GameQuaternion): GameQuaternion

四元数乘法，返回新的四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| q | 是 |  | GameQuaternion | 四元数 |

#### inv(): GameQuaternion

四元数转置，返回新的四元数

#### div(q:GameQuaternion): GameQuaternion

四元数除法，返回新的四元数

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| q | 是 |  | GameQuaternion | 四元数 |

#### dot(q:GameQuaternion): number

四元数点积

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| q | 是 |  | GameQuaternion | 四元数 |

#### slerp(q: GameQuaternion, n: number): GameQuaternion

四元数插值，返回新的四元数

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| q | 是 |  | GameQuaternion | 目标四元数 |
| n | 是 |  | number(0-1) | 插值百分比 |

#### angle(q:GameQuaternion): number

返回两个四元数之间的角度

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| q | 是 |  | GameQuaternion | 四元数 |

#### getAxisAngle(_q:GameQuaternion): {angle:number;axis:GameVector3}

返回四元数的旋转弧度和旋转轴

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| _q | 是 |  | GameQuaternion | 四元数 |

#### mag(): number

返回该四元数的长度

#### sqrMag(): number

返回四元数的平方长度

#### equals(v:GameQuaternion): boolean

检测两四元数的值在容差内是否近似相等

容差值：0.000001

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| v | 是 |  | GameQuaternion | 四元数 |

#### normalize(): GameQuaternion

四元数归一化，返回新的四元数

#### toString(): string

返回四元数格式化的字符串
