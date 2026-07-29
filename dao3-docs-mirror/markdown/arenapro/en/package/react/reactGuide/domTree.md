---
title: "React DOM Tree Structure"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/domTree.html"
---

# React DOM Tree Structure

React uses a virtual DOM to efficiently update and render user interfaces. Understanding the structure of the DOM tree is very important for optimizing the performance of React applications.

## Tag Comparison Table

| React Tag | Corresponding UI Component | Description |
| --- | --- | --- |
| `<box />` | `UiBox` | Container component |
| `<text />` | `UiText` | Text component |
| `<image />` | `UiImage` | Image component |
| `<input />` | `UiInput` | Input component |
| `<scrollBox />` | `UiScrollBox` | Scroll box component |

## Component Tree Example

### Wrapping with a Box (Recommended)

tsx

```
function App() {
  return (
    <box>
      <box>
        <text>Title</text>
        <image style={{ image: "logo.png" }} />
      </box>
      <box>
        <text>Content</text>
        <box>
          <text>Sub-content</text>
        </box>
      </box>
    </box>
  );
}

React.render(<App />, ui);
```

Corresponding DOM tree structure:

```
ui (App)
└── box
    ├── box
    │   ├── text ("Title")
    │   └── image (logo.png)
    └── box
        ├── text ("Content")
        └── box
            └── text ("Sub-content")
```

### Using a Fragment

tsx

```
function App() {
  return (
    <>
      <box>
        <text>Title</text>
        <image style={{ image: "logo.png" }} />
      </box>
      <box>
        <text>Content</text>
        <box>
          <text>Sub-content</text>
        </box>
      </box>
    </>
  );
}

React.render(<App />, ui);
```

Corresponding DOM tree structure:

```
ui (App)
├── box
│   ├── text ("Title")
│   └── image (logo.png)
└── box
    ├── text ("Content")
    └── box
        └── text ("Sub-content")
```

## React.render

`React.render`is the entry point of a React application. It is responsible for rendering React components into a specified container. In Box3 React, its main functions include:

1. **Initial Rendering**
  - Converts the React component tree into a virtual DOM.
  - Renders the virtual DOM into the specified UI container.
  - Establishes the association between components and the UI.
2. **Parameter Description**tsx`React.render(element, container);`
  - `element`: The React element to be rendered (usually the root component).
  - `container`: The target container for rendering, the screen's root node (e.g.,`ui`), or any UI element such as`box`,`text`, etc.
3. **Usage Example**tsx`// Render a single componentReact.render(<App/>, ui);// Render multiple componentsReact.render(<box><App1/><App2/></box>,ui);`
4. **Notes**
  - `React.render`can only be called once per container.
  - The rendered component will automatically establish a binding relationship with the container.
  - Subsequent updates are handled automatically; you do not need to call`React.render`again.
5. **Update Mechanism**
  - When a component's state changes, React automatically re-renders.
  - Only the parts that have changed are updated, not the entire tree.
  - Uses the virtual DOM for efficient difference comparison.

## Best Practices

1. **Component Structure**
  - Use`box`as a container component.
  - Organize the component hierarchy reasonably.
  - Avoid excessively deep nesting.
2. **Rendering Optimization**
  - Extract static content into separate components.
  - Use`Fragment`to avoid unnecessary DOM nodes.
  - Use conditional rendering reasonably.
3. **Performance Considerations**
  - Control the scope of component updates.
  - Avoid unnecessary re-renders.
  - Use an appropriate component splitting strategy.
