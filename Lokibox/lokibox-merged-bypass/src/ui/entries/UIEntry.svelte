<script lang="ts">
  import { FolderManager } from 'src/folders/manager';
  import './entry.css';

  export let id: string;

  const fm = FolderManager.getInstance();

  const f = fm.getFolderById(id)!;

  let visible: boolean = f.getVisibility()!;

  function changeVisibility() {
    f.setVisibility(!visible);
  }

  f.onVisibilityChange(v => {
    visible = v;
  });
</script>

<button
  type="button"
  class="entry"
  on:click={changeVisibility}
  on:contextmenu={e => e.stopPropagation()}
  class:visible
>
  {#if f.meta.icon}
    <svelte:component this={f.meta.icon} size={12} />
    &nbsp;
  {/if}
  {f.meta.displayName}
</button>

<style>
  .entry.visible {
    background-color: var(--bg-active);
    color: var(--text-on-active);
  }

  .entry.visible:hover {
    background-color: var(--bg-active-hover);
    color: var(--text-on-active);
  }
</style>
