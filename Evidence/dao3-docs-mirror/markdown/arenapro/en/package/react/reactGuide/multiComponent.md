---
title: "Multi-Component Development"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/multiComponent.html"
---

# Multi-Component Development

In React, components are the basic units for building user interfaces. Properly organizing and reusing components is key to developing efficient and maintainable applications. This document introduces best practices for multi-component development.

## Component Splitting Principles

### 1. Single Responsibility Principle

Each component should be responsible for only one function. This makes components easier to maintain and test:

❌**Not Recommended**: A single component doing too much

tsx

```
function UserProfile() {
  return (
    <box>
      <text>User Information</text>
      <text>Username</text>
      <text>User Level</text>
      <text>User Achievements</text>
    </box>
  );
}

React.render(<UserProfile />, ui);
```

✅**Recommended**: Split into multiple smaller components

tsx

```
function UserProfile() {
  return (
    <box>
      <UserHeader />
      <UserInfo />
      <UserAchievements />
    </box>
  );
}

function UserHeader() {
  return <text>User Information</text>;
}

function UserInfo() {
  return (
    <box>
      <text>Username</text>
      <text>User Level</text>
    </box>
  );
}

function UserAchievements() {
  return <text>User Achievements</text>;
}

React.render(<UserProfile />, ui);
```

### 2. Component Reusability

Extracting reusable parts into separate components can reduce duplicate code and improve development efficiency:

tsx

```
// Reusable Button component
function Button({ text, y, onClick }) {
  return (
    <box
      style={{
        backgroundColor: Vec3.create({ r: 209, g: 194, b: 26 }),
        position: { offset: Vec2.create({ x: 0, y: y * 160 }) },
      }}
      onClick={onClick}
    >
      <text style={{ textColor: Vec3.create({ r: 47, g: 90, b: 4 }) }}>
        {text}
      </text>
    </box>
  );
}

// Using the Button component
function LoginForm() {
  return (
    <>
      <Button text="Login" y={1} onClick={() => console.log("Login")} />
      <Button text="Register" y={2} onClick={() => console.log("Register")} />
    </>
  );
}

React.render(<LoginForm />, ui);
```

## Component Communication

### 1. Passing Props

Props are the basic way to communicate between components, used to pass data and callback functions from a parent component to a child component:

tsx

```
// Parent component
function Parent() {
  const [count, setCount] = useState(1);
  return (
    <>
      <Child count={count} onIncrement={() => setCount((count) => count + 1)} />
    </>
  );
}

// Child component
function Child({ count, onIncrement }) {
  return (
    <box>
      <text>Count: {count}</text>
      <Button text="Increment" onClick={onIncrement} />
    </box>
  );
}

function Button({ text, onClick }) {
  return (
    <text
      style={{
        textColor: Vec3.create({ r: 47, g: 90, b: 4 }),
        position: { offset: Vec2.create({ x: 0, y: 60 }) },
      }}
      onClick={onClick}
    >
      {text}
    </text>
  );
}
```

### 2. Context API

The Context API is used to pass data across multiple levels of components, avoiding prop drilling:

tsx

```
import React from "./index";
import { createContext, useContext, useState } from "./lib/hooks";

// Theme color configuration
const themes = {
  light: {
    background: Vec3.create({ r: 240, g: 240, b: 240 }),
    text: Vec3.create({ r: 30, g: 30, b: 30 }),
    primary: Vec3.create({ r: 0, g: 122, b: 255 }),
  },
  dark: {
    background: Vec3.create({ r: 30, g: 30, b: 30 }),
    text: Vec3.create({ r: 240, g: 240, b: 240 }),
    primary: Vec3.create({ r: 10, g: 132, b: 255 }),
  },
};

// Create Context
const ThemeContext = createContext({
  theme: "light",
  colors: themes.light,
  setTheme: (theme) => {},
});

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // Calculate the colors for the current theme
  const colors = themes[theme];

  // Includes the theme name and corresponding color values
  const themeValue = {
    theme,
    colors,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}

// Main application component
function App() {
  const { theme, colors } = useContext(ThemeContext);

  return (
    <box
      style={{
        backgroundColor: colors.background,
        size: { offset: Vec2.create({ x: 400, y: 300 }) },
      }}
    >
      <text
        style={{
          textColor: colors.text,
          position: { offset: Vec2.create({ x: 20, y: 20 }) },
        }}
      >
        Current theme: {theme === "light" ? "Light" : "Dark"}
      </text>

      <ThemedButton />
    </box>
  );
}

// Theme switch button
function ThemedButton() {
  const { theme, colors, setTheme } = useContext(ThemeContext);

  return (
    <Button
      text={`Switch Theme`}
      colors={colors}
      onClick={() =>
        setTheme((theme: string) => (theme === "light" ? "dark" : "light"))
      }
    />
  );
}

// Button component
function Button({ text, colors, onClick }) {
  return (
    <box
      style={{
        backgroundColor: colors.primary,
        size: { offset: Vec2.create({ x: 120, y: 40 }) },
        position: { offset: Vec2.create({ x: 20, y: 60 }) },
      }}
      onClick={onClick}
    >
      <text
        style={{
          textColor: Vec3.create({ r: 255, g: 255, b: 255 }),
          position: { offset: Vec2.create({ x: 10, y: 10 }) },
        }}
      >
        {text}
      </text>
    </box>
  );
}

// Wrap the application with the Provider
React.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  ui
);
```
