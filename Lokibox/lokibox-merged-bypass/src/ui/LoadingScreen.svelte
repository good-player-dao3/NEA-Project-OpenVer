<script lang="ts">
  import { onMount } from 'svelte';
  import logoSrc from '../../logo.png';

  let { ready }: { ready: Promise<void> } = $props();

  let exiting = $state(false);
  let hidden = $state(false);

  onMount(() => {
    ready.then(async () => {
      exiting = true;
      await new Promise(r => setTimeout(r, 500));
      hidden = true;
    });
  });
</script>

{#if !hidden}
  <div class="overlay" class:fade-out={exiting}>
    <div class="content">
      <img class="logo" src={logoSrc} alt="LokiBox" />
      <div class="track">
        <div class="bar"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.4s ease;
  }

  .overlay.fade-out {
    opacity: 0;
    pointer-events: none;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .logo {
    width: 100px;
    height: auto;
    display: block;
  }

  .track {
    width: 140px;
    height: 2px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
  }

  .bar {
    width: 40%;
    height: 100%;
    background: #fff;
    border-radius: 2px;
    animation: slide 1.2s ease-in-out infinite;
  }

  @keyframes slide {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(250%);
    }
    100% {
      transform: translateX(250%);
    }
  }
</style>
