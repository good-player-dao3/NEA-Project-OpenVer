<script lang="ts">
  import Head from './Head.svelte';
  import { FolderManager } from 'src/folders/manager';
  import { FolderStorageManager } from 'src/storage/folders';
  import './folder.css';
  import X from 'lucide-svelte/icons/x';

  const fm = FolderManager.getInstance();

  let {
    id,
    alwaysDisplay = false,
    canClose = true,
    width = 250,
    children,
  }: {
    id: string;
    alwaysDisplay?: boolean;
    canClose?: boolean;
    width?: number;
    children?: import('svelte').Snippet;
  } = $props();

  const fpm = FolderStorageManager.getInstance();

  let position = $state(fpm.getPosition(id));

  const f = fm.getFolderById(id)!;

  let display = $state(alwaysDisplay || f.getVisibility()!);

  fm.getFolderById(id)?.onVisibilityChange(v => {
    display = alwaysDisplay ? true : v;
    if (v) position = fpm.getPosition(id);
  });

  f.onPositionChange(pos => {
    position = pos;
  });

  function closeFolder() {
    f.setVisibility(false);
  }
</script>

{#if position && display}
  <div
    data-folder-id={id}
    class="folder"
    style:transform="translate({position.x}px,{position.y}px)"
    style:width={`${width}px`}
  >
    <Head {id} x0={position.x} y0={position.y}>
      {#if f.meta.icon}
        <f.meta.icon size={12} />
        &nbsp;
      {/if}
      {f.meta.displayName}
      {#if canClose}
        <button class="cross" onclick={closeFolder}><X size={12} /></button>
      {/if}
    </Head>
    <div class="container">{@render children?.()}</div>
  </div>
{/if}

<style>
  button.cross {
    margin-left: auto;
    color: #fff;
    background: transparent;
    border: none;
    border-radius: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 16px;
    height: 16px;
    padding: 0;
    transition:
      background 0.2s,
      color 0.2s;
  }

  button.cross:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  button.cross:active {
    background: rgba(0, 0, 0, 0.3);
  }

  button.cross:focus {
    outline: 2px solid rgba(0, 0, 0, 0.4);
  }
</style>
