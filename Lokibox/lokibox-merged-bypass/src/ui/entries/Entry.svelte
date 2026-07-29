<script lang="ts">
  import { FeatureManager } from 'src/features/manager';
  import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
  import NumberController from '../controllers/NumberController.svelte';
  import type { NumberSchema, SelectSchema } from 'src/features/schema';
  import BooleanController from '../controllers/BooleanController.svelte';
  import { slide } from 'svelte/transition';
  import SelectController from '../controllers/SelectController.svelte';
  import RangeController from '../controllers/RangeController.svelte';
  import type { RangeSchema } from 'src/features/schema';

  import './entry.css';

  export let id: string;

  const fm = FeatureManager.getInstance();

  const f = fm.getFeatureById(id)!;
  const displayName = f.meta.displayName;
  const schema = f.base.schema;
  const hasExpandedMenu = Object.keys(schema).length !== 0;

  let enabled: boolean = f.enabled;

  function switchFeature() {
    if (f.enabled) {
      f.disable();
      enabled = false;
    } else {
      f.enable();
      enabled = true;
    }
  }

  let expanded = false;

  function expandMenu(e: MouseEvent) {
    e.preventDefault();
    if (!hasExpandedMenu) return;
    expanded = !expanded;
  }

  f.onEnable(() => (enabled = true));
  f.onDisable(() => (enabled = false));
</script>

<button
  type="button"
  class="entry"
  on:click={switchFeature}
  on:contextmenu={expandMenu}
  class:enabled
>
  {displayName}
  {#if hasExpandedMenu}
    <span class="ellipsis"> <EllipsisVertical /></span>
  {/if}
</button>
{#if expanded}
  {@const props = f.getContext().props}
  <div class="props" transition:slide>
    {#each Object.entries(schema) as [key, value]}
      <div class="prop-entry">
        {#if value.type === 'number'}
          <NumberController
            label={value.label}
            schema={value as NumberSchema}
            prop={props}
            {key}
          />
        {:else if value.type === 'boolean'}
          <BooleanController label={value.label} prop={props} {key} />
        {:else if value.type === 'select'}
          <SelectController
            label={value.label}
            schema={value as SelectSchema<any>}
            prop={props}
            {key}
          />
        {:else if value.type === 'range'}
          <RangeController
            label={value.label}
            schema={value as RangeSchema}
            prop={props}
            {key}
          />
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .entry.enabled {
    background-color: var(--bg-active);
    color: var(--text-on-active);
  }

  .entry.enabled:hover {
    background-color: var(--bg-active-hover);
    color: var(--text-on-active);
  }

  .ellipsis {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .props {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    padding-right: 10px;
  }

  .prop-entry {
    padding-top: 10px;
    padding-bottom: 10px;
    color: #fff;
    font-size: 12px;
    font-family: 'Poppins', sans-serif;
    width: 100%;
  }
</style>
