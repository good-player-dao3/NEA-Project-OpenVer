/**
 * Mock for vite-plugin-monkey's $ virtual module.
 *
 * Provides in-memory stubs of GM_getValue / GM_setValue and unsafeWindow
 * so that storage and core modules can be tested without a real Tampermonkey
 * environment.
 */

const store = new Map<string, any>();

function clearMockStore() {
  store.clear();
}

function GM_getValue<T>(key: string, fallback: T): T {
  return store.has(key) ? (store.get(key) as T) : fallback;
}

function GM_setValue(key: string, value: any): void {
  store.set(key, value);
}

const unsafeWindow: typeof globalThis = globalThis;

export { clearMockStore, GM_getValue, GM_setValue, unsafeWindow };
