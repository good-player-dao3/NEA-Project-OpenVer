<script lang="ts">
  import type { RangeSchema, PropsValues } from 'src/features/schema';

  let {
    label,
    schema,
    prop,
    key,
  }: {
    label: string;
    schema: RangeSchema;
    prop: PropsValues<any>;
    key: string;
  } = $props();

  const v = prop[key] as { min: number; max: number } | undefined;
  let range = $state<{ min: number; max: number }>(
    v?.min != null ? v : schema.default,
  );

  function commit() {
    prop[key] = range;
  }

  function onMinIn(e: Event) {
    const input = e.target as HTMLInputElement;
    let v = Number(input.value);
    if (v > range.max - schema.step) {
      v = range.max - schema.step;
      input.value = String(v);
    }
    if (v === range.min) return;
    range = { min: v, max: range.max };
    commit();
  }

  function onMaxIn(e: Event) {
    const input = e.target as HTMLInputElement;
    let v = Number(input.value);
    if (v < range.min + schema.step) {
      v = range.min + schema.step;
      input.value = String(v);
    }
    if (v === range.max) return;
    range = { min: range.min, max: v };
    commit();
  }

  // 计算值在轨道上的百分比
  function pct(v: number) {
    const t = schema.max - schema.min;
    return t ? ((v - schema.min) / t) * 100 : 0;
  }
</script>

<div class="rtop">
  <span>{label}</span>
  <span class="rdisplay">{range.min} – {range.max}</span>
</div>
<div class="rtrack">
  <div class="rbase"></div>
  <!-- 中间高亮段 -->
  <div
    class="rhighlight"
    style="left:{pct(range.min)}%;width:{pct(range.max) - pct(range.min)}%"
  ></div>
  <!-- Native input（交互层，thumb 透明） -->
  <input
    type="range"
    class="rslider rmin"
    min={schema.min}
    max={schema.max}
    step={schema.step}
    value={range.min}
    oninput={onMinIn}
  />
  <input
    type="range"
    class="rslider rmax"
    min={schema.min}
    max={schema.max}
    step={schema.step}
    value={range.max}
    oninput={onMaxIn}
  />
  <!-- SVG thumb（视觉层，pointer-events: none 穿透给 native input） -->
  <svg
    class="svg-thumb svg-min"
    style="left: calc({pct(range.min)}% - 5px);"
    width="10" height="18" viewBox="0 0 10 18"
  >
    <polygon points="0,0 10,9 0,18" fill="var(--accent)" stroke="#111" stroke-width="1.2" />
  </svg>
  <svg
    class="svg-thumb svg-max"
    style="left: calc({pct(range.max)}% - 5px);"
    width="10" height="18" viewBox="0 0 10 18"
  >
    <polygon points="10,0 0,9 10,18" fill="var(--accent)" stroke="#111" stroke-width="1.2" />
  </svg>
</div>

<style>
  .rtop {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rdisplay {
    opacity: 0.65;
    font-variant-numeric: tabular-nums;
  }

  .rtrack {
    position: relative;
    width: 100%;
    height: 20px;
    margin-top: 4px;
  }

  /* ── 底层轨道 ─────────────────────────────────── */

  .rbase {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    height: 3px;
    background: var(--track);
    border-radius: 2px;
  }

  /* ── 中间高亮段 ─────────────────────────────────── */

  .rhighlight {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 3px;
    background: var(--accent);
    border-radius: 2px;
    pointer-events: none;
  }

  /* ── 双滑块（native 交互层） ─────────────────────── */

  .rslider {
    position: absolute;
    width: 100%;
    appearance: none;
    background: transparent;
    pointer-events: none;
    margin: 0;
    top: 0;
    height: 20px;
  }

  .rslider::-webkit-slider-runnable-track {
    height: 3px;
    background: transparent;
  }

  .rslider::-webkit-slider-thumb {
    appearance: none;
    pointer-events: all;
    width: 16px;
    height: 24px;
    opacity: 0;
    cursor: pointer;
  }

  .rslider::-moz-range-thumb {
    pointer-events: all;
    width: 16px;
    height: 24px;
    opacity: 0;
    cursor: pointer;
    border: none;
    background: transparent;
  }

  /* ── SVG thumbs（视觉层，穿透点击） ──────────────── */

  .svg-thumb {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
  }
</style>
