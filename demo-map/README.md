# NEA Map + Script Demo

This subproject demonstrates the first creator workflow for the recovered DAO3/Box3 Player:

1. Author an editable `nea-map/v1` source project.
2. Compile it into the compatibility `dao3-project/v1` package.
3. Start the historical Player against the compiled terrain.
4. Execute a capability-gated server map script.
5. Deliver a small client map script through `gameNet.syncClientScriptModules`.

## Commands

```powershell
cd D:\Projects\Gaming\NEA-Project\demo-map
npm test
npm run build
npm start
```

The Demo starts the historical Player on `4322` and a random-token, loopback-only Script Runtime control bridge on `4323`. Set `NEA_DEMO_CONTROL_PORT` to move the bridge or `NEA_DEMO_CONTROL_TOKEN` only for deterministic local testing.

## MuDB build

`src/server.mjs` and three test suites load the preserved block catalog through `../../local-player/src/block-info.mjs`, which requires `mudb/schema` and `mudb/stream`. MuDB is vendored as TypeScript and ignores its own compiled output, so a fresh clone has no such modules and those suites fail to resolve their imports.

`npm test` and `npm start` therefore run `../tools/build-mudb.mjs` first. The script compiles only the `schema` and `stream` layers, skips work when the emitted files are newer than `mudb/src`, and on its first run installs a pinned TypeScript into the gitignored `tools/.mudb-toolchain/`. Every later run is a no-op, so only the first build needs network access.

```powershell
npm run build:mudb              # compile explicitly
node ..\tools\build-mudb.mjs --check    # verify without building
node ..\tools\build-mudb.mjs --force    # recompile unconditionally
```

The script reuses `mudb/node_modules` when MuDB's own dependencies are already installed, so a full `npm install` inside `mudb/` keeps working.

The server-side player model runs fixed-step physics at 20 Hz. Historical Player module 7166 confirms the upright default half extents `0.45 / 1.1 / 0.45`, while Lokibox confirms that `rx/ry/rz` are broadphase bounds and `hsx/hsy/hsz` are separate shape half extents. Player positions remain rigid-body-center coordinates. Runtime snapshots expose the exact collider source and AABB used by the solver. A complete authoritative `bodyHalfExtents` plus `bodyShapeHalfExtents` update replaces the current collider; explicit unknown (`null`) posture shapes preserve it, and partial updates are rejected.

Run `npm run probe:remote` while the Demo is active to create a real MuDB session and verify ack, checkpoint, and hazard events end to end.

The same probe now verifies the authoritative state bridge: after the hazard script teleports and applies an impulse, it reads the backend runtime snapshot and confirms the final position and velocity. Use `NEA_DEMO_CONTROL_TOKEN` when running a deterministic local probe; normal starts generate a random token.

Open `http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008`.

The editable sample is under `project/`. Generated compatibility output is under `build/project/`.

## Verified flow

- The importer expands the sample to 11,592 non-air voxels.
- The historical Player renders the generated map and creates a Guest avatar.
- `clientIndex.js` is delivered through `gameNet.syncClientScriptModules`.
- A recovered minimal `gameUI` identity allows the Player client script to start.
- The client sends `nea-demo:ready` through `remote-channel`.
- The server Script Runtime receives the event and executes the map handler.

See `docs/map-import-format.md` and `docs/script-runtime.md` for the current contracts and limitations.
