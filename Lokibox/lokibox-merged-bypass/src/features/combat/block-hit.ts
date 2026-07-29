import { GameKey } from 'src/core/input';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'block-hit',
  displayName: 'BlockHit',
  folderId: 'combat',
})
export class BlockHitFeature extends FeatureBase<BlockHitFeature> {
  schema = {
    duration: props.number('Duration', {
      default: 80,
      min: 20,
      max: 200,
      step: 5,
    }),
  };

  private blockTimer: ReturnType<typeof setTimeout> | null = null;

  onLMouseDown(ctx: FeatureContext<BlockHitFeature>): void {
    if (!ctx.core.input) return;

    // 取消上一次的释放，重新开始格挡
    if (this.blockTimer) {
      clearTimeout(this.blockTimer);
    }

    ctx.core.input.setKeyState(GameKey.ACTION1, true);

    this.blockTimer = setTimeout(() => {
      ctx.core.input.setKeyState(GameKey.ACTION1, false);
      this.blockTimer = null;
    }, ctx.props.duration);
  }

  onDisable(ctx: FeatureContext<BlockHitFeature>): void {
    if (this.blockTimer) {
      clearTimeout(this.blockTimer);
      this.blockTimer = null;
    }
    ctx.core.input.setKeyState(GameKey.ACTION1, false);
  }
}
