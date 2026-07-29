---
title: "创建你的第一个 UI"
source: "https://docs.dao3.fun/arena/javascriptDaoAPI/04-creating-ui.html"
---

# 创建你的第一个 UI

到目前为止，我们所有的脚本都运行在服务器上。现在，是时候探索另一半的世界了：客户端脚本。客户端脚本负责处理每个玩家独有的内容，最典型的应用就是创建用户界面 (UI)。

## 客户端脚本简介

回顾一下，客户端脚本有以下特点：

- **运行环境**: 在每个玩家的电脑或手机上独立运行。
- **核心功能**: 主要用于处理视觉和输入，比如显示 UI、播放只给当前玩家听的音效、响应键盘鼠标事件等。
- **API 入口**: 客户端最核心的全局对象是`ui`，用于管理所有 UI 元素。

## 创建一个时钟

我们的目标是：在屏幕左上角创建一个文本标签，实时显示当前时间。

**目标**: 游戏每一帧 -> 获取当前时间 -> 更新屏幕上的文本

### 编写代码

现在，在你的项目中找到或创建一个客户端主脚本`clientIndex.js`，并写入以下代码：

javascript

```
// clientIndex.js

console.log("客户端脚本已启动！");

// 1. 创建一个新的文本 UI 节点
const coordText = UiText.create();

// 2. 设置文本节点的属性
coordText.name = "CoordinateDisplay"; // 给节点起个名字
coordText.textContent = "当前时间：0"; // 初始显示的文本
coordText.textFontSize = 18; // 字体大小
coordText.textColor.copy(Vec3.create({ r: 255, g: 255, b: 255 })); // 字体颜色 (白色)
coordText.textStrokeColor.copy(Vec3.create({ r: 0, g: 0, b: 0 })); // 描边颜色 (黑色)，让文字更清晰
coordText.textStrokeThickness = 2;
coordText.textXAlignment = "Left";
coordText.textYAlignment = "Top";
coordText.autoWordWrap = true;

// 3. 设置文本节点的位置
coordText.anchor.copy(Vec2.create({ x: 0, y: 0 })); // 锚点在左上角
coordText.position.offset.copy(Vec2.create({ x: 20, y: 20 })); // 相对于锚点的位置 (向右20, 向下20)

// 4. 将文本节点添加到屏幕上
// ui 对象本身就是屏幕的根节点
coordText.parent = ui;

console.log("坐标显示 UI 已创建。");

// 实时同步当前时间
setInterval(() => {
  coordText.textContent = `当前时间：${new Date().toLocaleString()}`;
}, 1000);
```

## 代码解析

- **`UiText.create()`**: 我们创建了一个`UiText`类的实例。这是一个专门用来显示文本的 UI 节点。
- **`coordText.anchor`和`coordText.position`**: 这两个属性共同决定了 UI 的位置。`anchor`设置了节点的“原点”在屏幕的哪个位置（`(0, 0)`是左上角，`(1, 1)`是右下角），而`position`则是相对于这个锚点的像素偏移量。
- **`coordText.textFontSize`和`coordText.textColor`**: 设置文本的字体大小和颜色。
- **`coordText.textStrokeColor`和`coordText.textStrokeThickness`**: 设置文本的描边颜色和描边厚度，让文字更清晰。
- **`coordText.textXAlignment`和`coordText.textYAlignment`**: 设置文本的对齐方式。
- **`coordText.autoWordWrap`**: 设置文本是否自动换行。
- **`coordText.textColor`**: 设置文本的颜色。
- **`coordText.parent`**: 将文本节点的`parent`属性设置为`ui`。`ui`是一个全局的根节点，所有希望被渲染的 UI 元素都需要将其`parent`指向`ui`或其子节点，从而形成一个 UI 树状结构。
- **`setInterval(() => { ... })`**: 我们注册了帧更新事件。这个回调函数会在每秒钟被调用很多次（取决于帧率）。
- **`coordText.textContent`**: 设置文本节点的文本内容。

现在，进入游戏。你应该能在屏幕的左上角看到一个显示你当前坐标的文本。试着在地图里移动，你会发现数字在实时变化。

## 接下来

你已经成功地创建了你的第一个客户端 UI，并掌握了客户端脚本的核心工作流程！这为你制作复杂的游戏界面、小地图、计分板等功能打下了坚实的基础。你可以尝试：

- 创建一个`UiImage`节点，在屏幕上显示一张图片。
- 使用`ui.events.on("pointerdown", (event) => { ... })`事件，让 UI 元素可以被点击。
