# NEA 项目 OpenVer

NEA Project OpenVer 是一个针对已停运的 `dao3.fun` 游戏运行时的源代码可用（source-available）保护与兼容项目。它是一个以证据为先的本地实现：被保留的包、脚本运行时行为、MuDB 传输以及权威运行时被作为独立层次保留，而不是视为一个不透明的 Player 二进制文件。

> **OpenVer 范围：** 本仓库包含可发布的实现代码和经过审查的保护证据。私有捕获数据、浏览器状态、凭证、私有地图以及个人存档均保留在本地，绝不会成为开放版本的一部分。

## 从这里开始

| 目标               | 起始文档                                          |
|------------------|-----------------------------------------------|
| 了解仓库结构           | [仓库布局](./docs/repository-layout_zh-cn.md)     |
| 了解运行时边界          | [运行时架构](./docs/runtime-architecture_zh-cn.md) |
| 安全使用开放版本         | [开放版本政策](./docs/open-version_zh-cn.md)        |
| 贡献代码或证据          | [贡献指南](CONTRIBUTING_zh-cn.md)                 |
| 查看 ABI 覆盖范围和已知限制 | `runtime-compat/generated/gap-report.md`      |
| 运行可导入演示          | `demo-map/`                                   |

## 仓库映射

| 路径                                            | 用途                                         |
|-----------------------------------------------|--------------------------------------------|
| `demo-map/`                                   | 参考项目、地图导入器、客户端发布以及本地服务器脚本运行时。              |
| `runtime-compat/`                             | 机器可读的 API/ABI 目录、证据生成器、兼容性报告和一致性测试夹具。      |
| `local-player/`                               | 恢复的 Player 托管、兼容性后端、启动工具以及 Player 端适配器。    |
| `preservation-dump/`                          | 受限的捕获/导出工具。其私有输出保留在忽略路径下。                  |
| `works/`                                      | 公开作品目录；恢复/私有作品源保留在忽略路径下。                   |
| `dao3-docs-mirror/`、`origin/`、`mudb/`、`dump/` | 经审查的文档、传输、捆绑包和历史证据。它们是兼容性结论的输入，而非替代应用程序架构。 |
| `docs/`                                       | 仓库范围的治理、布局和架构文档。                           |
| `tools/`                                      | 小型维护辅助工具，包括必需的补丁包装器。                       |

## 架构

可执行路径有意分层设计：

```text
Project package
-> Client Script Runtime / Server Script Runtime
-> MuDB transport
-> Authoritative Game Runtime
-> Preserved Player browser client
```

兼容性结论由本地声明、历史捆绑包、保留的运行时行为、捕获元数据以及实际脚本使用情况共同生成。当证据缺失时，项目会记录明确的缺口，而不是合成 API。

## 快速开始

前置条件：受支持的 Node.js 运行时、已跟踪的仓库资源，以及首次干净启动时对固定 MuDB 编译器的网络访问。

```powershell
npm --prefix demo-map start