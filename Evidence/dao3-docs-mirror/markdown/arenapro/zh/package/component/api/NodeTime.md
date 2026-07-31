---
title: "方法"
source: "https://docs.dao3.fun/arenapro/zh/package/component/api/NodeTime.html"
---

# 方法

#### start(): void

启动时间系统，启用后全局节点开始参与刷新。

#### isRunning(): boolean

检查时间系统是否正在运行。

#### setTimeScale(scale: number): void

设置 dt 时间缩放因子，你可以使用它来加速或减速时间的流逝。

默认值为 1.0，值大于 1 表示加速，值小于 1 表示降速。

> 注意：时间缩放因子会影响所有节点的时间更新，包括全局节点。

> 请谨慎使用时间缩放因子，以避免出现意外的行为。

> 警告：时间缩放因子可能会导致节点之间的时间不一致，这可能会导致游戏逻辑错误。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| scale | 是 |  | number | 时间缩放因子 |

#### getTimeScale(): number

获取 dt 时间缩放因子

#### setTimeout(callback: () => void, delay: number): number

添加延时任务，刷新率和节点刷新频率相同。

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| callback | 是 |  | ()=>void | 回调函数 |
| delay | 是 |  | number | 延迟时间（毫秒） |

**返回值**

| **类型** | **说明** |
| --- | --- |
| number | 任务 ID |

#### clearTimeout(taskId: number): boolean

清除延时任务

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| taskId | 是 |  | number | 任务 ID |

#### stop(): void

暂时停止时间系统

#### applyTimeWarp(intensity: number, duration: number): void

应用时间扭曲效果

**输入参数**

| ***参数*** | ***必填*** | ***默认值*** | ***类型*** | ***说明*** |
| --- | --- | --- | --- | --- |
| intensity | 是 |  | number | 时间扭曲强度 |
| duration | 是 |  | number | 持续时间（毫秒） |
