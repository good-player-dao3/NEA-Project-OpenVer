---
title: "TypeScript Type Definitions"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/tsType.html"
---

# TypeScript Type Definitions

When using TypeScript, we can define types for component properties:

tsx

```
interface BoxProps {
  style?: {
    position?: { offset: Vec2 };
    size?: { offset: Vec2 };
  };
  children?: any;
}

function Box({ style, children }: BoxProps) {
  return <box style={style}>{children}</box>;
}
```

## Conditional Rendering

In addition to the ternary operator, we can also use the following methods for conditional rendering:

### 1. Logical AND Operator

tsx

```
<box>{isLoggedIn && <text>Welcome back</text>}</box>
```

### 2. Conditional Function

tsx

```
function renderContent(isLoading: boolean) {
  if (isLoading) {
    return <text>Loading...</text>;
  }
  return <text>Content loaded</text>;
}

<box>{renderContent(isLoading)}</box>;
```

## List Rendering

When using the`map`function to render a list, pay attention to the following points:

tsx

```
const items = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
  { id: 3, name: "Item 3" },
];

<box>
  {items.map((item) => (
    <text
      style={{ position: { offset: Vec2.create({ x: 0, y: item.id * 30 }) } }}
    >
      {item.name}
    </text>
  ))}
</box>;
```

Effect:

![](/arenapro/QQ20250402-160639.png)

## Performance Optimization Suggestions

1. **Avoid Unnecessary Re-renders**
  - Wrap purely presentational components with`React.memo`.
  - Use`useMemo`and`useCallback`appropriately.
2. **Style Optimization**
  - Extract static styles into constants.
3. **Event Handling Optimization**
  - Avoid creating new functions during rendering.
  - Cache event handler functions with`useCallback`.
4. **List Rendering Optimization**
  - Use virtual lists for handling large amounts of data.
  - Implement`shouldComponentUpdate`or use`React.memo`.

## Best Practices

1. **Location of Type Definitions**
  - Place type definitions in separate type files.
  - Use`type`or`interface`depending on the specific situation.
  - Prefer`interface`for extension.
2. **Type Naming**
  - Use PascalCase for naming types.
  - Use meaningful type names.
  - Avoid using overly generic type names.
3. **Type Reusability**
  - Extract common types into shared files.
  - Use type utilities to reduce duplicate code.
  - Use type aliases reasonably.
4. **Type Safety**
  - Use strict type checking.
  - Avoid using the`any`type.
  - Use type guards to ensure type safety.
5. **Performance Considerations**
  - Avoid deeply nested types.
  - Use type utilities to optimize complex types.
  - Be aware of the performance impact of type inference.
