# Cold Start Guide

This guide starts the complete public runtime from a clean checkout. It does not use private captures, derived map packages, browser profiles, credentials, or files under ignored private workspaces.

## 1. Prerequisites

- Windows PowerShell, PowerShell 7, or another shell capable of running Node.js commands.
- Node.js available as `node` and npm available as `npm`.
- A complete checkout containing `demo-map/`, `local-player/`, and `runtime-compat/`.

Confirm the tools:

```powershell
node --version
npm --version
```

The public OpenVer checkout can be cloned with:

```powershell
git clone https://github.com/ForgottenArch/NEA-Project-OpenVer.git
cd NEA-Project-OpenVer
```

Team development against the full repository uses the `Beta` branch:

```powershell
git clone --branch Beta https://github.com/ForgottenArch/NEA-Project.git
cd NEA-Project
```

## 2. Confirm a Cold Start

The default runtime uses TCP ports `4322` and `4323`. Check that no old process owns them:

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object LocalPort -in 4322,4323
```

If an earlier NEA process is still running, return to its terminal and press `Ctrl+C`. Do not terminate an unknown process solely because it uses the same port; inspect it first:

```powershell
Get-CimInstance Win32_Process |
  Where-Object ProcessId -in (Get-NetTCPConnection -State Listen |
    Where-Object LocalPort -in 4322,4323).OwningProcess |
  Select-Object ProcessId,CommandLine
```

## 3. Start the Complete Runtime

Run this command from the repository root:

```powershell
npm --prefix demo-map start
```

Keep that terminal open. The command starts these separate layers together:

1. Project importer and Capability Manifest launch gate.
2. Server Script Runtime.
3. Authoritative runtime/control bridge.
4. Player compatibility backend and MuDB transports.
5. Published client script and UI package.

Do not start `local-player/backend/box3-server.cjs` directly for normal play. That command starts only the Player/backend layer and omits the Server Script Runtime orchestration.

## 4. Expected Output

A successful cold start includes lines similar to:

```text
[demo] Script Runtime started for demo project
[demo] Player: http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008
[player] muwebsocket server listening: ... port 4322
[player] [nea-control] listening on 127.0.0.1:4323
```

Open the exact `[demo] Player:` URL printed by the launcher. For the tracked reference project it is currently:

```text
http://127.0.0.1:4322/play/nea-script-lab?contentId=100110008
```

Launcher output is authoritative for imported runtime packages; do not reuse an old route from another run.

## 5. Compatibility Warnings

The startup log may report `project uses partial compatibility surfaces`. This is informational when the runtime continues and prints the Player URL. A partial surface has an executable local binding but retains a documented native-behavior gap.

`Project launch blocked by unavailable capabilities` is different: the process exits because the project requires a capability with no safe local implementation or because static analysis cannot prove the dependency. Read the listed `side:module:usage` entries and the generated project capability manifest before changing the gate. Do not bypass the gate or fabricate an API.

## 6. Common Failures

### `EADDRINUSE` on port 4322 or 4323

An older runtime is still active. Inspect the owning command as shown in section 2, stop only the confirmed old NEA process, and rerun the standard start command.

### Page opens but scripts do not run

Check the terminal command. If only `box3-server.cjs` is running, stop it and use:

```powershell
npm --prefix demo-map start
```

The Player HTML alone does not prove that the Server Script Runtime is running.

### Capability Manifest blocks inherited UI members

Update to a revision containing the UI owner-inheritance fix. `UiText`, `UiInput`, `UiBox`, `UiImage`, and `UiScrollBox` inherit their declared `UiRenderable` and `UiNode` members; fields such as `anchor`, `position`, and `size` must not be reported as unknown script APIs.

### WebSocket `/ws` returns 404 in a normal browser request

The `/ws` endpoint requires a WebSocket upgrade. A plain HTTP GET returning 404 does not mean the MuDB WebSocket listener is broken. Verify the startup log and load the Player route instead.

## 7. Stop the Runtime

In the terminal running npm, press:

```text
Ctrl+C
```

Wait for both ports to close before starting another instance. The launcher owns the child backend and should shut the complete chain down together.
