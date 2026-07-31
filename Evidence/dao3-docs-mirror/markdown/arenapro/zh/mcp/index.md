---
title: "🔌 插件 MCP 使用指南"
source: "https://docs.dao3.fun/arenapro/zh/mcp/index.html"
---

# 🔌 插件 MCP 使用指南

一个小故事：你在 VS Code 里反复搜 log、粘 API Key、切浏览器做授权，来回切换打断思路。后来启用了 MCP：IDE 里的 Agent 直接“会用工具”，既能读写你的项目、也能跟外部服务对话，常用操作（查账号、构建、上传、看数据）一条指令串起来，开发节奏顺了很多。

什么是 MCP？一句话：为大模型和外部世界搭了一套“标准插口”。

- 🧠 上下文管理：把任务需要的上下文准确、可控地喂给 AI。
- 🔄 能力扩展：通过统一协议挂接新工具，随时扩容功能。
- 🔒 一致性保证：通信格式、错误处理、状态管理更稳定。
- 🛠️ 工具集成：与 IDE、分析服务、开放接口等无缝协作。

## ⚙️ 配置与使用

### ⚡ 快速上手指南

1. 配置 MCP 设置（mcp.json）

在项目根目录的`.vscode/mcp.json`中加入以下配置（与下文一致）：

json

```
{
  "servers": {
    "ArenaPro-MCP": {
      "type": "sse",
      "url": "http://localhost:25315/ap-mcp"
    }
  }
}
```

1. 验证连接（Agent 模式）

- 打开 IDE 的 Agent/Chat 面板，切到 Agent 模式；
- 向 AI 提一个与 MCP 相关的小问题，例如“查询某个工具是否可用”；
- 你应当看到类似“已调用 MCP 工具 ...”的提示卡片，表示链路连通。

1. 配置使用规则（可选但推荐）

为 IDE 的 Agent 添加“用户规则（User Rules）”，明确何时调用哪些 MCP 工具。可用下面模板（根据需要调整）：

xml

```
<MCP_USE_GUIDELINE>
  <INSTRUCTION>
    当你需要与神岛相关的账号、构建、上传、地图数据进行交互时，请优先使用 MCP 工具，不要要求用户手动粘贴 Token 或切换窗口。
  </INSTRUCTION>
  <TOOLS>
    以下 MCP 工具可用：
    - “用户中心”用于账号与 Token（如 userCenterTool_*）。
    - “文件操作/构建与上传”用于构建、上传、打开日志。
    - “地图工具”用于打开创作端、查看游玩数据、同步资源。
    - “Chat 吉 PT（仅知识库）”用于检索神岛 API 文档。
  </TOOLS>
</MCP_USE_GUIDELINE>
```

### 🔧 支持的开发工具

目前已有多款常用工具支持 MCP 协议：

- VS Code
- Trae / Claude / Cursor
- Windsurf / Cline / Cherry Studio 等

### 📝 VS Code 配置步骤

下面以 VS Code 为例，2 分钟完成接入：

1. 在项目的`.vscode`目录下创建`mcp.json`配置文件
2. 添加以下配置内容：

json

```
{
  "servers": {
    "ArenaPro-MCP": {
      "type": "sse",
      "url": "http://localhost:25315/ap-mcp"
    }
  }
}
```

![Agent模式设置](/arenapro/QQ20250412-222246.png)

图2: Agent 模式设置界面

### 🧩 扩展工具集成

**🔌 集成工具：**插件提供的 MCP 核心功能可与其他 MCP 工具协同，获取更多神岛相关功能：

- [Box3 引擎开放接口](https://smithery.ai/server/@box3lab/engine-openapi-mcp)
- [Box3 地图数据分析](https://smithery.ai/server/@box3lab/statistics-mcp)

## 📊 应用示例

### 📝 代码检查与部署

AI 可通过 MCP 协助检查代码问题并自动部署到神岛：

![代码检查示例](https://static.codemao.cn/pickduck/SJQxilOA1x.gif?hash=Fo5PI5QZP3YKMoUZo-CXFI30XHkP)

图3: 代码检查与部署示例

### 📈 地图数据分析

结合 Box3 地图数据分析工具，可实现以下自动化工作：

| 功能 | 说明 |
| --- | --- |
| **🔑 用户授权获取** | 自动获取用户授权与地图信息 |
| **📊 数据分析** | 分析游玩数据，生成各类统计结果 |
| **📝 报告生成** | 生成结构化的分析报告 |
| **🔄 文档更新** | 自动更新相关文档 |

![数据分析示例](/arenapro/419F2BE1F44CDB9812CB971DAC5CDFDF.png)

图4: 地图数据分析示例

### ⚡ 自动化优势

### 🔑 无感授权

- 免除手动账号输入
- AI 直接获取账户数据

### 🔄 工具协同

- 支持多工具协同分析
- 实现自动化操作流程

![自动化操作](/arenapro/7df41d84744463e77966d199a0276aff.png)

图5: 自动化操作流程

## ❓ 常见问题

| 问题 | 解决方案 |
| --- | --- |
| **🚫 服务启动失败** | • 检查 25315 端口占用情况<br>• 确认插件启用状态<br>• 尝试重启 VS Code |
| **🔌 工具连接异常** | • 验证网络连接状态<br>• 检查工具服务地址配置<br>• 确认防火墙设置 |

Warning

**⚠️ 注意**：服务启动依赖 ArenaPro 插件，请确保已正确安装并启用插件。如遇网络问题，建议检查网络连接并尝试使用代理或更换网络环境。

## 📚 附录：MCP 工具命令

### 👤 用户中心工具

| 命令 | 功能说明 |
| --- | --- |
| `userCenterTool_userTokenAndUA` | 获取用户 Token 和 UserAgent |
| `userCenterTool_userInfo` | 获取用户基本信息 |
| `userCenterTool_accountsLogin` | 账户登录 |
| `userCenterTool_accountsLogout` | 账户登出 |

### 💬 Chat 吉 PT 工具

| 命令 | 功能说明 |
| --- | --- |
| `chatjpt_onlyKnowledgeBase` | 仅查询神岛 API 知识库 |

想要更详细的界面与用法说明？请参见《[仅查询知识库模式（onlyKnowledgeBase）](./chat-only-knowledgebase.md)》。

### 📁 文件操作工具

| 命令 | 功能说明 |
| --- | --- |
| `file_npm_package_get` | 搜索神岛 NPM 包 |
| `file_outputName` | 输出和更新文件 |
| `file_mapTool` | 地图选择 |
| `file_buildNUpload` | 构建和上传 |
| `file_createProject` | 创建项目 |
| `file_checkDts` | 检查 Dts 文件 |
| `file_nodeJs_setting` | Node.js 配置 |
| `file_openArena` | 打开资源管理器 |
| `file_reHMR` | 重启 HMR |
| `file_stopHMR` | 停止 HMR |
| `file_upLoad` | 上传 JS 文件 |
| `file_debugger` | 快速调试 |
| `file_openOutputLog` | 打开输出日志 |
| `file_dao3config_open` | 打开项目配置 |
| `file_npm_package_path` | 设置 NPM 包路径 |

### 🗺️ 地图工具

| 命令 | 功能说明 |
| --- | --- |
| `map_showMap` | 显示地图创作端 |
| `map_playData` | 查看游玩数据 |
| `map_resource` | 同步地图资源 |

### 🧩 组件工具

| 命令 | 功能说明 |
| --- | --- |
| `component_showComponentStats` | 显示组件统计 |

Tip

**💡 提示**：更多 MCP 协议详情，请参考[MCP 协议文档](https://modelcontextprotocol.io)。使用这些命令时无需记忆具体语法，AI 助手会自动帮助你正确调用。
