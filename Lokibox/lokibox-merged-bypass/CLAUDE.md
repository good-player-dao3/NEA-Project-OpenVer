# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LokiBox is a Tampermonkey userscript cheat tool for Box3 (神奇代码岛, a game platform at `dao3.fun`). It intercepts the Box3 client's runtime context and modifies/fakes key values to simulate special abilities. Built with Svelte 5, TypeScript, and Vite, output as a userscript via `vite-plugin-monkey`.

## Build / Dev Commands

```bash
# Development (Vite dev server with HMR)
pnpm dev

# Production build (outputs userscript to dist/)
pnpm build

# Preview built userscript
pnpm preview

# Type-check both Svelte and TypeScript
pnpm check
```

Tests use Vitest and are co-located as `*.test.ts` next to source files (`src/storage/config.test.ts`, `src/utils/math.test.ts`, etc.). Run with `pnpm test` or `npx vitest run`.

## Entry & Boot Sequence

The entry point is [src/boot.ts](src/boot.ts). It conditionally loads different modules based on URL:

- **`dao3.fun/play/*`** (game page): Loads `bridge/top` (postMessage listener for chat/Auth relay) and `time-mock` (fakes `Date` to a recent Saturday evening for time-limited game modes).
- **`view.dao3.fun/*`** (game iframe): Authenticates via `LokiAPI`, then either loads `main.ts` (authenticated) or `auth/main.ts` (login/register UI).

The import alias `src/` maps to the `src/` directory (configured in both `vite.config.ts` and `tsconfig.json`).

## Core Architecture

### Core Module (`src/core/`)

The `Core` singleton captures the game's raw context via prototype hijacking. It defines a getter/setter on `Object.prototype` for a specific property (`isAdmin` on play pages, `permissionController` on editor pages). When the game engine sets this property, the setter intercepts the `this` reference (the raw `GameCore`) and stores it. Fires the `ready` event after initialization (via `onGameReady` callback + deferred enable retry).

**CRITICAL**: The raw `GameCore` is only accessed within `src/core/`. Never call `gameCore` directly from features — always go through the typed adapter classes:

- `CoreBodies` — player/enemy body positions, velocities
- `CorePlayers` — player list, player properties, input direction
- `CoreCamera` — camera position, angles
- `CoreDamage` — damage events
- `CoreInput` — keyboard/mouse input state
- `CoreRaycast` — raycasting
- `CoreVoxels` — block/voxel data
- `CoreSecret` — internal game state
- `CoreRemoteChannel` — cross-end event messaging (remoteChannel)
- `NetInputInterceptor` — intercepts WebSocket.send for input packet manipulation (used by Blink, FakeLag)

`Core.onTick(fn)` registers a callback on the game's tick loop, returning an unregister function. The `FeatureManager` also has a separate `requestAnimationFrame` render loop for visual features.

### Feature System (`src/features/`)

Features are the core extensibility mechanism. The lifecycle:

1. **`FeatureBase<T>`** — abstract base class. Defines lifecycle hooks (`onEnable`, `onDisable`, `onTick`, `onRender`, `onLMouseDown`, etc.), default properties (`defaultEnabled`, `defaultHotkey`, `activateOnHold`), and a `schema` for configurable parameters.

2. **`@Feature(meta)`** — decorator that registers a Feature class into `FeatureRegistry` with metadata (`id`, `displayName`, `folderId`).

3. **`FeatureRegistry`** — singleton holding all registered feature classes (static metadata + instantiated base).

4. **`FeatureManager`** — singleton that creates `FeatureInstance` objects from the registry, wires up hotkeys via `HotkeyManager`, and manages the tick/mouse event dispatch loop.

5. **`FeatureInstance`** — the runtime wrapper. Manages enable/disable state (persisted via `PropStorageManager`), provides `FeatureContext` (typed props proxy + core + enabled state) to lifecycle hooks, and fires events on enable/disable.

**To create a new feature**: Place a file at `src/features/<folder-id>/<feature-id>.ts`, export a class decorated with `@Feature({...})` extending `FeatureBase<YourClass>`. The `import.meta.glob` call in `main.ts` eagerly imports all `.ts` files under `src/features/`, so registration is automatic.

### Schema & Props (`src/features/schema.ts`)

Feature parameters are defined via a `schema` object on the Feature class. Available types:

- `props.boolean(label, default)` — toggle
- `props.number(label, {default, min?, max?, step?})` — slider
- `props.select(label, {default, options})` — dropdown
- `props.range(label, {defaultMin, defaultMax, min, max, step})` — dual-range slider

At runtime, props are accessed via `ctx.props.propKey` which is a Proxy over `GM_getValue`/`GM_setValue`. Accessing a prop reads from storage; assigning writes to storage and calls `onPropsChange`.

### Storage (`src/storage/`)

Data is persisted via Tampermonkey's `GM_getValue`/`GM_setValue` APIs:

- **`PropStorageManager`** — feature enabled state and prop values (keyed by feature ID)
- **`HotkeyStorageManager`** — per-feature hotkey bindings
- **`FolderStorageManager`** — folder positions (stored as viewport percentage for cross-screen sharing) and z-order
- **`ConfigManager`** — full-config export/import as `.json` files, named profiles saved in GM storage

### Bridge (`src/bridge/`)

Communication between the top-level game page and the iframe:

- **`top.ts`** (runs on `dao3.fun/play/*`): Listens for `message` events — handles chat message injection (sets React props on the chat textarea, clicks send) and auth token relay from localStorage.
- **`iframe.ts`** (used from within the iframe): Functions to `send()` chat messages upward and `getAuthorization()` from the top frame.

### UI (`src/ui/`)

Svelte 5 components. Mounted in `main.ts` as the `App` component. Organized as:

- **`App.svelte`** — root component
- **`ClickUI.svelte`** — main click UI with expand/minimize
- **`Category.svelte`** — category list sidebar
- **`folders/`** — folder components (FeatureFolder, HotkeyFolder, PlayerFolder, ConfigFolder, etc.)
- **`entries/`** — individual feature entry in a folder (toggle switch, hotkey display)
- **`controllers/`** — prop value controllers (BooleanController, NumberController, SelectController) for adjusting feature parameters

### Auth (`src/auth/`)

Separate UI flow for user authentication (`LokiAPI` → server-based auth). When unauthenticated, the `auth/main.ts` entry renders `AuthClickUI` with Login/Register folders instead of the main feature UI.

### Render Features (`src/render/`)

Canvas-based visual overlays rendered on top of the game. ESP and Tracers use their own PixiJS applications; Minimap and TargetHUD are Svelte components. All are pure client-side rendering from game state data.

## Code Style

- Semicolons: `true`
- Quotes: single
- Trailing commas: `es5`
- Print width: 80
- Tab width: 2 spaces
- Arrow parens: avoid (omit parens when single parameter)

## Box3 Domain Knowledge

### Architecture

Box3 (神奇代码岛) runs a **server-authoritative** model with two script environments:

| | Server (S- API) | Client (C- API) |
|---|---|---|
| Runtime | Node.js | Browser (the iframe we inject into) |
| Globals | `world`, `voxels`, `storage`, `http`, `rtc` | `world`, `ui`, `screen`, `http` |
| Authority | Game logic, voxels, HP, inventory, teleport | Rendering, UI, input, camera |

### mudb — The Network Layer

The entire client-server communication is built on **mudb**, a real-time state sync framework. It is NOT just serialization — it covers the full stack:

```
Box3 Game Logic (S- API)
  ┌──────────────────────────┐
  │ remoteChannel (RPC)      │  ← mudb/rpc
  │ replica (auto state sync)│  ← mudb/replica
  │ rda (reliable messages)  │  ← mudb/rda
  ├──────────────────────────┤
  │ MuSchema (diff/patch)    │  ← mudb/schema
  ├──────────────────────────┤
  │ WebSocket transport      │  ← mudb/socket
  └──────────────────────────┘
```

Key mudb concepts:
- **MuSchema<V>** — interface for all syncable types. Every type must implement `diff()`, `patch()`, `clone()`, `alloc()`, `free()`. Built-in types include `MuUint8/16/32`, `MuFloat32/64`, `MuVarint`, `MuStruct`, `MuUnion`, `MuArray`, `MuDictionary`, `MuVector` (TypedArray).
- **Delta encoding** — `diff(base, target)` writes only changed bytes; identical states emit 0 bytes. `patch(base, diff)` reconstructs target on the receiving end.
- **Replica** — server state is automatically diffed and pushed to clients via WebSocket. The client applies patches to its local copy every tick.
- **RDA (Reliable Datagram)** — used for input (movement, actions, chat). Client sends input → server processes → result comes back via next replica sync.
- **Schema-driven, not self-describing** — both sides must hold the same schema; the wire format contains only binary deltas, no type metadata.

### The `gameCore.game.state` Object

This is the **client-side projection of server state**, synced via mudb replica. It's what we access through `Core` adapters:

```typescript
state.bodies        // MuArray<MuStruct> — all entity positions/velocities
state.secret        // local player info, camera, input
state.clock         // { tick, clock, ping }
state.voxel         // world voxels (may be separate channel)
state.config        // map config, game mode
```

**Writing to this object is local-only** — the server's next replica patch will overwrite any modified fields. This is why directly setting `self.velocity.x = 0` (SafeWalk) works visually but denies the server's expected input, causing rubberbanding if the server's simulation disagrees.

### The Two Interception Points

LokiBox only has two real levers:

**1. Read/Write `gameCore.game.state` (replica projection)**
- **Read**: ESP, Tracers, Minimap, TargetHUD, Radar — all visual features read positions/HP from here. Since replica patches arrive every tick, data is up-to-date.
- **Write**: Modifying velocity, position, camera, or any state field. The change is visible locally (and can affect local physics/render) but will be overwritten by the next server patch. Useful only for:
  - Features that prevent input from being sent (SafeWalk stops sending movement → server thinks you stopped → velocity stays 0)
  - Features that exploit the tick window before the server corrects you

**2. Intercept Net Input (rda channel)**
- The game engine reads `state.input` (keyboard/mouse state) each tick and sends it to the server via `WebSocket.send()`.
- `NetInputInterceptor` replaces the game's `send` function to control timing/content of outgoing input packets.
- **Blink**: queues input packets, drains them on disable — server sees all movement at once.
- **FakeLag**: maintains a buffer of N packets, drains oldest — server sees delayed movement.

### Three-Tier Feasibility

| Tier | Can Do | Examples |
|------|--------|---------|
| 🟢 **Client-only (free)** | Local state reads, camera, UI, rendering | ESP, Tracers, Minimap, TargetHUD, FreeCam, FullBright, Camera control |
| 🟡 **Input manipulation (limited)** | Modify what input the server receives | KillAura, AimAssist, Fly, Speed, Blink, FakeLag, SafeWalk, Scaffold, AutoClicker |
| 🔴 **Server-authoritative (impossible)** | Anything that changes game logic outcomes | Direct damage, HP modification, item spawn, teleport, voxel edit, death bypass |

### Why Blink/FakeLag Work

They target the **only client→server channel that carries movement**: the rda input stream.

1. Game reads keyboard/mouse → encodes as input packet → calls `WebSocket.send()`
2. `NetInputInterceptor` replaces the `send` function on the WebSocket instance
3. Intercepted packets go into a queue instead of the wire
4. On flush (Blink disable / FakeLag drain), queued packets are sent via the original `send`

The server sees a burst of legitimate-looking input and simulates it all — so the player "teleports" from the server's perspective. The key insight: **we don't fake state, we fake timing**.

### What We DON'T Have (and why it matters)

- **WebSocket `message` interceptor** — we can't read or block incoming server patches. If we could, we could reject rubberband corrections or fake lag compensation.
- **Client-side replica** — we have `state` but not the mudb replica client that applies patches. If we could hook the patch application, we could selectively ignore server corrections.
- **Server-side script access** — we can't run S-API code. `world`, `voxels`, `storage`, `remoteChannel.Server` are inaccessible.
