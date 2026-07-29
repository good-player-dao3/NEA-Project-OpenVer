import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EventSignal } from "./event-signal.mjs";
import { FixedStepPlayerPhysics } from "./physics/fixed-step-physics.mjs";
import { PlayerPhysicsBody } from "./physics/player-body.mjs";
import { VoxelCollisionWorld } from "./physics/voxel-collision-world.mjs";
import { Vector3 } from "./vector3.mjs";

const KNOWN_CAPABILITIES = new Set([
  "server.world.events",
  "server.world.chat",
  "server.world.entities",
  "server.player",
  "server.player.write",
  "server.remote-channel",
]);

export class ScriptRuntime {
  #context;
  #interval;
  #timers = new Set();
  #players = new Map();
  #entities = new Map();
  #messages = [];
  #outboundEvents = [];
  #signals = {
    tick: new EventSignal(),
    playerJoin: new EventSignal(),
    playerLeave: new EventSignal(),
    clientEvent: new EventSignal(),
    voxelContact: new EventSignal(),
    voxelSeparate: new EventSignal(),
    contact: new EventSignal(),
    contactSeparate: new EventSignal(),
    triggerEnter: new EventSignal(),
    triggerLeave: new EventSignal(),
  };

  constructor(options) {
    this.projectRoot = resolve(options.projectRoot);
    this.tickRate = options.tickRate;
    this.capabilities = new Set(options.capabilities);
    this.logger = options.logger ?? console;
    this.entry = options.entry;
    this.runtimeApiVersion = options.runtimeApiVersion;
    this.serverContract = options.serverContract;
    this.compatibilityLevel = options.compatibilityLevel;
    this.playerBodyProfile = options.physics?.playerBody;
    if (!this.playerBodyProfile) throw new Error("Runtime requires an explicit player body profile");
    this.sendClientEvent = options.sendClientEvent ?? (() => {});
    this.writePlayerState = options.writePlayerState ?? (() => {});
    this.collisionWorld = new VoxelCollisionWorld({
      voxels: options.voxels ?? [],
      materials: options.physics?.materials ?? {},
      colliders: options.physics?.colliders ?? [],
      triggers: options.physics?.triggers ?? [],
    });
    this.physics = new FixedStepPlayerPhysics(this.collisionWorld, options.physics);
    this.currentTick = 0;
    this.started = false;
    for (const capability of this.capabilities) {
      if (!KNOWN_CAPABILITIES.has(capability)) throw new Error(`Unknown runtime capability: ${capability}`);
    }
    for (const entity of options.entities ?? []) this.#entities.set(entity.id, createRuntimeEntity(entity));
  }

  static async load(projectRoot, options = {}) {
    const root = resolve(projectRoot);
    const project = JSON.parse(await readFile(resolve(root, "dao3.project.json"), "utf8"));
    const world = JSON.parse(await readFile(resolve(root, project.world), "utf8"));
    const scriptManifest = JSON.parse(await readFile(resolve(root, project.scripts), "utf8"));
    const entitySnapshot = JSON.parse(await readFile(resolve(root, world.entities), "utf8"));
    const terrainSnapshot = JSON.parse(await readFile(resolve(root, world.terrain), "utf8"));
    const physicsSnapshot = world.physics
      ? JSON.parse(await readFile(resolve(root, world.physics), "utf8"))
      : {};
    const entities = (entitySnapshot.entities ?? []).map((entity, index) => ({
      id: entity.tags?.find(tag => tag.startsWith("id-"))?.slice(3) ?? `entity-${index + 1}`,
      kind: entity.kind,
      position: entity.position,
      tags: entity.tags ?? [],
    }));
    if (scriptManifest.entry === null) throw new Error("Project has no server script entry");
    if (scriptManifest.contract?.side !== "server") throw new Error("Script manifest must bind a server runtime contract");
    if (scriptManifest.contract.id !== project.engine.serverContract) throw new Error("Server runtime contract mismatch");
    if (scriptManifest.contract.apiVersion !== project.engine.runtimeApiVersion) throw new Error("Server runtime API version mismatch");
    return new ScriptRuntime({
      projectRoot: root,
      tickRate: project.engine.tickRate,
      capabilities: scriptManifest.capabilities ?? [],
      entry: scriptManifest.entry,
      runtimeApiVersion: project.engine.runtimeApiVersion,
      serverContract: project.engine.serverContract,
      compatibilityLevel: project.engine.compatibilityLevel,
      entities,
      voxels: terrainSnapshot.voxels ?? [],
      logger: options.logger,
      sendClientEvent: options.sendClientEvent,
      writePlayerState: options.writePlayerState,
      physics: { ...physicsSnapshot, ...options.physics },
    });
  }

  async start() {
    if (this.started) return;
    const source = await readFile(resolve(this.projectRoot, this.entry), "utf8");
    this.#context = vm.createContext(this.#createGlobals(), {
      name: `nea-script:${this.projectRoot}`,
      codeGeneration: { strings: false, wasm: false },
    });
    const script = new vm.Script(source, { filename: this.entry, displayErrors: true });
    script.runInContext(this.#context, { timeout: 1_000 });
    this.started = true;
    this.#interval = setInterval(() => this.tick(), 1000 / this.tickRate);
    this.#interval.unref?.();
  }

  stop() {
    if (this.#interval !== undefined) clearInterval(this.#interval);
    this.#interval = undefined;
    for (const timer of this.#timers) clearTimeout(timer);
    this.#timers.clear();
    Object.values(this.#signals).forEach(signal => signal.clear());
    this.started = false;
  }

  tick() {
    const prevTick = this.currentTick;
    this.currentTick += 1;
    const deltaTime = 1 / this.tickRate;
    for (const player of this.#players.values()) {
      const contacts = player._authority === "backend"
        ? this.physics.observe(player._body)
        : this.physics.step(player._body, deltaTime);
      for (const contact of contacts.entered) {
        const event = createContactEvent(this.currentTick, player, contact);
        this.#signals.contact.emit(event, error => this.#reportError("contact", error));
        if (contact.collider.kind === "voxel") this.#signals.voxelContact.emit(event, error => this.#reportError("voxelContact", error));
      }
      for (const contact of contacts.separated) {
        const event = createContactEvent(this.currentTick, player, contact);
        this.#signals.contactSeparate.emit(event, error => this.#reportError("contactSeparate", error));
        if (contact.collider.kind === "voxel") this.#signals.voxelSeparate.emit(event, error => this.#reportError("voxelSeparate", error));
      }
      for (const trigger of contacts.triggerEntered) {
        this.#signals.triggerEnter.emit(triggerEvent(player, trigger), error => this.#reportError("triggerEnter", error));
      }
      for (const trigger of contacts.triggerLeft) {
        this.#signals.triggerLeave.emit(triggerEvent(player, trigger), error => this.#reportError("triggerLeave", error));
      }
    }
    this.#signals.tick.emit(
      createGameTickEvent(this.currentTick, prevTick, deltaTime * 1_000, false),
      error => this.#reportError("tick", error),
    );
  }

  addPlayer(input = {}) {
    this.#require("server.world.events");
    const id = String(input.id ?? `guest-${this.#players.size + 1}`);
    const existing = this.#players.get(id);
    if (existing) return existing;
    const player = createRuntimePlayer(this, {
      id,
      name: input.name ?? "Guest",
      position: input.position ?? [0, 0, 0],
      authority: input.authority ?? "runtime",
    });
    this.#players.set(id, player);
    this.#signals.playerJoin.emit(createGameEntityEvent(this.currentTick, player), error => this.#reportError("playerJoin", error));
    return player;
  }

  removePlayer(id) {
    const player = this.#players.get(id);
    if (!player) return false;
    this.#players.delete(id);
    this.#signals.playerLeave.emit(createGameEntityEvent(this.currentTick, player), error => this.#reportError("playerLeave", error));
    return true;
  }

  dispatchClientEvent(playerId, event) {
    this.#require("server.remote-channel");
    const player = this.#players.get(playerId);
    if (!player) return false;
    this.#signals.clientEvent.emit(Object.freeze({ player, event: structuredClone(event) }), error => this.#reportError("clientEvent", error));
    return true;
  }

  applyAuthoritativeState(playerId, state) {
    const player = this.#players.get(playerId);
    if (!player || player._authority !== "backend") return false;
    if (this.currentTick < player._writeBarrierTick) return false;
    const version = Number(state.tick ?? 0);
    if (Number.isFinite(version) && version < player._stateVersion) return false;
    if (state.position) player._body.position.copy(Vector3.from(state.position));
    if (state.velocity) player._body.velocity.copy(Vector3.from(state.velocity));
    if (Object.hasOwn(state, "bodyHalfExtents") || Object.hasOwn(state, "bodyShapeHalfExtents")) {
      const shape = state.bodyHalfExtents === null && state.bodyShapeHalfExtents === null
        ? null
        : { boundsHalfExtents: state.bodyHalfExtents, shapeHalfExtents: state.bodyShapeHalfExtents };
      player._body.applyAuthoritativePostureShape(shape);
    }
    player._stateVersion = Number.isFinite(version) ? version : player._stateVersion + 1;
    player._backendPlayerId = state.playerId ?? player._backendPlayerId;
    player._lastBackendTick = Number.isFinite(version) ? version : player._lastBackendTick;
    return true;
  }

  snapshot() {
    return Object.freeze({
      tick: this.currentTick,
      players: Object.freeze([...this.#players.values()].map(player => player.snapshot())),
      entities: Object.freeze([...this.#entities.values()].map(entity => entity.snapshot())),
      messages: Object.freeze(this.#messages.map(message => ({ ...message }))),
      outboundEvents: Object.freeze(this.#outboundEvents.map(event => structuredClone(event))),
      physics: this.collisionWorld.diagnostics(),
    });
  }

  #createGlobals() {
    const world = Object.freeze({
      get currentTick() { return runtime.currentTick; },
      onTick: handler => this.#listen("server.world.events", this.#signals.tick, handler),
      onPlayerJoin: handler => this.#listen("server.world.events", this.#signals.playerJoin, handler),
      onPlayerLeave: handler => this.#listen("server.world.events", this.#signals.playerLeave, handler),
      onVoxelContact: handler => this.#listen("server.world.events", this.#signals.voxelContact, handler),
      onVoxelSeparate: handler => this.#listen("server.world.events", this.#signals.voxelSeparate, handler),
      onContact: handler => this.#listen("server.world.events", this.#signals.contact, handler),
      onContactSeparate: handler => this.#listen("server.world.events", this.#signals.contactSeparate, handler),
      onTriggerEnter: handler => this.#listen("server.world.events", this.#signals.triggerEnter, handler),
      onTriggerLeave: handler => this.#listen("server.world.events", this.#signals.triggerLeave, handler),
      nextTick: () => this.#next("server.world.events", this.#signals.tick),
      nextPlayerJoin: () => this.#next("server.world.events", this.#signals.playerJoin),
      say: message => {
        this.#require("server.world.chat");
        const text = String(message);
        this.#messages.push({ tick: this.currentTick, text });
        this.logger.info(`[script:world] ${text}`);
      },
      createEntity: spec => {
        this.#require("server.world.entities");
        const id = spec?.id ?? `runtime-entity-${this.#entities.size + 1}`;
        if (this.#entities.has(id)) throw new Error(`Entity already exists: ${id}`);
        const entity = createRuntimeEntity({ id, kind: spec?.kind ?? "entity", position: spec?.position ?? [0, 0, 0], tags: spec?.tags ?? [] });
        this.#entities.set(id, entity);
        return entity;
      },
      querySelector: selector => this.#query(selector)[0] ?? null,
      querySelectorAll: selector => Object.freeze(this.#query(selector)),
    });
    const remoteChannel = Object.freeze({
      onClientEvent: handler => this.#listen("server.remote-channel", this.#signals.clientEvent, handler),
      nextClientEvent: () => this.#next("server.remote-channel", this.#signals.clientEvent),
      sendClientEvent: (player, event) => {
        this.#require("server.remote-channel");
        this.#outboundEvents.push({ playerId: player.id, event: structuredClone(event) });
        this.logger.info(`[script:remote] -> ${player.name} ${JSON.stringify(event)}`);
        Promise.resolve(this.sendClientEvent(player.id, structuredClone(event))).catch(error => this.#reportError("remote-send", error));
      },
    });
    const runtime = this;
    return Object.freeze({
      world,
      remoteChannel,
      Vector3,
      GameVector3: Vector3,
      Vec3: Object.freeze({ create: value => Vector3.from(value) }),
      console: Object.freeze({
        log: (...values) => this.logger.info(`[script] ${values.map(formatValue).join(" ")}`),
        info: (...values) => this.logger.info(`[script] ${values.map(formatValue).join(" ")}`),
        warn: (...values) => this.logger.warn(`[script] ${values.map(formatValue).join(" ")}`),
        error: (...values) => this.logger.error(`[script] ${values.map(formatValue).join(" ")}`),
      }),
      setTimeout: (handler, milliseconds, ...args) => this.#schedule(handler, milliseconds, args),
      clearTimeout: timer => {
        this.#timers.delete(timer);
        clearTimeout(timer);
      },
      structuredClone,
    });
  }

  #listen(capability, signal, handler) {
    this.#require(capability);
    return signal.on(handler);
  }

  #next(capability, signal) {
    this.#require(capability);
    return signal.next();
  }

  #schedule(handler, milliseconds, args) {
    if (typeof handler !== "function") throw new TypeError("Timer handler must be a function");
    const delay = Math.max(0, Math.min(Number(milliseconds) || 0, 60_000));
    const timer = setTimeout(() => {
      this.#timers.delete(timer);
      try {
        handler(...args);
      } catch (error) {
        this.#reportError("timer", error);
      }
    }, delay);
    timer.unref?.();
    this.#timers.add(timer);
    return timer;
  }

  #query(selector) {
    this.#require("server.world.entities");
    if (typeof selector !== "string" || !/^\.[a-z0-9][a-z0-9-]{0,63}$/.test(selector)) {
      throw new Error("Demo runtime currently supports tag selectors such as .spawn only");
    }
    const tag = selector.slice(1);
    return [...this.#entities.values()].filter(entity => entity.tags.has(tag));
  }

  #require(capability) {
    if (!this.capabilities.has(capability)) throw new Error(`Script capability not granted: ${capability}`);
  }

  #reportError(source, error) {
    this.logger.error(`[script:${source}] ${error instanceof Error ? error.stack ?? error.message : error}`);
  }

  _writePlayer(player, field, value) {
    this.#require("server.player.write");
    if (field === "name") player._name = String(value).slice(0, 64);
    else if (field === "position") player._body.position.copy(Vector3.from(value));
    else if (field === "velocity") player._body.velocity.copy(Vector3.from(value));
    if (field === "position" || field === "velocity") this.#queuePlayerStateWrite(player);
  }

  _messagePlayer(player, message) {
    this.#require("server.world.chat");
    const text = String(message);
    this.#messages.push({ tick: this.currentTick, playerId: player.id, text });
    this.logger.info(`[script:player:${player.name}] ${text}`);
  }

  _applyImpulse(player, value) {
    this.#require("server.player.write");
    const impulse = Vector3.from(value);
    player._body.velocity.x += impulse.x;
    player._body.velocity.y += impulse.y;
    player._body.velocity.z += impulse.z;
    this.#queuePlayerStateWrite(player);
  }

  _damagePlayer(player, amount) {
    this.#require("server.player.write");
    const damage = Number(amount);
    if (!Number.isFinite(damage) || damage < 0) throw new TypeError("Damage must be a non-negative finite number");
    player._health = Math.max(0, player._health - damage);
    return player._health;
  }

  #queuePlayerStateWrite(player) {
    if (player._authority !== "backend") return;
    player._stateVersion += 1;
    player._writeBarrierTick = this.currentTick + 4;
    const state = {
      position: player._body.position.toArray(),
      velocity: player._body.velocity.toArray(),
      version: player._stateVersion,
    };
    Promise.resolve(this.writePlayerState(player.id, state)).catch(error => this.#reportError("state-write", error));
  }
}

export function createRuntimeEntity(input) {
  const tags = new Set(input.tags ?? []);
  const position = Vector3.from(input.position ?? [0, 0, 0]);
  return {
    _id: String(input.id),
    _kind: input.kind ?? "entity",
    _position: position,
    _tags: tags,
    get id() { return this._id; },
    get kind() { return this._kind; },
    get position() { return this._position; },
    set position(value) { this._position.copy(Vector3.from(value)); },
    get tags() { return this._tags; },
    snapshot() {
      return Object.freeze({ id: this.id, kind: this.kind, position: this.position.toArray(), tags: [...this.tags].sort() });
    },
  };
}

function createRuntimePlayer(runtime, input) {
  const body = new PlayerPhysicsBody({ position: input.position, profile: runtime.playerBodyProfile });
  const player = {
    _id: String(input.id),
    _name: String(input.name),
    _body: body,
    _health: 100,
    _authority: input.authority,
    _stateVersion: 0,
    _backendPlayerId: null,
    _lastBackendTick: 0,
    _writeBarrierTick: 0,
    get id() { return this._id; },
    get name() { return this._name; },
    set name(value) { runtime._writePlayer(this, "name", value); },
    get position() { return this._body.position; },
    set position(value) { runtime._writePlayer(this, "position", value); },
    get velocity() { return this._body.velocity; },
    set velocity(value) { runtime._writePlayer(this, "velocity", value); },
    get grounded() { return this._body.grounded; },
    get health() { return this._health; },
    applyImpulse(value) { runtime._applyImpulse(this, value); },
    damage(amount) { return runtime._damagePlayer(this, amount); },
    sendMessage(message) { runtime._messagePlayer(this, message); },
    snapshot() {
      return Object.freeze({
        id: this.id,
        name: this.name,
        position: this.position.toArray(),
        velocity: this.velocity.toArray(),
        collision: this._body.collisionSnapshot(),
        grounded: this.grounded,
        health: this.health,
        authority: this._authority,
        stateVersion: this._stateVersion,
        backendPlayerId: this._backendPlayerId,
        lastBackendTick: this._lastBackendTick,
        writeBarrierTick: this._writeBarrierTick,
      });
    },
  };
  return player;
}

export function createContactEvent(tick, entity, contact) {
  const collider = contact.collider;
  const axis = Vector3.from(contact.normal);
  const extension = {
    player: entity,
    collider: Object.freeze({ kind: collider.kind, id: collider.id, tags: collider.tags, material: collider.material }),
    normal: axis,
    compatibility: contactCompatibility("force"),
  };
  if (collider.kind === "voxel") {
    return Object.freeze({
      tick,
      entity,
      x: collider.x,
      y: collider.y,
      z: collider.z,
      voxel: collider.blockId,
      axis,
      force: null,
      ...extension,
    });
  }
  return Object.freeze({
    tick,
    entity,
    other: null,
    axis,
    force: null,
    ...extension,
  });
}

function contactCompatibility(...unresolved) {
  return Object.freeze({ canonical: "partial", unresolved: Object.freeze(unresolved) });
}

function triggerEvent(player, trigger) {
  return Object.freeze({
    player,
    trigger: Object.freeze({ id: trigger.id, tags: trigger.tags, material: trigger.material }),
  });
}

function formatValue(value) {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

export function createGameTickEvent(tick, prevTick, elapsedTimeMS, skip) {
  return Object.freeze({
    tick,
    prevTick,
    elapsedTimeMS,
    skip: Boolean(skip),
    deltaTime: elapsedTimeMS / 1_000,
  });
}

export function createGameEntityEvent(tick, entity) {
  return Object.freeze({ tick, entity, player: entity });
}
