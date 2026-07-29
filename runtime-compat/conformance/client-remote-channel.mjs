export function encodeHistoricalServerEvent(tick, event) {
  return Object.freeze({
    tick: requireTick(tick),
    args: JSON.stringify(event),
  });
}

export function decodeHistoricalClientEvent(packet) {
  if (!packet || typeof packet.args !== "string") return null;
  try {
    return Object.freeze({
      tick: requireTick(packet.tick),
      event: JSON.parse(packet.args),
    });
  } catch {
    return null;
  }
}

export class HistoricalClientRemoteChannelFixture {
  #started = false;
  #pending = [];
  #listeners = new Set();

  onClientEvent(listener) {
    if (typeof listener !== "function") throw new TypeError("RemoteChannel listener must be a function");
    this.#listeners.add(listener);
    return listener;
  }

  removeEventListener(listener) {
    this.#listeners.delete(listener);
  }

  receivePacket(packet) {
    if (!this.#started) {
      this.#pending.push(structuredClone(packet));
      return false;
    }
    return this.#deliver(packet);
  }

  start() {
    if (this.#started) return;
    this.#started = true;
    const pending = this.#pending;
    this.#pending = [];
    for (const packet of pending) this.#deliver(packet);
  }

  clear() {
    this.#listeners.clear();
  }

  stop() {
    this.#started = false;
    this.#pending = [];
    this.clear();
  }

  diagnostics() {
    return Object.freeze({
      started: this.#started,
      pendingPackets: this.#pending.length,
      listeners: this.#listeners.size,
    });
  }

  #deliver(packet) {
    const decoded = decodeHistoricalClientEvent(packet);
    if (!decoded) return false;
    for (const listener of [...this.#listeners]) listener(decoded.event);
    return true;
  }
}

function requireTick(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("RemoteChannel tick must be a non-negative safe integer");
  return value;
}
