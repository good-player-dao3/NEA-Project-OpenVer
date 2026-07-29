<script lang="ts">
  import AccountSection from './AccountSection.svelte';
  import ThemeSection from './ThemeSection.svelte';

  let { tab = 'account' }: { tab?: string } = $props();
</script>

{#if tab === 'account'}
  <AccountSection />
{:else if tab === 'theme'}
  <ThemeSection />
{/if}
