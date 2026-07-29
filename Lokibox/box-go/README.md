# Box-GO

Box-GO is the low-level Box3 (dao3.fun) mudb protocol toolkit. It is used to
inspect, decode, proxy, and locally test the game's WebSocket protocol. It is
not the LokiBox userscript and it does not provide a standalone game server.

To install dependencies:

```bash
bun install
```

Show commands:

```bash
bun run start
```

Useful commands:

```bash
bun run proxy          # local protocol logging proxy on port 8080
bun run connect        # mudb client connection
bun run listen         # raw binary frame decoder
bun run raw            # raw traffic dump
bun run test:protocol  # local in-memory client/server test
bun run typecheck      # TypeScript validation
```

## Browser capture helper

Install `capture-userscript/box-go-capture.user.js` in Tampermonkey, then open
the target `dao3.fun/play/*` page. The local panel records independently
numbered WebSocket connections, ordered text/binary frames, lifecycle events,
errors, and browser resource metadata. Use `Export` before closing the page.
Captures stay in memory until explicitly downloaded; this script does not
upload data. URLs and textual credentials are redacted automatically, but raw
binary frames may still contain authentication data and must be kept private
until reviewed.

The panel is mounted only after its page or iframe opens a WebSocket. If more
than one panel appears, export each one: cross-origin frames have separate
capture sessions.

The direct connection tools currently contain sample session/server values for
protocol research. Set these variables before connecting:

```powershell
$env:BOX3_SESSION = "your-session-id"
$env:BOX3_WS_URL = "wss://host:port"
$env:BOX3_REAL_SERVER_URL = "wss://host:port" # proxy target, optional
$env:BOX3_PROXY_PORT = "8080"                  # optional
```

Do not commit live session IDs.

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
