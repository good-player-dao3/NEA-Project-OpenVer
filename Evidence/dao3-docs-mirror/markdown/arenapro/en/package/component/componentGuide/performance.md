---
title: "Node Performance Optimization Guide"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/performance.html"
---

# Node Performance Optimization Guide

This article introduces how to optimize the performance of nodes and components in the Box3 Engine, helping creators build efficient games.

## Component Performance Monitoring

### Enabling/Disabling Performance Monitoring

typescript

```
// Disable performance monitoring (recommended for production environments)
EntityNode.isMonitoringEnabled = false;

// Enable performance monitoring (recommended for development environments)
EntityNode.isMonitoringEnabled = true;
```

### Global Callback for Performance Warnings

typescript

```
// Set the performance warning callback
EntityNode.onPerformanceWarning((event) => {
  console.warn(
    `\n📊 Component Performance Report - ${event.component.constructor.name}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `Node ID: ${event.entityNode.uuid}\n` +
      `Current FPS: ${event.currentFPS} FPS\n` +
      `Execution Time: ${event.executionTime}ms\n` +
      `Average Execution: ${event.averageExecutionTime}ms\n` +
      `Min Execution: ${event.minExecutionTime}ms\n` +
      `Max Execution: ${event.maxExecutionTime}ms\n` +
      `Standard Deviation: ${event.standardDeviation}ms\n` +
      `Performance Trend: ${event.performanceTrend}\n` +
      `Warning Count: ${event.warningCount} (execution time > 16.67ms)\n` +
      `Recent Execution Times: ${event.recentExecutionTimes.join(", ")}ms\n` +
      `━━━━━━━━━━━━━━━`
  );
});
```

### Getting Performance Information for a Single Component on a Node

typescript

```
@apclass("BadPerformance")
class BadPerformance extends Component<GameEntity> {
  start() {
    this.performance = this.node.getComponentPerformance(ObjectPoolManager);
    console.log(this.performance.averageExecutionTime); // Average execution time
  }
}
```

## Component Performance Optimization

### 1. Caching References

typescript

```
@apclass("BadPerformance")
class BadPerformance extends Component<GameEntity> {
  // ❌ Bad practice: Getting the component every frame
  update(dt: number) {
    const transform = this.node.getComponent(Transform);
    transform.position.x += 1;
  }
}

@apclass("GoodPerformance")
class GoodPerformance extends Component<GameEntity> {
  private transform: Transform | null = null;

  // ✅ Good practice: Caching the component reference in start
  start() {
    this.transform = this.node.getComponent(Transform);
  }

  update(dt: number) {
    if (this.transform) {
      this.transform.position.x += 1;
    }
  }
}
```

### 2. Object Pooling

typescript

```
@apclass("ObjectPoolManager")
class ObjectPoolManager extends Component<GameEntity> {
  private bulletPool: EntityNode[] = [];
  private readonly poolSize = 20;

  start() {
    // Pre-create the object pool
    for (let i = 0; i < this.poolSize; i++) {
      const bullet = new EntityNode();
      bullet.addComponent(BulletComponent);
      bullet.active = false;
      this.bulletPool.push(bullet);
    }
  }

  getBullet(): EntityNode | null {
    // Get an unused bullet from the pool
    const bullet = this.bulletPool.find((b) => !b.active);
    if (bullet) {
      bullet.active = true;
      return bullet;
    }
    return null;
  }

  recycleBullet(bullet: EntityNode) {
    bullet.active = false;
    // Reset the bullet's state
    const bulletComp = bullet.getComponent(BulletComponent);
    if (bulletComp) {
      bulletComp.reset();
    }
  }
}
```

### 3. Update Frequency Optimization

typescript

```
@apclass("UpdateOptimization")
class UpdateOptimization extends Component<GameEntity> {
  private updateInterval: number = 0.1; // Update interval in seconds
  private timeAccumulator: number = 0;

  update(dt: number) {
    this.timeAccumulator += dt;

    // Only execute the update when the interval is reached
    if (this.timeAccumulator >= this.updateInterval) {
      this.timeAccumulator = 0;
      this.performUpdate();
    }
  }

  private performUpdate() {
    // Execute the actual update logic
  }
}
```

## Memory Management

### 1. Releasing Resources

typescript

```
@apclass("ResourceManager")
class ResourceManager extends Component<GameEntity> {
  private resources: any[] = [];
  private eventHandlers: Function[] = [];

  start() {
    // Load resources
    this.loadResources();

    // Register events
    this.registerEvents();
  }

  private loadResources() {
    // Load a resource and keep a record of it
    const resource = this.loadResource();
    this.resources.push(resource);
  }

  private registerEvents() {
    // Register an event and keep a record of the handler
    const handler = world.onPress(() => {});
    this.eventHandlers.push(handler);
  }

  onDestroy() {
    // Release resources
    this.resources.forEach((resource) => {
      resource.dispose();
    });

    // Clean up events
    this.eventHandlers.forEach((handler) => {
      handler.cancel();
    });

    // Clear arrays
    this.resources = [];
    this.eventHandlers = [];
  }
}
```

### 2. Lazy Loading

typescript

```
@apclass("LazyLoading")
class LazyLoading extends Component<GameEntity> {
  private loadedComponents: Set<string> = new Set();

  async loadComponentWhenNeeded(componentName: string) {
    if (this.loadedComponents.has(componentName)) {
      return;
    }

    try {
      // Dynamically load the component
      const component = await this.loadComponent(componentName);
      this.node.addComponent(component);
      this.loadedComponents.add(componentName);
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
    }
  }
}
```

## Rendering Optimization

### 1. Visibility Management

typescript

```
@apclass("VisibilityManager")
class VisibilityManager extends Component<GameEntity> {
  private visibilityDistance: number = 100;
  private checkInterval: number = 1; // Check interval in seconds
  private timeAccumulator: number = 0;

  update(dt: number) {
    this.timeAccumulator += dt;

    if (this.timeAccumulator >= this.checkInterval) {
      this.timeAccumulator = 0;
      this.checkVisibility();
    }
  }

  private checkVisibility() {
    const playerPos = this.getPlayerPosition();
    const distance = this.calculateDistance(playerPos);

    // Control entity visibility based on distance
    this.node.entity.visible = distance <= this.visibilityDistance;
  }
}
```

## Practical Optimization Example

### Particle System Optimization
