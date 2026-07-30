# NEA Map Source Format v1

`nea-map/v1` is the editable creator-facing source format. The importer validates it and emits a deterministic `dao3-project/v1` directory consumed by the recovered Player backend.

## Root manifest

The source root contains `nea.map.json`:

- `id`: lowercase package identifier.
- `display`: creator-facing name and description.
- `runtime.apiVersion`: requested Script Runtime API version.
- `runtime.tickRate`: integer from 1 to 120.
- `world.shape`: three dimensions; each must be divisible by 32 for the historical Player.
- `world.spawn`: finite position inside the world.
- `world.terrain` and `world.entities`: safe paths inside the source root.
- `world.physics`: optional `nea-physics/v1` material and interaction-volume definition.
- `assets`: optional resource declarations with a unique logical `name`, safe source `path`, and optional descriptive `kind`.
- `ui`: optional safe path to a locally preserved `nea-recovered-client-ui/v1` state whose `sourceMessage` is `gameUI.reset`.
- `scripts.server`: trusted local server script.
- `scripts.client`: optional historical Player client module.
- `scripts.serverModules`: optional complete server module path list; defaults to the server entry and must include it.
- `scripts.clientModules`: optional complete client module path list; defaults to the client entry and must include it. Client modules must remain inside the entry directory so their relative identities can be preserved safely.
- `scripts.serverCapabilities`: explicit grants required by the server script.
- `scripts.clientCapabilities`: explicit grants requested by the historical Player client script. These are published only in the client script manifest and never injected into the server VM.
- Legacy `scripts.capabilities` is accepted as a server-only alias during migration.

## Terrain

Terrain uses `nea-terrain/v1`. `boxes` use inclusive `from` and `to` coordinates. `voxels` apply after boxes, so later writes override earlier cells. A `blockId` of `0` removes a cell. The importer caps expanded terrain at one million non-air voxels.

Non-air block IDs must exist in the BlockInfo catalog shipped with the target Player archive. The compatibility backend performs the authoritative catalog check before listening.

## Physics and interaction volumes

`nea-physics/v1` is optional; omitted files use the runtime defaults. It declares:

- `gravity`, `maxFallSpeed`, and `stepHeight` for the fixed-step player model.
- `materials`, keyed by block ID, with `solid`, `friction`, `restitution`, and tags.
- `colliders`, static axis-aligned solid volumes with stable IDs and tags.
- `triggers`, non-solid axis-aligned volumes that emit enter/leave events.

Positions are world coordinates. Collider and trigger `min` bounds are inclusive and `max` bounds are exclusive. Volumes must stay inside the world shape.

## Entities and mesh projection

Entity records may include an optional `mesh` resource reference. The importer preserves this reference but never derives geometry, bounds, collision, or a physics body from its text. A package-owned entity with a mesh blocks launch until the runtime package supplies a capture-derived `validated-mesh` binding. A mesh passed to `world.createEntity(...)` without such a binding remains a script-local entity and is reported as `partial`; it is not projected into the authoritative Player world.

## Static client UI

The optional UI state uses the already recovered backend contract: `nea-recovered-client-ui` version 1, `gameUI.reset`, a validated `ROOT_ID`, a default screen, bidirectional parent/child links, and captured picture-asset metadata. The importer republishes this state unchanged to the Player archive; it does not translate a new UI schema.

Literal `ui.findChildByName(...)` and default `screen.findChildByName(...)` calls are checked against the packaged tree before launch. Missing names, dynamic arguments, or lookups without a packaged tree block launch. A literal lookup through another receiver is `partial` when the name exists globally but the receiver subtree cannot be proven statically. `Ui*.create()` remains independent of the static tree and can be `ready` when its ABI binding and capability grant are available.

## Import output

`npm run build` writes `.nea/build/project` with:

- `dao3.project.json`
- `world/world.json`
- `world/terrain.json`
- `world/entities.json`
- `world/physics.json`
- `assets/index.json`
- `assets/files/<sha256>.<extension>` for each declared source asset.
- `scripts/manifest.json`
- `scripts/server.js`
- `capabilities/manifest.json`

Declared binary assets are copied into the project package under content-addressed names. `assets/index.json` records their logical name, kind, packaged path, byte length, and SHA-256 digest. Packaging proves local availability only; it does not invent a DAO3 runtime resource binding.

## Capability manifest and launch gate

Every tracked `dao3-project/v1` producer uses the shared repository capability builder. The public importer and the private capture-package builder statically inventory public server/client API member usage and resolve each usage against `runtime-compat/abi/compatibility-matrix.json` plus the selected binding in `runtime-compat/abi/current-runtime.json`. The generated `nea-project-capability-manifest` records the canonical ABI id, compatibility state, required capability grant, and evidence-backed gaps without embedding script source.

- `ready`: every detected requirement has an executable non-partial binding and the required grant.
- `partial`: every requirement is executable, but at least one retains documented behavioral gaps. Launch is allowed with a warning.
- `blocked`: a requirement is undeclared, non-executable, or lacks its required capability grant. Launch stops before the backend or Player starts.

The scanner is intentionally conservative. An unresolved member is blocked rather than mapped to a similarly named API. Captured works may add anonymous conformance coverage, but work names and private message/resource identities are not inputs to capability resolution.

For captured packages, public client grants are derived from confirmed `current-runtime` bindings. Internal `client.script` entries are excluded because sandbox creation and module delivery are runtime infrastructure, not map authority. This prevents an implemented HTTP, media, navigator, UI, RemoteChannel, or client-world member from being blocked merely because a hand-maintained package grant list is stale, while the member's own native/compatible/partial status remains unchanged.

Version 5 of the manifest also records:

- Per-module dependencies and missing relative modules.
- Entity and player member usage inferred from `world.querySelector`, `world.createEntity`, DAO3 `onX`/`nextX` event payload destructuring, and `.player` assignments.
- Client UI member usage inferred from `Ui*.create` and `findChildByName` assignments.
- Script-visible audio/image references and entity mesh references, with separate availability and runtime-support states.
- Packaged UI nodes, client UI construction/lookup variables, standalone lookup calls, and the properties used on each inferred node.
- Project UI image dependencies. A named image missing from `pictureAssets` blocks launch; metadata-only pictures remain partial; metadata and image bodies whose SHA-256 base64url keys, dimensions, relationship, and media signatures are all verified use the native Player picture resolver and are ready; external URLs remain partial.
- Project entities and statically visible `world.createEntity({...})` calls, including whether native projection requires a validated mesh binding.
- Explicit local Runtime extensions, which are executable but remain `partial` because they are not canonical DAO3 declarations.
- Cross-runtime dependencies backed by `runtime-contracts.json`: client module delivery over `player.game-net`, client/server RemoteChannel flows over `player.remote-channel`, and evidenced player transform/respawn writes into the authoritative runtime over `nea-control.player-state`. Members with multiple local adapters are resolved against the statically inferred owner. Property reads do not require the state-write flow, and unrelated `server.player.write` extensions are not assumed to use it. Missing flow or contract evidence blocks launch.
- Compatibility matrix status `unavailable` is distinct from `declared-only`: it requires direct evidence that the selected runtime provider does not expose the documented surface. For example, the archived Player stores `UiInput.placeholderOpacity` internally, but its hardened Script Runtime wrapper omits the getter, so projects using it are blocked with that evidence instead of receiving a fabricated value.
- Server terrain access uses the dedicated `server.world.voxels` grant. It covers the `voxels` global and the recovered `world.size` projection, and is deliberately separate from `server.world.entities`; the Capability Manifest and runtime facade both enforce the same boundary.
- Declared GameGUI members use `server.gui`. Unknown `world.*` or `gui.*` names are not automatically accepted: the manifest treats them as `script-owned` only when a static assignment in one of the project's modules establishes that surface, after which reads and calls in other modules remain project state rather than invented Runtime ABI.
- GameStorage access uses `server.storage`. The grant authorizes the local storage provider but does not upgrade its compatibility classification: single-map data storage remains locally persistent, while group storage stays partial unless direct provider support is supplied.
- Historical world configuration projections use `server.world.config`. The current surface is limited to `gravity`, `airFriction`, and `fogColor`; granting it authorizes script access but does not imply authoritative physics or Player environment propagation that has not been recovered.
- Client module delivery is required only when the project declares at least one client module. An absent client module list produces no `player.game-net.syncClientScriptModules` dependency; an explicitly declared zero-byte module is still a real module and therefore retains the delivery requirement.
- Declared GameGUI usage adds a `player.gui` transport dependency. Launch is blocked unless `runtime-contracts.json` confirms the handle-based command and response flow; script-owned `gui.*` fields do not trigger this dependency.

Project-owned resources use the `asset:<name>` form in the capability inventory. A missing project-owned asset blocks launch. A packaged non-mesh asset remains `partial` until a generic DAO3 asset resolver is executable; the local ABI currently records `server.global.resources` as recovered-only. A mesh remains blocked unless its metadata comes from a captured and validated Player projection binding. External references are `partial` because they are not preserved locally and network retrieval is not guaranteed. Named/default ESM imports and CommonJS `require` destructuring propagate inferred DAO3 entity/player/UI ownership when the exported value has a statically recovered source. Server-side `world.querySelectorAll(...)` results propagate `GameEntity` ownership through `for...of` iteration, and direct identifier aliases preserve recovered ownership across assignments.

Captured client audio is a narrower evidence-backed exception to the generic non-mesh rule. DAO3 documentation requires `Audio` sources to use the `/block/<CID>` content URL, saved captures contain the corresponding MP3 response bodies, and the local Player backend already validates and serves that namespace. When a packaged audio declaration has a matching verified CID, the capability manifest reports `player-block-audio` as ready. Missing bodies, invalid MP3 bytes, non-matching CIDs, arbitrary URLs, images, and other resource kinds remain blocked or partial according to their actual resolver evidence.

DAO3-owned collection consumers are also analyzed without treating arbitrary arrays as runtime objects. Callback parameters passed to `forEach`, `map`, `filter`, `find`, `some`, or `every` inherit `GameEntity` ownership from `world.querySelectorAll(...)` and `UiScreen` ownership from `UiScreen.getAllScreen()`. A value returned by `find` inherits the same owner. This covers high-frequency anonymous captured-script shapes while keeping unrelated business collections outside ABI inference.

Dynamic property names, `eval`, `Function` construction, and runtime-generated import specifiers create blocking diagnostics because their API requirements cannot be proven before launch. String-literal computed members such as `world["say"]` remain analyzable. Aliases that cannot be traced to a recovered constructor, event payload, query, collection iteration, or local named/default export remain outside static proof and must not be assumed compatible.

Event payload ownership is inferred only when a destructuring callback is directly registered with a known DAO3 world/entity/player `onX` or `nextX` member, or when a same-module named function is passed to that registration. A standalone business callback such as `({ entity }) => ...` does not make `entity` a `GameEntity`; this prevents common application data shapes from being promoted into Runtime ABI requirements.

Server module resolution matches the local CommonJS loader: relative, package-root absolute, and bare `node_modules` requests must resolve to an explicitly synchronized file or a synchronized `index.js` directory entry. Bare packages are not assumed to exist. The analyzer can inventory ESM imports/exports, but server ESM syntax remains a blocking diagnostic because the current executable server substrate is CommonJS-only.
