import { Vector3 } from 'src/utils/math';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { Selector } from 'src/utils/selector';

/**
 * KillAura+ — 通过将射线起点设在目标位置来模拟远程命中。
 *
 * 与 KillAura 不同，KillAura+ 不移位目标实体，
 * 而是直接向服务端发送一条命中目标实体的射线请求。
 */
@Feature({
  id: 'kill-aura-plus',
  displayName: 'KillAura+',
  folderId: 'combat',
})
export class KillAuraPlus extends FeatureBase<KillAuraPlus> {
  defaultHotkey = '\\';
  schema = {
    cps: props.range('CPS', {
      defaultMin: 5,
      defaultMax: 10,
      min: 1,
      max: 30,
      step: 0.5,
    }),
    excludeSpectator: props.boolean('Exclude Spectator', true),
  };

  private selector = new Selector();

  /** 当前目标 ID */
  targetId: number | null = null;
  holding = false;
  lastHitTime = 0;

  onLMouseDown(): void {
    this.holding = true;
  }

  onLMouseUp(): void {
    this.holding = false;
  }

  onTick(ctx: FeatureContext<KillAuraPlus>): void {
    if (!this.holding) {
      this.targetId = null;
      return;
    }

    // CPS 限速
    const cps =
      ctx.props.cps.min +
      Math.random() * (ctx.props.cps.max - ctx.props.cps.min);
    const minInterval = 1000 / cps;
    const now = Date.now();
    if (now - this.lastHitTime < minInterval) return;
    this.lastHitTime = now;

    const self = ctx.core.bodies.getSelfBody();

    const target = this.selector.getNearest({
      range: Infinity,
      excludeSpectator: ctx.props.excludeSpectator,
    });
    this.targetId = target?.id ?? null;

    if (!target) return;

    const pos = target.position.toVector3();

    ctx.core.raycast.createRaycast({
      origin: self.position.toVector3(),
      position: pos,
      direction: new Vector3(0, -1, 0),
      hitEntityId: target.id,
      distance: 0,
      buttonState: 1,
    });
  }
}
