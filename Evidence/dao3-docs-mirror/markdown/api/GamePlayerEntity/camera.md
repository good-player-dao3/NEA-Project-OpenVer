---
title: "摄像机视角"
source: "https://docs.dao3.fun/api/GamePlayerEntity/camera.html"
---

# 摄像机视角

## 属性

#### cameraMode:[GameCameraMode](./camera.md#GameCameraMode)

> 默认值：GameCameraMode.FOLLOW

视角模式

#### cameraEntity:[GameEntity](/api/GameEntity/index.md)| null

> 默认值：玩家本身

在第一人称视角(FPS)或第三人称跟随视角(FOLLOW)下，玩家视角所跟随的实体

#### cameraPosition:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

固定视角(FIXED)和相对视角(RELATIVE)下，摄像机本身所处的位置

#### cameraTarget:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 0, 0)

固定视角(FIXED)和相对视角(RELATIVE)下，摄像机看向的目标点

#### cameraUp:[GameVector3](/api/GameVector3/index.md)

> 默认值：GameVector3(0, 1, 0)

固定视角(FIXED)和相对视角(RELATIVE)下，摄像机镜头向上的矢量

#### cameraFovY: number

> 默认值：0.25

垂直方向的视场角

#### enable3DCursor: boolean

> 默认值：false

启动玩家的 3D 光标

#### cameraFreezedAxis:[GameCameraFreezedAxis](./camera.md#GameCameraFreezedAxis)

> 默认值：GameCameraFreezedAxis.NONE

相对视角(RELATIVE)下，下冻结相机轴

#### freezedForwardDirection:[GameVector3](/api/GameVector3/index.md)| null

> 默认值：null

如果不为 null，眼睛看向指定方向且锁定左右旋转，只可以上下移动。

#### cameraDistance: number

> 默认值：8.5

摄像机离跟随目标的距离，这决定了相机在场景中观察目标时的相对位置。

## 方法

#### setCameraPitch(v:number): void

设置玩家视角准心绕水平方向的旋转弧度

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| v | 是 |  | number | 设置弧度 |

#### setCameraYaw(v:number): void

设置玩家视角准心绕垂直方向的旋转弧度

**输入参数**

| **参数** | **必填** | **默认值** | **类型** | **说明** |
| --- | --- | --- | --- | --- |
| v | 是 |  | number | 设置弧度 |

## 枚举

#### GameCameraMode

玩家的相机视角模式

| **属性** | **说明** |
| --- | --- |
| FIXED | 第三人称固定视角 |
| FOLLOW | 第三人称跟随视角(默认) |
| FPS | 第一人称视角 |
| RELATIVE | 相对于玩家位置的第三人称视角 |

#### GameCameraFreezedAxis

玩家的轴模式

| **属性** | **说明** |
| --- | --- |
| NONE | 不设置 |
| X | X 轴 |
| Y | Y 轴 |
| Z | Z 轴 |
| XY | XY 轴 |
| XZ | XZ 轴 |
| YZ | YZ 轴 |
| XYZ | XYZ 轴 |
