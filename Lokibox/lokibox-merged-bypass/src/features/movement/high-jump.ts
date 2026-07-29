import { Feature, type FeatureContext, FeatureBase } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'high-jump',
  displayName: 'HighJump',
  folderId: 'movement',
})
export class HighJumpFeature extends FeatureBase<HighJumpFeature> {
  schema = {
    jumpPower: props.number('Jump Power', {
      default: 1.5,
      min: 0.2,
      max: 10,
      step: 0.1,
    }),
  };
  cancel?: () => void;

  reassign(ctx: FeatureContext<HighJumpFeature>) {
    const player = ctx.core.players.getSelfPlayer();
    this.cancel = player.hookJumpPower(ctx.props.jumpPower);
  }

  onEnable(ctx: FeatureContext<HighJumpFeature>): void {
    this.reassign(ctx);
  }

  onPropsChange(ctx: FeatureContext<HighJumpFeature>): void {
    this.reassign(ctx);
  }

  onDisable(): void {
    this.cancel?.();
  }
}
