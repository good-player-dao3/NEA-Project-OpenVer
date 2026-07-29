import { GM_getValue, GM_setValue } from '$';
import { FolderRegistry } from 'src/folders/registry';

const fr = FolderRegistry.getInstance();

type T = Record<string, { x: number; y: number; visibility: boolean }>;

const STORAGE_KEY = 'click-ui';
const ZORDER_KEY = 'click-ui-order';

export class FolderStorageManager {
  private static instance: FolderStorageManager;
  private cache: T = {};
  private zOrder: string[] = [];

  private constructor() {}
  static getInstance() {
    if (!this.instance) {
      this.instance = new FolderStorageManager();
    }
    return this.instance;
  }

  initialize() {
    const metas = fr.getMetas();

    // 一次性加载到内存缓存
    this.cache = GM_getValue(STORAGE_KEY, {}) as T;

    // 迁移旧版像素值 → 百分比（0-1）
    const entries = Object.values(this.cache);
    if (entries.some(e => e.x > 1 || e.y > 1)) {
      const w = window.innerWidth || 1920;
      const h = window.innerHeight || 1080;
      for (const e of entries) {
        e.x /= w;
        e.y /= h;
      }
    }

    for (const f of metas) {
      if (!this.cache[f.id]) {
        this.cache[f.id] = { x: 0.05, y: 0.07, visibility: false };
      }
    }
    GM_setValue(STORAGE_KEY, this.cache);

    // 图层顺序
    this.zOrder = GM_getValue(ZORDER_KEY, []);
    // 新注册的 folder 追加到末尾（最上层）
    for (const f of metas) {
      if (!this.zOrder.includes(f.id)) {
        this.zOrder.push(f.id);
      }
    }
    GM_setValue(ZORDER_KEY, this.zOrder);
  }

  /** 缓存存百分比，getPosition 返回像素（给 UI 用） */
  getPosition(id: string): { x: number; y: number } | null {
    if (!this.cache[id]) return null;
    const w = window.innerWidth || 1920;
    const h = window.innerHeight || 1080;
    return {
      x: this.cache[id].x * w,
      y: this.cache[id].y * h,
    };
  }

  /** 收到像素 → 转百分比存入缓存 */
  setPosition(id: string, position: { x: number; y: number }) {
    const w = window.innerWidth || 1920;
    const h = window.innerHeight || 1080;
    this.cache[id].x = position.x / w;
    this.cache[id].y = position.y / h;
    GM_setValue(STORAGE_KEY, this.cache);
  }

  setVisibility(id: string, visibility: boolean) {
    this.cache[id].visibility = visibility;
    GM_setValue(STORAGE_KEY, this.cache);
  }

  getVisibility(id: string) {
    return this.cache[id]?.visibility ?? null;
  }

  /** 将指定 folder 移到最上层，并持久化 */
  bringToFront(id: string) {
    const idx = this.zOrder.indexOf(id);
    if (idx !== -1) this.zOrder.splice(idx, 1);
    this.zOrder.push(id);
    GM_setValue(ZORDER_KEY, this.zOrder);
  }

  /** 返回图层顺序（第一个 = 最底层） */
  getZOrder(): readonly string[] {
    return this.zOrder;
  }

  /** 导出完整状态（深拷贝） */
  getAll() {
    return {
      positions: JSON.parse(JSON.stringify(this.cache)) as T,
      zOrder: [...this.zOrder],
    };
  }

  /** 替换完整状态并持久化 */
  setAll(positions: T, zOrder: string[]) {
    this.cache = JSON.parse(JSON.stringify(positions));
    this.zOrder = [...zOrder];
    GM_setValue(STORAGE_KEY, this.cache);
    GM_setValue(ZORDER_KEY, this.zOrder);
  }
}
