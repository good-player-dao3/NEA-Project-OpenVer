---
title: "节点的创建与销毁"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/create-destroy.html"
---

# 节点的创建与销毁

本文将介绍如何在神岛引擎中创建和销毁节点，以及相关的最佳实践。

## 创建节点

### 基础创建方法

typescript

```
// 创建节点并绑定实体
const entity = world.querySelector("#实体名字");
const playerNode = new EntityNode(entity);
```

### 创建带组件的节点

typescript

```
@apclass("PlayerComponent")
class PlayerComponent extends Component<GameEntity> {
  speed = 5;
}

// 方法1：先创建节点，再添加组件
const node = new EntityNode();
node.addComponent(PlayerComponent);

// 方法2：链式调用添加多个组件
const node2 = new EntityNode()
  .addComponent(PlayerComponent)
  .addComponent(HealthComponent)
  .addComponent(InputComponent);
```

### 创建预制体节点

typescript

```
// 定义预制体配置
const playerPrefab = {
  components: [
    {
      type: "PlayerComponent",
      props: { speed: 10 },
    },
    {
      type: "HealthComponent",
      props: { maxHealth: 100 },
    },
  ],
};

// 从预制体创建节点
function createFromPrefab(prefab: any): EntityNode {
  const node = new EntityNode();

  prefab.components.forEach((comp) => {
    node.addComponent(comp.type, comp.props);
  });

  return node;
}

// 使用预制体创建节点
const playerNode = createFromPrefab(playerPrefab);
```

## 销毁节点

### 基础销毁方法

typescript

```
@apclass("GameManager")
class GameManager extends Component<GameEntity> {
  private playerNode: EntityNode | null = null;

  start() {
    this.playerNode = new EntityNode();
  }

  destroyPlayer() {
    if (this.playerNode) {
      // 销毁节点
      this.playerNode.destroy();
      this.playerNode = null;
    }
  }
}
```

### 销毁生命周期

typescript

```
@apclass("PlayerComponent")
class PlayerComponent extends Component<GameEntity> {
  start() {
    console.log("玩家组件启动");
  }

  onDestroy() {
    // 在组件被销毁前执行清理工作
    console.log("玩家组件即将销毁");
    this.cleanup();
  }

  private cleanup() {
    // 清理资源、取消事件监听等
  }
}
```

## 最佳实践

### 1. 节点池管理

typescript

```
class NodePool {
  private static pools: Map<string, EntityNode[]> = new Map();

  static obtain(name: string): EntityNode {
    const pool = this.pools.get(name) || [];
    return pool.pop() || this.createNode(name);
  }

  static recycle(name: string, node: EntityNode) {
    if (!this.pools.has(name)) {
      this.pools.set(name, []);
    }
    this.pools.get(name)?.push(node);
  }

  private static createNode(name: string): EntityNode {
    // 根据名称创建对应类型的节点
    return new EntityNode();
  }
}

// 使用节点池
const bullet = NodePool.obtain("bullet");
// ... 使用节点 ...
NodePool.recycle("bullet", bullet);
```

### 2. 安全的销毁检查

typescript

```
@apclass("SafeComponent")
class SafeComponent extends Component<GameEntity> {
  private timers: number[] = [];
  private eventHandlers: Function[] = [];

  start() {
    // 注册事件和定时器
    this.eventHandlers.push(
      world.onPress(() => {
        console.log("按键事件");
      })
    );

    this.timers.push(
      setInterval(() => {
        console.log("定时器执行");
      }, 1000)
    );
  }

  onDestroy() {
    // 清理所有事件监听
    this.eventHandlers.forEach((handler) => {
      handler.cancel();
    });

    // 清理所有定时器
    this.timers.forEach((timer) => {
      clearInterval(timer);
    });
  }
}
```

## 注意事项

1. **内存管理**
  - 及时销毁不需要的节点
  - 使用节点池管理频繁创建/销毁的对象
  - 销毁节点时清理所有资源和引用
2. **销毁顺序**
  - 节点销毁时会自动销毁其上的所有组件
  - 组件的 onDestroy 会在节点销毁时被调用
  - 确保在 onDestroy 中清理所有资源
3. **引用管理**
  - 销毁节点后将其引用设为 null
  - 检查节点是否已被销毁后再使用
  - 避免保留已销毁节点的引用

## 常见问题

### Q: 节点销毁后还能重新使用吗？

A: 不能。节点一旦销毁就无法恢复，需要创建新的节点。建议使用节点池进行管理。

### Q: 销毁节点时需要手动销毁组件吗？

A: 不需要。节点销毁时会自动销毁其上的所有组件。
