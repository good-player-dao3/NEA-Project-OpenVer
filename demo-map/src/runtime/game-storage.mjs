import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export class LocalGameStorage {
  #file;
  #logger;
  #loaded;
  #state = { spaces: {} };
  #writeQueue = Promise.resolve();
  #mutationQueue = Promise.resolve();

  constructor(options = {}) {
    this.#file = resolve(options.file ?? ".runtime-storage.json");
    this.#logger = options.logger ?? console;
    this.getDataStorage = key => this.#space(key);
    this.getGroupStorage = options.groupEnabled ? key => this.#space(`group:${key}`) : () => undefined;
  }

  #space(key) {
    validateName(key);
    return new RuntimeDataStorage(key, {
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
    validateKey(itemKey); validateValue(value);
    return this.#mutate(async () => {
      await this.#load();
      this.#assign(spaceKey, itemKey, value);
      await this.#persist();
    });
  }

  async #update(spaceKey, itemKey, handler) {
    if (typeof handler !== "function") throw new Error("Invalid parameters.");
    validateKey(itemKey);
    return this.#mutate(async () => {
      await this.#load();
      const previous = cloneReturn(this.#state.spaces[spaceKey]?.[itemKey]);
      const value = await handler(previous);
      validateValue(value);
      this.#assign(spaceKey, itemKey, value);
      await this.#persist();
    });
  }

  async #increment(spaceKey, itemKey, value = 1) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid increment value.");
    validateKey(itemKey);
    return this.#mutate(async () => {
      await this.#load();
      const current = this.#state.spaces[spaceKey]?.[itemKey]?.value ?? 0;
      if (typeof current !== "number" || !Number.isFinite(current)) throw new Error("Invalid increment value.");
      const next = current + value;
      this.#assign(spaceKey, itemKey, next);
      await this.#persist();
      return next;
    });
  }

  async #remove(spaceKey, itemKey) {
    validateKey(itemKey);
    return this.#mutate(async () => {
      await this.#load();
      const previous = cloneReturn(this.#state.spaces[spaceKey]?.[itemKey]);
      if (this.#state.spaces[spaceKey]) delete this.#state.spaces[spaceKey][itemKey];
      await this.#persist();
      return previous;
    });
  }

  async #destroy(spaceKey) {
    return this.#mutate(async () => {
      await this.#load();
      delete this.#state.spaces[spaceKey];
      await this.#persist();
    });
  }

  async #list(spaceKey, options) {
    await this.#load();
    const pageSize = Number.isFinite(options.pageSize) && options.pageSize > 0 ? Math.min(100, Math.floor(options.pageSize)) : 100;
    let cursor = Number.isFinite(options.cursor) && options.cursor > 0 ? Math.floor(options.cursor) : 0;
    const constraint = parseConstraintTarget(options.constraintTarget);
    let warned = constraint.invalid;
    let values = Object.values(this.#state.spaces[spaceKey] ?? {}).map(item => {
      const resolved = resolveConstraintTarget(item.value, constraint.path);
      warned ||= resolved.fallback;
      return { item, target: resolved.value };
    });
    const min = Number.isFinite(options.min) ? options.min : undefined;
    const max = Number.isFinite(options.max) ? options.max : undefined;
    if (min !== undefined || max !== undefined) {
      values = values.filter(({ target }) => typeof target === "number" && Number.isFinite(target) && (min === undefined || target >= min) && (max === undefined || target <= max));
    }
    if (options.ascending === true) values.sort((a, b) => compareStorageTargets(a.target, b.target));
    if (options.ascending === false) values.sort((a, b) => compareStorageTargets(b.target, a.target));
    if (warned) this.#logger.warn?.("GameDataStorage.list constraintTarget is invalid or missing; using the stored value as the query target.");
    const items = values.map(({ item }) => item);
    const readPage = page => {
      const start = page * pageSize;
      return { items: items.slice(start, start + pageSize).map(cloneReturn), isLastPage: start + pageSize >= items.length };
    };
    const first = readPage(cursor);
    return new RuntimeQueryList(first.items, first.isLastPage, async () => readPage(++cursor));
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

  #assign(spaceKey, itemKey, value) {
    const now = Date.now();
    const previous = this.#state.spaces[spaceKey]?.[itemKey];
    this.#state.spaces[spaceKey] ??= {};
    this.#state.spaces[spaceKey][itemKey] = { key: itemKey, value: structuredClone(value), version: randomUUID(), createTime: previous?.createTime ?? now, updateTime: now };
  }

  #mutate(operation) {
    const result = this.#mutationQueue.then(operation, operation);
    this.#mutationQueue = result.then(() => undefined, () => undefined);
    return result;
  }
}

export class RuntimeDataStorage {
  constructor(key, operations) {
    this.key = key;
    this.set = operations.set;
    this.update = operations.update;
    this.get = operations.get;
    this.increment = operations.increment;
    this.list = operations.list;
    this.remove = operations.remove;
    this.destroy = operations.destroy;
    Object.freeze(this);
  }
}

export class RuntimeQueryList {
  #items;
  #loadNext;

  constructor(items, isLastPage, loadNext) {
    this.#items = items;
    this.#loadNext = loadNext;
    this.isLastPage = isLastPage;
  }

  getCurrentPage() {
    return this.#items;
  }

  async nextPage() {
    const next = await this.#loadNext();
    if (next.items.length > 0) this.#items = next.items;
    this.isLastPage = next.isLastPage;
  }
}

function validateName(value) { if (typeof value !== "string" || value.length < 1 || value.length > 50) throw new Error("Invalid data storage name."); }
function validateKey(value) { if (typeof value !== "string" || value.length < 1) throw new Error("Invalid data key."); }
function validateValue(value) { if (!isJsonValue(value, new Set())) throw new Error("Invalid data value."); }
function cloneReturn(value) { return value === undefined ? undefined : structuredClone(value); }

function isJsonValue(value, ancestors) {
  if (typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (!value || typeof value !== "object") return false;
  if (ancestors.has(value)) return false;
  ancestors.add(value);
  let valid;
  if (Array.isArray(value)) {
    valid = Object.keys(value).length === value.length && value.every(item => isJsonValue(item, ancestors));
  } else {
    const prototype = Object.getPrototypeOf(value);
    valid = (prototype === Object.prototype || prototype === null)
      && Object.getOwnPropertySymbols(value).length === 0
      && Object.values(value).every(item => isJsonValue(item, ancestors));
  }
  ancestors.delete(value);
  return valid;
}

function parseConstraintTarget(value) {
  if (value === undefined) return { path: [] };
  if (typeof value !== "string") return { path: [], invalid: true };
  const path = value.split(".");
  return path.length >= 1 && path.length <= 5 && path.every(part => part.length > 0) ? { path } : { path: [], invalid: true };
}

function resolveConstraintTarget(value, path) {
  if (path.length === 0) return { value };
  let target = value;
  for (const part of path) {
    if (!target || typeof target !== "object" || !Object.prototype.hasOwnProperty.call(target, part)) return { value, fallback: true };
    target = target[part];
  }
  return { value: target };
}

function compareStorageTargets(left, right) {
  if (typeof left !== typeof right || !["number", "string", "boolean"].includes(typeof left)) return 0;
  if (left === right) return 0;
  return left < right ? -1 : 1;
}
