import { Vector3 } from 'src/utils/math';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { Logger } from 'src/utils/logger';
import { props } from '../schema';

const logger = new Logger('features/click-tp');

@Feature({
  id: 'click-tp',
  displayName: 'ClickTP',
  folderId: 'movement',
})
export class ClickTPFeature extends FeatureBase<ClickTPFeature> {
  schema = {
    offsetY: props.number('Y Offset', {
      default: 1.6,
      min: 1,
      max: 5,
      step: 0.1,
    }),
  };
  shiftHeld = false;
  onEnable(): void {
    addEventListener('keydown', e => {
      if (e.code === 'ShiftLeft') {
        this.shiftHeld = true;
      }
    });
    addEventListener('keyup', e => {
      if (e.code === 'ShiftLeft') {
        this.shiftHeld = false;
      }
    });
  }

  onRMouseUp(ctx: FeatureContext<ClickTPFeature>): void {
    const self = ctx.core.bodies.getSelfBody();
    const eye = ctx.core.camera.eye;
    const forward = ctx.core.camera.forward;
    if (this.shiftHeld) {
      const hitPosition = ctx.core.raycast.simulate(eye, forward);

      if (!hitPosition) return;

      logger.i(
        `tp: (${hitPosition.x}, ${hitPosition.y + ctx.props.offsetY}, ${hitPosition.z})`
      );

      self.position.copy(hitPosition.add(new Vector3(0, ctx.props.offsetY, 0)));
    }
  }
}
