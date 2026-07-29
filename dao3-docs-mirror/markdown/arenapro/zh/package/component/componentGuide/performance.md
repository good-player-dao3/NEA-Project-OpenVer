---
title: "节点性能优化指南"
source: "https://docs.dao3.fun/arenapro/zh/package/component/componentGuide/performance.html"
---

# 节点性能优化指南

本文将介绍在神岛引擎中如何优化节点和组件的性能，帮助创作者创建高效的游戏。

## 组件性能监控

### 启用/禁用性能监控

typescript

```
// 禁用性能监控（生产环境建议）
EntityNode.isMonitoringEnabled = false;

// 启用性能监控（开发环境建议）
EntityNode.isMonitoringEnabled = true;
```

### 性能警告全局回调

typescript

```
// 设置性能警告回调
EntityNode.onPerformanceWarning((event) => {
  console.warn(
    `\n📊 组件性能报告 - ${event.component.constructor.name}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `节点ID: ${event.entityNode.uuid}\n` +
      `当前帧率: ${event.currentFPS} FPS\n` +
      `执行时间: ${event.executionTime}ms\n` +
      `平均执行: ${event.averageExecutionTime}ms\n` +
      `最小执行: ${event.minExecutionTime}ms\n` +
      `最大执行: ${event.maxExecutionTime}ms\n` +
      `标准差: ${event.standardDeviation}ms\n` +
      `性能趋势: ${event.performanceTrend}\n` +
      `警告次数: ${event.warningCount} （执行时间>16.67ms）\n` +
      `最近执行: ${event.recentExecutionTimes.join(", ")}ms\n` +
      `━━━━━━━━━━━━━━━`
  );
});
```

### 获取该节点下单组件性能信息

typescript

```
@apclass("BadPerformance")
class BadPerformance extends Component<GameEntity> {
  start() {
    this.performance = this.node.getComponentPerformance(ObjectPoolManager);
    console.log(this.performance.averageExecutionTime); // 平均执行时间
  }
}
```

## 组件性能优化

### 1. 缓存引用

typescript

```
@apclass("BadPerformance")
class BadPerformance extends Component<GameEntity> {
  // ❌ 不好的实践：每帧都获取组件
  update(dt: number) {
    const transform = this.node.getComponent(Transform);
    transform.position.x += 1;
  }
}

@apclass("GoodPerformance")
class GoodPerformance extends Component<GameEntity> {
  private transform: Transform | null = null;

  // ✅ 好的实践：在 start 中缓存组件引用
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

### 2. 对象池化

typescript

```
@apclass("ObjectPoolManager")
class ObjectPoolManager extends Component<GameEntity> {
  private bulletPool: EntityNode[] = [];
  private readonly poolSize = 20;

  start() {
    // 预创建对象池
    for (let i = 0; i < this.poolSize; i++) {
      const bullet = new EntityNode();
      bullet.addComponent(BulletComponent);
      bullet.active = false;
      this.bulletPool.push(bullet);
    }
  }

  getBullet(): EntityNode | null {
    // 从池中获取未使用的子弹
    const bullet = this.bulletPool.find((b) => !b.active);
    if (bullet) {
      bullet.active = true;
      return bullet;
    }
    return null;
  }

  recycleBullet(bullet: EntityNode) {
    bullet.active = false;
    // 重置子弹状态
    const bulletComp = bullet.getComponent(BulletComponent);
    if (bulletComp) {
      bulletComp.reset();
    }
  }
}
```

### 3. 更新频率优化

typescript

```
@apclass("UpdateOptimization")
class UpdateOptimization extends Component<GameEntity> {
  private updateInterval: number = 0.1; // 更新间隔（秒）
  private timeAccumulator: number = 0;

  update(dt: number) {
    this.timeAccumulator += dt;

    // 只在达到更新间隔时执行更新
    if (this.timeAccumulator >= this.updateInterval) {
      this.timeAccumulator = 0;
      this.performUpdate();
    }
  }

  private performUpdate() {
    // 执行实际的更新逻辑
  }
}
```

## 内存管理

### 1. 资源释放

typescript

```
@apclass("ResourceManager")
class ResourceManager extends Component<GameEntity> {
  private resources: any[] = [];
  private eventHandlers: Function[] = [];

  start() {
    // 加载资源
    this.loadResources();

    // 注册事件
    this.registerEvents();
  }

  private loadResources() {
    // 加载资源并记录
    const resource = this.loadResource();
    this.resources.push(resource);
  }

  private registerEvents() {
    // 注册事件并记录处理函数
    const handler = world.onPress(() => {});
    this.eventHandlers.push(handler);
  }

  onDestroy() {
    // 释放资源
    this.resources.forEach((resource) => {
      resource.dispose();
    });

    // 清理事件
    this.eventHandlers.forEach((handler) => {
      handler.cancel();
    });

    // 清空数组
    this.resources = [];
    this.eventHandlers = [];
  }
}
```

### 2. 延迟加载

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
      // 动态加载组件
      const component = await this.loadComponent(componentName);
      this.node.addComponent(component);
      this.loadedComponents.add(componentName);
    } catch (error) {
      console.error(`加载组件失败: ${componentName}`, error);
    }
  }
}
```

## 渲染优化

### 1. 可见性管理

typescript

```
@apclass("VisibilityManager")
class VisibilityManager extends Component<GameEntity> {
  private visibilityDistance: number = 100;
  private checkInterval: number = 1; // 检查间隔（秒）
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

    // 根据距离控制实体可见性
    this.node.entity.visible = distance <= this.visibilityDistance;
  }
}
```

## 实战优化示例

### 粒子系统优化

typescript

```
@apclass("OptimizedParticleSystem")
class OptimizedParticleSystem extends Component<GameEntity> {
  private readonly maxParticles: number = 100;
  private particles: EntityNode[] = [];
  private activeParticles: number = 0;

  start() {
    // 预创建粒子池
    this.initializeParticlePool();
  }

  private initializeParticlePool() {
    for (let i = 0; i < this.maxParticles; i++) {
      const particle = new EntityNode();
      particle.addComponent(ParticleComponent);
      particle.active = false;
      this.particles.push(particle);
    }
  }

  emitParticles(count: number, position: GameVector3) {
    const emitCount = Math.min(count, this.maxParticles - this.activeParticles);

    for (let i = 0; i < emitCount; i++) {
      const particle = this.getInactiveParticle();
      if (particle) {
        this.activateParticle(particle, position);
        this.activeParticles++;
      }
    }
  }

  private getInactiveParticle(): EntityNode | null {
    return this.particles.find((p) => !p.active) || null;
  }

  private activateParticle(particle: EntityNode, position: GameVector3) {
    particle.active = true;
    particle.entity.position = position;

    // 设置粒子生命周期
    setTimeout(() => {
      particle.active = false;
      this.activeParticles--;
    }, 2000);
  }
}
```

## 性能优化建议

1. **组件优化**
  - 使用组件池管理频繁创建/销毁的对象
  - 缓存频繁访问的组件引用
  - 合理控制更新频率
2. **内存管理**
  - 及时释放不需要的资源
  - 使用对象池避免频繁的内存分配
  - 清理事件监听和定时器
3. **更新优化**
  - 避免在 update 中进行重复计算
  - 使用节流控制更新频率
  - 根据距离控制更新频率

## 常见问题

### Q: 如何判断性能瓶颈？

A: 使用性能监控组件记录关键操作的执行时间，分析数据找出瓶颈。

### Q: 对象池大小如何确定？

A: 根据游戏实际需求和内存限制确定，可以通过性能测试调整到最佳值。

### Q: 如何处理大量实体的性能问题？

A:

1. 使用对象池管理
2. 实现可见性裁剪
3. 根据距离调整更新频率
