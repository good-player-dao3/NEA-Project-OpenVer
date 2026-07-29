---
title: "Hello World - 代码篇"
source: "https://docs.dao3.fun/arena/getting-started/helloWorld-code.html"
---

# Hello World - 代码篇

体验如何在控制台打印一个"Hello World"，并使用神岛 API 实现一个小案例，让玩家在进入游戏时接收到个性化的欢迎信息。

学习 JavaScript 语言，具体的内容请参考[JavaScript 语言基础](/arena/javascriptEntry/01-getting-started/01-what-is-javascript.md)。

#### 1. 进入代码编辑器

在 Arena 地图编辑器中，寻找工具区的“代码”按钮，点击以进入代码编辑界面。

![](/arena/QQ20240913-152031.png)

#### 2. 编写第一行代码

在服务端脚本的“index.js”文件中，编写以下代码以在控制台输出"Hello World"。

js

```
console.log("Hello World");
```

运行此代码后，你将在控制台看到"Hello World"的输出。

#### 3. 运行地图

点击右上角的“运行”按钮，并开启左侧的调试模式（小虫子图标），以在控制台查看输出。

![](/arena/QQ20240913-152456.png)

![](/arena/QQ20240918-131047.png)

#### 4. 使用神岛 API 向玩家发送信息

接下来，我们将利用神岛 API 实现在玩家加入游戏时发送个性化欢迎信息的功能。

在`index.js`文件中，添加以下代码段以在玩家加入游戏时发送一条欢迎私信：

js

```
console.log("Hello World");

world.onPlayerJoin(({entity}) => {
    entity.player.directMessage(`你好，${entity.player.name}，欢迎来到神奇代码岛！`);
});
```

这段代码将监听玩家加入事件，并使用`directMessage`方法向每位新加入的玩家发送一条包含其用户昵称的欢迎私信。

> [**world.onPlayerJoin**](/api/GameWorld/playerJL.md#onPlayerJoin)： 当玩家加入游戏时触发。
>
> [**entity.player.directMessage**](/api/GamePlayerEntity/chat.md#directMessage)： 向玩家发送一条消息。

#### 5. 测试效果

![](/arena/QQ20240918-130943.png)

重新运行地图，你将在游戏内收到包含用户昵称的个性化欢迎私信。

这章中，我们不仅学会了如何使用 js 语言在控制台输出"Hello World"，还掌握了如何使用神岛 API 增强游戏的交互性和个性化体验。

希望这对你的神奇代码岛之旅有所帮助！
