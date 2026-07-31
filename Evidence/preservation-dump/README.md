# DAO3 Final-Day Preservation Dump

Repository-wide progress and cleanup decisions live in `../Docs/project-progress.md` and `../Docs/repository-cleanup-plan.md`. This README is limited to bounded capture, export, and evidence packaging workflows.

This kit records editor and play sessions through Chromium DevTools before the pages establish their network and MuDB connections.

## Start

Run from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\preservation-dump\start-live-dump.ps1
```

The script opens the two live `dao3.fun` URLs in a dedicated Edge profile. After you press Enter, it writes both `manifest.json` and a searchable `catalog.json` into the timestamped private capture directory.

It opens an isolated Microsoft Edge profile and begins recording before opening the supplied editor and play URLs. Log in inside that newly opened Edge. Do not switch to an existing browser window because its initial requests and WebSocket handshake would be missed.

## Editor checklist

1. Open scene, hierarchy, assets, code, UI, project settings, physics, permissions, publishing, and preview sections.
2. Expand the complete hierarchy and select representative voxels, entities, zones, meshes, UI nodes, sounds, animations, and scripts.
3. Open every existing client and server script so the editor creates all source models.
4. Exercise duplicate, import, export, save, preview, publish, version/history, and permission dialogs where available.
5. Download/export the project through every available export action. Downloads are redirected into the capture folder.
6. Put `preservation-dump/probe/server.js` into the server script and `preservation-dump/probe/client.js` into the client script, then start preview.
7. Keep preview running while completing the play checklist.

## Play checklist

1. Join both editor preview and the supplied normal play URL.
2. Walk, run, jump, double-jump, crouch, swim, fly, fall, step onto slabs, hit walls, and stand in corners where available.
3. Place, break, click, and interact with voxels and entities.
4. Use chat and all available keyboard, mouse, camera, UI, sound, dialog, shop, and teleport interactions.
5. Trigger damage, death, respawn, entity contact, voxel contact, fluid enter/leave, and map zones.
6. Stay connected for at least two minutes to capture heartbeats and state deltas.
7. Reload each page once near the end to record cached and service-worker startup behavior.

Return to PowerShell and press Enter only after both modes are complete. The final DOM and storage-catalog snapshot can take several minutes.

## Output

Each run is written under:

```text
dump/private/live-captures/YYYYMMDD-HHMMSS/
```

The complete persistent browser profile is retained at:

```text
dump/private/live-browser-profile/
```

The capture contains request/response bodies, WebSocket frames in both directions, loaded JavaScript sources, console output, exceptions, DOM snapshots, global/prototype surfaces, Monaco models, local/session storage, IndexedDB and CacheStorage catalogs, service-worker registrations, performance entries, and browser downloads. The retained browser profile preserves the complete IndexedDB, CacheStorage, service-worker, cookie, and login state for later offline extraction.

Authorization and Cookie values are redacted in generated reports. The retained browser profile remains private. Both paths are already ignored by Git and must never be uploaded.

## Direct editor export

When an authorized editor is already open through the live capture, export scripts and project state without clicking through the editor UI:

```powershell
node .\preservation-dump\export-editor-scripts.mjs
node .\preservation-dump\export-editor-project.mjs
node .\preservation-dump\analyze-exported-scripts.mjs
```

The script exporter reads `codeEditorController.getFileList()` from the editor's React state. It does not trigger save, compile, syntax-validation, or script-switch dialogs. The project exporter records the replica project, physics, entity/UI/voxel indexes, resource metadata, permissions, runtime bridge surfaces, and the editor's runtime server declarations.

The generated private files are written under `manual-cdp/source`, `manual-cdp/project`, and `manual-cdp/analysis` in the active capture directory.

## Build an editor runtime package

Generate a local package from a private editor export and its matching network capture without modifying either source directory:

```powershell
node .\preservation-dump\build-editor-runtime-package.mjs <work-root> <capture-root> <output-root> .\local-player\archive [template-project-id] [template-world-manifest]
```

The builder copies captured `/engine/m/<hash>` metadata and data bodies into the output archive, appends only mesh bootstrap entries whose project bounds match the captured model metadata, and writes `compat/player-entity-projection.json`. Quantized captured quaternions are normalized at the projection boundary. Captured script tags are retained under source metadata while the project-package carrier contains only tags accepted by its schema. Missing mesh declarations or response bodies remain listed as unmapped diagnostics; the builder does not infer identities or synthesize model data.

The resulting `dao3-project/v1` package also contains `capabilities/manifest.json`, generated by the same repository-wide analyzer used by the public map importer. Server and client modules, recovered UI state, package entities, and only captured meshes accepted by the projection validator participate in the launch decision. The private script source remains in the ignored runtime package; the capability manifest records module/API usage and aggregate status without embedding source text. A blocked manifest stops launch before the backend or Player starts, while partial behavior remains explicitly partial.

Player runtime and bootstrap templates are selected by their recovered manifest formats, then copied under `project/<packageId>/client-runtime` and `project/<packageId>/bootstrap`. The builder does not retain the source template's project name. If an archive contains more than one compatible runtime or world template, pass the optional template project ID and world-manifest filename explicitly; ambiguity is an error rather than an implicit work-specific choice. `runtime-package.json` publishes `clientRuntimeManifest` and `projectBootstrapManifest`, and the launcher forwards them through `BOX3_CLIENT_RUNTIME_MANIFEST` and `BOX3_PROJECT_BOOTSTRAP_MANIFEST`.

The launcher validates `runtime-package.json` before reading project data or spawning the backend. The route must equal `/play/<packageId>`, the content ID must be decimal, and all world, client-script, client-UI, client-runtime, bootstrap, and projection descriptor fields must be safe relative JSON paths. New captured packages must provide explicit client-runtime and bootstrap manifests; omission is treated as an obsolete package rather than silently falling back to a preserved work's archive paths.

Captured `audioAssets` are packaged only when their declared CID has a saved `/block/<CID>` response, the bytes have an MP3 signature, and recomputing CIDv0 from the bytes matches the declaration. Verified audio is copied to both the project asset index and the archive block namespace used by the historical Player, and client scripts receive the evidence-backed `client.media` grant. Missing or mismatched audio remains absent from the capability bindings so a referenced sound blocks launch.

Captured client-script grants are derived from confirmed public entries in `Middleware/runtime-compat/abi/current-runtime.json`, rather than maintained as a map-specific list. The current public set is `client.core`, `client.http`, `client.media`, `client.navigator`, `client.remote-channel`, `client.ui`, and `client.world`. `client.script` is intentionally excluded because it represents sandbox/module-delivery infrastructure rather than authority requested by map code. Granting a capability does not upgrade partial API behavior: every detected member still uses its selected ABI binding status and evidence gaps.

Captured picture assets are converted only for the directly recovered editor shape: the editor `hash` addresses a JSON object containing exactly the Player-facing image `hash`, `width`, and `height`, while `previewImage` equals that image hash. Both 43-character keys must equal the SHA-256 base64url digest of their saved `/engine/m/<hash>` bodies, metadata must point to the declared image, dimensions must be positive integers, and the image bytes must have a recognized PNG, JPEG, WebP, or GIF signature. The validated result becomes the historical `metadataHash/hash/width/height` entry sent through `gameUI.reset`; incomplete or mismatched entries remain unresolved.

UI nodes are checked against the recovered picture set before launch. Empty image fields are ready, named images absent from the recovered set are blocked, external image URLs are partial, metadata-only entries are partial, and entries whose metadata plus image content pass the complete verification above are ready through the native Player picture resolver. The package summary reports declared, packaged, and unresolved picture counts without publishing their private names.

## Validation

```powershell
node .\preservation-dump\capture-cdp.mjs --self-test
node --check .\preservation-dump\export-editor-scripts.mjs
node --check .\preservation-dump\export-editor-project.mjs
node --check .\preservation-dump\analyze-exported-scripts.mjs
node --check .\preservation-dump\probe\server.js
node --check .\preservation-dump\probe\client.js
```
