import { Vector3 } from 'src/utils/math';
import { Feature, FeatureBase, type FeatureContext } from '../registry';

/**
 * AntiVoidHook — 反虚空钩锁 v2。
 *
 * 虚空钩锁原理：攻方给你设 flags bit 0 → 拿到你 body 的远程写入权
 * → 每 tick 强制把你的坐标写成 (0,0,0)。
 *
 * v2 防御策略：
 * 1. 自己的 flags hook 成 1（你也有写入权）
 * 2. 被钩后每 tick 写回安全坐标
 * 3. 额外 setTimeout 在 tick 间隙再补一发写回
 */
@Feature({
  id: 'anti-void-hook',
  displayName: 'AntiVoidHook',
  folderId: 'combat',
})
export class AntiVoidHookFeature extends FeatureBase<AntiVoidHookFeature> {
  private safePos: Vector3 | null = null;
  private prevHp = -1;
  private hooked = false;
  private u1?: () => void;

  /** 给自己设 flags=1 拿写入权 */
  private ensurePermission(self: any): void {
    if (this.hooked) return;
    this.hooked = true;
    // 先 hook flags=1 拿写入权
    this.u1 = self.hookFlags(1);
  }

  /** 执行一次写回 */
  private pullBack(self: any): void {
    if (!this.safePos) return;
    self.position.set(this.safePos.x, this.safePos.y, this.safePos.z);
    self.velocity.set(0, 0, 0);
  }

  onTick(ctx: FeatureContext<AntiVoidHookFeature>): void {
    const self = ctx.core.bodies.getSelfBody();
    if (!self) return;

    this.ensurePermission(self);

    const pos = self.position.toVector3();
    const vy = self.velocity.y;

    // 死亡复活 → 刷新安全坐标
    const dmg = ctx.core.damage.getSelfDamage();
    const hp = dmg?.hp ?? 0;
    if (this.prevHp >= 0 && hp > this.prevHp + 5) {
      this.safePos = pos.clone();
    }
    this.prevHp = hp;

    // 被钩 → 写回安全位置
    if (vy < -3 && this.safePos && pos.y < this.safePos.y - 2) {
      this.pullBack(self);

      // tick 间隙再补一发，对抗同 tick 多次写入
      setTimeout(() => this.pullBack(self), 0);
      return;
    }

    // 正常
    if (vy >= -0.2) {
      this.safePos = pos.clone();
    }
  }

  onDisable(): void {
    this.u1?.();
    this.hooked = false;
  }
}
