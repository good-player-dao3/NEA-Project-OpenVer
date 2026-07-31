---
title: "节点时间"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/time.html"
---

# 节点时间

NodeTime 是一个游戏时间管理系统,主要负责:

- 维护游戏的时间更新循环
- 控制组件和系统的更新顺序
- 管理时间缩放和时间扭曲效果

## 开始使用

### 1 基本操作

typescript

```
// 检查时间系统是否在运行
const isRunning = NodeTime.isRunning();

// 启动时间系统
NodeTime.start();

// 停止时间系统
NodeTime.stop();
```

### 2 时间缩放

时间缩放可以控制游戏时间流速:

typescript

```
// 正常速度
NodeTime.setTimeScale(1);

// 慢动作效果
NodeTime.setTimeScale(0.5);

// 快进效果
NodeTime.setTimeScale(2);

// 获取当前时间缩放
const currentScale = NodeTime.getTimeScale();
```

## 延时任务系统

### 1 创建延时任务

typescript

```
// 创建一个3秒后执行的任务
const taskId = NodeTime.setTimeout(() => {
  console.log("3秒后执行");
}, 3000);

// 取消任务
NodeTime.clearTimeout(taskId);
```

## 高级特性

### 2. 时间扭曲效果

typescript

```
// 参数1: 时间扭曲强度
// 参数2: 持续时间 (毫秒)
NodeTime.applyTimeWarp(2, 1000); // 在1秒内时间流速翻倍
```

## 实战示例

### 1 制作一个简单的倒计时系统

typescript

```
class CountdownSystem {
  private remainingTime: number;

  constructor(duration: number) {
    this.remainingTime = duration;
  }

  update(deltaTime: number) {
    this.remainingTime -= deltaTime;

    if (this.remainingTime <= 0) {
      console.log("倒计时结束！");
      return true;
    }

    console.log(`剩余时间: ${Math.ceil(this.remainingTime / 1000)}秒`);
    return false;
  }
}

// 使用示例
const countdown = new CountdownSystem(5000); // 5秒倒计时
```

### 2 制作慢动作效果

typescript

```
function createSlowMotionEffect(duration: number) {
  // 进入慢动作
  NodeTime.setTimeScale(0.2);

  // 设置定时器恢复正常速度
  NodeTime.setTimeout(() => {
    NodeTime.setTimeScale(1);
  }, duration);
}

// 使用示例
createSlowMotionEffect(2000); // 2秒的慢动作效果
```

## 注意事项

1. 刷新是影响全局节点的更新频率，因此需要谨慎使用。
2. 单次更新的最大时间间隔被限制在 1000ms (1 秒)
3. 在使用时间扭曲效果时,建议使用适度的强度值(1.0-3.0)

## 7. 进阶应用

### 1 组合使用时间效果

typescript

```
function createTimeEffect() {
  // 先使用时间扭曲
  NodeTime.applyTimeWarp(2, 1000);

  // 然后设置延迟任务实现连续效果
  NodeTime.setTimeout(() => {
    NodeTime.setTimeScale(0.5);

    NodeTime.setTimeout(() => {
      NodeTime.setTimeScale(1);
    }, 2000);
  }, 1000);
}
```
