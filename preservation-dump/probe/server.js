const NEA_DUMP_PREFIX = "NEA_DUMP ";
const root = typeof globalThis === "object" ? globalThis : this;
const inspectedEntities = new Set();
let sequence = 0;

function read(callback, fallback) {
  try { return callback(); } catch { return fallback; }
}

function serializable(value, depth = 0, seen = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "undefined") return { __type: "undefined" };
  if (typeof value === "bigint") return { __type: "bigint", value: String(value) };
  if (typeof value === "function" || typeof value === "symbol") return { __type: typeof value, name: value.name || null, value: String(value) };
  if (depth > 8) return { __type: "max-depth", constructor: read(() => value.constructor.name, null) };
  if (seen.has(value)) return { __type: "circular", constructor: read(() => value.constructor.name, null) };
  seen.add(value);
  if (Array.isArray(value)) return value.map(item => serializable(item, depth + 1, seen));
  const output = { __constructor: read(() => value.constructor.name, null) };
  for (const key of read(() => Object.keys(value), [])) output[key] = read(() => serializable(value[key], depth + 1, seen), { __error: "getter-threw" });
  return output;
}

function emit(type, payload = {}) {
  const record = {
    format: "nea-editor-server-probe",
    version: 1,
    sequence: ++sequence,
    tick: read(() => world.currentTick, null),
    type,
    payload: serializable(payload),
  };
  console.log(NEA_DUMP_PREFIX + JSON.stringify(record));
  return record;
}

function describe(label, value) {
  if (value === null || value === undefined) return { label, available: false, type: typeof value };
  const prototypes = [];
  const seen = new Set();
  let current = value;
  for (let depth = 0; current && depth < 10 && !seen.has(current); depth += 1) {
    seen.add(current);
    const properties = [];
    for (const name of read(() => Object.getOwnPropertyNames(current), [])) {
      const descriptor = read(() => Object.getOwnPropertyDescriptor(current, name), null);
      properties.push({
        name,
        kind: descriptor && (descriptor.get || descriptor.set) ? "accessor" : typeof descriptor?.value,
        writable: descriptor?.writable ?? null,
        enumerable: descriptor?.enumerable ?? null,
        configurable: descriptor?.configurable ?? null,
        getter: descriptor?.get?.name ?? null,
        setter: descriptor?.set?.name ?? null,
        functionLength: typeof descriptor?.value === "function" ? descriptor.value.length : null,
      });
    }
    prototypes.push({ constructor: read(() => current.constructor.name, null), properties });
    current = read(() => Object.getPrototypeOf(current), null);
  }
  return { label, available: true, type: typeof value, prototypes };
}

function inspectEntity(entity, reason) {
  if (!entity) return;
  const identity = read(() => entity.id, null) ?? read(() => entity.player?.userId, null) ?? `anonymous-${sequence}`;
  if (inspectedEntities.has(identity)) return;
  inspectedEntities.add(identity);
  emit("entity-surface", {
    reason,
    identity,
    entity: describe("entity", entity),
    player: describe("entity.player", read(() => entity.player, null)),
    rigidBody: describe("entity.rigidBody", read(() => entity.rigidBody, null)),
    fields: {
      id: read(() => entity.id, null),
      position: read(() => entity.position, null),
      velocity: read(() => entity.velocity, null),
      bounds: read(() => entity.bounds, null),
      contactForce: read(() => entity.contactForce, null),
      isPlayer: read(() => entity.isPlayer, null),
      tags: read(() => [...entity.tags], null),
    },
  });
}

function census(reason) {
  const globals = {};
  for (const name of ["world", "remoteChannel", "resources", "storage", "voxels", "rtc", "http"]) globals[name] = describe(name, read(() => root[name], undefined));
  emit("runtime-census", {
    reason,
    globalNames: read(() => Object.getOwnPropertyNames(root).sort(), []),
    globals,
    worldFields: {
      projectName: read(() => world.projectName, null),
      serverId: read(() => world.serverId, null),
      currentTick: read(() => world.currentTick, null),
      gravity: read(() => world.gravity, null),
      airFriction: read(() => world.airFriction, null),
      useOBB: read(() => world.useOBB, null),
    },
  });
}

function attachEvent(owner, eventName) {
  const subscribe = read(() => owner[eventName], null);
  if (typeof subscribe !== "function") {
    emit("event-unavailable", { eventName });
    return;
  }
  try {
    const token = subscribe.call(owner, event => {
      if (eventName === "onTick" && read(() => event.tick, 0) % 100 !== 0) return;
      emit("event", { eventName, event });
      inspectEntity(read(() => event.entity, null) ?? read(() => event.player, null), eventName);
    });
    emit("event-subscribed", { eventName, token: describe(`${eventName}.token`, token) });
  } catch (error) {
    emit("event-subscribe-error", { eventName, error: String(error), stack: error?.stack ?? null });
  }
}

census("startup");
for (const eventName of [
  "onTick", "onPlayerJoin", "onPlayerLeave", "onChat", "onClick", "onPress", "onRelease", "onRespawn", "onDie",
  "onTakeDamage", "onInteract", "onEntityCreate", "onEntityDestroy", "onEntityContact", "onEntitySeparate",
  "onVoxelContact", "onVoxelSeparate", "onFluidEnter", "onFluidLeave", "onPlayerPurchaseSuccess",
]) attachEvent(world, eventName);

if (typeof root.remoteChannel?.onServerEvent === "function") {
  root.remoteChannel.onServerEvent(event => {
    emit("remote-server-event", event);
    const entity = read(() => event.entity, null);
    inspectEntity(entity, "remote-server-event");
    try {
      root.remoteChannel.sendClientEvent(entity, {
        type: "nea-dump:server-ack",
        tick: read(() => world.currentTick, null),
        received: read(() => event.args, null),
      });
      emit("remote-client-event-sent", { entityId: read(() => entity.id, null) });
    } catch (error) {
      emit("remote-client-event-error", { error: String(error), stack: error?.stack ?? null });
    }
  });
} else emit("event-unavailable", { eventName: "remoteChannel.onServerEvent" });

emit("probe-ready", { instruction: "Join preview, move, jump, crouch, chat, interact, take damage, die, respawn, and trigger contacts." });
