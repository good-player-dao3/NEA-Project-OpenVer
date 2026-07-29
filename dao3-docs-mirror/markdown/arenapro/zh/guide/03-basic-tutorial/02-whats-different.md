---
title: "ArenaPro 与 Arena 有何不同？"
source: "https://docs.dao3.fun/arenapro/zh/guide/03-basic-tutorial/02-whats-different.html"
---

# ArenaPro 与 Arena 有何不同？

你可能已经对标准的神岛引擎（Arena）有了一些了解。ArenaPro 正是构建于其之上，但我们进行了一系列关键的工程化改造，旨在为你提供更现代化、更流畅、更专业的开发体验。

本篇教程将聚焦于其中最核心的两项改进。

## 核心区别一：统一的模块化语法 vs. 混乱的双端标准

在传统的开发模式中，你可能需要时刻“精神分裂”，为客户端和服务端编写不同风格的代码。

- **服务端 (Server)**: 使用 CommonJS (CJS) 语法。javascript`// server/main.tsconst{sayHello}=require("./utils.js");sayHello();`
- **客户端 (Client)**: 却要使用标准的 ES Modules (MJS) 语法。javascript`// client/main.tsimport{ sayHello }from"./utils.js";sayHello();`

在 ArenaPro 中，我们彻底解决了这个问题。**无论是在`client`目录还是`server`目录，你都可以，也应该统一使用 ES Modules (MJS) 语法！**

typescript

```
// 不论在 client/main.ts 还是 server/main.ts
// 语法完全一致！
import { sharedFunction } from "../common/utils.js";

sharedFunction();
```

这意味着：

- ✅**体验统一**：只需掌握`import/export`，即可通用于前后端。
- ✅**代码复用**：可以轻松创建共享的工具模块，在客户端和服务端之间无缝复用。
- ✅**生态友好**：能够自由地使用社区中大量优秀的、基于 ES Modules 的现代 NPM 包。

## 核心区别二：专业的本地化开发 vs. 纯在线浏览器编辑

神岛 Arena 编辑器纯在线、基于浏览器的特性，让它在快速上手和实时共创方面非常便捷。然而，当项目变得复杂时，一套专业的、工程化的本地开发流程会变得至关重要。

ArenaPro 正是为你补齐了这一环。下表清晰地展示了两种开发模式的核心差异：

| 对比维度 | 浏览器在线编辑 (Arena) | 本地化专业开发 (ArenaPro) |
| --- | --- | --- |
| **开发环境** | 依赖浏览器，功能受限 | **VSCode**等任意专业代码编辑器，功能强大、可定制 |
| **网络要求** | 强制全程在线 | **支持离线开发**，仅在同步时需要网络 |
| **核心工具链** | 平台内建功能 | **Git**,**ESLint**,**Prettier**,**断点调试**等行业标准工具 |
| **代码与资产** | 云端存储，版本管理和备份困难 | **本地文件系统**，轻松实现版本控制、备份与迁移 |
| **团队协作** | 实时共创 | 通过**Pull Request**进行规范、异步、可追溯的代码审查 |

**一言以蔽之：ArenaPro 将游戏开发从“在线即兴创作”提升到了“本地严谨工程”的高度。**

## 核心区别三：开放的生态系统 vs. 封闭的开发环境

除了工作流的变革，ArenaPro 还为你带来了更开放、更现代的技术生态。

| 对比维度 | 浏览器在线编辑 (Arena) | 本地化专业开发 (ArenaPro) |
| --- | --- | --- |
| **第三方库** | 无法或极难使用外部库 | **无缝集成 NPM 生态**，自由使用`lodash`,`gl-matrix`等数以万计的现代化工具库。 |
| **资源（资产）引用** | 手动填写资源路径字符串 (Magic String) | **全自动的类型安全**，将资源路径生成为 TS 类型，享受代码补全，告别手滑写错。 |
| **代码质量检查** | 依赖肉眼和人工 | 可集成**ESLint**,**Prettier**等工具，**自动化**地检查代码风格与潜在错误，保证团队代码一致性。 |

这个看似简单的改动，是我们为你扫清工程化障碍、让你能专注于创造的第一步。在后续的教程中，你将体会到更多 ArenaPro 带来的便利。
