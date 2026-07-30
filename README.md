# NEA Project OpenVer

NEA Project OpenVer is a source-available preservation and compatibility project for the discontinued `dao3.fun` game runtime. It is an evidence-first local implementation: preserved packages, Script Runtime behavior, MuDB transport, and the authoritative runtime are kept as separate layers rather than treated as one opaque Player binary.

> **OpenVer scope:** this repository contains publishable implementation code and vetted preservation evidence. Private captures, browser state, credentials, private maps, and personal archives stay local and are never part of the open version.

## Start Here

| Goal | Start with |
| --- | --- |
| Understand the repository | [Repository layout](docs/repository-layout.md) |
| Understand the runtime boundaries | [Runtime architecture](docs/runtime-architecture.md) |
| Work with the open version safely | [Open version policy](docs/open-version.md) |
| Contribute code or evidence | [Contributing](CONTRIBUTING.md) |
| Inspect ABI coverage and known limits | `runtime-compat/generated/gap-report.md` |
| Run the importable demo | `demo-map/` |

## Repository Map

| Path | Purpose |
| --- | --- |
| `demo-map/` | Reference project, map importer, client publication, and local server Script Runtime. |
| `runtime-compat/` | Machine-readable API/ABI catalogs, evidence generators, compatibility reports, and conformance fixtures. |
| `local-player/` | Recovered Player hosting, compatibility backend, launch tools, and Player-side adapters. |
| `preservation-dump/` | Bounded capture/export tooling. Its private output remains under ignored paths. |
| `works/` | Public work catalog; recovered/private work sources remain ignored. |
| `dao3-docs-mirror/`, `origin/`, `mudb/`, `dump/` | Vetted documentation, transport, bundle, and historical evidence. They are inputs to compatibility conclusions, not replacement application architecture. |
| `docs/` | Repository-wide governance, layout, and architecture documentation. |
| `tools/` | Small maintenance helpers, including the required patch wrapper. |

## Architecture

The executable path is deliberately layered:

```text
Project package
  -> Client Script Runtime / Server Script Runtime
  -> MuDB transport
  -> Authoritative Game Runtime
  -> Preserved Player browser client
```

Compatibility conclusions are generated from local declarations, historical bundles, preserved runtime behavior, capture metadata, and real script usage. When evidence is absent, the project records an explicit gap instead of synthesizing an API.

## Quick Start

Prerequisites: a supported Node.js runtime and the tracked repository assets.

```powershell
npm --prefix demo-map start
```

The default demo is then available at:

```text
http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008
```

For repository validation, run the documented package commands when you are ready:

```powershell
npm --prefix runtime-compat run build
npm --prefix runtime-compat test
npm --prefix demo-map run build
npm --prefix demo-map test
```

## Current Compatibility Posture

- Client and server Script Runtimes are separate execution realms with declared transport boundaries.
- The current local ABI and compatibility classifications are generated under `runtime-compat/abi/` and `runtime-compat/generated/`.
- Runtime-created entities can project only through captured, validated mesh bindings; unknown meshes remain script-local rather than receiving fabricated geometry.
- Historical posture body-shape values that have no local evidence remain `null`; the runtime preserves the current collider instead of guessing dimensions.

## Community

- GitHub open-version repository: <https://github.com/ForgottenArch/NEA-Project-OpenVer>
- QQ group ? **???? - dao4.fun ??????**: <https://qm.qq.com/q/Mixf3L5xeO>

Please do not post browser profiles, cookies, credentials, token-bearing URLs, private maps, or private captures in issues, pull requests, or the group.

## License

This repository is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE.md). Commercial use is not permitted under that license.
