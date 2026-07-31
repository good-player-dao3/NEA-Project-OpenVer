# NEA 项目代理交接文档

最后更新：2026-07-29

## 使命

充分保存已停运的 dao3.fun / Box3 风格游戏平台，以便旧地图创作者可以将他们导出的地图、脚本、UI、资源和配置导入到一个自托管的替代平台中，让访客可以游玩。

这不仅是一个网站克隆。所需系统包括：

- 兼容的 Player。
- 地图导入格式和导入器。
- 服务器脚本运行时。
- 客户端脚本运行时。
- 服务器和客户端 API/ABI 兼容性。
- 远程通道消息传递。
- UI、资源、实体、体素、物理、碰撞和复制。

## 工作要求风格

- 在使用上游 Git 仓库之前，先研究本地文件和已保留的运行时证据。
- 不要用不相关的架构重新启动项目。
- 在修改代码之前阅读现有实现和测试。
- 修复根本原因，而不是为单个演示地图硬编码行为。
- 将服务器脚本和客户端脚本视为独立的必需运行时。
- 为 ABI 结论记录证据和置信度。
- 使用简短、有边界的命令。避免伪造的后台进程阻塞终端数分钟。
- 长时间提取作业必须设置检查点并可恢复。
- 在运行工具之前说明立即操作。
- 绝不提交 Cookie、OAuth 令牌、浏览器配置文件、私有转储或含有令牌的 URL。

## 仓库状态

- 工作区：`D:\Projects\Gaming\NEA-Project`
- 分支：`beta`，跟踪 `origin/Beta`
- 用户允许替换远程 Beta 分支内容，但本地保留证据不得删除。
- `NEA-Project.7z` 属于用户。请勿修改、删除或提交它。
- `dump/private/` 被 Git 忽略，包含机密捕获数据。
- `origin/third-party/` 包含本地参考克隆，被 Git 忽略。
- 未经用户明确批准，不得运行破坏性 Git 或递归文件系统命令。

## 仓库映射

### `local-player/`

历史 Player 资产、本地托管、浏览器协议研究、Player 适配器和兼容性代码。

### `runtime-compat/`

主要 API/ABI、协议、对象模型、物理、碰撞、兼容性矩阵、证据、生成和一致性测试工作区。

从以下内容开始：

- `runtime-compat/package.json`
- `runtime-compat/abi/current-runtime.json`
- `runtime-compat/abi/client-runtime.json`
- `runtime-compat/abi/server-runtime.json`
- `runtime-compat/abi/protocols.json`
- `runtime-compat/abi/compatibility-matrix.json`
- `runtime-compat/generated/gap-report.md`
- `runtime-compat/generated/phase-5-audit.md`

### `demo-map/`

用于导入格式、服务器运行时、客户端运行时、事件、UI、物理和远程消息传递的测试项目。

从以下内容开始：

- `demo-map/docs/map-import-format.md`
- `demo-map/docs/script-runtime.md`
- `demo-map/project/nea.map.json`
- `demo-map/project/scripts/server.js`
- `demo-map/project/scripts/client.js`
- `demo-map/src/server.mjs`

### `preservation-dump/`

最后一天的在线保护工具。默认输出为私有。

- `authorize-arenapro.mjs`：ArenaPro OAuth 辅助程序。
- `start-live-dump.ps1`：独立的 Edge 和 CDP 捕获启动器。
- `capture-cdp.mjs`：网络、WebSocket、源代码、DOM、存储和运行时捕获。
- `export-editor-scripts.mjs`：直接读取 React `codeEditorController.getFileList()`，无需切换 UI。
- `export-editor-project.mjs`：导出项目状态、物理、实体、UI、体素索引、资源、权限、运行时桥接和声明。
- `analyze-exported-scripts.mjs`：盘点真实地图 API 使用情况和远程通道消息类型。

### 其他证据

- `dao3-docs-mirror/`：开发者 API 文档镜像。
- `origin/`：历史服务器复现和恢复的源代码。
- `Lokibox/`：私有本地 Player/运行时证据。请勿上传。
- `D:\Projects\Gaming\hunter-code` 可能不存在于此英文名称下。实际的外部目录是用户先前提供的中文名称历史代码目录。它仅作为证据，不得定义新架构。

## 已保留的在线地图

授权编辑器 URL：

```text
https://dao3.fun/edit/773d55351c932c918ca0
```

编辑哈希不是公共游玩哈希。将 `/edit/` 替换为 `/play/` 会返回 404。

私有捕获目录模式：

```text
dump/private/live-captures/<timestamp>
```

从编辑器运行时状态恢复：

- 40 个服务器脚本。
- 23 个客户端脚本。
- 约 1.54 MB 的脚本源代码。
- 在编辑器文件状态中，只有 `script_6.js`、`script_11.js` 和 `script_12.js` 为空。
- 约 1.03 MB 的项目/运行时快照数据。
- 约 454 KB 的运行时服务器 TypeScript 声明。
- 此地图使用了 57 个服务器 API 成员。
- 此地图使用了 17 个客户端 API 条目。
- 多种服务器到客户端和客户端到服务器的远程通道消息类型。

重要私有输出：

```text
manual-cdp/source/server/
manual-cdp/source/client/
manual-cdp/project/project.json
manual-cdp/project/extra-project-info.json
manual-cdp/project/runtime-bridge.json
manual-cdp/project/server-declarations.d.ts
manual-cdp/analysis/script-abi-usage.json
manual-cdp/analysis/script-abi-usage.md
```

请勿提交私有地图。将发现转化为经过脱敏的 ABI 证据、测试夹具、测试和文档。

## ArenaPro 证据

本地参考克隆：

```text
origin/third-party/ArenaPro-CLI
origin/third-party/ArenaPro-Creator
```

已确认发现：

- OAuth 端点：`https://dao3.fun/oauth2.0`
- 授权编辑器格式：`edit/<editHash>?token=<Authorization>`
- 服务器脚本类型：`0`
- 客户端脚本类型：`1`
- 脚本保存端点：`https://code-api-pc.dao3.fun/open/script/save-or-update`
- 常见捆绑包名称：`_server_bundle.js` 和 `_client_bundle.js`
- 客户端声明：`origin/third-party/ArenaPro-CLI/client/types/ClientAPI.d.ts`
- 服务器声明：`origin/third-party/ArenaPro-CLI/server/types/GameAPI.d.ts`

这些仓库是证据，而非运行时依赖。

## 已确认的运行时架构

编辑器 React 树暴露了一个完整的编辑器/游戏实例，包含：

- `codeEditorController`
- `replica`
- `rpc`
- `publish`
- `editContentStorage`
- `_game`

`codeEditorController` 暴露：

- `getFileList()`
- `getSelectedFile()`
- `selectFile()`
- `fileDictReplica`
- `serverDeclarations`
- Monaco 集成

嵌入式游戏引擎暴露：

- `clientScript`
- `remoteChannel`
- `gameUI`
- `input`
- `player`
- `voxel`
- `chat`
- `navigator`
- `rtc`
- `gui`
- `resourceController`
- `net`

客户端脚本是必需的。恢复的地图使用了 UI 构造函数、指针锁定、屏幕事件、客户端远程通道监听器和 `sendServerEvent`。

服务器脚本大量使用世界事件、实体查询、体素读/写、存储、`sendClientEvent` 和服务器远程通道监听器。

## 当前阶段

当前任务是将新保留的真实地图证据映射到 Player 和运行时兼容性模型中。

推荐顺序：

1. 阅读本文档和根目录 `README.md`。
2. 检查 `git status`，不要覆盖用户文件。
3. 阅读当前的缺口报告和阶段审计。
4. 将私有 `script-abi-usage.json` 与 `runtime-compat/abi/current-runtime.json` 进行比较。
5. 生成本地运行时中缺失的真实地图需求的优先级列表。
6. 实现最高优先级的客户端运行时、远程通道和 UI 缺口。
7. 从恢复的行为构建经过脱敏的一致性测试夹具。
8. 将真实的 `project.json` 结构映射到演示地图导入格式。
9. 继续碰撞、Player 身体、OBB/AABB、接触事件、姿态和物理复制工作。

## 阶段验收标准

- 存在真实地图 API 兼容性缺口报告。
- 存在双向客户端/服务器远程通道一致性测试。
- 本地运行时同时执行一个服务器脚本和一个客户端脚本。
- 客户端脚本可以创建 UI、接收客户端事件并发送服务器事件。
- 服务器脚本可以接收事件并向目标或广播发送客户端事件。
- 演示可见地包含由客户端脚本控制的 UI，而非后端硬编码。
- 导入器读取恢复的 `project.json` 的核心字段，并报告不受支持的字段。
- 物理和碰撞缺口由测试表示，而不仅仅是视觉调整。

## 首个推荐任务

使用恢复的 `script-abi-usage.json`、ArenaPro API 声明和当前 `runtime-compat` ABI 生成真实地图兼容性缺口报告。选择最高优先级的缺失客户端 `remoteChannel` 和 UI 行为，实现它，并添加一致性测试。不要重写整个 Player，也不要在不相关的前端样式上花费时间。