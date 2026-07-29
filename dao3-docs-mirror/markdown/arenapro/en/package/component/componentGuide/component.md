---
title: "Component System and Execution Order"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/component.html"
---

# Component System and Execution Order

Components are the most basic functional units in the Box3 Engine. Understanding how components work and their execution order is crucial for developing high-quality games.

## Component Basics

### Component Definition

typescript

```
@apclass("PlayerComponent")
class PlayerComponent extends Component<GameEntity> {
  // Component properties
  public speed: number = 5;
  private health: number = 100;

  // Lifecycle methods
  onLoad(): void {
    console.log("Component loaded");
  }

  start(): void {
    console.log("Component started");
  }

  update(dt: number): void {
    console.log("Component updated");
  }

  onDestroy(): void {
    console.log("Component destroyed");
  }
}
```

### Component Weight

The execution order of components is determined by their weight. The smaller the weight value, the higher the execution priority.

typescript

```
@apclass("PhysicsComponent")
class PhysicsComponent extends Component<GameEntity> {
  onLoad(): void {
    // Set a higher priority (smaller weight value)
    this.weight = -2;
  }
}

@apclass("AnimationComponent")
class AnimationComponent extends Component<GameEntity> {
  onLoad(): void {
    // Set a lower priority (larger weight value)
    this.weight = 1;
  }
}
```

## Detailed Execution Order

### 1. Lifecycle Execution Order

typescript

```
@apclass("LifecycleComponent")
class LifecycleComponent extends Component<GameEntity> {
  onLoad(): void {
    // 1. Executed first, for initializing the component
    console.log("1. onLoad");
  }

  onEnable(): void {
    // 2. Executed when the component is enabled
    console.log("2. onEnable");
  }

  start(): void {
    // 3. Executed after all components have completed onLoad
    console.log("3. start");
  }

  update(dt: number): void {
    // 4. Executed every frame, sorted by weight
    console.log("4. update");
  }

  lateUpdate(dt: number): void {
    // 5. Executed after all components have been updated, sorted by weight
    console.log("5. lateUpdate");
  }

  onDisable(): void {
    // 6. Executed when the component is disabled
    console.log("6. onDisable");
  }

  onDestroy(): void {
    // 7. Executed when the component is destroyed
    console.log("7. onDestroy");
  }
}
```

## Advanced Usage

### 1. Dynamically Adjusting Priority

typescript

```
@apclass("DynamicComponent")
class DynamicComponent extends Component<GameEntity> {
  private needsHighPriority: boolean = false;

  update(dt: number): void {
    if (this.needsHighPriority && this.weight !== -999) {
      // Dynamically increase priority
      this.weight = -999;
    }
  }
}
```

### 2. Component Combination Pattern

typescript

```
@apclass("CompositeSystem")
class CompositeSystem extends Component<GameEntity> {
  // Store subsystem components
  private systems: Component[] = [];

  protected start(): void {
    // Add subsystems in a specific order
    this.systems.push(
      this.node.addComponent(PhysicsSystem, { weight: -2 }),
      this.node.addComponent(InputSystem, { weight: -1 }),
      this.node.addComponent(RenderSystem, { weight: 0 })
    );
  }

  protected onDestroy(): void {
    // Destroy subsystems in reverse order
    this.systems.reverse().forEach((system) => {
      this.node.removeComponent(system.constructor as any);
    });
  }
}
```

## Best Practices

### 1. Recommended Weight Allocation

typescript

```
// Physics System: Highest priority
@apclass("PhysicsSystem")
class PhysicsSystem extends Component<GameEntity> {
  onLoad() {
    this.weight = -100;
  }
}

// Input System: Second highest priority
@apclass("InputSystem")
class InputSystem extends Component<GameEntity> {
  onLoad() {
    this.weight = -50;
  }
}

// Game Logic: Normal priority
@apclass("GameLogic")
class GameLogic extends Component<GameEntity> {
  onLoad() {
    this.weight = 0;
  }
}

// Render System: Lower priority
@apclass("RenderSystem")
class RenderSystem extends Component<GameEntity> {
  onLoad() {
    this.weight = 50;
  }
}
```

### 2. Dependency Management

typescript

```
@apclass("DependentComponent")
class DependentComponent extends Component<GameEntity> {
  start(): void {
    // Ensure dependent components are already initialized
    const physics = this.node.getComponent(PhysicsSystem);
    if (!physics) {
      console.error("Missing PhysicsSystem component!");
      this.enabled = false;
      return;
    }
  }
}
```

## Notes

1. **When to Set Weight**
  - Set weight in`onLoad`.
  - Avoid frequent modifications to weight.
  - Plan the weight range reasonably.
2. **Execution Order Dependency**
  - Do not over-rely on execution order.
  - Use the event system for communication between components.
  - Be careful to avoid circular dependencies.
3. **Performance Considerations**
  - Avoid having too many high-priority components.
  - Use`update`and`lateUpdate`methods reasonably.
  - Consider using an event-driven approach instead of polling.

## Frequently Asked Questions

### Q: How to handle dependencies between components?

A: The following methods are recommended:

1. Use the weight system to ensure the correct update order.
2. Check for dependencies in the`start`method.
3. Use the event system for loosely coupled communication.

### Q: What is the range of weight values?

A: The weight value is a number type. The recommended ranges are:

- -100 to -50: System-level components
- -49 to 0: Core game logic
- 1 to 50: Normal components
- 51 to 100: Post-processing components

### Q: How to optimize the performance of a large number of components?

A: You can optimize in the following ways:

1. Use the weight system reasonably.
2. Use a component pool.
3. Disable unnecessary components in a timely manner.
4. Avoid repetitive calculations in`update`and`lateUpdate`.
