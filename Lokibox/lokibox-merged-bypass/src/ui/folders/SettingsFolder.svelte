<script lang="ts">
  import Folder from './Folder.svelte';
  import '../entries/entry.css';

  // SettingsFolder 已废弃 — 主题设置已移至 Modal 设置面板。
  // 保留此文件仅为避免导入报错，未在 FoldersRegistry 中注册。
</script>

<Folder id="settings" width={320}>
  <div class="settings-content">
    <div class="entry empty-hint">Settings moved to Profile panel</div>
  </div>
</Folder>

<style>
  .settings-content {
    display: flex;
    flex-direction: column;
  }
  .empty-hint {
    justify-content: center;
    opacity: 0.4;
    cursor: default;
  }
</style>
