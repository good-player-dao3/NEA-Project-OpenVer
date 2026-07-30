# Runtime Architecture

NEA Project OpenVer preserves a layered compatibility model. The layers are intentionally distinct because the archived Player client is evidence and a rendering/transport consumer, not proof of a complete server implementation.

```text
Importable project package
  ?? client scripts -> Client Script Runtime
  ?? server scripts -> Server Script Runtime
                       |
                       v
                  MuDB transport
                       |
                       v
             Authoritative Game Runtime
                       |
                       v
           Preserved Player browser client
```

## Ownership

| Layer | Primary location | Responsibility |
| --- | --- | --- |
| Project package | `demo-map/`, imported packages | Maps, script manifests, and project-owned content. |
| Client Script Runtime | `demo-map/` and published client assets | Documented client-side script surface and UI/event bridge. |
| Server Script Runtime | `demo-map/src/runtime/` | Script globals, world/entity APIs, lifecycle events, and compatibility wrappers. |
| MuDB transport | `mudb/`, `local-player/`, `runtime-compat/abi/` | Recovered protocol schemas and browser/server transport evidence. |
| Authoritative Game Runtime | `local-player/backend/` plus control bridge | Player/entity state, retained replica data, and browser-facing projection. |

## Evidence Rules

An API surface may be declared before its engine behavior is recovered. The project therefore distinguishes an executable local adapter from a historical declaration and records known gaps in the generated compatibility matrix.

Use these artifacts together:

- `runtime-compat/abi/current-runtime.json` for executable ABI entries.
- `runtime-compat/abi/compatibility-matrix.json` for canonical coverage/status.
- `runtime-compat/generated/gap-report.md` for human-readable priorities.
- `runtime-compat/generated/script-corpus-gap-report.md` for real script usage pressure.
- `runtime-compat/generated/capability-gate-audit.md` for the conservative `ready` / `partial` / `blocked` launch classification of every anonymous corpus API requirement, including capability grants and executable binding evidence.

Unknown behavior stays absent or evidence-deferred; it must not be replaced with a plausible approximation and presented as native DAO3 behavior.

## Platform target

The compatibility target is the documented and locally recovered DAO3 project/runtime contract, not a selected preserved work. Captured maps are conformance corpora and import fixtures: they may prioritize missing APIs, but executable behavior must be implemented at the shared project package, Script Runtime, transport, authoritative runtime, or Player layer. Work names, private event types, private asset identities, and map-specific rules must never become runtime branches.

A project is considered playable only when its package fields, server scripts, client scripts, resources, UI, transport requirements, and authoritative state dependencies are either implemented through the shared ABI or reported as explicit unsupported capabilities before launch. Successful startup of one captured map is evidence for those exercised contracts, not completion of platform compatibility.

The project package therefore carries a generated capability manifest. It is a launch contract between the importer and runtime layers, not a replacement for either Script Runtime: it records statically visible API, module, UI, entity, player, and resource requirements, while the Runtime continues enforcing capabilities at call time. Static uncertainty is preserved as a diagnostic or block instead of silently widening the execution environment.

Captured runtime packages also carry explicit archive-relative Player runtime and bootstrap manifest paths. The package builder discovers compatible templates by manifest format and relocates them beneath the generated package identity; the backend receives those paths through environment configuration. Legacy fixed paths remain fallback defaults for the preserved standalone archive, but generated projects never require a selected work name in runtime code.

`NEA_RUNTIME_PACKAGE` is validated as a launch descriptor before any runtime layer starts. Its package identity, launcher route, decimal content ID, and relative JSON manifest paths form one consistency boundary. Missing dynamic Player runtime/bootstrap paths or traversal-shaped paths block launch; they never trigger an implicit compatibility claim based on whichever preserved archive happens to be installed.

Client capability grants for recovered packages are selected from confirmed public bindings in the current Runtime ABI. Runtime-internal script delivery is excluded, and grants are kept separate from compatibility: a granted member may still be partial when its evidence-backed behavior is incomplete. This avoids both stale under-granting and the false claim that permission implies semantic completeness.

Capability Manifest v5 also records the cross-layer flows a project actually requires. Client modules require the recovered `player.game-net.syncClientScriptModules` delivery flow; RemoteChannel calls require their direction-specific MuDB flow; and evidenced player transform/respawn writes require the confirmed authoritative player-state bridge plus body-profile contract. Canonical members with multiple local bindings select the adapter matching the statically inferred owner, while access mode distinguishes reads from writes and calls. These dependencies contribute to the same ready/partial/blocked launch decision. Property reads, unrelated player extensions, and entity control endpoints are not mislabeled as player-state flow because no such equivalence exists in the contract evidence.

An ABI entry may be `unavailable` only when direct provider evidence proves that scripts cannot access it. This differs from `declared-only`, where implementation evidence is simply absent. The selected archived Player's `UiInput.placeholderOpacity` is the first such entry: the renderable owns the state, module 21031 omits the public getter, and module 93474 hardens the constructor, preventing delivered project scripts from installing a compatible wrapper. The launch gate reports this exact blocker rather than treating the internal field as a public API.

Server terrain access is a separate capability boundary. `server.world.voxels` gates every script-facing member of the `voxels` facade and the recovered `world.size` projection at both manifest-analysis time and runtime access time. Internal physics and authoritative terrain code retain the raw `GameVoxelsRuntime`; only the Server Script Runtime global is wrapped, so terrain authorization is not conflated with entity queries or backend implementation layers.

The same facade pattern gates documented GameGUI members with `server.gui`, while unknown GUI properties remain ordinary JavaScript project state. Capability Manifest analysis builds a project-wide set of statically assigned `world.*` and `gui.*` surfaces before classifying module reads and calls. These entries are emitted as `script-owned`; they neither claim DAO3 compatibility nor block launch merely because a map uses globals as its shared state namespace.

GameStorage is isolated behind `server.storage`. The Server Script Runtime exposes a guarded facade while retaining the raw `LocalGameStorage` provider internally. Authorization and compatibility remain separate: a grant permits access, but `getGroupStorage()` remains partial because the default local provider has no evidence-backed cross-map namespace and deliberately returns `undefined` rather than aliasing it to single-map storage.

World configuration uses an attribute-level `server.world.config` boundary rather than guarding the entire shared `world` namespace. Only the recovered `gravity`, `airFriction`, and `fogColor` properties are protected; map-owned state remains ordinary script data. The binding remains partial after authorization because local value assignment is not evidence that the authoritative solver or every connected Player environment consumed the change.

Client module transport depends on package structure, not source truthiness. No declared client modules means no client-module-delivery flow. A declared module remains a transport dependency even when its UTF-8 source is empty, matching the recovered `syncClientScriptModules` dictionary contract and preventing analysis helpers from inventing a phantom `client.js` for server-only projects.

GameGUI is also transport-dependent. A project requirement carrying `server.gui` adds the `gui-command` flow over `player.gui`, covering handle-based init/show/remove/get/set commands and the return/throw/sendMessage responses proven by the protocol schema and local backend transport. Project-owned `gui.*` fields remain local JavaScript state and do not create a MuDB dependency.
