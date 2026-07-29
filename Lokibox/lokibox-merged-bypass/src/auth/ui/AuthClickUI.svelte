<script lang="ts">
  import { onDestroy } from 'svelte';
  import AuthPanel from './AuthPanel.svelte';

  function stopInputPropagation(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      e.stopImmediatePropagation();
    }
  }

  window.addEventListener('keydown', stopInputPropagation, true);

  onDestroy(() => {
    window.removeEventListener('keydown', stopInputPropagation, true);
  });
</script>

<div id="click-ui">
  <AuthPanel />
</div>

<style>
  #click-ui {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    background-color: rgba(0, 0, 0, 0.5);

    z-index: 2000;
  }
</style>
