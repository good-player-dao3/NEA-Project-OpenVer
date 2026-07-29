---
title: "Guide: gl-matrix in Practice (vec3/mat4/quat)"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/gl-matrix.html"
---

# Guide: gl-matrix in Practice (vec3/mat4/quat)

A quick story: you built a third-person camera using yaw/pitch/roll. At some angles it “locks up” or jitters—classic gimbal lock. After switching to quaternions with gl-matrix, you accumulate rotations with`quat`, compute directions with`vec3.transformQuat`, and build the view with`mat4.lookAt`. The jitters vanish and the code gets simpler.

---

## 1. Install

bash

```
npm i gl-matrix
```

---

## 2. Vectors and transforms

ts

```
import { vec3, mat4 } from "gl-matrix";

const pos = vec3.fromValues(0, 1, 0);
const trans = mat4.fromTranslation(mat4.create(), [1, 0, 0]);
const out = vec3.transformMat4(vec3.create(), pos, trans); // [1,1,0]
```

---

## 3. Camera lookAt

ts

```
import { mat4, vec3 } from "gl-matrix";

const eye = vec3.fromValues(0, 2, 5);
const target = vec3.fromValues(0, 1, 0);
const up = vec3.fromValues(0, 1, 0);
const view = mat4.lookAt(mat4.create(), eye, target, up);
```

---

## 4. Quaternions for smooth rotation

ts

```
import { quat, vec3 } from "gl-matrix";

const rot = quat.create();

function addYawPitch(yawDelta: number, pitchDelta: number) {
  const qYaw = quat.setAxisAngle(quat.create(), [0, 1, 0], yawDelta);
  const right = vec3.transformQuat(vec3.create(), [1, 0, 0], rot);
  const qPitch = quat.setAxisAngle(quat.create(), right, pitchDelta);
  quat.multiply(rot, qYaw, rot);
  quat.multiply(rot, qPitch, rot);
  quat.normalize(rot, rot);
}
```

---

## 5. Advanced math snippets

- Align vector a → b

ts

```
import { vec3, quat } from "gl-matrix";
const a = vec3.normalize(vec3.create(), [1, 0, 0]);
const b = vec3.normalize(vec3.create(), [0, 0, 1]);
const q = quat.create();
quat.rotationTo(q, a, b);
```

- Frustum planes from view-projection

ts

```
import { mat4 } from "gl-matrix";
function extractPlanes(m: mat4) {
  const p = {
    left:   [m[3] + m[0],  m[7] + m[4],  m[11] + m[8],  m[15] + m[12]] as number[],
    right:  [m[3] - m[0],  m[7] - m[4],  m[11] - m[8],  m[15] - m[12]] as number[],
    bottom: [m[3] + m[1],  m[7] + m[5],  m[11] + m[9],  m[15] + m[13]] as number[],
    top:    [m[3] - m[1],  m[7] - m[5],  m[11] - m[9],  m[15] - m[13]] as number[],
    near:   [m[3] + m[2],  m[7] + m[6],  m[11] + m[10], m[15] + m[14]] as number[],
    far:    [m[3] - m[2],  m[7] - m[6],  m[11] - m[10], m[15] - m[14]] as number[],
  } as const;
  for (const k in p) {
    const v = (p as any)[k] as number[];
    const len = Math.hypot(v[0], v[1], v[2]);
    v[0] /= len; v[1] /= len; v[2] /= len; v[3] /= len;
  }
  return p;
}
```

- Ray–triangle (Möller–Trumbore)

ts

```
import { vec3 } from "gl-matrix";
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

---

## 6. Best practices

- Normalize after interpolation/multiplication (`vec3.normalize`,`quat.normalize`).
- Watch multiply order:`mat4.multiply(out, A, B)`applies B then A.
- Reuse output objects in hotspots to avoid allocations.
