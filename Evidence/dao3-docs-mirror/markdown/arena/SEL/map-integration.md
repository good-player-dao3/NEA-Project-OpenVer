---
title: "SEL 神岛精英联赛｜赛事地图技术开发与集成规范"
source: "https://docs.dao3.fun/arena/SEL/map-integration.html"
---

# SEL 神岛精英联赛｜赛事地图技术开发与集成规范

本文档为 SEL 神岛精英联赛（Shen Island Elite League）的地图开发者提供严格的技术标准与集成规范。地图必须遵循本规范，以确保与中控系统、直播流以及数据统计平台的稳定对接。

## 简介

本文档面向地图/玩法开发者与工具集成方，说明如何使用`@dao3fun/live-sdk`完成：

- 只读赛程数据获取（`LiveEvent`）
- 实时比分与玩家扩展上报（`LiveUpdater`）
- 高光/弹幕事件推送与取消
- 时间对齐、数据刷新与事件订阅

## 为什么要对接

- **统一赛程来源**：避免地图端硬编码队伍/阵容/开赛时间，减少错配。
- **直播联动**：平台可基于上报数据自动渲染直播主/副屏与赛况面板。
- **减少重复开发**：通用上报/合并/重试/节流逻辑由 SDK 承担。
- **稳定与可观测**：数据有版本与类型约束；支持查询已上报结果用于联调。
- **扩展能力**：支持高光抢镜与弹幕，增强赛事观感与导演能力。

## 对接方式概览

- **数据读取（只读）**：`LiveEvent`
  - 赛程/队伍/地图：`getCurrentMatch()`、`getCurrentMatchMap()`、`getTeams()`
  - 时间工具：`setNowSecOverride()`、`useRealTime()`、`getCountdownToNextMatch()`
  - 事件：`onUpdate()`、`onError()`、`onPlayerUpdate()`
  - 视图辅助：`getScreenType()`、`getPlayerUiHidden()`
- **数据上报（写入）**：`LiveUpdater`
  - 比分/玩家扩展：`pushFromMatch(match, scores, playerExtras)`（建议 1s 周期）
  - 高光：`pushHighlightNow(match, highlight)`/`stopHighlightNow(match)`
  - 弹幕：`pushDanmakuNow(match, danmaku)`
- **运行时策略**：
  - 环境切换：`await live.useTestData(true|false)`或`useCustomUrl()`
  - 手动刷新：`await live.refreshNow()`；内部已短周期轮询
  - 频控与重试：SDK 内置节流（≥10ms），并支持重试参数

## 一、总则与概述

- 强制唯一依赖：`@dao3fun/live-sdk`
- 所有数据交互一律通过 SDK 完成；禁止绕过 SDK 直接调用平台内部接口。
- 时间一律使用“秒级 Unix 时间（number）”。建议以 SDK 返回时间或系统 NTP 对时为准，避免时序错位。

### 1.1 职责与依赖

- 地图侧：实现玩法逻辑、镜头系统；按规范上报数据；不得自启动/自结束比赛。
- 中控/平台侧：赛程编排、UI 展示、数据聚合与播控。
- 参考 API 文档：[https://www.npmjs.com/package/@dao3fun/live-sdk](https://www.npmjs.com/package/@dao3fun/live-sdk)

### 1.2 安装与版本

bash

```
npm install @dao3fun/live-sdk
```

### 1.3 环境与认证

- SDK Key：由工作人员分发，每张地图唯一，不得硬编码在仓库。
- 推荐环境变量：
  - `LIVE_SDK_KEY`：上报鉴权 Key（staging/prod 分开）。
- Key 轮换与失效：平台可定期轮换；地图需在初始化失败/鉴权失败时展示可恢复的错误与重试策略。

## 二、快速上手与对接规范

直播预览由两个窗口组成：

![](https://assets.box3.fun/u226/AIMwW7omj2gm/XWy7hSoIKIxOrCUHD-4397mhExEdc7mImdS8hZnJzG0.png)

- 主窗口：`live`
- 副窗口：`live_mini`（用于镜头展示，可在高光时做“抢镜”）

### 2.1 权限与控制管理

- 中控权限：仅对`controller`（中控员）与`commentator`（解说员）可见可操作。
- 生命周期权责：`Start/End/Reset`由中控员/解说员触发；地图端其他任何人不得自启动/自结束。
- 上报 Key：正式 Key 由工作人员下发；测试与生产环境需区分。

### 2.2 比赛生命周期（地图端遵循）

- 启动：`OnMatchInit -> OnMatchStart`
- 结束：`OnMatchEnd`

#### 2.2.1 初始化（OnMatchInit）

- 目标：拉取赛程配置，定位当前场次，动态初始化阵营/出生点/资源归属等。
- 实现：使用 SDK（如`getCurrentMatch()`）获取只读配置；严禁硬编码队伍与阵营。

#### 2.2.2 进行中（OnMatchStart）

- 目标：周期性上报比分与玩家扩展，用于联赛面板/直播展示。
- 频率建议：每 1s；平台上限不超过 1 次/秒；波动时允许短时补发但不超过 5 条/秒。
- 仅上报“当前场次”，历史合并由 SDK/平台自动完成。
- `live_mini`：地图内不得渲染 HUD/提示/按钮（避免遮挡）。

#### 2.2.3 结束（OnMatchEnd）

- 达成胜利条件后：
  - 播放胜利动画/特效；
  - 锁定玩家操作；
  - 启动 30s 计时：计时结束清理比分和队伍 KDA 等信息，等待中控开启下一局；
  - 结束态期间不再上报新比分/事件。

## 三、直播与观战系统集成

### 3.1 观战镜头系统原则

1. 冲突优先：快速聚焦交火区域
2. 叙事性：关键资源点/要道应利于镜头讲故事
3. 稳定性：团战建议自由视角展示全局，避免频繁切 POV

### 3.2 机位定义与支持

- 预置三类机位供 OB 切换：
  - 全局视角（Global Cam）
  - 选手 POV（Player Cam）
  - 自由视角（Free Cam）
- 镜头控制不在当前 SDK，需地图自研。
- `live_mini`主要用于镜头展示，并可自动切换。
- 快捷键建议：`0-9`用于不同镜头位；

### 3.3 高光时刻事件埋点

![](https://assets.box3.fun/u226/AIMwW7omj2gm/KPHI6jetEoHh82qZbnfwknsyWlVUERFoiju19_K26tQ.png)

- 建议埋点场景：多杀、残局、目标击破等。
- 单一高光模型：同一时间只展示一个高光；新高光覆盖旧高光。
- SDK API（以文档为准）：
  - `pushHighlightNow(match, highlight: LiveUpdateHighlight)`：立即触发高光。
  - `stopHighlightNow(match)`：立即取消当前高光。
- 平台行为：
  - `immediate: true`时，平台侧在`live_mini`做放大/抢镜，持续时长由平台策略控制或通过`stopHighlightNow()`立即终止。
  - 若`reason`为空，平台将忽略并/或清空当前高光。

### 3.4 实时数据供给（比分/玩家扩展）

- 通过`LiveUpdater.pushFromMatch()`实时上报（建议每 1s）。
- 同一`startTime`的增量会被合并；地图端无需回放历史。

### 3.5 弹幕（即时接口，单一高光模型之外的瞬时提示）

- 适用：团战爆发、目标击破等需要在直播端强调的瞬时事件。
- API：`pushDanmakuNow(match, danmaku: LiveDanmaku)`
- 频控：建议 ≤ 5 条/秒；重复内容可能被平台合并/丢弃。

## 四、数据规范与强类型

### 4.1 上报数据的最小必要字段（建议）

- 比赛标识：`startTime`（秒，number）；`matchId`（可选）。
- 队伍比分：`teamA.score`、`teamB.score`（number）。
- 玩家扩展：
  - `players[].id`（number，队员 ID）
  - `players[].kda`（string，如`"10/2/5"`）
  - `players[].score`（number，可选）
  - `players[].hp`或`players[].health`（number，二选一）

### 4.2 高光接口类型（示例）

ts

```
export type LiveUpdateHighlight = {
  reason: string; // 高光文案，非空
  teamNames?: string[]; // 关联队伍名称（与 MatchTeam.name 对齐）
  playerIds?: (number | string)[];
  immediate?: boolean; // true 时平台可触发 live_mini 抢镜
};
```

### 4.3 弹幕接口类型（示例）

ts

```
export type LiveDanmaku = {
  text: string; // 文本，非空
};
```

## 五、代码示例（TypeScript）

> 说明：以下示例基于 SDK 提供的典型接口命名（以官方 SDK 文档为准）。

ts

```
import {
  LiveEvent,
  LiveUpdater,
  type LiveUpdatePlayer,
} from "@dao3fun/live-sdk";

const live = LiveEvent.getInstance();
const updater = new LiveUpdater({ key: "your_report_key" });

// 1) 周期性上报比分与玩家扩展（每 1s）
setInterval(async () => {
  const match = live.getCurrentMatch(); // 只读；由中控指定当前场次
  if (!match) return;

  const scores = { teamA: 3, teamB: 2 };
  const extras: Record<number, Partial<LiveUpdatePlayer>> = {
    101: { score: 120, hp: 85, kda: "5/2/3" },
  };
  await updater.pushFromMatch(match, scores, extras);
}, 1000);

// 2) 高光触发与取消
async function aceHighlight(team: "A" | "B") {
  const match = live.getCurrentMatch();
  if (!match) return;
  await updater.pushHighlightNow(match, {
    reason: team === "A" ? "Team A ACE!" : "Team B ACE!",
    teamNames: [match.teamA.name],
    immediate: true,
  });
}

async function clearHighlight() {
  const match = live.getCurrentMatch();
  if (!match) return;
  await updater.stopHighlightNow(match);
}

// 3) 弹幕
async function notifyDragon() {
  const match = live.getCurrentMatch();
  if (!match) return;
  await updater.pushDanmakuNow(match, {
    text: "远古龙已刷新！",
  });
}
```

- 运行中的完整演示可参考：`server/src/examples/highlightDanmakuDemo.ts`

## 六、观战与`live_mini`约束

- `live_mini`不渲染 HUD/按钮/UI，避免遮挡。
- 平台可能在高光期间自动切换镜头或抢镜；地图侧切换应避免与平台策略冲突（可读取只读屏幕类型，如`getScreenType()`作为辅助）。
- 快捷键建议：`0-9`定义机位。

## 七、性能、安全与稳定性

- 上报频率与大小限制：
  - 建议 1 次/秒，上限不超过 1 次/秒；波动补发不超过 5 条/秒。
  - 单次 payload ≤ 32KB；玩家列表人数按玩法规模评估并给出上限（建议在联调前确认）。
- 错误处理：
  - 网络异常使用指数退避重试；超过 N 次降级为本地缓冲，恢复后补上报；
  - SDK 初始化/鉴权失败应提示并可重试；
  - OnMatchEnd 必须清理定时器/监听器，防止泄漏。

## 八、对接检查清单（Checklist）

- [ ] 已安装并初始化`@dao3fun/live-sdk`；设置`LIVE_SDK_KEY`。
- [ ] 使用`getCurrentMatch()`绑定阵营（无硬编码）。
- [ ] 定时`pushFromMatch()`上报比分与玩家扩展（≥1s）。
- [ ]`live_mini`不渲染 UI；支持只读`getScreenType()`。
- [ ] 高光触发/取消（`pushHighlightNow`/`stopHighlightNow`）与覆盖逻辑验证通过。
- [ ] 弹幕`pushDanmakuNow()`验证通过（含频控）。
- [ ]`OnMatchEnd`后保持 30s 结束态并清理状态；期间不再上报。
- [ ] 断网 30s 恢复后可继续上报（包含重试/补发）。
- [ ] 压力测试通过：持续 N 分钟上报无崩溃、无内存泄漏。
- [ ] 通过平台 GET 校验接口验证上报结果（key 一致）。

## 九、变更与版本策略

- 建议在文档头部注明适配的 SDK 最小版本与变更记录链接。
- 当 SDK 发生破坏性变更（breaking changes）时，及时更新本规范与示例。

如需样例工程或模板，请联系平台支持。本文档会根据 SDK 能力与联赛需求持续更新。

## 术语表（Glossary）

- **LiveEvent**：只读赛程/赛事配置管理，提供当前场次查询与时间工具。
- **LiveUpdater**：上报器，将比分、玩家扩展、高光、弹幕推送到平台。
- **Match/MatchTeam**：赛程与对阵快照，包含出场`players`。
- **live**/**live_mini**：直播主屏/副屏渲染模式。
- **Highlight（高光）**：平台侧“单一高光”模型，新的覆盖旧的。
- **Danmaku（弹幕）**：即时提示类文本消息。

## 测试与联调指南

- **静态测试数据**：`await live.useTestData(true)`固定数据集，便于对齐 UI。
- **时间对齐**：`setNowSecOverride(sec)`固定时间复现边界场景；结束后`useRealTime()`。
- **查询已上报数据**：GET`https://api.box3lab.com/get_redis_value?key=<你的key>`。

## 常见问题 FAQ

- **Q: 没有当前比赛返回？**
  - A: 检查当前时间是否位于某场`Match.startTime`与下一场之间；或启用测试源/时间覆盖。
- **Q: 上报成功但前端不显示？**
  - A: 核对`startTime`与出场`players.id`是否与赛程匹配；`teamNames`是否与`MatchTeam.name`一致。
- **Q: 频率限制？**
  - A: 建议 1 次/秒；短时补发不超过 5 条/秒；单次载荷 ≤ 32KB。
- **Q: 为什么高光没有展示/不抢镜？**
  - A: 请确保传入非空`reason`，并在需要时设置`immediate: true`。可通过`stopHighlightNow()`主动结束。
- **Q:`teamNames`或`playerIds`不生效？**
  - A:`teamNames`必须与`MatchTeam.name`精确一致；`playerIds`须与赛程出场列表一致，类型可为 number|string，但需与平台侧约定保持一致。
- **Q:`pushFromMatch()`之后查询接口没有立刻更新？**
  - A: SDK 有最小 10ms 节流与网络重试；同时平台读端可能有极短缓存，建议稍后再次查询。
- **Q: 单次提交被拒或丢弃？**
  - A: 检查频率是否超过限制、payload 是否超过 32KB、或字段不符合类型约束（如`players[].id`缺失）。
- **Q: 测试/生产环境切换不起作用？**
  - A: 确认是否调用了`await live.useTestData(true|false)`或`useCustomUrl()`，并在切换后调用`await live.refreshNow()`以立即拉取。
- **Q: 时间相关功能表现异常（错位/卡住）？**
  - A: 若使用了`setNowSecOverride()`，请在测试结束后调用`useRealTime()`取消覆盖；确保系统时间同步（NTP）。
- **Q: 多地图实例时出现状态串扰？**
  - A:`LiveEvent`为单例，请在同一进程中复用；不同进程/房间应独立运行，避免共享全局状态。
- **Q: 查询到的历史未合并/出现重复场次？**
  - A: 合并依据为同一`startTime`；确保连续上报使用相同的`startTime`，避免误判为新场次。
- **Q: 结束后仍持续上报/内存泄漏？**
  - A: 在`OnMatchEnd`清理`setInterval`和订阅（`onUpdate/onError`返回的 off 函数）。
- **Q: 如何快速验证上报是否成功？**
  - A: 使用 GET`https://api.box3lab.com/get_redis_value?key=<你的key>`查看存储值；确保与`LiveUpdater`构造时的`key`一致。
- **Q: 发生网络不稳定时如何提高成功率？**
  - A: 在`LiveUpdater`里配置`maxRetries`与`retryDelayMs`；建议开启指数退避并记录错误日志做观测。
- **Q: 直播副屏（live_mini）没有切到镜头/画面被遮挡？**
  - A: 请确认地图端未在`live_mini`模式渲染 HUD/按钮/提示（会遮挡/干扰切换）。可使用只读`getScreenType()`做条件渲染。高光`immediate: true`可触发抢镜，结束时调用`stopHighlightNow()`。
- **Q: 临时换人/紧急改阵容如何处理？**
  - A: 使用`getLineupDiffForTeam(teamId)`快速定位“在场但不在队伍配置/在队伍配置但未上场”的差异。上报时`players.id`必须与当前出场一致；若赛程确需调整，请在平台侧更新`GameCfg`或联系中控处理。
