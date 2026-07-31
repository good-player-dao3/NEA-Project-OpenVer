---
title: "Component System Code Examples"
source: "https://docs.dao3.fun/arenapro/en/package/component/example.html"
---

# Component System Code Examples

The component pattern is applicable to both server-side and client-side development.

This document provides various practical examples of using the`@dao3fun/component`system to help creators quickly master how to create, attach, and communicate between components.

## Single Component Example

The following example shows how to create a simple broadcast component. After being attached, the specified entity will send a welcome message.

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - Entity broadcast component
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start(): void {
    this.node.entity.say(`Welcome`);
  }
}

const e = world.querySelector("#entityName");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
}
```

## Component Initial Parameter Configuration

Components can be initialized with parameters through the constructor, allowing for component configuration. The following example shows how to initialize a component with configuration parameters.

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;
/**
 * @SayComponent - Entity broadcast component
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  say = "ap";
  start(): void {
    console.log("SayComponent says:", this.say);
  }
}

const e = world.querySelector("#entityName-1");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent, {
    say: "hello",
  });
}
```

## Component Performance Event Listening

The following example shows how to globally listen for component performance events, such as low frame rates.

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - Entity broadcast component
 */
@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start(): void {
    this.node.entity.say(`Welcome`);
  }
  async update(deltaTime: number): Promise<void> {
    console.log("update");
    await sleep(1000);
  }
}

const e = world.querySelector("#entityName");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
}

// Enable global performance monitoring
EntityNode.isMonitoringEnabled = true;

// Register a global performance warning callback
EntityNode.onPerformanceWarning(({ entityNode, component, currentFPS }) => {
  console.warn(
    `Component ${component.constructor.name} on entity ${entityNode.entity.id} has a low frame rate: ${currentFPS}`
  );
});
```

## Getting Node Instances

You can get an entity instance that is already bound to a node using the`find`method. Note: Only entities that have been bound via`EntityNode`can be found.

typescript

```
import { EntityNode, find } from "@dao3fun/component";

const e = world.querySelector("#entityName-1");
const e2 = world.querySelector("#entityName-2");

if (e && e2) {
  new EntityNode(e);

  console.log(find(e)?.entity.id); // Output: entityName-1
  console.log(find(e2)?.entity.id); // Output: undefined (because e2 is not bound to a node)
}
```

## Multiple Component Attachment Example

An entity can have multiple components attached, with each component responsible for a different function. The following example shows how to attach broadcast and jump components at the same time.

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - Entity broadcast component
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
    // Make the entity in the game say a welcome message to the new player
    this.node.entity.say(`Welcome ${entity.player.name} to the game`);
  }
}

/**
 * @CaperComponent - Physics-based jump component
 */
@apclass("CaperComponent")
class CaperComponent extends Component<GameEntity> {
  start(): void {
    this.node.entity.velocity.y++;
  }
}

const e = world.querySelector("#entityName");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
  node.addComponent(CaperComponent);
}
```

## Communication Between Components on a Single Node

Different components on the same node can communicate through the event system, achieving decoupling between components.

typescript

```
import { Component, EntityNode, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - Entity broadcast component
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
 * @SayMgrComponent - Entity broadcast management component
 */
@apclass("SayMgrComponent")
class SayMgrComponent extends Component<GameEntity> {
  start(): void {
    this.node.emit("say", "hello world, from SayMgrComponent", this);
  }
}

const e = world.querySelector("#entityName");

if (e) {
  const node = new EntityNode(e);
  node.addComponent(SayComponent);
  node.addComponent(SayMgrComponent);
}
```

## Communication Between Components on Multiple Nodes

Components on different nodes can communicate through the global event system, enabling message passing across nodes.

typescript

```
import { Component, EntityNode, Emitter, _decorator } from "@dao3fun/component";
const { apclass } = _decorator;

/**
 * @SayComponent - Entity broadcast component
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
 * @SayMgrComponent - Entity broadcast management component
 */
@apclass("SayMgrComponent")
class SayMgrComponent extends Component<GameEntity> {
  start(): void {
    Emitter.emit("say", "hello world, from SayMgrComponent");
  }
}

const e = world.querySelector("#entityName-1");
const e2 = world.querySelector("#entityName-2");

if (e && e2) {
  const node2 = new EntityNode(e2);
  node2.addComponent(SayComponent);

  const node = new EntityNode(e);
  node.addComponent(SayMgrComponent);
}
```

## Component Inheritance Example

Through component inheritance, you can reuse the functionality of a parent component and extend it with new behaviors. The following example shows how to extend functionality through inheritance.

typescript

```
// Base class for movement
@apclass("Movement")
export class Movement extends Component<GameEntity> {
  public speed: number = 5;

  move(direction: { x: number; y: number; z: number }): void {
    this.node.entity.position.x += direction.x * this.speed;
    this.node.entity.position.y += direction.y * this.speed;
    this.node.entity.position.z += direction.z * this.speed;
  }
}

// Player-specific movement component
@apclass("PlayerMovement")
export class PlayerMovement extends Movement {
  start() {
    this.speed = 10; // Players are faster
  }

  jump(): void {
    this.node.entity.velocity.y = 10;
  }
}

// Enemy-specific movement component
@apclass("EnemyMovement")
export class EnemyMovement extends Movement {
  private patrolRoute: any[] = [];
  private currentPatrolIndex: number = 0;

  start() {
    this.speed = 3; // Enemies are slower
    this.patrolRoute = [
      /* patrol points */
    ];
  }

  update(dt: number) {
    // Patrol logic
  }
}
```

## System Usage Example

A system can be used to manage a group of components. The following example creates a system to manage all`SayComponent`instances.

typescript

```
import {
  Component,
  EntityNode,
  NodeSystem,
  _decorator,
} from "@dao3fun/component";
const { apclass } = _decorator;

@apclass("SayComponent")
class SayComponent extends Component<GameEntity> {
  start() {
    this.node.entity.say("I am a component");
  }
}

class SaySystem extends NodeSystem {
  protected onEntityNodeAdded(entityNode: EntityNode): void {
    if (entityNode.getComponent(SayComponent)) {
      console.log("A new SayComponent has been added to the system.");
    }
  }
}

const system = new SaySystem();

const e1 = world.querySelector("#entityName-1");
if (e1) {
  const node1 = new EntityNode(e1);
  node1.addComponent(SayComponent);
  system.addEntityNode(node1);
}

const e2 = world.querySelector("#entityName-2");
if (e2) {
  const node2 = new EntityNode(e2);
  node2.addComponent(SayComponent);
  system.addEntityNode(node2);
}
```

## Accessing Other Components

A component can access other components on the same node.

typescript

```
@apclass("MainComponent")
class MainComponent extends Component<GameEntity> {
  private otherComp: OtherComponent | null = null;
  start() {
    this.otherComp = this.node.getComponent(OtherComponent);
    if (this.otherComp) {
      this.otherComp.doSomething();
    }
  }
}

@apclass("OtherComponent")
class OtherComponent extends Component<GameEntity> {
  doSomething() {
    console.log("Doing something...");
  }
}

const entity = world.querySelector("#someEntity");
if (entity) {
  const node = new EntityNode(entity);
  node.addComponent(MainComponent);
  node.addComponent(OtherComponent);
}
```

## Asynchronous Operations in Components

You can use`async/await`in component lifecycle methods.

typescript

```
@apclass("AsyncComponent")
class AsyncComponent extends Component<GameEntity> {
  async start() {
    console.log("Start of async operation");
    await this.delay(2000); // Wait for 2 seconds
    console.log("End of async operation");
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

## Complete Example: Flappy Bird

This is a more complete example showing how to build a simple Flappy Bird-like game using the component system.

typescript

```
// bird.component.ts
@apclass("BirdComponent")
export class BirdComponent extends Component<GameEntity> {
  public gravity: number = -9.8;

  update(dt: number) {
    this.node.entity.velocity.y += this.gravity * dt;
  }

  jump() {
    this.node.entity.velocity.y = 5;
  }
}

// pipe.component.ts
@apclass("PipeComponent")
export class PipeComponent extends Component<GameEntity> {
  public speed: number = -2;

  update(dt: number) {
    this.node.entity.position.x += this.speed * dt;
    if (this.node.entity.position.x < -10) {
      // Recycle the pipe when it's off-screen
      this.node.destroy();
    }
  }
}

// game-manager.component.ts
@apclass("GameManager")
export class GameManager extends Component<GameEntity> {
  private birdNode: EntityNode | null = null;

  start() {
    // Create the bird
    const birdEntity = world.createEntity({
      /* ... */
    });
    this.birdNode = new EntityNode(birdEntity);
    this.birdNode.addComponent(BirdComponent);

    // Set up pipe spawning
    setInterval(() => this.spawnPipe(), 2000);

    // Listen for input
    world.onPress(() => {
      this.birdNode?.getComponent(BirdComponent)?.jump();
    });
  }

  spawnPipe() {
    const pipeEntity = world.createEntity({
      /* ... */
    });
    const pipeNode = new EntityNode(pipeEntity);
    pipeNode.addComponent(PipeComponent);
  }
}
```
