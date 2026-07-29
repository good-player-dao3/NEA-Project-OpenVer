# NEA Script Runtime 0.1

The Demo runtime executes trusted local server scripts in a Node `vm` context without `process`, `require`, dynamic code generation, or WebAssembly. It is a compatibility prototype, not yet a hardened hostile-code sandbox.

The project format binds `server.js` and `client.js` to separate contracts and separate capability lists. Server capabilities gate the Node VM globals below. Client capabilities are published with `clientIndex.js` for Player-side negotiation and are never treated as server grants.

The Demo client requests `client.core`, `client.ui`, and `client.remote-channel`. Its `client.js` creates a historical Player `UiText` status panel and updates it from server events, making the independent SES client Runtime visible in-game rather than only through console logs.

## Globals

- `world`: tick, player lifecycle, voxel/general contact, trigger enter/leave, chat, entity creation, and tag queries.
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

## Physics model

Player positions represent the rigid-body center. Each server player receives an explicit initial collision profile containing origin status, size status, broadphase bounds and shape half extents; no solver default silently supplies a body size. The recovered upright Player default is `0.45 / 1.1 / 0.45`. Network PUBLIC bodies populate `rx/ry/rz` from `boundsHalfExtents` and `hsx/hsy/hsz` from `shapeHalfExtents`. A complete authoritative pair replaces the current collider, while an explicitly unknown posture shape (`null`) preserves it and a partial pair is rejected. This is a local compatibility policy, not a claim that crouch or flying historically used the standing size. Candidate lookup uses bounds while actual contacts and triggers use shape. Player snapshots expose both sets, `collision.shapeSource`, `collision.aabb`, and `collision.shapeAabb`. Mutations such as `player.applyImpulse()` and `player.damage()` require `server.player.write`.

`runtime.snapshot().physics` exposes sweep, chunk-query, candidate, trigger-query, chunk, collider, and trigger counts for diagnostics. The model runs at the project tick rate (20 Hz in the Demo). It remains a server Script Runtime model and does not overwrite the historical Player motor every frame.

## Authoritative Player state

Players created from real MuDB sessions use `authority: "backend"`. Their position, velocity, `bodyHalfExtents`, and `bodyShapeHalfExtents` are polled from the compatibility backend's existing `AuthoritativeGameRuntime`; local physics observes contacts and triggers without applying a second gravity/movement simulation. Script writes to `player.position`, `player.velocity`, or `player.applyImpulse()` are optimistically reflected, protected by a short write barrier, and queued back through the backend's existing transform command path. Runtime-only test players continue to use the local fixed-step physics owner.

## Current bridge boundary

The runtime observes real Player joins and receives opted-in client events through a structured backend log bridge. Outbound events use a random-token, loopback-only HTTP control bridge and are injected into the matching remote-channel MuDB session. The Demo also reconstructs the historical `gameUI` identity required before Player client modules can start.
