import { Vector3 } from 'src/utils/math';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'anti-void',
  displayName: 'AntiVoid',
  folderId: 'utility',
})
export class AntiVoidFeature extends FeatureBase<AntiVoidFeature> {
  defaultHotkey = 'v';
  lastSafePos?: Vector3;

  schema = {
    fallThreshold: props.number('Fall Threshold', {
      default: 10,
      min: 5,
      max: 50,
      step: 1,
    }),
    recoveringOffset: props.number('Recovering Offset', {
      default: 2,
      min: 0,
      max: 5,
      step: 0.1,
    }),
  };

  onTick(ctx: FeatureContext<AntiVoidFeature>): void {
    // 初始化安全位置
    const self = ctx.core.bodies.getSelfBody();
    //死亡检测

    // 1. 记录安全位置 (脚下有方块且不在虚空)
    // 判定条件：垂直速度接近 0 (说明在地面或稳定飞行)
    if (Math.abs(self.velocity.y) < 0.1) {
      if (this.lastSafePos) {
        this.lastSafePos.copy(self.position.toVector3());
      } else {
        this.lastSafePos = self.position.toVector3();
      }
    }

    // 2. 检测掉落
    // 如果当前 Y 比上一个安全位置低了 FALL_THRESHOLD 格
    if (
      this.lastSafePos &&
      this.lastSafePos.y - self.position.y > ctx.props.fallThreshold
    ) {
      // 且垂直速度向下 (说明正在掉落)
      if (self.velocity.y < 0) {
        // 传送回安全点
        self.position.set(
          this.lastSafePos.x,
          this.lastSafePos.y + ctx.props.recoveringOffset,
          this.lastSafePos.z
        );
        self.velocity.set(0, 0, 0);
      }
    }
  }
}
