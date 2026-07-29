import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { Logger } from 'src/utils/logger';
import { GameKey } from 'src/core/input';

const logger = new Logger('feature/auto-fish');

@Feature({
  id: 'auto-fish',
  displayName: 'AutoFish',
  folderId: 'misc',
})
export class AutoFishFeature extends FeatureBase<AutoFishFeature> {
  schema = {
    cooldown: props.number('Cooldown (s)', {
      default: 1.5,
      min: 0.5,
      max: 5,
      step: 0.1,
    }),
  };

  private cooldownUntil = 0;

  onTick(ctx: FeatureContext<AutoFishFeature>) {
    if (Date.now() < this.cooldownUntil) return;

    const text = ctx.core.chat.poll();
    if (!text) return;

    const matched = text === '鱼咬钩了！';
    if (!matched) return;

    logger.i(`detected: "${text}"`);

    // 右键收杆
    ctx.core.input.setKeyState(GameKey.ACTION1, true);
    setTimeout(() => {
      ctx.core.input.setKeyState(GameKey.ACTION1, false);
    }, 150);

    // 再右键抛竿
    setTimeout(() => {
      ctx.core.input.setKeyState(GameKey.ACTION1, true);
      setTimeout(() => {
        ctx.core.input.setKeyState(GameKey.ACTION1, false);
      }, 150);
    }, 400);

    this.cooldownUntil = Date.now() + ctx.props.cooldown * 1000;
  }
}
