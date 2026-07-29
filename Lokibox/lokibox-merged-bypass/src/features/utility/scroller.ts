import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'scroller',
  displayName: 'Scroller',
  folderId: 'utility',
})
export class ScrollerFeature extends FeatureBase<ScrollerFeature> {
  schema = {
    invert: props.boolean('Invert Scroll', false),
  };

  private currentSlot = 0;
  private accum = 0;
  private wheelHandler: ((e: WheelEvent) => void) | null = null;

  onEnable(ctx: FeatureContext<ScrollerFeature>): void {
    this.accum = 0;

    // 强制同步：玩家按 1~9 时跟随服务端下发的选中格
    ctx.core.remote.onClientEvent((type, args) => {
      if (type.toLowerCase() === 'setchoosecase') {
        const pos = Object.values(args ?? {})[0];
        if (typeof pos === 'number') this.currentSlot = pos;
      }
    });

    this.wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      this.accum += e.deltaY;
      const dir = ctx.props.invert ? -1 : 1;

      while (this.accum >= 50) {
        this.accum -= 50;
        this.currentSlot = (this.currentSlot + dir + 9) % 9;
        ctx.core.remote.sendServerEvent('pressQIbyScreen', { index: this.currentSlot });
      }
      while (this.accum <= -50) {
        this.accum += 50;
        this.currentSlot = (this.currentSlot - dir + 9) % 9;
        ctx.core.remote.sendServerEvent('pressQIbyScreen', { index: this.currentSlot });
      }
    };
    window.addEventListener('wheel', this.wheelHandler, { passive: false, capture: true });
  }

  onDisable(): void {
    if (this.wheelHandler) {
      window.removeEventListener('wheel', this.wheelHandler, { capture: true });
      this.wheelHandler = null;
    }
    this.accum = 0;
  }
}
