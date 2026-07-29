---
title: "React API Reference"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/api.html"
---

# React API Reference

This document provides usage instructions and examples for key APIs in React, with a focus on those related to performance optimization.

## [createContext](https://react.dev/reference/react/createContext)

`createContext`is used to create a context, allowing components in a component tree to share data without having to pass props down through multiple levels.

### Basic Usage

tsx

```
import React, { hooks, createContext } from "@dao3fun/react";
const { useContext, useState } = hooks;

// Create a context
const ThemeContext = createContext("light");

// A child component accesses the context via useContext
function ThemedButton() {
  // Use the value from the context
  const theme = useContext(ThemeContext);

  return (
    <box
      style={{
        backgroundColor:
          theme === "dark"
            ? Vec3.create({ r: 50, g: 50, b: 50 })
            : Vec3.create({ r: 240, g: 240, b: 240 }),
        size: { offset: Vec2.create({ x: 120, y: 40 }) },
      }}
    >
      <text
        style={{
          textColor:
            theme === "dark"
              ? Vec3.create({ r: 255, g: 255, b: 255 })
              : Vec3.create({ r: 50, g: 50, b: 50 }),
        }}
      >
        Current theme: {theme}
      </text>
    </box>
  );
}

// An intermediate component that doesn't need to know about the theme
function Toolbar() {
  return (
    <box>
      <ThemedButton />
    </box>
  );
}

// The root component provides the context value
function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={theme}>
      <box>
        <Toolbar />
        <box
          style={{
            backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
            size: { offset: Vec2.create({ x: 150, y: 40 }) },
            position: { offset: Vec2.create({ x: 0, y: 50 }) },
          }}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            Switch Theme
          </text>
        </box>
      </box>
    </ThemeContext.Provider>
  );
}
```

### Providing a Default Value

You can provide a default value when creating a context, which will be used if there is no matching Provider in the component tree:

tsx

```
// Set the default theme to "light"
const ThemeContext = createContext("light");
```

### Nested Providers

Context Providers can be nested, and an inner Provider will override the value of an outer one:

tsx

```
function NestedProviders() {
  return (
    <ThemeContext.Provider value="dark">
      <box>
        {/* Components here will receive the "dark" theme */}
        <ThemedButton />

        <ThemeContext.Provider value="light">
          {/* Components here will receive the "light" theme */}
          <ThemedButton />
        </ThemeContext.Provider>
      </box>
    </ThemeContext.Provider>
  );
}
```

### Best Practices

1. **Avoid Overuse**: Only use it for data that truly needs to be shared across multiple levels of the component tree.
2. **Split Contexts**: Use different Contexts for different types of data.
3. **Consider Performance**: Changes to a Context value will cause all consuming components to re-render.

## [forwardRef](https://react.dev/reference/react/forwardRef)

`forwardRef`allows a component to receive a ref passed from a parent and forward it to a DOM element or component instance within the child.

### Basic Usage

tsx

```
import React, { hooks, forwardRef } from "@dao3fun/react";
const { useRef } = hooks;

// Create a component that can forward a ref using forwardRef
const CustomInput = forwardRef((props, ref) => {
  return (
    <input
      ref={ref}
      style={{
        size: { offset: Vec2.create({ x: 200, y: 40 }) },
        backgroundColor: Vec3.create({ r: 245, g: 245, b: 245 }),
      }}
      onBlur={(e) => props.onUpdate && props.onUpdate(e.target.textContent)}
    >
      {props.defaultValue || ""}
    </input>
  );
});

// Use the component with a ref
function Form() {
  const inputRef = useRef(null);

  const focusInput = () => {
    // You can directly access the input element
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <box>
      <CustomInput ref={inputRef} defaultValue="Please enter content" />

      <box
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          size: { offset: Vec2.create({ x: 120, y: 40 }) },
          position: { offset: Vec2.create({ x: 0, y: 50 }) },
        }}
        onClick={focusInput}
      >
        <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
          Focus Input
        </text>
      </box>
    </box>
  );
}
```

### Combining with useImperativeHandle

Combining with`useImperativeHandle`allows you to customize the instance value exposed to the parent component:

tsx

```
import React, { hooks, forwardRef } from "@dao3fun/react";
const { useImperativeHandle, useRef, useState } = hooks;

// Define the component instance interface
interface InputHandles {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

// Create an input with custom actions
const CustomInput = forwardRef<InputHandles>((props, ref) => {
  const [value, setValue] = useState(props.defaultValue || "");
  const inputRef = useRef(null);

  // Customize the exposed methods
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        setValue("");
      },
      getValue: () => {
        return value;
      },
    }),
    [value]
  );

  return (
    <input
      ref={inputRef}
      style={{
        size: { offset: Vec2.create({ x: 200, y: 40 }) },
        backgroundColor: Vec3.create({ r: 245, g: 245, b: 245 }),
      }}
      onBlur={(e) => setValue(e.target.textContent)}
    >
      {value}
    </input>
  );
});

// Use the component with enhanced functionality
function EnhancedForm() {
  const inputRef = useRef<InputHandles>(null);

  const handleClear = () => {
    inputRef.current?.clear();
  };

  const handleGetValue = () => {
    const value = inputRef.current?.getValue() || "";
    console.log("Current value:", value);
  };

  return (
    <box>
      <CustomInput ref={inputRef} defaultValue="Please enter content" />

      <box style={{ position: { offset: Vec2.create({ x: 0, y: 50 }) } }}>
        <box
          style={{
            backgroundColor: Vec3.create({ r: 255, g: 59, b: 48 }),
            size: { offset: Vec2.create({ x: 100, y: 40 }) },
          }}
          onClick={handleClear}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            Clear
          </text>
        </box>

        <box
          style={{
            backgroundColor: Vec3.create({ r: 76, g: 217, b: 100 }),
            size: { offset: Vec2.create({ x: 100, y: 40 }) },
            position: { offset: Vec2.create({ x: 110, y: 0 }) },
          }}
          onClick={handleGetValue}
        >
          <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
            Get Value
          </text>
        </box>
      </box>
    </box>
  );
}
```

## [memo](https://react.dev/reference/react/memo)

`memo`is a higher-order component that memoizes the rendered output of a component, preventing re-renders if its props have not changed.

### Basic Usage

tsx

```
import React, { hooks, memo } from "@dao3fun/react";
const { useState } = hooks;

// A memoized component
const UserProfile = memo(function UserProfile({ name, age }) {
  console.log(`Rendering UserProfile for ${name}`);
  return (
    <box>
      <text>Name: {name}</text>
      <text>Age: {age}</text>
    </box>
  );
});

function App() {
  const [user, setUser] = useState({ name: "Alice", age: 30 });
  const [count, setCount] = useState(0);

  return (
    <box>
      <UserProfile name={user.name} age={user.age} />
      <text>Count: {count}</text>

      <box onClick={() => setCount(count + 1)}>
        <text>Increment Count</text>
      </box>
      <box onClick={() => setUser({ name: "Alice", age: 30 })}>
        <text>Set Same User</text>
      </box>
    </box>
  );
}
```

When you click "Increment Count", the`App`component re-renders, but since the props for`UserProfile`(`name`and`age`) have not changed,`UserProfile`will not re-render.

### Custom Comparison Function

You can provide a custom comparison function to`memo`to control when the component should re-render.

tsx

```
function arePropsEqual(prevProps, nextProps) {
  // Only re-render if the user's name changes
  return prevProps.user.name === nextProps.user.name;
}

const MemoizedComponent = memo(MyComponent, arePropsEqual);
```

### Best Practices

1. **Use for Pure Components**: Best for components that render the same output for the same props.
2. **Avoid with Frequent Prop Changes**: If props change frequently,`memo`can add unnecessary overhead.
3. **Combine with`useCallback`and`useMemo`**: To prevent re-renders caused by functions or objects being re-created.

## [lazy](https://react.dev/reference/react/lazy)

`lazy`allows you to define a component that is loaded lazily (on demand). This is useful for code-splitting and improving initial load times.

### Basic Usage

tsx

```
import React, { Suspense, lazy } from "@dao3fun/react";

// Lazily load a component
const OtherComponent = lazy(() => import("./OtherComponent"));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

### Error Boundaries

You can use an error boundary to handle errors that occur during lazy loading.

tsx

```
import { ErrorBoundary } from "./ErrorBoundary";

function App() {
  return (
    <div>
      <h1>My App</h1>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <OtherComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

## [startTransition](https://react.dev/reference/react/startTransition)

`startTransition`lets you mark a state update as a "transition," which tells React that it can be interrupted by more urgent updates. This is useful for keeping the UI responsive during heavy rendering tasks.

### Basic Usage

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState, useTransition } = hooks;

function App() {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);

  function handleChange(e) {
    setText(e.target.value);
    startTransition(() => {
      // This is a slow operation
      const newItems = Array.from({ length: 20000 }, (_, index) => {
        return `Item ${e.target.value} ${index}`;
      });
      setItems(newItems);
    });
  }

  return (
    <div>
      <input type="text" value={text} onChange={handleChange} />
      {isPending ? (
        "Loading..."
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

In this example, the input field remains responsive even while the large list is being rendered because the state update for`items`is wrapped in`startTransition`.

```

```
