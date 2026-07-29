import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { Vector3 } from 'src/utils/math';
import { Selector } from 'src/utils/selector';

@Feature({
  id: 'kill-aura',
  displayName: 'KillAura',
  folderId: 'combat',
})
export class KillAuraFeature extends FeatureBase<KillAuraFeature> {
  defaultHotkey = '\\';
  schema = {
    range: props.number('Range', {
      default: 10,
      min: 5,
      max: 500,
      step: 1,
    }),
    infinite: props.boolean('Infinite', false),
    excludeSpectator: props.boolean('Exclude Spectator', true),
  };

  private selector = new Selector();

  holding = false;

  /** 当前目标 ID */
  targetId: number | null = null;

  onLMouseDown(): void {
    this.holding = true;
  }

  onLMouseUp(): void {
    this.holding = false;
  }

  onTick(ctx: FeatureContext<KillAuraFeature>): void {
    if (!this.holding) {
      this.targetId = null;
      return;
    }

    const target = this.selector.getNearest({
      range: ctx.props.infinite ? ctx.props.range : Infinity,
      excludeSpectator: ctx.props.excludeSpectator,
    });
    this.targetId = target?.id ?? null;

    if (target) {
      const selfPos = ctx.core.bodies.getSelfBody().position.toVector3();

      target.position.copy(selfPos.add(new Vector3(0, 0.5, 0)));

      target.velocity.set(0, 0, 0);
    }
  }
}
