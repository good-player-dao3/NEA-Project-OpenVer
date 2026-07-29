<script lang="ts">
  import { onMount } from 'svelte';
  import { ToastManager, type Toast, type ToastType } from 'src/utils/toast';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import CircleAlert from 'lucide-svelte/icons/circle-alert';
  import Info from 'lucide-svelte/icons/info';

  const tm = ToastManager.getInstance();

  interface ToastState {
    toast: Toast;
    exiting: boolean;
  }

  let toasts = $state<ToastState[]>([]);

  function remove(id: number) {
    toasts = toasts.filter(t => t.toast.id !== id);
  }

  function addToast(toast: Toast) {
    const state: ToastState = { toast, exiting: false };
    toasts = [...toasts, state];

    // 计时结束后触发退出动画
    setTimeout(() => {
      state.exiting = true;
      // 等退出动画播完再移除
      setTimeout(() => remove(toast.id), 280);
    }, toast.duration);
  }

  onMount(() => {
    tm.onToast(addToast);
  });

  function iconFor(type: ToastType) {
    switch (type) {
      case 'success':
        return CircleCheck;
      case 'error':
        return CircleAlert;
      default:
        return Info;
    }
  }
</script>

{#if toasts.length > 0}
  <div class="toast-container">
    {#each toasts as { toast, exiting } (toast.id)}
      <div
        class="toast"
        class:exiting
        class:success={toast.type === 'success'}
        class:error={toast.type === 'error'}
        class:info={toast.type === 'info'}
      >
        <div class="toast-body">
          {#if toast.type === 'success'}
            <CircleCheck size={15} class="icon" />
          {:else if toast.type === 'error'}
            <CircleAlert size={15} class="icon" />
          {:else}
            <Info size={15} class="icon" />
          {/if}
          <span class="message">{toast.message}</span>
        </div>
        <div class="timer-track">
          <div
            class="timer-bar"
            style:--duration={toast.duration + 'ms'}
          ></div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99998;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    pointer-events: none;
  }

  .toast {
    width: 280px;
    background: var(--bg-default);
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
    pointer-events: auto;
    animation: slide-in 0.28s ease-out;
  }

  .toast.exiting {
    animation: slide-out 0.28s ease-in forwards;
  }

  .toast-body {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px 8px;
  }

  .toast-body :global(svg) {
    flex-shrink: 0;
  }

  .toast.info .toast-body {
    color: #8ab4f8;
  }

  .toast.success .toast-body {
    color: #4ade80;
  }

  .toast.error .toast-body {
    color: #f87171;
  }

  .message {
    flex: 1;
    color: var(--text-default);
    opacity: 0.85;
    font-size: 12.5px;
    font-family: 'Poppins', sans-serif;
    line-height: 1.4;
    word-break: break-word;
  }

  /* ── 计时条 ────────────────────────────────────── */

  .timer-track {
    height: 2px;
    background: #2a2a2a;
  }

  .timer-bar {
    height: 100%;
    background: #555;
    animation: shrink var(--duration, 3000ms) linear forwards;
  }

  .toast.success .timer-bar {
    background: #4ade80;
  }

  .toast.error .timer-bar {
    background: #f87171;
  }

  .toast.info .timer-bar {
    background: #8ab4f8;
  }

  /* ── 动画 ──────────────────────────────────────── */

  @keyframes slide-in {
    from {
      transform: translateX(120%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slide-out {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(120%);
      opacity: 0;
    }
  }

  /* ── shrink ────────────────────────────────────── */

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
</style>
