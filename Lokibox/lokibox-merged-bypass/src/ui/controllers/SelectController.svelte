<script lang="ts">
  import { type PropsValues, type SelectSchema } from 'src/features/schema';

  export let label: string;
  export let schema: SelectSchema<any>;
  export let prop: PropsValues<any>;
  export let key: string;

  let value = prop[key] as string;

  function onChange() {
    console.log(prop[key], prop, key, value);
    prop[key] = value;
  }
</script>

<div class="ntop">
  {label}
  <select onchange={onChange} bind:value>
    {#each schema.options as option}
      <option value={option.id}>{option.name}</option>
    {/each}
  </select>
</div>

<style>
  .ntop {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  select {
    appearance: base-select;
    border: unset;
    background-color: var(--bg-default);
    color: #fff;
  }

  ::picker(select) {
    appearance: base-select;
    border: unset;
    background-color: var(--bg-hover);
    color: #fff;
  }

  ::picker-icon(select) {
    display: none;
  }

  ::checkmark(select) {
    display: none;
  }
</style>
