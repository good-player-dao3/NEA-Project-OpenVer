<script lang="ts">
  import { FeatureRegistry } from 'src/features/registry';
  import HotkeyController from '../entries/HotkeyEntry.svelte';
  import Folder from './Folder.svelte';

  const fr = FeatureRegistry.getInstance();

  const features = fr
    .getFeatureEntries()
    .map(v => v[0])
    .toArray()
    .sort((a, b) => a.localeCompare(b) || b.length - a.length);
</script>

<Folder id="hotkey">
    {#each features as f}
      <HotkeyController id={f}></HotkeyController>
    {/each}
</Folder>
