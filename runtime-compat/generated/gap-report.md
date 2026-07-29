# Runtime Compatibility Gap Report

Generated: 2026-07-29T08:25:35.640Z

## Summary

- Documentation declarations: 599
- Current contract entries: 205
- Recovered compatible entries: 168
- Identifier/canonical matches: 177
- Documented declarations still missing: 422
- Local extensions not joined to documentation: 47
- Native: 125
- Compatible: 32
- Partial: 20
- Recovered only: 185
- Declared only: 237

## By Runtime Side

- client: 125/126 represented; 1 missing
- server: 21/346 represented; 325 missing
- shared: 31/127 represented; 96 missing

## Recovery vs Implementation

- Client confirmed/native: 129
- Client declared/missing: 1
- Server confirmed but unimplemented: 656
- Server confirmed/bridged: 3
- Server confirmed/emulated: 34

## Interpretation

- Native, compatible and partial matrix states are executable classifications; partial still records unresolved behavioral gaps.
- Documentation declarations remain missing until Player/origin evidence and conformance tests prove compatibility.
- The upright Player default collision dimensions are recovered; crouch and flying historical shapes are explicit null fields with a non-historical preserve-current-collider compatibility policy.
- Per-contact fx/fy/fz production is recovered from the historical impulse solver; only the GameEntity.contactForce aggregate and local solver integration remain unresolved.

## Evidence Gaps

- Player posture producer: not-found-in-indexed-local-evidence
- Player posture representation: evidence-deferred
- Unknown posture wire fields: rx, ry, rz, hsx, hsy, hsz
- Unknown posture policy: preserve-current-collider; historical claim=false
- Blocking current phase: false
- Posture frame corpus: not-found-in-safe-local-frame-corpus
- Captured binary traffic: 1864 client-to-server; 0 server-to-client
- Indexed source sets: origin-server-runtime, lokibox-runtime-adapters, local-player-backend, archived-player-bundle, player-browser-profile, legacy-worktree, posture-delta-frame-corpus
- ContactBinding: reference-only
- Per-contact force: confirmed-historical-production-local-missing
- Aggregate contactForce: unresolved

## Deferred Evidence

- player-posture-authoritative-shapes: not-found-in-indexed-local-evidence; blocking=false

## Immediate Priorities

1. Recover ContactBinding or equivalent server source to determine GameEntity.contactForce aggregation and active contact object reuse.
2. Integrate the recovered per-contact impulse force formula only with a compatible authoritative solver, not the current sweep approximation.
3. Bind recovered origin GameEntity and GamePlayer surfaces to server runtime adapters only after behavior matches.
4. Resolve the remaining client UiInput.placeholderOpacity wrapper or retain it as explicitly unavailable.
