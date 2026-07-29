---
title: "管理你的“秘密”：用环境变量控制功能开关与密钥"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/env.html"
---

# 管理你的“秘密”：用环境变量控制功能开关与密钥

在游戏开发的旅程中，你几乎一定会遇到这个场景：

> 你正在为一个节日开发一个“特殊活动”，比如“圣诞寻宝”。
>
> 1. **功能开关**：你希望在自己的电脑上能随时开启并测试这个活动，但又不希望在活动正式上线前，被普通玩家看到。
> 2. **管理密钥**：这个活动需要调用一个外部的“天气 API”来实现下雪效果，而这个 API 需要一个付费的、私密的`API_KEY`。

最直接但最危险的做法，是把这些“秘密”硬编码在代码里：

typescript

```
// 活动功能的开关
const ENABLE_CHRISTMAS_EVENT = true;

// 私密密钥
const WEATHER_API_KEY = "abc-123-xyz-a-very-secret-key";
```

这种方法充满了风险：

- **容易忘记**：在发布一个常规的游戏版本时，你很可能忘记将`ENABLE_CHRISTMAS_EVENT`改回`false`，导致未完成的活动提前泄露给玩家。
- **密钥泄露**：你将`WEATHER_API_KEY`写在代码里，一旦将项目上传到 Git，所有协作者都能看到你的密钥。如果这是个公开仓库，你的密钥就等于向全世界曝光了，可能会被盗用并产生高额费用。

那么，如何优雅地管理这些“秘密”，让你的项目可以根据不同环境，自动地开启/关闭功能、使用不同的密钥呢？答案就是——**环境变量**。

## 快速开始：使用`.env`

在你的项目根目录（与`package.json`同一级）下，有个名为`.env`的文件。这个文件专门存放你的个人配置和密钥。**这个文件绝不应该被提交到 Git 仓库**。

ini

```
# .env 文件
# 这是一个注释。这个文件里的内容，只有你自己能看到。
ENABLE_CHRISTMAS_EVENT=true
WEATHER_API_KEY="abc-123-xyz-a-very-secret-key"
```

现在，你可以在代码里这样写：

typescript

```
// server/src/App.ts

// 使用功能开关
if (process.env.ENABLE_CHRISTMAS_EVENT === "true") {
  console.log("圣诞节活动已开启！开始加载相关逻辑...");
  // ... 此处加载活动相关的代码
}

// 安全地使用密钥
function getWinterWeather() {
  const apiKey = process.env.WEATHER_API_KEY;
  // fetch(`https://api.weather.com/snow?apiKey=${apiKey}`);
  console.log(`正在使用密钥 ${apiKey} 请求天气...`);
}

if (process.env.ENABLE_CHRISTMAS_EVENT === "true") {
  getWinterWeather();
}
```

当你需要发布一个**不包含**圣诞活动的常规版本时，只需在发布前，将`.env`文件里的`ENABLE_CHRISTMAS_EVENT`改为`false`，然后重新构建上传即可，**完全不需要改动任何业务代码**。你的密钥也永远不会出现在代码或公开仓库中。

## 进行“类型限定”：让环境变量与开关更安全

最简单也最实用的做法，是在项目根目录的`env.d.ts`文件中，声明你将使用到的环境变量。这可以立刻带来编辑器补全、拼写检查与类型受限的好处。

注意，环境变量读取结果**必须为字符串类型**，不能是其他类型。例如，不能写成`readonly ENABLE_CHRISTMAS_EVENT: boolean`。

ts

```
// env.d.ts（放在项目根目录）
interface ProcessEnv {
  readonly WEATHER_API_KEY: string; // 必填，类型为 string
  readonly ENABLE_CHRISTMAS_EVENT: "true" | "false"; // 仅允许 "true" | "false" 字符串
  readonly EVENT_MODE?: "off" | "beta" | "on"; // 可选，且仅允许 "off" | "beta" | "on" 三种取值
  readonly ENABLE_NEW_TUTORIAL?: "true" | "false"; // 可选，且仅允许 "true" | "false"
}
```

注意：`env.d.ts`只负责“编辑期的类型提示与约束”。在 ArenaPro 中，运行时代码仍依赖框架内置的“构建时替换”机制，请务必在`.env`/`.env.example`中定义与之匹配的变量，避免出现`process is not defined`的错误。

## 核心概念：为什么我的配置在本地好好的，一上传就失灵了？

在揭晓具体操作前，我们必须先理解一个核心概念：“构建时” vs. “运行时”。

很多有 Node.js 开发经验的创作者会尝试使用`dotenv`这个库。他们在本地电脑上一切正常，但把代码上传到平台后，服务器立刻崩溃，提示找不到`.env`文件。

这是因为，ArenaPro 的服务器接收的，是你**在本地电脑上“构建”完成后的`.js`文件**。你的`package.json`,`.env`,`tsconfig.json`等所有源文件，都不会被上传到服务器。

- **`dotenv`(运行时方案 - ❌ 错误)**: 它的工作原理是：**当代码在服务器上运行时**，去寻找并读取`.env`文件。因为`.env`文件根本没被上传，所以它注定会失败。这就像你给了朋友一张购物清单，却没有给他钱——他到了商店也无能为力。
- **`dotenv-webpack`(构建时方案 - ✅ 正确)**: 它的工作原理是：**当代码在你本地电脑上“构建”时**，就提前读取`.env`文件，然后像“查找与替换”一样，把你代码中对环境变量的引用，直接替换成`.env`文件里的真实值。这就像你提前帮朋友买好了所有东西，直接把装满货物的**背包**交给他——他拿到就能立刻使用。

**可视化对比**

| 你的本地代码 (`.ts`) | 你的`.env`文件 (本地) | 构建后上传到平台的最终代码 (`.js`) |
| --- | --- | --- |
| `console.log(process.env.EVENT_MESSAGE);` | `EVENT_MESSAGE=圣诞快乐！` | `console.log("圣诞快乐！");` |

最终上传的代码已经不包含`process.env`的引用了，它被直接替换成了真实的值。这是在 ArenaPro 中使用环境变量的唯一正确途径。

## 💥**安全须知**：如何避免`process is not defined`致命错误

这是使用此功能时**最常见的、100% 会导致程序崩溃**的错误。

**原因**：如果在代码中使用了`process.env.SOME_VAR`，但构建工具在`.env`文件里**找不到**`SOME_VAR`的定义，它就不会做任何“查找与替换”的操作。

最终，`process.env.SOME_VAR`这段代码会**原封不动地**被打包进最终的`.js`文件里。当这段代码在没有完整 Node.js 环境的 ArenaPro 平台上运行时，由于平台不认识`process`这个对象，你的程序会立刻崩溃。

**解决方案**： 一个简单的原则：**确保你在代码中引用的每一个环境变量，都在`.env`文件中有定义。**即使某个变量暂时不需要值，也要给它一个空定义，或者一个明确的默认值。

**正确的`.env`文件示例**:

ini

```
# 天气 API 的密钥是必需的，不能为空
WEATHER_API_KEY="some-real-key"
# 圣诞节活动暂时关闭，但因为代码里有引用，所以必须给它一个值
ENABLE_CHRISTMAS_EVENT=false
```

## 团队协作的最佳实践

### 1. 将`.env`文件加入`.gitignore`

`.env`文件包含你的个人密钥等敏感信息。**永远不要**将它提交到 Git 仓库。

```
# .gitignore
# 忽略所有 .env 文件，保护你的机密信息
.env
```

### 2. 创建一个`.env.example`文件作为模板

为了方便团队中的其他人快速上手，你应该在项目里创建一个`.env.example`文件。它列出了项目需要的所有环境变量名，但把真实的值留空。这个文件**应该**被提交到 Git 仓库。

ini

```
# .env.example
# 团队成员需要复制这个文件，重命名为 .env，并填入自己的配置

WEATHER_API_KEY=
ENABLE_CHRISTMAS_EVENT=false
```

这样，当新成员加入项目时，他只需复制`.env.example`为`.env`，然后填上他自己的密钥，就可以立即开始开发和测试了。
