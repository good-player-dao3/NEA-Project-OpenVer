import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { worldToScreen } from 'src/utils/view-projection';
import { Selector } from 'src/utils/selector';

@Feature({
  id: 'aim-assist',
  displayName: 'AimAssist',
  folderId: 'combat',
})
export class AimAssistFeature extends FeatureBase<AimAssistFeature> {
  defaultHotkey = '-';
  schema = {
    activeOnHold: props.boolean('Active On Hold', true),
    strength: props.number('Assist Strength', {
      default: 0.1,
      min: 0,
      max: 0.5,
      step: 0.01,
    }),
    range: props.number('Range', {
      default: 10,
      min: 5,
      max: 20,
      step: 0.5,
    }),
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

  onTick(ctx: FeatureContext<AimAssistFeature>): void {
    if (ctx.props.activeOnHold && !this.holding) {
      this.targetId = null;
      return;
    }

    const target = this.selector.getNearest({
      range: ctx.props.range,
      excludeSpectator: ctx.props.excludeSpectator,
    });
    this.targetId = target?.id ?? null;

    if (!target) return;

    const { viewProjection, viewport } = ctx.core.camera;

    const screenPos = worldToScreen(
      target.position.toVector3(),
      viewProjection,
      viewport
    );

    if (screenPos.w <= 0) return;

    const [w, h] = viewport;

    const centerX = w / 2;
    const centerY = h / 2;

    const dx = screenPos.x - centerX;
    const dy = screenPos.y - centerY;

    const s = ctx.props.strength;

    requestAnimationFrame(() => {
      ctx.core.input.applyAxisMovement(dx * s, dy * s);
    });
  }
}
