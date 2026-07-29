import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'safe-walk',
  displayName: 'SafeWalk',
  folderId: 'movement',
})
export class SafeWalkFeature extends FeatureBase<SafeWalkFeature> {
  schema = {
    threshold: props.number('Reach', {
      default: 0.6,
      min: 0.3,
      max: 1.0,
      step: 0.05,
    }),
    minDrop: props.number('Min Drop', {
      default: 2,
      min: 1,
      max: 5,
      step: 1,
    }),
  };

  onTick(ctx: FeatureContext<SafeWalkFeature>): void {
    if (!ctx.core.voxels) return;

    const self = ctx.core.bodies.getSelfBody();

    // 不干扰跳跃/下落
    if (Math.abs(self.velocity.y) > 0.1) return;

    const hSpeed = Math.sqrt(self.velocity.x ** 2 + self.velocity.z ** 2);
    if (hSpeed < 0.05) return; // 没在水平移动

    // 水平移动方向
    const dx = self.velocity.x / hSpeed;
    const dz = self.velocity.z / hSpeed;

    // 脚底所在 Y 层
    const feetY = Math.floor(self.position.y) - 1;

    // 检测前方 threshold 距离处是否有方块支撑
    const checkX = Math.floor(self.position.x + dx * ctx.props.threshold);
    const checkZ = Math.floor(self.position.z + dz * ctx.props.threshold);

    // 从脚底往下扫 minDrop 格，有任何方块就不触发（下台阶/楼梯不卡死）
    let hasGround = false;
    for (let dy = 0; dy < ctx.props.minDrop; dy++) {
      if (ctx.core.voxels.get(checkX, feetY - dy, checkZ) !== 0) {
        hasGround = true;
        break;
      }
    }

    if (!hasGround) {
      // 前方足够深悬空 — 刹停水平速度
      self.velocity.x = 0;
      self.velocity.z = 0;
    }
  }
}
