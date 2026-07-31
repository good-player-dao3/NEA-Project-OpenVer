---
title: "ArenaPro 客户端资源管理"
source: "https://docs.dao3.fun/arenapro/zh/guide/06-advanced-topics/uploadResources.html"
---

# ArenaPro 客户端资源管理

通过这种方式，你可以彻底脱离“地图内的文件管理系统”，将资源索引与引用完全交给本地工程维护：更易版本化、更易协作、更易回溯。生成的本地枚举索引可直接分享给任何人、放入任意仓库，在不同地图中即拷即用、开箱即用，引用资源像写常量一样可靠。

> 重要提示：本地维护 vs 引擎存储
>
> - 索引与引用均为“本地维护资源”，独立于地图内的文件管理系统，可直接纳入 Git 等版本库，方便协作与回溯。
> - 不依赖地图资源库：无需把索引写入地图或依赖地图权限，代码侧即可“有名可查、即引即用”。
> - 真正跨地图复用：同一套索引可在不同项目/地图中复用，分享给团队成员即可立即使用（开箱即用）。

### 开始批量上传

1. 打开 VS Code，按下`Ctrl + Shift + P`打开命令面板。
2. 搜索并选择命令：
  - 批量上传图片：命令 “批量上传图片（本地维护）”
  - 批量上传音频：命令 “批量上传音频（本地维护）”
3. 在系统文件选择器中：
  - 开启多选，选择需上传的文件。
  - 图片支持扩展名：`jfif, pjpeg, jpg, jpeg, pjp, png`
  - 音频支持扩展名：`mp3, wav, ogg, webm`
4. 点击“上传”。插件将逐个上传并在本地枚举文件中追加索引项。
5. 完成后，你会看到信息提示：
  - 有多少条因“标识符重复”或“值重复”而跳过

### 生成结果与文件位置

- 输出根目录：`client/UiIndex/assets/`
- 文件与导出：
  - 图片：`GamePictureUrl.ts`导出`export enum GamePictureUrl { ... }`
  - 音频：`GameAudioUrl.ts`导出`export enum GameAudioUrl { ... }`

文件头包含说明与生成时间，枚举条目按键名排序，统一两空格缩进，并以逗号结尾。

### 键名生成规则（非常重要）

- 取文件“基本名”（去掉扩展名），规则转换：
  - 非字母数字的分隔符统一打散并“单词化”，每个单词首字母大写，最后拼接
  - 首字符若非法，前置下划线`_`
  - 示例：
    - `main-bg.png`→`MainBg`
    - `1_logo.png`→`_1Logo`
    - `ui icon large.png`→`UiIconLarge`

> 经验法则：尽量使用清晰的英文单词、数字、`-`或`_`。避免混杂空格和特殊符号，减少意外键名。

### 去重与提示规则

追加时会进行两类去重判断：

- 标识符重复（Key 重复）：如果已存在同名键，跳过。
- 值重复（Value 重复）：如果已存在相同的 URL/哈希值，跳过。

完成后会弹出信息框，汇总：

- 跳过总数（包含“标识符重复”数量与示例、“值重复”数量与示例）

若一次未新增任何条目但存在跳过，也会弹出“跳过原因”的警告提示。

### 在代码中引用资源

生成后的文件导出为标准枚举，使用方式如下：

ts

```
// 示例：图片
import { GamePictureUrl } from "@client/UiIndex/assets/GamePictureUrl";

const heroUrl = GamePictureUrl.HeroMain; // 假设生成了该键
```

ts

```
// 示例：音频
import { GameAudioUrl } from "@client/UiIndex/assets/GameAudioUrl";

const clickSound = GameAudioUrl.UiClick; // 假设生成了该键
```

### 小技巧：为枚举项添加注释，获得悬浮提示与更友好的自动补全

你可以在每个枚举项上方添加 JSDoc 风格的块注释`/** ... */`，为团队提供更清晰的用途说明、尺寸/时长、注意事项等信息。这些注释会在 IDE 悬浮时展示，也会作为智能提示的一部分。

ts

```
// client/UiIndex/assets/GamePictureUrl.ts
export enum GamePictureUrl {
  /** 主角立绘（首页 Banner 使用），1920x1080，PNG，≤200KB */
  HeroMain = "https://.../hero-main.png",

  /** UI 基础图标（通用），64x64，Sprite 集合 */
  UiIconBase = "https://.../ui-icon-base.png",
}
```

ts

```
// client/UiIndex/assets/GameAudioUrl.ts
export enum GameAudioUrl {
  /** UI 点击音效，时长 ~120ms，音量建议 -6dB */
  UiClick = "https://.../ui-click.mp3",

  /** 成就解锁音效，时长 ~900ms，含渐强尾音 */
  AchievementUnlock = "https://.../achievement-unlock.mp3",
}
```

> 注意：枚举文件会被“追加写入”。新增条目不会覆盖你已有的条目与注释；

> 小贴士：可在团队约定一个注释模板，例如“用途/尺寸或时长/格式/注意项”，保持一致性：`/** 用途（位置）｜尺寸/时长｜格式｜注意项 */`

### 辅助工具：在编辑器中直接预览图片链接

配合 VS Code 扩展[Gutter Preview](https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-gutter-preview)，可以在编辑代码时直接于编辑器行号边的“gutter”区域预览图片，提升资源校对效率。

![](/arenapro/QQ20250905-185511.png)

- 安装：在 VS Code 扩展市场搜索 “Gutter Preview” 并安装。
- 使用：当光标所在行包含图片 URL 或本地相对路径时，gutter 会出现该图片的缩略图；将鼠标悬浮其上可放大预览。
- 适用场景：在`GamePictureUrl`、UI 配置、样式或 JSON 配置中快速核对图片是否为预期资源。
- 兼容性：支持常见图片格式及 http/https、相对/绝对路径。（具体以扩展说明为准）
- 性能建议：对超大图或网络较慢时，可临时禁用预览或限制预览大小以避免编辑器卡顿。

### 常见问题（FAQ）

- Q: 为什么我上传后，没有新增条目？
  - A: 可能是“标识符重复”或“值重复”。插件会提示跳过原因。可以更改文件名（影响键名）或确认是否重复上传了相同的资源 URL。
- Q: 键名不符合预期？
  - A: 键名由文件“基本名”转成 PascalCase。请按你的命名需要调整文件名（尽量使用清晰的英文/数字/下划线/连接符），避免过多特殊字符。
- Q: 为什么说“本地维护”？会丢吗？
  - A: 该索引不存储于 BOX3 引擎中，位于本地输出目录下，建议纳入你的项目并进行版本管理，避免丢失。

### 最佳实践建议

- 使用规范化文件名，直观地产生语义化枚举键。
- 对于会频繁复用的资源（例如 UI 图标、基础音效），建议统一命名前缀，便于在工程内检索。
- 批量上传后，提交到版本库（例如 Git），并为关键版本打标签，避免回退困难。
- 定期清理未使用的枚举项，保持索引清爽与可维护。
