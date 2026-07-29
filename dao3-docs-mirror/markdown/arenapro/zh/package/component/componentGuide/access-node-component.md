---
title: "访问节点和组件"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/access-node-component.html"
---

# 访问节点和组件

在神岛引擎的组件系统中，了解如何正确访问节点和组件是开发的基础。本文将详细介绍相关操作方法。

## 访问节点

### 1. 创建节点

typescript

```
// 创建节点时绑定实体
const playerNode = new EntityNode(world.querySelector("#实体名称"));
```

### 2. 查找已有节点

typescript

```
import { find } from "@dao3fun/component";

// 通过实体查找对应的节点
const entity = world.querySelector("#NPC");
new EntityNode(entity);

const node = find(entity);
if (node) {
  console.log("找到节点！节点uuid：", node.uuid);
} else {
  console.log("未找到节点！");
}
```

### 3. 在组件中访问当前节点

typescript

```
@apclass("PlayerComponent")
export class PlayerComponent extends Component<GameEntity> {
  start() {
    // 通过 this.node 访问当前组件所属的节点
    console.log("当前节点:", this.node);

    // 访问节点上的实体
    console.log("节点实体:", this.node.entity);
  }
}
```

## 访问组件

### 1. 添加组件

typescript

```
@apclass("MovementComponent")
export class MovementComponent extends Component<GameEntity> {
  speed = 5;

  start() {
    console.log("移动组件已添加！speed值:", this.speed);
  }
}

// 方式1：通过组件类添加
const node = new EntityNode(null);
node.addComponent(MovementComponent);

// 方式2：通过组件名称添加
node.addComponent("MovementComponent");

// 方式3：添加组件时传入配置
node.addComponent(MovementComponent, {
  speed: 10,
});
```

### 2. 获取组件

typescript

```
@apclass("PlayerController")
export class PlayerController extends Component<GameEntity> {
  start() {
    // 方式1：通过组件类获取
    const movement = this.node.getComponent(MovementComponent);

    // 方式2：通过组件名称获取
    const movement2 = this.node.getComponent("MovementComponent");

    if (movement) {
      movement.speed = 15;
    }
  }
}
```

### 3. 获取多个组件

typescript

```
@apclass("GameManager")
export class GameManager extends Component<GameEntity> {
  start() {
    // 获取节点上的所有组件
    const allComponents = Array.from(this.node.components.values());
    console.log("所有组件:", allComponents);

    // 获取特定类型的所有组件
    const movements = this.node.getComponents(MovementComponent);
    console.log("所有移动组件:", movements);
  }
}
```

### 4. 移除组件

typescript

```
@apclass("ComponentManager")
export class ComponentManager extends Component<GameEntity> {
  start() {
    // 方式1：通过组件类移除
    this.node.removeComponent(MovementComponent);

    // 方式2：通过组件名称移除
    this.node.removeComponent("MovementComponent");
  }
}
```

## 实战示例

### 角色控制系统

typescript

```
@apclass("MovementComponent")
export class MovementComponent extends Component<GameEntity> {
  speed = 5;

  move(direction: GameVector3) {
    this.node.entity.position = this.node.entity.position.add(
      direction.multiply(this.speed)
    );
  }
}

@apclass("PlayerController")
export class PlayerController extends Component<GameEntity> {
  private movement: MovementComponent | null = null;

  start() {
    // 获取移动组件
    this.movement = this.node.getComponent(MovementComponent);

    // 如果没有移动组件，自动添加一个
    if (!this.movement) {
      this.movement = this.node.addComponent(MovementComponent);
    }

    // 监听按键事件
    world.onPress(({ button }) => {
      if (!this.movement) return;

      switch (button) {
        case "ArrowRight":
          this.movement.move(new GameVector3(1, 0, 0));
          break;
        case "ArrowLeft":
          this.movement.move(new GameVector3(-1, 0, 0));
          break;
      }
    });
  }
}
```

## 注意事项

1. **组件获取检查**
  - 总是检查 getComponent 的返回值是否为 null
  - 考虑组件可能不存在的情况
2. **组件依赖管理**
  - 在 start 中获取所需的组件引用
  - 必要时自动添加依赖的组件
3. **性能优化**
  - 缓存经常使用的组件引用
  - 避免在 update 中重复获取组件

## 常见问题

### Q: 为什么获取不到我添加的组件？

A: 检查以下几点：

- 组件类是否使用了 @apclass 装饰器
- 组件名称是否正确
- 组件是否已经被成功添加到节点上

### Q: 如何在组件间共享数据？

A: 可以通过以下方式：

- 通过节点获取其他组件直接访问
- 使用事件系统进行通信
- 使用全局状态管理

### Q: 组件的获取时机应该是什么时候？

A: 建议在 start 生命周期中获取所需的组件引用，这时所有组件都已完成加载。
