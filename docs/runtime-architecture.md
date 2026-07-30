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

Unknown behavior stays absent or evidence-deferred; it must not be replaced with a plausible approximation and presented as native DAO3 behavior.
