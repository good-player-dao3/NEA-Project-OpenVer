import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { formatImportSummary, importMapProject, publishClientScript } from "./import-project.mjs";
import { parseBackendEvent } from "./backend-events.mjs";
import { getPlayerStateFromBackend, queuePlayerStateToBackend, sendClientEventToBackend } from "./control-client.mjs";
import { ScriptRuntime } from "./runtime/script-runtime.mjs";

const demoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = resolve(demoRoot, "..");
const sourceRoot = resolve(demoRoot, "project");
const buildRoot = resolve(demoRoot, "build", "project");
const assetRoot = resolve(repositoryRoot, "local-player", "archive");
const backendPath = resolve(repositoryRoot, "local-player", "backend", "box3-server.cjs");
const port = integerEnv("NEA_DEMO_PORT", 4322);
const controlPort = integerEnv("NEA_DEMO_CONTROL_PORT", port + 1);
const controlToken = process.env.NEA_DEMO_CONTROL_TOKEN ?? randomBytes(32).toString("hex");
const sessionPlayers = new Map();
const playerSessions = new Map();

const imported = await importMapProject(sourceRoot, buildRoot);
const clientManifest = await publishClientScript(imported, assetRoot);
const runtime = await ScriptRuntime.load(buildRoot, {
  logger: runtimeLogger(),
  sendClientEvent: async (playerId, event) => {
    const session = playerSessions.get(playerId);
    if (!session) throw new Error(`No backend session is bound to ${playerId}`);
    await sendClientEventToBackend({ port: controlPort, token: controlToken, session, event });
  },
  writePlayerState: async (playerId, state) => {
    const session = playerSessions.get(playerId);
    if (!session) throw new Error(`No backend session is bound to ${playerId}`);
    await queuePlayerStateToBackend({ port: controlPort, token: controlToken, session, state });
  },
});
await runtime.start();
console.log(`[demo] ${formatImportSummary(imported)}`);
console.log(`[demo] Script Runtime started at ${imported.manifest.runtime.tickRate} ticks/s`);

const child = spawn(process.execPath, [backendPath], {
  cwd: resolve(repositoryRoot, "local-player"),
  env: {
    ...process.env,
    BOX3_PORT: String(port),
    BOX3_ASSET_ROOT: assetRoot,
    BOX3_PROJECT_ROOT: buildRoot,
    BOX3_WORLD_MANIFEST: "world-bedwars.json",
    BOX3_LOG_REMOTE_EVENTS: "1",
    BOX3_LOG_NET_EVENTS: "1",
    BOX3_MINIMAL_GAME_UI: "1",
    BOX3_CONTROL_PORT: String(controlPort),
    BOX3_CONTROL_TOKEN: controlToken,
    BOX3_PLAYER_BODY_PROFILE: JSON.stringify({
      profileId: imported.physics.playerBody.profileId,
      origin: imported.physics.playerBody.origin,
      originStatus: imported.physics.playerBody.originStatus,
      sizeStatus: imported.physics.playerBody.sizeStatus,
      boundsHalfExtents: [
        imported.physics.playerBody.boundsHalfExtents.x,
        imported.physics.playerBody.boundsHalfExtents.y,
        imported.physics.playerBody.boundsHalfExtents.z,
      ],
      shapeHalfExtents: [
        imported.physics.playerBody.shapeHalfExtents.x,
        imported.physics.playerBody.shapeHalfExtents.y,
        imported.physics.playerBody.shapeHalfExtents.z,
      ],
    }),
    BOX3_ENABLE_REMOTE_SESSIONS: "1",
    ...(clientManifest === null ? {} : { BOX3_CLIENT_SCRIPT_MANIFEST: clientManifest }),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

pipeBackend(child.stdout, process.stdout, line => {
  let backendEvent;
  try {
    backendEvent = parseBackendEvent(line);
  } catch (error) {
    console.warn(`[demo] rejected backend event: ${error instanceof Error ? error.message : error}`);
    return;
  }
  if (backendEvent?.type === "player-join") {
    if (sessionPlayers.has(backendEvent.sessionLabel)) return;
    const playerId = `player-${sessionPlayers.size + 1}`;
    sessionPlayers.set(backendEvent.sessionLabel, playerId);
    playerSessions.set(playerId, backendEvent.sessionLabel);
    const player = runtime.addPlayer({
      id: playerId,
      name: "Guest",
      position: imported.manifest.world.spawn,
      authority: "backend",
    });
  }
  if (backendEvent?.type === "player-leave") {
    const playerId = sessionPlayers.get(backendEvent.sessionLabel);
    if (!playerId) return;
    runtime.removePlayer(playerId);
    sessionPlayers.delete(backendEvent.sessionLabel);
    playerSessions.delete(playerId);
  }
  if (backendEvent?.type === "client-event") {
    const playerId = sessionPlayers.get(backendEvent.sessionLabel) ?? [...sessionPlayers.values()][0];
    if (!playerId) return;
    runtime.dispatchClientEvent(playerId, backendEvent.event);
  }
});
pipeBackend(child.stderr, process.stderr);

child.once("spawn", () => {
  console.log(`[demo] Player: http://127.0.0.1:${port}/play/nea-script-lab?contentId=100110008`);
});
child.once("exit", (code, signal) => {
  runtime.stop();
  if (!stopping) {
    console.error(`[demo] Player backend exited (${signal ?? code ?? "unknown"})`);
    process.exitCode = code ?? 1;
  }
});

let stopping = false;
let stateSyncRunning = false;
const stateSyncInterval = setInterval(async () => {
  if (stateSyncRunning || stopping) return;
  stateSyncRunning = true;
  try {
    await Promise.all([...sessionPlayers].map(async ([session, playerId]) => {
      try {
        const state = await getPlayerStateFromBackend({ port: controlPort, token: controlToken, session });
        runtime.applyAuthoritativeState(playerId, state);
      } catch (error) {
        if (!String(error).includes("player state not found")) console.warn(`[demo] state sync failed for ${session}: ${error}`);
      }
    }));
  } finally {
    stateSyncRunning = false;
  }
}, 50);
stateSyncInterval.unref?.();
async function stop() {
  if (stopping) return;
  stopping = true;
  clearInterval(stateSyncInterval);
  runtime.stop();
  if (!child.killed) child.kill("SIGTERM");
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);

function pipeBackend(stream, destination, onLine = () => {}) {
  const lines = createInterface({ input: stream });
  lines.on("line", line => {
    destination.write(`[player] ${line}\n`);
    onLine(line);
  });
}

function runtimeLogger() {
  return {
    info: message => console.log(message),
    warn: message => console.warn(message),
    error: message => console.error(message),
  };
}

function integerEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 65535) throw new Error(`${name} must be a valid TCP port`);
  return number;
}
