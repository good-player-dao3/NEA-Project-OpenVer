---
title: "ArenaPro 脚手架文件结构"
source: "https://docs.dao3.fun/arenapro/zh/dao3Cfg/file.html"
---

# ArenaPro 脚手架文件结构

## 项目结构总览

ArenaPro 创建的项目结构如下，清晰分离了服务端、客户端和共享代码：

```
myArenaProject/
├── 核心配置文件
│   ├── dao3.config.json      # 项目主配置文件
│   ├── package.json          # npm依赖管理
│   ├── .prettierrc           # 代码格式化配置
│   ├── .prettierignore       # 格式化忽略配置
│   └── eslint.config.mjs     # 代码检查配置
│
├── 服务端代码
│   ├── server/
│   │   ├── tsconfig.json     # TypeScript配置
│   │   ├── webpack.config.js # 构建配置
│   │   ├── types/            # 类型定义
│   │   │   ├── GameAPI.d.ts  # 服务端API类型
│   │   │   ├── GameEntity.d.ts
│   │   │   └── GamePlayerEntity.d.ts
│   │   └── src/
│   │       └── App.ts        # 服务端入口
│   │
├── 客户端代码
│   ├── client/
│   │   ├── tsconfig.json     # TypeScript配置
│   │   ├── webpack.config.js # 构建配置
│   │   ├── types/
│   │   │   └── ClientAPI.d.ts # 客户端API类型
│   │   └── src/
│   │       └── clientApp.ts   # 客户端入口
│   │
├── 共享代码
│   ├── shares/
│   │   └── sharesApp.ts      # 客户端服务端共享代码
│   │
└── 开发工具配置
    ├── .vscode/              # VSCode配置
    │   ├── dao3-ap.code-snippets # 代码片段
    │   ├── mcp.json          # MCP配置
    │   └── launch.json       # 调试配置
    └── .husky/               # Git钩子
        ├── pre-commit        # 提交前检查
        └── ...               # 其他Git钩子脚本
```

## 文件保护说明

### ⚠️ 禁止移动或改名的文件

以下文件**禁止移动/改名**，否则可能导致项目无法正常运行：

1. **`GameAPI.d.ts`**- 服务端 API 类型定义
2. **`ClientAPI.d.ts`**- 客户端 API 类型定义
3. **`tsconfig.json`**- TypeScript 编译配置
4. **`package.json`**- npm 包管理配置
5. **`dao3.config.json`**- ArenaPro 核心配置
6. **`.gitignore`**- Git 忽略配置
7. **`webpack.config.js`**- 打包构建配置
8. **`.prettierrc`**- 代码格式化规则
9. **`.prettierignore`**- 格式化忽略规则
10. **`eslint.config.mjs`**- 代码检查规则

### ⚠️ 严禁修改的关键文件

以下文件**严禁修改/移动**，因为包含自动更新机制，任何自定义更改可能导致数据丢失：

- **`GameAPI.d.ts`**
- **`ClientAPI.d.ts`**

> **注意**：这些文件与 Arena 脚本编辑器内置的`.d.ts`文件有所不同，ArenaPro 专为 TypeScript 定制了更完善的类型声明，提供更精准的代码提示和类型检查。

## 文件目录说明

### 核心目录

- **`server/`**: 服务端代码，包含地图核心逻辑
- **`client/`**: 客户端代码，包含 UI 和玩家交互
- **`shares/`**: 共享代码，可被服务端和客户端共同引用

### 配置文件

- **`dao3.config.json`**: ArenaPro 核心配置文件，控制编译和上传行为
- **`tsconfig.json`**: TypeScript 编译配置，分别位于 server 和 client 目录
- **`webpack.config.js`**: 打包配置，控制代码打包和优化
