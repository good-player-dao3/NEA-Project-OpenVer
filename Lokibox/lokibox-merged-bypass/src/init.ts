import { FolderRegistry } from './folders/registry';
import Airplay from 'lucide-svelte/icons/airplay';
import Candy from 'lucide-svelte/icons/candy';
import Drone from 'lucide-svelte/icons/drone';
import FileCog from 'lucide-svelte/icons/file-cog';
import Handshake from 'lucide-svelte/icons/handshake';
import Keyboard from 'lucide-svelte/icons/keyboard';
import MapIcon from 'lucide-svelte/icons/map';
import Crosshair from 'lucide-svelte/icons/crosshair';
import Swords from 'lucide-svelte/icons/swords';
import UsersRound from 'lucide-svelte/icons/users-round';
import Wrench from 'lucide-svelte/icons/wrench';
const FOLDERS = [
  ['combat', 'Combat', Swords],
  ['movement', 'Movement', Drone],
  ['render', 'Render', Airplay],
  ['utility', 'Utility', Wrench],
  ['misc', 'Misc', Candy],

  ['friend', 'Friend', Handshake],
  ['player', 'Player', UsersRound],
  ['hotkey', 'Hotkey', Keyboard],

  ['main', 'Main'],
  ['minimap', 'Minimap', MapIcon],
  ['target-hud', 'TargetHUD', Crosshair],
  ['config', 'Config', FileCog],
  ['category', 'Category'],
] as const;

const fr = FolderRegistry.getInstance();
for (const [id, name, icon] of FOLDERS) {
  fr.registerFolder(id, name, icon);
}

import 'src/features/hotkey';
import { FeatureManager } from 'src/features/manager';
import { PropStorageManager } from './storage/features';
import { FolderStorageManager } from './storage/folders';
import { HotkeyStorageManager } from './storage/hotkey';

import.meta.glob('src/features/**/*.ts', { eager: true });
import 'src/features/render/esp';

import { restoreTheme } from './ui/theme';
import { ExclusionManager } from 'src/features/exclusion';
import { PresenceManager } from 'src/presence/presence';
import { FriendManager } from 'src/friend/remote-friends';

let initialized = false;

/**
 * 初始化所有 managers / features / theme / friends / presence。
 * 幂等 —— 多次调用只执行一次。
 */
export function initApp() {
  if (initialized) return;
  initialized = true;

  PropStorageManager.getInstance().initialize();
  FolderStorageManager.getInstance().initialize();
  HotkeyStorageManager.getInstance().initialize();
  FeatureManager.getInstance().initialize();

  restoreTheme();
  ExclusionManager.getInstance().init();
  if (import.meta.env.VITE_LOKIBOX_SKIP_AUTH !== 'true') {
    PresenceManager.getInstance().init();
    FriendManager.getInstance().startPolling();
  }
}
