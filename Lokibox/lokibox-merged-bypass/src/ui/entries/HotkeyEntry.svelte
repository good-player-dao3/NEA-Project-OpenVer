<script lang="ts">
  import { HotkeyStorageManager } from 'src/storage/hotkey';
  import { FeatureRegistry } from 'src/features/registry';
  import './entry.css';

  const hksm = HotkeyStorageManager.getInstance();
  const fr = FeatureRegistry.getInstance();

  export let id: string;

  const displayName = fr.getFeature(id)?.meta.displayName ?? id;

  let recording: boolean = false;

  function recordHotkey() {
    recording = true;
  }

  function getHotkey() {
    return hksm.getHotkey(id).toUpperCase();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!recording) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.key === 'Escape') {
      recording = false;
      return;
    }

    if (e.key === 'Backspace') {
      hksm.setHotkey(id, '');
      recording = false;
      return;
    }

    hksm.setHotkey(id, e.key);

    recording = false;
  }
</script>

<svelte:window on:keydown={onKeyDown} />

<button type="button" class="entry" on:click={recordHotkey} class:recording>
  {displayName}
  <span class="hotkey">
    {#if recording}
      ...
    {:else}
      {getHotkey()}
    {/if}
  </span>
</button>

<style>
  .entry.recording {
    background-color: var(--bg-active);
    color: var(--text-on-active);
  }

  .entry.recording:hover {
    background-color: var(--bg-active-hover);
    color: var(--text-on-active);
  }

  .hotkey {
    margin-left: auto;
  }
</style>
