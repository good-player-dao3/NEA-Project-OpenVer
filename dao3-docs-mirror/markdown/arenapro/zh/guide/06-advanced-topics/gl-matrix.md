---
title: "教程：gl-matrix 向量/矩阵/四元数实战指南"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/gl-matrix.html"
---

# 教程：gl-matrix 向量/矩阵/四元数实战指南

一个小故事：你做了个第三人称相机，按住右键旋转角色和相机。最开始用欧拉角（`yaw/pitch/roll`）做旋转，结果在某些角度“卡住”、抖动，甚至出现朝向突然翻转的怪现象（万向锁）。你尝试在代码里加一堆 if/else 去限制角度，还是不稳。后来你改用 gl-matrix 的四元数：用`quat.setAxisAngle`叠加旋转、`vec3.transformQuat`计算`forward/right/up`方向，再用`mat4.lookAt`生成相机矩阵——抖动没了、过角无忧，代码也简洁了许多。

当你需要旋转实体、计算朝向、做第三人称相机、移动/碰撞、插值动画时，数学就成了“看得见的生产力”。[gl-matrix](https://github.com/toji/gl-matrix)是一套高性能的向量/矩阵/四元数库，体积小、零依赖、ESM 友好，适合在 ArenaPro 中直接使用。

本文从最常用的`vec3`、`mat4`、`quat`出发，由浅入深，串起 10 个高频场景。

## 1. 安装

bash

```
npm install gl-matrix
```

## 2. 最小上手：创建与基本运算（vec3）

ts

```
import { vec3 } from "gl-matrix";

// 创建向量
const a = vec3.fromValues(1, 2, 3);
const b = vec3.fromValues(4, 0, -2);

// 结果写入 out，避免创建过多临时对象（高性能惯例）
const out = vec3.create();

vec3.add(out, a, b); // out = a + b → [5, 2, 1]
vec3.sub(out, a, b); // out = a - b → [-3, 2, 5]
vec3.scale(out, a, 0.5); // out = a * 0.5 → [0.5, 1, 1.5]
vec3.normalize(out, a); // 单位化 → 方向不变，长度为 1
```

要点：gl-matrix 的 API 大多是`fn(out, x, y)`形式，结果写入`out`，利于性能与可控分配。

## 3. 方向与朝向：点乘/叉乘（dot/cross）

ts

```
import { vec3 } from "gl-matrix";

const forward = vec3.fromValues(0, 0, 1);
const right = vec3.fromValues(1, 0, 0);

const dot = vec3.dot(forward, right); // 正交 → 0

const up = vec3.create();
vec3.cross(up, forward, right); // up = forward × right → [0, 1, 0]
```

- dot > 0：同向；dot < 0：反向；≈0：近似垂直。
- `cross(a, b)`的结果方向满足右手法则。

## 4. 旋转的正确姿势：四元数（quat）

避免欧拉角万向锁与顺序陷阱，尽量使用四元数旋转。

ts

```
import { vec3, quat } from "gl-matrix";

const v = vec3.fromValues(1, 0, 0); // X 轴方向
const q = quat.create(); // 单位四元数（无旋转）

// 围绕 Y 轴旋转 90°
quat.setAxisAngle(q, [0, 1, 0], Math.PI / 2);

const rotated = vec3.create();
vec3.transformQuat(rotated, v, q); // → [0, 0, -1]
```

组合多次旋转：

ts

```
const q1 = quat.create();
const q2 = quat.create();
quat.setAxisAngle(q1, [0, 1, 0], Math.PI / 2); // Y 轴 +90°
quat.setAxisAngle(q2, [1, 0, 0], Math.PI / 6); // X 轴 +30°

const qCombined = quat.create();
quat.multiply(qCombined, q1, q2); // 先 q2 后 q1（注意顺序）
```

## 5. 从位置/目标生成朝向：相机/朝向矩阵

常见需求：已知`eye`（相机/实体位置）、`target`（看向点）、`up`（上方向），构造朝向。

ts

```
import { vec3, mat4 } from "gl-matrix";

const eye = vec3.fromValues(0, 2, 5);
const target = vec3.fromValues(0, 1, 0);
const up = vec3.fromValues(0, 1, 0);

const view = mat4.create();
mat4.lookAt(view, eye, target, up); // 视图矩阵（右手系）
```

将`mat4`转为四元数与位置：

ts

```
import { quat } from "gl-matrix";
const rot = quat.create();
quat.fromMat4(rot, view); // 注意：很多时候我们使用逆矩阵或从模型矩阵推导
```

## 6. 世界变换：平移/旋转/缩放（TRS → mat4）

ts

```
import { mat4, quat, vec3 } from "gl-matrix";

const T = vec3.fromValues(10, 0, 0); // 平移
const R = quat.setAxisAngle(quat.create(), [0, 1, 0], Math.PI / 4); // 旋转
const S = vec3.fromValues(2, 2, 2); // 缩放

const model = mat4.create();
mat4.fromRotationTranslationScale(model, R, T, S);
```

变换点：

ts

```
const p = vec3.fromValues(1, 0, 0);
const world = vec3.create();
vec3.transformMat4(world, p, model);
```

## 7. 插值与平滑：LERP / SLERP / 平滑跟随

ts

```
import { vec3, quat } from "gl-matrix";

// 位置线性插值（lerp）
const a = vec3.fromValues(0, 0, 0);
const b = vec3.fromValues(10, 0, 0);
const pos = vec3.create();
vec3.lerp(pos, a, b, 0.25); // t = 0.25 → [2.5, 0, 0]

// 朝向球面插值（slerp）
const qa = quat.setAxisAngle(quat.create(), [0, 1, 0], 0);
const qb = quat.setAxisAngle(quat.create(), [0, 1, 0], Math.PI);
const qOut = quat.create();
quat.slerp(qOut, qa, qb, 0.5);
```

平滑跟随（伪代码）：

ts

```
// 每帧：current += (target - current) * smooth
vec3.lerp(currentPos, currentPos, targetPos, 1 - Math.pow(1 - smooth, dt));
```

## 8. 碰撞前的几何准备：投影与法线

用向量投影判断“沿某方向的重叠程度”，是实现分离轴（SAT）等算法的基础。

ts

```
import { vec3 } from "gl-matrix";

const axis = vec3.normalize(vec3.create(), vec3.fromValues(1, 0, 1)); // 归一化方向

// 将向量 v 投影到 axis 上：proj = axis * dot(v, axis)
function projectOnAxis(out: vec3, v: vec3, axis: vec3) {
  const k = vec3.dot(v, axis);
  vec3.scale(out, axis, k);
  return out;
}
```

## 9. 角色移动与第一/第三人称相机（思路）

- 第一人称：用 yaw/pitch 维护朝向，用`quat.fromEuler()`或轴角叠加构成旋转四元数，然后把`forward/right`方向旋转到世界系。
- 第三人称：`target`为角色位置，`eye = target + offset`，随鼠标滚轮缩放`offset`长度，随拖拽旋转`offset`方向。
- 地形/坡度：用法线与投影限制移动方向，避免“抬头走上墙”。

## 10. 常见坑与最佳实践

- 避免欧拉角反复相加：用四元数累积旋转；需要显示角度时再临时转换。
- 归一化很重要：插值/累乘后请`vec3.normalize()`或`quat.normalize()`，避免误差积累。
- 注意矩阵乘法顺序：`mat4.multiply(out, A, B)`表示先应用 B 再应用 A。
- 复用`out`：尽量少分配临时对象（在热点路径尤甚）。

## 11. 进阶数学示例

### 11.1 由两个向量求旋转（align a → b）

ts

```
import { vec3, quat } from "gl-matrix";

const a = vec3.normalize(vec3.create(), vec3.fromValues(1, 0, 0));
const b = vec3.normalize(vec3.create(), vec3.fromValues(0, 0, 1));

const q = quat.create();
quat.rotationTo(q, a, b); // 生成将 a 旋到 b 的最短旋转

const out = vec3.create();
vec3.transformQuat(out, a, q); // ≈ b
```

用途：让角色面朝移动方向；对齐武器/指示箭头朝向。

### 11.2 视图-投影矩阵与视锥体裁剪（Frustum Culling）

ts

```
import { mat4, vec3 } from "gl-matrix";

// 视图矩阵
const eye = vec3.fromValues(0, 2, 5);
const target = vec3.fromValues(0, 1, 0);
const up = vec3.fromValues(0, 1, 0);
const view = mat4.lookAt(mat4.create(), eye, target, up);

// 投影矩阵（透视投影）
const proj = mat4.perspective(mat4.create(), Math.PI / 3, 16 / 9, 0.1, 100);

// VP 矩阵（clip 空间）
const vp = mat4.multiply(mat4.create(), proj, view);

// 提取六个裁剪平面（Ax + By + Cz + D = 0），未归一化
function extractPlanes(m: mat4) {
  const p = {
    left: [m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]] as number[],
    right: [m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]] as number[],
    bottom: [m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]] as number[],
    top: [m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]] as number[],
    near: [m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]] as number[],
    far: [m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]] as number[],
  } as const;
  // 归一化（方便距离判断）
  for (const key in p) {
    const v = (p as any)[key] as number[];
    const len = Math.hypot(v[0], v[1], v[2]);
    v[0] /= len;
    v[1] /= len;
    v[2] /= len;
    v[3] /= len;
  }
  return p;
}

const planes = extractPlanes(vp);

// 点到平面距离 > 0 表示在平面外侧（被剔除）
function pointInFrustum(x: number, y: number, z: number) {
  for (const k in planes) {
    const [A, B, C, D] = (planes as any)[k] as number[];
    const dist = A * x + B * y + C * z + D;
    if (dist < 0) continue;
    else return false; // 只要有一个为外侧就剔除
  }
  return true; // 全部在内侧/边界
}
```

用途：粗裁剪对象，减轻渲染与逻辑负担。

### 11.3 射线与平面/三角形相交（拾取/命中）

ts

```
import { vec3 } from "gl-matrix";

// 射线-平面：平面 n·x + d = 0；射线 p = o + t*d
function rayPlane(o: vec3, dir: vec3, n: vec3, d: number) {
  const denom = vec3.dot(n, dir);
  if (Math.abs(denom) < 1e-6) return null; // 平行
  const t = -(vec3.dot(n, o) + d) / denom;
  if (t < 0) return null; // 背后
  const hit = vec3.scaleAndAdd(vec3.create(), o, dir, t);
  return { t, hit };
}

// 射线-三角形（Möller–Trumbore）
function rayTriangle(o: vec3, dir: vec3, a: vec3, b: vec3, c: vec3) {
  const EPS = 1e-6;
  const ab = vec3.sub(vec3.create(), b, a);
  const ac = vec3.sub(vec3.create(), c, a);
  const pvec = vec3.cross(vec3.create(), dir, ac);
  const det = vec3.dot(ab, pvec);
  if (Math.abs(det) < EPS) return null;
  const inv = 1 / det;
  const tvec = vec3.sub(vec3.create(), o, a);
  const u = vec3.dot(tvec, pvec) * inv;
  if (u < 0 || u > 1) return null;
  const qvec = vec3.cross(vec3.create(), tvec, ab);
  const v = vec3.dot(dir, qvec) * inv;
  if (v < 0 || u + v > 1) return null;
  const t = vec3.dot(ac, qvec) * inv;
  if (t < 0) return null;
  const hit = vec3.scaleAndAdd(vec3.create(), o, dir, t);
  return { t, u, v, hit };
}
```

用途：鼠标拾取、射线命中测试、子弹/可交互对象检测。

### 11.4 用 yaw/pitch 增量更新四元数（第一人称视角）

ts

```
import { quat, vec3 } from "gl-matrix";

const rot = quat.create(); // 累积旋转

function addYawPitch(yawDelta: number, pitchDelta: number) {
  const qYaw = quat.setAxisAngle(quat.create(), [0, 1, 0], yawDelta);
  const right = vec3.transformQuat(vec3.create(), [1, 0, 0], rot);
  const qPitch = quat.setAxisAngle(quat.create(), right, pitchDelta);
  quat.multiply(rot, qYaw, rot);
  quat.multiply(rot, qPitch, rot);
  quat.normalize(rot, rot);
}
```

用途：FPS 相机平滑、避免万向锁。

### 11.5 分解矩阵：从`mat4`反求 T/R/S

ts

```
import { mat4, vec3, quat } from "gl-matrix";

const model: mat4 = /* ... */ mat4.create();
const T = vec3.create();
const R = quat.create();
const S = vec3.create();

mat4.getTranslation(T, model);
mat4.getRotation(R, model);
mat4.getScaling(S, model);
```

用途：从最终矩阵中获取对象的位姿与缩放，做编辑器/调试显示。

### 11.6 平滑阻尼（SmoothDamp）

ts

```
import { vec3 } from "gl-matrix";

// 近似 Unity 的 SmoothDamp：current 向 target 平滑靠拢，带速度项
function smoothDamp(
  current: vec3,
  target: vec3,
  currentVelocity: vec3,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
) {
  const omega = 2 / Math.max(1e-4, smoothTime);
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = vec3.sub(vec3.create(), current, target);
  // 限速
  const maxChange = maxSpeed * smoothTime;
  const len = vec3.length(change);
  if (len > maxChange)
    vec3.scale(change, change, maxChange / Math.max(1e-6, len));
  const temp = vec3.scale(
    vec3.create(),
    vec3.add(
      vec3.create(),
      currentVelocity,
      vec3.scale(vec3.create(), change, omega)
    ),
    deltaTime
  );
  const newVel = vec3.scale(
    vec3.create(),
    vec3.sub(
      vec3.create(),
      currentVelocity,
      vec3.scale(vec3.create(), temp, omega)
    ),
    exp
  );
  const newPos = vec3.sub(
    vec3.create(),
    vec3.sub(vec3.create(), current, change),
    vec3.scale(vec3.create(), vec3.add(vec3.create(), change, temp), exp)
  );
  vec3.copy(currentVelocity, newVel);
  return newPos;
}
```

用途：相机/物体跟随更“黏滞而不生硬”。

## 参考资料

- gl-matrix GitHub：[https://github.com/toji/gl-matrix](https://github.com/toji/gl-matrix)
- API 文档（类型与函数）：[https://glmatrix.net/](https://glmatrix.net/)
