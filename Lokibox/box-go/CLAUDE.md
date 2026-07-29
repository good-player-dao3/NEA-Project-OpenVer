# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

mudb protocol analysis toolkit for Code Island (神奇代码岛, dao3.fun). Reverse-engineers the game's real-time networking protocol to enable game preservation and community servers, as the game may shut down Sept 2026.

## Architecture

### Files

| File | Purpose |
|------|---------|
| `protocol.ts` | All 20 mudb protocol schema definitions — gameNet, gameTerrain, gameChat, dialog, gameUI, etc. Exports named constants per protocol. |
| `custom-schema.ts` | Custom serialization types: MuQuantizedVec3, MuQuantizedVec2, MuCubeAxis, MuFloat32Vec3 |
| `proxy.ts` | WebSocket proxy — forwards traffic between game client and real server, decodes typed mudb messages live |
| `connect.ts` | Direct mudb client connection (MuWebSocket + MuClient, skipProtocolValidation=true) |
| `test-client.ts` | Local MuLocalSocket client-server for protocol testing |
| `listen.ts` | Raw WebSocket binary frame decoder |
| `dump-schema.js` | Browser console script to extract schema definitions from running game client |

### Message ID Assignment

mudb assigns message IDs per protocol registration order, with keys sorted alphabetically and a `+1` raw slot at each protocol's end.

- `schema.client` = server→client messages (what the client receives) — **this is what the parser uses**
- `schema.server` = client→server messages (what the client sends)
- Each protocol gets N typed IDs + 1 raw ID, sequentially across all 20 protocols
- Total ID space: 78 (0-77)

### Custom Schema Types

The game extends mudb:
- `MuQuantizedVec3(precision, identity?)` — 3D vector, quantized, delta-varint with Schroeppel2 (0xAAAAAAAA) encoding
- `MuQuantizedVec2(precision, identity?)` — 2D vector, same encoding
- `MuCubeAxis()` — Block face normal enum (0-5), serialized as uint8, identity is vec3
- `MuFloat32Vec3` — Plain Float32[3], bitmask diff

### Running

```bash
bun run proxy.ts          # Start WebSocket proxy on :8080
bun run connect.ts        # Direct mudb client connection
bun run test-client.ts    # Local client-server test
bun run listen.ts         # Raw WebSocket listener
```

To route game traffic through proxy, use a Tampermonkey script that replaces WebSocket URLs:
```javascript
WebSocket = function(url, ...args) {
  if (typeof url === 'string' && url.includes('wss://') && url.includes('.box3.ink')) {
    url = url.replace(/wss:\/\/[^/]+/, 'ws://localhost:8080');
  }
  return new OrigWS(url, ...args);
};
```

### Protocol Analysis

- Check actual received messages: `window.__mudb.client.bandwidth[i]['BOX3'].received`
- Raw messages (ID per protocol's +1 slot) are high-frequency state sync, suppressed in proxy output
- chunkResponse boxes: `{block, faces, minX, minY, minZ, maxX, maxY, maxZ}` — RLE voxel runs
- Unknown msgIds > 77 may indicate protocols not yet captured

## Dependencies

Uses mudb v1.0.1 from npm. Bun runtime.
