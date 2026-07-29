# Changelog

All notable changes to LokiBox from v2.3.2 onward.

## [v2.5.0] — 2026-06-25

### 用户系统

- **Modal 组件** — 50vw、4:3、Escape/backdrop 关闭、缩放动画
- **Settings 面板** — 左侧 tab 切换（Account / Theme）
- **Account 页面** — 头像显示/上传、用户名、昵称内联编辑
- **头像上传** — 文件选择 → CDN 二进制直传 → API 更新 → 全端显示
- **昵称编辑** — inline 输入，Enter 保存 / Escape 取消
- **两步退出** — 确认 → POST /auth/logout → reload
- **API 同步文档** — fetchEncrypted、AES-GCM session key、全部端点对齐
- **user_id 全移除** — 好友/搜索/消息全部用 username，消除隐私泄露
- **好友操作 username 化** — requestFriend/acceptFriend/rejectFriend/deleteFriend

### 主题自定义

- **自定义颜色系统** — 替换 mono/cyan preset，10 个色值自由调节
- **Settings Theme 面板** — 色值选配 + 实时预览框（toggle/entry/slider/presence/bg/text）
- **CSS 变量** — 新增 `--bg-default`、`--bg-hover`、`--text-default`
- **16 处背景替换** — `#222`/`#222222` → `--bg-default`，`#252525` → `--bg-hover`
- **20+ 灰色文字替换** — `#aaa`/`#888`/`#666`/`#555` → `var(--text-default)` + opacity 层级
- **开关 thumb 重构** — OFF=`--bg-active` 高亮，ON=`--bg-default` 融入
- **NumberController** — 滑块渐变 + thumb 跟随 `--accent`
- **好友标记** — 绿底 → `border-left: 2px solid var(--accent)`
- **旧版兼容** — 自动转换 mono/cyan 字符串为颜色对象

### 其他

- Modal 硬编码颜色全清理
- Toast 背景跟随 `--bg-default`
- SettingsFolder 废弃

## [v2.4.1] — 2026-06-24

### 性能

- **RangeController** — `8×drop-shadow + clip-path` → SVG polygon + stroke，消除帧率掉

### 修复

- **Config import 位置** — 文件夹百分比存储转像素再传 setPosition
- **ClickUI 键盘拦截** — 移除 GAME_KEYS 捕获，用户能正常关闭 UI

## [v2.4.0] — 2026-06-24

### ConfigManager

- **配置导出/导入** — JSON 文件下载，完整结构校验
- **Profile 管理** — 保存/加载/删除命名配置，热切换
- **拖拽导入** — 拖 `.json` 到 Config 文件夹
- **自动备份** — 导入前备份当前状态到 `config:_backup`
- **文件夹位置百分比** — 视口分数存储，跨屏幕共享配置

### 文档

- **README 全量重写** — 分支策略、技术栈、架构图、mudb/伪造层级
- **Feature 列表** — 添加定位表格和使用教程
- **开发指南** — 移后半部分，加 ModuleLoader 和 Core adapter 章节
- **CLAUDE.md** — 详细项目结构、代码规范、Box3 领域知识

### 基建

- **模块级 try/catch** — 单模块加载失败不影响其他
- **FeatureManager rAF** — 独立 requestAnimationFrame 渲染循环
- **GUI 按键拦截** — INPUT/TEXTAREA `stopImmediatePropagation`
- **Obfuscator** — 同步配置，控制流扁平化 + 死代码注入

## [v2.3.6] — 2026-06-23

### 快捷键大修

- 改为 capture 模式 + stopImmediatePropagation，彻底不冲突游戏
- 阻止 Tab 聚焦浏览器地址栏
- 最终移除全部实验性的 stopPropagation/preventDefault 逻辑

### TargetHUD

- LockIndicator → TargetHUD 重构为可拖动组件
- 右上角距离指示，固定 180px 宽
- 无目标时始终显示 Steve 20/20 占位

### 重构

- 注册/用户信息全面 nickname / username 分离
- folder 初始化位置统一 (100,80)，去掉 grid 计数逻辑

## [v2.3.5] — 2026-06-23

### 大规模重构

- **API 层独立** — `api/schema/security` 从 `auth/` 拆到顶层目录，消除跨域
- **Core adapter 化** — Raw→GameCore、GameKey、CameraMode 全拆独立 adapter
- **Blink 独立模块** — 从 core 拆出 + Raycast 复用 Core adapter
- **拼写修正** — `Catagory` → `Category`，测试文件归位
- **清理** — 移除 pixi.js、根目录躺尸文件

### 新功能

- **FakeLag** — netInput 延迟发包 + drainOne/queued API
- **zOrder 持久化** — 文件夹图层顺序重启保留，bringToFront
- **Storage 三层缓存** — 内存缓存避免每次 GM 反序列化

## [v2.3.4] — 2026-06-23

### 新功能

- **Scroller** — 滚轮切物品功能
- **CoreRemoteChannel** — mudb RPC 通道适配器
- **AutoEZ Bedwars** — remoteChannel 示例频道

### 性能

- **lucide-svelte** — barrel import → 单文件 import，模块数 3000+ → 286

## [v2.3.3] — 2026-06-22

### 新功能

- **Blink** — 按住拦截 net input 包，松手瞬间闪现
- **SafeWalk** — 边缘保护，到悬空处自动刹停
- **ESP 平面方框** — 血量色名签，Exclude Spectator / Show Names prop
- **AimAssist / KillAura** — 默认排除 hp=0 玩家

### 改进

- Minimap 修复双重旋转、血量颜色、玩家名显示
- BlockHit 改为 onLMouseDown 触发
- BedBreaker 修复 raycast 参数
- Speed 精度 0.1 → 0.01

### 修复

- BedBreaker 无法使用
- ultility → utility 拼写 + scaffold 归到 movement

---

## v2.3.2

### Features

- **Minimap** — 方形 Canvas 2D 小地图，旋转网格、玩家点位、自身上方向箭头
- **DraggableContainer** — 可复用 Head+拖动+位置存储组件，内容区定位排除 Head 高度
- **Toast 通知系统** — 右下角弹出，计时条动画，自动隐藏，info/success/error 三色
- **友请求轮询** — 15s 间隔，收到新请求弹出 toast
- **用户搜索 API** — `POST /users/search`，300ms 防抖

### UI

- **LoadingScreen** — 修复白色加载条只走 2/3（translateX 160%→250%）
- **LoadingScreen** — 替换 SVG 图标+文字为 logo.png
- **MainFolder** — 独立 folder，logo 代替标题，无 title 文字
- **ClickUI 输入拦截** — capture-phase keydown，INPUT/TEXTAREA 停止传播
- **Minimap folder** — feature 关闭时不显示

### Refactors

- **FriendManager 拆分** — 本地 ExclusionManager + 远程 FriendManager（Loki API）
- **Minimap** — 外部/内联双模式，位置与 FolderStorageManager 同步
- **ui 目录** → main 目录

### Fixes

- **Obfuscator** — header/code 行末拼接导致 userscript 头损坏，强制换行
- **Minimap 外部不显示** — canvas 始终渲染，CSS 控制显隐，`onMount` 确保元素存在
- **Minimap 旋转方向** — yaw 符号修正，左转地图跟随左转
- **FriendList** — `/friends` API 冷启动时未调用，`startPolling()` 改为先 fetch

## v2.3.1

### Features

- **LockIndicator** — 底部目标锁定指示器，显示 AimAssist / KillAura 当前目标的名称与血量条
- **FriendFolder UI** — 好友列表面板，在线/离线状态、血量显示、悬停移除按钮
- **FriendManager 事件驱动** — 通过 EventBus + `onChange()` 推送好友变更，替代轮询
- **PlayerEntry 重构** — 左键 toggle 好友，右键展开 inline 菜单（Focus Camera / Return to Self），好友绿底
- **Selector 目标选择器** — 提取 AimAssist / KillAura 的选敌逻辑到 `src/utils/selector.ts`，统一 sqrDist 距离计算
- **死人过滤** — `excludeSpectator` 选项，通过 ghost 位掩码过滤观战/死亡目标
- **最低血量选择** — `Selector.getLowestHp()` 优先锁定残血目标
- **Loki ID 面板** — 320px 宽信息面板，展示 Name / Username，预留扩展

### Refactors

- **AuthPanel** — 统一认证面板替代三个 Folder，login/register tab 切换
- **auth 表单** — 提取 `createAuthForm` 共享逻辑，Login/Register 统一模板
- **bridge 模块** — 提取共享消息类型，ChatBox 封装 DOM 操作
- **auth 修复** — ambient 声明、安全注释、类型化错误、事件泄漏

### CI

- 新增 GitHub Actions CI workflow，push/PR 时自动 `pnpm check && pnpm build`

### Tests

- crypto 加解密 round-trip、HTTP 错误路径、真实 API smoke 测试
- Vector3 / Quaternion / EventBus 单元测试
- auth validation / error hierarchy / bridge types 单元测试

[v2.5.0]: https://github.com/snowflake-chan/lokibox/releases/tag/v2.5.0
[v2.4.1]: https://github.com/snowflake-chan/lokibox/releases/tag/v2.4.1
[v2.4.0]: https://github.com/snowflake-chan/lokibox/releases/tag/v2.4.0
[v2.3.6]: https://github.com/snowflake-chan/lokibox/releases/tag/v2.3.6
[v2.3.5]: https://github.com/snowflake-chan/lokibox/releases/tag/v2.3.5
[v2.3.4]: https://github.com/snowflake-chan/lokibox/releases/tag/v2.3.4
[v2.3.3]: https://github.com/snowflake-chan/lokibox/releases/tag/v2.3.3
