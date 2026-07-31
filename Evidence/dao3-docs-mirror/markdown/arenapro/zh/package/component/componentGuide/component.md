---
title: "组件系统与执行顺序"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/component.html"
---

# 组件系统与执行顺序

组件是神岛引擎中最基础的功能单元，理解组件的工作方式和执行顺序对于开发高质量的游戏至关重要。

## 组件基础

### 组件定义

typescript

```
@apclass("PlayerComponent")
class PlayerComponent extends Component<GameEntity> {
  // 组件属性
  public speed: number = 5;
  private health: number = 100;

  // 生命周期方法
  onLoad(): void {
    console.log("组件加载");
  }

  start(): void {
    console.log("组件开始");
  }

  update(dt: number): void {
    console.log("组件更新");
  }

  onDestroy(): void {
    console.log("组件销毁");
  }
}
```

### 组件权重

组件的执行顺序由权重（weight）决定，权重值越小，执行优先级越高。

typescript

```
@apclass("PhysicsComponent")
class PhysicsComponent extends Component<GameEntity> {
  onLoad(): void {
    // 设置较高优先级（较小的权重值）
    this.weight = -2;
  }
}

@apclass("AnimationComponent")
class AnimationComponent extends Component<GameEntity> {
  onLoad(): void {
    // 设置较低优先级（较大的权重值）
    this.weight = 1;
  }
}
```

## 执行顺序详解

### 1. 生命周期执行顺序

typescript

```
@apclass("LifecycleComponent")
class LifecycleComponent extends Component<GameEntity> {
  onLoad(): void {
    // 1. 首先执行，用于初始化组件
    console.log("1. onLoad");
  }

  onEnable(): void {
    // 2. 组件启用时执行
    console.log("2. onEnable");
  }

  start(): void {
    // 3. 所有组件 onLoad 完成后执行
    console.log("3. start");
  }

  update(dt: number): void {
    // 4. 每帧执行，按权重排序
    console.log("4. update");
  }

  lateUpdate(dt: number): void {
    // 5. 全部组件刷新后执行，按权重排序
    console.log("5. lateUpdate");
  }

  onDisable(): void {
    //6. 组件禁用时执行
    console.log("6. onDisable");
  }

  onDestroy(): void {
    // 7. 组件销毁时执行
    console.log("7. onDestroy");
  }
}
```

## 高级用法

### 1. 动态调整优先级

typescript

```
@apclass("DynamicComponent")
class DynamicComponent extends Component<GameEntity> {
  private needsHighPriority: boolean = false;

  update(dt: number): void {
    if (this.needsHighPriority && this.weight !== -999) {
      // 动态提升优先级
      this.weight = -999;
    }
  }
}
```

### 2. 组件组合模式

typescript

```
@apclass("CompositeSystem")
class CompositeSystem extends Component<GameEntity> {
  // 存储子系统组件
  private systems: Component[] = [];

  protected start(): void {
    // 按特定顺序添加子系统
    this.systems.push(
      this.node.addComponent(PhysicsSystem, { weight: -2 }),
      this.node.addComponent(InputSystem, { weight: -1 }),
      this.node.addComponent(RenderSystem, { weight: 0 })
    );
  }

  protected onDestroy(): void {
    // 按相反顺序销毁子系统
    this.systems.reverse().forEach((system) => {
      this.node.removeComponent(system.constructor as any);
    });
  }
}
```

## 最佳实践

### 1. 权重分配建议

typescript

```
// 物理系统：最高优先级
@apclass("PhysicsSystem")
class PhysicsSystem extends Component<GameEntity> {
  onLoad() {
    this.weight = -100;
  }
}

// 输入系统：次高优先级
@apclass("InputSystem")
class InputSystem extends Component<GameEntity> {
  onLoad() {
    this.weight = -50;
  }
}

// 游戏逻辑：普通优先级
@apclass("GameLogic")
class GameLogic extends Component<GameEntity> {
  onLoad() {
    this.weight = 0;
  }
}

// 渲染系统：较低优先级
@apclass("RenderSystem")
class RenderSystem extends Component<GameEntity> {
  onLoad() {
    this.weight = 50;
  }
}
```

### 2. 依赖管理

typescript

```
@apclass("DependentComponent")
class DependentComponent extends Component<GameEntity> {
  start(): void {
    // 确保依赖组件已经初始化
    const physics = this.node.getComponent(PhysicsSystem);
    if (!physics) {
      console.error("缺少物理系统组件！");
      this.enabled = false;
      return;
    }
  }
}
```

## 注意事项

1. **权重设置时机**
  - 在 onLoad 中设置权重
  - 避免频繁修改权重
  - 合理规划权重范围
2. **执行顺序依赖**
  - 不要过度依赖执行顺序
  - 使用事件系统处理组件间通信
  - 注意避免循环依赖
3. **性能考虑**
  - 避免过多的高优先级组件
  - 合理使用 update,lateUpdate 方法
  - 考虑使用事件驱动替代轮询

## 常见问题

### Q: 如何处理组件间的依赖关系？

A: 推荐以下方法：

1. 使用权重系统确保正确的刷新顺序
2. 在 start 方法中检查依赖
3. 使用事件系统进行松耦合通信

### Q: 权重值的范围是多少？

A: 权重值是数字类型，推荐范围：

- -100 ~ -50：系统级组件
- -49 ~ 0：核心游戏逻辑
- 1 ~ 50：普通组件
- 51 ~ 100：后处理组件

### Q: 如何优化大量组件的性能？

A: 可以通过以下方式优化：

1. 合理使用权重系统
2. 使用组件池
3. 适时禁用不需要的组件
4. 避免在 update,lateUpdate 中进行重复计算
