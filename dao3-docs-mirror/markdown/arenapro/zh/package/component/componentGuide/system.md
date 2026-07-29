---
title: "节点系统"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/system.html"
---

# 节点系统

NodeSystem 是一个强大的游戏系统管理类，用于统一管理和处理多个实体节点（EntityNode）的行为和状态。它就像一个"管理者"，可以同时控制多个游戏对象，非常适合处理游戏中的群体行为和全局逻辑。

## 基础示例：创建一个简单的计分系统

typescript

```
class ScoreSystem extends NodeSystem {
  private totalScore: number = 0;

  onLoad(): void {
    console.log("计分系统初始化");
  }

  protected onEntityNodeAdded(entityNode: EntityNode): void {
    // 当新玩家加入时，监听其得分事件
    entityNode.on("scoreChange", (score: number) => {
      this.totalScore += score;
      console.log(`总分更新：${this.totalScore}`);
    });
  }

  protected onEntityNodeRemoved(entityNode: EntityNode): void {
    // 清理事件监听
    entityNode.off("scoreChange");
  }
}

// 使用示例
const scoreSystem = new ScoreSystem();
const player = new EntityNode(world.querySelector("#实体名称")!);
scoreSystem.addEntityNode(player);

// 玩家得分时
player.emit("scoreChange", 100);
```

## 进阶示例：物理碰撞系统

typescript

```
class CollisionSystem extends NodeSystem {
  update(deltaTime: number): void {
    // 获取系统中的所有实体
    const entities = this.entities;

    // 简单的碰撞检测
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        if (this.checkCollision(entities[i], entities[j])) {
          this.handleCollision(entities[i], entities[j]);
        }
      }
    }
  }

  private checkCollision(entity1: EntityNode, entity2: EntityNode): boolean {
    // 实现碰撞检测逻辑
    const pos1 = entity1.entity.position;
    const pos2 = entity2.entity.position;
    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
    return distance < 1; // 假设碰撞距离为1
  }

  private handleCollision(entity1: EntityNode, entity2: EntityNode): void {
    // 触发碰撞事件
    entity1.emit("collision", entity2);
    entity2.emit("collision", entity1);
  }
}
```

## 高级示例：AI 控制系统

typescript

```
class AISystem extends NodeSystem {
  private updateInterval: number = 100; // 每100ms更新一次AI
  private lastUpdateTime: number = 0;

  update(deltaTime: number): void {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdateTime >= this.updateInterval) {
      this.updateAI();
      this.lastUpdateTime = currentTime;
    }
  }

  private updateAI(): void {
    for (const entity of this.entities) {
      const aiComponent = entity.getComponent("AIComponent");
      if (aiComponent && aiComponent.enable) {
        this.processAILogic(entity);
      }
    }
  }

  private processAILogic(entity: EntityNode): void {
    // 实现AI逻辑
    const nearestTarget = this.findNearestTarget(entity);
    if (nearestTarget) {
      entity.emit("targetFound", nearestTarget);
    }
  }

  private findNearestTarget(entity: EntityNode): EntityNode | null {
    // 查找最近的目标
    return this.entities.find((target) => target !== entity);
  }
}
```

## 使用技巧

1. **生命周期管理**

typescript

```
class CustomSystem extends NodeSystem {
  onLoad(): void {
    // 系统初始化时调用
  }

  onEnable(): void {
    // 系统启用时调用
  }

  onDisable(): void {
    // 系统禁用时调用
  }

  onDestroy(): void {
    // 系统销毁时调用
  }
}
```

1. **实体管理**

typescript

```
const system = new CustomSystem();

// 添加实体
system.addEntityNode(entityNode);

// 移除实体
system.removeEntityNode(entityNode);

// 获取所有实体
const allEntities = system.entities;
```

1. **性能优化**

typescript

```
class OptimizedSystem extends NodeSystem {
  private cachedData: Map<string, any> = new Map();

  update(deltaTime: number): void {
    // 使用缓存避免重复计算
    for (const entity of this.entities) {
      const cached = this.cachedData.get(entity.uuid);
      if (!cached) {
        const newData = this.heavyCalculation(entity);
        this.cachedData.set(entity.uuid, newData);
      }
    }
  }
}
```

记住：

- NodeSystem 适合处理多个实体的共同行为
- 合理使用生命周期函数
- 注意清理不需要的实体和事件监听
- 可以通过 enable 属性控制系统的启用状态
