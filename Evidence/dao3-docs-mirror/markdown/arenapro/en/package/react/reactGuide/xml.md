---
title: "React Tags and XML Basics"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/xml.html"
---

# React Tags and XML Basics

JSX stands for JavaScript XML, and it allows us to write HTML-like markup in our JavaScript code. In Box3 React, we use JSX to create UI components.

## Basic Tag Structure

### 1. Empty Tags

Empty tags are tags with no content and can use a self-closing form:

tsx

```
<box />
<text />
<image />
```

### 2. Tags with Content

Tags with content require a start tag and an end tag:

tsx

```
<box>
  <text>Hello World</text>
</box>
```

### 3. Nested Tags

Tags can be nested in multiple layers:

tsx

```
<box>
  <box>
    <text>Nested content</text>
  </box>
</box>
```

## Attribute Usage

### 1. Basic Attributes

Attributes use camelCase naming:

tsx

```
<text style={{ color: "red" }}>Red text</text>
```

### 2. Boolean Attributes

Boolean attributes can be shortened:

tsx

```
<box visible={true} />
// is equivalent to
<box visible />
```

### 3. Dynamic Attributes

You can use JavaScript expressions:

tsx

```
<text style={{ fontSize: size + "px" }}>Dynamic size</text>
```

## Special Attributes

### 1. The`style`Attribute

The`style`attribute is used to set UI styles:

tsx

```
<box
  style={{
    position: { offset: Vec2.create({ x: 100, y: 100 }) },
    size: { width: 200, height: 200 },
  }}
>
  <text>Centered text</text>
</box>
```

### 2. The`onClick`Event

Handles click events:

tsx

```
<text onClick={() => console.log("Text was clicked")}>Clickable text</text>
```

## Best Practices

1. **Tag Naming**
  - Use semantic tag names.
  - Keep the tag hierarchy clear.
  - Avoid excessive nesting.
2. **Attribute Usage**
  - Use the`style`attribute reasonably.
  - Pay attention to attribute naming conventions.
  - Keep attributes concise.
3. **Code Organization**
  - Keep related tags together.
  - Use proper indentation.
  - Add necessary comments.

## JSX Expression Syntax

In JSX, we use two different parenthesis syntaxes:`{ {} }`and`{}`, which have different purposes:

### 1. Single Braces`{}`

Single braces are used to insert JavaScript expressions, including:

- Variables
- Function calls
- Arithmetic operations
- Conditional expressions

tsx

```
// Variable
<text>{name}</text>

// Expression
<text>{count + 1}</text>

// Function call
<text>{formatName(user)}</text>

// Conditional rendering
<text>{isLoggedIn ? 'Logged In' : 'Not Logged In'}</text>
```

### 2. Double Braces

Double braces are specifically for the`style`attribute and represent a JavaScript object:

- The outer`{}`indicates that this is a JavaScript expression.
- The inner`{}`indicates that this is an object literal.

tsx

```
// The style attribute uses double braces
<text style={{
  textColor: Vec3.create({ r: 96, g: 212, b: 92 }),
  textFontSize: 20
}}>
  Styled text
</text>

// Incorrect example: Using single braces
<text style={textColor: Vec3.create({ r: 96, g: 212, b: 92 })}> // Syntax error

// Correct example: Using double braces
<text style={{ textColor: Vec3.create({ r: 255, g: 0, b: 0 }) }}>
  Red text
</text>
```

### 3. Notes

1. **The`style`attribute must use double braces**tsx`// Correct<textstyle={{ textColor: color }}>// Incorrect<textstyle={textColor: color}>`
2. **Other attributes use single braces**tsx`// Correct<textvisible={isVisible}>// Incorrect<textvisible={{isVisible}}>`
3. **Nested objects require double braces**tsx`// Correct<textstyle={{position: { offset: Vec2.create({ x:100, y:100}) }}}>// Incorrect<textstyle={position: { offset: Vec2.create({ x:100, y:100}) }}>`

## Example Code

tsx

```
import React from "@dao3fun/react";

function UserInfo() {
  return (
    <box
      style={{
        position: { offset: Vec2.create({ x: 100, y: 100 }) },
      }}
    >
      <text style={{ textFontSize: 20 }}>User Information</text>
      <text
        style={{
          position: { offset: Vec2.create({ x: 0, y: 30 }) },
          textColor: Vec3.create({ r: 96, g: 212, b: 92 }),
        }}
      >
        Username: John Doe
      </text>
      <text
        style={{
          position: { offset: Vec2.create({ x: 0, y: 60 }) },
          textColor: Vec3.create({ r: 212, g: 162, b: 92 }),
        }}
      >
        Level: 10
      </text>
    </box>
  );
}

React.render(<UserInfo />, ui);
```

Effect:

![](/arenapro/QQ20250402-155547.png)

## Notes

1. All tags must be properly closed.
2. Attribute values use camelCase.
3. The values in the`style`attribute need to comply with the Box3 UI API specifications.
4. Event handler functions use arrow functions.
5. Complex styles are recommended to be extracted as constants.
