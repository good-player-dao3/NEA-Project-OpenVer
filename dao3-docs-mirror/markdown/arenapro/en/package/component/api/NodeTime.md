---
title: "Methods"
source: "https://docs.dao3.fun/arenapro/en/package/component/api/NodeTime.html"
---

# Methods

#### start(): void

Starts the time system. Once enabled, global nodes begin to participate in the update cycle.

#### isRunning(): boolean

Checks if the time system is currently running.

#### setTimeScale(scale: number): void

Sets the`dt`time scale factor. You can use this to speed up or slow down the passage of time.

The default value is 1.0. A value greater than 1 means acceleration, and a value less than 1 means deceleration.

> Note: The time scale factor affects the time updates of all nodes, including global nodes.

> Please use the time scale factor with caution to avoid unexpected behavior.

> Warning: The time scale factor may cause time inconsistencies between nodes, which could lead to game logic errors.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| scale | Yes |  | number | The time scale factor |

#### getTimeScale(): number

Gets the`dt`time scale factor.

#### setTimeout(callback: () => void, delay: number): number

Adds a delayed task. The update rate is the same as the node's update frequency.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| callback | Yes |  | ()=>void | The callback function |
| delay | Yes |  | number | The delay time in milliseconds |

**Return Value**

| **Type** | **Description** |
| --- | --- |
| number | The task ID |

#### clearTimeout(taskId: number): boolean

Clears a delayed task.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| taskId | Yes |  | number | The task ID |

#### stop(): void

Temporarily stops the time system.

#### applyTimeWarp(intensity: number, duration: number): void

Applies a time warp effect.

**Input Parameters**

| ***Parameter*** | ***Required*** | ***Default*** | ***Type*** | ***Description*** |
| --- | --- | --- | --- | --- |
| intensity | Yes |  | number | The time warp intensity |
| duration | Yes |  | number | The duration in milliseconds |
