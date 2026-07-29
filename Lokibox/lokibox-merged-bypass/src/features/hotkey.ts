import type { FeatureInstance } from './instance';
import { HotkeyStorageManager } from 'src/storage/hotkey';

const hksm = HotkeyStorageManager.getInstance();

export class HotkeyManager {
  private static instance: HotkeyManager;
  private constructor() {}
  static getInstance() {
    if (!this.instance) {
      this.instance = new HotkeyManager();
    }
    return this.instance;
  }

  onKeyDown(id: string, fn: () => void) {
    const f = function (e: KeyboardEvent) {
      if (e.key === hksm.getHotkey(id)) {
        fn();
      }
    };
    addEventListener('keydown', f);
    return function () {
      removeEventListener('keydown', f);
    };
  }

  onKeyUp(id: string, fn: () => void) {
    const f = function (e: KeyboardEvent) {
      if (e.key === hksm.getHotkey(id)) {
        fn();
      }
    };
    addEventListener('keyup', f);
    return function () {
      removeEventListener('keyup', f);
    };
  }

  handleFeature(f: FeatureInstance<any>) {
    if (!f) return;
    if (f.base.activateOnHold) {
      this.onKeyDown(f.meta.id, function () {
        f.enable();
      });

      this.onKeyUp(f.meta.id, function () {
        f.disable();
      });
    } else {
      this.onKeyDown(f.meta.id, function () {
        if (f.enabled) {
          f.disable();
        } else {
          f.enable();
        }
      });
    }
  }
}
