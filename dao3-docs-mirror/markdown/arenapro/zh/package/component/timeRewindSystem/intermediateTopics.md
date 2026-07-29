---
title: "进阶篇：回溯系统核心概念与实现"
source: "https://docs.dao3.fun/arenapro/zh/package/component/timeRewindSystem/intermediateTopics.html"
---

# 进阶篇：回溯系统核心概念与实现

## 1. 系统概述

时间回溯系统用于实现游戏中的时间倒流效果，可以记录和回放实体的状态变化。主要功能包括：

- 状态记录：自动记录实体的位置和方向
- 状态回放：支持倒流回放之前的状态
- 物理控制：自动管理回溯过程中的物理属性

## 2. 快速开始

### 2.1 初始化系统

typescript

```
import { TimeRewindSystem } from "./TimeRewindSystem";

// 使用默认配置初始化
const sys = initTimeRewindSystem();

// 或使用自定义配置
const sys = initTimeRewindSystem({
  maxRecordTime: 10000, // 记录10秒
  recordInterval: 20, // 每20ms记录一次
  speedFactor: 1.5, // 1.5倍回放速度
});
```

### 2.2 添加实体

typescript

```
// 方式1：单个实体
const entity = world.querySelector("#time");
const node = createTimeRewindNode(entity);
sys.addEntityNode(node);

// 方式2：批量添加
const entities = world.querySelectorAll(".time");
entities.forEach((entity) => {
  const node = createTimeRewindNode(entity);
  sys.addEntityNode(node);
});
```

### 2.3 控制回溯

typescript

```
// 开始回溯
sys.startRewind();

// 停止回溯
sys.stopRewind();
```

## 3. 配置项说明

### 3.1 系统配置

typescript

```
interface ISystemConfig {
  maxRecordTime: number; // 最大记录时间（毫秒）
  recordInterval: number; // 记录间隔（毫秒）
  speedFactor: number; // 回放速度倍率
}
```

### 3.2 状态处理器

typescript

```
const stateHandlers = {
  position: {
    get: () => entity.position,
    set: (value) => entity.position.set(value.x, value.y, value.z),
  },
  meshOrientation: {
    get: () => entity.meshOrientation,
    set: (value) =>
      entity.meshOrientation.set(value.w, value.x, value.y, value.z),
  },
};
```

### 3.3 回调函数

typescript

```
const callbacks = {
  onStart: () => {
    // 回溯开始时的处理
  },
  onEnd: () => {
    // 回溯结束时的处理
  },
};
```

## 4. 事件监听

### 4.1 进度监听

typescript

```
sys.onProgress = (progress: number) => {
  console.log(`回溯进度: ${progress}%`);
};
```

### 4.2 结束监听

typescript

```
sys.onEnd = () => {
  console.log("回溯结束");
};
```

## 5. 最佳实践

### 5.1 性能优化

- 合理设置`recordInterval`，避免过于频繁的状态记录
- 只为需要回溯的实体添加组件
- 根据实际需求调整`maxRecordTime`

### 5.2 实体标记

建议使用标签记录需要回溯的实体

### 5.3 错误处理

typescript

```
try {
  const node = createTimeRewindNode(entity);
  sys.addEntityNode(node);
} catch (error) {
  console.error("添加回溯节点失败:", error);
}
```

## 6. 注意事项

1. 确保实体具有正确的物理属性设置
2. 回溯过程中实体的物理属性会被临时修改
3. 系统会自动处理远程同步事件
4. 回溯结束后实体会恢复原有的物理属性
