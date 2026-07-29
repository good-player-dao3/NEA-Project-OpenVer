import { GM_getValue, GM_setValue } from '$';
import { PropStorageManager } from './features';
import { HotkeyStorageManager } from './hotkey';
import { FolderStorageManager } from './folders';
import { FeatureManager } from 'src/features/manager';
import { type ThemeColors, getTheme, parseThemeColors, setTheme } from 'src/ui/theme';
import { ToastManager } from 'src/utils/toast';
import { FolderManager } from 'src/folders/manager';

export const CONFIG_CURRENT_VERSION = 1;
export const DEFAULT_PROFILE = 'default';

export interface ConfigExport {
  version: typeof CONFIG_CURRENT_VERSION;
  exportedAt: string;
  profileName?: string;

  features: Record<string, { enabled: boolean; props: Record<string, any> }>;
  hotkeys: Record<string, string>;
  folders: {
    positions: Record<string, { x: number; y: number; visibility: boolean }>;
    zOrder: string[];
  };
  theme: ThemeColors | 'mono' | 'cyan';
}

const STORE_KEY = 'config';

interface ConfigStore {
  activeProfile: string;
  profiles: Record<string, ConfigExport>;
  backup: ConfigExport | null;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private store: ConfigStore;
  private currentProfile: string;

  private constructor() {
    this.store = GM_getValue(STORE_KEY, {
      activeProfile: DEFAULT_PROFILE,
      profiles: {},
      backup: null,
    });
    this.currentProfile = this.store.activeProfile;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ConfigManager();
    }
    return this.instance;
  }

  private flush() {
    GM_setValue(STORE_KEY, this.store);
  }

  // ── Export / Import ──

  /** 收集所有模块当前状态 */
  exportConfig(): ConfigExport {
    const psm = PropStorageManager.getInstance();
    const hksm = HotkeyStorageManager.getInstance();
    const fsm = FolderStorageManager.getInstance();

    const folderData = fsm.getAll();

    return {
      version: CONFIG_CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      profileName: this.currentProfile,

      features: psm.getAll(),
      hotkeys: hksm.getHotkeyMap(),
      folders: {
        positions: folderData.positions,
        zOrder: folderData.zOrder,
      },
      theme: getTheme(),
    };
  }

  /** 结构校验 */
  validateConfig(data: unknown): data is ConfigExport {
    if (typeof data !== 'object' || data === null) return false;
    const d = data as Record<string, unknown>;

    if (d.version !== CONFIG_CURRENT_VERSION) return false;

    if (typeof d.features !== 'object' || d.features === null) return false;
    if (typeof d.hotkeys !== 'object' || d.hotkeys === null) return false;
    if (typeof d.folders !== 'object' || d.folders === null) return false;

    const folders = d.folders as Record<string, unknown>;
    if (typeof folders.positions !== 'object' || folders.positions === null)
      return false;
    if (!Array.isArray(folders.zOrder)) return false;

    if (typeof d.theme === 'string') {
      if (d.theme !== 'mono' && d.theme !== 'cyan') return false;
    } else if (typeof d.theme === 'object' && d.theme !== null) {
      if (typeof (d.theme as Record<string, unknown>).accent !== 'string') return false;
    } else {
      return false;
    }

    return true;
  }

  /** 验证 → 备份 → 应用 */
  importConfig(config: ConfigExport) {
    if (!this.validateConfig(config)) {
      ToastManager.getInstance().show('Config: invalid format', 'error');
      return;
    }

    // 1. 备份当前状态
    this.store.backup = this.exportConfig();

    // 2. 保存导入前的 enabled 状态
    const fm = FeatureManager.getInstance();
    const oldEnabled = new Map<string, boolean>();
    for (const fi of fm.getAllFeatures()) {
      oldEnabled.set(fi.meta.id, fi.enabled);
    }

    const psm = PropStorageManager.getInstance();
    const hksm = HotkeyStorageManager.getInstance();

    // 3. 写入热键和主题（不受事件影响）
    hksm.setAll(config.hotkeys);
    setTheme(parseThemeColors(config.theme));

    // 4. 逐个 feature 更新 props 和 enable 状态（触发事件，UI 自动跟随）
    for (const fi of fm.getAllFeatures()) {
      const featureConfig = config.features[fi.meta.id];
      if (!featureConfig) continue;

      for (const [key, value] of Object.entries(featureConfig.props)) {
        psm.setFeatureProp(fi.meta.id, key, value);
      }

      const was = oldEnabled.get(fi.meta.id) ?? false;
      if (was !== featureConfig.enabled) {
        if (featureConfig.enabled) fi.enable();
        else fi.disable();
      }
    }

    // 5. 同步文件夹位置和可见性
    const fom = FolderManager.getInstance();
    const fsm = FolderStorageManager.getInstance();
    const w = window.innerWidth || 1920;
    const h = window.innerHeight || 1080;
    for (const folder of fom.getFolders()) {
      const pos = config.folders.positions[folder.meta.id];
      if (pos) {
        folder.setPosition({ x: pos.x * w, y: pos.y * h });
        if (pos.visibility !== folder.getVisibility()) {
          folder.setVisibility(pos.visibility);
        }
      }
    }
    fsm.setAll(config.folders.positions, config.folders.zOrder);

    this.flush();
    ToastManager.getInstance().show('Config imported', 'success');
  }

  // ── Profile 管理 ──

  getCurrentProfile() {
    return this.currentProfile;
  }

  getProfiles(): string[] {
    return Object.keys(this.store.profiles);
  }

  saveProfile(name: string) {
    const config = this.exportConfig();
    config.profileName = name;
    this.store.profiles[name] = config;

    this.currentProfile = name;
    this.store.activeProfile = name;
    this.flush();

    ToastManager.getInstance().show(`Profile "${name}" saved`, 'success');
  }

  loadProfile(name: string) {
    const raw = this.store.profiles[name];
    if (!raw) {
      ToastManager.getInstance().show(`Profile "${name}" not found`, 'error');
      return;
    }

    if (!this.validateConfig(raw)) {
      ToastManager.getInstance().show(`Profile "${name}" corrupted`, 'error');
      return;
    }

    this.importConfig(raw as ConfigExport);
    this.currentProfile = name;
    this.store.activeProfile = name;
    this.flush();
  }

  deleteProfile(name: string) {
    delete this.store.profiles[name];

    if (this.currentProfile === name) {
      this.currentProfile = DEFAULT_PROFILE;
      this.store.activeProfile = DEFAULT_PROFILE;
    }

    this.flush();
    ToastManager.getInstance().show(`Profile "${name}" deleted`, 'info');
  }

  // ── 文件导入导出（DOM API） ──

  /** 导出为 .json 下载 */
  exportToFile(filename = 'lokibox-config') {
    const json = JSON.stringify(this.exportConfig(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}.json`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** 从 .json 文件导入 */
  importFromFile(): Promise<ConfigExport> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) {
          document.body.removeChild(input);
          reject(new Error('No file selected'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          document.body.removeChild(input);
          try {
            const parsed = JSON.parse(reader.result as string);
            if (this.validateConfig(parsed)) {
              resolve(parsed as ConfigExport);
            } else {
              reject(new Error('Invalid config format'));
            }
          } catch {
            reject(new Error('Failed to parse JSON'));
          }
        };
        reader.onerror = () => {
          document.body.removeChild(input);
          reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
      });

      input.click();
    });
  }
}
