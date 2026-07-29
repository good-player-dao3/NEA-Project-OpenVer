import { GameKey } from 'src/core/input';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'anti-afk',
  displayName: 'AntiAFK',
  folderId: 'utility',
})
export class AntiAFKFeature extends FeatureBase<AntiAFKFeature> {
  schema = {
    interval: props.number('Interval (s)', {
      default: 30,
      min: 10,
      max: 120,
      step: 5,
    }),
  };

  private active = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private toggle = false;

  onEnable(ctx: FeatureContext<AntiAFKFeature>): void {
    this.active = true;
    const loop = () => {
      this.timer = setTimeout(() => {
        if (!this.active) return;

        // 交替 A/D 轻触，不累计偏移
        this.toggle = !this.toggle;
        const key = this.toggle ? GameKey.KEY_A : GameKey.KEY_D;
        ctx.core.input.setKeyState(key, true);
        setTimeout(() => {
          ctx.core.input.setKeyState(key, false);
        }, 40);

        loop();
      }, ctx.props.interval * 1000);
    };
    loop();
  }

  onDisable(): void {
    this.active = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
