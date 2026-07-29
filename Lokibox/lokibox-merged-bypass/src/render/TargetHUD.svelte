<script lang="ts">
  import { Core } from 'src/core/core';
  import { FeatureManager } from 'src/features/manager';
  import { FolderStorageManager } from 'src/storage/folders';

  let { inline = false }: { inline?: boolean } = $props();

  let enabled = $state(false);
  let visible = $state(false);
  let name = $state('');
  let hp = $state(0);
  let maxHp = $state(100);
  let distance = $state(0);
  let clickUIOpen = $state(false);

  const core = Core.getInstance();
  const fm = FeatureManager.getInstance();
  const fpm = FolderStorageManager.getInstance();

  let externalPos = $state(fpm.getPosition('target-hud') ?? { x: 20, y: 100 });

  const show = $derived(enabled && visible && (inline || !clickUIOpen));

  $effect(() => {
    if (show && !inline) {
      const pos = fpm.getPosition('target-hud');
      if (pos) externalPos = pos;
    }
  });

  core.onTick(() => {
    const ka = fm.getFeatureById('kill-aura');
    const kp = fm.getFeatureById('kill-aura-plus');
    const aa = fm.getFeatureById('aim-assist');

    let targetId: number | null = null;

    if (aa?.enabled && (aa.base as any).targetId != null) {
      targetId = (aa.base as any).targetId as number;
    } else if (ka?.enabled && (ka.base as any).targetId != null) {
      targetId = (ka.base as any).targetId as number;
    } else if (kp?.enabled && (kp.base as any).targetId != null) {
      targetId = (kp.base as any).targetId as number;
    }

    if (targetId == null) {
      visible = false;
      return;
    }

    const player = core.players.getPlayerById(targetId);
    const damage = core.damage.getDamageById(targetId);

    if (!player) {
      visible = false;
      return;
    }

    name = player.name;
    hp = damage?.hp ?? 0;
    maxHp = damage?.maxHp ?? 100;

    // 距离计算
    const selfBody = core.bodies.getSelfBody();
    const targetBody = core.bodies.getBodyById(targetId);
    if (selfBody && targetBody) {
      const dx = targetBody.position.x - selfBody.position.x;
      const dy = targetBody.position.y - selfBody.position.y;
      const dz = targetBody.position.z - selfBody.position.z;
      distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    visible = true;
  });

  fm.onEnable('target-hud', () => {
    enabled = true;
  });
  fm.onDisable('target-hud', () => {
    enabled = false;
  });
  fm.onEnable('click-ui', () => {
    clickUIOpen = true;
  });
  fm.onDisable('click-ui', () => {
    clickUIOpen = false;
  });

  if (fm.getFeatureById('target-hud')?.enabled) enabled = true;
  if (fm.getFeatureById('click-ui')?.enabled) clickUIOpen = true;
</script>

{#if inline}
  <div class="target-hud-inner thud-placeholder">
    <div class="thud-bg" style="width: 50%"></div>
    <div class="thud-rows">
      <span class="thud-name">Steve</span>
      <span class="thud-hp">10 / 20</span>
    </div>
    <span class="thud-distance">10 m</span>
  </div>
{:else if show}
    <div
      class="target-hud-external"
      class:thud-hidden={!show}
      style:transform="translate({externalPos.x}px,{externalPos.y}px)"
    >
      <div class="target-hud-inner">
        <div
          class="thud-bg"
          style="width: {maxHp > 0 ? (hp / maxHp) * 100 : 0}%"
        ></div>
        <div class="thud-rows">
          <span class="thud-name">{name}</span>
          <span class="thud-hp">{Math.round(hp)} / {Math.round(maxHp)}</span>
        </div>
        <span class="thud-distance">{Math.round(distance)} m</span>
      </div>
    </div>
{/if}

<style>
  .target-hud-external {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
  }

  .target-hud-external.thud-hidden {
    display: none;
  }

  .target-hud-inner {
    position: relative;
    min-width: 180px;
    background: rgba(34, 34, 34, 0.85);
    border-radius: 4px;
    overflow: hidden;
    isolation: isolate;
    pointer-events: none;
  }

  .thud-bg {
    position: absolute;
    inset: 0 auto 0 0;
    background: rgba(255, 255, 255, 0.85);
    z-index: 0;
    transition: width 0.15s ease-out;
  }

  .thud-rows {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    padding: 6px 14px;
    font-family: 'Poppins', sans-serif;
    color: #fff;
    mix-blend-mode: difference;
    margin-right: 50px;
  }

  .thud-name {
    font-size: 14px;
    font-weight: 400;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .thud-hp {
    font-size: 11px;
    font-weight: 400;
  }

  .thud-distance {
    position: absolute;
    top: 6px;
    right: 10px;
    z-index: 1;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    mix-blend-mode: difference;
  }
</style>
