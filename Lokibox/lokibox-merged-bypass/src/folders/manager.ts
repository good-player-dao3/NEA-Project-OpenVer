import { EventBus } from 'src/utils/event-bus';
import { FolderStorageManager } from 'src/storage/folders';
import type { FolderMeta } from './registry';
import { FolderRegistry } from './registry';

const fsm = FolderStorageManager.getInstance();
const fr = FolderRegistry.getInstance();

export class FolderInstance {
  constructor(public meta: FolderMeta) {}

  private event = new EventBus();

  onVisibilityChange(fn: (visibility: boolean) => void) {
    this.event.on('visibility-change', fn);
  }

  onPositionChange(fn: (position: { x: number; y: number }) => void) {
    this.event.on('position-change', fn);
  }

  initialize() {
    this.event.emit('visibility-change', this.getVisibility());
  }

  setVisibility(visibility: boolean) {
    fsm.setVisibility(this.meta.id, visibility);
    this.event.emit('visibility-change', visibility);
  }

  getVisibility() {
    return fsm.getVisibility(this.meta.id);
  }

  setPosition(position: { x: number; y: number }) {
    fsm.setPosition(this.meta.id, position);
    this.event.emit('position-change', position);
  }

  getPosition() {
    return fsm.getPosition(this.meta.id);
  }
}

export class FolderManager {
  private static instance: FolderManager;

  private constructor() {
    this.initialize();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new FolderManager();
    }
    return this.instance;
  }

  private map = new Map<string, FolderInstance>();

  initialize() {
    for (const meta of fr.getMetas()) {
      const i = new FolderInstance(meta);
      i.initialize();
      this.map.set(meta.id, i);
    }
  }

  getFolders() {
    return this.map.values();
  }

  getFolderById(id: string) {
    return this.map.get(id) ?? null;
  }
}
