---
title: "Node Creation and Destruction"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/create-destroy.html"
---

# Node Creation and Destruction

This article describes how to create and destroy nodes in the Box3 Engine, along with related best practices.

## Creating Nodes

### Basic Creation Method

typescript

```
// Create a node and bind an entity
const entity = world.querySelector("#entityName");
const playerNode = new EntityNode(entity);
```

### Creating Nodes with Components

typescript

```
@apclass("PlayerComponent")
class PlayerComponent extends Component<GameEntity> {
  speed = 5;
}

// Method 1: Create the node first, then add components
const node = new EntityNode();
node.addComponent(PlayerComponent);

// Method 2: Chain calls to add multiple components
const node2 = new EntityNode()
  .addComponent(PlayerComponent)
  .addComponent(HealthComponent)
  .addComponent(InputComponent);
```

### Creating Nodes from Prefabs

typescript

```
// Define a prefab configuration
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

// Create a node from a prefab
function createFromPrefab(prefab: any): EntityNode {
  const node = new EntityNode();

  prefab.components.forEach((comp) => {
    node.addComponent(comp.type, comp.props);
  });

  return node;
}

// Use the prefab to create a node
const playerNode = createFromPrefab(playerPrefab);
```

## Destroying Nodes

### Basic Destruction Method

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
      // Destroy the node
      this.playerNode.destroy();
      this.playerNode = null;
    }
  }
}
```

### Destruction Lifecycle

typescript

```
@apclass("PlayerComponent")
class PlayerComponent extends Component<GameEntity> {
  start() {
    console.log("Player component started");
  }

  onDestroy() {
    // Perform cleanup before the component is destroyed
    console.log("Player component is about to be destroyed");
    this.cleanup();
  }

  private cleanup() {
    // Clean up resources, cancel event listeners, etc.
  }
}
```

## Best Practices

### 1. Node Pool Management

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
    // Create a node of the corresponding type based on the name
    return new EntityNode();
  }
}

// Using the node pool
const bullet = NodePool.obtain("bullet");
// ... use the node ...
NodePool.recycle("bullet", bullet);
```

### 2. Safe Destruction Checks

typescript

```
@apclass("SafeComponent")
class SafeComponent extends Component<GameEntity> {
  private timers: number[] = [];
  private eventHandlers: Function[] = [];

  start() {
    // Register events and timers
    this.eventHandlers.push(
      world.onPress(() => {
        console.log("Key press event");
      })
    );

    this.timers.push(
      setInterval(() => {
        console.log("Timer executed");
      }, 1000)
    );
  }

  onDestroy() {
    // Clean up all event listeners
    this.eventHandlers.forEach((handler) => {
      handler.cancel();
    });

    // Clean up all timers
    this.timers.forEach((timer) => {
      clearInterval(timer);
    });
  }
}
```

## Notes

1. **Memory Management**
  - Destroy unnecessary nodes in a timely manner.
  - Use a node pool to manage frequently created/destroyed objects.
  - Clean up all resources and references when destroying a node.
2. **Destruction Order**
  - Destroying a node automatically destroys all its components.
  - A component's`onDestroy`is called when the node is destroyed.
  - Ensure all resources are cleaned up in`onDestroy`.
3. **Reference Management**
  - Set references to a destroyed node to`null`.
  - Check if a node has been destroyed before using it.
  - Avoid retaining references to destroyed nodes.

## Frequently Asked Questions

### Q: Can a node be reused after being destroyed?

A: No. Once a node is destroyed, it cannot be recovered. A new node must be created. It is recommended to use a node pool for management.

### Q: Do I need to manually destroy components when destroying a node?

A: No. Destroying a node automatically destroys all of its components.
