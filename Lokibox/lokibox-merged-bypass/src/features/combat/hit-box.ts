import { Feature, type FeatureContext, FeatureBase } from '../registry';
import { props } from '../schema';
import { type BodyAdapter } from 'src/core/bodies';

@Feature({
  id: 'hit-box',
  displayName: 'HitBox',
  folderId: 'combat',
})
export class HitBoxFeature extends FeatureBase<HitBoxFeature> {
  defaultHotkey = '';
  schema = {
    expand: props.number('Expand', {
      default: 1.8,
      min: 1.0,
      max: 5.0,
      step: 0.1,
    }),
    excludeSpectator: props.boolean('Exclude Spectator', true),
  };

  private hooks = new Map<number, () => void>();

  private hookBody(body: BodyAdapter, expand: number) {
    const rx = body.boundingBox.x * expand;
    const ry = body.boundingBox.y * expand;
    const rz = body.boundingBox.z * expand;
    const unhook = body.hookBoundingBox(rx, ry, rz);
    this.hooks.set(body.id, unhook);
  }

  private applyAll(ctx: FeatureContext<HitBoxFeature>) {
    const self = ctx.core.bodies.getSelfBody();
    if (!self) return;

    const bodies = ctx.core.bodies.bodies;
    const expand = ctx.props.expand;
    const excludeSpec = ctx.props.excludeSpectator;

    for (const body of bodies) {
      if (body.id === self.id) continue;
      if (excludeSpec && !(body.flags & 6)) continue;
      this.hookBody(body, expand);
    }
  }

  onEnable(ctx: FeatureContext<HitBoxFeature>): void {
    this.applyAll(ctx);
  }

  onTick(ctx: FeatureContext<HitBoxFeature>): void {
    const self = ctx.core.bodies.getSelfBody();
    if (!self) return;

    const bodies = ctx.core.bodies.bodies;
    const expand = ctx.props.expand;
    const excludeSpec = ctx.props.excludeSpectator;

    for (const body of bodies) {
      if (body.id === self.id) continue;
      if (this.hooks.has(body.id)) continue;
      if (excludeSpec && !(body.flags & 6)) continue;

      this.hookBody(body, expand);
    }
  }

  onPropsChange(ctx: FeatureContext<HitBoxFeature>): void {
    this.unhookAll();
    this.applyAll(ctx);
  }

  onDisable(): void {
    this.unhookAll();
  }

  private unhookAll() {
    for (const [, unhook] of this.hooks) {
      unhook();
    }
    this.hooks.clear();
  }
}
