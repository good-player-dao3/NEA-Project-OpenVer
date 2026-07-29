<script lang="ts">
  import { Core } from 'src/core/core';
  import { FeatureManager } from 'src/features/manager';
  import { FolderStorageManager } from 'src/storage/folders';
  import type { FeatureContext } from 'src/features/registry';
  import type { MinimapFeature } from 'src/features/render/minimap';
  import { onMount } from 'svelte';

  let { inline = false }: { inline?: boolean } = $props();

  let enabled = $state(false);
  let clickUIOpen = $state(false);

  const fm = FeatureManager.getInstance();
  const fpm = FolderStorageManager.getInstance();
  const core = Core.getInstance();

  let externalPos = $state(fpm.getPosition('minimap') ?? { x: 0, y: 0 });

  let canvas: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D;

  const dpr = window.devicePixelRatio || 1;

  // 外部模式：每次 visible 时从 FolderStorageManager 读取最新位置
  // （ClickUI 中的 DraggableContainer 拖动 Head 会写入同一个 storage key）
  const visible = $derived(enabled && (inline || !clickUIOpen));

  $effect(() => {
    if (visible && !inline) {
      const pos = fpm.getPosition('minimap');
      if (pos) externalPos = pos;
    }
  });

  // ── 渲染 ──────────────────────────────────────────

  onMount(() => {
    ctx = canvas?.getContext('2d')!;

    const animate = () => {
      const fctx = fm.getFeatureById('minimap')?.getContext() as
        | FeatureContext<MinimapFeature>
        | undefined;

      if (!visible || !core.camera || !fctx || !canvas) {
        requestAnimationFrame(animate);
        return;
      }

      const { size, scale, opacity, colorByHp, showName, excludeSpectator } = fctx.props;
      const logical = size * dpr;
      const half = logical / 2;
      const corner = 8 * dpr;
      const mapArea = half - dpr;

      if (canvas.width !== logical || canvas.height !== logical) {
        canvas.width = logical;
        canvas.height = logical;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
      }

      ctx.clearRect(0, 0, logical, logical);

      ctx.beginPath();
      ctx.roundRect(dpr, dpr, logical - 2 * dpr, logical - 2 * dpr, corner);
      ctx.fillStyle = `rgba(0,0,0,${opacity})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(dpr, dpr, logical - 2 * dpr, logical - 2 * dpr, corner);
      ctx.clip();

      const self = core.bodies.getSelfBody();
      if (!self) {
        ctx.restore();
        requestAnimationFrame(animate);
        return;
      }

      const selfX = self.position.x;
      const selfZ = self.position.z;
      const pxPerUnit = mapArea / scale;

      const yaw = -core.camera.pitch + Math.PI / 2;
      ctx.save();
      ctx.translate(half, half);
      ctx.rotate(yaw);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5 * dpr;
      const gridStep = 10;
      const gridPx = gridStep * pxPerUnit;
      const extent = mapArea + gridPx;
      for (let p = 0; p <= extent; p += gridPx) {
        ctx.beginPath();
        ctx.moveTo(p, -extent);
        ctx.lineTo(p, extent);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-p, -extent);
        ctx.lineTo(-p, extent);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-extent, p);
        ctx.lineTo(extent, p);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-extent, -p);
        ctx.lineTo(extent, -p);
        ctx.stroke();
      }

      const playerBodies = core.bodies
        .getPlayerBodies()
        .filter(b => b.id !== self.id)
        .filter(b => !excludeSpectator || (b.flags & 6));
      for (const body of playerBodies) {
        const wx = body.position.x - selfX;
        const wz = body.position.z - selfZ;
        if (Math.abs(wx) > scale || Math.abs(wz) > scale) continue;
        const dist = Math.sqrt(wx * wx + wz * wz);

        const px = wx * pxPerUnit;
        const py = wz * pxPerUnit;

        // 颜色：基于血量或距离
        if (colorByHp) {
          const dmg = core.damage.getDamageById(body.id);
          const hpRatio = dmg ? Math.min(dmg.hp / dmg.maxHp, 1) : 0.5;
          ctx.beginPath();
          ctx.arc(px, py, 2.5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${Math.floor((1 - hpRatio) * 255)},${Math.floor(hpRatio * 200)},60)`;
          ctx.fill();
        } else {
          const t = Math.min(dist / scale, 1);
          ctx.beginPath();
          ctx.arc(px, py, 2.5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${Math.floor(t * 255)},${Math.floor((1 - t) * 200)},60)`;
          ctx.fill();
        }

        // 玩家名称（反向旋转保持正向）
        if (showName) {
          const name = core.players.getPlayerById(body.id)?.name;
          if (name) {
            const MAX = 8;
            const display = name.length > MAX ? name.slice(0, MAX) + '…' : name;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(-yaw);
            ctx.font = `${10 * dpr}px sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 3 * dpr;
            ctx.lineJoin = 'round';
            ctx.strokeText(display, 4 * dpr, 0);
            ctx.fillStyle = '#fff';
            ctx.fillText(display, 4 * dpr, 0);
            ctx.restore();
          }
        }
      }

      ctx.restore();

      // 自身标记 — 内凹飞机形，尾部锚在中心
      // 点序: (-1,0) (0,2) (1,0) (0,1)  屏幕Y↓ (0,1)=中心
      const s = 4 * dpr;
      ctx.beginPath();
      ctx.moveTo(half - s, half + s);       // (-1,0)
      ctx.lineTo(half, half - s);           // (0,2) nose
      ctx.lineTo(half + s, half + s);       // (1,0)
      ctx.lineTo(half, half);               // (0,1) tail @ center
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
      requestAnimationFrame(animate);
    };

    animate();
  });

  fm.onEnable('minimap', () => {
    enabled = true;
  });
  fm.onDisable('minimap', () => {
    enabled = false;
  });
  fm.onEnable('click-ui', () => {
    clickUIOpen = true;
  });
  fm.onDisable('click-ui', () => {
    clickUIOpen = false;
  });

  if (fm.getFeatureById('minimap')?.enabled) enabled = true;
  if (fm.getFeatureById('click-ui')?.enabled) clickUIOpen = true;
</script>

{#if inline}
  <canvas bind:this={canvas}></canvas>
{:else}
  <div
    class="minimap-external"
    class:minimap-hidden={!visible}
    style:transform="translate({externalPos.x}px,{externalPos.y}px)"
  >
    <canvas bind:this={canvas}></canvas>
  </div>
{/if}

<style>
  .minimap-external {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
  }

  .minimap-external.minimap-hidden {
    display: none;
  }

  canvas {
    display: block;
    border-radius: 4px;
  }
</style>
