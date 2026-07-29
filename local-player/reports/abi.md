# NEA Compatibility ABI Inventory

## Summary

- API documentation files: 105
- Runtime globals: 14
- Runtime classes: 22
- Documented methods: 263
- Documented properties: 223
- Documented events: 29
- Protocol declarations: 19
- Cached HTTP responses: 300
- Recovered binary assets: 352

## Runtime Globals

- `http`
- `input`
- `media`
- `navigator`
- `remoteChannel`
- `resources`
- `rtc`
- `screen`
- `screenHeight`
- `screenWidth`
- `storage`
- `ui`
- `voxels`
- `world`

## Protocol Declarations

- `admin`
- `dialog`
- `entityInteract`
- `gameChat`
- `gameClock`
- `gameNet`
- `gameTerrain`
- `gui`
- `input`
- `market`
- `models`
- `navigator`
- `netLog`
- `playerProtocol`
- `ref`
- `remoteChannel`
- `rtc`
- `sound`
- `teleport`

## Blocking Gaps

- The cross-origin view.dao3.fun player bundle is not present as a standalone recovered response.
- No complete exported map package or terrain/entity/UI snapshot is present.
- No offline room bootstrap replaces code-api-pc.dao3.fun/websocket/server.
- The captured WebSocket session is not a deterministic replay fixture.

The machine-readable method, property, endpoint, bundle-global, and message type inventories are stored in `abi.json`.
