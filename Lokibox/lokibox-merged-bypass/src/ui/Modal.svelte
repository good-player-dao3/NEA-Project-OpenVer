<script lang="ts">
  let {
    title = '',
    onclose,
    children,
  }: {
    title?: string;
    onclose: () => void;
    children?: import('svelte').Snippet;
  } = $props();

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  function onBackClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="modal-backdrop" role="presentation" onclick={onBackClick} onkeydown={() => {}}>
  <div class="modal-panel">
    <div class="modal-header">
      <span class="modal-title">{title}</span>
      <button class="modal-close" onclick={onclose}>✕</button>
    </div>
    <div class="modal-body">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade-in 0.12s ease-out;
  }

  .modal-panel {
    width: 50vw;
    max-width: 50vw;
    aspect-ratio: 4 / 3;
    background: var(--bg-default);
    border: 1px solid #fff1;
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    animation: scale-in 0.12s ease-out;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid #fff1;
    flex-shrink: 0;
  }

  .modal-title {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-default);
  }

  .modal-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-default);
    opacity: 0.5;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.15s, background 0.15s;
  }

  .modal-close:hover {
    color: var(--text-default);
    opacity: 1;
    background: #ffffff15;
  }

  .modal-body {
    flex: 1;
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    color: var(--text-default);
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
