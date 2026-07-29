<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { Snippet } from 'svelte';
  import type { ComponentType } from 'svelte';

  export type ContextAction = {
    label: string;
    icon: ComponentType;
    onClick: () => void;
    danger?: boolean;
  };

  let {
    actions,
    children,
  }: { actions: ContextAction[]; children: Snippet } = $props();

  let expanded = $state(false);

  function trigger(e: MouseEvent) {
    e.preventDefault();
    expanded = !expanded;
  }

  function doAction(action: ContextAction) {
    expanded = false;
    action.onClick();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="context-host" oncontextmenu={trigger}>
  {@render children()}
</div>

{#if expanded}
  <div class="context-actions" transition:slide>
    {#each actions as action}
      <button
        class="action-item"
        class:action-danger={action.danger}
        onclick={() => doAction(action)}
      >
        <action.icon size={12} />
        <span>{action.label}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .context-actions {
    display: flex;
    flex-direction: column;
    background: var(--bg-default);
    border-top: 1px solid #fff1;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 10px;
    border: none;
    background: transparent;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .action-item:hover {
    background: var(--bg-hover);
  }

  .action-item.action-danger {
    color: #f87171;
  }
</style>
