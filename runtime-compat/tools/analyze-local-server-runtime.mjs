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
const relativeGameVoxelsPath = "demo-map/src/runtime/game-voxels.mjs";
const gameVoxelsSource = await readFile(resolve(repositoryRoot, relativeGameVoxelsPath), "utf8");
const relativeGameRaycastPath = "demo-map/src/runtime/game-raycast.mjs";
const gameRaycastSource = await readFile(resolve(repositoryRoot, relativeGameRaycastPath), "utf8");
const relativeGameGuiPath = "demo-map/src/runtime/game-gui.mjs";
const gameGuiSource = await readFile(resolve(repositoryRoot, relativeGameGuiPath), "utf8");
const relativeGameStoragePath = "demo-map/src/runtime/game-storage.mjs";
const gameStorageSource = await readFile(resolve(repositoryRoot, relativeGameStoragePath), "utf8");
const relativeGameWorldPath = "demo-map/src/runtime/game-world.mjs";
const gameWorldSource = await readFile(resolve(repositoryRoot, relativeGameWorldPath), "utf8");
const relativeGameZonesPath = "demo-map/src/runtime/game-zones.mjs";
const gameZonesSource = await readFile(resolve(repositoryRoot, relativeGameZonesPath), "utf8");

const requiredMarkers = [
  "get currentTick() { return runtime.currentTick; }",
  "export const GameButtonType = Object.freeze({",
  "dispatchInputEvents(playerId, packet) {",
  "const permissionMask = inputPermissionMask(player);",
  "enableAction0: true,",
  "get size() { return runtime.voxels.shape; }",
  "onTick: handler => this.#listen(\"server.world.events\"",
  "onPlayerJoin: handler => this.#listen(\"server.world.events\"",
  "onPlayerLeave: handler => this.#listen(\"server.world.events\"",
  "onVoxelContact: handler => this.#listen(\"server.world.events\"",
  "export function createContactEvent(tick, entity, contact)",
  "const force = Vector3.from(contact.force ?? [0, 0, 0])",
  "say: message => {",
  "createEntity: spec => {",
  "querySelector: selector => this.#query(selector)[0] ?? null",
  "raycast: (origin, direction, options) => raycastWorld({",
  "onRespawn: handler => this.#listen(\"server.world.events\", this.#signals.respawn, handler)",
  "onTakeDamage: handler => this.#listen(\"server.world.events\", this.#signals.takeDamage, handler)",
  "export function createGameDamageEvent(tick, entity, damage, attacker = null, damageType = \"\")",
  "onChat: handler => this.#listen(\"server.world.chat\", this.#signals.chat, handler)",
  "onPress: handler => this.#listen(\"server.world.events\", this.#signals.press, handler)",
  "onClick: handler => this.#listen(\"server.world.events\", this.#signals.click, handler)",
  "export function createGameClickEvent(tick, entity, clicker, button, distance, clickerPosition, raycast)",
  "onClick(handler) { return this._signals.click.on(handler); }",
  "onRelease: handler => this.#listen(\"server.world.events\", this.#signals.release, handler)",
  "onFluidEnter: handler => this.#listen(\"server.world.events\", this.#signals.fluidEnter, handler)",
  "onFluidLeave: handler => this.#listen(\"server.world.events\", this.#signals.fluidLeave, handler)",
  "onDie: handler => this.#listen(\"server.world.events\", this.#signals.die, handler)",
  "onEntityContact: handler => this.#listen(\"server.world.events\", this.#signals.entityContact, handler)",
  "onPlayerPurchaseSuccess: handler => this.#listen(\"server.world.events\", this.#signals.playerPurchaseSuccess, handler)",
  "forceRespawn() { return runtime._forceRespawnPlayer(this); }",
  "spawnPoint: Vector3.from(input.position ?? [0, 0, 0])",
  "color: new GameRGBColor(1, 1, 1)",
  "export function createRuntimeEntity(input)",
  "get id() { return this._id; }",
  "get kind() { return this._kind; }",
  "set position(value) { this._position.copy(Vector3.from(value)); }",
  "get tags() { return this._tags; }",
  "const sendRemoteEvent = (player, event) => {",
  "onServerEvent: handler => this.#listen(\"server.remote-channel\"",
  "sendClientEvent: (players, event) => {",
  "broadcastClientEvent: event => {",
  "_id: String(input.id)",
  "get id() { return this._id; }",
  "get position() { return this._body.position; }",
  "applyImpulse(value) { runtime._applyImpulse(this, value); }",
  "damage(amount) { return runtime._damagePlayer(this, amount); }",
];
for (const marker of requiredMarkers) {
  if (!source.includes(marker)) throw new Error(`Local Server Runtime no longer contains ${marker}`);
}
for (const marker of ["export class GameWorld", "this.fogColor = new GameRGBColor(1, 1, 1)", "this.gravity = -0.1", "this.airFriction = 0.001"]) {
  if (!gameWorldSource.includes(marker)) throw new Error(`Local GameWorld value shell no longer contains ${marker}`);
}
for (const marker of ["export class GameZoneSystem", "add(config={})", "poll(tick,players)"]) {
  if (!gameZonesSource.includes(marker)) throw new Error(`Local GameZone Runtime no longer contains ${marker}`);
}
for (const marker of ["export class GameGuiRuntime", 'this.init = (entity, config) =>', 'this.remove = (entity, selector) =>', 'this.getAttribute = (entity, selector, name) =>', 'this.setAttribute = (entity, selector, name, value) =>', "this.onMessage = listener =>", "this.ui = new Proxy"]) {
  if (!gameGuiSource.includes(marker)) throw new Error(`Local GameGUI Runtime no longer contains ${marker}`);
}
for (const marker of ["export class LocalGameStorage", "this.getDataStorage = key =>", "this.getGroupStorage = options.groupEnabled", "set: (itemKey, value) =>", "update: (itemKey, handler) =>", "increment: (itemKey, value = 1) =>", "list: (options = {}) =>", "remove: itemKey =>", "destroy: () =>"]) {
  if (!gameStorageSource.includes(marker)) throw new Error(`Local GameStorage Runtime no longer contains ${marker}`);
}
for (const marker of ["export function raycastWorld", "options?.ignoreVoxel === true", "options?.ignoreFluid === true", "options?.ignoreEntities === true", "options?.ignoreSelector", "return Infinity", "nearest?.position ?? new Vector3(0, 0, 0)", "voxelIndex:", "hitEntity:"]) {
  if (!gameRaycastSource.includes(marker)) throw new Error(`Local GameWorld.raycast Runtime no longer contains ${marker}`);
}
for (const marker of ["export class GameVoxelsRuntime", "id(name)", "getVoxelId(x, y, z)", "setVoxelId(x, y, z, voxel)", "setVoxel(x, y, z, voxel, rotation)", "name(id)", "getVoxel(x, y, z)", "getVoxelRotation(x, y, z)", "this.shape = this.#shape", "this.VoxelTypes ="]) {
  if (!gameVoxelsSource.includes(marker)) throw new Error(`Local GameVoxels Runtime no longer contains ${marker}`);
}
for (const marker of ["cancel: () =>", "resume: () =>", "active: () => record.active", "#futures = new Set()", "next(filter)", "future.filter.call(null, event)", "future.reject(error)"]) {
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
  worldSizeEntry(),
  entry("server.world.onRespawn", "event", "world", "onRespawn", handler("{tick,entity,player}"), "server.world.events", "partial", ["server.GameWorld.onRespawn"]),
  entry("server.world.nextRespawn", "event", "world", "nextRespawn", { parameters: [{ name: "filter", type: "(event: {tick,entity,player}) => boolean", optional: true }], returns: "Promise<{tick,entity,player}>" }, "server.world.events", "partial", ["server.GameWorld.nextRespawn"]),
  entry("server.world.onTakeDamage", "event", "world", "onTakeDamage", handler("{tick,entity,attacker,damage,damageType}"), "server.world.events", "partial", ["server.GameWorld.onTakeDamage"]),
  entry("server.world.nextTakeDamage", "event", "world", "nextTakeDamage", { parameters: [{ name: "filter", type: "(event: {tick,entity,attacker,damage,damageType}) => boolean", optional: true }], returns: "Promise<{tick,entity,attacker,damage,damageType}>" }, "server.world.events", "partial", ["server.GameWorld.nextTakeDamage"]),
  entry("server.world.onChat", "event", "world", "onChat", handler("{tick,entity,player,message}"), "server.world.chat", "partial", ["server.GameWorld.onChat"]),
  entry("server.world.onPress", "event", "world", "onPress", handler("{tick,entity,position,button,pressed,raycast}"), "server.world.events", "compatible", ["server.GameWorld.onPress"]),
  entry("server.world.onClick", "event", "world", "onClick", handler("{tick,entity,clicker,button,distance,clickerPosition,raycast}"), "server.world.events", "partial", ["server.GameWorld.onClick"]),
  entry("server.world.onRelease", "event", "world", "onRelease", handler("{tick,entity,position,button,pressed,raycast}"), "server.world.events", "compatible", ["server.GameWorld.onRelease"]),
  entry("server.world.onFluidEnter", "event", "world", "onFluidEnter", handler("{tick,entity,player,fluid}"), "server.world.events", "partial", ["server.GameWorld.onFluidEnter"]),
  entry("server.world.onFluidLeave", "event", "world", "onFluidLeave", handler("{tick,entity,player,fluid}"), "server.world.events", "partial", ["server.GameWorld.onFluidLeave"]),
  entry("server.world.onDie", "event", "world", "onDie", handler("{tick,entity,player}"), "server.world.events", "partial", ["server.GameWorld.onDie"]),
  entry("server.world.onEntityContact", "event", "world", "onEntityContact", handler("{tick,entity,player,other,axis,force}"), "server.world.events", "partial", ["server.GameWorld.onEntityContact"]),
  entry("server.world.onPlayerPurchaseSuccess", "event", "world", "onPlayerPurchaseSuccess", handler("{tick,entity,player}"), "server.world.events", "partial", ["server.GameWorld.onPlayerPurchaseSuccess"]),
  entry("server.world.onTick", "event", "world", "onTick", handler("{tick,prevTick,elapsedTimeMS,skip,deltaTime}"), "server.world.events"),
  entry("server.world.onPlayerJoin", "event", "world", "onPlayerJoin", handler("{tick,entity,player}"), "server.world.events"),
  entry("server.world.onPlayerLeave", "event", "world", "onPlayerLeave", handler("{tick,entity,player}"), "server.world.events"),
  entry("server.world.onVoxelContact", "event", "world", "onVoxelContact", handler("{tick,entity,x,y,z,voxel,axis,force,player,collider,normal,compatibility}"), "server.world.events", "partial"),
  entry("server.world.onVoxelSeparate", "event", "world", "onVoxelSeparate", handler("{tick,entity,x,y,z,voxel,axis,force,player,collider,normal,compatibility}"), "server.world.events", "partial"),
  entry("server.world.onContact", "event", "world", "onContact", handler("{tick,entity,other,axis,force,player,collider,normal,compatibility}"), "server.world.events"),
  entry("server.world.onContactSeparate", "event", "world", "onContactSeparate", handler("{tick,entity,other,axis,force,player,collider,normal,compatibility}"), "server.world.events"),
  entry("server.world.onTriggerEnter", "event", "world", "onTriggerEnter", handler("{player,trigger}"), "server.world.events"),
  entry("server.world.onTriggerLeave", "event", "world", "onTriggerLeave", handler("{player,trigger}"), "server.world.events"),
  entry("server.world.nextTick", "event", "world", "nextTick", { parameters: [{ name: "filter", type: "(event: {tick,deltaTime}) => boolean", optional: true }], returns: "Promise<{tick,deltaTime}>" }, "server.world.events", "partial", ["server.GameWorld.nextTick"]),
  entry("server.world.nextPlayerJoin", "event", "world", "nextPlayerJoin", { parameters: [{ name: "filter", type: "(event: {tick,entity,player}) => boolean", optional: true }], returns: "Promise<{tick,entity,player}>" }, "server.world.events", "partial", ["server.GameWorld.nextPlayerJoin"]),
  entry("server.world.say", "method", "world", "say", { parameters: [{ name: "message", type: "unknown" }], returns: "void" }, "server.world.chat"),
  entry("server.world.createEntity", "method", "world", "createEntity", { parameters: [{ name: "spec", type: "LocalEntitySpec" }], returns: "RuntimeEntity" }, "server.world.entities"),
  entry("server.world.querySelector", "method", "world", "querySelector", { parameters: [{ name: "selector", type: "string" }], returns: "RuntimeEntity|null" }, "server.world.entities"),
  entry("server.world.querySelectorAll", "method", "world", "querySelectorAll", { parameters: [{ name: "selector", type: "string" }], returns: "readonly RuntimeEntity[]" }, "server.world.entities"),
  raycastEntry(),
  entry("server.world.addCollisionFilter", "method", "world", "addCollisionFilter", { parameters: [{ name: "aSelector", type: "GameSelectorString" }, { name: "bSelector", type: "GameSelectorString" }], returns: "void" }, "server.world.entities", "partial", ["server.GameWorld.addCollisionFilter"]),
  entry("server.world.addZone", "method", "world", "addZone", { parameters: [{ name: "config", type: "Partial<GameZone>" }], returns: "GameZone" }, "server.world.events", "partial", ["server.GameWorld.addZone"]),
  worldValueEntry("server.world.gravity", "gravity", "number"),
  worldValueEntry("server.world.airFriction", "airFriction", "number"),
  worldValueEntry("server.world.fogColor", "fogColor", "GameRGBColor"),
  entry("server.object.RuntimeEntity", "object", null, "RuntimeEntity", { properties: ["id", "kind", "position", "tags"], methods: ["onClick", "nextClick", "snapshot"] }, "server.world.entities"),
  entry("server.RuntimeEntity.id", "property", "RuntimeEntity", "id", { type: "string", readonly: true }, "server.world.entities"),
  entry("server.RuntimeEntity.kind", "property", "RuntimeEntity", "kind", { type: "string", readonly: true }, "server.world.entities"),
  entry("server.RuntimeEntity.position", "property", "RuntimeEntity", "position", { type: "Vector3", readonly: false }, "server.world.entities"),
  entry("server.RuntimeEntity.tags", "property", "RuntimeEntity", "tags", { type: "Set<string>", readonly: true }, "server.world.entities"),
  entry("server.RuntimeEntity.onClick", "event", "RuntimeEntity", "onClick", handler("{tick,entity,clicker,button,distance,clickerPosition,raycast}"), "server.world.events", "partial", ["server.GameEntity.onClick"]),
  entry("server.RuntimeEntity.nextClick", "event", "RuntimeEntity", "nextClick", { parameters: [{ name: "filter", type: "(event: GameClickEvent) => boolean", optional: true }], returns: "Promise<GameClickEvent>" }, "server.world.events", "partial", ["server.GameEntity.nextClick"]),
  entry("server.RuntimeEntity.snapshot", "method", "RuntimeEntity", "snapshot", { parameters: [], returns: "RuntimeEntitySnapshot" }, "server.world.entities"),
  ...gameButtonTypeEntries(),
  entry("server.object.RuntimePlayer", "object", null, "RuntimePlayer", { properties: ["id", "name", "position", "velocity", "grounded", "health", "walkButton", "crouchButton", "jumpButton", "action0Button", "action1Button", "enableAction0", "enableAction1", "enableJump", "enableDoubleJump", "enableCrouch"], methods: ["applyImpulse", "damage", "sendMessage", "snapshot"] }, "server.player"),
  entry("server.RuntimePlayer.id", "property", "RuntimePlayer", "id", { type: "string", readonly: true }, "server.player"),
  entry("server.RuntimePlayer.name", "property", "RuntimePlayer", "name", { type: "string", readonly: false }, "server.player.write"),
  entry("server.RuntimePlayer.position", "property", "RuntimePlayer", "position", { type: "Vector3", readonly: false }, "server.player.write"),
  entry("server.RuntimePlayer.velocity", "property", "RuntimePlayer", "velocity", { type: "Vector3", readonly: false }, "server.player.write"),
  entry("server.RuntimePlayer.grounded", "property", "RuntimePlayer", "grounded", { type: "boolean", readonly: true }, "server.player"),
  entry("server.RuntimePlayer.health", "property", "RuntimePlayer", "health", { type: "number", readonly: true }, "server.player"),
  entry("server.RuntimePlayer.walkButton", "property", "RuntimePlayer", "walkButton", { type: "boolean", readonly: false }, "server.player", "compatible", ["server.GamePlayerEntity.walkButton"]),
  entry("server.RuntimePlayer.crouchButton", "property", "RuntimePlayer", "crouchButton", { type: "boolean", readonly: false }, "server.player", "partial"),
  entry("server.RuntimePlayer.jumpButton", "property", "RuntimePlayer", "jumpButton", { type: "boolean", readonly: false }, "server.player", "compatible", ["server.GamePlayerEntity.jumpButton"]),
  entry("server.RuntimePlayer.action0Button", "property", "RuntimePlayer", "action0Button", { type: "boolean", readonly: false }, "server.player", "compatible", ["server.GamePlayerEntity.action0Button"]),
  entry("server.RuntimePlayer.action1Button", "property", "RuntimePlayer", "action1Button", { type: "boolean", readonly: false }, "server.player", "compatible", ["server.GamePlayerEntity.action1Button"]),
  entry("server.RuntimePlayer.enableAction0", "property", "RuntimePlayer", "enableAction0", { type: "boolean", readonly: false }, "server.player.write", "partial", ["server.GamePlayerEntity.enableAction0"]),
  entry("server.RuntimePlayer.enableAction1", "property", "RuntimePlayer", "enableAction1", { type: "boolean", readonly: false }, "server.player.write", "partial", ["server.GamePlayerEntity.enableAction1"]),
  entry("server.RuntimePlayer.enableJump", "property", "RuntimePlayer", "enableJump", { type: "boolean", readonly: false }, "server.player.write", "partial", ["server.GamePlayerEntity.enableJump"]),
  entry("server.RuntimePlayer.enableDoubleJump", "property", "RuntimePlayer", "enableDoubleJump", { type: "boolean", readonly: false }, "server.player.write", "partial", ["server.GamePlayerEntity.enableDoubleJump"]),
  entry("server.RuntimePlayer.enableCrouch", "property", "RuntimePlayer", "enableCrouch", { type: "boolean", readonly: false }, "server.player.write", "partial"),
  entry("server.RuntimePlayer.color", "property", "RuntimePlayer", "color", { type: "GameRGBColor", readonly: false }, "server.player.write", "partial", ["server.GamePlayer.color"]),
  entry("server.RuntimePlayer.spawnPoint", "property", "RuntimePlayer", "spawnPoint", { type: "GameVector3", readonly: false }, "server.player.write", "partial", ["server.GamePlayer.spawnPoint"]),
  entry("server.RuntimePlayer.onRespawn", "event", "RuntimePlayer", "onRespawn", handler("{tick,entity,player}"), "server.world.events", "partial", ["server.GamePlayer.onRespawn"]),
  entry("server.RuntimePlayer.nextRespawn", "event", "RuntimePlayer", "nextRespawn", { parameters: [{ name: "filter", type: "(event: {tick,entity,player}) => boolean", optional: true }], returns: "Promise<{tick,entity,player}>" }, "server.world.events", "partial", ["server.GamePlayer.nextRespawn"]),
  entry("server.RuntimePlayer.onClick", "event", "RuntimePlayer", "onClick", handler("{tick,entity,clicker,button,distance,clickerPosition,raycast}"), "server.world.events", "partial", ["server.GameEntity.onClick"]),
  entry("server.RuntimePlayer.nextClick", "event", "RuntimePlayer", "nextClick", { parameters: [{ name: "filter", type: "(event: GameClickEvent) => boolean", optional: true }], returns: "Promise<GameClickEvent>" }, "server.world.events", "partial", ["server.GameEntity.nextClick"]),
  entry("server.RuntimePlayer.onPress", "event", "RuntimePlayer", "onPress", handler("{tick,entity,position,button,pressed,raycast}"), "server.world.events", "compatible", ["server.GamePlayer.onPress"]),
  entry("server.RuntimePlayer.nextPress", "event", "RuntimePlayer", "nextPress", { parameters: [{ name: "filter", type: "(event: GameInputEvent) => boolean", optional: true }], returns: "Promise<GameInputEvent>" }, "server.world.events", "compatible", ["server.GamePlayer.nextPress"]),
  entry("server.RuntimePlayer.onRelease", "event", "RuntimePlayer", "onRelease", handler("{tick,entity,position,button,pressed,raycast}"), "server.world.events", "compatible", ["server.GamePlayer.onRelease"]),
  entry("server.RuntimePlayer.nextRelease", "event", "RuntimePlayer", "nextRelease", { parameters: [{ name: "filter", type: "(event: GameInputEvent) => boolean", optional: true }], returns: "Promise<GameInputEvent>" }, "server.world.events", "compatible", ["server.GamePlayer.nextRelease"]),
  entry("server.RuntimePlayer.onTakeDamage", "event", "RuntimePlayer", "onTakeDamage", handler("{tick,entity,attacker,damage,damageType}"), "server.world.events", "partial", ["server.GameEntity.onTakeDamage"]),
  entry("server.RuntimePlayer.nextTakeDamage", "event", "RuntimePlayer", "nextTakeDamage", { parameters: [{ name: "filter", type: "(event: {tick,entity,attacker,damage,damageType}) => boolean", optional: true }], returns: "Promise<{tick,entity,attacker,damage,damageType}>" }, "server.world.events", "partial", ["server.GameEntity.nextTakeDamage"]),
  entry("server.RuntimePlayer.forceRespawn", "method", "RuntimePlayer", "forceRespawn", { parameters: [], returns: "void" }, "server.player.write", "partial", ["server.GamePlayer.forceRespawn"]),
  entry("server.RuntimePlayer.applyImpulse", "method", "RuntimePlayer", "applyImpulse", { parameters: [{ name: "impulse", type: "Vector3Like" }], returns: "void" }, "server.player.write"),
  entry("server.RuntimePlayer.damage", "method", "RuntimePlayer", "damage", { parameters: [{ name: "amount", "type": "number" }], returns: "number" }, "server.player.write"),
  entry("server.RuntimePlayer.sendMessage", "method", "RuntimePlayer", "sendMessage", { parameters: [{ name: "message", type: "unknown" }], returns: "void" }, "server.world.chat"),
  entry("server.RuntimePlayer.snapshot", "method", "RuntimePlayer", "snapshot", { parameters: [], returns: "RuntimePlayerSnapshot" }, "server.player"),
  voxelEntry("server.global.voxels", "global", "global", "voxels", { type: "GameVoxels" }),
  voxelEntry("server.GameVoxels.getVoxelId", "method", "GameVoxels", "getVoxelId", {
    parameters: [{ name: "x", type: "number" }, { name: "y", type: "number" }, { name: "z", type: "number" }],
    returns: "number",
  }),
  voxelEntry("server.GameVoxels.setVoxelId", "method", "GameVoxels", "setVoxelId", {
    parameters: [{ name: "x", type: "number" }, { name: "y", type: "number" }, { name: "z", type: "number" }, { name: "voxel", type: "number" }],
    returns: "number",
  }),
  voxelEntry("server.GameVoxels.id", "method", "GameVoxels", "id", {
    parameters: [{ name: "name", type: "string" }],
    returns: "number",
  }),
  voxelEntry("server.GameVoxels.setVoxel", "method", "GameVoxels", "setVoxel", {
    parameters: [{ name: "x", type: "number" }, { name: "y", type: "number" }, { name: "z", type: "number" }, { name: "voxel", type: "number|string" }, { name: "rotation", type: "number|string", optional: true }],
    returns: "number",
  }),
  voxelEntry("server.GameVoxels.getVoxel", "method", "GameVoxels", "getVoxel", {
    parameters: [{ name: "x", type: "number" }, { name: "y", type: "number" }, { name: "z", type: "number" }], returns: "number",
  }, 2),
  voxelEntry("server.GameVoxels.name", "method", "GameVoxels", "name", {
    parameters: [{ name: "id", type: "number" }], returns: "string",
  }, 2),
  voxelEntry("server.GameVoxels.getVoxelRotation", "method", "GameVoxels", "getVoxelRotation", {
    parameters: [{ name: "x", type: "number" }, { name: "y", type: "number" }, { name: "z", type: "number" }], returns: "number",
  }, 2),
  voxelEntry("server.GameVoxels.shape", "property", "GameVoxels", "shape", { type: "GameVector3", readonly: true }, 2),
  voxelEntry("server.GameVoxels.VoxelTypes", "property", "GameVoxels", "VoxelTypes", { type: "string[]", readonly: true }, 2),
  entry("server.remoteChannel.onClientEvent", "event", "remoteChannel", "onClientEvent", handler("{player,event}"), "server.remote-channel", "bridged"),
  entry("server.remoteChannel.nextClientEvent", "event", "remoteChannel", "nextClientEvent", { parameters: [], returns: "Promise<{player,event}>" }, "server.remote-channel", "bridged"),
  entry("server.global.gui", "object", null, "gui", { type: "GameGUI" }, null, "partial"),
  guiEntry("server.GameGUI.init", "method", "init", { parameters: [{ name: "entity", type: "GamePlayerEntity" }, { name: "config", type: "GUIConfig" }], returns: "Promise<void>" }),
  guiEntry("server.GameGUI.show", "method", "show", { parameters: [{ name: "entity", type: "GamePlayerEntity" }, { name: "name", type: "string" }, { name: "allowMultiple", type: "boolean", optional: true }], returns: "Promise<void>" }),
  guiEntry("server.GameGUI.remove", "method", "remove", { parameters: [{ name: "entity", type: "GamePlayerEntity" }, { name: "selector", type: "string" }], returns: "Promise<void>" }),
  guiEntry("server.GameGUI.getAttribute", "method", "getAttribute", { parameters: [{ name: "entity", type: "GamePlayerEntity" }, { name: "selector", type: "string" }, { name: "name", type: "string" }], returns: "Promise<any>" }),
  guiEntry("server.GameGUI.setAttribute", "method", "setAttribute", { parameters: [{ name: "entity", type: "GamePlayerEntity" }, { name: "selector", type: "string" }, { name: "name", type: "string" }, { name: "value", type: "any" }], returns: "Promise<void>" }),
  guiEntry("server.GameGUI.onMessage", "event", "onMessage", handler("GameGUIEvent")),
  guiEntry("server.GameGUI.ui", "property", "ui", { type: "GameGUIElementFactory", readonly: true }),
  entry("server.global.storage", "object", null, "storage", { type: "GameStorage" }, null, "partial"),
  storageEntry("server.GameStorage.getDataStorage", "getDataStorage"),
  storageEntry("server.GameStorage.getGroupStorage", "getGroupStorage"),
  entry("server.remoteChannel.onServerEvent", "event", "remoteChannel", "onServerEvent", handler("{tick,entity,args}"), "server.remote-channel", "bridged"),
  entry("server.remoteChannel.sendClientEvent", "method", "remoteChannel", "sendClientEvent", {
    parameters: [{ name: "players", type: "RuntimePlayer | RuntimePlayer[]" }, { name: "event", type: "any" }],
    returns: "void",
  }, "server.remote-channel", "bridged"),
  entry("server.remoteChannel.broadcastClientEvent", "method", "remoteChannel", "broadcastClientEvent", {
    parameters: [{ name: "event", type: "any" }],
    returns: "void",
  }, "server.remote-channel", "bridged"),
];

const adapters = [
  adapter("server.world.currentTick", "server.GameWorld.currentTick", "compatible", []),
  adapter("server.world.onRespawn", "server.GameWorld.onRespawn", "partial", ["Local forceRespawn emits the recovered event shape; automatic engine respawn triggers remain unverified."]),
  adapter("server.world.nextRespawn", "server.GameWorld.nextRespawn", "partial", ["The recovered optional filter is implemented; automatic engine respawn triggers remain unverified."]),
  adapter("server.world.onTakeDamage", "server.GameWorld.onTakeDamage", "partial", ["Existing local RuntimePlayer.damage calls emit the recovered GameDamageEvent fields; native hurt producers, damage enablement, death scheduling, attacker propagation, and transport-created damage remain unverified."]),
  adapter("server.world.nextTakeDamage", "server.GameWorld.nextTakeDamage", "partial", ["The recovered optional filter is implemented; native damage producers remain unverified."]),
  adapter("server.world.onChat", "server.GameWorld.onChat", "partial", ["Recovered event fields are emitted by the local bridge; native moderation, cancellation, and transport timing remain unverified."]),
  adapter("server.world.onPress", "server.GameWorld.onPress", "compatible", []),
  adapter("server.world.onClick", "server.GameWorld.onClick", "partial", ["The game-net bridge reconstructs the declared GameClickEvent fields, applies the recovered PlayerFlags mask, and dispatches the same event to world and the clicked entity in historical order.", "Non-player clicks require an authoritative backend entity binding; the latest capture still has two entities without sufficient model evidence for projection."]),
  adapter("server.world.onRelease", "server.GameWorld.onRelease", "compatible", []),
  adapter("server.world.onFluidEnter", "server.GameWorld.onFluidEnter", "partial", ["The event surface and local physics dispatch exist; native fluid metadata and exact transition timing remain unverified."]),
  adapter("server.world.onFluidLeave", "server.GameWorld.onFluidLeave", "partial", ["The event surface and local physics dispatch exist; native fluid metadata and exact transition timing remain unverified."]),
  adapter("server.world.onDie", "server.GameWorld.onDie", "partial", ["The event surface is dispatchable, but automatic native death-state production remains unverified."]),
  adapter("server.world.onEntityContact", "server.GameWorld.onEntityContact", "partial", ["The event surface is dispatchable; full native GameEntityContactEvent production remains covered separately by the contact model."]),
  adapter("server.world.onPlayerPurchaseSuccess", "server.GameWorld.onPlayerPurchaseSuccess", "partial", ["The event surface is dispatchable; the native purchase producer and full payload remain unverified."]),
  adapter("server.world.onTick", "server.GameWorld.onTick", "partial", ["Local elapsedTimeMS uses the configured fixed interval instead of the historical wall-clock measurement.", "Historical skip calculation and delayed-tick behavior are not yet reproduced."]),
  adapter("server.world.onPlayerJoin", "server.GameWorld.onPlayerJoin", "partial", ["Event fields now match GameEntityEvent, but RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onPlayerLeave", "server.GameWorld.onPlayerLeave", "partial", ["Event fields now match GameEntityEvent, but RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onVoxelContact", "server.GameWorld.onVoxelContact", "partial", ["The recovered impulse-derived GameVoxelContactEvent force is implemented; RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onVoxelSeparate", "server.GameWorld.onVoxelSeparate", "partial", ["The recovered impulse-derived GameVoxelContactEvent force is implemented; RuntimePlayer is still only a subset of GamePlayerEntity."]),
  adapter("server.world.onContact", "server.GameWorld.onEntityContact", "partial", ["Local collider abstraction is not a historical GameEntityContactEvent."]),
  adapter("server.world.onContactSeparate", "server.GameWorld.onEntitySeparate", "partial", ["Local collider abstraction is not a historical GameEntityContactEvent."]),
  adapter("server.world.nextTick", "server.GameWorld.nextTick", "partial", ["The recovered optional filter and GameTickEvent resolution are implemented; elapsedTimeMS, skip, and delayed-tick timing retain the same gaps as world.onTick."]),
  adapter("server.world.nextPlayerJoin", "server.GameWorld.nextPlayerJoin", "partial", ["The recovered optional filter and GameEntityEvent fields are implemented; RuntimePlayer remains a subset of GamePlayerEntity."]),
  adapter("server.world.say", "server.GameWorld.say", "partial", ["Local implementation records/logs messages but does not yet prove historical broadcast delivery and limits."]),
  adapter("server.world.createEntity", "server.GameWorld.createEntity", "partial", ["Local entity spec and returned wrapper expose only a small subset of GameEntity."]),
  adapter("server.world.querySelector", "server.GameWorld.querySelector", "partial", ["Local selector grammar supports only id, tag and kind subsets."]),
  adapter("server.world.querySelectorAll", "server.GameWorld.querySelectorAll", "partial", ["Local selector grammar supports only id, tag and kind subsets."]),
  adapter("server.world.raycast", "server.GameWorld.raycast", "partial", ["Voxel DDA, fluid filtering, selector filtering, player/entity AABBs, recovered result fields, the historical Infinity maxDistance default, and zero-direction preservation are implemented and exercised by conformance tests and the BedWars corpus.", "The recovered engine raycastBoxes implementation and body-orientation semantics are not available locally; entity intersections therefore remain an explicit AABB approximation. GameWorld.useOBB is a separate world-physics property, not a GameRaycastOptions field."]),
  adapter("server.world.addCollisionFilter", "server.GameWorld.addCollisionFilter", "partial", ["Filter registration/list lifecycle is implemented; the local physics solver does not yet consume selector pairs."]),
  adapter("server.world.addZone", "server.GameWorld.addZone", "partial", ["Zone creation, polling, enter/leave events, and removal exist; selector grammar and environmental effects remain partial."]),
  adapter("server.world.gravity", "server.GameWorld.gravity", "partial", ["The recovered property is script-visible, but writes do not yet reconfigure the fixed-step physics engine."]),
  adapter("server.world.airFriction", "server.GameWorld.airFriction", "partial", ["The recovered property is script-visible, but writes do not yet reconfigure the fixed-step physics engine."]),
  adapter("server.world.fogColor", "server.GameWorld.fogColor", "partial", ["The recovered GameRGBColor property is script-visible; client rendering propagation remains unimplemented."]),
  adapter("server.RuntimeEntity.onClick", "server.GameEntity.onClick", "partial", ["The declared GameClickEvent fields and world-to-target dispatch order are implemented when an authoritative entity binding exists."]),
  adapter("server.RuntimeEntity.nextClick", "server.GameEntity.nextClick", "partial", ["The recovered optional filter is implemented; resolution still depends on an authoritative entity binding."]),
  adapter("server.RuntimePlayer.onClick", "server.GameEntity.onClick", "partial", ["Clicked players receive the same GameClickEvent after world dispatch when their backend player id is authoritative."]),
  adapter("server.RuntimePlayer.nextClick", "server.GameEntity.nextClick", "partial", ["The recovered optional filter is implemented; resolution still depends on an authoritative backend player id."]),
  adapter("server.RuntimePlayer.walkButton", "server.GamePlayerEntity.walkButton", "compatible", []),
  adapter("server.RuntimePlayer.jumpButton", "server.GamePlayerEntity.jumpButton", "compatible", []),
  adapter("server.RuntimePlayer.action0Button", "server.GamePlayerEntity.action0Button", "compatible", []),
  adapter("server.RuntimePlayer.action1Button", "server.GamePlayerEntity.action1Button", "compatible", []),
  adapter("server.RuntimePlayer.enableAction0", "server.GamePlayerEntity.enableAction0", "partial", ["The recovered server input mask is implemented; authoritative Player Public flags are not yet written back to the client."]),
  adapter("server.RuntimePlayer.enableAction1", "server.GamePlayerEntity.enableAction1", "partial", ["The recovered server input mask is implemented; authoritative Player Public flags are not yet written back to the client."]),
  adapter("server.RuntimePlayer.enableJump", "server.GamePlayerEntity.enableJump", "partial", ["The recovered server input mask is implemented; authoritative Player Public flags are not yet written back to the client."]),
  adapter("server.RuntimePlayer.enableDoubleJump", "server.GamePlayerEntity.enableDoubleJump", "partial", ["The recovered server input mask is implemented; authoritative Player Public flags are not yet written back to the client."]),
  adapter("server.RuntimePlayer.color", "server.GamePlayer.color", "partial", ["The Script Runtime value and mutation API are present; authoritative client rendering propagation remains unverified."]),
  adapter("server.RuntimePlayer.spawnPoint", "server.GamePlayer.spawnPoint", "partial", ["The spawn point drives local forceRespawn; native validation and automatic respawn integration remain unverified."]),
  adapter("server.RuntimePlayer.onRespawn", "server.GamePlayer.onRespawn", "partial", ["Local forceRespawn emits the recovered event shape; automatic engine respawn triggers remain unverified."]),
  adapter("server.RuntimePlayer.nextRespawn", "server.GamePlayer.nextRespawn", "partial", ["The recovered optional filter is implemented; automatic engine respawn triggers remain unverified."]),
  adapter("server.RuntimePlayer.onPress", "server.GamePlayer.onPress", "compatible", []),
  adapter("server.RuntimePlayer.nextPress", "server.GamePlayer.nextPress", "compatible", []),
  adapter("server.RuntimePlayer.onRelease", "server.GamePlayer.onRelease", "compatible", []),
  adapter("server.RuntimePlayer.nextRelease", "server.GamePlayer.nextRelease", "compatible", []),
  adapter("server.RuntimePlayer.onTakeDamage", "server.GameEntity.onTakeDamage", "partial", ["Existing local RuntimePlayer.damage calls emit the recovered GameDamageEvent fields; native hurt producers and full damage/death state remain unverified."]),
  adapter("server.RuntimePlayer.nextTakeDamage", "server.GameEntity.nextTakeDamage", "partial", ["The recovered optional filter is implemented; native damage producers remain unverified."]),
  adapter("server.RuntimePlayer.forceRespawn", "server.GamePlayer.forceRespawn", "partial", ["Position, velocity, contacts, triggers, backend state, and respawn events are updated; native death-state side effects remain unverified."]),
  adapter("server.global.voxels", "server.global.voxels", "compatible", []),
  adapter("server.GameVoxels.getVoxelId", "server.GameVoxels.getVoxelId", "compatible", []),
  adapter("server.GameVoxels.setVoxelId", "server.GameVoxels.setVoxelId", "compatible", []),
  adapter("server.GameVoxels.id", "server.GameVoxels.id", "compatible", []),
  adapter("server.GameVoxels.setVoxel", "server.GameVoxels.setVoxel", "compatible", ["Four Chinese string rotation aliases remain unresolved because the recovered historical source contains mojibake at those switch cases."]),
  adapter("server.GameVoxels.getVoxel", "server.GameVoxels.getVoxel", "compatible", []),
  adapter("server.GameVoxels.name", "server.GameVoxels.name", "compatible", []),
  adapter("server.GameVoxels.getVoxelRotation", "server.GameVoxels.getVoxelRotation", "compatible", []),
  adapter("server.GameVoxels.shape", "server.GameVoxels.shape", "compatible", []),
  adapter("server.GameVoxels.VoxelTypes", "server.GameVoxels.VoxelTypes", "compatible", []),
  adapter("server.GameGUI.init", "server.GameGUI.init", "compatible", []),
  adapter("server.GameGUI.show", "server.GameGUI.show", "compatible", []),
  adapter("server.GameGUI.remove", "server.GameGUI.remove", "compatible", []),
  adapter("server.GameGUI.getAttribute", "server.GameGUI.getAttribute", "compatible", []),
  adapter("server.GameGUI.setAttribute", "server.GameGUI.setAttribute", "compatible", []),
  adapter("server.GameGUI.onMessage", "server.GameGUI.onMessage", "compatible", []),
  adapter("server.GameGUI.ui", "server.GameGUI.ui", "compatible", []),
  adapter("server.GameStorage.getDataStorage", "server.GameStorage.getDataStorage", "partial", ["Local JSON persistence implements the recovered data-space operations; native cloud scope, quotas, consistency, and version semantics remain unverified."]),
  adapter("server.GameStorage.getGroupStorage", "server.GameStorage.getGroupStorage", "partial", ["The function surface exists, but default project runtimes disable cross-map group storage because no authoritative group identity/configuration is available."]),
  adapter("server.remoteChannel.onServerEvent", "server.remoteChannel.onServerEvent", "compatible", []),
  adapter("server.remoteChannel.sendClientEvent", "server.remoteChannel.sendClientEvent", "compatible", ["RuntimePlayer remains a subset of historical GamePlayerEntity."]),
  adapter("server.remoteChannel.broadcastClientEvent", "server.remoteChannel.broadcastClientEvent", "compatible", ["RuntimePlayer remains a subset of historical GamePlayerEntity."]),
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
  raycastSource: {
    path: relativeGameRaycastPath,
    bytes: Buffer.byteLength(gameRaycastSource),
    sha256: createHash("sha256").update(gameRaycastSource).digest("hex"),
  },
  guiSource: { path: relativeGameGuiPath, bytes: Buffer.byteLength(gameGuiSource), sha256: createHash("sha256").update(gameGuiSource).digest("hex") },
  storageSource: { path: relativeGameStoragePath, bytes: Buffer.byteLength(gameStorageSource), sha256: createHash("sha256").update(gameStorageSource).digest("hex") },
  worldSource: { path: relativeGameWorldPath, bytes: Buffer.byteLength(gameWorldSource), sha256: createHash("sha256").update(gameWorldSource).digest("hex") },
  zonesSource: { path: relativeGameZonesPath, bytes: Buffer.byteLength(gameZonesSource), sha256: createHash("sha256").update(gameZonesSource).digest("hex") },
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

function gameButtonTypeEntries() {
  const values = { WALK: "walk", RUN: "run", CROUCH: "crouch", JUMP: "jump", DOUBLE_JUMP: "jump2", FLY: "fly", ACTION0: "action0", ACTION1: "action1" };
  const evidence = [
    { type: "local-source", path: relativeSourcePath, symbol: "GameButtonType", confidence: "direct" },
    { type: "declaration", path: "origin/third-party/ArenaPro-CLI/server/types/GameAPI.d.ts", symbol: "GameButtonType", confidence: "direct" },
    { type: "historical-bundle", path: "local-player/archive/project/bedwars/client-runtime/assets/_next/static/chunks/734.8dcb480d99773395.js", symbol: "GameButtonType", confidence: "direct" },
    { type: "test", path: "demo-map/test/runtime.test.mjs", symbol: "game-net input events reconstruct GameInputEvent press and release payloads", confidence: "direct" },
  ];
  const object = entry("server.global.GameButtonType", "object", null, "GameButtonType", { type: "Readonly<GameButtonType>" }, null, "emulated");
  object.evidence = evidence;
  return [object, ...Object.entries(values).map(([name, value]) => {
    const member = entry(`server.GameButtonType.${name}`, "property", "GameButtonType", name, { type: JSON.stringify(value), readonly: true }, null, "emulated");
    member.evidence = evidence;
    return member;
  })];
}

function worldSizeEntry() {
  const value = entry("server.world.size", "property", "world", "size", {
    type: "Readonly<{x:number,y:number,z:number}>",
    readonly: true,
  }, null, "emulated");
  value.notes = ["Recovered-only native surface: real scripts read x/y/z as inclusive maximum voxel coordinates; no public DAO3 declaration or historical GameWorld class member was found."];
  value.evidence = [
    { type: "local-source", path: relativeSourcePath, symbol: "world.size", confidence: "direct" },
    { type: "local-source", path: relativeGameVoxelsPath, symbol: "GameVoxelsRuntime.shape", confidence: "direct" },
    { type: "script-corpus", path: "runtime-compat/evidence/script-corpus-usage.json", symbol: "world.size", confidence: "direct" },
    { type: "test", path: "demo-map/test/runtime.test.mjs", symbol: "GameWorld.size exposes recovered maximum voxel indices", confidence: "direct" },
  ];
  return value;
}

function worldValueEntry(id, name, type) {
  const value = entry(id, "property", "world", name, { type, readonly: false }, null, "partial", [`server.GameWorld.${name}`]);
  value.evidence = [
    { type: "local-source", path: relativeGameWorldPath, symbol: `GameWorld.${name}`, confidence: "direct" },
    { type: "origin-source", path: "origin/origin/origin/api/GameWorld.js", symbol: `GameWorld.${name}`, confidence: "direct" },
  ];
  return value;
}

function guiEntry(id, kind, name, signature) {
  const value = entry(id, kind, "GameGUI", name, signature, null, "compatible", [id]);
  value.evidence = [
    { type: "local-source", path: relativeGameGuiPath, symbol: `GameGuiRuntime.${name}`, confidence: "direct" },
    { type: "declaration", path: "origin/third-party/ArenaPro-CLI/server/types/GameAPI.d.ts", symbol: `GameGUI.${name}`, confidence: "direct" },
    { type: "origin-source", path: "origin/origin/origin/api/GameGUI.js", symbol: `GameGUI.${name}`, confidence: "direct" },
    { type: "origin-source", path: "origin/origin/origin/shell/GUIScriptShell.js", symbol: `GUIScriptShell.${name}`, confidence: "direct" },
    { type: "protocol-schema", path: "Lokibox/box-go/protocol.ts", symbol: "gui", confidence: "direct" },
    { type: "test", path: "demo-map/test/game-gui.test.mjs", symbol: "GameGUI command surface", confidence: "direct" },
    { type: "test", path: "runtime-compat/test/backend-gui-transport.test.mjs", symbol: "Player GUI transport conformance", confidence: "direct" },
  ];
  return value;
}

function storageEntry(id, name) {
  const value = entry(id, "method", "GameStorage", name, { parameters: [{ name: "key", type: "string" }], returns: "GameDataStorage" }, null, "partial", [id]);
  value.evidence = [
    { type: "local-source", path: relativeGameStoragePath, symbol: `LocalGameStorage.${name}`, confidence: "direct" },
    { type: "origin-source", path: "origin/origin/origin/api/GameStorage.js", symbol: `GameStorage.${name}`, confidence: "direct" },
    { type: "declaration", path: "origin/third-party/ArenaPro-CLI/server/types/GameAPI.d.ts", symbol: `GameStorage.${name}`, confidence: "direct" },
    { type: "test", path: "demo-map/test/game-storage.test.mjs", symbol: "GameDataStorage persistence surface", confidence: "direct" },
  ];
  return value;
}

function raycastEntry() {
  const value = entry("server.world.raycast", "method", "world", "raycast", {
    parameters: [
      { name: "origin", type: "GameVector3" },
      { name: "direction", type: "GameVector3" },
      { name: "options", type: "Partial<GameRaycastOptions>", optional: true },
    ],
    returns: "GameRaycastResult",
  }, "server.world.entities", "partial", ["server.GameWorld.raycast"]);
  value.notes = ["Implemented from DAO3 documentation, ArenaPro declarations, historical ScriptWorldSync source, BlockInfo fluid records, and real captured script usage. The recovered source proves an Infinity default, zero-direction preservation, entity-first then voxel-nearest resolution, and zero-vector no-hit intersection fields; engine raycastBoxes orientation semantics remain explicit in the adapter map."];
  value.evidence = [
    { type: "local-source", path: relativeGameRaycastPath, symbol: "raycastWorld", confidence: "direct" },
    { type: "docs", path: "dao3-docs-mirror/markdown/api/GameWorld/querySelectorEntity.md", symbol: "GameWorld.raycast", confidence: "direct" },
    { type: "origin-source", path: "origin/origin/origin/api/GameRaycastResult.js", symbol: "GameRaycastResult", confidence: "direct" },
    { type: "origin-source", path: "origin/origin/origin/sync/ScriptWorldSync.js", symbol: "ScriptWorldSync.raycast", confidence: "direct" },
    { type: "test", path: "demo-map/test/game-raycast.test.mjs", symbol: "GameWorld.raycast conformance", confidence: "direct" },
  ];
  return value;
}

function voxelEntry(id, kind, owner, name, signature, phase = 1) {
  const value = entry(id, kind, owner, name, signature, null, "emulated");
  value.notes = ["Implemented from the preserved BlockInfo catalog and historical ScriptVoxelSync behavior; see the phase-specific evidence map."];
  value.evidence = [
    { type: "local-source", path: relativeGameVoxelsPath, symbol: `GameVoxelsRuntime.${name}`, confidence: "direct" },
    { type: "origin-source", path: "origin/origin/origin/sync/ScriptVoxelSync.js", symbol: name, confidence: "direct" },
    { type: "docs", path: "dao3-docs-mirror/markdown/api/GameVoxels/operate.md", symbol: name, confidence: "direct" },
    { type: "declaration", path: "origin/third-party/ArenaPro-CLI/server/types/GameAPI.d.ts", symbol: `GameVoxels.${name}`, confidence: "direct" },
    { type: "evidence-map", path: `runtime-compat/evidence/server-voxels-phase-${phase}.json`, symbol: id, confidence: "direct" },
  ];
  return value;
}

function handler(eventType) {
  return { parameters: [{ name: "handler", type: `(${eventType})=>void` }], returns: "listener-token" };
}

function adapter(localId, canonicalId, status, gaps) {
  return { localId, canonicalId, status, gaps };
}
