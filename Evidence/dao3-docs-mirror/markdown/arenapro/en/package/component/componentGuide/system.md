---
title: "Node System"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/system.html"
---

# Node System

`NodeSystem`is a powerful game system management class used to uniformly manage and process the behavior and state of multiple entity nodes (`EntityNode`). It acts like a "manager" that can control multiple game objects simultaneously, making it very suitable for handling group behaviors and global logic in a game.

## Basic Example: Creating a Simple Scoring System

typescript

```
class ScoreSystem extends NodeSystem {
  private totalScore: number = 0;

  onLoad(): void {
    console.log("Scoring system initialized");
  }

  protected onEntityNodeAdded(entityNode: EntityNode): void {
    // When a new player joins, listen for their score change event
    entityNode.on("scoreChange", (score: number) => {
      this.totalScore += score;
      console.log(`Total score updated: ${this.totalScore}`);
    });
  }

  protected onEntityNodeRemoved(entityNode: EntityNode): void {
    // Clean up the event listener
    entityNode.off("scoreChange");
  }
}

// Usage example
const scoreSystem = new ScoreSystem();
const player = new EntityNode(world.querySelector("#entityName")!);
scoreSystem.addEntityNode(player);

// When the player scores
player.emit("scoreChange", 100);
```

## Advanced Example: Physics Collision System

typescript

```
class CollisionSystem extends NodeSystem {
  update(deltaTime: number): void {
    // Get all entities in the system
    const entities = this.entities;

    // Simple collision detection
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        if (this.checkCollision(entities[i], entities[j])) {
          this.handleCollision(entities[i], entities[j]);
        }
      }
    }
  }

  private checkCollision(entity1: EntityNode, entity2: EntityNode): boolean {
    // Implement collision detection logic
    const pos1 = entity1.entity.position;
    const pos2 = entity2.entity.position;
    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
    return distance < 1; // Assuming collision distance is 1
  }

  private handleCollision(entity1: EntityNode, entity2: EntityNode): void {
    // Emit collision events
    entity1.emit("collision", entity2);
    entity2.emit("collision", entity1);
  }
}
```

## Advanced Example: AI Control System

typescript

```
class AISystem extends NodeSystem {
  private updateInterval: number = 100; // Update AI every 100ms
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
    // Implement AI logic
    const nearestTarget = this.findNearestTarget(entity);
    if (nearestTarget) {
      entity.emit("targetFound", nearestTarget);
    }
  }

  private findNearestTarget(entity: EntityNode): EntityNode | null {
    // Find the nearest target
    return this.entities.find((target) => target !== entity);
  }
}
```

## Usage Tips

1. **Lifecycle Management**typescript`classCustomSystemextendsNodeSystem{onLoad():void{// Called when the system is initialized}onEnable():void{// Called when the system is enabled}onDisable():void{// Called when the system is disabled}onDestroy():void{// Called when the system is destroyed}}`
2. **Entity Management**typescript`constsystem=newCustomSystem();// Add an entitysystem.addEntityNode(entityNode);// Remove an entitysystem.removeEntityNode(entityNode);// Get all entitiesconstallEntities=system.entities;`
3. **Performance Optimization**typescript`classOptimizedSystemextendsNodeSystem{privatecachedData:Map<string,any>=newMap();update(deltaTime:number):void{// Use caching to avoid repeated calculationsfor(constentityofthis.entities) {constcached=this.cachedData.get(entity.uuid);if(!cached) {constnewData=this.heavyCalculation(entity);this.cachedData.set(entity.uuid, newData);}}}}`

Remember:

- `NodeSystem`is suitable for handling the common behavior of multiple entities.
- Use lifecycle functions appropriately.
- Be sure to clean up unnecessary entities and event listeners.
- You can control the enabled state of the system through the`enable`property.
