---
title: "Tutorial: simplex-noise for Terrain/Resources"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/simplex-noise.html"
---

# Tutorial: simplex-noise for Terrain/Resources

A quick story: you want infinite grasslands with scattered forests. Pure RNG looks blotchy; hand-made functions are hard to control. Noise gives you a stable, natural-looking value per coordinate—easy to tune, easy to reproduce via seed.

---

## 1. Install

bash

```
npm install simplex-noise
```

---

## 2. Minimal 2D heightmap

ts

```
import { createNoise2D } from "simplex-noise";
const noise2D = createNoise2D(); // provide a seeded RNG for reproducibility if needed

function heightAt(x: number, z: number, scale = 0.05, amp = 32, base = 40) {
  const n = noise2D(x * scale, z * scale); // [-1,1]
  return Math.floor(base + n * amp);
}
```

---

## 3. fBM (multi-octave)

ts

```
import { createNoise2D } from "simplex-noise";
const n2 = createNoise2D();

function fbm2D(x: number, z: number, octaves = 5, lac = 2.0, gain = 0.5, scale = 0.02) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += n2(x * scale * freq, z * scale * freq) * amp;
    norm += amp; amp *= gain; freq *= lac;
  }
  return sum / norm; // [-1,1]
}
```

---

## 4. Domain warp (make it flow)

ts

```
import { createNoise2D } from "simplex-noise";
const n1 = createNoise2D();
const n2b = createNoise2D();

function domainWarp2D(x: number, y: number, scale = 0.02, warpAmp = 15, warpScale = 0.05) {
  const wx = n1(x * warpScale, y * warpScale) * warpAmp;
  const wy = n2b(x * warpScale, y * warpScale) * warpAmp;
  return n1((x + wx) * scale, (y + wy) * scale);
}
```

---

## 5. With voxels: carve simple terrain (XYZ 256×64×256)

ts

```
import { createNoise2D, createNoise3D } from "simplex-noise";
const n2v = createNoise2D();
const n3v = createNoise3D();

function heightAt(x: number, z: number) {
  let amp=1, freq=1, sum=0, norm=0; // fBM
  for (let o=0;o<5;o++){ sum+=n2v(x*0.02*freq, z*0.02*freq)*amp; norm+=amp; amp*=0.5; freq*=2; }
  return Math.floor(40 + (sum/norm)*32);
}

function caveDensity(x:number,y:number,z:number){
  const base = n3v(x*0.05,y*0.05,z*0.05);
  const detail = n3v(x*0.12,y*0.12,z*0.12)*0.5;
  return base*0.8 + detail - 0.2; // <0 → air tunnel
}

export function generateChunk(voxels: { setVoxel:(x:number,y:number,z:number,id:string)=>void }, chunkX:number, chunkZ:number, CHUNK=32, MAX_Y=64, WATER=42){
  for(let dz=0;dz<CHUNK;dz++) for(let dx=0;dx<CHUNK;dx++){
    const x = chunkX+dx, z = chunkZ+dz;
    const h = heightAt(x,z);
    for(let y=0;y<MAX_Y;y++){
      let id = "air";
      if (y < h-6) id = "stone"; else if (y < h-1) id = "dirt"; else if (y===h) id = y<WATER?"sand":"grass"; else if (y<=WATER) id="water";
      if (id!=="air" && y < h-1){ if (caveDensity(x,y,z) < 0) id = "air"; }
      voxels.setVoxel(x,y,z,id);
    }
  }
}
```

---

## 6. Tips

- Use a seeded RNG for reproducible worlds.
- Sample in world coordinates to avoid seams between chunks.
- Mix low-frequency shapes with high-frequency detail.
- Keep MAX_Y modest (e.g., 64) for performance in tests.
