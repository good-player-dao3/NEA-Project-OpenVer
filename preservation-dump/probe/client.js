const NEA_DUMP_PREFIX = "NEA_DUMP_CLIENT ";
const root = typeof globalThis === "object" ? globalThis : this;
let sequence = 0;

function read(callback, fallback) {
  try { return callback(); } catch { return fallback; }
}

function describe(label, value) {
  if (value === null || value === undefined) return { label, available: false, type: typeof value };
  const prototypes = [];
  const seen = new Set();
  let current = value;
  for (let depth = 0; current && depth < 10 && !seen.has(current); depth += 1) {
    seen.add(current);
    prototypes.push({
      constructor: read(() => current.constructor.name, null),
      properties: read(() => Object.getOwnPropertyNames(current).sort().map(name => {
        const descriptor = Object.getOwnPropertyDescriptor(current, name);
        return {
          name,
          kind: descriptor?.get || descriptor?.set ? "accessor" : typeof descriptor?.value,
          writable: descriptor?.writable ?? null,
          enumerable: descriptor?.enumerable ?? null,
          configurable: descriptor?.configurable ?? null,
          functionLength: typeof descriptor?.value === "function" ? descriptor.value.length : null,
        };
      }), []),
    });
    current = read(() => Object.getPrototypeOf(current), null);
  }
  return { label, available: true, type: typeof value, prototypes };
}

function emit(type, payload) {
  console.log(NEA_DUMP_PREFIX + JSON.stringify({ format: "nea-editor-client-probe", version: 1, sequence: ++sequence, type, payload }));
}

const globals = {};
for (const name of [
  "remoteChannel", "input", "camera", "ui", "gameUI", "resources", "voxels", "world", "player",
  "UiText", "UiBox", "UiImage", "UiInput", "UiButton", "Audio", "GameVector3", "GameQuaternion",
]) globals[name] = describe(name, read(() => root[name], undefined));

emit("runtime-census", { globalNames: read(() => Object.getOwnPropertyNames(root).sort(), []), globals });

if (typeof root.remoteChannel?.onClientEvent === "function") {
  root.remoteChannel.onClientEvent(event => emit("remote-client-event", event));
  emit("event-subscribed", { eventName: "remoteChannel.onClientEvent" });
} else emit("event-unavailable", { eventName: "remoteChannel.onClientEvent" });

try {
  root.remoteChannel.sendServerEvent({
    type: "nea-dump:client-ready",
    sequence,
    globals: Object.keys(globals).filter(name => globals[name].available),
  });
  emit("remote-server-event-sent", { type: "nea-dump:client-ready" });
} catch (error) {
  emit("remote-server-event-error", { error: String(error), stack: error?.stack ?? null });
}
