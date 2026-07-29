---
title: "教程：在团队中使用本地私有 NPM 包"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/local-npm-package.html"
---

# 教程：在团队中使用本地私有 NPM 包

本篇面向“团队内部共享的工具库/组件库”，这些库**不对外公开发布**，仅在团队内多个地图/项目之间复用。我们将介绍在不发布到公共 npm 的前提下，如何把本地私有包稳定地接入 ArenaPro 项目。

## 什么时候该用“本地包”？

- 团队内有可复用的`utils`/`ui`/`core`等库，需在多个地图中共享，但不对外公开。
- 希望快速联调与验证，不走对外发布流程。
- 需要在 CI/CD 中实现可复现的安装流程，同时避免将代码上传到公共注册表。

## 方式一：`file:`依赖

当你的包就在邻近目录，直接在项目的`package.json`中通过`file:`指向本地路径即可。

1. 项目结构示例：

```
my-project/              # 你的 ArenaPro 项目
../my-utils/             # 你的本地包（与项目同级的另一个文件夹）
```

1. 在`my-project/package.json`中声明依赖：

json

```
{
  "name": "my-project",
  "type": "module",
  "dependencies": {
    "my-utils": "file:../my-utils"
  }
}
```

1. 安装依赖：

bash

```
npm install
```

安装完成后，`node_modules/my-utils`会成为一个指向`../my-utils`的本地链接（不是下载自网络）。

1. 在代码中使用：

ts

```
// client/src/index.ts
import { clampToRange } from "my-utils";

export function heal(player, amount) {
  const hp = player.getData("hp");
  player.setData("hp", clampToRange(hp + amount, 0, 100));
}
```

- 优点：简单、稳定、适配各种平台；对 CI/CD 也友好。
- 缺点：当你频繁改`../my-utils`的源码时，可能需要重新安装或重启构建进程才能感知到部分更改（与打包器缓存有关）。

> 小技巧：本地包内设置`"sideEffects": false`与 ESM 导出，有助于更好地进行 Tree-Shaking。

## 方式二：`npm pack`+ 安装 tarball

当你需要在“几乎等同发布”的条件下验证包的可用性（例如测试忽略文件、构建产物、exports 字段），可以把本地包“打包”为一个 tarball 并安装。

1. 在本地包目录执行：

bash

```
npm pack
```

它会生成一个类似`my-utils-1.0.0.tgz`的文件。

1. 在项目目录安装该包：

bash

```
npm install ../my-utils/my-utils-1.0.0.tgz
```

- 优点：高度接近真实的 npm 发布行为，最适合发布前自测。
- 缺点：每次改动需要重新打包、重新安装。

## 常见问题排查（FAQ）

- 无法导入：`ERR_MODULE_NOT_FOUND`
  - 检查`exports`、`main`是否指向真实存在的构建产物。
  - 确认`type: "module"`与 ESM 入口一致。
- ESM/CJS 不兼容：`require is not defined`/`Cannot use import statement outside a module`
  - 统一输出为 ESM，或在`exports`同时提供 ESM/CJS，并在项目端优先走 ESM。
- 改了本地包后没有即时生效
  - `file:`方式下：重启构建或重新`npm install`；清理打包器缓存。
  - `npm pack`方式下：需要重新`npm pack`并在项目中重新安装生成的`.tgz`。
- 类型缺失：编辑器提示找不到`.d.ts`
  - 在包的`package.json`中补充`"types": "dist/index.d.ts"`，并确保该文件存在。

## 该选哪一种方式？

- 追求“简单稳定、开箱即用”：选择`file:`依赖。
- 需要接近真实发布的自测流程（含 CI/CD 可复现）：选择`npm pack`+ 安装 tarball。

> 团队分布式协作、目录不在同一机器或需要更完善的访问控制时，可考虑搭建**私有 npm 仓库**（如 Verdaccio / GitHub Packages / GitLab Package Registry），但那属于“私有发布”的路线，不在本文范围内。
