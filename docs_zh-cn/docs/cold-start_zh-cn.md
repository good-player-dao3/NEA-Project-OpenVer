# 冷启动指南

本指南从干净检出版本开始运行完整的公共运行时。它不使用私有捕获数据、派生地图包、浏览器配置文件、凭证或忽略的私有工作区下的文件。

## 1. 前置条件

- Windows PowerShell、PowerShell 7 或其他能够运行 Node.js 命令的 Shell。
- Node.js 可用作 `node`，npm 可用作 `npm`。
- 包含 `demo-map/`、`local-player/` 和 `runtime-compat/` 的完整检出版本。
- 首次干净启动时需要网络访问，以便将固定的 MuDB TypeScript 工具链安装到忽略的 `tools/.mudb-toolchain/` 目录中。

确认工具：

```powershell
node --version
npm --version
```

公开的 OpenVer 检出版本可通过以下命令克隆：

```powershell
git clone https://github.com/ForgottenArch/NEA-Project-OpenVer.git
cd NEA-Project-OpenVer
```

针对完整仓库的团队开发使用 `Beta` 分支：

```powershell
git clone --branch Beta https://github.com/ForgottenArch/NEA-Project.git
cd NEA-Project
```

## 2. 确认冷启动

默认运行时使用 TCP 端口 `4322` 和 `4323`。检查是否有旧进程占用它们：

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
Where-Object LocalPort -in 4322,4323
```

如果较早的 NEA 进程仍在运行，请返回其终端并按 `Ctrl+C`。不要仅因为占用相同端口就终止未知进程；请先检查：

```powershell
Get-CimInstance Win32_Process |
Where-Object ProcessId -in (Get-NetTCPConnection -State Listen |
Where-Object LocalPort -in 4322,4323).OwningProcess |
Select-Object ProcessId,CommandLine
```

## 3. 启动完整运行时

在仓库根目录下运行此命令：

```powershell
npm --prefix demo-map start
```

保持该终端打开。该命令会同时启动以下各层：

1. 项目导入器和能力清单启动门控。
2. 服务器脚本运行时。
3. 权威运行时/控制桥接。
4. Player 兼容性后端和 MuDB 传输。
5. 已发布的客户端脚本和 UI 包。

在这些层启动之前，npm 会运行 `prestart` 钩子。干净检出版本包含供应商提供的 MuDB TypeScript 源文件，但未生成 `mudb/schema/index.js` 或 `mudb/stream/index.js`，因此钩子会安装固定的编译器并仅生成这些必需的层。后续启动时，如果输出仍为最新，则跳过此步骤。

正常游玩时请勿直接启动 `local-player/backend/box3-server.cjs`。该命令仅启动 Player/后端层，而缺少服务器脚本运行时编排。

## 4. 预期输出

成功的冷启动应包含类似于以下的行：

```text
[demo] Script Runtime started for demo project
[demo] Player: http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008
[player] muwebsocket server listening: ... port 4322
[player] [nea-control] listening on 127.0.0.1:4323
```

打开启动器打印的确切 `[demo] Player:` URL。对于受跟踪的参考项目，当前为：

```text
http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008
```

启动器输出对于导入的运行时包具有权威性；请勿重复使用其他运行的旧路由。

## 5. 兼容性警告

启动日志可能报告 `project uses partial compatibility surfaces`。如果运行时继续运行并打印 Player URL，则此为信息性提示。部分表面具有可执行的本地绑定，但保留有记录的本地行为缺口。

`Project launch blocked by unavailable capabilities` 则不同：进程退出，因为项目需要的能力没有安全的本地实现，或者静态分析无法证明依赖关系。在更改门控之前，请阅读列出的 `side:module:usage` 条目和生成的项目能力清单。请勿绕过门控或伪造 API。

## 6. 常见故障

### 端口 4322 或 4323 上的 `EADDRINUSE`

旧运行时仍然活跃。如第 2 节所示检查占用进程，仅停止已确认的旧 NEA 进程，然后重新运行标准启动命令。

### 页面打开但脚本不运行

检查终端命令。如果只运行了 `box3-server.cjs`，请停止它并使用：

```powershell
npm --prefix demo-map start
```

仅靠 Player HTML 并不能证明服务器脚本运行时正在运行。

### `Cannot find module '../../mudb/schema'`

更新到包含 `tools/build-mudb.mjs` 和 `demo-map` 的 `prestart` 钩子的修订版本。在仓库根目录下再次运行标准命令：

```powershell
npm --prefix demo-map start
```

首次运行时，允许 npm 下载固定的 TypeScript 工具链。请勿提交 `tools/.mudb-toolchain/` 或生成的 MuDB JavaScript 输出。

### 能力清单阻止了继承的 UI 成员

更新到包含 UI 所有者继承修复的修订版本。`UiText`、`UiInput`、`UiBox`、`UiImage` 和 `UiScrollBox` 继承其声明的 `UiRenderable` 和 `UiNode` 成员；诸如 `anchor`、`position` 和 `size` 等字段不得报告为未知的脚本 API。

### 普通浏览器请求中 WebSocket `/ws` 返回 404

`/ws` 端点需要 WebSocket 升级。返回 404 的普通 HTTP GET 并不意味着 MuDB WebSocket 监听器已损坏。请验证启动日志并改为加载 Player 路由。

## 7. 停止运行时

在运行 npm 的终端中按：

```text
Ctrl+C
```

等待两个端口都关闭后再启动另一个实例。启动器拥有子后端，应能完全关闭整个链条。