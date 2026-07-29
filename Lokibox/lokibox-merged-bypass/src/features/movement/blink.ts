import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { FeatureManager } from '../manager';
import { ToastManager } from 'src/utils/toast';

@Feature({
  id: 'blink',
  displayName: 'Blink',
  folderId: 'movement',
})
export class BlinkFeature extends FeatureBase<BlinkFeature> {
  activateOnHold = true;
  defaultHotkey = 'g';

  onEnable(ctx: FeatureContext<BlinkFeature>): void {
    if (!ctx.core.netInput.setActive(true, 'blink')) {
      ToastManager.getInstance().show(
        `Blink cannot start while ${ctx.core.netInput.activeOwner} is active`,
        'error'
      );
      setTimeout(() => FeatureManager.getInstance().disable('blink'));
      return;
    }
    ToastManager.getInstance().show('Blink armed — release G to flush input');
  }

  onDisable(ctx: FeatureContext<BlinkFeature>): void {
    const queued = ctx.core.netInput.queued;
    ctx.core.netInput.setActive(false, 'blink');
    if (queued > 0) {
      ToastManager.getInstance().show(
        `Blink released ${queued} buffered inputs`,
        'success'
      );
    }
  }
}
