---
title: "神岛 React 开发指南"
source: "https://docs.dao3.fun/arenapro/zh/package/react/reactGuide/setup.html"
---

# 神岛 React 开发指南

Info

本框架仅支持神岛客户端开发，不支持服务端使用。

本指南将帮助你快速上手神岛 React 开发。通过 React 的组件化开发方式，你可以更高效地构建和管理游戏 UI 界面。

## 安装依赖

你可以通过以下两种方式安装`@dao3fun/react`依赖包：

### 方式一：使用 ArenaPro 插件安装（推荐）

1. 在 VSCode 中，按下`Ctrl + Shift + P`（Windows）或`Command + Shift + P`（MacOS）打开命令面板
2. 输入 "ArenaPro" 并选择`ArenaPro: 查看神岛NPM包`命令
3. 在搜索框中输入`react`
4. 选择`@dao3fun/react`包，点击左下角"确认安装"
5. 等待安装完成，VSCode 右下角会显示安装成功提示

### 方式二：使用 npm 安装

在项目根目录下执行以下命令：

bash

```
npm install @dao3fun/react
```

## 环境配置

安装完成后，需要进行以下配置以支持 React 开发：

### 配置 tsconfig.json

1. 打开项目`client`目录下的`tsconfig.json`文件
2. 在`compilerOptions`中添加`jsx`配置：

json

```
{
  "compilerOptions": {
    "jsx": "react"
    // 其他配置...
  }
}
```

完成配置后，TypeScript 将能够正确识别 JSX 语法。

### 配置 dao3.config.json

1. 打开项目根目录下的`dao3.config.json`文件
2. 在`entry`中修改为`src/clientApp.tsx`

### 修改客户端入口文件

由于框架原因，你需要使用`.tsx`或`.jsx`格式的文件作为入口文件，而不是`.js`或`.ts`。

在`client`目录下创建或修改`clientApp.tsx`文件。

## 快速上手

神岛 React 的标签系统与神岛 UI API 完全兼容，例如：

- `<box />`对应`UiBox`
- `<text />`对应`UiText`

UI 样式通过`style`属性设置，具体 API 请参考：[神岛 UI API 文档](/api/ClientUI/index.md)

让我们通过一个简单的示例来了解基本用法：

tsx

```
// clientApp.tsx
import React from "@dao3fun/react";

function App() {
  return <box>你好，React</box>;
}

React.render(<App />, ui);
```

效果如下：

![](/arenapro/QQ20250402-152338.png)

可以看到，渲染效果与手动创建的 UI 完全一致。

特别说明：如果直接使用文本内容而不包含`<text />`标签，系统会自动创建一个`UiText`组件，并默认居中显示。

让我们再看一个使用`<text />`标签的示例：

tsx

```
import React from "@dao3fun/react";

function App() {
  return (
    <box>
      <text>你好，React</text>
    </box>
  );
}

React.render(<App />, ui);
```

效果如下：

![](/arenapro/QQ20250402-152915.png)

## Fragment

`<fragment />`或`< />`标签用于将多个组件组合成一个组件，而不用建立一个父组件。

tsx

```
import React from "@dao3fun/react";

function App() {
  return (
    <>
      <text>你好，React</text>
    </>
  );
}

React.render(<App />, ui);
```

效果如下：

![](/arenapro/QQ20250403-205512.png)

恭喜！你已经成功完成了神岛 React 的基础配置和简单使用。更多特性和开发技巧，请继续阅读后续文档。
