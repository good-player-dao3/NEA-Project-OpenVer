---
title: "创建组件脚本"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/setup.html"
---

# 创建组件脚本

本指南将帮助你快速设置和创建神岛引擎的组件脚本。通过组件化开发，你可以更好地组织和管理游戏代码。

## 安装组件库

你可以通过以下两种方式安装`@dao3fun/component`组件库：

### 方式一：使用 ArenaPro 插件安装（推荐）

1. 在 VSCode 编辑器中，按下`Ctrl + Shift + P`（Windows）或`Command + Shift + P`（MacOS）打开命令面板
2. 搜索 "ArenaPro" 并运行`ArenaPro: 查看神岛NPM包`命令
3. 在弹出的输入框中输入`component`进行搜索
4. 点击`@dao3fun/component`，然后在左下角弹窗中点击"确认安装"
5. 等待安装完成，VSCode 右下角会显示安装成功提示

### 方式二：使用 npm 命令行安装

在项目根目录下打开终端，运行以下命令：

bash

```
npm install @dao3fun/component
```

## 配置组件模板

安装完成后，你可以配置自动生成组件模板的功能：

1. 打开项目根目录下的`dao3.config.json`文件
2. 添加或修改`ECS`配置项：

![配置ECS属性](/arenapro/QQ20250321-172825.png)

配置完成后，每次创建新的`.ts`文件时都会自动生成组件模板代码。

## 创建组件脚本

### 自动创建（推荐）

1. 在 VSCode 资源管理器中右键选择要创建脚本的目录
2. 选择"新建文件"
3. 输入文件名（以`.ts`结尾），如`NewComponent.ts`
4. 按回车确认，将自动生成组件模板

### 组件模板结构

typescript

```
import { _decorator, Component, EntityNode } from "@dao3fun/component";
const { apclass } = _decorator;

@apclass("NewComponent")
export class NewComponent extends Component<GameEntity> {
  // 组件初始化时调用
  start() {
    // 在这里初始化组件
  }

  // 每帧更新时调用
  update(deltaTime: number) {
    // 在这里编写更新逻辑
  }
}
```

## 开发注意事项

### 1. 类名唯一性

- 整个项目中的组件类名必须唯一
- 即使在不同目录下也不能重复
- 建议使用描述性的类名，如`PlayerMovement`、`EnemyAI`等

### 2. 装饰器使用

- 必须使用`@apclass`装饰器定义组件类
- 装饰器参数应与类名保持一致
- 示例：

typescript

```
@apclass("PlayerController")
export class PlayerController extends Component<GameEntity> {
  // ...
}
```

### 3. 文件命名规范

- 文件名应与组件类名完全一致
- 使用 PascalCase 命名法
- 例如：`PlayerController.ts`、`EnemySpawner.ts`

### 4. TypeScript 优势

我们强烈推荐使用 TypeScript 编写组件：

- 更好的类型检查
- 智能代码提示
- 更容易发现潜在错误
- 更好的代码维护性

## 常见问题

1. **Q: 为什么我的组件模板没有自动生成？**A: 请检查`dao3.config.json`中的`ECS`配置是否正确设置为`true`
2. **Q: 组件类名重复了怎么办？**A: 修改其中一个类名，确保项目中的所有组件类名都是唯一的
3. **Q: 如何调试组件代码？**A: 使用 VSCode 的调试功能，设置断点并启动调试模式
