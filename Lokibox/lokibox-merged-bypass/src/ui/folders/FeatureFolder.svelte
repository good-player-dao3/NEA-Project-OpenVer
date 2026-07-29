<script lang="ts">
  import Folder from './Folder.svelte';
  import Entry from '../entries/Entry.svelte';
  import { FeatureRegistry } from 'src/features/registry';

  export let id: string;

  const fr = FeatureRegistry.getInstance();

  const features = fr.getFeaturesByFolderId(id);
</script>

<Folder {id}>
  {#each features as f}
    <Entry id={f.meta.id}></Entry>
  {/each}
</Folder>
