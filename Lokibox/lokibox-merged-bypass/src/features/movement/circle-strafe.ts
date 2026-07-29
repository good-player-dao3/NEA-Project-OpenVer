import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { Selector } from 'src/utils/selector';

@Feature({
  id: 'circle-strafe',
  displayName: 'CircleStrafe',
  folderId: 'movement',
})
export class CircleStrafeFeature extends FeatureBase<CircleStrafeFeature> {
  schema = {
    range: props.number('Range', {
      default: 5,
      min: 1,
      max: 20,
      step: 1,
    }),
    distance: props.number('Distance', {
      default: 4,
      min: 2,
      max: 10,
      step: 0.5,
    }),
    speed: props.number('Speed', {
      default: 1,
      min: 0,
      max: 2,
      step: 0.01,
    }),
    switchInterval: props.number('Switch (s)', {
      default: 1.5,
      min: 0.5,
      max: 5,
      step: 0.1,
    }),
  };

  private selector = new Selector();
  private dir = 1;
  private lastSwitch = 0;

  onTick(ctx: FeatureContext<CircleStrafeFeature>): void {
    const now = Date.now();
    if (now - this.lastSwitch > ctx.props.switchInterval * 1000) {
      this.dir *= -1;
      this.lastSwitch = now;
    }

    const self = ctx.core.bodies.getSelfBody();
    const target = this.selector.getNearest({
      range: ctx.props.range,
      excludeSpectator: true,
    });

    if (!target) return;

    const dx = target.position.x - self.position.x;
    const dz = target.position.z - self.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist === 0) return;

    const nx = dx / dist;
    const nz = dz / dist;

    // 切线方向 * 速度
    const tx = -nz * this.dir * ctx.props.speed;
    const tz = nx * this.dir * ctx.props.speed;

    // 距离校正：太远拉近、太近推远
    const dErr = dist - ctx.props.distance;
    const pull = Math.tanh(dErr * 0.5) * ctx.props.speed * 0.6;

    self.velocity.x = tx + nx * pull;
    self.velocity.z = tz + nz * pull;
  }
}
