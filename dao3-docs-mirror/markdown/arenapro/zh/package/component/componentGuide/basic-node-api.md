---
title: "常用节点和组件接口指南"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/basic-node-api.html"
---

# 常用节点和组件接口指南

本文档将介绍神岛引擎组件系统中最常用的节点和组件接口，帮助创作者快速上手开发。

## 节点接口 (EntityNode)

### 基础属性

typescript

```
class EntityNode<T = any> {
  // 获取节点上的实体引用
  readonly entity: T;

  // 获取节点上的所有组件
  readonly components: Map<string, Component>;

  // 获取/设置节点是否激活
  enable: boolean;
}
```

### 组件操作

typescript

```
class EntityNode<T = any> {
  // 添加组件
  addComponent<T extends Component>(
    componentClass: ComponentClass<T>,
    config?: Partial<T>
  ): T;

  // 获取单个组件
  getComponent<T extends Component>(
    componentClass: ComponentClass<T>
  ): T | null;

  // 获取多个同类型组件
  getComponents<T extends Component>(componentClass: ComponentClass<T>): T[];

  // 移除组件
  removeComponent<T extends Component>(componentClass: ComponentClass<T>): void;
}
```

### 事件系统

typescript

```
class EntityNode<T = any> {
  // 监听事件
  on(event: string, callback: Function, target?: any): this;

  // 一次性监听事件
  once(event: string, callback: Function, target?: any): this;

  // 取消监听事件
  off(event: string, callback?: Function, target?: any): this;

  // 发送事件
  emit(event: string, ...args: any[]): this;
}
```

## 组件接口 (Component)

### 基础属性

typescript

```
class Component<T = any> {
  // 获取组件所属的节点
  protected readonly node: EntityNode<T>;

  // 组件是否启用
  enabled: boolean;

  // 组件更新优先级
  weight: number;
}
```

### 生命周期钩子

typescript

```
class Component<T = any> {
  // 组件加载时调用
  onLoad?(): void;

  // 组件首次启动时调用
  start?(): void;

  // 每帧更新时调用
  update?(deltaTime: number): void;

  // 全部组件刷新结束时调用
  lateUpdate?(deltaTime: number): void;

  // 组件销毁时调用
  onDestroy?(): void;

  // 组件启用/禁用时调用
  onEnable?(): void;
  onDisable?(): void;
}
```

## 实际应用示例

### 1. 基础组件创建

typescript

```
@apclass("PlayerComponent")
export class PlayerComponent extends Component<GameEntity> {
  // 组件属性
  speed = 5;
  health = 100;

  // 生命周期方法
  start(): void {
    console.log("玩家组件启动");
  }

  update(dt: number): void {
    // 更新逻辑
  }
}
```

### 2. 组件通信示例

typescript

```
// 发送方组件
@apclass("ScoreManager")
export class ScoreManager extends Component<GameEntity> {
  private score = 0;

  addScore(points: number): void {
    this.score += points;
    // 发送分数变化事件
    this.node.emit("scoreChanged", this.score);
  }
}

// 接收方组件
@apclass("UIManager")
export class UIManager extends Component<GameEntity> {
  start(): void {
    // 监听分数变化
    this.node.on("scoreChanged", this.updateScoreDisplay, this);
  }

  private updateScoreDisplay(score: number): void {
    console.log(`分数更新: ${score}`);
  }

  onDestroy(): void {
    // 清理事件监听
    this.node.off("scoreChanged", this.updateScoreDisplay, this);
  }
}
```

### 3. 组件依赖管理

typescript

```
@apclass("GameController")
export class GameController extends Component<GameEntity> {
  private scoreManager: ScoreManager | null = null;
  private uiManager: UIManager | null = null;

  start(): void {
    // 获取依赖组件
    this.scoreManager = this.node.getComponent(ScoreManager);
    this.uiManager = this.node.getComponent(UIManager);

    // 检查依赖
    if (!this.scoreManager || !this.uiManager) {
      console.error("缺少必要组件");
      return;
    }

    // 初始化游戏
    this.initGame();
  }

  private initGame(): void {
    // 游戏初始化逻辑
  }
}
```

## 最佳实践

1. **组件引用管理**
  - 在 start 中获取和缓存组件引用
  - 使用前检查组件是否存在
  - 组件销毁时清理引用
2. **事件监听管理**
  - 在 start 中注册事件监听
  - 在 onDestroy 中清理事件监听
  - 使用 this 作为事件监听的 target
3. **性能优化**
  - 缓存频繁使用的组件引用
  - 合理使用 update,lateUpdate 方法
  - 及时清理不需要的事件监听

## 常见陷阱

1. **忘记清理事件监听**

typescript

```
// ❌ 错误示例
@apclass("BadComponent")
export class BadComponent extends Component<GameEntity> {
  start() {
    this.node.on("event", this.handler, this);
  }
  // 忘记在 onDestroy 中清理事件
}

// ✅ 正确示例
@apclass("GoodComponent")
export class GoodComponent extends Component<GameEntity> {
  start() {
    this.node.on("event", this.handler, this);
  }

  onDestroy() {
    this.node.off("event", this.handler, this);
  }
}
```

1. **未检查组件存在性**

typescript

```
// ❌ 错误示例
@apclass("BadComponent")
export class BadComponent extends Component<GameEntity> {
  start() {
    const comp = this.node.getComponent(SomeComponent);
    comp.doSomething(); // 可能报错
  }
}

// ✅ 正确示例
@apclass("GoodComponent")
export class GoodComponent extends Component<GameEntity> {
  start() {
    const comp = this.node.getComponent(SomeComponent);
    if (comp) {
      comp.doSomething();
    }
  }
}
```
