---
title: "🤖 本地搭建神岛 API 版满血 DeepSeek 对话客户端指南"
source: "https://docs.dao3.fun/api/localAI.html"
---

# 🤖 本地搭建神岛 API 版满血 DeepSeek 对话客户端指南

---

🌟**探索 AI 的无限可能，从零开始搭建你的专属 AI 对话客户端**

在接下来的步骤中，我们将用 Cherry Studio 和 DeepSeek 模型，结合神岛 API 知识，打造一款功能强大的 API 客户端，体验前所未有的 AI 交互体验。

## 📝 第一步：注册硅基流动平台账号

🚀**快速注册，开启 AI 探索之旅**

- 访问[硅基流动平台注册链接](https://cloud.siliconflow.cn/i/uNnBUxXj)进行注册。
- 完成注册后，你将额外获得 2000 万 Token，适用于 DeepSeek-R1 和 DeepSeek-V3 等顶级模型。

![硅基流动平台注册界面](/api/QQ20250223-200727.png)

💡**推荐模型**：DeepSeek-R1 和 DeepSeek-V3 是当前最受欢迎的模型之一，当然，你也可以根据个人需求选择其他模型。

## 💻 第二步：安装 Cherry Studio 程序

🔧**全能 AI 助手，一键安装**

- 访问[Cherry Studio 官方网站](https://cherry-ai.com/)，下载并安装 Cherry Studio 程序。
- Cherry Studio 集成了多模型对话、知识库管理、AI 绘画、翻译等强大功能，是你的全能 AI 助手。

![Cherry Studio 安装界面](/api/QQ20250223-202338.png)

## 🔑 第三步：生成硅基流动 API 密钥

🔒**安全生成，妥善保管**

- 访问[硅基流动 API 密钥生成页面](https://cloud.siliconflow.cn/account/ak)，生成你的 API 密钥。
- 请务必妥善保管你的 API 密钥，避免泄露给未经授权的人员。

![API 密钥生成界面](/api/QQ20250223-202624.png)

警告

请务必注意 API 密钥的安全性，避免泄露导致不必要的损失。

## 🔧 第四步：配置 Cherry Studio 程序

🔧**轻松配置，快速上手**

- 打开 Cherry Studio 程序，点击设置，选择模型服务，然后选择硅基流动。
- 在弹出的窗口中填入你生成的 API 密钥，完成配置。

![Cherry Studio 配置界面](/api/QQ20250223-202932.png)

- 接下来，点击管理，选择你需要的模型，如 DeepSeek-R1 和 DeepSeek-V3，并选择 bge-m3 作为嵌入模型。

![选择模型界面](/api/QQ20250223-203406.png)

## 📚 第五步：创建知识库并喂入神岛 API

📖**打造专属知识库，提升 AI 交互体验**

- 在 Cherry Studio 中，点击知识库，选择新增，填写名称，并选择嵌入模型 bge-m3。

![创建知识库界面](/api/QQ20250223-203919.png)

- 接下来，下载神岛 API 文档。访问[神岛 API 文档仓库](https://gitee.com/box3lab/box3-product-document)，点击克隆/下载，选择下载 zip。

![下载神岛 API 文档界面](/api/QQ20250223-204215.png)

- 解压下载的 zip 文件，然后在 Cherry Studio 中以目录的形式指向解压后的 API 路径。

![指向 API 路径界面](/api/QQ20250223-204346.png)

- 等待训练完成，你就可以开始与 AI 进行对话了。

## 💬 第六步：与 AI 对话

🗣️**开启对话，探索无限可能**

- 回到 Cherry Studio 的对话界面，开启知识库，选择神岛 API。

![开启知识库界面](/api/QQ20250223-204458.png)

- 选择你需要的模型，如 DeepSeek-R1，然后开始与 AI 进行对话。

![与 AI 对话界面](/api/QQ20250223-204944.png)

![与 AI 对话界面](/api/QQ20250223-204920.png)

---

🎉**恭喜你，你已经成功在本地部署了一个 AI 对话客户端，并打造了自己专属的知识库！**

现在，你可以随时更换不同平台的大模型，享受 AI 带来的无限乐趣。祝你使用愉快，探索更多 AI 的可能！

## 杂谈：chat 吉 pt 前生模型（免费大模型）

之前，chat 吉 pt 使用的是百度的模型 ERNIE Speed。该模型表现良好，且一直免费提供给我们使用。目前尚不确定这种福利是否将一直持续下去。与此同时，我们还能够在 Cherry Studio 程序中利用该模型，体验其带来的流畅对话体验。

![](/api/QQ20250225-103449.png)
