---
title: "组件系统代码示例"
source: "https://docs.dao3.fun/arenapro/zh/package/component/example.html"
---

# 组件系统代码示例

组件模式适用于服务端及客户端。

本文档提供了使用`@dao3fun/component`组件系统的各种实用示例，帮助创作者快速掌握组件的创建、挂载和通信方式。

## 单组件示例

以下示例展示了如何创建一个简单的广播组件，挂载后指定实体会发送欢迎消息。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - 实体广播组件
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start(): void {
    this.node.entity.say(`欢迎你`);
  }
}

const e = world.querySelector("#实体名称");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
}
```

## 组件初始参数配置

组件可以通过构造函数的参数进行初始化，实现组件的配置化。以下示例展示了如何通过配置参数初始化组件。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;
/**
 * @SayComponent - 实体广播组件
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  say = "ap";
  start(): void {
    console.log("SayComponent 说：", this.say);
  }
}

const e = world.querySelector("#实体名字-1");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent, {
    say: "hello",
  });
}
```

## 组件性能事件监听

以下示例展示了如何全局监听组件的性能事件，例如帧率过低。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - 实体广播组件
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start(): void {
    this.node.entity.say(`欢迎你`);
  }
  async update(deltaTime: number): Promise<void> {
    console.log("update");
    await sleep(1000);
  }
}

const e = world.querySelector("#实体名称");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
}

// 开启全局性能监控
EntityNode.isMonitoringEnabled = true;

// 注册全局性能警告回调
EntityNode.onPerformanceWarning(({ entityNode, component, currentFPS }) => {
  console.warn(
    `实体 ${entityNode.entity.id} 的组件${component.constructor.name}帧率过低: ${currentFPS}`
  );
});
```

## 节点实例获取

通过`find`方法可以获取已绑定到节点上的实体实例。注意：只有已经通过`EntityNode`绑定的实体才能被找到。

typescript

```
import { EntityNode, find } from "@dao3fun/component";

const e = world.querySelector("#实体名称-1");
const e2 = world.querySelector("#实体名称-2");

if (e && e2) {
  new EntityNode(e);

  console.log(find(e)?.entity.id); // 输出: 实体名称-1
  console.log(find(e2)?.entity.id); // 输出: undefined (因为e2未绑定到节点)
}
```

## 多组件挂载示例

一个实体可以挂载多个组件，每个组件负责不同的功能。以下示例展示了如何同时挂载广播和跳跃组件。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - 实体广播组件
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start(): void {
    GameWorldEvent.on(world.onPlayerJoin, this.onWechat, this);
  }
  onDestroy(): void {
    GameWorldEvent.off(world.onPlayerJoin, this.onWechat, this);
  }
  private onWechat({ entity }: GamePlayerEntityEvent): void {
    // 让游戏中的实体说欢迎词，欢迎新加入游戏的玩家
    this.node.entity.say(`欢迎${entity.player.name}加入游戏`);
  }
}

/**
 * @CaperComponent - 物理跳跃组件
 */
@apclass("CaperComponent")
class CaperComponent extends Component<GameEntity> {
  start(): void {
    this.node.entity.velocity.y++;
  }
}

const e = world.querySelector("#实体名称");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
  node.addComponent(CaperComponent);
}
```

## 单节点组件间通信

同一节点上的不同组件可以通过事件系统进行通信，实现组件间的解耦合。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - 实体广播组件
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start(): void {
    this.node.on("say", this.log, this);
  }
  protected log(text: string): void {
    console.log(text);
  }
}

/**
 * @SayMgrComponent - 实体广播管理组件
 */
@apclass("SayMgrComponent")
class SayMgrComponent extends Component<GameEntity> {
  start(): void {
    this.node.emit("say", "hello world，来自SayMgrComponent", this);
  }
}

const e = world.querySelector("#实体名称");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
  node.addComponent(SayMgrComponent);
}
```

## 多节点组件间通信

不同节点上的组件可以通过全局事件系统进行通信，实现跨节点的消息传递。

typescript

```
import { Component, EntityNode, Emitter, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - 实体广播组件
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start(): void {
    Emitter.on("say", this.log, this);
  }
  protected log(text: string): void {
    console.log(text);
  }
}

/**
 * @SayMgrComponent - 实体广播管理组件
 */
@apclass("SayMgrComponent")
class SayMgrComponent extends Component<GameEntity> {
  start(): void {
    Emitter.emit("say", "hello world，来自SayMgrComponent");
  }
}

const e = world.querySelector("#实体名称-1");
const e2 = world.querySelector("#实体名称-2");

if (e && e2) {
  const node2 = new EntityNode(e2);
  node2.addComponent(SayComponent);

  const node = new EntityNode(e);
  node.addComponent(SayMgrComponent);
}
```

## 组件继承示例

通过组件继承，可以复用父组件的功能并扩展新的行为。以下示例展示了如何通过继承实现功能扩展。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @CaperComponent - 物理跳跃组件
 */
@apclass("CaperComponent")
class CaperComponent extends Component<GameEntity> {
  jump() {
    this.node.entity.velocity.y++;
  }
}

/**
 * @SayComponent - 实体广播跳跃组件
 */
@apclass("SayComponent")
class SayComponent extends CaperComponent {
  start(): void {
    this.jump();
  }
}

const e = world.querySelector("#实体名称");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
}
```

## 计时器组件示例

以下示例展示了如何创建一个计时器组件，可以用于管理游戏中的定时事件。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @TimerComponent - 计时器组件
 */
@apclass("TimerComponent")
class TimerComponent extends Component<GameEntity> {
  private timeElapsed = 0;
  private readonly interval = 1000; // 1秒间隔

  update(deltaTime: number): void {
    this.timeElapsed += deltaTime;

    if (this.timeElapsed >= this.interval) {
      this.timeElapsed = 0;
      this.onTimerTick();
    }
  }

  private onTimerTick(): void {
    this.node.entity.say("又过去了1秒！");
  }
}

const e = world.querySelector("#计时器实体");
if (e) {
  const node = new EntityNode(e);
  node.addComponent(TimerComponent);
}
```

## 资源管理组件示例

创建一个管理游戏资源（如分数、生命值等）的组件。

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @ResourceComponent - 资源管理组件
 */
@apclass("ResourceComponent")
class ResourceComponent extends Component<GameEntity> {
  private health = 100;
  private score = 0;
  private coins = 0;

  start(): void {
    Emitter.on("damage", this.takeDamage, this);
    Emitter.on("collect", this.collectItem, this);
  }

  private takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.node.entity.say(`受到伤害！剩余生命值：${this.health}`);

    if (this.health <= 0) {
      Emitter.emit("gameOver", this.score);
    }
  }

  private collectItem(type: string, value: number): void {
    switch (type) {
      case "coin":
        this.coins += value;
        this.score += value * 10;
        this.node.entity.say(`收集金币！当前分数：${this.score}`);
        break;
      case "health":
        this.health = Math.min(100, this.health + value);
        this.node.entity.say(`恢复生命值！当前生命值：${this.health}`);
        break;
    }
  }
}

const e = world.querySelector("#实体名称");
if (e) {
  const node = new EntityNode(e);
  node.addComponent(ResourceComponent);

  // 测试资源系统
  setTimeout(() => {
    Emitter.emit("damage", 20);
  }, 1000);

  setTimeout(() => {
    Emitter.emit("collect", "coin", 5);
  }, 3000);

  setTimeout(() => {
    Emitter.emit("collect", "health", 30);
  }, 5000);
}
```

## 简单日志系统

这个系统在每次添加或移除实体节点时记录日志，适合用于调试和监控实体的变化。

typescript

```
class LoggingSystem extends NodeSystem {
  protected onEntityNodeAdded(entityNode: EntityNode): void {
    console.log(`实体节点 ${entityNode.id} 已添加到系统`);
  }

  protected onEntityNodeRemoved(entityNode: EntityNode): void {
    console.log(`实体节点 ${entityNode.id} 已从系统移除`);
  }
}
```

## 简单计时器系统

这个系统在每帧更新时增加一个计时器，适合用于需要时间跟踪的场景。

typescript

```
class TimerSystem extends NodeSystem {
  private elapsedTime: number = 0;

  protected update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    console.log(`系统运行时间：${this.elapsedTime} 毫秒`);
  }
}
```

## 物理更新系统

这个系统用于更新实体的物理状态，比如位置和速度，适合用于简单的物理模拟。

typescript

```
class PhysicsSystem extends NodeSystem {
  protected update(deltaTime: number): void {
    for (const entity of this.entities) {
      const physicsComponent = entity.getComponent("PhysicsComponent");
      if (physicsComponent) {
        physicsComponent.updatePhysics(deltaTime);
      }
    }
  }
}
```

## 碰撞检测系统

这个系统用于检测实体之间的碰撞，并触发相应的事件，适合用于游戏中的碰撞处理。

typescript

```
class CollisionDetectionSystem extends NodeSystem {
  protected update(deltaTime: number): void {
    const entities = this.entities;
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        if (this.checkCollision(entities[i], entities[j])) {
          entities[i].emit("collision", entities[j]);
          entities[j].emit("collision", entities[i]);
        }
      }
    }
  }

  private checkCollision(entity1: EntityNode, entity2: EntityNode): boolean {
    // 简单的碰撞检测逻辑
    return Math.random() > 0.5; // 示例逻辑
  }
}
```

## AI 控制系统

这个系统用于管理和更新实体的 AI 行为，适合用于复杂的游戏 AI 控制。

typescript

```
class AISystem extends NodeSystem {
  protected update(deltaTime: number): void {
    for (const entity of this.entities) {
      const aiComponent = entity.getComponent("AIComponent");
      if (aiComponent) {
        aiComponent.updateAI(deltaTime);
      }
    }
  }
}
```
