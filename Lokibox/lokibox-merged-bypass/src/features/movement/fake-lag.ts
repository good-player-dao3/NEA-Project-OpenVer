import { Feature, type FeatureContext, FeatureBase } from '../registry';
import { props } from '../schema';
import { FeatureManager } from '../manager';
import { ToastManager } from 'src/utils/toast';

@Feature({
  id: 'fake-lag',
  displayName: 'FakeLag',
  folderId: 'movement',
})
export class FakeLagFeature extends FeatureBase<FakeLagFeature> {
  schema = {
    lagTicks: props.number('Delay (ticks)', {
      default: 5,
      min: 1,
      max: 40,
      step: 1,
    }),
  };

  onEnable(ctx: FeatureContext<FakeLagFeature>): void {
    if (!ctx.core.netInput.setActive(true, 'fake-lag')) {
      ToastManager.getInstance().show(
        `FakeLag cannot start while ${ctx.core.netInput.activeOwner} is active`,
        'error'
      );
      setTimeout(() => FeatureManager.getInstance().disable('fake-lag'));
    }
  }

  onTick(ctx: FeatureContext<FakeLagFeature>): void {
    const target = ctx.props.lagTicks;
    while (ctx.core.netInput.queued > target) {
      ctx.core.netInput.drainOne();
    }
  }

  onDisable(ctx: FeatureContext<FakeLagFeature>): void {
    ctx.core.netInput.setActive(false, 'fake-lag');
  }
}
