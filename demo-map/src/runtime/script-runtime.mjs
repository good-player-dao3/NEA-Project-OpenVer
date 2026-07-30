import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EventSignal } from "./event-signal.mjs";
import { FixedStepPlayerPhysics } from "./physics/fixed-step-physics.mjs";
import { PlayerPhysicsBody } from "./physics/player-body.mjs";
import { VoxelCollisionWorld } from "./physics/voxel-collision-world.mjs";
import { GameVoxelsRuntime } from "./game-voxels.mjs";
import { CommonJsModuleLoader } from "./commonjs-module-loader.mjs";
import { LocalGameStorage } from "./game-storage.mjs";
import { GameGuiRuntime } from "./game-gui.mjs";
import { Vector3 } from "./vector3.mjs";
import { GameQuaternion } from "./quaternion.mjs";
import { GameRGBColor, GameRGBAColor } from "./colors.mjs";
import { GameBounds3, GameZoneSystem } from "./game-zones.mjs";
import { GameWorld } from "./game-world.mjs";
import { GameSoundEffect } from "./game-sound-effect.mjs";
import { GameBodyPart } from "./game-body-part.mjs";
import { raycastWorld } from "./game-raycast.mjs";

const EMPTY_PLAYER_TAGS = Object.freeze(new Set());

export const GameButtonType = Object.freeze({
  WALK: "walk",
  RUN: "run",
  CROUCH: "crouch",
  JUMP: "jump",
  DOUBLE_JUMP: "jump2",
  FLY: "fly",
  ACTION0: "action0",
  ACTION1: "action1",
});

const INPUT_BUTTONS = Object.freeze([
  Object.freeze({ mask: 1, button: GameButtonType.ACTION0 }),
  Object.freeze({ mask: 2, button: GameButtonType.ACTION1 }),
  Object.freeze({ mask: 4, button: GameButtonType.JUMP }),
  Object.freeze({ mask: 8, button: GameButtonType.WALK }),
  Object.freeze({ mask: 16, button: GameButtonType.CROUCH }),
  Object.freeze({ mask: 32, button: GameButtonType.RUN }),
  Object.freeze({ mask: 64, button: GameButtonType.DOUBLE_JUMP }),
  Object.freeze({ mask: 128, button: GameButtonType.FLY }),
]);

const PLAYER_INPUT_PERMISSIONS = Object.freeze([
  Object.freeze({ mask: 1, property: "enableAction0" }),
  Object.freeze({ mask: 2, property: "enableAction1" }),
  Object.freeze({ mask: 4, property: "enableJump" }),
  Object.freeze({ mask: 16, property: "enableCrouch" }),
  Object.freeze({ mask: 64, property: "enableDoubleJump" }),
]);

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
  #moduleLoader;
  #moduleEnvironment = {};
  #moduleEnvironmentKey = "__neaCommonJsModuleEnvironment";
  #timers = new Set();
  #players = new Map();
  #playerIds = new WeakMap();
  #entities = new Map();
  #messages = [];
  #outboundEvents = [];
  #collisionFilters = new Map();
  #signals = {
    tick: new EventSignal(),
    playerJoin: new EventSignal(),
    playerLeave: new EventSignal(),
    respawn: new EventSignal(),
    takeDamage: new EventSignal(),
    clientEvent: new EventSignal(),
    chat: new EventSignal(),
    press: new EventSignal(),
    click: new EventSignal(),
    release: new EventSignal(),
    fluidEnter: new EventSignal(),
    fluidLeave: new EventSignal(),
    die: new EventSignal(),
    entityContact: new EventSignal(),
    playerPurchaseSuccess: new EventSignal(),
    keyDown: new EventSignal(),
    keyUp: new EventSignal(),
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
    this.moduleSources = options.modules;
    this.storage = options.storage ?? new LocalGameStorage({ file: resolve(this.projectRoot, ".runtime-storage.json") });
    this.gui = options.gui ?? new GameGuiRuntime({
      transport: options.sendGuiCommand,
      resolvePlayerId: entity => this.#playerIds.get(entity) ?? entity?.id,
    });
    this.zones = new GameZoneSystem();
    this.runtimeApiVersion = options.runtimeApiVersion;
    this.serverContract = options.serverContract;
    this.compatibilityLevel = options.compatibilityLevel;
    this.playerBodyProfile = options.physics?.playerBody;
    if (!this.playerBodyProfile) throw new Error("Runtime requires an explicit player body profile");
    this.sendClientEvent = options.sendClientEvent ?? (() => {});
    this.writePlayerState = options.writePlayerState ?? (() => {});
    this.writeDamageState = options.writeDamageState ?? (() => {});
    this.destroyEntity = options.destroyEntity ?? (() => {});
    this.showDialog = options.showDialog ?? (() => Promise.reject(new Error("Dialog transport is not configured")));
    this.cancelDialogs = options.cancelDialogs ?? (() => false);
    this.collisionWorld = new VoxelCollisionWorld({
      voxels: options.voxels ?? [],
      materials: options.physics?.materials ?? {},
      colliders: options.physics?.colliders ?? [],
      triggers: options.physics?.triggers ?? [],
    });
    this.voxels = new GameVoxelsRuntime({ shape: options.shape, catalog: options.blockCatalog, collisionWorld: this.collisionWorld });
    this.physics = new FixedStepPlayerPhysics(this.collisionWorld, options.physics);
    this.currentTick = 0;
    this.started = false;
    for (const capability of this.capabilities) {
      if (!KNOWN_CAPABILITIES.has(capability)) throw new Error(`Unknown runtime capability: ${capability}`);
    }
    for (const entity of options.entities ?? []) this.#entities.set(entity.id, createRuntimeEntity(entity, this));
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
    const entities = (entitySnapshot.entities ?? []).map((entity, index) => {
      const packageTags = Array.isArray(entity.tags) ? entity.tags : [];
      const sourceTags = Array.isArray(entity.source?.tags) ? entity.source.tags : [];
      return {
        id: packageTags.find(tag => tag.startsWith("id-"))?.slice(3) ?? `entity-${index + 1}`,
        kind: entity.kind,
        name: entity.name ?? entity.source?.name,
        position: entity.position,
        tags: [...new Set([...sourceTags, ...packageTags])],
        source: entity.source,
        sourceIndex: index,
        enableDamage: entity.enableDamage ?? entity.source?.enableDamage,
        showHealthBar: entity.showHealthBar ?? entity.source?.showHealthBar,
        hp: entity.hp ?? entity.source?.hp,
        maxHp: entity.maxHp ?? entity.source?.maxHp,
      };
    });
    if (scriptManifest.entry === null) throw new Error("Project has no server script entry");
    const modulePaths = scriptManifest.modules ?? [scriptManifest.entry];
    if (!Array.isArray(modulePaths) || !modulePaths.includes(scriptManifest.entry)) throw new Error("Script manifest modules must include the entry");
    const modules = Object.fromEntries(await Promise.all(modulePaths.map(async modulePath => [modulePath, await readFile(resolve(root, modulePath), "utf8")])));
    if (scriptManifest.contract?.side !== "server") throw new Error("Script manifest must bind a server runtime contract");
    if (scriptManifest.contract.id !== project.engine.serverContract) throw new Error("Server runtime contract mismatch");
    if (scriptManifest.contract.apiVersion !== project.engine.runtimeApiVersion) throw new Error("Server runtime API version mismatch");
    return new ScriptRuntime({
      projectRoot: root,
      tickRate: project.engine.tickRate,
      capabilities: scriptManifest.capabilities ?? [],
      entry: scriptManifest.entry,
      modules,
      runtimeApiVersion: project.engine.runtimeApiVersion,
      serverContract: project.engine.serverContract,
      compatibilityLevel: project.engine.compatibilityLevel,
      entities,
      shape: world.shape,
      blockCatalog: options.blockCatalog,
      voxels: terrainSnapshot.voxels ?? [],
      logger: options.logger,
      sendClientEvent: options.sendClientEvent,
      writePlayerState: options.writePlayerState,
      writeDamageState: options.writeDamageState,
      destroyEntity: options.destroyEntity,
      sendGuiCommand: options.sendGuiCommand,
      showDialog: options.showDialog,
      cancelDialogs: options.cancelDialogs,
      physics: { ...physicsSnapshot, ...options.physics },
    });
  }

  async start() {
    if (this.started) return;
    const globals = this.#createGlobals();
    Object.defineProperty(globals, this.#moduleEnvironmentKey, { value: this.#moduleEnvironment });
    Object.freeze(globals);
    this.#context = vm.createContext(globals, {
      name: `nea-script:${this.projectRoot}`,
      codeGeneration: { strings: false, wasm: false },
    });
    this.#moduleLoader = new CommonJsModuleLoader({
      context: this.#context,
      modules: this.moduleSources,
      timeout: 1_000,
      environment: this.#moduleEnvironment,
      environmentKey: this.#moduleEnvironmentKey,
    });
    this.#moduleLoader.loadModule(this.entry);
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
    this.#playerIds.set(player, id);
    this.#players.set(id, player);
    this.#signals.playerJoin.emit(createGameEntityEvent(this.currentTick, player), error => this.#reportError("playerJoin", error));
    this.#queueDamageStateWrite(player);
    return player;
  }

  removePlayer(id) {
    const player = this.#players.get(id);
    if (!player) return false;
    this.#players.delete(id);
    this.#signals.playerLeave.emit(createGameEntityEvent(this.currentTick, player), error => this.#reportError("playerLeave", error));
    return true;
  }

  dispatchWorldEvent(type, playerId, details = {}) {
    const signal = this.#signals[type];
    const player = this.#players.get(playerId);
    if (!signal || !player) return false;
    signal.emit(Object.freeze({ tick: this.currentTick, entity: player, player, ...structuredClone(details) }), error => this.#reportError(type, error));
    player._signals?.[type]?.emit(Object.freeze({ tick: this.currentTick, entity: player, player, ...structuredClone(details) }), error => this.#reportError(type, error));
    return true;
  }

  bindBackendEntities(bindings) {
    if (!Array.isArray(bindings)) return 0;
    const entities = [...this.#entities.values()];
    let bound = 0;
    for (const binding of bindings) {
      const backendEntityId = Number(binding?.entityId);
      if (!Number.isSafeInteger(backendEntityId) || backendEntityId < 1) continue;
      let entity = null;
      if (Number.isSafeInteger(binding?.entityIndex) && binding.entityIndex >= 0) {
        entity = entities.find(candidate => candidate._sourceIndex === binding.entityIndex) ?? null;
      } else if (typeof binding?.sourceId === "string") {
        entity = this.#entities.get(binding.sourceId) ?? null;
      }
      if (!entity) continue;
      entity._backendEntityId = backendEntityId;
      this.#queueDamageStateWrite(entity);
      bound += 1;
    }
    return bound;
  }

  dispatchInputEvents(playerId, packet) {
    const player = this.#players.get(playerId);
    if (!player || !Array.isArray(packet?.events)) return 0;
    let dispatched = 0;
    for (const rawEvent of packet.events) {
      if (!isByte(rawEvent?.buttonState) || !isByte(rawEvent?.prevButtonState)) continue;
      const permissionMask = inputPermissionMask(player);
      const buttonState = rawEvent.buttonState & permissionMask;
      const prevButtonState = rawEvent.prevButtonState & permissionMask;
      updatePlayerButtonState(player, buttonState);
      const changed = buttonState ^ prevButtonState;
      if (changed === 0) continue;
      const raycast = reconstructInputRaycast(this, rawEvent);
      const position = Vector3.from(rawEvent.position ?? [0, 0, 0]);
      const pressedMask = changed & buttonState;
      if ((pressedMask & 3) !== 0 && raycast.hitEntity) {
        const button = (pressedMask & 1) !== 0 ? GameButtonType.ACTION0 : GameButtonType.ACTION1;
        const clickEvent = createGameClickEvent(rawEvent.tick, raycast.hitEntity, player, button, position.distance(raycast.hitPosition), position, raycast);
        this.#signals.click.emit(clickEvent, error => this.#reportError("click", error));
        raycast.hitEntity._signals.click.emit(clickEvent, error => this.#reportError("entityClick", error));
      }
      for (const { mask, button } of INPUT_BUTTONS) {
        if ((changed & mask) === 0) continue;
        const pressed = (buttonState & mask) !== 0;
        const event = createGameInputEvent(rawEvent.tick, player, position, button, pressed, raycast);
        const type = pressed ? "press" : "release";
        this.#signals[type].emit(event, error => this.#reportError(type, error));
        player._signals[type].emit(event, error => this.#reportError(type, error));
        dispatched += 1;
      }
    }
    return dispatched;
  }

  dispatchChat(playerId, message) {
    const player = this.#players.get(playerId);
    if (!player) return false;
    this.#signals.chat.emit(Object.freeze({ tick: this.currentTick, entity: player, player, message: String(message) }), error => this.#reportError("chat", error));
    return true;
  }

  dispatchGuiMessage(playerId, name, payload) {
    const player = this.#players.get(playerId);
    if (!player) return false;
    this.gui.dispatch(player, name, payload);
    return true;
  }

  dispatchClientEvent(playerId, event) {
    this.#require("server.remote-channel");
    const player = this.#players.get(playerId);
    if (!player) return false;
    this.#signals.clientEvent.emit(Object.freeze({ tick: this.currentTick, player, event: structuredClone(event) }), error => this.#reportError("clientEvent", error));
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
    const worldProperties = {
      get currentTick() { return runtime.currentTick; },
      get size() { return runtime.voxels.shape; },
      onTick: handler => this.#listen("server.world.events", this.#signals.tick, handler),
      onPlayerJoin: handler => this.#listen("server.world.events", this.#signals.playerJoin, handler),
      onPlayerLeave: handler => this.#listen("server.world.events", this.#signals.playerLeave, handler),
      onRespawn: handler => this.#listen("server.world.events", this.#signals.respawn, handler),
      nextRespawn: filter => this.#next("server.world.events", this.#signals.respawn, filter),
      onTakeDamage: handler => this.#listen("server.world.events", this.#signals.takeDamage, handler),
      nextTakeDamage: filter => this.#next("server.world.events", this.#signals.takeDamage, filter),
      onChat: handler => this.#listen("server.world.chat", this.#signals.chat, handler),
      nextChat: filter => this.#next("server.world.chat", this.#signals.chat, filter),
      onPress: handler => this.#listen("server.world.events", this.#signals.press, handler),
      nextPress: filter => this.#next("server.world.events", this.#signals.press, filter),
      onClick: handler => this.#listen("server.world.events", this.#signals.click, handler),
      nextClick: filter => this.#next("server.world.events", this.#signals.click, filter),
      onRelease: handler => this.#listen("server.world.events", this.#signals.release, handler),
      nextRelease: filter => this.#next("server.world.events", this.#signals.release, filter),
      onFluidEnter: handler => this.#listen("server.world.events", this.#signals.fluidEnter, handler),
      nextFluidEnter: filter => this.#next("server.world.events", this.#signals.fluidEnter, filter),
      onFluidLeave: handler => this.#listen("server.world.events", this.#signals.fluidLeave, handler),
      nextFluidLeave: filter => this.#next("server.world.events", this.#signals.fluidLeave, filter),
      onDie: handler => this.#listen("server.world.events", this.#signals.die, handler),
      nextDie: filter => this.#next("server.world.events", this.#signals.die, filter),
      onEntityContact: handler => this.#listen("server.world.events", this.#signals.entityContact, handler),
      nextEntityContact: filter => this.#next("server.world.events", this.#signals.entityContact, filter),
      onPlayerPurchaseSuccess: handler => this.#listen("server.world.events", this.#signals.playerPurchaseSuccess, handler),
      nextPlayerPurchaseSuccess: filter => this.#next("server.world.events", this.#signals.playerPurchaseSuccess, filter),
      onVoxelContact: handler => this.#listen("server.world.events", this.#signals.voxelContact, handler),
      onVoxelSeparate: handler => this.#listen("server.world.events", this.#signals.voxelSeparate, handler),
      onContact: handler => this.#listen("server.world.events", this.#signals.contact, handler),
      onContactSeparate: handler => this.#listen("server.world.events", this.#signals.contactSeparate, handler),
      onTriggerEnter: handler => this.#listen("server.world.events", this.#signals.triggerEnter, handler),
      onTriggerLeave: handler => this.#listen("server.world.events", this.#signals.triggerLeave, handler),
      nextTick: filter => this.#next("server.world.events", this.#signals.tick, filter),
      nextPlayerJoin: filter => this.#next("server.world.events", this.#signals.playerJoin, filter),
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
        const entity = createRuntimeEntity({
          id,
          name: spec?.name,
          kind: spec?.kind ?? "entity",
          position: spec?.position ?? [0, 0, 0],
          tags: spec?.tags ?? [],
          source: spec?.source,
          enableDamage: spec?.enableDamage,
          showHealthBar: spec?.showHealthBar,
          hp: spec?.hp,
          maxHp: spec?.maxHp,
        }, this);
        this.#entities.set(id, entity);
        return entity;
      },
      querySelector: selector => this.#query(selector)[0] ?? null,
      querySelectorAll: selector => Object.freeze(this.#query(selector)),
      testSelector: (entity, selector) => this.#matchesSelector(entity, selector),
      raycast: (origin, direction, options) => raycastWorld({
        origin,
        direction,
        options,
        voxels: this.voxels,
        entities: this.#allQueryableEntities(),
        matchesSelector: (entity, selector) => this.#matchesSelector(entity, selector),
      }),
      get zones() { return Object.freeze(runtime.zones.list()); },
      addZone: config => runtime.zones.add(config),
      removeZone: zone => runtime.zones.remove(zone),
      addCollisionFilter: (aSelector, bSelector) => {
        const pair = [aSelector, bSelector];
        this.#collisionFilters.set(JSON.stringify(pair), pair);
      },
      removeCollisionFilter: (aSelector, bSelector) => {
        this.#collisionFilters.delete(JSON.stringify([aSelector, bSelector]));
      },
      clearCollisionFilters: () => this.#collisionFilters.clear(),
      collisionFilters: () => [...this.#collisionFilters.values()].map(pair => [...pair]),
    };
    const world = Object.defineProperties(new GameWorld(), Object.getOwnPropertyDescriptors(worldProperties));
    const sendRemoteEvent = (player, event) => {
      const playerId = this.#playerIds.get(player);
      if (!playerId || !this.#players.has(playerId)) return;
      const clonedEvent = cloneJsonValue(event);
      this.#outboundEvents.push({ playerId, event: clonedEvent });
      this.logger.info(`[script:remote] -> ${player.name} ${JSON.stringify(clonedEvent)}`);
      Promise.resolve(this.sendClientEvent(playerId, structuredClone(clonedEvent))).catch(error => this.#reportError("remote-send", error));
    };
    const remoteChannel = Object.freeze({
      onClientEvent: handler => this.#listen("server.remote-channel", this.#signals.clientEvent, handler),
      nextClientEvent: filter => this.#next("server.remote-channel", this.#signals.clientEvent, filter),
      onServerEvent: handler => this.#listen("server.remote-channel", this.#signals.clientEvent, ({ tick, player, event }) => handler(Object.freeze({
        tick,
        entity: player,
        args: event,
      }))),
      sendClientEvent: (players, event) => {
        this.#require("server.remote-channel");
        for (const player of Array.isArray(players) ? players : [players]) sendRemoteEvent(player, event);
      },
      broadcastClientEvent: event => {
        this.#require("server.remote-channel");
        for (const player of this.#players.values()) sendRemoteEvent(player, event);
      },
    });
    const runtime = this;
    return {
      world,
      remoteChannel,
      storage: this.storage,
      gui: this.gui,
      voxels: this.voxels,
      Vector3,
      GameVector3: Vector3,
      GameQuaternion,
      GameRGBColor,
      GameRGBAColor,
      GameBounds3,
      GameButtonType,
      GameWorld,
      GameSoundEffect,
      GameBodyPart,
      Vec3: Object.freeze({ create: value => Vector3.from(value) }),
      console: Object.freeze({
        clear: () => this.logger.clear?.(),
        dir: () => {},
        dirxml: () => {},
        group: () => {},
        groupCollapsed: () => {},
        groupEnd: () => {},
        table: () => {},
        time: () => {},
        timeEnd: () => {},
        timeLog: () => {},
        timeStamp: () => {},
        trace: () => {},
        assert: (assertion, ...values) => { if (!assertion) this.logger.error(`[script] ${values.map(formatValue).join(" ")}`); },
        log: (...values) => this.logger.info(`[script] ${values.map(formatValue).join(" ")}`),
        info: (...values) => this.logger.info(`[script] ${values.map(formatValue).join(" ")}`),
        debug: (...values) => (this.logger.debug ?? this.logger.info)(`[script] ${values.map(formatValue).join(" ")}`),
        warn: (...values) => this.logger.warn(`[script] ${values.map(formatValue).join(" ")}`),
        error: (...values) => this.logger.error(`[script] ${values.map(formatValue).join(" ")}`),
      }),
      setTimeout: (handler, milliseconds, ...args) => this.#schedule(handler, milliseconds, args),
      setInterval: (handler, milliseconds, ...args) => this.#scheduleInterval(handler, milliseconds, args),
      clearTimeout: timer => {
        this.#timers.delete(timer);
        clearTimeout(timer);
      },
      clearInterval: timer => {
        this.#timers.delete(timer);
        clearInterval(timer);
      },
      sleep: milliseconds => new Promise(resolveSleep => this.#schedule(resolveSleep, milliseconds, [])),
      structuredClone,
    };
  }

  #listen(capability, signal, handler) {
    this.#require(capability);
    return signal.on(handler);
  }

  #next(capability, signal, filter) {
    this.#require(capability);
    return signal.next(filter);
  }

  #schedule(handler, milliseconds, args) {
    if (typeof handler !== "function") throw new TypeError("Timer handler must be a function");
    const delay = Math.max(0, Math.min(Number(milliseconds) || 0, 60_000));
    const timer = setTimeout(() => {
      this.#timers.delete(timer);
      try {
        Promise.resolve(handler(...args)).catch(error => this.#reportError("timer", error));
      } catch (error) {
        this.#reportError("timer", error);
      }
    }, delay);
    timer.unref?.();
    this.#timers.add(timer);
    return timer;
  }

  #scheduleInterval(handler, milliseconds, args) {
    if (typeof handler !== "function") throw new TypeError("Timer handler must be a function");
    const delay = Math.max(1, Math.min(Number(milliseconds) || 0, 60_000));
    const timer = setInterval(() => {
      try { Promise.resolve(handler(...args)).catch(error => this.#reportError("timer", error)); } catch (error) { this.#reportError("timer", error); }
    }, delay);
    timer.unref?.();
    this.#timers.add(timer);
    return timer;
  }

  #query(selector) {
    this.#require("server.world.entities");
    return this.#allQueryableEntities().filter(entity => this.#matchesSelector(entity, selector));
  }

  #allQueryableEntities() {
    return [...this.#entities.values(), ...this.#players.values()];
  }

  #matchesSelector(entity, selector) {
    if (typeof selector !== "string") throw new TypeError("Game selector must be a string");
    const tokens = selector.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return false;
    return tokens.every(token => {
      if (token === "*") return true;
      if (token === "player") return entity.isPlayer === true;
      if (token.startsWith("#")) return entity.name === token.slice(1);
      if (token.startsWith(".")) return entity.tags?.has(token.slice(1)) === true;
      return false;
    });
  }

  #require(capability) {
    if (!this.capabilities.has(capability)) throw new Error(`Script capability not granted: ${capability}`);
  }

  #reportError(source, error) {
    this.logger.error(`[script:${source}] ${formatRuntimeError(error)}`);
  }

  _runtimePlayerId(player) {
    return this.#playerIds.get(player);
  }

  _entityByBackendId(id) {
    if (!Number.isInteger(id) || id <= 0) return null;
    for (const player of this.#players.values()) {
      if (player._backendPlayerId === id) return player;
    }
    for (const entity of this.#entities.values()) {
      if (entity._backendEntityId === id) return entity;
    }
    return null;
  }

  _writePlayer(player, field, value) {
    this.#require("server.player.write");
    if (field === "name") player._name = String(value).slice(0, 64);
    else if (field === "position") player._body.position.copy(Vector3.from(value));
    else if (field === "velocity") player._body.velocity.copy(Vector3.from(value));
    if (field === "position" || field === "velocity") this.#queuePlayerStateWrite(player);
  }

  _dialogPlayer(player, config) {
    this.#require("server.player");
    return Promise.resolve(this.showDialog(this.#playerIds.get(player), structuredClone(config)));
  }

  _cancelPlayerDialogs(player) {
    this.#require("server.player");
    return this.cancelDialogs(this.#playerIds.get(player));
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

  _forceRespawnPlayer(player) {
    this.#require("server.player.write");
    player._body.position.copy(player.spawnPoint);
    player._body.velocity.set(0, 0, 0);
    player._body.grounded = false;
    player._body.contacts.clear();
    player._body.triggers.clear();
    this.#queuePlayerStateWrite(player);
    this.#queueDamageStateWrite(player, { respawn: true });
    const event = createGameEntityEvent(this.currentTick, player);
    player._signals.respawn.emit(event, error => this.#reportError("playerRespawn", error));
    this.#signals.respawn.emit(event, error => this.#reportError("respawn", error));
  }

  _hurtEntity(entity, amount, options) {
    this.#require("server.world.events");
    const damage = Number(amount);
    if (entity.destroyed || Number.isNaN(damage) || !entity.enableDamage || Number(entity.hp) <= 0) return;
    const normalized = normalizeHurtOptions(options);
    const attacker = damage < 0 ? null : this.#resolveHurtAttacker(normalized.attacker);
    const damageType = damage < 0 ? "" : normalized.damageType;
    const previousHp = Number(entity.hp);
    if (damage < 0) {
      if (Number(entity.hp) < Number(entity.maxHp)) entity._hp = Math.min(Number(entity.maxHp), Number(entity.hp) - damage);
    } else {
      entity._hp = Math.max(0, Number(entity.hp) - damage);
    }
    entity._lastAttacker = attacker;
    entity._lastDamageType = damageType;
    const damageEvent = createGameDamageEvent(this.currentTick, entity, damage, attacker, damageType);
    entity._signals.takeDamage.emit(damageEvent, error => this.#reportError("entityTakeDamage", error));
    this.#signals.takeDamage.emit(damageEvent, error => this.#reportError("takeDamage", error));
    const died = previousHp > 0 && Number(entity.hp) <= 0;
    if (died) {
      const dieEvent = createGameDieEvent(this.currentTick, entity, attacker, damageType);
      entity._signals.die.emit(dieEvent, error => this.#reportError("entityDie", error));
      this.#signals.die.emit(dieEvent, error => this.#reportError("die", error));
    }
    this.#queueDamageStateWrite(entity, { hurt: damage, die: died });
  }

  _damagePlayer(player, amount) {
    this.#require("server.player.write");
    const enabled = player.enableDamage;
    player.enableDamage = true;
    try {
      this._hurtEntity(player, amount);
      return player.hp;
    } finally {
      player.enableDamage = enabled;
    }
  }

  #resolveHurtAttacker(attacker) {
    if (!attacker || typeof attacker !== "object") return null;
    if ([...this.#players.values()].includes(attacker)) return attacker;
    if ([...this.#entities.values()].includes(attacker)) return attacker;
    return null;
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
    Promise.resolve(this.writePlayerState(this.#playerIds.get(player), state)).catch(error => this.#reportError("state-write", error));
  }

  _damageFieldChanged(entity) {
    this.#queueDamageStateWrite(entity);
  }

  _destroyEntity(entity) {
    this.#require("server.world.entities");
    if (entity.isPlayer || entity.destroyed) return;
    entity._destroyed = true;
    this.#entities.delete(entity._id);
    const event = createGameEntityEvent(this.currentTick, entity);
    entity._signals.destroy.emit(event, error => this.#reportError("entityDestroy", error));
    if (Number.isSafeInteger(entity._backendEntityId) && entity._backendEntityId > 0) {
      Promise.resolve(this.destroyEntity(entity._backendEntityId)).catch(error => this.#reportError("entity-destroy", error));
    }
  }

  #queueDamageStateWrite(entity, events = {}) {
    const playerId = this.#playerIds.get(entity);
    const target = playerId !== undefined
      ? { playerId }
      : Number.isSafeInteger(entity._backendEntityId) && entity._backendEntityId > 0
        ? { entityId: entity._backendEntityId }
        : null;
    if (!target) return;
    const state = {
      showHealthBar: Boolean(entity.showHealthBar),
      hp: Number(entity.hp),
      maxHp: Number(entity.maxHp),
    };
    Promise.resolve(this.writeDamageState(target, state, structuredClone(events))).catch(error => this.#reportError("damage-state-write", error));
  }
}

export function createRuntimeEntity(input, runtime = null) {
  const tags = new Set(input.tags ?? []);
  const position = Vector3.from(input.position ?? [0, 0, 0]);
  return {
    _id: String(input.id),
    _kind: input.kind ?? "entity",
    _name: input.name ?? input.source?.name ?? String(input.id),
    _source: input.source ?? null,
    _sourceIndex: Number.isSafeInteger(input.sourceIndex) ? input.sourceIndex : null,
    _backendEntityId: null,
    _position: position,
    _runtime: runtime,
    _lastAttacker: null,
    _lastDamageType: "",
    bounds: Vector3.from(input.bounds ?? input.source?.bounds ?? [1, 1, 1]),
    mesh: input.mesh ?? input.source?.mesh ?? "",
    meshInvisible: false,
    meshScale: new Vector3(1 / 64, 1 / 64, 1 / 64),
    meshOrientation: new GameQuaternion(0, 0, 0, 1),
    meshOffset: new Vector3(0, 0, 0),
    meshColor: new GameRGBAColor(1, 1, 1, 1),
    meshMetalness: 0,
    meshEmissive: 0,
    meshShininess: 0,
    anchorOffset: new Vector3(0, 0, 0),
    _tags: tags,
    _signals: { click: new EventSignal(), destroy: new EventSignal(), fluidEnter: new EventSignal(), fluidLeave: new EventSignal(), takeDamage: new EventSignal(), die: new EventSignal() },
    _destroyed: false,
    _enableDamage: Boolean(input.enableDamage ?? false),
    _showHealthBar: Boolean(input.showHealthBar ?? true),
    _hp: Number(input.hp ?? 100),
    _maxHp: Number(input.maxHp ?? 100),
    get id() { return this._id; },
    get kind() { return this._kind; },
    get name() { return this._name; },
    get source() { return this._source; },
    get isPlayer() { return false; },
    get destroyed() { return this._destroyed; },
    get enableDamage() { return this._enableDamage; },
    set enableDamage(value) { this._enableDamage = Boolean(value); },
    get showHealthBar() { return this._showHealthBar; },
    set showHealthBar(value) { this._showHealthBar = Boolean(value); this._runtime?._damageFieldChanged(this); },
    get hp() { return this._hp; },
    set hp(value) { this._hp = Number(value); this._runtime?._damageFieldChanged(this); },
    get maxHp() { return this._maxHp; },
    set maxHp(value) { this._maxHp = Number(value); this._runtime?._damageFieldChanged(this); },
    get position() { return this._position; },
    set position(value) { this._position.copy(Vector3.from(value)); },
    get tags() { return this._tags; },
    addTag(tag) { this._tags.add(String(tag)); },
    removeTag(tag) { this._tags.delete(String(tag)); },
    hasTag(tag) { return this._tags.has(String(tag)); },
    onClick(handler) { return this._signals.click.on(handler); },
    nextClick(filter) { return this._signals.click.next(filter); },
    destroy() {
      if (!this._runtime) throw new Error("Entity is not attached to a Script Runtime");
      this._runtime._destroyEntity(this);
    },
    onDestroy(handler) { return this._signals.destroy.on(handler); },
    nextDestroy(filter) { return this._signals.destroy.next(filter); },
    onFluidEnter(handler) { return this._signals.fluidEnter.on(handler); },
    nextFluidEnter(filter) { return this._signals.fluidEnter.next(filter); },
    onFluidLeave(handler) { return this._signals.fluidLeave.on(handler); },
    nextFluidLeave(filter) { return this._signals.fluidLeave.next(filter); },
    onTakeDamage(handler) { return this._signals.takeDamage.on(handler); },
    nextTakeDamage(filter) { return this._signals.takeDamage.next(filter); },
    onDie(handler) { return this._signals.die.on(handler); },
    nextDie(filter) { return this._signals.die.next(filter); },
    hurt(amount, options) {
      if (!this._runtime) throw new Error("Entity is not attached to a Script Runtime");
      this._runtime._hurtEntity(this, amount, options);
    },
    snapshot() {
      return Object.freeze({ id: this.id, name: this.name, kind: this.kind, position: this.position.toArray(), tags: [...this.tags].sort(), destroyed: this.destroyed, enableDamage: this.enableDamage, showHealthBar: this.showHealthBar, hp: this.hp, maxHp: this.maxHp });
    },
  };
}

function createRuntimePlayer(runtime, input) {
  const body = new PlayerPhysicsBody({ position: input.position, profile: runtime.playerBodyProfile });
  const player = {
    _id: String(input.id),
    _name: String(input.name),
    _body: body,
    _lastAttacker: null,
    _lastDamageType: "",
    _authority: input.authority,
    _stateVersion: 0,
    _backendPlayerId: null,
    _lastBackendTick: 0,
    _writeBarrierTick: 0,
    _tags: new Set(),
    _signals: { click: new EventSignal(), destroy: new EventSignal(), fluidEnter: new EventSignal(), fluidLeave: new EventSignal(), press: new EventSignal(), release: new EventSignal(), keyDown: new EventSignal(), keyUp: new EventSignal(), respawn: new EventSignal(), takeDamage: new EventSignal(), die: new EventSignal() },
    _wearables: [],
    _destroyed: false,
    _enableDamage: false,
    _showHealthBar: true,
    _hp: 100,
    _maxHp: 100,
    spawnPoint: Vector3.from(input.position ?? [0, 0, 0]),
    color: new GameRGBColor(1, 1, 1),
    skin: Object.fromEntries(Object.values(GameBodyPart).map(part => [part, undefined])),
    cameraYaw: 0,
    cameraPitch: 0,
    spectator: false,
    walkButton: false,
    crouchButton: false,
    jumpButton: false,
    action0Button: false,
    action1Button: false,
    enableAction0: true,
    enableAction1: true,
    enableJump: true,
    enableDoubleJump: true,
    enableCrouch: true,
    get id() { return runtime._runtimePlayerId(this); },
    get isPlayer() { return true; },
    get player() { return this; },
    get destroyed() { return this._destroyed; },
    get enableDamage() { return this._enableDamage; },
    set enableDamage(value) { this._enableDamage = Boolean(value); },
    get showHealthBar() { return this._showHealthBar; },
    set showHealthBar(value) { this._showHealthBar = Boolean(value); runtime._damageFieldChanged(this); },
    get hp() { return this._hp; },
    set hp(value) { this._hp = Number(value); runtime._damageFieldChanged(this); },
    get maxHp() { return this._maxHp; },
    set maxHp(value) { this._maxHp = Number(value); runtime._damageFieldChanged(this); },
    get tags() { return this._tags; },
    addTag(tag) { this._tags.add(String(tag)); },
    removeTag(tag) { this._tags.delete(String(tag)); },
    hasTag(tag) { return this._tags.has(String(tag)); },
    onFluidEnter(handler) { return this._signals.fluidEnter.on(handler); },
    nextFluidEnter(filter) { return this._signals.fluidEnter.next(filter); },
    onFluidLeave(handler) { return this._signals.fluidLeave.on(handler); },
    nextFluidLeave(filter) { return this._signals.fluidLeave.next(filter); },
    onClick(handler) { return this._signals.click.on(handler); },
    nextClick(filter) { return this._signals.click.next(filter); },
    destroy() { return runtime._destroyEntity(this); },
    onDestroy(handler) { return this._signals.destroy.on(handler); },
    nextDestroy(filter) { return this._signals.destroy.next(filter); },
    onPress(handler) { return this._signals.press.on(handler); },
    nextPress(filter) { return this._signals.press.next(filter); },
    onRelease(handler) { return this._signals.release.on(handler); },
    nextRelease(filter) { return this._signals.release.next(filter); },
    onKeyDown(handler) { return this._signals.keyDown.on(handler); },
    onKeyUp(handler) { return this._signals.keyUp.on(handler); },
    onRespawn(handler) { return this._signals.respawn.on(handler); },
    nextRespawn(filter) { return this._signals.respawn.next(filter); },
    onTakeDamage(handler) { return this._signals.takeDamage.on(handler); },
    nextTakeDamage(filter) { return this._signals.takeDamage.next(filter); },
    onDie(handler) { return this._signals.die.on(handler); },
    nextDie(filter) { return this._signals.die.next(filter); },
    forceRespawn() { return runtime._forceRespawnPlayer(this); },
    directMessage(message) { return runtime._messagePlayer(this, message); },
    wearables(bodyPart) { return this._wearables.filter(item => item.bodyPart === bodyPart); },
    addWearable(spec) { const wearable = { ...structuredClone(spec) }; this._wearables.push(wearable); return wearable; },
    removeWearable(wearable) { const index = this._wearables.indexOf(wearable); if (index >= 0) this._wearables.splice(index, 1); },
    dialog(config) { return runtime._dialogPlayer(this, config); },
    cancelDialogs() { return runtime._cancelPlayerDialogs(this); },
    get name() { return this._name; },
    set name(value) { runtime._writePlayer(this, "name", value); },
    get position() { return this._body.position; },
    set position(value) { runtime._writePlayer(this, "position", value); },
    get velocity() { return this._body.velocity; },
    set velocity(value) { runtime._writePlayer(this, "velocity", value); },
    get grounded() { return this._body.grounded; },
    get health() { return this.hp; },
    applyImpulse(value) { runtime._applyImpulse(this, value); },
    hurt(amount, options) { runtime._hurtEntity(this, amount, options); },
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
        hp: this.hp,
        maxHp: this.maxHp,
        enableDamage: this.enableDamage,
        showHealthBar: this.showHealthBar,
        spawnPoint: this.spawnPoint.toArray(),
        color: { r: this.color.r, g: this.color.g, b: this.color.b },
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
  const force = Vector3.from(contact.force ?? [0, 0, 0]);
  const extension = {
    player: entity,
    collider: Object.freeze({ kind: collider.kind, id: collider.id, tags: collider.tags, material: collider.material }),
    normal: axis,
    compatibility: contactCompatibility(...(collider.kind === "voxel" ? [] : ["other"])),
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
      force,
      ...extension,
    });
  }
  return Object.freeze({
    tick,
    entity,
    other: null,
    axis,
    force,
    ...extension,
  });
}

function contactCompatibility(...unresolved) {
  return Object.freeze({ canonical: unresolved.length === 0 ? "compatible" : "partial", unresolved: Object.freeze(unresolved) });
}

function triggerEvent(player, trigger) {
  return Object.freeze({
    player,
    trigger: Object.freeze({ id: trigger.id, tags: trigger.tags, material: trigger.material }),
  });
}

function cloneJsonValue(value) {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new TypeError("RemoteChannel events must be JSON values");
  return JSON.parse(serialized);
}

function formatRuntimeError(error) {
  if (error && typeof error === "object") {
    if (typeof error.stack === "string" && error.stack.length > 0) return error.stack;
    if (typeof error.message === "string" && error.message.length > 0) return error.message;
  }
  return String(error);
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

export function createGameDamageEvent(tick, entity, damage, attacker = null, damageType = "") {
  return Object.freeze({ tick, entity, attacker, damage, damageType: damageType || "" });
}

export function createGameDieEvent(tick, entity, attacker = null, damageType = "") {
  return Object.freeze({ tick, entity, attacker, damageType: damageType || "" });
}

function normalizeHurtOptions(options) {
  if (options === undefined || options === null) return Object.freeze({ attacker: null, damageType: "" });
  if (typeof options === "string") return Object.freeze({ attacker: null, damageType: options });
  if (typeof options !== "object" || Array.isArray(options)) throw new TypeError("GameHurtOptions must be an object");
  return Object.freeze({ attacker: options.attacker ?? null, damageType: String(options.damageType ?? "") });
}

function inputPermissionMask(player) {
  let mask = 0xff;
  for (const permission of PLAYER_INPUT_PERMISSIONS) {
    if (!player[permission.property]) mask &= ~permission.mask;
  }
  return mask;
}

function updatePlayerButtonState(player, buttonState) {
  player.action0Button = (buttonState & 1) !== 0;
  player.action1Button = (buttonState & 2) !== 0;
  player.jumpButton = (buttonState & 4) !== 0;
  player.walkButton = (buttonState & 8) !== 0;
  player.crouchButton = (buttonState & 16) !== 0;
}

export function createGameInputEvent(tick, entity, position, button, pressed, raycast) {
  return Object.freeze({ tick, entity, position: Vector3.from(position), button, pressed: Boolean(pressed), raycast });
}

export function createGameClickEvent(tick, entity, clicker, button, distance, clickerPosition, raycast) {
  return Object.freeze({ tick, entity, clicker, button, distance, clickerPosition: Vector3.from(clickerPosition), raycast });
}

function reconstructInputRaycast(runtime, event) {
  const origin = Vector3.from(event.rayOrigin ?? [0, 0, 0]);
  const rawDirection = Vector3.from(event.rayDirection ?? [0, 0, 0]);
  const direction = rawDirection.sqrMag() > 1e-16 ? rawDirection.normalize() : new Vector3(0, 0, 0);
  const distance = Number(event.rayTime) >= 0 ? Number(event.rayTime) : Infinity;
  const hit = Number.isFinite(distance);
  const hitEntity = hit ? runtime._entityByBackendId(event.rayHitEntity) : null;
  const voxelIndex = new Vector3(event.rayHitVoxelX ?? 0, event.rayHitVoxelY ?? 0, event.rayHitVoxelZ ?? 0);
  const hitVoxel = hit && !hitEntity ? runtime.voxels.getVoxel(voxelIndex.x, voxelIndex.y, voxelIndex.z) : 0;
  return Object.freeze({
    hit,
    hitEntity,
    hitVoxel,
    voxel: hitVoxel,
    origin,
    direction,
    distance,
    hitPosition: hit ? origin.add(direction.scale(distance)) : origin.clone(),
    normal: Vector3.from(event.rayHitNormal ?? [0, 0, 0]).normalize(),
    voxelIndex,
  });
}

function isByte(value) {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}
