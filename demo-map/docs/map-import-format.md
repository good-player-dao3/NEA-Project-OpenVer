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
- `scripts.server`: trusted local server script.
- `scripts.client`: optional historical Player client module.
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

## Import output

`npm run build` writes `.nea/build/project` with:

- `dao3.project.json`
- `world/world.json`
- `world/terrain.json`
- `world/entities.json`
- `world/physics.json`
- `assets/index.json`
- `scripts/manifest.json`
- `scripts/server.js`

The current format deliberately keeps binary assets out of the first Demo. Asset hashing and exported-map migration are the next compatibility layer.
