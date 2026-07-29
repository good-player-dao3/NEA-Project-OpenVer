---
title: "React Component Event Handlers"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/eventHandlers.html"
---

# React Component Event Handlers

In ArenaPro's React development, various UI components support a rich set of event handling mechanisms, allowing creators to build highly interactive user interfaces. This document will detail the available event handlers and their use cases.

## Common Event Handlers

All UI components support the following core event handlers:

tsx

```
/** Click event handler */
onClick?: (event: UiEvent<T>) => void;

/** Mouse down event handler */
onMouseDown?: (event: UiEvent<T>) => void;

/** Mouse up event handler */
onMouseUp?: (event: UiEvent<T>) => void;

/** Callback for when the element has finished mounting */
onMount?: (element: T) => void;

/** Callback for before the element is unmounted */
onUnmount?: (element: T) => void;
```

### Basic Usage Example

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState } = hooks;

function InteractiveButton() {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <box
      onClick={(event) => {
        console.log("Button was clicked", event);
      }}
      onMouseDown={(event) => {
        console.log("Mouse down", event);
        setIsPressed(true);
      }}
      onMouseUp={(event) => {
        console.log("Mouse up", event);
        setIsPressed(false);
      }}
      onMount={(element) => {
        console.log("Button has been mounted to the UI tree", element);
      }}
      onUnmount={(element) => {
        console.log("Button will be unmounted from the UI tree", element);
      }}
    />
  );
}
```

### Detailed Lifecycle Events

The`onMount`and`onUnmount`event handlers are crucial for managing a component's lifecycle:

tsx

```
function LifecycleDemoComponent() {
  const [showChild, setShowChild] = useState(true);

  return (
    <box>
      <box
        onClick={() => setShowChild(!showChild)}
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 150, b: 200 }),
          size: { offset: Vec2.create({ x: 120, y: 30 }) },
        }}
      >
        <text>Toggle Display</text>
      </box>

      {showChild && (
        <box
          style={{
            position: { offset: Vec2.create({ x: 0, y: 40 }) },
            backgroundColor: Vec3.create({ r: 200, g: 100, b: 50 }),
            size: { offset: Vec2.create({ x: 200, y: 100 }) },
          }}
          onMount={(element) => {
            console.log("Child element has been mounted", element);
            // Initialization operations can be performed here
            // e.g., starting animations, setting focus, requesting data, etc.
          }}
          onUnmount={(element) => {
            console.log("Child element is about to be unmounted", element);
            // Cleanup operations can be performed here
            // e.g., saving state, stopping timers, canceling network requests, etc.
          }}
        >
          <text>Lifecycle Demo Component</text>
        </box>
      )}
    </box>
  );
}
```

## Input Box Specific Event Handlers

In addition to the common event handlers, the input box component provides the following specific event handlers:

tsx

```
/** Focus event handler */
onFocus?: (event: UiEvent<UiInput>) => void;

/** Blur event handler */
onBlur?: (event: UiEvent<UiInput>) => void;
```

### Input Box Event Application Example

tsx

```
function EnhancedInput() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <box>
      <input
        onFocus={(event) => {
          console.log("Input box gained focus", event);
          setIsFocused(true);
        }}
        onBlur={(event) => {
          console.log("Input box lost focus", event);
          setIsFocused(false);
        }}
        style={{
          borderWidth: 2,
          borderColor: isFocused
            ? Vec3.create({ r: 0, g: 122, b: 255 })
            : Vec3.create({ r: 200, g: 200, b: 200 }),
          size: { offset: Vec2.create({ x: 200, y: 30 }) },
        }}
      />
      <text style={{ position: { offset: Vec2.create({ x: 0, y: 40 }) } }}>
        Status: {isFocused ? "Typing..." : "Waiting for input"}
      </text>
    </box>
  );
}
```

### Form Validation Practice

By combining focus and input events, real-time form validation can be implemented:

tsx

```
function ValidatedInput() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = /^\S+@\S+\.\S+$/.test(email);
  const showError = touched && !isValid;

  return (
    <box>
      <text>Email:</text>
      <input
        onBlur={(e) => {
          setEmail(e.target.textContent);
          setTouched(true);
        }}
      />
      {showError && (
        <text
          style={{
            textColor: Vec3.create({ r: 255, g: 0, b: 0 }),
            position: { offset: Vec2.create({ x: 0, y: 40 }) },
          }}
        >
          Please enter a valid email address
        </text>
      )}
    </box>
  );
}
```

## Image Component Specific Event Handlers

The image component provides a load event handler to monitor the loading status of image resources:

tsx

```
/** Image load complete event handler */
onLoad?: (event: UiEvent<UiImage>) => void;
```

### Image Loading Example

tsx

```
function ImageWithLoadingState() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <box>
      {!isLoaded && !hasError && (
        <box
          style={{
            backgroundColor: Vec3.create({ r: 240, g: 240, b: 240 }),
            size: { offset: Vec2.create({ x: 200, y: 150 }) },
          }}
        >
          <text>Loading...</text>
        </box>
      )}

      <image
        style={{
          image: "https://example.com/image.jpg",
          size: { offset: Vec2.create({ x: 200, y: 150 }) },
          // Hide the image until it's loaded
          backgroundOpacity: isLoaded ? 1 : 0,
        }}
        onLoad={(event) => {
          console.log("Image loaded successfully", event);
          setIsLoaded(true);
        }}
      />

      {hasError && (
        <box
          style={{
            backgroundColor: Vec3.create({ r: 250, g: 230, b: 230 }),
            size: { offset: Vec2.create({ x: 200, y: 150 }) },
          }}
        >
          <text style={{ textColor: Vec3.create({ r: 200, g: 0, b: 0 }) }}>
            Failed to load image
          </text>
        </box>
      )}
    </box>
  );
}
```

## Best Practices for Event Handling

### 1. Use useCallback for Performance Optimization

For components that re-render frequently, using`useCallback`can prevent unnecessary function recreation:

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useCallback, useState } = hooks;

function OptimizedComponent({ onAction }) {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    onAction(count);
  }, [count, onAction]); // Dependencies ensure the function is only recreated when needed

  return (
    <box onClick={handleClick}>
      <text>Count: {count}</text>
    </box>
  );
}
```

### 2. Event Delegation

For long lists of items, attach a single event handler to the parent container instead of one for each item:

tsx

```
function ItemList({ items }) {
  const handleItemClick = (event) => {
    const itemId = event.target.dataset.itemId;
    if (itemId) {
      console.log(`Item ${itemId} clicked`);
    }
  };

  return (
    <box onClick={handleItemClick}>
      {items.map((item) => (
        <box key={item.id} dataset={{ itemId: item.id }}>
          <text>{item.name}</text>
        </box>
      ))}
    </box>
  );
}
```

### 3. Asynchronous Event Handlers

Event handlers can be asynchronous, which is useful for operations like network requests:

tsx

```
async function handleSave() {
  try {
    const response = await http.fetch("/api/save", {
      /* ... */
    });
    const result = await response.json();
    console.log("Save successful", result);
  } catch (error) {
    console.error("Save failed", error);
  }
}
```

### 4. Custom Event Data

Pass custom data through event handlers using lambda functions:

tsx

```
function ProductList({ products }) {
  const handleAddToCart = (productId) => {
    console.log(`Adding product ${productId} to cart`);
  };

  return (
    <box>
      {products.map((product) => (
        <box key={product.id} onClick={() => handleAddToCart(product.id)}>
          <text>{product.name}</text>
        </box>
      ))}
    </box>
  );
}
```
