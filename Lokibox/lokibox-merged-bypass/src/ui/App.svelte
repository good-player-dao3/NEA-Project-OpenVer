<script lang="ts">
  import { FeatureManager } from 'src/features/manager';
  import ClickUI from './ClickUI.svelte';
  import Category from './Category.svelte';
  import DraggableContainer from './folders/DraggableContainer.svelte';
  import Tracers from 'src/render/Tracers.svelte';
  import ESP from 'src/render/ESP.svelte';
  import Minimap from 'src/render/Minimap.svelte';
  import TargetHUD from 'src/render/TargetHUD.svelte';
  import ToastContainer from './ToastContainer.svelte';
  import './theme.css';

  const fm = FeatureManager.getInstance();

  let toggleClickUI = $state(fm.getFeatureById('click-ui')?.enabled ?? false);
  let categoryEnabled = $state(fm.getFeatureById('category')?.enabled ?? true);
  let minimapEnabled = $state(fm.getFeatureById('minimap')?.enabled ?? false);
  fm.onEnable('click-ui', () => { toggleClickUI = true; });
  fm.onDisable('click-ui', () => { toggleClickUI = false; });
  fm.onEnable('category', () => { categoryEnabled = true; });
  fm.onDisable('category', () => { categoryEnabled = false; });
  fm.onEnable('minimap', () => { minimapEnabled = true; });
  fm.onDisable('minimap', () => { minimapEnabled = false; });
</script>

{#if toggleClickUI}
  <ClickUI />
{/if}

{#if categoryEnabled}
  <DraggableContainer id="category" title="Category" class="category-outer">
    <Category />
  </DraggableContainer>
{/if}

{#if minimapEnabled}
  <DraggableContainer id="minimap" title="Minimap" class="minimap-outer">
    <Minimap inline />
  </DraggableContainer>
{/if}

<TargetHUD />

<Tracers />
<ESP />
<ToastContainer />

<style>
  :global(.category-outer),
  :global(.minimap-outer) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
</style>
