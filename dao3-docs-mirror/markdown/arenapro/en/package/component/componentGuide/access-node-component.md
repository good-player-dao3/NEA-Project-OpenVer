---
title: "Accessing Nodes and Components"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/access-node-component.html"
---

# Accessing Nodes and Components

In the Box3 engine's component system, understanding how to properly access nodes and components is fundamental to development. This article will detail the relevant methods.

## Accessing Nodes

### 1. Creating a Node

typescript

```
// Bind an entity when creating a node
const playerNode = new EntityNode(world.querySelector("#EntityName"));
```

### 2. Finding an Existing Node

typescript

```
import { find } from "@dao3fun/component";

// Find the corresponding node through an entity
const entity = world.querySelector("#NPC");
new EntityNode(entity);

const node = find(entity);
if (node) {
  console.log("Node found! Node UUID:", node.uuid);
} else {
  console.log("Node not found!");
}
```

### 3. Accessing the Current Node within a Component

typescript

```
@apclass("PlayerComponent")
export class PlayerComponent extends Component<GameEntity> {
  start() {
    // Access the node to which the current component belongs via this.node
    console.log("Current node:", this.node);

    // Access the entity on the node
    console.log("Node entity:", this.node.entity);
  }
}
```

## Accessing Components

### 1. Adding a Component

typescript

```
@apclass("MovementComponent")
export class MovementComponent extends Component<GameEntity> {
  speed = 5;

  start() {
    console.log("Movement component added! Speed value:", this.speed);
  }
}

// Method 1: Add by component class
const node = new EntityNode(null);
node.addComponent(MovementComponent);

// Method 2: Add by component name
node.addComponent("MovementComponent");

// Method 3: Pass configuration when adding a component
node.addComponent(MovementComponent, {
  speed: 10,
});
```

### 2. Getting a Component

typescript

```
@apclass("PlayerController")
export class PlayerController extends Component<GameEntity> {
  start() {
    // Method 1: Get by component class
    const movement = this.node.getComponent(MovementComponent);

    // Method 2: Get by component name
    const movement2 = this.node.getComponent("MovementComponent");

    if (movement) {
      movement.speed = 15;
    }
  }
}
```

### 3. Getting Multiple Components

typescript

```
@apclass("GameManager")
export class GameManager extends Component<GameEntity> {
  start() {
    // Get all components on the node
    const allComponents = Array.from(this.node.components.values());
    console.log("All components:", allComponents);

    // Get all components of a specific type
    const movements = this.node.getComponents(MovementComponent);
    console.log("All movement components:", movements);
  }
}
```

### 4. Removing a Component

typescript

```
@apclass("ComponentManager")
export class ComponentManager extends Component<GameEntity> {
  start() {
    // Method 1: Remove by component class
    this.node.removeComponent(MovementComponent);

    // Method 2: Remove by component name
    this.node.removeComponent("MovementComponent");
  }
}
```

## Practical Example

### Character Control System

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
    // Get the movement component
    this.movement = this.node.getComponent(MovementComponent);

    // If there is no movement component, add one automatically
    if (!this.movement) {
      this.movement = this.node.addComponent(MovementComponent);
    }

    // Listen for key press events
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

## Important Notes

1. **Component Retrieval Check**
  - Always check if the return value of`getComponent`is null.
  - Consider the case where the component might not exist.
2. **Component Dependency Management**
  - Get the required component references in`start`.
  - Automatically add dependent components if necessary.
3. **Performance Optimization**
  - Cache frequently used component references.
  - Avoid repeatedly getting components in`update`.

## Frequently Asked Questions

### Q: Why can't I get the component I added?

A: Check the following:

- Whether the component class uses the`@apclass`decorator.
- Whether the component name is correct.
- Whether the component has been successfully added to the node.

### Q: How can I share data between components?

A: You can do this in the following ways:

- Access other components directly through the node.
- Use the event system for communication.
- Use global state management.

### Q: When should I get a component?

A: It is recommended to get the required component references in the`start`lifecycle method, as all components have finished loading by then.
