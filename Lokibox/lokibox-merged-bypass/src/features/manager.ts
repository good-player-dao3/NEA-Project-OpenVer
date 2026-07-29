import { PropStorageManager } from 'src/storage/features';
import { EventBus } from 'src/utils/event-bus';
import { FeatureBase, FeatureRegistry } from './registry';
import { Core } from 'src/core/core';
import { Logger } from 'src/utils/logger';
import { HotkeyStorageManager } from 'src/storage/hotkey';
import { HotkeyManager } from './hotkey';
import { FeatureInstance } from './instance';

const core = Core.getInstance();
export const logger = new Logger('features/manager');
export const psm = PropStorageManager.getInstance();
export const hksm = HotkeyStorageManager.getInstance();
const hkm = HotkeyManager.getInstance();

export class FeatureManager {
  private features = new Map<string, FeatureInstance<any>>();
  private static instance: FeatureManager;

  /** 等待 Core ready 后重试 enable 的 feature */
  private pendingEnable = new Set<string>();

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new FeatureManager();
    }
    return this.instance;
  }

  initialize() {
    const fr = FeatureRegistry.getInstance();
    for (const [id, { meta, base }] of fr.getFeatureEntries()) {
      const fi = new FeatureInstance(meta, base);
      this.features.set(id, fi);
      logger.i(meta.displayName, 'initialized');
      hkm.handleFeature(fi);
    }

    addEventListener('pointerdown', e => {
      if (e.button === 0) this.lMouseDown();
      if (e.button === 2) this.rMouseDown();
    });

    addEventListener('pointerup', e => {
      if (e.button === 0) this.lMouseUp();
      if (e.button === 2) this.rMouseUp();
    });
  }

  eventBus = new EventBus();

  enable(id: string) {
    this.features.get(id)?.enable();
  }

  disable(id: string) {
    this.features.get(id)?.disable();
  }

  onEnable<F extends FeatureBase<any>>(id: string, fn: (f: FeatureInstance<F>) => void) {
    const f = this.getFeatureById(id)!;
    if (f && f.enabled) fn(f);
    this.eventBus.on<string>('enable', targetId => {
      if (targetId === id) fn(this.getFeatureById(id)!);
    });
  }

  onDisable<F extends FeatureBase<any>>(id: string, fn: (f: FeatureInstance<F>) => void) {
    const f = this.getFeatureById(id)!;
    if (f && !f.enabled) fn(f);
    this.eventBus.on<string>('disable', targetId => {
      if (targetId === id) fn(f);
    });
  }

  onEveryEnable<F extends FeatureBase<any>>(fn: (f: FeatureInstance<F>) => void) {
    this.eventBus.on<string>('enable', id => fn(this.getFeatureById(id)!));
  }

  onEveryDisable<F extends FeatureBase<any>>(fn: (f: FeatureInstance<F>) => void) {
    this.eventBus.on<string>('disable', id => fn(this.getFeatureById(id)!));
  }

  getFeatureById(id: string) {
    return this.features.get(id) ?? null;
  }

  getAllFeatures(): FeatureInstance<any>[] {
    return Array.from(this.features.values());
  }

  /** 标记 feature 为 pending enable（Core 就绪后自动重试） */
  markPending(id: string) {
    this.pendingEnable.add(id);
  }

  private forEach(fn: (f: FeatureInstance<any>) => void) {
    for (const f of this.features.values()) {
      try { fn(f); }
      catch (e) { logger.e(f.meta.displayName, e); }
    }
  }

  // ── tick (game tick, for logic) ──

  private tick() {
    // 重试 pending enable
    if (this.pendingEnable.size > 0 && core.ready) {
      for (const id of this.pendingEnable) {
        const fi = this.features.get(id);
        if (fi) {
          try { fi.enable(); this.pendingEnable.delete(id); }
          catch (e) { logger.e(fi.meta.displayName, 'deferred enable failed', e); }
        }
      }
    }

    this.forEach(f => f.tick());
  }

  // ── render (rAF, for visuals) ──

  render() {
    this.forEach(f => {
      if (f.enabled) {
        try { f.base.onRender?.(f.getContext()); }
        catch (e) { logger.e(f.meta.displayName, 'render error', e); }
      }
    });
  }

  private lMouseDown() { this.forEach(f => f.lMouseDown()); }
  private rMouseDown() { this.forEach(f => f.rMouseDown()); }
  private lMouseUp() { this.forEach(f => f.lMouseUp()); }
  private rMouseUp() { this.forEach(f => f.rMouseUp()); }

  private _ticker_canceller: () => void = () => {};
  private _renderer_canceller: () => void = () => {};

  setTicker(ticker: (fn: () => void) => () => void) {
    this._ticker_canceller = ticker(this.tick.bind(this));
  }

  cancelTicker() {
    this._ticker_canceller();
  }

  /** 设置渲染循环（requestAnimationFrame） */
  setRenderer(renderer: (fn: () => void) => () => void) {
    this._renderer_canceller = renderer(this.render.bind(this));
  }

  cancelRenderer() {
    this._renderer_canceller();
  }
}

export const fm = FeatureManager.getInstance();

core.onReady(() => {
  const fm = FeatureManager.getInstance();
  fm.setTicker(core.onTick.bind(core));

  // rAF 渲染循环
  let rafId = 0;
  const loop = () => {
    fm.render();
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
  fm.setRenderer(() => () => cancelAnimationFrame(rafId));
});

export function createPropsProxy<F extends object>(featureId: string) {
  return new Proxy({} as F, {
    get(_, key: string) { return psm.getFeatureProp(featureId, key); },
    set(_, key: string, value) {
      fm.getFeatureById(featureId)?.propsChange();
      psm.setFeatureProp(featureId, key, value);
      return true;
    },
  });
}
