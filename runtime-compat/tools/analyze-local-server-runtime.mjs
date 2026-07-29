import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(root, "..");
const relativeSourcePath = "demo-map/src/runtime/script-runtime.mjs";
const source = await readFile(resolve(repositoryRoot, relativeSourcePath), "utf8");
const relativeEventSignalPath = "demo-map/src/runtime/event-signal.mjs";
const eventSignalSource = await readFile(resolve(repositoryRoot, relativeEventSignalPath), "utf8");

const requiredMarkers = [
  "get currentTick() { return runtime.currentTick; }",
  "onTick: handler => this.#listen(\"server.world.events\"",
  "onPlayerJoin: handler => this.#listen(\"server.world.events\"",
  "onPlayerLeave: handler => this.#listen(\"server.world.events\"",
  "onVoxelContact: handler => this.#listen(\"server.world.events\"",
  "export function createContactEvent(tick, entity, contact)",
  "force: null",
  "say: message => {",
  "createEntity: spec => {",
  "querySelector: selector => this.#query(selector)[0] ?? null",
  "export function createRuntimeEntity(input)",
  "get id() { return this._id; }",
  "get kind() { return this._kind; }",
  "set position(value) { this._position.copy(Vector3.from(value)); }",
  "get tags() { return this._tags; }",
  "sendClientEvent: (player, event) => {",
  "_id: String(input.id)",
  "get id() { return this._id; }",
  "get position() { return this._body.position; }",
  "applyImpulse(value) { runtime._applyImpulse(this, value); }",
  "damage(amount) { return runtime._damagePlayer(this, amount); }",
];
for (const marker of requiredMarkers) {
  if (!source.includes(marker)) throw new Error(`Local Server Runtime no longer contains ${marker}`);
}
for (const marker of ["cancel: () =>", "resume: () =>", "active: () => record.active"]) {
  if (!eventSignalSource.includes(marker)) throw new Error(`Local event token no longer contains ${marker}`);
}

const evidence = {
  type: "local-source",
  path: relativeSourcePath,
  symbol: "ScriptRuntime.#createGlobals",
  confidence: "direct",
};

const entries = [
  {
    id: "server.object.GameEventHandlerToken",
    side: "server",
    kind: "object",
    owner: null,
    name: "GameEventHandlerToken",
    signature: { methods: ["cancel(): void", "resume(): void", "active(): boolean"] },
    availability: "confirmed",
    compatibility: "emulated",
    capability: "server.world.events",
    since: "0.1.0",
    notes: ["The local structural token now preserves duplicate subscriptions plus cancel, resume and active lifecycle semantics."],
    evidence: [{
      type: "local-source",
      path: relativeEventSignalPath,
      symbol: "EventSignal.on",
      confidence: "direct",
    }],
  },
  entry("server.world.currentTick", "property", "world", "currentTick", { type: "number", readonly: true }, "server.world.events", "emulated", ["server.GameWorld.currentTick"]),
  entry("server.world.onTick", "event", "world", "onTick", handler("{tick,prevTick,elapsedTimeMS,skip,deltaTime}"), "server.world.events"),
  entry("server.world.onPlayerJoin", "event", "world", "onPlayerJoin", handler("{tick,entity,player}"), "server.world.events"),
  entry("server.world.onPlayerLeave", "event", "world", "onPlayerLeave", handler("{tick,entity,player}"), "server.world.events"),
  entry("server.world.onVoxelContact", "event", "world", "onVoxelContact", handler("{tick,entity,x,y,z,voxel,axis,force,player,collider,normal,compatibility}"), "server.world.events", "partial"),
  entry("server.world.onVoxelSeparate", "event", "world", "onVoxelSeparate", handler("{tick,entity,x,y,z,voxel,axis,force,player,collider,normal,compatibility}"), "server.world.events", "partial"),
  entry("server.world.onContact", "event", "world", "onContact", handler("{tick,entity,other,axis,force,player,collider,normal,compatibility}"), "server.world.events"),
  entry("server.world.onContactSeparate", "event", "world", "onContactSeparate", handler("{tick,entity,other,axis,force,player,collider,normal,compatibility}"), "server.world.events"),
  entry("server.world.onTriggerEnter", "event", "world", "onTriggerEnter", handler("{player,trigger}"), "server.world.events"),
  entry("server.world.onTriggerLeave", "event", "world", "onTriggerLeave", handler("{player,trigger}"), "server.world.events"),
  entry("server.world.nextTick", "event", "world", "nextTick", { parameters: [], returns: "Promise<{tick,deltaTime}>" }, "server.world.events"),
  entry("server.world.nextPlayerJoin", "event", "world", "nextPlayerJoin", { parameters: [], returns: "Promise<{player}>" }, "server.world.events"),
  entry("server.world.say", "method", "world", "say", { parameters: [{ name: "message", type: "unknown" }], returns: "void" }, "server.world.chat"),
  entry("server.world.createEntity", "method", "world", "createEntity", { parameters: [{ name: "spec", type: "LocalEntitySpec" }], returns: "RuntimeEntity" }, "server.world.entities"),
  entry("server.world.querySelector", "method", "world", "querySelector", { parameters: [{ name: "selector", type: "string" }], returns: "RuntimeEntity|null" }, "server.world.entities"),
  entry("server.world.querySelectorAll", "method", "world", "querySelectorAll", { parameters: [{ name: "selector", type: "string" }], returns: "readonly RuntimeEntity[]" }, "server.world.entities"),
  entry("server.object.RuntimeEntity", "object", null, "RuntimeEntity", { properties: ["id", "kind", "position", "tags"], methods: ["snapshot"] }, "server.world.entities"),
  entry("server.RuntimeEntity.id", "property", "RuntimeEntity", "id", { type: "string", readonly: true }, "server.world.entities"),
  entry("server.RuntimeEntity.kind", "property", "RuntimeEntity", "kind", { type: "string", readonly: true }, "server.world.entities"),
  entry("server.RuntimeEntity.position", "property", "RuntimeEntity", "position", { type: "Vector3", readonly: false }, "server.world.entities"),
  entry("server.RuntimeEntity.tags", "property", "RuntimeEntity", "tags", { type: "Set<string>", readonly: true }, "server.world.entities"),
  entry("server.RuntimeEntity.snapshot", "method", "RuntimeEntity", "snapshot", { parameters: [], returns: "RuntimeEntitySnapshot" }, "server.world.entities"),
  entry("server.object.RuntimePlayer", "object", null, "RuntimePlayer", { properties: ["id", "name", "position", "velocity", "grounded", "health"], methods: ["applyImpulse", "damage", "sendMessage", "snapshot"] }, "server.player"),
  entry("server.RuntimePlayer.id", "property", "RuntimePlayer", "id", { type: "string", readonly: true }, "server.player"),
  entry("server.RuntimePlayer.name", "property", "RuntimePlayer", "name", { type: "string", readonly: false }, "server.player.write"),
  entry("server.RuntimePlayer.position", "property", "RuntimePlayer", "position", { type: "Vector3", readonly: false }, "server.player.write"),
  entry("server.RuntimePlayer.velocity", "property", "RuntimePlayer", "velocity", { type: "Vector3", readonly: false }, "server.player.write"),
  entry("server.RuntimePlayer.grounded", "property", "RuntimePlayer", "grounded", { type: "boolean", readonly: true }, "server.player"),
  entry("server.RuntimePlayer.health", "property", "RuntimePlayer", "health", { type: "number", readonly: true }, "server.player"),
  entry("server.RuntimePlayer.applyImpulse", "method", "RuntimePlayer", "applyImpulse", { parameters: [{ name: "impulse", type: "Vector3Like" }], returns: "void" }, "server.player.write"),
  entry("server.RuntimePlayer.damage", "method", "RuntimePlayer", "damage", { parameters: [{ name: "amount", "type": "number" }], returns: "number" }, "server.player.write"),
  entry("server.RuntimePlayer.sendMessage", "method", "RuntimePlayer", "sendMessage", { parameters: [{ name: "message", type: "unknown" }], returns: "void" }, "server.world.chat"),
  entry("server.RuntimePlayer.snapshot", "method", "RuntimePlayer", "snapshot", { parameters: [], returns: "RuntimePlayerSnapshot" }, "server.player"),
  entry("server.remoteChannel.onClientEvent", "event", "remoteChannel", "onClientEvent", handler("{player,event}"), "server.remote-channel", "bridged"),
  entry("server.remoteChannel.nextClientEvent", "event", "remoteChannel", "nextClientEvent", { parameters: [], returns: "Promise<{player,event}>" }, "server.remote-channel", "bridged"),
  entry("server.remoteChannel.sendClientEvent", "method", "remoteChannel", "sendClientEvent", {
    parameters: [{ name: "player", type: "RuntimePlayer" }, { name: "event", type: "any" }],
    returns: "void",
  }, "server.remote-channel", "bridged"),
];

const adapters = [
  adapter("server.world.currentTick", "server.GameWorld.currentTick", "compatible", []),
  adapter("server.world.onTick", "server.GameWorld.onTick", "partial", ["Local elapsedTimeMS uses the configured fixed interval instead of the historical wall-clock measurement.", "Historical skip calculation and delayed-tick behavior are not yet reproduced."]),
  adapter("server.world.onPlayerJoin", "server.GameWorld.onPlayerJoin", "partial", ["Event fields now match GameEntityEvent, but RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onPlayerLeave", "server.GameWorld.onPlayerLeave", "partial", ["Event fields now match GameEntityEvent, but RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onVoxelContact", "server.GameWorld.onVoxelContact", "partial", ["GameVoxelContactEvent force remains null because historical fx/fy/fz production semantics are unresolved.", "RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onVoxelSeparate", "server.GameWorld.onVoxelSeparate", "partial", ["GameVoxelContactEvent force remains null because historical fx/fy/fz production semantics are unresolved.", "RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onContact", "server.GameWorld.onEntityContact", "partial", ["Local collider abstraction is not a historical GameEntityContactEvent."]),
  adapter("server.world.onContactSeparate", "server.GameWorld.onEntitySeparate", "partial", ["Local collider abstraction is not a historical GameEntityContactEvent."]),
  adapter("server.world.nextTick", "server.GameWorld.nextTick", "partial", ["Historical nextTick accepts an optional filter and resolves a GameTickEvent."]),
  adapter("server.world.nextPlayerJoin", "server.GameWorld.nextPlayerJoin", "partial", ["Historical nextPlayerJoin accepts an optional filter and resolves a GameEntityEvent."]),
  adapter("server.world.say", "server.GameWorld.say", "partial", ["Local implementation records/logs messages but does not yet prove historical broadcast delivery and limits."]),
  adapter("server.world.createEntity", "server.GameWorld.createEntity", "partial", ["Local entity spec and returned wrapper expose only a small subset of GameEntity."]),
  adapter("server.world.querySelector", "server.GameWorld.querySelector", "partial", ["Local selector grammar supports only id, tag and kind subsets."]),
  adapter("server.world.querySelectorAll", "server.GameWorld.querySelectorAll", "partial", ["Local selector grammar supports only id, tag and kind subsets."]),
  adapter("server.remoteChannel.onClientEvent", "server.remoteChannel.onServerEvent", "partial", ["Local payload is {player,event}; historical ServerEvent is {tick,entity,args}."]),
  adapter("server.remoteChannel.sendClientEvent", "server.remoteChannel.sendClientEvent", "partial", ["Local method accepts one RuntimePlayer; historical API accepts one or many GamePlayerEntity targets and empty arrays."]),
];

const analysis = {
  format: "nea-local-server-runtime-analysis",
  version: 1,
  generatedAt: new Date().toISOString(),
  source: {
    path: relativeSourcePath,
    bytes: Buffer.byteLength(source),
    sha256: createHash("sha256").update(source).digest("hex"),
  },
  eventTokenSource: {
    path: relativeEventSignalPath,
    bytes: Buffer.byteLength(eventSignalSource),
    sha256: createHash("sha256").update(eventSignalSource).digest("hex"),
  },
  contract: "nea-server-runtime/v1",
  entries,
  adapters,
  summary: {
    localEntries: entries.length,
    compatibleAdapters: adapters.filter(item => item.status === "compatible").length,
    partialAdapters: adapters.filter(item => item.status === "partial").length,
    extensions: entries.length - adapters.length,
  },
};

await mkdir(resolve(root, "generated"), { recursive: true });
await writeFile(resolve(root, "generated", "local-server-runtime-analysis.json"), `${JSON.stringify(analysis, null, 2)}\n`);
await writeFile(resolve(root, "abi", "server-adapter-map.json"), `${JSON.stringify({
  format: "nea-server-adapter-map",
  version: 1,
  generatedAt: analysis.generatedAt,
  contract: analysis.contract,
  adapters,
}, null, 2)}\n`);
console.log(`Analyzed local Server Runtime; ${entries.length} entries, ${analysis.summary.compatibleAdapters} compatible and ${analysis.summary.partialAdapters} partial adapters.`);

function entry(id, kind, owner, name, signature, capability, compatibility = "emulated", implementsIds = []) {
  return {
    id,
    side: "server",
    kind,
    owner,
    name,
    signature,
    availability: "confirmed",
    compatibility,
    capability,
    since: "0.1.0",
    ...(implementsIds.length > 0 ? { implements: implementsIds } : {}),
    notes: ["Implemented by the local experimental Server Runtime; historical compatibility is tracked separately in server-adapter-map.json."],
    evidence: [evidence],
  };
}

function handler(eventType) {
  return { parameters: [{ name: "handler", type: `(${eventType})=>void` }], returns: "listener-token" };
}

function adapter(localId, canonicalId, status, gaps) {
  return { localId, canonicalId, status, gaps };
}
