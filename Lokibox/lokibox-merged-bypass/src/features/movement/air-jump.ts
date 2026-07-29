import { Feature, type FeatureContext, FeatureBase } from '../registry';

@Feature({
  id: 'air-jump',
  displayName: 'AirJump',
  folderId: 'movement',
})
export class AirJumpFeature extends FeatureBase<AirJumpFeature> {
  defaultHotkey = 'j';

  cancel?: () => void;

  reassign(ctx: FeatureContext<AirJumpFeature>) {
    const player = ctx.core.players.getSelfPlayer();
    this.cancel = player.hookPhysGround(true);
  }

  onEnable(ctx: FeatureContext<AirJumpFeature>): void {
    this.reassign(ctx);
  }

  onPropsChange(ctx: FeatureContext<AirJumpFeature>): void {
    this.reassign(ctx);
  }

  onDisable(): void {
    this.cancel?.();
  }
}
