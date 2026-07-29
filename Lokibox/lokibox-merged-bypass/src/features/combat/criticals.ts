import { Feature, type FeatureContext, FeatureBase } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'criticals',
  displayName: 'Criticals',
  folderId: 'combat',
})
export class CriticalsFeature extends FeatureBase<CriticalsFeature> {
  schema = {
    fallVelocity: props.number('Fall Velocity', {
      default: -0.1,
      min: -1,
      max: -0.01,
      step: 0.01,
    }),
  };

  holding = false;

  onLMouseDown(): void {
    this.holding = true;
  }

  onLMouseUp(): void {
    this.holding = false;
  }

  onTick(ctx: FeatureContext<CriticalsFeature>): void {
    if (!this.holding) return;

    const body = ctx.core.bodies.getSelfBody();
    if (!body) return;

    body.velocity.y = ctx.props.fallVelocity;
  }
}
