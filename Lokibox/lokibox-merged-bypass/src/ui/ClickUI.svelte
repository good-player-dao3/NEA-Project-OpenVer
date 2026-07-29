<script lang="ts">
  import { FolderRegistry } from 'src/folders/registry';
  import FeatureFolder from './folders/FeatureFolder.svelte';
  import HotkeyFolder from './folders/HotkeyFolder.svelte';
  import MainFolder from './folders/MainFolder.svelte';
  import FriendFolder from './folders/FriendFolder.svelte';
  import PlayerFolder from './folders/PlayerFolder.svelte';
  import ConfigFolder from './folders/ConfigFolder.svelte';
  import './folders/folder.css';

  import { onMount, onDestroy } from 'svelte';
  import { FolderStorageManager } from 'src/storage/folders';

  const fr = FolderRegistry.getInstance();
  const fpm = FolderStorageManager.getInstance();

  function stopInputPropagation(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      e.stopImmediatePropagation();
    }
  }

  window.addEventListener('keydown', stopInputPropagation, true);

  onMount(() => {
    // 恢复保存的图层顺序（从底到顶 appendChild）
    const container = document.getElementById('click-ui');
    if (!container) return;
    for (const id of fpm.getZOrder()) {
      const el = container.querySelector(`[data-folder-id="${id}"]`) as HTMLElement | null;
      if (el) container.appendChild(el);
    }
  });

  onDestroy(() => {
    window.removeEventListener('keydown', stopInputPropagation, true);
  });
</script>

<div id="click-ui">
  {#each fr.getMetas() as entry}
    {@const id = entry.id}
    {#if id === 'hotkey'}
      <HotkeyFolder></HotkeyFolder>
    {:else if id === 'main'}
      <MainFolder />
    {:else if id === 'friend'}
      <FriendFolder />
    {:else if id === 'player'}
      <PlayerFolder />
    {:else if id === 'config'}
      <ConfigFolder />
    {:else}
      <FeatureFolder {id}></FeatureFolder>
    {/if}
  {/each}
</div>

<style>
  #click-ui {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2000;
  }

</style>
