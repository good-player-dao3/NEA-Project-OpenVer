import { Vector3 } from 'src/utils/math';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'anti-knock-back',
  displayName: 'AntiKnockBack',
  folderId: 'utility',
})
export class AntiKnockBackFeature extends FeatureBase<AntiKnockBackFeature> {
  defaultHotkey = 'k';

  schema = {
    attenuation: props.number('Attenuation', {
      default: 1,
      min: 0,
      max: 2,
      step: 0.01,
    }),
    timeout: props.number('Callback Timeout', {
      default: 100,
      min: 0,
      max: 100,
      step: 1,
    }),
    tpBack: props.boolean('Teleport Back', false),
  };

  lastHp = NaN;
  lastSafePos?: Vector3;
  cd = false;

  onDisable(): void {
    this.cd = false;
    this.lastHp = NaN;
  }

  onTick(ctx: FeatureContext<AntiKnockBackFeature>): void {
    const damage = ctx.core.damage.getSelfDamage();
    const self = ctx.core.bodies.getSelfBody();
    if (damage && Number.isNaN(this.lastHp)) {
      this.lastHp = damage.hp;
    }

    if (damage && damage.hp < this.lastHp) {
      this.cd = true;

      setTimeout(() => {
        self.velocity.copy(
          self.velocity.toVector3().scale(1 - ctx.props.attenuation)
        );

        if (ctx.props.tpBack && this.lastSafePos) {
          self.position.copy(this.lastSafePos);
        }

        this.cd = false;
      }, ctx.props.timeout);

      this.lastHp = damage.hp;
    } else {
      if (!this.cd) {
        if (this.lastSafePos) {
          this.lastSafePos.copy(self.position.toVector3());
        } else {
          this.lastSafePos = self.position.toVector3();
        }
      }
    }
  }
}
