---
title: "教程：simplex-noise 噪声在地形/资源生成中的实战"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/simplex-noise.html"
---

# 教程：simplex-noise 噪声在地形/资源生成中的实战

一个小故事：你想做“无限草地 + 零散树林”的地图。如果纯靠随机，草地会一块块“斑驳”，树也会挤成团；如果靠手搓函数，参数一多就难以控制。后来你用了噪声函数：只输入坐标，输出一个稳定的“看起来像自然纹理”的值。于是草地起伏自然、树林分布平滑，还能用同样的种子复现。

[Simplex Noise](https://github.com/jwagner/simplex-noise.js)是一种快速、平滑、维度可扩展的噪声算法，适合用于地形高度、热度/湿度图、资源与生物分布、云层/火焰特效等。

## 1. 安装

bash

```
npm install simplex-noise
```

> 该库为 ESM 友好，ArenaPro 环境可直接导入使用。

## 2. 最小上手：2D 噪声高度图

ts

```
import { createNoise2D } from "simplex-noise";

// 可选：控制可复现的随机种子
// import seedrandom from "seedrandom";
// const rng = seedrandom("map-seed-42");
// const noise2D = createNoise2D(rng);

const noise2D = createNoise2D(); // 默认随机种子

// 取样（x,y）坐标，频率 scale 控制“花纹尺寸”
function heightAt(x: number, y: number, scale = 0.05) {
  const n = noise2D(x * scale, y * scale); // 区间 [-1,1]
  // 映射到 [0,1] 再放大到想要的高度
  return (n * 0.5 + 0.5) * 20; // 高度 0..20
}

// 示例：采样一个 128x128 高度图
const H: number[][] = [];
for (let j = 0; j < 128; j++) {
  const row: number[] = [];
  for (let i = 0; i < 128; i++) row.push(heightAt(i, j));
  H.push(row);
}
```

## 3. 八度叠加（Fractal Brownian Motion, fBM）

单层噪声像“柔和的起伏”，叠加多层（Octaves）能更丰富自然。

ts

```
import { createNoise2D } from "simplex-noise";
const noise2D = createNoise2D();

function fbm2D(
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2.0,
  gain = 0.5,
  baseScale = 0.01
) {
  let amp = 1.0; // 振幅（贡献权重）
  let freq = 1.0; // 频率（采样密度）
  let sum = 0.0;
  let norm = 0.0; // 归一化因子（振幅总和）
  for (let o = 0; o < octaves; o++) {
    const n = noise2D(x * baseScale * freq, y * baseScale * freq); // [-1,1]
    sum += n * amp;
    norm += amp;
    amp *= gain; // 越往高频振幅越小
    freq *= lacunarity; // 频率逐层增大
  }
  return sum / norm; // [-1,1]
}

// 使用：
function heightAt(x: number, y: number) {
  const n = fbm2D(x, y, 5, 2.1, 0.5, 0.02);
  return (n * 0.5 + 0.5) * 30; // 0..30
}
```

调参建议：

- octaves ↑ → 细节更多；
- lacunarity ≈ 2.0 常用；
- gain ≈ 0.5 常用；
- baseScale 控制整体纹理大小。

## 4. 山脊/峡谷：Ridged / Billow 噪声

- Billow：先取绝对值再线性变换，得到柔软的“鼓包”。
- Ridged：山脊效果，像“倒扣的 Billow”。

ts

```
function billow(n: number) {
  return 2 * Math.abs(n) - 1;
} // [-1,1]
function ridged(n: number) {
  return 1 - Math.abs(n);
} // [0,1]

function ridgedFbm2D(x: number, y: number) {
  const n = fbm2D(x, y, 5, 2.0, 0.5, 0.02); // 先 fBM
  const r = ridged(n); // 再塑形
  return r; // [0,1]
}
```

用途：

- billow 做云层/沙丘；
- ridged 做山脊/峡谷。

## 5. 域扭曲（Domain Warp）

把输入坐标再用一组噪声“扭曲”，能得到更复杂的纹理（如“漩涡、流动感”）。

ts

```
import { createNoise2D } from "simplex-noise";
const n1 = createNoise2D();
const n2 = createNoise2D();

function domainWarp2D(
  x: number,
  y: number,
  scale = 0.02,
  warpAmp = 15,
  warpScale = 0.05
) {
  const wx = n1(x * warpScale, y * warpScale) * warpAmp;
  const wy = n2(x * warpScale, y * warpScale) * warpAmp;
  const v = n1((x + wx) * scale, (y + wy) * scale); // 被扭曲后的主噪声
  return v; // [-1,1]
}
```

用途：水流/云层/魔法能量的“流动感”。

## 6. 让噪声“可平铺”（Tileable Noise）

生成可拼接的平铺纹理，用于无缝地表或天空盒。

思路：把 2D 平面映射到环面（torus）上，对角度使用三角函数构造循环输入。

ts

```
import { createNoise2D } from "simplex-noise";
const noise2D = createNoise2D();

function tileable2D(u: number, v: number, size = 256, scale = 1.0) {
  // u,v ∈ [0,size) → 映射到 [0, 2π)
  const x = (u / size) * Math.PI * 2;
  const y = (v / size) * Math.PI * 2;
  const nx = Math.cos(x) * scale,
    ny = Math.sin(x) * scale;
  const nz = Math.cos(y) * scale,
    nw = Math.sin(y) * scale;
  // 用 4D 噪声将两个圆周维度“闭合”
  // 如果只引入 2D，可把库换成支持 4D 的版本，或用两次 2D 近似（质量略差）
  // 这里用两次 2D 近似法：
  const a = noise2D(nx + 5.32, ny + 1.73);
  const b = noise2D(nz - 2.11, nw + 9.77);
  return (a + b) * 0.5; // 近似平铺
}
```

> 更严格的做法是使用支持 4D 的噪声库，或者把 simplex-noise 源扩展到 4D（成本较高）。

## 7. 三维噪声：体素/洞穴

体素或体积效果可用 3D 噪声。

ts

```
import { createNoise3D } from "simplex-noise";
const noise3D = createNoise3D();

function caveDensity(x: number, y: number, z: number, scale = 0.05) {
  // 正值填充、负值空洞，根据阈值生成体素
  return noise3D(x * scale, y * scale, z * scale); // [-1,1]
}

// 例：生成 64^3 的密度场（注意体量）
const SIZE = 64;
const field = new Float32Array(SIZE * SIZE * SIZE);
let p = 0;
for (let k = 0; k < SIZE; k++)
  for (let j = 0; j < SIZE; j++)
    for (let i = 0; i < SIZE; i++) field[p++] = caveDensity(i, j, k);
```

## 8. 与游戏要素结合：几个套路

注：本示例以地图尺寸 XYZ = 256 × 64 × 256 进行测试（X/Z 平面 256、Y 高度 64）。请根据你的实际世界尺寸调整参数与边界判断。

- 地形高度：fBM → 缩放映射 → 平滑坡度限制。
- 生物群落：用两张噪声作为“热度/湿度图”，判定生物群落类型（草地/沙地/雪地）。
- 资源点：噪声阈值选点，配合蓝噪声/Poisson Disk 进一步均匀化。
- 天气与云：域扭曲 + 多层叠加，缓慢变化（时间作为第三维）。
- 地下结构：3D 噪声密度场 + Marching Cubes 网格化（离线或低频生成）。

### 8.1 用 voxel.setVoxel 生成最小 2D 高度图地形

思路：用 2D 噪声得到 (x,z) 的地面高度 h，h 以下填充石头/泥土/草，以上填空气。

ts

```
import { createNoise2D } from "simplex-noise";
const noise2D = createNoise2D(); // 可传入种子以保证可复现

function heightAt(x: number, z: number, scale = 0.05, amp = 32, base = 40) {
  const n = noise2D(x * scale, z * scale); // [-1,1]
  return Math.floor(base + n * amp); // 例如 8..72
}

export function generateChunk2D(
  chunkOriginX: number,
  chunkOriginZ: number,
  CHUNK = 32,
  MAX_Y = 64
) {
  for (let dz = 0; dz < CHUNK; dz++) {
    for (let dx = 0; dx < CHUNK; dx++) {
      const x = chunkOriginX + dx;
      const z = chunkOriginZ + dz;
      const h = heightAt(x, z, 0.05, 32, 40);

      for (let y = 0; y < MAX_Y; y++) {
        if (y < h - 4) voxels.setVoxel(x, y, z, "stone");
        else if (y < h - 1) voxels.setVoxel(x, y, z, "dirt");
        else if (y === h) voxels.setVoxel(x, y, z, "grass");
        else voxels.setVoxel(x, y, z, "air");
      }
    }
  }
}
```

### 8.2 fBM 山丘 + 水面

思路：多八度叠加更自然，低处填水形成湖泊/海面。

ts

```
import { createNoise2D } from "simplex-noise";
const noise2D = createNoise2D();

function fbm2D(
  x: number,
  z: number,
  octaves = 5,
  lac = 2.0,
  gain = 0.5,
  scale = 0.02
) {
  let amp = 1,
    freq = 1,
    sum = 0,
    norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise2D(x * scale * freq, z * scale * freq) * amp;
    norm += amp;
    amp *= gain;
    freq *= lac;
  }
  return sum / norm; // [-1,1]
}

function heightAt(x: number, z: number) {
  const n = fbm2D(x, z, 5, 2.1, 0.5, 0.02);
  return Math.floor(40 + n * 32);
}

export function generateChunkTerrain(
  chunkX: number,
  chunkZ: number,
  CHUNK = 32,
  MAX_Y = 64,
  WATER = 42
) {
  for (let dz = 0; dz < CHUNK; dz++) {
    for (let dx = 0; dx < CHUNK; dx++) {
      const x = chunkX + dx,
        z = chunkZ + dz;
      const h = heightAt(x, z);

      for (let y = 0; y < MAX_Y; y++) {
        let id: string = "air";
        if (y < h - 6) id = "stone";
        else if (y < h - 1) id = "dirt";
        else if (y === h) id = y < WATER ? "sand" : "grass";
        else if (y <= WATER) id = "water";

        voxels.setVoxel(x, y, z, id);
      }
    }
  }
}
```

### 8.3 加入 3D 噪声洞穴

思路：用 3D 噪声定义密度，阈值以下改为空气，雕刻出洞穴。

ts

```
import { createNoise2D, createNoise3D } from "simplex-noise";
const n2 = createNoise2D();
const n3 = createNoise3D();

function heightAt(x: number, z: number) {
  let amp = 1,
    freq = 1,
    sum = 0,
    norm = 0;
  for (let o = 0; o < 5; o++) {
    sum += n2(x * 0.02 * freq, z * 0.02 * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return Math.floor(40 + (sum / norm) * 32);
}

function caveDensity(x: number, y: number, z: number) {
  const base = n3(x * 0.05, y * 0.05, z * 0.05);
  const detail = n3(x * 0.12, y * 0.12, z * 0.12) * 0.5;
  return base * 0.8 + detail - 0.2; // <0 则挖空
}

export function generateChunkWithCaves(
  chunkX: number,
  chunkZ: number,
  CHUNK = 32,
  MAX_Y = 64,
  WATER = 42
) {
  for (let dz = 0; dz < CHUNK; dz++) {
    for (let dx = 0; dx < CHUNK; dx++) {
      const x = chunkX + dx,
        z = chunkZ + dz;
      const h = heightAt(x, z);

      for (let y = 0; y < MAX_Y; y++) {
        let id: string = "air";
        if (y < h - 6) id = "stone";
        else if (y < h - 1) id = "dirt";
        else if (y === h) id = y < WATER ? "sand" : "grass";
        else if (y <= WATER) id = "water";

        // 在地表以下雕刻洞穴
        if (id !== "air" && y < h - 1) {
          const dens = caveDensity(x, y, z);
          if (dens < 0) id = "air";
        }
        voxels.setVoxel(x, y, z, id);
      }
    }
  }
}
```

## 9. 性能与实践建议

- 频繁采样要小心：把 scale、octaves 参数固定后，批量采样更高效；
- 控制分辨率：渲染纹理/高度图先低分辨率，再做插值/细化，平衡效果与成本；
- 复现性：配合`seedrandom`保证种子一致；
- 与 gl-matrix 配合：把噪声值映射到`mat4`/`quat`的变换上，做风摆/波浪/浮动物体。

## 10. 参考资料

- simplex-noise.js：[https://github.com/jwagner/simplex-noise.js](https://github.com/jwagner/simplex-noise.js)
- (可选) seedrandom：[https://github.com/davidbau/seedrandom](https://github.com/davidbau/seedrandom)
- 文章：Inigo Quilez 关于噪声与地形的系列（搜索关键词：iq noise, fbm, domain warp）
