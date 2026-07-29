---
title: "教程：使用 Remeda（类型友好的工具库）"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/remeda.html"
---

# 教程：使用 Remeda（类型友好的工具库）

当你需要对数组/对象做映射、过滤、分组、去重、排序等常见操作时，`lodash`很好用；但在 TypeScript 项目里，你可能希望“类型推导更强、管道化（pipeline）更顺手”。

[Remeda](https://remedajs.com/)就是为 TypeScript 而生的实用函数库：

- 轻量、ESM 友好，按需导入，适合 ArenaPro 环境；
- `pipe()`风格让数据流更清晰；
- 强类型推导，链式处理更安全；
- 大量 API 与`lodash`思路接近，迁移成本低。

一个小故事：你要做一个排行榜，把“原始分数”先去掉异常值，再做归一化，然后按分数倒序取前 5 名。结果你写了一堆中间变量：`valid = ...`、`normalized = ...`、`sorted = ...`、`top5 = ...`，来回在文件里滚动找变量定义，还担心类型没跟上。后来你换成 Remeda 的`pipe()`：

ts

```
import { pipe, filter, map, sortBy, take } from "remeda";

const top5 = pipe(
  players,
  filter((p) => p.score > 0),
  map((p) => ({ ...p, score: Math.min(100, p.score) })),
  sortBy([(p) => -p.score]),
  take(5)
);
```

数据从左到右一眼到底，类型一路跟随，再也不用在中间变量里迷路。

本文从浅到深介绍 Remeda 的安装、核心用法、常见场景与迁移建议。

## 1. 安装

bash

```
npm install remeda
```

> Remeda 为 ESM 友好库，ArenaPro 环境可直接按需导入使用。

## 2. 最小上手：`pipe()`与基础操作

ts

```
import { pipe, map, filter } from "remeda";

const input = [
  { id: "p1", score: 70 },
  { id: "p2", score: 50 },
  { id: "p3", score: 90 },
];

const result = pipe(
  input,
  filter((x) => x.score >= 60),
  map((x) => ({ ...x, rank: "pass" as const }))
);

// result: Array<{ id: string; score: number; rank: "pass" }>
```

- `pipe(value, ...ops)`：从左到右依次处理数据，返回最终结果；
- 类型推导贯穿全流程，不需要手动断言。

## 3. 常见实战 10 招

下面选取高频场景，示例均具有良好的类型推导。

### 3.1 分组：`groupBy`

ts

```
import { groupBy } from "remeda";

const players = [
  { id: "a", team: "A" },
  { id: "b", team: "B" },
  { id: "c", team: "A" },
];

const grouped = groupBy(players, (p) => p.team);
// { A: [{...}, {...}], B: [{...}] }
```

### 3.2 去重：`uniqBy`

ts

```
import { uniqBy } from "remeda";

const uniqPlayers = uniqBy([{ id: 1 }, { id: 1 }, { id: 2 }], (p) => p.id);
```

### 3.3 排序与选取：`sortBy`,`minBy`,`maxBy`

ts

```
import { sortBy, maxBy } from "remeda";

const ranked = sortBy(
  [
    { id: "p1", score: 70 },
    { id: "p2", score: 90 },
  ],
  [(x) => -x.score]
);

const top = maxBy(ranked, (x) => x.score); // 推导为 { id: string; score: number } | undefined
```

### 3.4 挑选与剔除：`pick`,`omit`

ts

```
import { pick, omit } from "remeda";

const brief = pick({ id: "p1", hp: 80, pos: [0, 0, 0] }, ["id", "hp"]);
const withoutPos = omit({ id: "p1", hp: 80, pos: [0, 0, 0] }, ["pos"]);
```

### 3.5 累计与折叠：`reduce`

ts

```
import { reduce } from "remeda";

const totalScore = reduce(
  [{ score: 10 }, { score: 20 }],
  (acc, x) => acc + x.score,
  0
);
```

### 3.6 管道组合：`pipe`+ 多步处理

ts

```
import { pipe, filter, map, groupBy } from "remeda";

const groups = pipe(
  [
    { id: "p1", score: 70 },
    { id: "p2", score: 50 },
    { id: "p3", score: 90 },
  ],
  filter((x) => x.score >= 60),
  map((x) => ({ ...x, rank: "pass" as const })),
  groupBy((x) => x.rank)
);
```

### 3.7 安全访问：`getPath`,`setPath`

ts

```
import { getPath, setPath } from "remeda";

const obj = { cfg: { video: { volume: 0.8 } } };
const vol = getPath(obj, ["cfg", "video", "volume"]); // number | undefined

const updated = setPath(obj, ["cfg", "video", "volume"], 1.0);
// 返回新对象，不会修改原对象（不可变友好）
```

### 3.8 条件工具：`when`,`tap`

ts

```
import { pipe, when, tap } from "remeda";

const output = pipe(
  { hp: 90 },
  when(
    (x) => x.hp < 100,
    (x) => ({ ...x, hp: x.hp + 10 })
  ),
  tap((x) => console.log("after:", x))
);
```

### 3.9 谓词与类型守卫（Type Guard）

ts

```
import { isTruthy, filter } from "remeda";

const mixed = ["a", "", null, "b"] as Array<string | null>;
const cleaned = filter(mixed, isTruthy);
// cleaned: string[]
```

### 3.10 与数组方法协作：`toPairs`,`fromPairs`

ts

```
import { toPairs, fromPairs } from "remeda";

const obj = { A: 1, B: 2 };
const pairs = toPairs(obj); // Array<["A"|"B", number]>
const back = fromPairs(pairs);
```

## 4. 与 lodash-es 的迁移建议

- 命名与语义：很多 API 与 lodash 接近，但参数顺序/返回不可变等细节可能不同，阅读官方文档很重要；
- 建议逐模块替换：在新代码中直接使用 Remeda；旧代码保持 lodash-es，分阶段迁移；
- 使用`pipe()`代替链式调用，避免中间变量，提升可读性与类型连贯性。

迁移对比（示例）：

ts

```
// lodash-es
import { chain } from "lodash-es";
const result1 = chain(arr).filter(p).map(m).groupBy(g).value();

// remeda
import { pipe, filter, map, groupBy } from "remeda";
const result2 = pipe(arr, filter(p), map(m), groupBy(g));
```

## 5. ArenaPro 场景示例

- 排行榜构建：过滤无效分数 → 评分归一化 → 排序 → 取 Top N；
- 任务系统：按类型分组 → 统计进度 → 选择下一步目标；
- 资源清单：汇总/去重/合并配置 → 生成可视化表格或导出。

ts

```
import { pipe, filter, map, sortBy, take } from "remeda";

type Player = { id: string; score: number };

const top5 = pipe(
  [
    { id: "p1", score: 70 },
    { id: "p2", score: 0 },
    { id: "p3", score: 90 },
  ] as Player[],
  filter((p) => p.score > 0),
  map((p) => ({ ...p, score: Math.min(100, p.score) })),
  sortBy([(p) => -p.score]),
  take(5)
);
```

## 6. 性能与注意事项

- Remeda 基于不可变思路，链式处理会创建新对象/数组；在高频路径（如每帧 tick）应评估成本；
- 充分利用按需导入与 ESM Tree-shaking，避免无意引入整库；
- 与 Zod 配合：先在 IO 边界用 Zod 校验/转换，再用 Remeda 做业务层整理，职责清晰。

## 7. 常见问题（FAQ）

- 需要 polyfill 吗？
  - Remeda 基于现代 JS/TS，通常不需要额外 polyfill。确保你的构建目标与运行环境兼容。
- 和 lodash-es 二选一？
  - 不必强制统一。新代码优先用 Remeda，旧代码逐步迁移即可。
- 与`Array.prototype`的 map/filter 有何优势？
  - `pipe()`组合可读性更高，类型推导在多步链路中更稳健；大量对象操作/分组/选择等 API 更丰富。

## 8. 参考资料

- Remeda 官方网站与文档：[https://remedajs.com/](https://remedajs.com/)
- lodash-es 文档：[https://lodash.com/](https://lodash.com/)
