---
title: "Guide to Using Refs in React"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/refs.html"
---

# Guide to Using Refs in React

In ArenaPro's React development, Refs provide a powerful mechanism for accessing component instances or DOM elements. This document will detail how to effectively use Refs in your projects.

## Basic Concepts of Refs

Refs are a reference mechanism provided by React that allows you to directly access DOM elements or component instances. Unlike props and state, modifying Refs does not trigger a component re-render.

## Creating and Using Refs

### Using the useRef Hook

In function components, we can use the`useRef`Hook to create Refs:

tsx

```
import React, { hooks } from "@dao3fun/react";
const { useRef, useEffect } = hooks;

function TextInputWithFocusButton() {
  // Create a ref object
  const inputRef = useRef(null);

  // Focus the input box when the button is clicked
  const focusInput = () => {
    // Access the DOM node through the current property
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <box>
      {/* Attach the ref attribute to the input element */}
      <input
        ref={inputRef}
        style={{
          size: { offset: Vec2.create({ x: 200, y: 30 }) },
        }}
      />

      <box
        onClick={focusInput}
        style={{
          position: { offset: Vec2.create({ x: 0, y: 40 }) },
          backgroundColor: Vec3.create({ r: 0, g: 122, b: 255 }),
          size: { offset: Vec2.create({ x: 100, y: 30 }) },
        }}
      >
        Focus Input
      </box>
    </box>
  );
}
```

## Advanced Usage of Refs

### Ref Forwarding

Ref forwarding is a technique for passing a ref from a parent component to a DOM element inside a child component:

tsx

```
import React, { forwardRef } from "@dao3fun/react";

// Create a component that forwards a ref to the internal input box
const FancyInput = forwardRef((props, ref) => (
  <box>
    <input
      ref={ref}
      style={{
        backgroundColor: Vec3.create({ r: 240, g: 240, b: 250 }),
        size: { offset: Vec2.create({ x: 180, y: 25 }) },
      }}
      {...props}
    />
  </box>
));

// The parent component uses the forwarded ref
function App() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <box>
      <FancyInput ref={inputRef} />
      <box
        onClick={focusInput}
        style={{
          backgroundColor: Vec3.create({ r: 50, g: 150, b: 100 }),
          size: { offset: Vec2.create({ x: 100, y: 30 }) },
        }}
      >
        Focus
      </box>
    </box>
  );
}
```

### Callback Refs

In addition to`useRef`and`createRef`, React also supports callback Refs, which give you more fine-grained control over when references are set and cleared:

tsx

```
function CustomCallbackRef() {
  let inputRef = null;

  const setInputRef = (element) => {
    // Store a reference to the DOM node
    inputRef = element;

    // If the element exists, you can perform an action immediately
    if (element) {
      element.focus();
    }
  };

  return (
    <input
      ref={setInputRef}
      style={{
        size: { offset: Vec2.create({ x: 200, y: 30 }) },
      }}
    />
  );
}
```

## Using Refs to Manage UI Element State

Refs can be used to directly manipulate the state of UI elements:

tsx

```
function AnimatedBox() {
  const boxRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    if (boxRef.current && !isAnimating) {
      setIsAnimating(true);

      // Directly manipulate UI element properties
      const element = boxRef.current;
      let position = 0;

      const animate = () => {
        position += 5;
        if (position <= 200) {
          // Update the element's position
          element.style.position.offset.copy(
            Vec2.create({ x: position, y: 0 })
          );
        } else {
          setIsAnimating(false);
        }
      };
    }
  };

  return (
    <box>
      <box
        ref={boxRef}
        style={{
          backgroundColor: Vec3.create({ r: 255, g: 100, b: 100 }),
          size: { offset: Vec2.create({ x: 50, y: 50 }) },
        }}
      />

      <box
        onClick={startAnimation}
        style={{
          position: { offset: Vec2.create({ x: 0, y: 60 }) },
          backgroundColor: Vec3.create({ r: 100, g: 200, b: 100 }),
          size: { offset: Vec2.create({ x: 120, y: 30 }) },
        }}
      >
        Start Animation
      </box>
    </box>
  );
}
```

## Best Practices and Notes

1. **Use Refs Sparingly**: Try to avoid overusing Refs. In most cases, the declarative React programming model is more suitable for building user interfaces.
2. **Avoid Direct DOM Manipulation**: Although Refs allow you to directly access the DOM, you should try to avoid excessive DOM manipulation to prevent interfering with React's rendering flow.
3. **Do Not Access Refs During Rendering**: Accessing and modifying Refs should be done in event handlers, lifecycle methods, or Hooks, not during the rendering process.
4. **Manage Cleanup**: If you use Refs in`useEffect`to set up event listeners or timers, remember to remove them in the cleanup function.

tsx

```
function EventListenerExample() {
  const boxRef = useRef(null);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const handleResize = () => {
      console.log("Element size may have changed");
    };

    // Add an event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <box
      ref={boxRef}
      style={{
        backgroundColor: Vec3.create({ r: 100, g: 150, b: 200 }),
        size: { offset: Vec2.create({ x: "100%", y: "100%" }) },
      }}
    />
  );
}
```

## Summary

Refs are a powerful but should-be-used-sparingly feature in React. In development, Refs can help you:

1. **Directly access DOM elements**to perform operations like focusing, measuring, etc.
2. **Manage complex animations**by directly manipulating element properties.
3. **Integrate third-party libraries**, bridging React and non-React code.
4. **Forward references**to build more flexible component hierarchies.

By using Refs reasonably, you can build high-quality applications that both adhere to React's declarative programming philosophy and allow for precise control over the DOM when necessary.
