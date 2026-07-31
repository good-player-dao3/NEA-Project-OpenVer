---
title: "模块化：import / export"
source: "https://docs.dao3.fun/arena/javascriptEntry/06-advanced-topics/05-06-modules.html"
---

# 模块化：import / export

模块让代码组织清晰、依赖显式、便于复用与打包。

javascript

```
// math.js
export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;

// main.js
import { add, PI } from "./math.js";
console.log(add(2, 3), PI);
```

注意：

- 使用相对路径或别名路径；
- 在浏览器中需配合构建工具或设置`type="module"`；
- 默认导出：`export default`，导入使用自定义名称。

## 命名导出 vs 默认导出

javascript

```
// utils.js
export function clamp(x, min, max) {
  return Math.min(max, Math.max(min, x));
}
export const EPS = 1e-6;
export default function lerp(a, b, t) {
  return a + (b - a) * t;
}

// main.js
import lerp, { clamp, EPS } from "./utils.js";
```

要点：

- 默认导出每个模块仅一个；导入时可自定义名称。
- 命名导出可有多个；必须用相同名称导入（或`as`重命名）。

## 重导出与命名空间导入

javascript

```
// math/index.js
export { add } from "./add.js";
export { sub as minus } from "./sub.js";
export * from "./vector.js";

// 统一导入
import * as MathX from "./math/index.js";
console.log(MathX.add(1, 2), MathX.minus(3, 1));
```

## 模块作用域与“实时绑定”（live bindings）

- 模块顶层即模块作用域，默认是严格模式；
- 导出的是“绑定”而非值的快照：如果导出变量在模块内改变，导入方读取到的新值会更新。

javascript

```
// counter.js
export let count = 0;
export function inc() {
  count++;
}

// app.js
import { count, inc } from "./counter.js";
console.log(count); // 0
inc();
console.log(count); // 1（live binding）
```

## 浏览器中使用 ESM 与打包工具

浏览器：

- 需`<script type="module" src="/main.js"></script>`；
- 路径需要带扩展名（如`./utils.js`）；
- 同源策略与 CORS 需正确配置。

打包工具（Vite/Webpack/Rollup）：

- 支持别名路径、按需编译转译、Polyfill；
- 生产构建会做代码分割、压缩与缓存优化。

## Tree-shaking 提示

- 使用 ESM 静态导入（`import { x } from`）有利于摇树优化；
- 避免在导入后通过对象聚合暴露所有方法（影响静态分析）；
- 导出未使用的符号会在生产构建中被移除（取决于工具配置）。

## 常见陷阱

- 在浏览器直接使用相对路径但遗漏`.js`扩展名会 404；
- 循环依赖可能导致导入为`undefined`或部分初始化，需拆分依赖；
- 默认导出与命名导出混淆，导致导入写法出错；
- 在 Node 中使用 ESM 需设置`"type": "module"`或使用`.mjs`扩展名（取决于环境）。

## 最佳实践

- 一个模块只承担一个清晰职责；
- 优先使用命名导出，默认导出保留给模块“主功能”；
- 统一导出入口（index.js）收敛对外 API；
- 在大型项目中配合 TS/ESLint 做导出/导入检查。

## 练习

1. 将分散在多个文件的工具函数重构为`utils/`模块目录，并通过`utils/index.js`统一导出。
2. 编写一个`counter`模块并在多个导入方中共享（验证 live binding）。
3. 在浏览器使用`type="module"`引用模块，体验路径与 CORS 要求。
