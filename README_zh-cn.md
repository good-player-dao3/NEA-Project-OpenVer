# NEA 项目 OpenVer

NEA Project OpenVer 是一个针对已停运的 `dao3.fun` 游戏运行时的源代码可用（source-available）保护与兼容项目。它是一个以证据为先的本地实现：被保留的包、脚本运行时行为、MuDB 传输以及权威运行时被作为独立层次保留，而不是视为一个不透明的 Player 二进制文件。

> **OpenVer 范围：** 本仓库包含可发布的实现代码和经过审查的保护证据。私有捕获数据、浏览器状态、凭证、私有地图以及个人存档均保留在本地，绝不会成为开放版本的一部分。

## 从这里开始

| 目标 | 起始文档                                     |
| --- |------------------------------------------|
| 了解仓库结构 | [仓库布局](docs/repository-layout_zh-cn.md)  |
| 了解运行时边界 | [运行时架构](docs/runtime-architecture_zh-cn.md)    |
| 安全使用开放版本 | [开放版本政策](docs/open-version_zh-cn.md)           |
| 贡献代码或证据 | [贡献指南](CONTRIBUTING_zh-cn.md)                  |
| 查看 ABI 覆盖范围和已知限制 | `runtime-compat/generated/gap-report.md` |
| 运行可导入演示 | `demo-map/`                              |

## 仓库映射

| 路径 | 用途 |
| --- | --- |
| `demo-map/` | 参考项目、地图导入器、客户端发布以及本地服务器脚本运行时。 |
| `runtime-compat/` | 机器可读的 API/ABI 目录、证据生成器、兼容性报告和一致性测试夹具。 |
| `local-player/` | 恢复的 Player 托管、兼容性后端、启动工具以及 Player 端适配器。 |
| `preservation-dump/` | 受限的捕获/导出工具。其私有输出保留在忽略路径下。 |
| `works/` | 公开作品目录；恢复/私有作品源保留在忽略路径下。 |
| `dao3-docs-mirror/`、`origin/`、`mudb/`、`dump/` | 经审查的文档、传输、捆绑包和历史证据。它们是兼容性结论的输入，而非替代应用程序架构。 |
| `docs/` | 仓库范围的治理、布局和架构文档。 |
| `tools/` | 小型维护辅助工具，包括必需的补丁包装器。 |

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
```

随后默认演示可通过以下地址访问：

```text
http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008
```

该命令必须保持运行：它会同时启动服务器脚本运行时和 Player 兼容性后端。单独启动 `local-player/backend/box3-server.cjs` 仅提供 Player 外壳，不会运行地图脚本。如需干净克隆的演练、预期日志、端口冲突恢复以及能力清单故障排除，请参阅[冷启动指南](docs/cold-start.md)。

如需验证仓库，请在准备就绪后运行以下文档化的包命令：

```powershell
npm --prefix runtime-compat run build
npm --prefix runtime-compat test
npm --prefix demo-map run build
npm --prefix demo-map test
```

## 当前兼容性状态

- 客户端和服务器脚本运行时是独立的执行领域，具有声明的传输边界。
- 当前的本地 ABI 和兼容性分类在 `runtime-compat/abi/` 和 `runtime-compat/generated/` 下生成。
- 运行时创建的实体只能通过经过捕获和验证的网格绑定来投影；未知网格将保持脚本本地，而不会接收合成的几何体。
- 历史状态下的体型值，若无本地证据，则保持为 `null`；运行时会保留当前碰撞器，而不是猜测尺寸。

## 社区

- GitHub 开放版本仓库：<https://github.com/ForgottenArch/NEA-Project-OpenVer>
- QQ 群？**???? - dao4.fun ??????**：<https://qm.qq.com/q/Mixf3L5xeO>

请勿在议题、拉取请求或群组中发布浏览器配置文件、Cookie、凭证、含令牌的 URL、私有地图或私有捕获数据。

## 许可证

本仓库根据 [PolyForm Noncommercial License 1.0.0](LICENSE.md) 提供源代码可用形式。该许可证不允许商业使用。