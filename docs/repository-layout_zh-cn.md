# 仓库布局

本仓库包含可执行的兼容性代码以及历史保护证据。保留现有顶级目录是因为包脚本、生成的报告和证据记录直接引用其路径。因此，仓库清理意味着改进导航、所有权和发布边界，而不是盲目移动证据。

## 活动实现

| 路径 | 职责 | 验证 |
| --- | --- | --- |
| `demo-map/` | 地图导入器、服务器脚本运行时、演示项目、客户端脚本发布、物理原型 | `npm --prefix demo-map test` |
| `runtime-compat/` | 机器可读的 API/ABI、证据生成器、兼容性报告、一致性测试 | `npm --prefix runtime-compat test` |
| `local-player/` | 恢复的 Player 托管、兼容性后端、启动器、Player 端适配器 | `npm --prefix local-player test`（如适用） |
| `preservation-dump/` | 实时捕获和编辑器导出工具 | 单独的 `node --check` 和自测 |
| `works/` | 恢复作品和导入开发夹具的本地目录 | 私有作品内容保持忽略 |
| `docs/` | 仓库范围的布局、架构、冷启动指南和开放版本政策 | 文档审查 |
| `tools/` | 小型 Windows 安全维护辅助工具 | 工具特定检查 |

新的可执行行为通常应属于这些目录之一。不要在仓库根目录创建另一个运行时或 Player 实现。

## 保留的证据

| 路径 | 分类 | 规则 |
| --- | --- | --- |
| `dao3-docs-mirror/` | 公共文档镜像 | 通过其现有工具重新生成；不要手动编辑生成的页面，除非记录原因。 |
| `origin/` | 恢复的服务器/运行时证据 | 仅作为证据；不要将其作为新架构。 |
| `mudb/` | 历史传输源代码 | 保留上游结构和本地来源。 |
| `dump/` | 经过审查的恢复资产和私有实时捕获 | 永远不要提交 `dump/private/`；在跟踪新公共资产之前进行审计。 |

被忽略的本地文件夹如 `Lokibox/` 和 `box-go/` 是操作员/参考工作树，不属于 OpenVer 仓库约定。切勿发布或提交它们。

## 生成和本地输出

- 当兼容性报告是审查或测试使用的确定性输出时，提交到 `runtime-compat/generated/`。
- 将演示构建输出保留在 `demo-map/build/` 下；它保持忽略且可重建。
- 将日志、PID 文件和操作员输出保留在 `.workspace/` 下；该目录保持忽略。
- 将用户拥有的 `NEA-Project.7z` 保留在根目录并忽略。切勿修改、删除、解压覆盖仓库或提交它。
- 仅将浏览器配置文件、Cookie、OAuth 令牌、私有地图和含有令牌的 URL 保留在现有的忽略私有位置。
- 将恢复的作品导出保留在 `works/private/<work-id>/` 下；保留其原始捕获路径作为不可变的来源。
- 将公共仓库政策保留在 `docs/open-version.md` 下；在推送到 OpenVer 远程之前使用它。

## 命名规则

- 使用 `docs/` 存放仓库范围的文档。
- 使用每个包自己的 `docs/`、`test/`、`tools/` 和生成输出约定来存放特定于包的材料。
- 不要添加含糊的根目录，如 `new`、`backup`、`temp` 或 `final`。
- 按来源和用途命名证据；按运行时职责命名实现。

## 工作区清理

预览临时日志收集：

```powershell
.\tools\organize-workspace.ps1
```

仅将仓库根目录、`demo-map/` 和 `local-player/` 中的根级临时文件移动到 `.workspace/logs/`：

```powershell
.\tools\organize-workspace.ps1 -Apply
```

该辅助工具不会递归、删除文件、触及私有捕获或移动源代码和证据目录。
如果活动进程引用了 `demo-map/` 或 `local-player/`，它也会跳过这些目录，并保留单独锁定的文件。在收集这些日志之前停止相关服务；`-IncludeActiveLocations` 仅用于有意识的手动覆盖。