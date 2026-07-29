---
title: "向量基础（游戏常用）"
source: "https://docs.dao3.fun/arena/javascriptEntry/02-core-fundamentals/05-vector-basics.html"
---

# 向量基础（游戏常用）

在 2D/3D 游戏中，向量运算非常常见：位移、速度、朝向、距离计算等。

## 2D/3D 向量结构

js

```
// 2D
function vec2(x=0, y=0) { return { x, y }; }
// 3D
function vec3(x=0, y=0, z=0) { return { x, y, z }; }
```

## 常用运算

js

```
function add2(a,b){ return { x:a.x+b.x, y:a.y+b.y }; }
function sub2(a,b){ return { x:a.x-b.x, y:a.y-b.y }; }
function dot2(a,b){ return a.x*b.x + a.y*b.y; }
function len2(a){ return Math.hypot(a.x, a.y); }
function norm2(a){ const L=len2(a)||1; return { x:a.x/L, y:a.y/L }; }

function add3(a,b){ return { x:a.x+b.x, y:a.y+b.y, z:a.z+b.z }; }
function sub3(a,b){ return { x:a.x-b.x, y:a.y-b.y, z:a.z-b.z }; }
function dot3(a,b){ return a.x*b.x + a.y*b.y + a.z*b.z; }
function cross3(a,b){
  return { x:a.y*b.z - a.z*b.y, y:a.z*b.x - a.x*b.z, z:a.x*b.y - a.y*b.x };
}
function len3(a){ return Math.hypot(a.x, a.y, a.z); }
function norm3(a){ const L=len3(a)||1; return { x:a.x/L, y:a.y/L, z:a.z/L }; }
```

## 角度与方向

js

```
const deg2rad = d => d * Math.PI / 180;
const rad2deg = r => r * 180 / Math.PI;

// 2D 角度 -> 单位向量
function dir2(angleRad){ return { x: Math.cos(angleRad), y: Math.sin(angleRad) }; }
```

## 推荐阅读

- MDN Math.hypot:[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot)
