---
title: "Customizing GameEntity and GamePlayerEntity Classes"
source: "https://docs.dao3.fun/arenapro/en/difference/customizeEntity.html"
---

# Customizing GameEntity and GamePlayerEntity Classes

In TypeScript development, directly extending or modifying global classes (such as`GameEntity`and`GamePlayerEntity`) can introduce potential risks, especially when these global classes are provided by third-party libraries or frameworks. To avoid potential naming conflicts and compatibility issues in the future, it is recommended to extend these classes through inheritance.

## Implementation with Inheritance

### Extending the GameEntity Class

typescript

```
// GameEntity.d.ts
declare interface GameEntity extends GameEntity {
  // Custom property
  customProperty: string;

  // Custom method
  customMethod(): void;
}
```

### Extending the GamePlayerEntity Class

typescript

```
// GamePlayerEntity.d.ts
declare interface GamePlayerEntity extends GamePlayerEntity {
  // Custom property
  customProperty: string;

  // Custom method
  customMethod(): void;
}
```

## Usage Example

typescript

```
// Now you can safely access the custom properties and methods
entity.customProperty = "someValue";
entity.customMethod();
```

## Important Notes

1. Ensure that custom properties and methods do not conflict with the parent class or other extensions.
2. It is recommended to define extensions in a separate module to avoid global pollution.
3. Please ensure that the relevant type declarations have been correctly loaded before use.
