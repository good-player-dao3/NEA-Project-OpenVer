---
title: "React Hooks"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/hooks.html"
---

# React Hooks

React Hooks are a feature introduced in React 16.8 that allow you to use state and other React features in function components. This document introduces commonly used hooks and their use cases.

## Box3-Specific Hooks

### useScreenSize

`useScreenSize`is a custom hook used to get the current screen dimensions of the Box3 client:

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useScreenSize } = hooks;

// This component listens for screen size changes and re-renders when the screen size changes.
function ScreenSizeReporter() {
  const { screenWidth, screenHeight } = useScreenSize();

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 152, g: 255, b: 216 }),
        position: { offset: Vec2.create({ x: 0, y: 0 }) },
      }}
    >
      <text style={{ position: { offset: Vec2.create({ x: 0, y: 0 }) } }}>
        Screen Width: {screenWidth}
      </text>
      <text style={{ position: { offset: Vec2.create({ x: 0, y: 40 }) } }}>
        Screen Height: {screenHeight}
      </text>
    </box>
  );
}

React.render(<ScreenSizeReporter />, ui);
```

### useRemoteChannel

`useRemoteChannel`is a custom hook for communication between the client and the server:

tsx

```
// Define the message type
interface Message {
  type: string;
  content: string;
}

function ServerCommunicationExample() {
  // Establish communication using useRemoteChannel, which returns a function to send messages.
  const { send } = useRemoteChannel<Message, Message>({
    onReceive: (event) => {
      console.log("Received server message:", JSON.stringify(event));
    },
    eventFilter: (event) => event.type === "notification", // Optional filter function, here it only processes notification-type events.
  });

  // If you only need to send information to the server without listening for its response, you can do this:
  // const { send } = useRemoteChannel();

  // Send a message
  const handleSend = (e: UiInput) => {
    if (!e.textContent.trim()) return;

    // Send to the server
    send({
      type: "client_message",
      content: e.textContent,
    });
    e.textContent = "";
  };

  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 245 }),
        size: { offset: Vec2.create({ x: 400, y: 300 }) },
      }}
    >
      <text
        style={{
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
          textFontSize: 18,
        }}
      >
        Server Communication Hook Example
      </text>

      <input
        style={{
          position: { offset: Vec2.create({ x: 20, y: 60 }) },
        }}
        onBlur={(e) => handleSend(e.target)}
      ></input>
    </box>
  );
}

// Render the component
React.render(<ServerCommunicationExample />, ui);
```

## State Hooks

### [useState](https://react.dev/reference/react/useState)

`useState`is the most basic hook, used to add state to function components:

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState } = hooks;

function Counter() {
  // Declare a state variable and its update function
  const [count, setCount] = useState(0);

  return (
    <box>
      <text>Count: {count}</text>
      <box
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          position: { offset: Vec2.create({ x: 0, y: 40 }) },
        }}
        onClick={() => setCount(count + 1)}
      >
        <text style={{ textColor: Vec3.create({ r: 255, g: 255, b: 255 }) }}>
          Increment
        </text>
      </box>
    </box>
  );
}

React.render(<Counter />, ui);
```

#### Functional Updates

When the new state depends on the previous state, you should use a functional update:

tsx

```
// Not recommended: "Direct update," uses the count value from the current scope.
setCount(count + 1);

// Recommended: "Functional update," passes a function that receives the latest state as an argument.
setCount((prevCount) => prevCount + 1);
```

tsx

```
// Assume initial count = 0

// Case 1: Direct update. The two calls will be merged, and the final result will be 1.
function handleClick() {
  setCount(count + 1); // count is 0
  setCount(count + 1); // count is still 0 because it's the value from the closure
}

// Case 2: Functional update. The two calls will be executed sequentially, and the final result will be 2.
function handleClick() {
  setCount((prev) => prev + 1); // prev is 0, returns 1
  setCount((prev) => prev + 1); // prev is 1, returns 2
}
```

### [useReducer](https://react.dev/reference/react/useReducer)

`useReducer`is used for managing more complex state logic:

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useReducer } = hooks;

// Define the reducer function
function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  // Use the reducer
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <box>
      <text>Count: {state.count}</text>
      <box
        style={{
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          position: { offset: Vec2.create({ x: 0, y: 40 }) },
          size: { offset: Vec2.create({ x: 400, y: 40 }) },
        }}
        onClick={() => dispatch({ type: "increment" })}
      >
        <text>Increment</text>
      </box>
      <box
        style={{
          backgroundColor: Vec3.create({ r: 255, g: 59, b: 48 }),
          position: { offset: Vec2.create({ x: 0, y: 80 }) },
          size: { offset: Vec2.create({ x: 400, y: 40 }) },
        }}
        onClick={() => dispatch({ type: "decrement" })}
      >
        <text>Decrement</text>
      </box>
    </box>
  );
}
React.render(<Counter />, ui);
```

## Effect Hooks

### [useEffect](https://react.dev/reference/react/useEffect)

`useEffect`is used for handling side effects, such as data fetching, subscriptions, or manually changing the DOM:

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState, useEffect } = hooks;

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Set up a timer
    const timer = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(timer);
    };
  }, []); // An empty dependency array means it runs only on mount and unmount

  return <text>Running for {seconds} seconds</text>;
}
React.render(<Timer />, ui);
```

#### Dependency Array

- **`[]`(empty array)**: The effect runs only once after the initial render (on mount) and cleans up on unmount.
- **`[dep1, dep2]`**: The effect runs after the initial render and any time`dep1`or`dep2`changes.
- **No array**: The effect runs after every render.

## Performance Hooks

### [useCallback](https://react.dev/reference/react/useCallback)

`useCallback`returns a memoized callback function. This is useful for preventing unnecessary re-renders of child components that rely on function props.

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState, useCallback } = hooks;

function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log("Button clicked");
  }, []); // The function is only created once

  return (
    <box>
      <ChildComponent onClick={handleClick} />
      <box onClick={() => setCount(count + 1)}>
        <text>Update Parent</text>
      </box>
    </box>
  );
}
```

### [useMemo](https://react.dev/reference/react/useMemo)

`useMemo`returns a memoized value. It's useful for expensive calculations that you don't want to re-run on every render.

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useState, useMemo } = hooks;

function ExpensiveCalculationComponent({ num }) {
  const expensiveValue = useMemo(() => {
    // Simulate an expensive calculation
    let result = 0;
    for (let i = 0; i < num * 1000000; i++) {
      result += 1;
    }
    return result;
  }, [num]); // Only re-calculates if `num` changes

  return <text>Calculated Value: {expensiveValue}</text>;
}
```

## Ref Hooks

### [useRef](https://react.dev/reference/react/useRef)

`useRef`returns a mutable ref object whose`.current`property is initialized to the passed argument. It can be used to hold a mutable value that does not cause a re-render when it changes, or to access a DOM element.

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useRef, useEffect } = hooks;

function TextInputWithFocusButton() {
  const inputRef = useRef(null);

  const onButtonClick = () => {
    // `current` points to the mounted text input element
    inputRef.current.focus();
  };

  return (
    <box>
      <input ref={inputRef} type="text" />
      <box onClick={onButtonClick}>
        <text>Focus the input</text>
      </box>
    </box>
  );
}
```

## Context Hooks

### [useContext](https://react.dev/reference/react/useContext)

`useContext`accepts a context object (the value returned from`React.createContext`) and returns the current context value for that context.

tsx

```
import React, { hooks, createContext } from "@dao3fun/react";
const { useContext } = hooks;

const ThemeContext = createContext("light");

function ThemedComponent() {
  const theme = useContext(ThemeContext);
  return <text>Current theme: {theme}</text>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedComponent />
    </ThemeContext.Provider>
  );
}
```
