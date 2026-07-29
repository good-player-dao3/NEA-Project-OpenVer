<script lang="ts">
  import { Core } from 'src/core/core';
  import { FeatureManager } from 'src/features/manager';
  import type { FeatureContext } from 'src/features/registry';
  import type { TracersFeature } from 'src/features/render/tracers';
  import { worldToScreen } from 'src/utils/view-projection';
  import { onMount } from 'svelte';

  let toggleTracers = false;

  const fm = FeatureManager.getInstance();
  interface TracerInfo {
    x: number;
    y: number;
    z: number;
    distance: number;
    lookingAt: number;
  }

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  const dpr = window.devicePixelRatio || 1;

  let tracerBuffer: TracerInfo[] = [];

  const core = Core.getInstance();
  core.onTick(() => {
    if (!toggleTracers) return;

    tracerBuffer.length = 0;

    const self = core.bodies.getSelfBody();
    const selfPos = self.position.toVector3();

    core.bodies
      .getPlayerBodies()
      .filter(v => v.id !== self.id)
      .forEach(v => {
        const targetPos = v.position.toVector3();

        const { x, y, z, w } = worldToScreen(
          targetPos,
          core.camera.viewProjection,
          core.camera.viewport
        );

        if (w <= 0) return;

        const distance = selfPos.dist(targetPos);
        const f = core.players.getPlayerInputById(v.id)!.cameraForward;
        const lookingAt = f.dot(selfPos.sub(targetPos).normalize());

        tracerBuffer.push({ x, y, z, distance, lookingAt });
      });
  });

  onMount(() => {
    ctx = canvas.getContext('2d')!;

    ctx.scale(dpr, dpr);

    const animate = () => {
      if (!toggleTracers) {
        requestAnimationFrame(animate);
        return;
      }

      // 自适应resize
      const fctx = fm
        .getFeatureById('tracers')!
        .getContext() as FeatureContext<TracersFeature>;

      if (core.camera && fctx && canvas) {
        const [width, height] = core.camera.viewport;

        canvas.width = width;
        canvas.height = height;

        const start = {
          x: width / 2,
          y: height * 0.94,
        };

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        tracerBuffer.forEach(t => {
          ctx.beginPath();
          ctx.strokeStyle = getStyle(t.distance, t.lookingAt);
          //ctx.setLineDash(getDashByDistance(t.distance));
          ctx.lineWidth = fctx.props.strokeWidth;

          ctx.moveTo(start.x, start.y);
          ctx.lineTo(t.x, t.y);

          ctx.stroke();
        });
      }
      requestAnimationFrame(animate);
    };

    animate();
  });

  function getStyle(distance: number, lookingAt: number) {
    const t =
      ((lookingAt + 1) / 2) * 0.4 +
      Math.max(2 / 45, Math.min(8 / distance, 1)) * 0.6;

    const hue = (1 - t) * (120 / 360);

    return `hsl(${hue * 360}, 100%, 50%)`;
  }

  function getDashByDistance(distance: number) {
    const d = 12 - Math.max(8, Math.min(180, distance)) / 15;
    const normalized = Math.max(2, Math.min(11.6, d));
    return [normalized, 11.6 - normalized];
  }

  fm.onEnable('tracers', () => {
    toggleTracers = true;
  });

  fm.onDisable('tracers', () => {
    toggleTracers = false;
  });
</script>

<canvas bind:this={canvas} class="tracers" class:toggled={toggleTracers}
></canvas>

<style>
  .tracers {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    user-select: none;
    pointer-events: none;
  }

  .tracers.toggled {
    opacity: 1;
  }
  .tracers:not(.toggled) {
    opacity: 0;
  }
</style>
