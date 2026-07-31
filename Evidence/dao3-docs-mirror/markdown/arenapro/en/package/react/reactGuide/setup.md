---
title: "Box3 React Development Guide"
source: "https://docs.dao3.fun/arenapro/en/package/react/reactGuide/setup.html"
---

# Box3 React Development Guide

Info

This framework only supports Box3 client-side development and cannot be used on the server.

This guide will help you get started with Box3 React development quickly. By using React's component-based development approach, you can build and manage your game's UI more efficiently.

## Installing Dependencies

You can install the`@dao3fun/react`dependency package in the following two ways:

### Method 1: Install with the ArenaPro Plugin (Recommended)

1. In VSCode, press`Ctrl + Shift + P`(Windows) or`Command + Shift + P`(macOS) to open the command palette.
2. Type "ArenaPro" and select the`ArenaPro: View Box3 NPM Packages`command.
3. Enter`react`in the search box.
4. Select the`@dao3fun/react`package and click "Confirm Installation" in the bottom-left corner.
5. Wait for the installation to complete. A success message will appear in the bottom-right corner of VSCode.

### Method 2: Install with npm

Execute the following command in the project's root directory:

bash

```
npm install @dao3fun/react
```

## Environment Configuration

After installation, you need to perform the following configurations to support React development:

### Configure tsconfig.json

1. Open the`tsconfig.json`file in the project's`client`directory.
2. Add the`jsx`configuration to`compilerOptions`:json`{"compilerOptions": {"jsx":"react"// other configurations...}}`After this configuration, TypeScript will correctly recognize JSX syntax.

### Configure dao3.config.json

1. Open the`dao3.config.json`file in the project's root directory.
2. Change the`entry`to`src/clientApp.tsx`.

### Modify the Client Entry File

Due to framework reasons, you need to use a`.tsx`or`.jsx`format file as the entry file, instead of`.js`or`.ts`.

Create or modify the`clientApp.tsx`file in the`client`directory.

## Quick Start

The tag system of Box3 React is fully compatible with the Box3 UI API, for example:

- `<box />`corresponds to`UiBox`
- `<text />`corresponds to`UiText`

UI styles are set through the`style`attribute. For specific APIs, please refer to the[Box3 UI API Documentation](/api/ClientUI/index.md).

Let's look at a simple example to understand the basic usage:

tsx

```
// clientApp.tsx
import React from "@dao3fun/react";

function App() {
  return <box>Hello, React</box>;
}

React.render(<App />, ui);
```

The effect is as follows:

![](/arenapro/QQ20250402-152338.png)

As you can see, the rendering effect is identical to a manually created UI.

Special Note: If you use text content directly without wrapping it in a`<text />`tag, the system will automatically create a`UiText`component and display it centered by default.

Let's look at another example using the`<text />`tag:

tsx

```
import React from "@dao3fun/react";

function App() {
  return (
    <box>
      <text>Hello, React</text>
    </box>
  );
}

React.render(<App />, ui);
```

The effect is as follows:

![](/arenapro/QQ20250402-152915.png)

## Fragment

The`<fragment />`or`<>`tag is used to group multiple components together without creating a parent component.

tsx

```
import React from "@dao3fun/react";

function App() {
  return (
    <>
      <text>Hello, React</text>
    </>
  );
}

React.render(<App />, ui);
```

The effect is as follows:

![](/arenapro/QQ20250403-205512.png)

Congratulations! You have successfully completed the basic configuration and simple usage of Box3 React. For more features and development techniques, please continue reading the subsequent documentation.
