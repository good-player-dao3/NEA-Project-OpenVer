import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { Selector } from 'src/utils/selector';

/**
 * VoidHook — 将目标钩入虚空。
 *
 * 原理：设置目标 body flags 的第 0 位（值 1），授权本地写入远程属性。
 * 然后将目标直接传回地图原点 (0,0,0)。
 */
@Feature({
  id: 'void-hook',
  displayName: 'VoidHook',
  folderId: 'combat',
})
export class VoidHookFeature extends FeatureBase<VoidHookFeature> {
  schema = {
    range: props.number('Range', {
      default: 15,
      min: 5,
      max: 500,
      step: 1,
    }),
    selfVoid: props.boolean('Void Self', false),
  };

  private selector = new Selector();
  targetId: number | null = null;

  /** 已 hook 的目标 bodyId → unhook 函数 */
  private hooked = new Map<number, () => void>();

  holding = false;

  onLMouseDown(): void {
    this.holding = true;
  }
  onLMouseUp(): void {
    this.holding = false;
  }

  /** 对目标 body 执行一次 flag hook（幂等） */
  private ensureHooked(target: any): void {
    if (this.hooked.has(target.id)) return;
    const unhook = target.hookFlags(target.flags | (2 ** 32 - 1));
    this.hooked.set(target.id, unhook);
  }

  onTick(ctx: FeatureContext<VoidHookFeature>): void {
    if (!this.holding) {
      this.targetId = null;
      return;
    }

    const self = ctx.core.bodies.getSelfBody();
    const target = this.selector.getNearest({
      range: ctx.props.range,
      excludeSpectator: true,
    });

    const victims = [];
    if (target) victims.push(target);
    if (self && ctx.props.selfVoid) victims.push(self);

    if (victims.length === 0) {
      this.targetId = null;
      return;
    }

    this.targetId = target?.id ?? null;

    for (const v of victims) {
      this.ensureHooked(v);
      v.position.set(0, -100, 0);
      v.velocity.set(0, 0, 0);
    }
  }

  onDisable(): void {
    // 清理所有 hook
    for (const unhook of this.hooked.values()) unhook();
    this.hooked.clear();
    this.targetId = null;
  }
}
