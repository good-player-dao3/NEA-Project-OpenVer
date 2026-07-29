/**
 * @module features/registry Feature注册模块。
 *
 * 为区分features/manager，此模块用于统一管理静态内容，例如default、prop的schema等等。
 */

import { Core } from 'src/core/core';
import { Logger } from 'src/utils/logger';
import { type FeaturePropSchema, type PropsValues } from './schema';

const logger = new Logger('features/registry');

/**
 * Feature元数据。
 */
export interface FeatureMeta {
  id: string;
  displayName: string;
  folderId: string;
}

/**
 * Feature上下文。用于实例化后事件的回调。
 */
export interface FeatureContext<F extends FeatureBase<any>> {
  props: PropsValues<F['schema']>;
  core: Core;
  enabled: boolean;
}

/**
 * Feature生命循环。用于构建Feature模板。
 */
export abstract class FeatureBase<F extends FeatureBase<any>> {
  onEnable?(ctx: FeatureContext<F>): void;
  onDisable?(ctx: FeatureContext<F>): void;
  onTick?(ctx: FeatureContext<F>): void;
  onRender?(ctx: FeatureContext<F>): void;
  onLMouseDown?(ctx: FeatureContext<F>): void;
  onRMouseDown?(ctx: FeatureContext<F>): void;
  onLMouseUp?(ctx: FeatureContext<F>): void;
  onRMouseUp?(ctx: FeatureContext<F>): void;
  onPropsChange?(ctx: FeatureContext<F>): void;
  schema: FeaturePropSchema = {};
  defaultEnabled?: boolean;
  defaultHotkey?: string;
  activateOnHold?: boolean;
  showInCategoryList?: boolean;
}

export type FeatureBody<T extends FeatureBase<any>> = {
  meta: FeatureMeta;
  base: FeatureBase<T>;
};

export class FeatureRegistry {
  private features = new Map<string, FeatureBody<any>>();
  private static instance: FeatureRegistry;
  private constructor() {}

  /**
   * 获取FeatureManager实例。
   * @returns instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new FeatureRegistry();
    }
    return this.instance;
  }

  /**
   * 注册Feature。
   * @param FeatureClass 函数类
   * @param meta 元数据
   */
  register<F extends FeatureBase<any>, T extends new () => FeatureBase<F>>(
    meta: FeatureMeta,
    FeatureClass: T
  ) {
    this.features.set(meta.id, { meta, base: new FeatureClass() });

    logger.i(meta.displayName, 'registered');
  }

  getFeature(id: string) {
    return this.features.get(id) ?? null;
  }

  getFeatureEntries() {
    return this.features.entries();
  }

  getFeaturesByFolderId(folderId: string) {
    const features: FeatureBody<any>[] = [];
    this.features.forEach(v => {
      if (v.meta.folderId === folderId) {
        features.push(v);
      }
    });
    return features;
  }
}

/**
 * Feature装饰器。用于修饰FeatureLifecycle的子类，以此将Feature注册到Manager。
 * @param meta 元数据。包括Feature ID、Feature显示名称、菜单ID。
 * @returns 工厂函数
 */
export function Feature(meta: FeatureMeta) {
  return function <
    F extends FeatureBase<any>,
    T extends new (...args: any[]) => FeatureBase<F>,
  >(target: T) {
    FeatureRegistry.getInstance().register(meta, target);
  };
}
