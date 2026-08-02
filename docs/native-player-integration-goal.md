# Native Player Integration Goal

## Objective

The project delivers an evidence-backed local compatibility path in which the preserved Player browser client runs recovered map packages through a local backend. The target path is:

```text
Recovered project package
  -> Client Script Runtime / Server Script Runtime
  -> MuDB transport
  -> Authoritative runtime
  -> Preserved Player browser client
```

The local implementation may adapt a recovered contract only where direct evidence and a focused conformance fixture justify the adaptation. It must not replace the preserved Player with a new frontend or treat a custom Demo as proof of native recovered-map support.

## Product Boundary

The primary deliverable is native project admission into the preserved Player path:

1. Import a recovered project descriptor and package only the fields whose value encodings are evidenced.
2. Serve the bootstrap, resource, terrain, entity, UI, script, and transport contracts required by the preserved Player.
3. Run recovered client and server scripts in separate local Script Runtimes with explicit transport boundaries.
4. Report unsupported or unknown behavior as `partial` or `evidence-blocked` instead of substituting invented values or a new client contract.

The reference Demo is a conformance fixture. It may validate one integration edge at a time, but it is not the product target and must not become a map-specific compatibility branch.

## Delivery Order

Work proceeds from the Player admission boundary inward:

1. Verify project package and bootstrap admission into the Player backend.
2. Map one recovered project field encoding into the public import package with a focused fixture.
3. Verify the corresponding Player protocol or resource delivery path.
4. Verify the client/server Script Runtime behavior that consumes the imported field.
5. Add a sanitized real-map smoke fixture only after the preceding contract is executable.

Each task must identify exactly one edge in the target path and include direct evidence, acceptance criteria, and a focused validation command.

## Non-Goals

- A replacement browser client.
- Demo-only gameplay features without an integration-contract purpose.
- Broad historical API completion without a recovered map or script need.
- Guessing voxel chunk, entity tree, UI, physics, environment, asset, or protocol value encodings.
- Declaring native map compatibility because the Player shell renders a custom map.

## Evidence Rule

Field presence alone proves only that a field exists. It does not prove the encoding, semantics, lifecycle, or transport contract of its values. The importer must preflight such fields and retain an `evidence-blocked` result until a sanitized inventory, reviewed fixture, or executable conformance case proves the next conversion step.
