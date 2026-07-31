---
title: "ArenaPro Scaffolding File Structure"
source: "https://docs.dao3.fun/arenapro/en/dao3Cfg/file.html"
---

# ArenaPro Scaffolding File Structure

## Project Structure Overview

The project structure created by ArenaPro is as follows, clearly separating server-side, client-side, and shared code:

```
myArenaProject/
├── Core Configuration Files
│   ├── dao3.config.json      # Main project configuration file
│   ├── package.json          # npm dependency management
│   ├── .prettierrc           # Code formatting configuration
│   ├── .prettierignore       # Formatting ignore configuration
│   └── eslint.config.mjs     # Code linting configuration
│
├── Server-side Code
│   ├── server/
│   │   ├── tsconfig.json     # TypeScript configuration
│   │   ├── webpack.config.js # Build configuration
│   │   ├── types/            # Type definitions
│   │   │   ├── GameAPI.d.ts  # Server-side API types
│   │   │   ├── GameEntity.d.ts
│   │   │   └── GamePlayerEntity.d.ts
│   │   └── src/
│   │       └── App.ts        # Server-side entry point
│   │
├── Client-side Code
│   ├── client/
│   │   ├── tsconfig.json     # TypeScript configuration
│   │   ├── webpack.config.js # Build configuration
│   │   ├── types/
│   │   │   └── ClientAPI.d.ts # Client-side API types
│   │   └── src/
│   │       └── clientApp.ts   # Client-side entry point
│   │
├── Shared Code
│   ├── shares/
│   │   └── sharesApp.ts      # Shared code for client and server
│   │
└── Development Tool Configuration
    ├── .vscode/              # VSCode configuration
    │   ├── dao3-ap.code-snippets # Code snippets
    │   ├── mcp.json          # MCP configuration
    │   └── launch.json       # Debugging configuration
    └── .husky/               # Git hooks
        ├── pre-commit        # Pre-commit checks
        └── ...               # Other Git hook scripts
```

## File Protection Notice

### ⚠️ Files That Must Not Be Moved or Renamed

The following files**must not be moved or renamed**, as doing so may prevent the project from running correctly:

1. **`GameAPI.d.ts`**- Server-side API type definitions
2. **`ClientAPI.d.ts`**- Client-side API type definitions
3. **`tsconfig.json`**- TypeScript compilation configuration
4. **`package.json`**- npm package management configuration
5. **`dao3.config.json`**- ArenaPro core configuration
6. **`.gitignore`**- Git ignore configuration
7. **`webpack.config.js`**- Bundling and build configuration
8. **`.prettierrc`**- Code formatting rules
9. **`.prettierignore`**- Formatting ignore rules
10. **`eslint.config.mjs`**- Code linting rules

### ⚠️ Critical Files That Must Not Be Modified

The following files**must not be modified or moved**, as they include an automatic update mechanism. Any custom changes may result in data loss:

- **`GameAPI.d.ts`**
- **`ClientAPI.d.ts`**

> **Note**: These files are different from the built-in`.d.ts`files in the Arena script editor. ArenaPro provides more complete and customized type declarations for TypeScript, offering more precise code hints and type checking.

## File Directory Description

### Core Directories

- **`server/`**: Server-side code, containing the core map logic.
- **`client/`**: Client-side code, including UI and player interactions.
- **`shares/`**: Shared code, which can be referenced by both the server and client.

### Configuration Files

- **`dao3.config.json`**: The core ArenaPro configuration file, controlling compilation and upload behavior.
- **`tsconfig.json`**: TypeScript compilation configuration, located in the server and client directories respectively.
- **`webpack.config.js`**: Bundling configuration, controlling how code is packaged and optimized.
