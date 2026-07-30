# NEA Script Runtime 0.1

The Demo runtime executes trusted local server scripts in a Node `vm` context without `process`, `require`, dynamic code generation, or WebAssembly. It is a compatibility prototype, not yet a hardened hostile-code sandbox.

The project format binds `server.js` and `client.js` to separate contracts and separate capability lists. Server capabilities gate the Node VM globals below. Client capabilities are published with `clientIndex.js` for Player-side negotiation and are never treated as server grants.

The Demo client requests `client.core`, `client.ui`, and `client.remote-channel`. Its `client.js` creates a historical Player `UiText` status panel and updates it from server events, making the independent SES client Runtime visible in-game rather than only through console logs.

## Globals

- `world`: tick, player lifecycle, voxel/general contact, trigger enter/leave, chat, entity creation, and tag queries.
- `voxels`: preserved BlockInfo-backed `id`, `getVoxelId`, `setVoxelId`, and `setVoxel` compatibility methods.
- `remoteChannel`: client-event subscription and authenticated outbound delivery to the matching MuDB Player session.
- `Vector3` and `Vec3.create`: minimal vector compatibility.
- `console`, `setTimeout`, `clearTimeout`, and `structuredClone`.

## Capabilities

- `world.events`
- `world.chat`
- `world.entities`
- `server.player`
- `server.player.write`
- `remote-channel`

Every privileged API checks its declared capability at call time. Missing grants fail the script instead of silently widening access.

## Voxel ABI

The server runtime loads the preserved BlockInfo asset referenced by the local Player world manifest and never synthesizes block names or IDs. The first conformance phase implements `voxels.id`, `voxels.getVoxelId`, `voxels.setVoxelId`, and `voxels.setVoxel` from `ScriptVoxelSync`, the dao3.fun GameVoxels documentation, ArenaPro declarations, captured editor declarations, and anonymous real-script call shapes. Full IDs retain the two rotation bits above the `0x3fff` base-type mask, successful writes immediately update both reads and collision candidates, and invalid names, IDs, or coordinates return `0` as in the historical source.

The recovered source contains mojibake in four Chinese rotation-alias cases. English aliases and numeric strings confirmed by the readable switch cases are implemented; the exact Chinese aliases remain an explicit compatibility gap until another local source recovers their original text.

The second conformance phase completes the basic read surface with `voxels.getVoxel`, `voxels.name`, and `voxels.getVoxelRotation` plus BlockInfo-backed `voxels.VoxelTypes` and the script-visible maximum `voxels.shape`. The anonymous corpus report separately marks direct script-defined assignments as `custom-extension`; undeclared names without assignment evidence remain `unclassified` instead of being promoted to either native ABI or work-specific behavior.
## Raycast ABI

`world.raycast(origin, direction, options?)` follows the recovered historical `ScriptWorldSync` flow rather than a work-specific adapter. The supported options are exactly the declared `maxDistance`, `ignoreFluid`, `ignoreVoxel`, `ignoreEntities`, and `ignoreSelector`. When `maxDistance` is omitted, the recovered default is `Infinity`; direction is normalized only when its magnitude exceeds the historical epsilon, so a zero vector is preserved instead of rejected. A no-hit result retains the requested distance and zero vectors for `hitPosition`, `normal`, and `voxelIndex`. Entity candidates are tested first, then the voxel ray is limited to the current nearest distance, matching the recovered dispatch order. The local finite voxel grid stops traversal at its world boundary so an infinite default cannot create an unbounded loop.

Entity ray intersections currently use authoritative player bounds or imported entity AABBs. The implementation of the historical engine `raycastBoxes` primitive and its body-orientation semantics is not present in the available source, so that portion remains explicitly partial. `GameWorld.useOBB` is documented and recovered as a separate world-physics property; it is not a `GameRaycastOptions` field and is not invented as one.

## Physics model

Player positions represent the rigid-body center. Each server player receives an explicit initial collision profile containing origin status, size status, broadphase bounds and shape half extents; no solver default silently supplies a body size. The recovered upright Player default is `0.45 / 1.1 / 0.45`. Network PUBLIC bodies populate `rx/ry/rz` from `boundsHalfExtents` and `hsx/hsy/hsz` from `shapeHalfExtents`. A complete authoritative pair replaces the current collider, while an explicitly unknown posture shape (`null`) preserves it and a partial pair is rejected. This is a local compatibility policy, not a claim that crouch or flying historically used the standing size. Candidate lookup uses bounds while actual contacts and triggers use shape. Player snapshots expose both sets, `collision.shapeSource`, `collision.aabb`, and `collision.shapeAabb`. Mutations such as `player.applyImpulse()` and `player.damage()` require `server.player.write`.

`runtime.snapshot().physics` exposes sweep, chunk-query, candidate, trigger-query, chunk, collider, and trigger counts for diagnostics. The model runs at the project tick rate (20 Hz in the Demo). It remains a server Script Runtime model and does not overwrite the historical Player motor every frame.

## Contact force ABI

Recovered solver evidence defines each contact force as the normal and friction impulses accumulated during a fixed step, multiplied by `INV_DT`. The local sweep solver therefore records its actual collision and ground-friction velocity deltas and projects `force = mass * deltaVelocity / deltaTime` into `GameVoxelContactEvent.force`. Simultaneous contacts divide the impulse evenly, matching the recovered voxel-contact compaction rule that copies the group-average force to each retained contact. DAO3 documentation supplies the native default mass of `1`; no aggregate `GameEntity.contactForce` value is synthesized because the historical `ContactBinding` aggregation implementation remains unavailable.

## Authoritative Player state

Players created from real MuDB sessions use `authority: "backend"`. Their position, velocity, `bodyHalfExtents`, and `bodyShapeHalfExtents` are polled from the compatibility backend's existing `AuthoritativeGameRuntime`; local physics observes contacts and triggers without applying a second gravity/movement simulation. Script writes to `player.position`, `player.velocity`, or `player.applyImpulse()` are optimistically reflected, protected by a short write barrier, and queued back through the backend's existing transform command path. Runtime-only test players continue to use the local fixed-step physics owner.

## Entity lifecycle ABI

`GameEntity.destroy()` now follows the recovered server lifecycle instead of hiding or disabling an entity locally. A non-player entity is removed from Script Runtime selectors immediately, resolves `onDestroy` and `nextDestroy` once, and requests authoritative backend despawn when it has a recovered projection binding. Player destruction remains a no-op, matching the historical `ScriptEntitySync.destroyEntity` non-player guard. Runtime-created entities remain local until the separately evidenced entity-creation projection path is implemented.

This bridge is required for collision correctness as well as script compatibility: removing only the script wrapper would leave the projected rigid body in the authoritative runtime and produce an invisible collider. The implementation therefore uses the backend's existing despawn path rather than introducing a work-specific collision exception.

## Runtime-created entity projection

`world.createEntity()` still returns its `GameEntity` synchronously and emits the recovered entity-create event immediately. Its documented physics and render configuration (`position`, `velocity`, `collides`, `fixed`, `gravity`, `mass`, `friction`, `restitution`, `mesh`, `meshScale`, and `meshOrientation`) is then sent through a loopback-only bridge to the existing authoritative entity registry. Subsequent whole-value `position` and `velocity` assignments use the registry's existing transform-update path.

The editor-package builder adds only captured model metadata/data to the Player bootstrap table and writes a validated mesh-name-to-bootstrap mapping. The backend refuses to project a mesh absent from that mapping; it does not substitute a model, derive bounds from a name, or turn an unknown mesh into a work-specific placeholder. Unmapped entities remain visible to server scripts but are explicitly not claimed to be browser/physics replicas.

## Damage ABI

Writes to `showHealthBar`, `hp`, and `maxHp`, together with `GameEntity.hurt()` and `GamePlayer.forceRespawn()`, now use the recovered `replica.damage` state and `game-net` `scriptEvents.damage` transport. Hurt amounts for the same entity and server tick are aggregated before emission, matching the historical ScriptShell behavior. Death and respawn are emitted as the recovered entity-ID lists, while health-bar state remains in the public replica snapshot.

`enableDamage` remains a Script Runtime gate because it does not appear in the recovered client `DamageSchema`. Damage generated by the native engine outside server scripts is still a separate unresolved ingress path; the bridge does not invent combat rules, weapon semantics, or work-specific health behavior.

## Input and click ABI

The backend forwards recovered `game-net.input.events` packets only when the explicit Script Runtime bridge is enabled. The server Runtime applies the exact captured input bit assignments for ACTION0, ACTION1, JUMP, WALK, CROUCH, RUN, DOUBLE_JUMP, and FLY. Before reconstructing events it applies the historical ScriptShell permission mask from `GamePlayer.enableAction0`, `enableAction1`, `enableJump`, `enableDoubleJump`, and `enableCrouch`, and updates the declared `action0Button`, `action1Button`, `jumpButton`, `walkButton`, and `crouchButton` state. It then reconstructs the declared `GameInputEvent` raycast fields and dispatches press/release to both `world` and the player. ACTION0/ACTION1 presses that hit an authoritatively bound entity additionally create the declared `GameClickEvent` fields (`tick`, `entity`, `clicker`, `button`, `distance`, `clickerPosition`, and `raycast`) and dispatch the same event object first to `world.onClick`, then to the clicked entity's `onClick`, matching the recovered ScriptShell order. Public Player flags are not yet written back to the browser client, so disabling an input is currently authoritative at server event dispatch rather than at client control generation.

Static hit resolution is intentionally not guessed from project IDs. The backend emits its actual legacy/projection `entityId` bindings, and the Script Runtime binds those to imported source IDs or entity indexes. Editor runtime packages may append mesh bootstrap entries only when the capture contains the project node, mesh asset hash, model metadata, secondary model body, and matching bounds. Entities missing any part of that evidence remain explicitly unmapped. Project-package-safe carrier tags are kept separate from captured source tags so server scripts retain the original DAO3 tag values without weakening package validation.

## Event Future ABI

DAO3 event channels and futures are intentionally distinct. Recovered `GameEventChannel<EventType>` accepts only `onX(handler)`; it does not have a listener filter argument. Recovered `GameEventFuture<EventType>` exposes `nextX(filter?)`. The local EventSignal now mirrors historical `ScriptDispatcher`: regular handlers run first, a future whose filter returns false remains pending, a filter exception is reported through the event error path but the current event still resolves that future, and clearing the dispatcher rejects pending futures. World, entity, player, and RemoteChannel `nextX` methods all forward the optional filter without adding work-specific predicates.

## GUI ABI

The server `GameGUI` surface now uses the recovered Player `gui` MuDB protocol end to end. `init`, `show`, `remove`, `getAttribute`, and `setAttribute` allocate a monotonic native handle, serialize the exact recovered fields, wait for the Player's `return` or `throw` response, and reject pending calls when the GUI socket is replaced or disconnected. The browser remains responsible for selector matching and attribute mutation, so the local runtime does not invent DOM-like behavior.

Client `sendMessage` packets are emitted by the backend as a structured loopback event, mapped back to the authoritative RuntimePlayer, and dispatched through `GameGUI.onMessage` with the recovered `{ entity, name, payload }` shape. The `gui.ui` proxy follows the historical `GameGUI.js` factory exactly: it returns `{ name, attributes, children }` without adding local validation or work-specific element names.

## Current bridge boundary

The runtime observes real Player joins and receives opted-in client events through a structured backend log bridge. Outbound events use a random-token, loopback-only HTTP control bridge and are injected into the matching remote-channel MuDB session. The Demo also reconstructs the historical `gameUI` identity required before Player client modules can start.
