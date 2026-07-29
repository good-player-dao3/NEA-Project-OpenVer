import { Core } from 'src/core/core';
import { psm, hksm, createPropsProxy, logger, fm } from './manager';
import type { FeatureBase, FeatureMeta, FeatureContext } from './registry';
import { EventBus } from 'src/utils/event-bus';

/**
 * Feature实例。Feature主要的活动对象。
 */

export class FeatureInstance<F extends FeatureBase<any>> {
  base: FeatureBase<F>;

  meta: FeatureMeta;

  private eventBus = new EventBus();
  private core = Core.getInstance();

  /**
   * enable
   */
  get enabled() {
    return psm.isFeatureEnabled(this.meta.id)!;
  }

  set enabled(v: boolean) {
    if (v) {
      psm.enableFeature(this.meta.id);
    } else {
      psm.disableFeature(this.meta.id);
    }
  }

  get hotkey() {
    return hksm.getHotkey(this.meta.id);
  }

  set hotkey(v: string | null) {
    if (v) {
      hksm.setHotkey(this.meta.id, v);
    } else {
      hksm.setHotkey(this.meta.id, '');
    }
  }

  constructor(meta: FeatureMeta, base: FeatureBase<F>) {
    this.meta = meta;
    this.base = base;

    if (this.enabled) {
      this.enableOnInitialization();
    }
  }

  getContext(): FeatureContext<F> {
    return {
      props: createPropsProxy(this.meta.id),
      core: this.core,
      enabled: this.enabled,
    };
  }

  enable() {
    if (this.enabled) return;

    logger.i(this.meta.displayName, 'enabled');

    this.enabled = true;

    fm.eventBus.emit('enable', this.meta.id);
    this.eventBus.emit('enable', null);
    this.base.onEnable?.(this.getContext());
  }

  disable() {
    if (!this.enabled) return;

    logger.i(this.meta.displayName, 'disabled');

    this.enabled = false;

    fm.eventBus.emit('disable', this.meta.id);
    this.eventBus.emit('disable', null);
    this.base.onDisable?.(this.getContext());
  }

  enableOnInitialization() {
    logger.i(this.meta.displayName, 'enabled on initialization');

    fm.eventBus.emit('enable', this.meta.id);

    this.core.onReady(() => {
      try {
        this.base.onEnable?.(this.getContext());
      } catch (e) {
        logger.w(this.meta.displayName, 'deferred enable failed, will retry', e);
        fm.markPending(this.meta.id);
      }
    });
  }

  tick() {
    if (this.enabled) {
      this.base.onTick?.(this.getContext());
    }
  }

  lMouseDown() {
    if (this.enabled) {
      this.base.onLMouseDown?.(this.getContext());
    }
  }

  rMouseDown() {
    if (this.enabled) {
      this.base.onRMouseDown?.(this.getContext());
    }
  }

  lMouseUp() {
    if (this.enabled) {
      this.base.onLMouseUp?.(this.getContext());
    }
  }

  rMouseUp() {
    if (this.enabled) {
      this.base.onRMouseUp?.(this.getContext());
    }
  }

  propsChange() {
    if (this.enabled) {
      this.base.onPropsChange?.(this.getContext());
    }
  }

  onEnable(fn: () => void) {
    this.eventBus.on('enable', fn);
  }

  onDisable(fn: () => void) {
    this.eventBus.on('disable', fn);
  }
}
