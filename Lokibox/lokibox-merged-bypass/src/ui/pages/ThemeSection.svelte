<script lang="ts">
  import {
    THEME_COLOR_KEYS,
    THEME_COLOR_LABELS,
    type ThemeColors,
    getTheme,
    setTheme,
    DEFAULT_THEME,
  } from 'src/ui/theme';
  import { ToastManager } from 'src/utils/toast';

  const toast = ToastManager.getInstance();

  let colors = $state<ThemeColors>({ ...getTheme() });

  $effect(() => {
    setTheme(colors);
  });

  function resetTheme() {
    colors = { ...DEFAULT_THEME };
    toast.show('Theme reset to default', 'success');
  }
</script>

<div class="section">
  <div class="section-title">Live Preview</div>
  <div class="preview-box">
    <div class="preview-toggle">
      <span class="preview-label">Toggle OFF</span>
      <div class="toggle-track off">
        <div class="toggle-thumb"></div>
      </div>
    </div>
    <div class="preview-toggle">
      <span class="preview-label">Toggle ON</span>
      <div class="toggle-track on">
        <div class="toggle-thumb on"></div>
      </div>
    </div>
    <div class="preview-active-row">
      <span>Active entry</span>
    </div>
    <div class="preview-slider">
      <div class="slider-fill"></div>
    </div>
    <div class="preview-bg-row">
      <span>Default BG</span>
    </div>
    <div class="preview-bg-hover-row">
      <span>Hover</span>
    </div>
    <div class="preview-text-row">
      <span>Text (--text-default)</span>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Theme Colors</div>
  {#each THEME_COLOR_KEYS as key}
    <div class="color-row">
      <div class="color-info">
        <span class="color-label">{THEME_COLOR_LABELS[key]}</span>
        <span class="color-desc">{DESCRIPTIONS[key]}</span>
      </div>
      <div class="color-pick">
        <span class="color-hex">{colors[key]}</span>
        <input type="color" bind:value={colors[key]} class="color-input" />
      </div>
    </div>
  {/each}
  <button class="reset-btn" onclick={resetTheme}>Reset to Default</button>
</div>

<script module>
  const DESCRIPTIONS: Record<string, string> = {
    accent: 'Toggles, sliders, active tabs',
    bgDefault: 'Panel background',
    bgHover: 'Hover background',
    bgActive: 'Active entry background',
    bgActiveHover: 'Active entry hover',
    textDefault: 'Text color',
    textOnActive: 'Active entry text',
    track: 'Slider track',
  };
</script>

<style>
  .section {
    padding: 0 14px;
  }

  .section + .section {
    border-top: 1px solid #fff1;
  }

  .section-title {
    padding: 10px 0 6px;
    font-size: 11px;
    font-weight: 600;
    opacity: 0.45;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── Preview box ───────────────────────────────── */

  .preview-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    margin-bottom: 4px;
    background: var(--bg-default);
    border-radius: 6px;
    border: 1px solid #2a2a2a;
  }

  .preview-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .preview-label {
    font-size: 12px;
    opacity: 0.7;
  }

  .toggle-track {
    width: 32px;
    height: 18px;
    border-radius: 9px;
    background: #252525;
    position: relative;
    transition: background 0.15s;
  }

  .toggle-track.on {
    background: var(--accent);
  }

  .toggle-track .toggle-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--bg-active);
    position: absolute;
    left: 2px;
    top: 2px;
    transition: background 0.15s, left 0.15s;
  }

  .toggle-track.on .toggle-thumb {
    left: 16px;
    background: var(--bg-default);
  }

  .preview-active-row {
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 4px;
    background: var(--bg-active);
    color: var(--text-on-active);
    font-size: 12px;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
  }

  .preview-slider {
    height: 4px;
    border-radius: 2px;
    background: var(--track);
    position: relative;
    transition: background 0.15s;
  }

  .preview-slider .slider-fill {
    width: 60%;
    height: 100%;
    border-radius: 2px;
    background: var(--accent);
    transition: background 0.15s;
  }

  .preview-bg-row,
  .preview-bg-hover-row,
  .preview-text-row {
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 4px;
    font-size: 12px;
    transition: background 0.15s;
  }

  .preview-bg-row {
    background: var(--bg-default);
    color: var(--text-default);
  }

  .preview-bg-hover-row {
    background: var(--bg-hover);
    color: var(--text-default);
  }

  .preview-text-row {
    background: var(--bg-default);
    color: var(--text-default);
    border: 1px solid var(--bg-hover);
  }

  /* ── Color rows ───────────────────────────────── */

  .color-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    gap: 12px;
  }

  .color-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .color-label {
    font-size: 12px;
    font-weight: 500;
  }

  .color-desc {
    font-size: 10px;
    opacity: 0.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .color-pick {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .color-hex {
    font-size: 11px;
    font-family: monospace;
    opacity: 0.45;
    min-width: 58px;
    text-align: right;
  }

  .color-input {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #444;
    border-radius: 4px;
    background: none;
    cursor: pointer;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  .color-input::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }

  .reset-btn {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;
    border: 1px solid #fff1;
    border-radius: 6px;
    background: transparent;
    color: var(--text-default);
    opacity: 0.5;
    font-family: 'Poppins', sans-serif;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }

  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    opacity: 0.75;
  }
</style>
