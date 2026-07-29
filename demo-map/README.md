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

The server-side player model runs fixed-step physics at 20 Hz. Historical Player module 7166 confirms the upright default half extents `0.45 / 1.1 / 0.45`, while Lokibox confirms that `rx/ry/rz` are broadphase bounds and `hsx/hsy/hsz` are separate shape half extents. Player positions remain rigid-body-center coordinates. Runtime snapshots expose the exact profile and AABB used by the solver; crouch and flying shape mutations remain unresolved.

Run `npm run probe:remote` while the Demo is active to create a real MuDB session and verify ack, checkpoint, and hazard events end to end.

The same probe now verifies the authoritative state bridge: after the hazard script teleports and applies an impulse, it reads the backend runtime snapshot and confirms the final position and velocity. Use `NEA_DEMO_CONTROL_TOKEN` when running a deterministic local probe; normal starts generate a random token.

Open `http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008`.

The editable sample is under `project/`. Generated compatibility output is under `build/project/`.

## Verified flow

- The importer expands the sample to 11,560 non-air voxels.
- The historical Player renders the generated map and creates a Guest avatar.
- `clientIndex.js` is delivered through `gameNet.syncClientScriptModules`.
- A recovered minimal `gameUI` identity allows the Player client script to start.
- The client sends `nea-demo:ready` through `remote-channel`.
- The server Script Runtime receives the event and executes the map handler.

See `docs/map-import-format.md` and `docs/script-runtime.md` for the current contracts and limitations.
