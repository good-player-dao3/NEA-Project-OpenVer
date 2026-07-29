/**
 * @module 存储模块。
 *
 * 存储模块的操作对象：
 * Feature的启用、快捷键、配置
 * 菜单的位置
 *
 * 设计：initialize() 时从 GM storage 全量加载到内存缓存，
 * 后续读写均命中缓存，写操作同时写回 GM storage 持久化。
 */

import { GM_getValue, GM_setValue } from '$';

import { FeatureRegistry } from 'src/features/registry';

export type FeaturePropStorage = Record<
  string,
  { enabled: boolean; props: Record<string, any> }
>;

type T = {
  [k: string]: {
    enabled: boolean;
    props: {
      [l: string]: any;
    };
  };
};

const STORAGE_KEY = 'features';

export class PropStorageManager {
  private static instance: PropStorageManager;
  private cache: T = {};

  private constructor() {}
  static getInstance() {
    if (!this.instance) {
      this.instance = new PropStorageManager();
    }
    return this.instance;
  }

  initialize() {
    const fr = FeatureRegistry.getInstance();

    // 一次性从 GM storage 加载到内存缓存
    this.cache = GM_getValue(STORAGE_KEY, {}) as T;

    // 校验并补齐缺失的默认值
    for (const k of fr.getFeatureEntries()) {
      const id = k[0];
      const { base } = k[1];
      if (!this.cache[id]) {
        const defaultPropsEntries = Object.entries(base.schema).map(
          ([key, schema]) => {
            return [key, schema.default];
          }
        );
        this.cache[id] = {
          enabled: base.defaultEnabled ?? false,
          props: Object.fromEntries(defaultPropsEntries),
        };
      } else {
        for (const s in base.schema) {
          if (!(s in this.cache[id].props)) {
            this.cache[id].props[s] = base.schema[s].default;
          }
        }
      }
    }

    GM_setValue(STORAGE_KEY, this.cache);
  }

  enableFeature(id: string) {
    this.cache[id].enabled = true;
    GM_setValue(STORAGE_KEY, this.cache);
  }

  disableFeature(id: string) {
    this.cache[id].enabled = false;
    GM_setValue(STORAGE_KEY, this.cache);
  }

  isFeatureEnabled(id: string) {
    if (this.cache[id]) {
      return this.cache[id].enabled;
    } else {
      return null;
    }
  }

  setFeatureProp<T>(id: string, key: string, value: T) {
    this.cache[id].props[key] = value;
    GM_setValue(STORAGE_KEY, this.cache);
  }

  getFeatureProp<T>(id: string, key: string): T | void {
    return this.cache[id]?.props[key] as T | void;
  }

  /** 导出完整缓存（深拷贝） */
  getAll(): FeaturePropStorage {
    return JSON.parse(JSON.stringify(this.cache));
  }

  /** 替换完整缓存并持久化 */
  setAll(data: FeaturePropStorage) {
    this.cache = data as T;
    GM_setValue(STORAGE_KEY, this.cache);
  }
}
