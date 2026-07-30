import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export class LocalGameStorage {
  #file;
  #loaded;
  #state = { spaces: {} };
  #writeQueue = Promise.resolve();

  constructor(options = {}) {
    this.#file = resolve(options.file ?? ".runtime-storage.json");
    this.getDataStorage = key => this.#space(key);
    this.getGroupStorage = options.groupEnabled ? key => this.#space(`group:${key}`) : () => undefined;
  }

  #space(key) {
    validateName(key);
    return Object.freeze({
      key,
      set: (itemKey, value) => this.#set(key, itemKey, value),
      update: (itemKey, handler) => this.#update(key, itemKey, handler),
      get: itemKey => this.#get(key, itemKey),
      increment: (itemKey, value = 1) => this.#increment(key, itemKey, value),
      list: (options = {}) => this.#list(key, options),
      remove: itemKey => this.#remove(key, itemKey),
      destroy: () => this.#destroy(key),
    });
  }

  async #load() {
    if (!this.#loaded) this.#loaded = readFile(this.#file, "utf8").then(JSON.parse).then(value => { this.#state = value; }).catch(error => { if (error.code !== "ENOENT") throw error; });
    await this.#loaded;
  }

  async #get(spaceKey, itemKey) {
    validateKey(itemKey);
    await this.#load();
    return cloneReturn(this.#state.spaces[spaceKey]?.[itemKey]);
  }

  async #set(spaceKey, itemKey, value) {
    validateKey(itemKey); validateValue(value); await this.#load();
    const now = Date.now(); const previous = this.#state.spaces[spaceKey]?.[itemKey];
    this.#state.spaces[spaceKey] ??= {};
    this.#state.spaces[spaceKey][itemKey] = { key: itemKey, value: structuredClone(value), version: randomUUID(), createTime: previous?.createTime ?? now, updateTime: now };
    await this.#persist();
  }

  async #update(spaceKey, itemKey, handler) {
    if (typeof handler !== "function") throw new Error("Invalid parameters.");
    const previous = await this.#get(spaceKey, itemKey);
    await this.#set(spaceKey, itemKey, await handler(previous));
  }

  async #increment(spaceKey, itemKey, value = 1) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid increment value.");
    const previous = await this.#get(spaceKey, itemKey);
    const current = previous?.value ?? 0;
    if (typeof current !== "number") throw new Error("Invalid increment value.");
    const next = current + value; await this.#set(spaceKey, itemKey, next); return next;
  }

  async #remove(spaceKey, itemKey) {
    validateKey(itemKey); await this.#load(); const previous = cloneReturn(this.#state.spaces[spaceKey]?.[itemKey]);
    if (this.#state.spaces[spaceKey]) delete this.#state.spaces[spaceKey][itemKey];
    await this.#persist(); return previous;
  }

  async #destroy(spaceKey) {
    await this.#load(); delete this.#state.spaces[spaceKey]; await this.#persist();
  }

  async #list(spaceKey, options) {
    await this.#load();
    const pageSize = Number.isFinite(options.pageSize) && options.pageSize > 0 ? Math.floor(options.pageSize) : 100;
    let cursor = Number.isFinite(options.cursor) && options.cursor > 0 ? Math.floor(options.cursor) : 0;
    const ascending = options.ascending !== false;
    const values = Object.values(this.#state.spaces[spaceKey] ?? {}).sort((a, b) => ascending ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key));
    const query = {
      isLastPage: false,
      getCurrentPage: () => values.slice(cursor, cursor + pageSize).map(cloneReturn),
      nextPage: async () => { cursor = Math.min(values.length, cursor + pageSize); query.isLastPage = cursor + pageSize >= values.length; },
    };
    query.isLastPage = cursor + pageSize >= values.length;
    return query;
  }

  #persist() {
    this.#writeQueue = this.#writeQueue.then(async () => {
      await mkdir(dirname(this.#file), { recursive: true });
      const temporary = `${this.#file}.tmp`;
      await writeFile(temporary, `${JSON.stringify(this.#state, null, 2)}\n`);
      await rename(temporary, this.#file);
    });
    return this.#writeQueue;
  }
}

function validateName(value) { if (typeof value !== "string" || value.length < 1 || value.length > 50) throw new Error("Invalid data storage name."); }
function validateKey(value) { if (typeof value !== "string" || value.length < 1) throw new Error("Invalid data key."); }
function validateValue(value) { try { JSON.stringify(value); } catch { throw new Error("Invalid data value."); } if (value === undefined) throw new Error("Invalid data value."); }
function cloneReturn(value) { return value === undefined ? undefined : structuredClone(value); }