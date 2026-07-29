# NEA Runtime Compatibility

This subproject separates historical declarations, recovered evidence and current compatibility code for the client Script Runtime, server Script Runtime, MuDB transport and physics profiles.

## Commands

```powershell
npm run build
npm test
```

`npm run build` regenerates:

- `generated/docs-api-index.json` from the local developer documentation mirror.
- `generated/origin-server-api.json` from the local origin API classes and ScriptShell globals.
- `generated/player-client-script-runtime-analysis.json` from the archived Player SES client runtime and wrapper bindings.
- `generated/local-server-runtime-analysis.json` and `abi/server-adapter-map.json` from the local Server Runtime, with exact versus partial canonical mappings kept separate.
- `abi/protocols.json` from the recovered Player and ScriptShell MuDB schemas, including conformance metadata where available.
- `abi/current-runtime.json` from executable Player and local Server Runtime analysis instead of a hand-maintained subset.
- `abi/runtime-contracts.json` with the five runtime layers, versioned contracts, side-qualified capabilities and resolved Demo bindings.
- `abi/client-runtime.json` and `abi/server-runtime.json` by merging declarations, recovered symbols and current implementation evidence.
- `generated/gap-report.json` and `generated/gap-report.md` without treating declarations as implementations.

## Status Meanings

- `declared`: present in documentation only.
- `confirmed`: directly present in Player, origin, protocol or local implementation evidence.
- `native`: executed by the archived historical runtime.
- `bridged`: translated across the local transport/backend boundary.
- `emulated`: implemented locally without complete historical conformance.
- `missing`: no compatible implementation is currently registered.

The player body ABI is `partial`: body-center coordinates and the upright default half extents `0.45 / 1.1 / 0.45` are confirmed from the archived Player bundle and corroborated by Lokibox field mappings. Server-authoritative crouch and flying shape mutations remain unresolved.

The Demo binds `client.js` and `server.js` to separate runtime contracts and capability lists. A capability confirmed on one side never grants an API on the other side.
