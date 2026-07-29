export type FolderMeta = { id: string; displayName: string; icon?: any };

export class FolderRegistry {
  private static instance: FolderRegistry;

  private constructor() {}
  static getInstance() {
    if (!this.instance) {
      this.instance = new FolderRegistry();
    }
    return this.instance;
  }

  private map = new Map<string, FolderMeta>();

  registerFolder(id: string, displayName: string, icon?: any) {
    this.map.set(id, { id, displayName, icon });
  }

  getMetas() {
    return this.map.values();
  }

  getMetaById(id: string) {
    return this.map.get(id) ?? null;
  }
}
