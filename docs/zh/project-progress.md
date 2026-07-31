# 项目进度（中文摘要）

详细、可供 AI 直接执行的实时进度以 `../project-progress.md` 为准。

## 当前阶段

### M1：真实地图导入和脚本运行闭环

目标是让真实地图的客户端脚本和服务端脚本在本地运行，并对尚未支持的 API 明确报告，而不是猜测实现。

## 当前任务

- `RT-001`：生成真实地图 ABI 缺口报告。
- `RT-002`：选择一个客户端 remoteChannel/UI 行为完成最小闭环。

## 仓库整理原则

- 先整理导航和文档职责，不先移动目录。
- `Evidence/origin/`、`Shared/mudb/`、`Evidence/dao3-docs-mirror/`、`Evidence/dump/` 是证据或历史输入。
- `dump/private/`、`works/private/`、`.workspace/`、本地参考工作树和压缩包保持本地，不发布、不移动。
- 运行时代码变更必须有针对性测试或明确的阻塞记录。

## 可维护性整理

- 生成的 ABI、报告和缓存文件很大，但不应当直接当作业务代码重构。
- 第一重构目标是 `Backend/local-player/backend/box3-server.cjs`，需要按边界逐步拆分，不能整文件重写。
- 后续再处理 `demo-map` 的运行时和能力清单模块。
- 每次只拆一个职责，并配套验证，避免大范围重构引入新问题。
