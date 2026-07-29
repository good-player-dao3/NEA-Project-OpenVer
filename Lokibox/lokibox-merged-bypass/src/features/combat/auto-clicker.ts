import { GameKey } from 'src/core/input';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'auto-clicker',
  displayName: 'AutoClicker',
  folderId: 'combat',
})
export class AutoClickerFeature extends FeatureBase<AutoClickerFeature> {
  defaultHotkey = '=';
  schema = {
    cps: props.range('CPS', {
      defaultMin: 9,
      defaultMax: 14,
      min: 1,
      max: 30,
      step: 0.5,
    }),
    rightClick: props.boolean('Right Click', false),
    activeOnHold: props.boolean('Active On Hold', true),
  };

  timeoutHandler?: ReturnType<typeof setTimeout>;
  holding = false;

  onEnable(ctx: FeatureContext<AutoClickerFeature>): void {
    if (!ctx.props.activeOnHold) {
      this.startClicker(ctx);
    }
  }

  onDisable(): void {
    this.finishClicker();
  }

  onLMouseDown(ctx: FeatureContext<AutoClickerFeature>): void {
    if (ctx.props.activeOnHold && !this.holding) {
      this.holding = true;
      this.startClicker(ctx);
    }
  }

  onLMouseUp(ctx: FeatureContext<AutoClickerFeature>): void {
    if (ctx.props.activeOnHold) {
      this.holding = false;
      this.finishClicker();
    }
  }

  startClicker(ctx: FeatureContext<AutoClickerFeature>) {
    const loop = () => {
      // 非 hold 模式下检查 enabled，hold 模式下检查 holding
      if (ctx.props.activeOnHold ? !this.holding : !ctx.enabled) return;

      if (!ctx.core.input) {
        this.timeoutHandler = setTimeout(() => {
          loop();
        }, 50);
        return;
      }
      // 计算随机延迟
      // CPS = 1000 / delay
      // delay = 1000 / CPS

      const cps =
        ctx.props.cps.min +
        Math.random() * (ctx.props.cps.max - ctx.props.cps.min);
      const delay = 1000 / cps;

      const key = ctx.props.rightClick ? GameKey.ACTION1 : GameKey.ACTION0;
      ctx.core.input.setKeyState(key, true);

      // 持续时间也随机一点，模拟人类按下的时长 (40-80ms)
      const holdTime = 15 + Math.random() * 15;

      setTimeout(() => {
        ctx.core.input.setKeyState(key, false);
      }, holdTime);

      this.timeoutHandler = setTimeout(() => {
        loop();
      }, delay);
    };

    loop();
  }

  finishClicker() {
    clearTimeout(this.timeoutHandler);
  }
}
