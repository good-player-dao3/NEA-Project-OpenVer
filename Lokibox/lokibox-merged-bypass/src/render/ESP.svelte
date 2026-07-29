<script lang="ts">
  import { Core } from 'src/core/core';
  import { FeatureManager } from 'src/features/manager';
  import { Vector3 } from 'src/utils/math';
  import { worldToScreen } from 'src/utils/view-projection';
  import { onMount } from 'svelte';
  import type { FeatureContext } from 'src/features/registry';
  import type { ESPFeature } from 'src/features/render/esp';

  let toggleESP = false;

  const fm = FeatureManager.getInstance();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  const dpr = window.devicePixelRatio || 1;
  interface ESPInfo {
    x: number;
    y: number;
  }
  interface ESPPlayer {
    verts: ESPInfo[];
    hpRatio: number;
    name: string;
  }

  let espBuffer: ESPPlayer[] = [];

  const core = Core.getInstance();
  core.onTick(() => {
    if (!toggleESP) return;

    const fctx = fm.getFeatureById('esp')?.getContext() as
      | FeatureContext<ESPFeature>
      | undefined;
    const excludeSpectator = fctx?.props.excludeSpectator ?? true;
    const showName = fctx?.props.showName ?? true;

    espBuffer.length = 0;

    const self = core.bodies.getSelfBody();

    core.bodies
      .getPlayerBodies()
      .filter(v => v.id !== self.id)
      .filter(v => !excludeSpectator || (v.flags & 6))
      .forEach(v => {
        const targetPos = v.position.toVector3();

        const flatVertexs = [];

        const vertexs = getVertexs(targetPos, v.boundingBox.toVector3());

        for (const vert of vertexs) {
          const p = worldToScreen(
            vert,
            core.camera.viewProjection,
            core.camera.viewport
          );
          if (p.w <= 0) break;
          flatVertexs.push(p);
        }

        if (flatVertexs.length !== 8) return;
        const dmg = core.damage.getDamageById(v.id);
        const hpRatio = dmg ? Math.min(dmg.hp / dmg.maxHp, 1) : 0.5;
        const name = showName ? (core.players.getPlayerById(v.id)?.name ?? '') : '';
        espBuffer.push({ verts: flatVertexs, hpRatio, name });
      });
  });

  onMount(() => {
    ctx = canvas.getContext('2d')!;

    ctx.scale(dpr, dpr);

    const animate = () => {
      if (!toggleESP) {
        requestAnimationFrame(animate);
        return;
      }

      // 自适应resize

      if (core.camera && canvas) {
        const [width, height] = core.camera.viewport;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        espBuffer.forEach(t => {
          drawBox(t, ctx);
        });
      }
      requestAnimationFrame(animate);
    };

    animate();
  });

  function getVertexs(position: Vector3, bounderBox: Vector3) {
    const { x: px, y: py, z: pz } = position;
    const { x: rx, y: ry, z: rz } = bounderBox;

    // index: 0 ~ 7
    return [
      new Vector3(px - rx, py - ry, pz - rz), // 0
      new Vector3(px + rx, py - ry, pz - rz), // 1
      new Vector3(px + rx, py + ry, pz - rz), // 2
      new Vector3(px - rx, py + ry, pz - rz), // 3
      new Vector3(px - rx, py - ry, pz + rz), // 4
      new Vector3(px + rx, py - ry, pz + rz), // 5
      new Vector3(px + rx, py + ry, pz + rz), // 6
      new Vector3(px - rx, py + ry, pz + rz), // 7
    ];
  }

  function drawBox(player: ESPPlayer, ctx: CanvasRenderingContext2D) {
    const { verts, hpRatio, name } = player;
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const { x, y } of verts) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    // 白色方框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

    // 名称（在方框正下方）
    if (!name) return;
    const MAX = 8;
    const display = name.length > MAX ? name.slice(0, MAX) + '…' : name;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const textW = ctx.measureText(display).width + 6;
    const labelX = minX + (maxX - minX) / 2 - textW / 2;
    const labelY = maxY + 2;

    const hpColor = `rgb(${Math.floor((1 - hpRatio) * 255)},${Math.floor(hpRatio * 200)},60)`;
    ctx.fillStyle = hpColor;
    ctx.fillRect(labelX, labelY, textW, 14);
    ctx.fillStyle = '#fff';
    ctx.fillText(display, minX + (maxX - minX) / 2, labelY + 1);
  }

  fm.onEnable('esp', () => {
    toggleESP = true;
  });

  fm.onDisable('esp', () => {
    toggleESP = false;
  });
</script>

<canvas bind:this={canvas} class="esp" class:toggled={toggleESP}></canvas>

<style>
  .esp {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    user-select: none;
    pointer-events: none;
  }

  .esp.toggled {
    opacity: 1;
  }
  .esp:not(.toggled) {
    opacity: 0;
  }
</style>
