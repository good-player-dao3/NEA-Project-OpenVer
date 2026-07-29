<script lang="ts">
  import { draggable } from '../draggable';

  export let id: string;
  export let x0: number;
  export let y0: number;
</script>

<div class="head" use:draggable={{ id, x0, y0 }}>
  <slot></slot>
</div>

<style>
  .head {
    width: 100%;
    height: 40px;
    background-color: var(--bg-default);
    color: var(--text-default);
    cursor: move;
    user-select: none;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;

    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    padding-right: 10px;

    flex-shrink: 0;
  }

  .head:hover {
    background-color: var(--bg-hover);
    color: var(--text-default);
  }
</style>
