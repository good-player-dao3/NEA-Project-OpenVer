<script lang="ts">
  import { type NumberSchema, type PropsValues } from 'src/features/schema';

  let {
    label,
    schema,
    prop,
    key,
  }: {
    label: string;
    schema: NumberSchema;
    prop: PropsValues<any>;
    key: string;
  } = $props();

  let value = $state(prop[key] as number);

  function onChange() {
    prop[key] = value;
  }

  function pct() {
    const t = schema.max - schema.min;
    return t ? ((value - schema.min) / t) * 100 : 0;
  }
</script>

<div class="ntop">
  {label}
  <span class="ndisplayer">{value.toFixed(2)}</span>
</div>
<div class="nccontainer">
  <input
    type="range"
    min={schema.min}
    max={schema.max}
    step={schema.step}
    class="ncontroller"
    style="background-size:{pct()}% 100%"
    bind:value={value}
    oninput={onChange}
  />
</div>

<style>
  .ntop {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .nccontainer {
    width: 100%;
  }
  .ncontroller {
    appearance: none;
    width: 100%;
    height: 3px;
    background:
      linear-gradient(var(--accent), var(--accent)) no-repeat,
      var(--track);
  }

  .ncontroller::-webkit-slider-thumb {
    appearance: none;
    background-color: var(--accent);
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }

  .ndisplayer {
    position: relative;
    right: 0;
  }
</style>
