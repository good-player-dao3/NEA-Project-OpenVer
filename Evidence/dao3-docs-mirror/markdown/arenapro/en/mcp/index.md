---
title: "🔌 MCP Plugin Usage Guide"
source: "https://docs.dao3.fun/arenapro/en/mcp/index.html"
---

# 🔌 MCP Plugin Usage Guide

A quick story: you keep hopping between VS Code logs, pasting API keys, and authorizing in a browser—your flow breaks. After enabling MCP, the IDE agent “knows how to use tools”: it can read/write your project and talk to external services. Common steps (auth, build, upload, analytics) chain together as a single instruction and development feels smooth again.

What is MCP? In one sentence: a standard plug between LLMs and the outside world.

- 🧠 Context management: feed task-critical context to AI precisely and safely.
- 🔄 Capability expansion: attach new tools via a unified protocol anytime.
- 🔒 Consistency: stable formats, error handling, and state management.
- 🛠️ Tool integration: seamless with IDEs, analytics services, and open APIs.

## ⚙️ Configuration and Usage

### 🔧 Supported Development Tools

Tools that support MCP include:

- VS Code
- Trae / Claude / Cursor
- Windsurf / Cline / Cherry Studio, etc.

### 📝 VS Code Configuration Steps

1. Create an`mcp.json`configuration file in the`.vscode`directory of your project.
2. Add the following configuration content:

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

**📋 Configuration Description:**

- `servers`: A collection of MCP server configurations
- `ArenaPro-MCP`: The server identifier name (can be customized)
- `type`: The service type, using the SSE (Server-Sent Events) protocol
- `url`: The MCP server address

### 🚀 Starting the Service

After configuration, open the MCP panel and you should see a screen like this. Click the Run button above the configuration item and wait until it shows Running:

![MCP Configuration Interface](/arenapro/QQ20250412-221652.png)

Figure 1: MCP Configuration Interface

Once the service is ready, you can invoke MCP tools directly inside the IDE.

## 💬 Feature Usage

### 🤖 AI Agent Interaction

1. Start the built-in GitHub Copilot in VS Code
2. Switch to Agent mode

![Agent Mode Settings](/arenapro/QQ20250412-222246.png)

Figure 2: Agent Mode Settings Interface

### 🧩 Extended Tool Integration

**🔌 Integrated Tools:**The core MCP functions provided by the plugin can work in conjunction with other MCP tools to access more Box3-related features:

- [Box3 Engine OpenAPI](https://smithery.ai/server/@box3lab/engine-openapi-mcp)
- [Box3 Map Data Analysis](https://smithery.ai/server/@box3lab/statistics-mcp)

## 📊 Application Examples

### 📝 Code Inspection and Deployment

The AI can assist in checking code issues and automatically deploying to Box3 via MCP:

![Code Inspection Example](https://static.codemao.cn/pickduck/SJQxilOA1x.gif?hash=Fo5PI5QZP3YKMoUZo-CXFI30XHkP)

Figure 3: Code Inspection and Deployment Example

### 📈 Map Data Analysis

Combined with the Box3 map data analysis tool, the following automated tasks can be achieved:

| Function | Description |
| --- | --- |
| **🔑 User Authorization Acquisition** | Automatically obtains user authorization and map information |
| **📊 Data Analysis** | Analyzes gameplay data and generates various statistical results |
| **📝 Report Generation** | Generates structured analysis reports |
| **🔄 Document Updates** | Automatically updates relevant documents |

![Data Analysis Example](/arenapro/419F2BE1F44CDB9812CB971DAC5CDFDF.png)

Figure 4: Map Data Analysis Example

### ⚡ Automation Advantages

### 🔑 Seamless Authorization

- Eliminates manual account entry
- AI directly accesses account data

### 🔄 Tool Collaboration

- Supports multi-tool collaborative analysis
- Enables automated operation flows

![Automated Operation](/arenapro/7df41d84744463e77966d199a0276aff.png)

Figure 5: Automated Operation Flow

## ❓ Frequently Asked Questions

| Issue | Solution |
| --- | --- |
| **🚫 Service Fails to Start** | • Check if port 25315 is occupied<br>• Confirm the plugin's enabled status<br>• Try restarting VS Code |
| **🔌 Tool Connection Abnormal** | • Verify the network connection status<br>• Check the tool's service address configuration<br>• Confirm firewall settings |

Warning

**⚠️ Note**: Service startup depends on the ArenaPro plugin. Please ensure it is correctly installed and enabled. If you encounter network issues, it is recommended to check your network connection and try using a proxy or switching to a different network environment.

## 📚 Appendix: MCP Tool Commands

### 👤 User Center Tools

| Command | Description |
| --- | --- |
| `userCenterTool_userTokenAndUA` | Get user Token and UserAgent |
| `userCenterTool_userInfo` | Get basic user information |
| `userCenterTool_accountsLogin` | Account login |
| `userCenterTool_accountsLogout` | Account logout |

### 📁 File Operation Tools

| Command | Description |
| --- | --- |
| `file_npm_package_get` | Search for Box3 NPM packages |
| `file_outputName` | Output and update file |
| `file_mapTool` | Map selection |
| `file_buildNUpload` | Build and upload |
| `file_createProject` | Create project |
| `file_checkDts` | Check Dts files |
| `file_nodeJs_setting` | Node.js configuration |
| `file_openArena` | Open resource manager |
| `file_reHMR` | Restart HMR |
| `file_stopHMR` | Stop HMR |
| `file_upLoad` | Upload JS file |
| `file_debugger` | Quick debug |
| `file_openOutputLog` | Open output log |
| `file_dao3config_open` | Open project configuration |
| `file_npm_package_path` | Set NPM package path |

### 🗺️ Map Tools

| Command | Description |
| --- | --- |
| `map_showMap` | Show map creator end |
| `map_playData` | View gameplay data |
| `map_resource` | Sync map resources |

### 🧩 Component Tools

| Command | Description |
| --- | --- |
| `component_showComponentStats` | Show component stats |

### 💬 Chat Ji PT Tools

| Command | Description |
| --- | --- |
| `chatjpt_onlyKnowledgeBase` | Query the Box3 API knowledge base only |

For a dedicated UI and usage guide, see:[Only Knowledge Base Mode (onlyKnowledgeBase)](./chat-only-knowledgebase.md).
