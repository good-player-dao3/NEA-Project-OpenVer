---
title: "教程：pathfinding + rbush 做寻路与空间加速的组合拳"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/pathfinding-rbush.html"
---

# 教程：pathfinding + rbush 做寻路与空间加速的组合拳

一个小故事：你做了个单位移动系统，单位绕障碍走。刚开始用朴素 A*，障碍少还行，一多就卡顿；后来你把障碍做了空间索引，查询“附近阻挡”只用毫秒级，再配合网格寻路/动态更新，卡顿消失了。

本篇演示如何用`pathfinding`做 A* 网格寻路，用`rbush`做 2D 空间加速（快速查询附近障碍/单位），并给出从简单到复杂的落地范式。

## 1. 安装

bash

```
npm install pathfinding rbush
```

> 两者均为零依赖、ESM 友好。`pathfinding`负责 A* 等网格算法；`rbush`是 2D R-树，用于快速范围查询。

## 2. 最小上手：网格寻路（A*）

ts

```
import PF from "pathfinding";

// 0 可通行，1 障碍
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
// path: Array<[x,y]>
```

要点：

- `Grid`是可变的，调用`findPath`前习惯性使用`grid.clone()`，避免污染原网格；
- `allowDiagonal`可按需求开启，对应碰撞策略需配套处理。

## 3. 用 rbush 加速“附近障碍”查询

ts

```
import RBush from "rbush";

type Box = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
};
const tree = new RBush<Box>();

// 插入障碍（矩形）
tree.insert({ minX: 4, minY: 4, maxX: 8, maxY: 6, id: "wall-1" });

// 查询与某个范围相交的障碍
const hits = tree.search({ minX: 0, minY: 0, maxX: 5, maxY: 5 });
// 返回落在范围内的障碍列表
```

要点：

- `rbush`适合 2D：用在俯视、平面网格、2D UI 命中；
- 3D 可改用`kdbush`+ 自己做分层，或构建体素网格/区块加速。

## 4. 将障碍投影到网格（构建可通行矩阵）

通常世界坐标是连续值，A* 需要离散网格。做法：把障碍（矩形/多边形）映射到网格，并标记其覆盖的 cell 为阻挡。

ts

```
// 将 RBush 中的轴对齐矩形写入到网格矩阵
function buildGridFromTree(
  tree: RBush<Box>,
  cols: number,
  rows: number,
  cell: number // 单元格边长（世界单位）
) {
  const mat: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );
  // 遍历所有障碍（也可按区块分页）
  for (const b of tree.all()) {
    const minCX = Math.max(0, Math.floor(b.minX / cell));
    const minCY = Math.max(0, Math.floor(b.minY / cell));
    const maxCX = Math.min(cols - 1, Math.floor(b.maxX / cell));
    const maxCY = Math.min(rows - 1, Math.floor(b.maxY / cell));
    for (let cy = minCY; cy <= maxCY; cy++) {
      for (let cx = minCX; cx <= maxCX; cx++) {
        mat[cy][cx] = 1; // 标记为阻挡
      }
    }
  }
  return mat;
}
```

## 5. 综合：从世界坐标寻路（最近可达 cell）

ts

```
import PF from "pathfinding";

function worldToCell(x: number, y: number, cell: number) {
  return { cx: Math.floor(x / cell), cy: Math.floor(y / cell) };
}

function findPathWorld(
  tree: RBush<Box>,
  start: { x: number; y: number },
  goal: { x: number; y: number },
  cols: number,
  rows: number,
  cell: number
) {
  const mat = buildGridFromTree(tree, cols, rows, cell);
  const grid = new PF.Grid(cols, rows, mat);
  const finder = new PF.AStarFinder({
    allowDiagonal: false,
    heuristic: PF.Heuristic.manhattan,
  });

  const s = worldToCell(start.x, start.y, cell);
  const g = worldToCell(goal.x, goal.y, cell);

  // 边界与起终点可达性检查
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));
  s.cx = clamp(s.cx, 0, cols - 1);
  s.cy = clamp(s.cy, 0, rows - 1);
  g.cx = clamp(g.cx, 0, cols - 1);
  g.cy = clamp(g.cy, 0, rows - 1);
  if (grid.isWalkableAt(s.cx, s.cy) === false)
    grid.setWalkableAt(s.cx, s.cy, true);
  if (grid.isWalkableAt(g.cx, g.cy) === false)
    grid.setWalkableAt(g.cx, g.cy, true);

  const path = finder.findPath(s.cx, s.cy, g.cx, g.cy, grid);
  // 将网格路径映射回世界坐标（取 cell 中心）
  const wp = path.map(([cx, cy]) => ({
    x: (cx + 0.5) * cell,
    y: (cy + 0.5) * cell,
  }));
  return wp; // Array<{x,y}>
}
```

## 6. 动态更新：移动障碍/单位避让

- 移动障碍：更新 RBush（`tree.remove()`+`tree.insert()`），按需重建或增量更新局部网格；
- 单位避免拥挤：将“单位占据的圆”近似成方框写入 RBush，寻路时一并纳入障碍；
- 运行时微调：对路径做局部平滑（rubber band / funnel）或使用`allowDiagonal`配合角落碰撞规则。

## 7. 与噪声/体素结合（可选）

- 将`simplex-noise`生成的地形高度阈值化，得到“可通行平面”，再将岩壁/树木写入`rbush`；
- 对于体素世界，按区块在 XZ 平面投影为网格，Y 用层级或“高度窗”处理（如仅在 0..64 寻路）。

## 8. 性能与实践建议

- 空间索引分片：大地图按区块（如 64×64）建立多个 R-树，按需查询活跃区；
- 网格重用：避免每次 new 大网格，复用内存或只更新局部；
- 采样密度：cell 边长越小越精细也越贵，先粗格网找大路，再细格网修正；
- 预平滑：路径出来后做角点简化，减少转折；
- 监控：统计一次寻路耗时、节点扩展数，识别异常地图或参数。

## 9. 附：最小示例（整合）

ts

```
import RBush from "rbush";
import PF from "pathfinding";

// 1) 障碍索引
type Box = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
};
const tree = new RBush<Box>();
tree.insert({ minX: 4, minY: 4, maxX: 8, maxY: 6, id: "wall-1" });

// 2) 构建网格
function buildGridFromTree(
  tree: RBush<Box>,
  cols: number,
  rows: number,
  cell: number
) {
  const mat = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (const b of tree.all()) {
    const minCX = Math.max(0, Math.floor(b.minX / cell));
    const minCY = Math.max(0, Math.floor(b.minY / cell));
    const maxCX = Math.min(cols - 1, Math.floor(b.maxX / cell));
    const maxCY = Math.min(rows - 1, Math.floor(b.maxY / cell));
    for (let cy = minCY; cy <= maxCY; cy++)
      for (let cx = minCX; cx <= maxCX; cx++) mat[cy][cx] = 1;
  }
  return mat;
}

// 3) 寻路（世界坐标 → 网格 → 世界坐标）
function findPathWorld(
  tree: RBush<Box>,
  start: { x: number; y: number },
  goal: { x: number; y: number },
  cols: number,
  rows: number,
  cell: number
) {
  const mat = buildGridFromTree(tree, cols, rows, cell);
  const grid = new PF.Grid(cols, rows, mat);
  const finder = new PF.AStarFinder({ allowDiagonal: false });
  const s = { cx: Math.floor(start.x / cell), cy: Math.floor(start.y / cell) };
  const g = { cx: Math.floor(goal.x / cell), cy: Math.floor(goal.y / cell) };
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));
  s.cx = clamp(s.cx, 0, cols - 1);
  s.cy = clamp(s.cy, 0, rows - 1);
  g.cx = clamp(g.cx, 0, cols - 1);
  g.cy = clamp(g.cy, 0, rows - 1);
  if (!grid.isWalkableAt(s.cx, s.cy)) grid.setWalkableAt(s.cx, s.cy, true);
  if (!grid.isWalkableAt(g.cx, g.cy)) grid.setWalkableAt(g.cx, g.cy, true);
  const path = finder.findPath(s.cx, s.cy, g.cx, g.cy, grid);
  return path.map(([cx, cy]) => ({
    x: (cx + 0.5) * cell,
    y: (cy + 0.5) * cell,
  }));
}

const waypoints = findPathWorld(
  tree,
  { x: 0, y: 0 },
  { x: 10, y: 10 },
  32,
  32,
  1
);
```

## 参考资料

- pathfinding（A* 等）：[https://github.com/qiao/PathFinding.js](https://github.com/qiao/PathFinding.js)
- rbush（R-Tree）：[https://github.com/mourner/rbush](https://github.com/mourner/rbush)
- kdbush（点集 k-d 树）：[https://github.com/mourner/kdbush](https://github.com/mourner/kdbush)
