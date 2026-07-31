---
title: "Decorator Usage Guide"
source: "https://docs.dao3.fun/arenapro/en/package/component/componentGuide/decorator.html"
---

# Decorator Usage Guide

Decorators are an important feature in the Box3 Engine component system, helping us better manage and use components. This guide will help you understand and use decorators correctly.

## What is a Decorator?

A decorator is a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. In the Box3 Engine, we mainly use the`@apclass`decorator to mark and register component classes.

## The @apclass Decorator

### Basic Usage

typescript

```
import { _decorator, Component } from "@dao3fun/component";
const { apclass } = _decorator;

@apclass("PlayerController")
export class PlayerController extends Component<GameEntity> {
  // Component implementation...
}
```

### Why Use Decorators?

The main roles of the`@apclass`decorator are:

- To register the component in the global component table.
- To support creating component instances using a string name.

## Usage Examples

### ✅ Correct Usage

typescript

```
@apclass("MovementComponent")
export class MovementComponent extends Component<GameEntity> {
  speed = 5;

  update(dt: number) {
    this.node.entity.position.x += this.speed * dt;
  }
}

// You can add the component by its string name
const node = new EntityNode();
node.addComponent("MovementComponent");
```

### ❌ Incorrect Usage

typescript

```
export class MovementComponent extends Component<GameEntity> {
  speed = 5;
}

const node = new EntityNode();
node.addComponent("MovementComponent"); // Error: Component not found
```

## Best Practices

1. **Naming Convention**typescript`@apclass("PlayerController")// Keep the decorator name consistent with the class nameexportclassPlayerControllerextendsComponent<GameEntity> {}`
2. **Import Style**typescript`// Recommended import styleimport{ _decorator, Component }from"@dao3fun/component";const{apclass}=_decorator;`
3. **Type Parameters**typescript`// Specify the correct entity type@apclass("EnemyAI")exportclassEnemyAIextendsComponent<GameEntity> {}`

## Notes

1. The decorator name must be unique.
2. It is recommended to keep the decorator name consistent with the class name.
3. Component classes without a decorator cannot be added by their string name.
4. Ensure that decorator support is enabled in`tsconfig.json`:json`{"compilerOptions": {"experimentalDecorators":true}}`

## Frequently Asked Questions

### Q: Why can't I add my component by its string name?

A: Check if you have used the`@apclass`decorator correctly and if the decorator name is correct.

### Q: Can the decorator name be different from the class name?

A: Technically, yes, but it is recommended to keep them consistent to avoid confusion.

### Q: Can a component class have multiple decorators?

A: Yes, but the`@apclass`decorator is required.
