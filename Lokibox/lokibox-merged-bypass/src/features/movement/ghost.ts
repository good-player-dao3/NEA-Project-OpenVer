import { Feature, type FeatureContext, FeatureBase } from '../registry';

@Feature({
  id: 'ghost',
  displayName: 'Ghost',
  folderId: 'movement',
})
export class GhostFeature extends FeatureBase<GhostFeature> {
  cancel?: () => void;

  onEnable(ctx: FeatureContext<GhostFeature>): void {
    if (!ctx.core.bodies) return;
    const self = ctx.core.bodies.getSelfBody();
    this.cancel = self.hookFlags(9);
  }

  onDisable(): void {
    this.cancel?.();
  }
}
