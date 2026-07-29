import { GM_getValue, GM_setValue } from '$';
import { FeatureRegistry } from 'src/features/registry';

const fr = FeatureRegistry.getInstance();

const STORAGE_KEY = 'hotkeys';

export class HotkeyStorageManager {
  private static instance: HotkeyStorageManager;
  private cache: Record<string, string> = {};

  private constructor() {}
  static getInstance() {
    if (!this.instance) {
      this.instance = new HotkeyStorageManager();
    }
    return this.instance;
  }

  initialize() {
    // 一次性加载到内存缓存
    this.cache = GM_getValue(STORAGE_KEY, {});

    // 补齐缺失的默认热键
    for (const k of fr.getFeatureEntries()) {
      const id = k[0];
      if (!(id in this.cache)) {
        const { base } = k[1];
        this.cache[id] = base.defaultHotkey ?? '';
      }
    }
    GM_setValue(STORAGE_KEY, this.cache);
  }

  getHotkeyMap(): Record<string, string> {
    return this.cache;
  }

  getHotkey(id: string) {
    return this.cache[id] ?? null;
  }

  setHotkey(id: string, key: string) {
    this.cache[id] = key;
    GM_setValue(STORAGE_KEY, this.cache);
  }

  /** 替换完整缓存并持久化 */
  setAll(data: Record<string, string>) {
    this.cache = { ...data };
    GM_setValue(STORAGE_KEY, this.cache);
  }
}
