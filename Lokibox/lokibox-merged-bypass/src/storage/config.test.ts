import { describe, it, expect, beforeEach } from 'vitest';
import { clearMockStore } from 'src/__mocks__/dollar';
import {
  ConfigManager,
  type ConfigExport,
  CONFIG_CURRENT_VERSION,
} from './config';

// ─── 有效配置样本 ────────────────────────────────────────

function validConfig(): ConfigExport {
  return {
    version: CONFIG_CURRENT_VERSION,
    exportedAt: '2026-06-23T12:00:00.000Z',
    features: {
      'kill-aura': { enabled: true, props: { range: 4.5 } },
      'aim-assist': { enabled: false, props: { smoothness: 0.8 } },
    },
    hotkeys: {
      'kill-aura': 'r',
      'aim-assist': 'f',
    },
    folders: {
      positions: {
        combat: { x: 100, y: 80, visibility: true },
        render: { x: 200, y: 80, visibility: false },
      },
      zOrder: ['render', 'combat'],
    },
    theme: {
      accent: '#ffffff',
      bgDefault: '#222222',
      bgHover: '#252525',
      bgActive: '#ffffff',
      bgActiveHover: '#fcfcfc',
      textDefault: '#ffffff',
      textOnActive: '#000000',
      track: '#3a3a3a',
    },
  };
}

describe('ConfigManager.validateConfig', () => {
  let cm: ConfigManager;

  beforeEach(() => {
    clearMockStore();
    // ConfigManager singleton — need to reset after clearMockStore
    // Since singleton persists, we access it but the internal currentProfile
    // was loaded from GM at construction time. After clearMockStore,
    // the singleton still has its old currentProfile but that's fine
    // for validateConfig tests since it's a pure check.
    cm = ConfigManager.getInstance();
  });

  it('accepts a valid config', () => {
    expect(cm.validateConfig(validConfig())).toBe(true);
  });

  it('rejects null / non-object', () => {
    expect(cm.validateConfig(null)).toBe(false);
    expect(cm.validateConfig(undefined)).toBe(false);
    expect(cm.validateConfig('string')).toBe(false);
    expect(cm.validateConfig(42)).toBe(false);
  });

  it('rejects wrong version', () => {
    const c = validConfig();
    (c as any).version = 999;
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects missing features', () => {
    const c = validConfig();
    delete (c as any).features;
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects non-object features', () => {
    const c = validConfig();
    (c as any).features = 'invalid';
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects missing hotkeys', () => {
    const c = validConfig();
    delete (c as any).hotkeys;
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects missing folders', () => {
    const c = validConfig();
    delete (c as any).folders;
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects folders with non-array zOrder', () => {
    const c = validConfig();
    (c as any).folders = { positions: {}, zOrder: 'abc' };
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects folders with non-object positions', () => {
    const c = validConfig();
    (c as any).folders = { positions: null, zOrder: [] };
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects invalid theme string', () => {
    const c = validConfig();
    (c as any).theme = 'red';
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('rejects theme object without accent', () => {
    const c = validConfig();
    (c as any).theme = { bgActive: '#000' };
    expect(cm.validateConfig(c)).toBe(false);
  });

  it('accepts theme object with accent', () => {
    const c = validConfig();
    (c as any).theme = { accent: '#ff0000', bgActive: '#000' };
    expect(cm.validateConfig(c)).toBe(true);
  });

  it('rejects theme null', () => {
    const c = validConfig();
    (c as any).theme = null;
    expect(cm.validateConfig(c)).toBe(false);
  });

});

describe('ConfigManager profile management', () => {
  let cm: ConfigManager;

  beforeEach(() => {
    clearMockStore();
    cm = ConfigManager.getInstance();
  });

  it('default profile is "default"', () => {
    expect(cm.getCurrentProfile()).toBe('default');
  });

  it('getProfiles returns empty list initially', () => {
    expect(cm.getProfiles()).toEqual([]);
  });

  it('saveProfile stores and lists the profile', () => {
    cm.saveProfile('pvp');
    expect(cm.getProfiles()).toContain('pvp');
  });

  it('saveProfile updates currentProfile', () => {
    cm.saveProfile('my-config');
    expect(cm.getCurrentProfile()).toBe('my-config');
  });

  it('deleteProfile removes the profile and updates list', () => {
    cm.saveProfile('test-config');
    expect(cm.getProfiles()).toContain('test-config');

    cm.deleteProfile('test-config');
    expect(cm.getProfiles()).not.toContain('test-config');
  });

  it('deleteProfile resets to "default" when current is deleted', () => {
    cm.saveProfile('temp');
    expect(cm.getCurrentProfile()).toBe('temp');

    cm.deleteProfile('temp');
    expect(cm.getCurrentProfile()).toBe('default');
  });

  it('loadProfile shows error for missing profile (does not throw)', () => {
    // Should not throw — should show toast internally
    expect(() => cm.loadProfile('nonexistent')).not.toThrow();
  });

  it('loadProfile shows error for corrupted profile (does not throw)', () => {
    // Inject corrupt data into the singleton's inner store
    (cm as any).store.profiles.bad = { version: 999, features: null };

    expect(() => cm.loadProfile('bad')).not.toThrow();
  });
});

describe('ConfigManager exportConfig structure', () => {
  let cm: ConfigManager;

  beforeEach(() => {
    clearMockStore();
    cm = ConfigManager.getInstance();
  });

  it('exportConfig returns correct top-level keys', () => {
    const c = cm.exportConfig();
    expect(c).toHaveProperty('version', CONFIG_CURRENT_VERSION);
    expect(c).toHaveProperty('exportedAt');
    expect(c).toHaveProperty('features');
    expect(c).toHaveProperty('hotkeys');
    expect(c).toHaveProperty('folders');
    expect(c).toHaveProperty('theme');
  });

  it('exportConfig has correct folders sub-structure', () => {
    const c = cm.exportConfig();
    expect(c.folders).toHaveProperty('positions');
    expect(c.folders).toHaveProperty('zOrder');
    expect(Array.isArray(c.folders.zOrder)).toBe(true);
  });

  it('exportedAt is a valid ISO string', () => {
    const c = cm.exportConfig();
    const ts = Date.parse(c.exportedAt);
    expect(Number.isNaN(ts)).toBe(false);
  });
});
