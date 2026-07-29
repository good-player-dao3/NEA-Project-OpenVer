import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'anti-fall',
  displayName: 'AntiFall',
  folderId: 'utility',
})
export class AntiFallFeature extends FeatureBase<AntiFallFeature> {
  defaultHotkey = 'l';
  lastSafeY?: number;

  schema = {
    fallThreshold: props.number('Fall Threshold', {
      default: 3.8,
      min: 1,
      max: 10,
      step: 0.1,
    }),
    recallSpeed: props.number('Recall Speed', {
      default: 0.1,
      min: 0,
      max: 1,
      step: 0.01,
    }),
  };

  onTick(ctx: FeatureContext<AntiFallFeature>): void {
    // 初始化安全位置
    const self = ctx.core.bodies.getSelfBody();
    //死亡检测

    // 1. 记录安全位置 (脚下有方块且不在虚空)
    // 判定条件：垂直速度接近 0 (说明在地面或稳定飞行)
    if (Math.abs(self.velocity.y) < 0.1) {
      this.lastSafeY = self.position.y;
    }

    // 2. 检测掉落
    // 如果当前 Y 比上一个安全位置低了 FALL_THRESHOLD 格
    if (
      this.lastSafeY &&
      this.lastSafeY - self.position.y > ctx.props.fallThreshold
    ) {
      // 且垂直速度向下 (说明正在掉落)
      if (self.velocity.y < 0) {
        self.velocity.y = ctx.props.recallSpeed;
      }
    }
  }
}
