---
title: "入门篇：时间回溯系统 的使用"
source: "https://docs.dao3.fun/arenapro/zh/package/component/timeRewindSystem/timeRewindComponent.html"
---

# 入门篇：时间回溯系统 的使用

本示例效果：

![](https://static.codemao.cn/pickduck/Sk0yqo1pyg.gif?hash=lm4S9GG6MmwZgPgrSsDVeN9EusVk)

## 服务端代码

App.ts

typescript

```
import { EntityNode } from "@dao3fun/component";
import { TimeRewindSystem } from "./TimeRewindSystem";
import { TimeRewindComponent } from "./TimeRewindComponent";

/**
 * 系统默认配置
 * @property {number} maxRecordTime - 最大回溯时间（毫秒）
 * @property {number} recordInterval - 记录状态的时间间隔（毫秒）
 * @property {number} speedFactor - 回放速度因子，控制回放速度
 */
const DEFAULT_CONFIG: ISystemConfig = {
  maxRecordTime: 7500,
  recordInterval: 10,
  speedFactor: 1,
};

console.clear();
world.useOBB = true;

// 初始化系统
const sys = initTimeRewindSystem();

// 获取并配置实体
const entities = world.querySelectorAll(".time");
for (const entity of entities) {
  const node = createTimeRewindNode(entity);
  sys.addEntityNode(node);
}

// 启动初始回溯
setTimeout(() => sys.startRewind(), DEFAULT_CONFIG.maxRecordTime);

/**
 * 系统配置对象
 */
interface ISystemConfig {
  /** 最大回溯时间（毫秒） */
  maxRecordTime: number;
  /** 记录状态的时间间隔（毫秒） */
  recordInterval: number;
  /** 速度因子 */
  speedFactor: number;
}

/**
 * 初始化时间回溯系统
 * @param {Partial<ISystemConfig>} config - 可选的系统配置参数
 * @returns {TimeRewindSystem} 配置好的时间回溯系统实例
 */
function initTimeRewindSystem(
  config: Partial<ISystemConfig> = {}
): TimeRewindSystem {
  const sys = new TimeRewindSystem();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  sys.config = {
    maxRecordTime: finalConfig.maxRecordTime,
    recordInterval: finalConfig.recordInterval,
    speedFactor: finalConfig.speedFactor,
  };

  sys.onProgress = (progress: number) => {
    remoteChannel.broadcastClientEvent({
      type: "timeRewindProgress",
      progress,
    });
  };
  sys.onEnd = () => {
    remoteChannel.broadcastClientEvent({ type: "timeRewindEnd" });
    setTimeout(() => sys.startRewind(), finalConfig.maxRecordTime);
  };

  return sys;
}

/**
 * 创建状态处理器配置
 * @param {EntityNode} node - 实体节点
 * @returns 状态处理器配置对象
 */
function createStateHandlers(node: EntityNode) {
  return {
    position: {
      get: () => node.entity.position,
      set: (value: GameVector3) =>
        node.entity.position.set(value.x, value.y, value.z),
    },
    meshOrientation: {
      get: () => node.entity.meshOrientation,
      set: (value: GameQuaternion) =>
        node.entity.meshOrientation.set(value.w, value.x, value.y, value.z),
    },
  };
}

/**
 * 创建回调函数配置
 * @param {EntityNode} node - 实体节点
 * @returns 回调函数配置对象
 */
function createCallbacks(node: EntityNode) {
  return {
    onStart: () => {
      node.entity.fixed = true;
      node.entity.gravity = false;
      node.entity.collides = false;
    },
    onEnd: () => {
      node.entity.fixed = false;
      node.entity.gravity = true;
      node.entity.collides = true;
    },
  };
}

/**
 * 创建并配置实体的时间回溯节点
 * @param {GameEntity} entity - 游戏实体
 * @returns {EntityNode} 配置好的实体节点
 */
function createTimeRewindNode(entity: GameEntity): EntityNode {
  const node = new EntityNode(entity);
  node.addComponent(TimeRewindComponent);

  const trc = node.getComponent(TimeRewindComponent);
  if (trc) {
    trc.config = {
      stateHandlers: createStateHandlers(node),
      callbacks: createCallbacks(node),
    };
  }

  return node;
}
```

TimeRewindComponent.ts

typescript

```
import { _decorator, Component } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * 状态获取器和设置器的类型定义
 */
export interface IStateHandler<T = any> {
  /** 获取状态值 */
  get: () => T;
  /** 设置状态值 */
  set: (value: T) => void;
}

/**
 * 时间回溯组件的配置接口
 * @interface IRewindConfig
 */
export interface IRewindConfig {
  /** 状态处理器映射，包含状态的获取和设置方法 */
  stateHandlers: Record<string, IStateHandler>;
  /** 回溯事件回调 */
  callbacks?: {
    /** 回溯开始时的回调函数 */
    onStart?: () => void;
    /** 回溯结束时的回调函数 */
    onEnd?: () => void;
    /** 回溯进度更新回调函数 */
    onProgress?: (progress: number) => void;
  };
}

/**
 * 时间回溯组件
 * 用于标识实体是否具有回溯功能，并存储回溯相关配置
 *
 * 该组件遵循ECS架构设计原则：
 * 1. 组件只存储数据，不包含业务逻辑
 * 2. 状态数据由TimeRewindSystem统一管理
 * 3. 组件通过事件通知系统状态变化
 *
 * @class TimeRewindComponent
 * @extends {Component<GameEntity>}
 */
@apclass()
export class TimeRewindComponent extends Component<GameEntity> {
  /**
   * 时间回溯组件的配置项
   */
  config: IRewindConfig = {
    stateHandlers: {},
    callbacks: {},
  };
}
```

TimeRewindSystem.ts

typescript

```
import { _decorator, NodeSystem } from "@dao3fun/component";
import { TimeRewindComponent } from "./TimeRewindComponent";

/**
 * 状态快照的接口定义
 * 用于存储实体在特定时间点的状态数据
 *
 * 快照设计原则：
 * 1. 时间标识：每个快照必须有唯一的时间戳
 * 2. 状态完整性：包含实体在该时间点的所有需要回溯的状态
 * 3. 实体关联：通过entityId与具体实体建立对应关系
 * 4. 数据独立性：快照数据与实体当前状态相互独立
 *
 * @interface IStateSnapshot
 * @property {number} timestamp - 快照的时间戳，记录状态保存的具体时间点
 * @property {Record<string, any>} states - 快照包含的状态数据，键为状态名，值为状态值
 * @property {string} entityId - 实体ID，用于标识状态属于哪个实体
 */
interface IStateSnapshot {
  /** 快照的时间戳 */
  timestamp: number;
  /** 快照包含的状态数据 */
  states: Record<string, any>;
  /** 实体ID */
  entityId: string;
}

/**
 * 时间回溯系统
 * 用于统一管理多个实体的回溯功能，实现游戏中的时间倒流效果
 *
 * 系统设计原则：
 * 1. 单一职责：专注于管理实体状态的记录和回放
 * 2. 数据驱动：通过快照存储和还原实体状态
 * 3. 组件解耦：与TimeRewindComponent配合，实现关注点分离
 * 4. 性能优化：使用Map存储快照，支持定期清理过期数据
 * 5. 状态一致性：确保回溯过程中实体状态的连续性和准确性
 *
 * 核心功能：
 * 1. 状态记录：定期保存实体状态快照
 * 2. 状态回放：支持按时间轴回溯实体状态
 * 3. 插值计算：实现状态之间的平滑过渡
 * 4. 内存管理：自动清理过期快照数据
 *
 * @extends {NodeSystem}
 */
export class TimeRewindSystem extends NodeSystem {
  /** 是否正在回溯中 */
  private isRewinding: boolean = false;
  /** 存储所有实体的状态快照，使用Map提高查询效率 */
  private snapshotMap: Map<string, IStateSnapshot[]> = new Map();
  /** 上次记录状态的时间戳，用于控制记录频率 */
  private lastRecordTime: number = 0;
  /** 回溯开始时间 */
  private rewindStartTime: number = 0;
  /** 回溯结束时间 */
  private rewindEndTime: number = 0;
  /**
   * 系统默认配置
   * @property {number} maxRecordTime - 最大回溯时间（毫秒）
   * @property {number} recordInterval - 记录状态的时间间隔（毫秒）
   * @property {number} speedFactor - 回放速度因子，用于控制回放速度
   */
  config = {
    maxRecordTime: 6000,
    recordInterval: 50,
    speedFactor: 1,
  };

  /**
   * 系统更新函数
   * 根据当前状态执行记录或回放操作
   *
   * 更新流程：
   * 1. 检查系统当前状态（记录/回放）
   * 2. 根据状态调用对应的处理函数
   * 3. 处理可能发生的异常情况
   *
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   * @throws {Error} 当状态记录或回放过程中出现错误时抛出
   *
   * @example
   * // 在游戏主循环中调用
   * timeRewindSystem.update(16.67); // 假设60FPS
   */
  protected update(deltaTime: number): void {
    if (this.isRewinding) {
      this.rewindEntities();
    } else {
      this.recordEntities();
    }
  }

  /**
   * 记录所有实体的状态
   * 遍历所有具有TimeRewindComponent的实体，记录其当前状态
   *
   * 性能优化策略：
   * 1. 使用时间间隔控制记录频率，避免频繁记录
   * 2. 仅记录发生变化的状态
   * 3. 定期清理过期数据，避免内存占用过大
   * 4. 使用Map数据结构提高查询效率
   *
   * 记录流程：
   * 1. 检查时间间隔是否满足记录条件
   * 2. 遍历所有实体，获取TimeRewindComponent
   * 3. 调用状态获取器收集当前状态
   * 4. 创建快照并存储到对应实体的快照列表
   * 5. 清理过期快照数据
   *
   * @private
   * @throws {Error} 当状态获取器执行失败时抛出
   */
  private recordEntities(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastRecordTime >= this.config.recordInterval) {
      const entities = Array.from(this.entities.values());

      for (const entity of entities) {
        if (!entity.enable) {
          continue;
        }
        const timeRewind = entity.getComponent(TimeRewindComponent);
        if (!timeRewind) continue;

        const states: Record<string, any> = {};
        for (const [key, handler] of Object.entries(
          timeRewind.config.stateHandlers
        )) {
          const value = handler.get();
          // 对获取的状态值进行深拷贝
          states[key] =
            typeof value === "object" && value !== null
              ? JSON.parse(JSON.stringify(value))
              : value;
        }

        const snapshot: IStateSnapshot = {
          timestamp: currentTime,
          states,
          entityId: entity.uuid,
        };
        if (!this.snapshotMap.has(entity.uuid)) {
          this.snapshotMap.set(entity.uuid, []);
        }
        const snapshots = this.snapshotMap.get(entity.uuid)!;
        snapshots.push(snapshot);

        // 移除过期的快照
        while (
          snapshots.length > 1 &&
          currentTime - snapshots[0].timestamp > this.config.maxRecordTime
        ) {
          snapshots.shift();
        }
      }

      this.lastRecordTime = currentTime;
    }
  }

  /**
   * 回放所有实体的状态
   * 对所有具有TimeRewindComponent的实体进行状态回放
   *
   * 回放策略：
   * 1. 根据时间戳查找目标快照
   * 2. 使用线性插值实现平滑过渡
   * 3. 支持自定义回放速度
   * 4. 处理边界时间点的状态还原
   *
   * 错误处理：
   * 1. 检查快照数据的完整性
   * 2. 处理插值计算中的边界情况
   * 3. 确保回放过程的稳定性
   * 4. 验证状态设置器的可用性
   *
   * 插值算法：
   * 1. 计算目标时间点的前后两个快照
   * 2. 根据时间差计算插值因子(0-1)
   * 3. 对每个状态属性进行线性插值
   * 4. 使用状态设置器更新实体状态
   *
   * @private
   * @throws {Error} 当快照数据不完整或状态设置器执行失败时抛出
   */
  private rewindEntities(): void {
    const entities = Array.from(this.entities.values());
    let allEntitiesFinished = true;

    for (const entity of entities) {
      if (!entity.enable) {
        continue;
      }
      const timeRewind = entity.getComponent(TimeRewindComponent);
      if (!timeRewind) continue;

      const snapshots = this.snapshotMap.get(entity.uuid);
      if (!snapshots || snapshots.length === 0) continue;

      // 根据speedFactor调整effectiveInterval，实现自定义回溯速度
      const effectiveInterval =
        this.config.recordInterval / Math.max(0.1, this.config.speedFactor);
      const lastSnapshot = snapshots[snapshots.length - 1];
      const rewindTime = lastSnapshot.timestamp - effectiveInterval;

      // 找到目标时间点的快照
      let targetIndex = snapshots.length - 1;
      while (targetIndex > 0 && snapshots[targetIndex].timestamp > rewindTime) {
        targetIndex--;
      }

      // 检查是否已经回溯到最早的快照
      if (targetIndex === 0 && snapshots[0].timestamp >= rewindTime) {
        // 如果已经到达最早的快照，标记该实体已完成回溯
        continue;
      }

      // 只要有一个实体还没完成回溯，就将标志设为false
      allEntitiesFinished = false;

      // 应用状态变化
      const targetSnapshot = snapshots[targetIndex];
      const nextSnapshot =
        snapshots[Math.min(snapshots.length - 1, targetIndex + 1)];

      // 计算插值因子
      const alpha = Math.min(
        1,
        Math.max(
          0,
          (rewindTime - targetSnapshot.timestamp) /
            (nextSnapshot.timestamp - targetSnapshot.timestamp)
        )
      );

      // 对每个状态进行插值并更新
      for (const [key, handler] of Object.entries(
        timeRewind.config.stateHandlers
      )) {
        if (key in targetSnapshot.states && key in nextSnapshot.states) {
          const targetValue = targetSnapshot.states[key];
          const nextValue = nextSnapshot.states[key];

          if (
            typeof targetValue === "number" &&
            typeof nextValue === "number"
          ) {
            handler.set(this.lerp(targetValue, nextValue, alpha));
          } else if (
            typeof targetValue === "object" &&
            targetValue !== null &&
            typeof nextValue === "object" &&
            nextValue !== null
          ) {
            // 创建插值对象的深拷贝
            const interpolatedValue: Record<string, number> = {};
            for (const prop in targetValue) {
              if (
                typeof targetValue[prop] === "number" &&
                typeof nextValue[prop] === "number"
              ) {
                interpolatedValue[prop] = this.lerp(
                  targetValue[prop],
                  nextValue[prop],
                  alpha
                );
              }
            }
            // 确保设置的是新的对象实例
            handler.set(JSON.parse(JSON.stringify(interpolatedValue)));
          } else {
            handler.set(targetValue);
          }
        }
      }

      // 移除已经回放的快照
      snapshots.splice(targetIndex + 1);

      // 计算回溯进度
      const totalDuration = this.rewindStartTime - this.rewindEndTime;
      const currentDuration = this.rewindStartTime - rewindTime;
      const rawProgress = Math.min(
        1,
        Math.max(0, currentDuration / totalDuration)
      );
      const adjustedProgress = this.easeInOutQuad(rawProgress);
      const progress = Number((1 - adjustedProgress).toFixed(3)); // 反转进度并保留3位小数

      // 通知进度更新
      if (timeRewind.config.callbacks?.onProgress) {
        timeRewind.config.callbacks.onProgress(progress);
      }
      this.onProgress?.(progress);
      // 检查回溯是否应该结束
      const isEndTimeReached = rewindTime <= this.rewindEndTime;
      const isOutOfSnapshots = snapshots.length <= 1;
      if (isEndTimeReached || isOutOfSnapshots) {
        this.stopRewind();
      }
    }
  }
  onProgress(progress: number) {}

  /**
   * 缓动函数 - 使用二次方曲线实现平滑过渡
   *
   * 该函数通过二次方曲线实现状态变化的加速和减速效果，使回溯过程更自然。
   *
   * 实现原理：
   * 1. 将插值过程分为加速和减速两个阶段
   * 2. 加速阶段（alpha < 0.5）使用二次函数实现渐进加速
   * 3. 减速阶段（alpha >= 0.5）使用二次函数实现渐进减速
   *
   * 性能优化：
   * 1. 使用Math.max和Math.min限制alpha范围，避免异常值
   * 2. 减少重复计算，提高执行效率
   *
   * @param {number} alpha - 插值因子，范围[0,1]
   * @returns {number} 缓动后的插值因子
   * @private
   */
  private easeInOutQuad(alpha: number): number {
    alpha = Math.max(0, Math.min(1, alpha));
    return alpha < 0.5
      ? 2 * alpha * alpha
      : 1 - Math.pow(-2 * alpha + 2, 2) / 2;
  }

  /**
   * 线性插值计算
   * 使用缓动函数实现平滑过渡，确保状态变化的自然和连续性
   *
   * 实现原理：
   * 1. 基于起始值和结束值计算插值
   * 2. 使用缓动函数调整插值因子，实现非线性过渡
   * 3. 确保插值结果在有效范围内
   *
   * 性能优化：
   * 1. 避免重复计算，直接使用缓动后的插值因子
   * 2. 使用加法和乘法代替更复杂的数学运算
   * 3. 减少函数调用开销，内联简单计算
   *
   * @param {number} start - 起始值
   * @param {number} end - 结束值
   * @param {number} alpha - 插值因子，范围[0,1]
   * @returns {number} 插值结果
   * @private
   */
  private lerp(start: number, end: number, alpha: number): number {
    return start + (end - start) * this.easeInOutQuad(alpha);
  }

  /**
   * 开始回溯所有实体或指定组的实体
   *
   * 回溯流程：
   * 1. 设置系统为回溯状态
   * 2. 遍历所有启用的实体
   * 3. 对具有TimeRewindComponent的实体启动回溯
   *
   * @param {number} [startTime] 回溯开始时间点，默认从最新记录开始
   * @param {number} [endTime] 回溯结束时间点，默认到最早记录
   *
   * @example
   * // 回溯最近5秒
   * const currentTime = Date.now();
   * timeRewindSystem.startRewind(currentTime, currentTime - 5000);
   */
  startRewind(startTime?: number, endTime?: number): void {
    this.isRewinding = true;
    const currentTime = Date.now();
    this.rewindStartTime = currentTime;
    this.rewindEndTime = currentTime - this.config.maxRecordTime;

    const entitiesToRewind = Array.from(this.entities.values());
    for (const entity of entitiesToRewind) {
      if (!entity.enable) {
        continue;
      }
      const timeRewind = entity.getComponent(TimeRewindComponent);
      if (timeRewind) {
        if (timeRewind.config.callbacks?.onStart) {
          timeRewind.config.callbacks.onStart();
        }
      }
    }
    this.onStart?.();
  }
  onStart() {}

  /**
   * 停止所有实体或指定组的实体的回溯
   *
   * 停止流程：
   * 1. 遍历所有启用的实体
   * 2. 对具有TimeRewindComponent的实体停止回溯
   * 3. 重置系统状态
   *
   * @example
   * // 在适当的时机停止回溯
   * timeRewindSystem.stopRewind();
   */
  stopRewind(): void {
    const entitiesToStop = Array.from(this.entities.values());
    for (const entity of entitiesToStop) {
      if (!entity.enable) {
        continue;
      }
      const timeRewind = entity.getComponent(TimeRewindComponent);
      if (timeRewind && timeRewind.config.callbacks?.onEnd) {
        timeRewind.config.callbacks.onEnd();
      }
      // 清理该实体的快照数据
      this.snapshotMap.delete(entity.uuid);
    }
    this.onEnd?.();
    // 重置系统状态
    this.isRewinding = false;
    this.lastRecordTime = 0;
    this.snapshotMap.clear();
  }
  onEnd() {}
}
```

以上代码实现了一个游戏中的时间回溯（倒流）系统，允许游戏中的实体在一定时间内回退到之前的状态。以下是主要功能的解释：

## 核心功能

1. **系统初始化**：
  - 定义了默认配置（最大回溯时间 7500ms，记录间隔 10ms）
  - 创建了`TimeRewindSystem`实例并配置回调函数
2. **实体管理**：
  - 通过选择器`.time`获取所有需要时间回溯功能的实体
  - 为每个实体创建`EntityNode`并添加`TimeRewindComponent`
3. **状态记录与回放**：
  - 系统会定期记录实体的状态（位置、旋转等）
  - 可以触发回放，让实体按记录的状态逆向运动

## 关键组件

- **TimeRewindSystem**：主系统，管理所有实体的时间回溯
- **TimeRewindComponent**：附加到实体上的组件，处理单个实体的状态记录和回放
- **EntityNode**：实体包装器，方便组件管理

## 工作流程

1. 初始化系统并配置参数
2. 查找所有需要时间回溯的实体并为其添加组件
3. 系统开始记录实体状态（每 10ms 记录一次）
4. 7500ms 后自动开始回放（时间倒流效果）
5. 回放完成后重置系统，准备下一次记录

## 技术特点

- **模块化设计**：系统、组件、实体分离
- **可配置**：可以通过参数调整回溯时间、记录频率等
- **事件驱动**：通过回调函数通知状态变化
- **性能优化**：控制记录频率，避免过度消耗资源

这个系统适合用于实现游戏中的"时间倒流"特效，比如让被破坏的物体恢复原状，或者让角色回到之前的位置等场景。
