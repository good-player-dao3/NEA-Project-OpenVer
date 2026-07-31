# NEA Project Agent Handoff

Last updated: 2026-07-29

## Mission

Preserve the discontinued dao3.fun / Box3-style game platform well enough that old map creators can import their exported maps, scripts, UI, assets, and configuration into a self-hosted replacement that visitors can play.

This is not only a website clone. The required system includes:

- A compatible Player.
- A map import format and importer.
- A server script runtime.
- A client script runtime.
- Server and client API/ABI compatibility.
- Remote channel messaging.
- UI, resources, entities, voxels, physics, collision, and replication.

## Required Working Style

- Study local files and preserved runtime evidence before using upstream Git repositories.
- Do not restart the project with an unrelated architecture.
- Read the existing implementation and tests before changing code.
- Fix root causes instead of hard-coding behavior for one demo map.
- Treat server scripts and client scripts as separate required runtimes.
- Record evidence and confidence for ABI conclusions.
- Use short, bounded commands. Avoid fake background processes that block the terminal for minutes.
- Long extraction jobs must checkpoint and be resumable.
- State the immediate action before running tools.
- Never upload cookies, OAuth tokens, browser profiles, private dumps, or token-bearing URLs.

## Repository State

- Workspace: `D:\Projects\Gaming\NEA-Project`
- Branch: `beta`, tracking `origin/Beta`
- The user permits replacing the remote Beta branch contents, but local preservation evidence must not be deleted.
- `NEA-Project.7z` belongs to the user. Do not modify, delete, or commit it.
- `dump/private/` is ignored by Git and contains confidential capture data.
- `origin/third-party/` contains local reference clones and is ignored by Git.
- Do not run destructive Git or recursive filesystem commands without explicit user approval.

## Repository Map

### `Backend/local-player/`

Historical Player assets, local hosting, browser protocol research, Player adapters, and compatibility code.

### `Middleware/runtime-compat/`

Primary API/ABI, protocol, object model, physics, collision, compatibility matrix, evidence, generation, and conformance-test workspace.

Start with:

- `Middleware/runtime-compat/package.json`
- `Middleware/runtime-compat/abi/current-runtime.json`
- `Middleware/runtime-compat/abi/client-runtime.json`
- `Middleware/runtime-compat/abi/server-runtime.json`
- `Middleware/runtime-compat/abi/protocols.json`
- `Middleware/runtime-compat/abi/compatibility-matrix.json`
- `Middleware/runtime-compat/generated/gap-report.md`
- `Middleware/runtime-compat/generated/phase-5-audit.md`

### `Frontend/demo-map/`

Test project for the import format, server runtime, client runtime, events, UI, physics, and remote messaging.

Start with:

- `Frontend/demo-map/docs/map-import-format.md`
- `Frontend/demo-map/docs/script-runtime.md`
- `Frontend/demo-map/project/nea.map.json`
- `Frontend/demo-map/project/scripts/server.js`
- `Frontend/demo-map/project/scripts/client.js`
- `Frontend/demo-map/src/server.mjs`

### `preservation-dump/`

Final-day online preservation tools. Outputs are private by default.

- `authorize-arenapro.mjs`: ArenaPro OAuth helper.
- `start-live-dump.ps1`: isolated Edge and CDP capture launcher.
- `capture-cdp.mjs`: network, WebSocket, source, DOM, storage, and runtime capture.
- `export-editor-scripts.mjs`: directly reads React `codeEditorController.getFileList()` without UI switching.
- `export-editor-project.mjs`: exports project state, physics, entities, UI, voxel indexes, resources, permissions, runtime bridges, and declarations.
- `analyze-exported-scripts.mjs`: inventories real map API usage and remote-channel message types.

### Other evidence

- `dao3-docs-mirror/`: developer API documentation mirror.
- `origin/`: historical server reproduction and recovered sources.
- External reference worktrees were removed after neutral recovered ABI evidence was extracted. Do not recreate or reintroduce external workspace dependencies.
- `D:\Projects\Gaming\hunter-code` may not exist under this English name. The actual external directory is the Chinese-named historical code directory previously provided by the user. It is evidence only and must not define the new architecture.

## Preserved Live Map

Authorized editor URL:

```text
https://dao3.fun/edit/773d55351c932c918ca0
```

The edit hash is not the public play hash. Replacing `/edit/` with `/play/` returns 404.

Private capture directory pattern:

```text
dump/private/live-captures/<timestamp>
```

Recovered from editor runtime state:

- 40 server scripts.
- 23 client scripts.
- About 1.54 MB of script source.
- Only `script_6.js`, `script_11.js`, and `script_12.js` are empty in the editor file state.
- About 1.03 MB of project/runtime snapshot data.
- About 454 KB of runtime server TypeScript declarations.
- 57 server API member usages from this map.
- 17 client API entry usages from this map.
- Multiple server-to-client and client-to-server remote-channel message types.

Important private outputs:

```text
manual-cdp/source/server/
manual-cdp/source/client/
manual-cdp/project/project.json
manual-cdp/project/extra-project-info.json
manual-cdp/project/runtime-bridge.json
manual-cdp/project/server-declarations.d.ts
manual-cdp/analysis/script-abi-usage.json
manual-cdp/analysis/script-abi-usage.md
```

Do not commit the private map. Convert findings into redacted ABI evidence, fixtures, tests, and documentation.

## ArenaPro Evidence

Local reference clones:

```text
origin/third-party/ArenaPro-CLI
origin/third-party/ArenaPro-Creator
```

Confirmed findings:

- OAuth endpoint: `https://dao3.fun/oauth2.0`
- Authorized editor format: `edit/<editHash>?token=<Authorization>`
- Server script type: `0`
- Client script type: `1`
- Script save endpoint: `https://code-api-pc.dao3.fun/open/script/save-or-update`
- Common bundle names: `_server_bundle.js` and `_client_bundle.js`
- Client declarations: `origin/third-party/ArenaPro-CLI/client/types/ClientAPI.d.ts`
- Server declarations: `origin/third-party/ArenaPro-CLI/server/types/GameAPI.d.ts`

These repositories are evidence, not runtime dependencies.

## Confirmed Runtime Architecture

The editor React tree exposes a complete editor/game instance containing:

- `codeEditorController`
- `replica`
- `rpc`
- `publish`
- `editContentStorage`
- `_game`

`codeEditorController` exposes:

- `getFileList()`
- `getSelectedFile()`
- `selectFile()`
- `fileDictReplica`
- `serverDeclarations`
- Monaco integration

The embedded game engine exposes:

- `clientScript`
- `remoteChannel`
- `gameUI`
- `input`
- `player`
- `voxel`
- `chat`
- `navigator`
- `rtc`
- `gui`
- `resourceController`
- `net`

Client scripts are required. The recovered map uses UI constructors, pointer locking, screen events, client remote-channel listeners, and `sendServerEvent`.

Server scripts heavily use world events, entity queries, voxel reads/writes, storage, `sendClientEvent`, and server remote-channel listeners.

## Current Phase

The current task is to map the newly preserved real-map evidence into the Player and Runtime compatibility model.

Recommended order:

1. Read this file and the root `README.md`.
2. Inspect `git status` without overwriting user files.
3. Read the current gap report and phase audit.
4. Compare private `script-abi-usage.json` with `Middleware/runtime-compat/abi/current-runtime.json`.
5. Produce a prioritized list of real-map requirements missing from the local runtime.
6. Implement the highest-priority client Runtime, remote-channel, and UI gaps.
7. Build redacted conformance fixtures from the recovered behavior.
8. Map the real `project.json` structure into the demo map import format.
9. Continue collision, player body, OBB/AABB, contact-event, posture, and physics replication work.

## Phase Acceptance Criteria

- A real-map API compatibility gap report exists.
- Bidirectional client/server remote-channel conformance tests exist.
- The local runtime executes one server script and one client script at the same time.
- Client scripts can create UI, receive client events, and send server events.
- Server scripts can receive events and send targeted or broadcast client events.
- The Demo visibly contains UI controlled by a client script rather than backend hard-coding.
- The importer reads core fields from the recovered `project.json` and reports unsupported fields.
- Physics and collision gaps are represented by tests, not only visual tuning.

## First Recommended Task

Use the recovered `script-abi-usage.json`, ArenaPro API declarations, and the current `runtime-compat` ABI to generate a real-map compatibility gap report. Select the highest-priority missing client `remoteChannel` and UI behavior, implement it, and add conformance tests. Do not rewrite the whole Player and do not spend time on unrelated frontend styling.
