---
title: "Guide to Common Node and Component Interfaces"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/basic-node-api.html"
---

# Guide to Common Node and Component Interfaces

This document introduces the most commonly used node and component interfaces in the Box3 Engine component system, helping creators get started with development quickly.

## Node Interface (EntityNode)

### Basic Properties

typescript

```
class EntityNode<T = any> {
  // Get the entity reference on the node
  readonly entity: T;

  // Get all components on the node
  readonly components: Map<string, Component>;

  // Get/set whether the node is active
  enable: boolean;
}
```

### Component Operations

typescript

```
class EntityNode<T = any> {
  // Add a component
  addComponent<T extends Component>(
    componentClass: ComponentClass<T>,
    config?: Partial<T>
  ): T;

  // Get a single component
  getComponent<T extends Component>(
    componentClass: ComponentClass<T>
  ): T | null;

  // Get multiple components of the same type
  getComponents<T extends Component>(componentClass: ComponentClass<T>): T[];

  // Remove a component
  removeComponent<T extends Component>(componentClass: ComponentClass<T>): void;
}
```

### Event System

typescript

```
class EntityNode<T = any> {
  // Listen for an event
  on(event: string, callback: Function, target?: any): this;

  // Listen for an event once
  once(event: string, callback: Function, target?: any): this;

  // Stop listening for an event
  off(event: string, callback?: Function, target?: any): this;

  // Emit an event
  emit(event: string, ...args: any[]): this;
}
```

## Component Interface (Component)

### Basic Properties

typescript

```
class Component<T = any> {
  // Get the node to which the component belongs
  protected readonly node: EntityNode<T>;

  // Whether the component is enabled
  enabled: boolean;

  // Component update priority
  weight: number;
}
```

### Lifecycle Hooks

typescript

```
class Component<T = any> {
  // Called when the component is loaded
  onLoad?(): void;

  // Called when the component is first enabled
  start?(): void;

  // Called every frame
  update?(deltaTime: number): void;

  // Called after all components have been updated
  lateUpdate?(deltaTime: number): void;

  // Called when the component is destroyed
  onDestroy?(): void;

  // Called when the component is enabled/disabled
  onEnable?(): void;
  onDisable?(): void;
}
```

## Practical Application Examples

### 1. Basic Component Creation

typescript

```
@apclass("PlayerComponent")
export class PlayerComponent extends Component<GameEntity> {
  // Component properties
  speed = 5;
  health = 100;

  // Lifecycle method
  start(): void {
    console.log("Player component started");
  }

  update(dt: number): void {
    // Update logic
  }
}
```

### 2. Component Communication Example

typescript

```
// Sender component
@apclass("ScoreManager")
export class ScoreManager extends Component<GameEntity> {
  private score = 0;

  addScore(points: number): void {
    this.score += points;
    // Emit score changed event
    this.node.emit("scoreChanged", this.score);
  }
}

// Receiver component
@apclass("UIManager")
export class UIManager extends Component<GameEntity> {
  start(): void {
    // Listen for score changes
    this.node.on("scoreChanged", this.updateScoreDisplay, this);
  }

  private updateScoreDisplay(score: number): void {
    console.log(`Score updated: ${score}`);
  }

  onDestroy(): void {
    // Clean up event listener
    this.node.off("scoreChanged", this.updateScoreDisplay, this);
  }
}
```

### 3. Component Dependency Management

typescript

```
@apclass("GameController")
export class GameController extends Component<GameEntity> {
  private scoreManager: ScoreManager | null = null;
  private uiManager: UIManager | null = null;

  start(): void {
    // Get dependent components
    this.scoreManager = this.node.getComponent(ScoreManager);
    this.uiManager = this.node.getComponent(UIManager);

    // Check for dependencies
    if (!this.scoreManager || !this.uiManager) {
      console.error("Missing necessary components");
      return;
    }

    // Initialize the game
    this.initGame();
  }

  private initGame(): void {
    // Game initialization logic
  }
}
```

## Best Practices

1. **Component Reference Management**
  - Get and cache component references in`start`.
  - Check if the component exists before use.
  - Clean up references when the component is destroyed.
2. **Event Listener Management**
  - Register event listeners in`start`.
  - Clean up event listeners in`onDestroy`.
  - Use`this`as the target for event listeners.
3. **Performance Optimization**
  - Cache frequently used component references.
  - Use`update`and`lateUpdate`methods reasonably.
  - Clean up unnecessary event listeners in a timely manner.

## Common Pitfalls

1. **Forgetting to Clean Up Event Listeners**typescript`// ❌ Incorrect example@apclass("BadComponent")exportclassBadComponentextendsComponent<GameEntity> {start() {this.node.on("event",this.handler,this);}// Forgot to clean up the event in onDestroy}// ✅ Correct example@apclass("GoodComponent")exportclassGoodComponentextendsComponent<GameEntity> {start() {this.node.on("event",this.handler,this);}onDestroy() {this.node.off("event",this.handler,this);}}`
2. **Not Checking if a Component Exists**typescript`// ❌ Incorrect example@apclass("BadComponent")exportclassBadComponentextendsComponent<GameEntity> {start() {constcomp=this.node.getComponent(SomeComponent);comp.doSomething();// Might cause an error}}// ✅ Correct example@appclass("GoodComponent")exportclassGoodComponentextendsComponent<GameEntity> {start() {constcomp=this.node.getComponent(SomeComponent);if(comp) {comp.doSomething();}}}`
