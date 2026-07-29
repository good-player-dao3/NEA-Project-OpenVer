---
title: "节点事件系统"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/event-node.html"
---

# 节点事件系统

节点事件系统是组件间通信的重要机制，它提供了一种松耦合的方式让组件之间进行交互。

## 基础用法

### 事件监听和触发

typescript

```
@apclass("EventDemo")
class EventDemo extends Component<GameEntity> {
  start() {
    // 监听事件
    this.node.on("scoreChange", this.onScoreChange, this);

    // 触发事件
    this.node.emit("scoreChange", 100);
  }

  private onScoreChange(score: number) {
    console.log(`分数变化: ${score}`);
  }

  onDestroy() {
    // 清理事件监听
    this.node.off("scoreChange", this.onScoreChange, this);
  }
}
```

### 一次性事件监听

typescript

```
@apclass("OneTimeEventDemo")
class OneTimeEventDemo extends Component<GameEntity> {
  start() {
    // 只监听一次事件
    this.node.once("gameStart", () => {
      console.log("游戏开始！");
    });
  }
}
```

## 全局事件系统

### 使用全局事件总线

typescript

```
import { Emitter, Component } from "@dao3fun/component";

@apclass("GlobalEventDemo")
class GlobalEventDemo extends Component<GameEntity> {
  start() {
    // 监听全局事件
    Emitter.on("playerJoin", this.onPlayerJoin, this);

    // 触发全局事件
    Emitter.emit("playerJoin", { id: 1, name: "玩家1" });
  }

  private onPlayerJoin(player: any) {
    console.log(`玩家加入: ${player.name}`);
  }

  onDestroy() {
    // 清理全局事件监听
    Emitter.off("playerJoin", this.onPlayerJoin, this);
  }
}
```

## 实战示例

### 游戏状态管理系统

typescript

```
// 游戏状态管理器
@apclass("GameStateManager")
class GameStateManager extends Component<GameEntity> {
  private score: number = 0;
  private gameState: "idle" | "playing" | "paused" | "over" = "idle";

  start() {
    // 监听游戏相关事件
    this.node.on("startGame", this.startGame, this);
    this.node.on("pauseGame", this.pauseGame, this);
    this.node.on("resumeGame", this.resumeGame, this);
    this.node.on("gameOver", this.gameOver, this);
    this.node.on("addScore", this.addScore, this);
  }

  private startGame() {
    this.gameState = "playing";
    this.score = 0;
    this.node.emit("gameStateChanged", this.gameState);
  }

  private pauseGame() {
    this.gameState = "paused";
    this.node.emit("gameStateChanged", this.gameState);
  }

  private resumeGame() {
    this.gameState = "playing";
    this.node.emit("gameStateChanged", this.gameState);
  }

  private gameOver() {
    this.gameState = "over";
    this.node.emit("gameStateChanged", this.gameState);
    this.node.emit("finalScore", this.score);
  }

  private addScore(points: number) {
    this.score += points;
    this.node.emit("scoreUpdated", this.score);
  }

  onDestroy() {
    // 清理所有事件监听
    this.node.off("startGame", this.startGame, this);
    this.node.off("pauseGame", this.pauseGame, this);
    this.node.off("resumeGame", this.resumeGame, this);
    this.node.off("gameOver", this.gameOver, this);
    this.node.off("addScore", this.addScore, this);
  }
}

// UI 控制器
@apclass("UIController")
class UIController extends Component<GameEntity> {
  start() {
    // 监听游戏状态变化
    this.node.on("gameStateChanged", this.updateUI, this);
    this.node.on("scoreUpdated", this.updateScore, this);
    this.node.on("finalScore", this.showGameOver, this);
  }

  private updateUI(state: string) {
    console.log(`更新UI状态: ${state}`);
  }

  private updateScore(score: number) {
    console.log(`更新分数显示: ${score}`);
  }

  private showGameOver(finalScore: number) {
    console.log(`游戏结束，最终分数: ${finalScore}`);
  }

  onDestroy() {
    this.node.off("gameStateChanged", this.updateUI, this);
    this.node.off("scoreUpdated", this.updateScore, this);
    this.node.off("finalScore", this.showGameOver, this);
  }
}
```

## 最佳实践

### 1. 事件命名规范

typescript

```
// 使用动词+名词的形式
this.node.emit("playerSpawn"); // ✅ 好的命名
this.node.emit("spawnPlayer"); // ✅ 好的命名
this.node.emit("player"); // ❌ 不好的命名

// 使用驼峰命名法
this.node.emit("scoreUpdate"); // ✅ 好的命名
this.node.emit("score_update"); // ❌ 不好的命名
```

### 2. 事件参数传递

typescript

```
@apclass("EventParamsDemo")
class EventParamsDemo extends Component<GameEntity> {
  start() {
    // 传递单个参数
    this.node.emit("scoreChange", 100);

    // 传递多个参数
    this.node.emit("playerUpdate", {
      health: 100,
      position: { x: 0, y: 0, z: 0 },
      status: "active",
    });
  }
}
```

### 3. 事件清理

typescript

```
@apclass("EventCleanupDemo")
class EventCleanupDemo extends Component<GameEntity> {
  private handlers: Map<string, Function> = new Map();

  start() {
    // 保存事件处理函数的引用
    const handler = (data: any) => {
      console.log(data);
    };

    this.node.on("myEvent", handler, this);
    this.handlers.set("myEvent", handler);
  }

  onDestroy() {
    // 清理所有事件监听
    this.handlers.forEach((handler, event) => {
      this.node.off(event, handler, this);
    });
    this.handlers.clear();
  }
}
```

## 注意事项

1. **内存泄漏防范**
  - 始终在组件销毁时清理事件监听
  - 使用 Map 或数组记录添加的事件监听器
  - 避免重复添加相同的事件监听
2. **性能优化**
  - 避免过于频繁的事件触发
  - 合理使用事件参数，避免传递过大的数据
  - 考虑使用事件节流或防抖
3. **事件传播**
  - 明确事件的作用范围
  - 合理选择使用节点事件还是全局事件
  - 避免事件循环调用

## 常见问题

### Q: 如何避免事件监听器重复添加？

A: 可以在添加前先移除旧的监听器：

typescript

```
this.node.off("myEvent", this.handler, this);
this.node.on("myEvent", this.handler, this);
```

### Q: 全局事件和节点事件该如何选择？

A:

- 节点事件：组件间的局部通信
- 全局事件：跨节点的系统级通信

### Q: 如何处理事件监听器的内存泄漏？

A:

1. 在 onDestroy 中清理所有事件
2. 使用 once 代替 on 处理一次性事件
3. 保持对事件监听器的引用以便清理
