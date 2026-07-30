import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { formatImportSummary, importMapProject, publishClientScript } from "./import-project.mjs";
import { parseBackendEvent } from "./backend-events.mjs";
import { getPlayerStateFromBackend, openDialogOnBackend, queuePlayerStateToBackend, sendClientEventToBackend, sendGuiCommandToBackend } from "./control-client.mjs";
import { ScriptRuntime } from "./runtime/script-runtime.mjs";
import { loadPreservedBlockCatalog } from "../../local-player/src/block-info.mjs";

process.on("unhandledRejection", error => {
  console.error(`[demo] unhandled script rejection: ${formatExternalError(error)}`);
});

const demoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = resolve(demoRoot, "..");
const sourceRoot = resolve(demoRoot, "project");
const defaultBuildRoot = resolve(demoRoot, "build", "project");
const defaultAssetRoot = resolve(repositoryRoot, "local-player", "archive");
const backendPath = resolve(repositoryRoot, "local-player", "backend", "box3-server.cjs");
const port = integerEnv("NEA_DEMO_PORT", 4322);
const controlPort = integerEnv("NEA_DEMO_CONTROL_PORT", port + 1);
const controlToken = process.env.NEA_DEMO_CONTROL_TOKEN ?? randomBytes(32).toString("hex");
const runtimePackagePath = process.env.NEA_RUNTIME_PACKAGE;
const sessionPlayers = new Map();
const playerSessions = new Map();

let imported = null;
let buildRoot = defaultBuildRoot;
let assetRoot = defaultAssetRoot;
let worldManifestName = process.env.BOX3_WORLD_MANIFEST ?? "world-bedwars.json";
let clientManifest = null;
let clientUiManifest = null;
let playerProjectionDescriptor = null;
let spawnPoint;
let playerBodyProfile;
let playerRoute = "/play/nea-script-lab?contentId=100110008";
let runtimeLabel = "demo project";
if (runtimePackagePath) {
  const runtimePackage = JSON.parse(await readFile(resolve(runtimePackagePath), "utf8"));
  buildRoot = resolve(runtimePackage.projectRoot);
  assetRoot = resolve(runtimePackage.archiveRoot);
  worldManifestName = runtimePackage.worldManifest;
  clientManifest = runtimePackage.clientManifest;
  clientUiManifest = runtimePackage.clientUiManifest ?? null;
  playerProjectionDescriptor = runtimePackage.playerProjectionDescriptor ?? null;
  playerRoute = `${runtimePackage.route}?contentId=${runtimePackage.contentId}`;
  runtimeLabel = `${runtimePackage.packageId} (${runtimePackage.contentId})`;
  const projectManifest = JSON.parse(await readFile(resolve(buildRoot, "dao3.project.json"), "utf8"));
  const world = JSON.parse(await readFile(resolve(buildRoot, projectManifest.world), "utf8"));
  const physics = world.physics ? JSON.parse(await readFile(resolve(buildRoot, world.physics), "utf8")) : {};
  spawnPoint = world.spawn;
  playerBodyProfile = physics.playerBody;
} else {
  imported = await importMapProject(sourceRoot, buildRoot);
  clientManifest = await publishClientScript(imported, assetRoot);
  spawnPoint = imported.manifest.world.spawn;
  playerBodyProfile = playerBodyProfile;
}
const blockCatalog = await loadPreservedBlockCatalog(assetRoot, worldManifestName);
const runtime = await ScriptRuntime.load(buildRoot, {
  logger: runtimeLogger(),
  blockCatalog,
  sendGuiCommand: async command => {
    const session = playerSessions.get(command.playerId);
    if (!session) throw new Error(`No backend session is bound to ${command.playerId}`);
    const { playerId, ...guiCommand } = command;
    return sendGuiCommandWithRetry({ port: controlPort, token: controlToken, session, command: guiCommand });
  },
  sendClientEvent: async (playerId, event) => {
    const session = playerSessions.get(playerId);
    if (!session) throw new Error(`No backend session is bound to ${playerId}`);
    await sendClientEventWithRetry({ port: controlPort, token: controlToken, session, event });
  },
  showDialog: async (playerId, config) => {
    const session = playerSessions.get(playerId);
    if (!session) throw new Error(`No backend session is bound to ${playerId}`);
    return openDialogWithRetry({ port: controlPort, token: controlToken, session, config });
  },
  writePlayerState: async (playerId, state) => {
    const session = playerSessions.get(playerId);
    if (!session) throw new Error(`No backend session is bound to ${playerId}`);
    await queuePlayerStateToBackend({ port: controlPort, token: controlToken, session, state });
  },
});
await runtime.start();
if (imported) console.log(`[demo] ${formatImportSummary(imported)}`);
console.log(`[demo] Script Runtime started for ${runtimeLabel}`);

const child = spawn(process.execPath, [backendPath], {
  cwd: resolve(repositoryRoot, "local-player"),
  env: {
    ...process.env,
    BOX3_PORT: String(port),
    BOX3_ASSET_ROOT: assetRoot,
    ...(runtimePackagePath && playerProjectionDescriptor ? { BOX3_PROJECT_ROOT: buildRoot, BOX3_PLAYER_PROJECTION_DESCRIPTOR: playerProjectionDescriptor } : runtimePackagePath ? {} : { BOX3_PROJECT_ROOT: buildRoot }),
    BOX3_WORLD_MANIFEST: worldManifestName,
    BOX3_LOG_REMOTE_EVENTS: "1",
    BOX3_LOG_NET_EVENTS: "1",
    BOX3_LOG_SCRIPT_INPUT_EVENTS: "1",
    ...(clientUiManifest === null ? { BOX3_MINIMAL_GAME_UI: "1" } : { BOX3_CLIENT_UI_MANIFEST: clientUiManifest }),
    BOX3_CONTROL_PORT: String(controlPort),
    BOX3_CONTROL_TOKEN: controlToken,
    BOX3_PLAYER_BODY_PROFILE: JSON.stringify({
      profileId: playerBodyProfile.profileId,
      origin: playerBodyProfile.origin,
      originStatus: playerBodyProfile.originStatus,
      sizeStatus: playerBodyProfile.sizeStatus,
      boundsHalfExtents: vectorTuple(playerBodyProfile.boundsHalfExtents),
      shapeHalfExtents: vectorTuple(playerBodyProfile.shapeHalfExtents),
    }),
    BOX3_DISABLE_LEGACY_GAMEPLAY: "1",
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
      position: spawnPoint,
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
  if (backendEvent?.type === "entity-map") {
    const bound = runtime.bindBackendEntities(backendEvent.entities);
    console.log(`[demo] Script Runtime bound ${bound}/${backendEvent.entities.length} backend entities`);
  }
  if (backendEvent?.type === "input-events") {
    const playerId = sessionPlayers.get(backendEvent.sessionLabel);
    if (!playerId) return;
    runtime.dispatchInputEvents(playerId, backendEvent.packet);
  }
  if (backendEvent?.type === "gui-message") {
    const playerId = sessionPlayers.get(backendEvent.sessionLabel);
    if (!playerId) return;
    runtime.dispatchGuiMessage(playerId, backendEvent.name, backendEvent.payload);
  }
  if (backendEvent?.type === "client-event") {
    const playerId = sessionPlayers.get(backendEvent.sessionLabel) ?? [...sessionPlayers.values()][0];
    if (!playerId) return;
    console.log(`[script:remote] <- ${playerId} ${JSON.stringify(backendEvent.event)}`);
    runtime.dispatchClientEvent(playerId, backendEvent.event);
  }
});
pipeBackend(child.stderr, process.stderr);

child.once("spawn", () => {
  console.log(`[demo] Player: http://127.0.0.1:${port}${playerRoute}`);
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

function formatExternalError(error) {
  if (error && typeof error === "object") {
    if (typeof error.stack === "string" && error.stack.length > 0) return error.stack;
    if (typeof error.message === "string" && error.message.length > 0) return error.message;
  }
  return String(error);
}

async function sendGuiCommandWithRetry(options) {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { return await sendGuiCommandToBackend(options); } catch (error) {
      lastError = error;
      if (!String(error).includes("GUI client not connected")) throw error;
      await new Promise(resolveRetry => setTimeout(resolveRetry, 100));
    }
  }
  throw lastError;
}

async function openDialogWithRetry(options) {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { return await openDialogOnBackend(options); } catch (error) {
      lastError = error;
      if (!String(error).includes("dialog client not connected")) throw error;
      await new Promise(resolveRetry => setTimeout(resolveRetry, 100));
    }
  }
  throw lastError;
}

async function sendClientEventWithRetry(options) {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { return await sendClientEventToBackend(options); } catch (error) {
      lastError = error;
      if (!String(error).includes("session not connected")) throw error;
      await new Promise(resolveRetry => setTimeout(resolveRetry, 100));
    }
  }
  throw lastError;
}

function vectorTuple(value) {
  if (Array.isArray(value) && value.length === 3) return value;
  return [value.x, value.y, value.z];
}

function integerEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 65535) throw new Error(`${name} must be a valid TCP port`);
  return number;
}
