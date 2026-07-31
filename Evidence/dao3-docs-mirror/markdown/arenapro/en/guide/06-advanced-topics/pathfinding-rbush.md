---
title: "Tutorial: pathfinding + rbush (A* + spatial acceleration)"
source: "https://docs.dao3.fun/arenapro/en/guide/06-advanced-topics/pathfinding-rbush.html"
---

# Tutorial: pathfinding + rbush (A* + spatial acceleration)

A quick story: your units navigate around obstacles. Plain A* worked until obstacle counts spiked, then it lagged. You indexed obstacles with an R-tree: now "nearby blockers" query in milliseconds; combine with grid pathfinding and dynamic updates—stutters gone.

---

## 1. Install

bash

```
npm install pathfinding rbush
```

---

## 2. Minimal A* on a grid

ts

```
import PF from "pathfinding";

const matrix = [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
];

const grid = new PF.Grid(matrix[0].length, matrix.length, matrix);
const finder = new PF.AStarFinder({ allowDiagonal: false });
const path = finder.findPath(0, 0, 4, 4, grid.clone());
```

---

## 3. rbush for fast nearby-obstacle queries

ts

```
import RBush from "rbush";

type Box = { minX:number; minY:number; maxX:number; maxY:number; id:string };
const tree = new RBush<Box>();

tree.insert({ minX:4, minY:4, maxX:8, maxY:6, id:"wall-1" });
const hits = tree.search({ minX:0, minY:0, maxX:5, maxY:5 });
```

---

## 4. Project obstacles to a grid (build the walkable matrix)

ts

```
function buildGridFromTree(tree: RBush<Box>, cols:number, rows:number, cell:number){
  const mat:number[][] = Array.from({length:rows},()=>Array(cols).fill(0));
  for (const b of tree.all()){
    const minCX = Math.max(0, Math.floor(b.minX / cell));
    const minCY = Math.max(0, Math.floor(b.minY / cell));
    const maxCX = Math.min(cols-1, Math.floor(b.maxX / cell));
    const maxCY = Math.min(rows-1, Math.floor(b.maxY / cell));
    for (let cy=minCY; cy<=maxCY; cy++) for (let cx=minCX; cx<=maxCX; cx++) mat[cy][cx] = 1;
  }
  return mat;
}
```

---

## 5. Pathfinding from world coords (snap to nearest reachable cell)

ts

```
import PF from "pathfinding";

function worldToCell(x:number, y:number, cell:number){ return { cx:Math.floor(x/cell), cy:Math.floor(y/cell) }; }

function findPathWorld(tree: RBush<Box>, start:{x:number;y:number}, goal:{x:number;y:number}, cols:number, rows:number, cell:number){
  const mat = buildGridFromTree(tree, cols, rows, cell);
  const grid = new PF.Grid(cols, rows, mat);
  const finder = new PF.AStarFinder({ allowDiagonal:false, heuristic:PF.Heuristic.manhattan });
  const s = worldToCell(start.x, start.y, cell);
  const g = worldToCell(goal.x, goal.y, cell);
  const clamp = (v:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, v));
  s.cx = clamp(s.cx, 0, cols-1); s.cy = clamp(s.cy, 0, rows-1);
  g.cx = clamp(g.cx, 0, cols-1); g.cy = clamp(g.cy, 0, rows-1);
  if (!grid.isWalkableAt(s.cx, s.cy)) grid.setWalkableAt(s.cx, s.cy, true);
  if (!grid.isWalkableAt(g.cx, g.cy)) grid.setWalkableAt(g.cx, g.cy, true);
  const path = finder.findPath(s.cx, s.cy, g.cx, g.cy, grid);
  return path.map(([cx,cy])=>({ x:(cx+0.5)*cell, y:(cy+0.5)*cell }));
}
```

---

## 6. Dynamics and tips

- Dynamic updates: update rbush entries on obstacle move; rebuild grid locally if needed.
- Avoid crowding: index unit footprints as boxes too; include them during planning.
- Smooth the path: post-process with corner-cutting/funnel.
- Balance cost vs. resolution: start coarse, then refine locally.
