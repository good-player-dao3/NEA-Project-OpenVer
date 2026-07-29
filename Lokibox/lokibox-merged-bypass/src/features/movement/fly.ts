import { Feature, type FeatureContext, FeatureBase } from '../registry';

@Feature({
  id: 'fly',
  displayName: 'Fly',
  folderId: 'movement',
})
export class FlyFeature extends FeatureBase<FlyFeature> {
  cancel?: () => void;

  onEnable(ctx: FeatureContext<FlyFeature>): void {
    if (!ctx.core.players) return;
    const player = ctx.core.players.getPlayerById(ctx.core.secret.id);
    this.cancel = player?.hookFlags(254);
  }

  onDisable(): void {
    this.cancel?.();
  }
}
