import { Vector3 } from 'src/utils/math';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { Logger } from 'src/utils/logger';
import { GameKey } from 'src/core/input';

const logger = new Logger('feature/bed-breaker');

@Feature({
  id: 'bed-breaker',
  displayName: 'BedBreaker',
  folderId: 'misc',
})
export class BedBreakerFeature extends FeatureBase<BedBreakerFeature> {
  schema = {
    range: props.number('Range', {
      default: 5,
      min: 3,
      max: 10,
      step: 1,
    }),
  };

  found = false;

  onTick(ctx: FeatureContext<BedBreakerFeature>): void {
    if (this.found || !ctx.core.voxels) return;

    const range = ctx.props.range;
    const self = ctx.core.bodies.getSelfBody();
    const { x: dx, y: dy, z: dz } = self.position;
    const cx = Math.floor(dx);
    const cy = Math.floor(dy);
    const cz = Math.floor(dz);
    let bedPosition;
    out: for (let x = cx - range; x <= cx + range; x++) {
      for (let y = cy - range; y <= cy + range; y++) {
        for (let z = cz - range; z <= cz + range; z++) {
          const id = ctx.core.voxels.get(x, y, z);
          if (id === 650) {
            bedPosition = new Vector3(x, y, z);
            break out;
          }
        }
      }
    }
    if (bedPosition) {
      this.found = true;
      setTimeout(() => {
        this.found = false;
      }, 3000);
      logger.i(
        `found bed at: (${bedPosition.x}, ${bedPosition.y}, ${bedPosition.z})`
      );
      ctx.core.raycast.createRaycast({
        origin: bedPosition.add(new Vector3(0.5, 0.5, 0.5)),
        distance: 0,
        hitVoxel: bedPosition,
        position: bedPosition,
        direction: new Vector3(0, -1, 0),
        hitNormal: new Vector3(0, 1, 0),
        buttonState: 1,
      });
      ctx.core.input.setKeyState(GameKey.ACTION0, true);
      setTimeout(() => {
        ctx.core.input.setKeyState(GameKey.ACTION0, false);
      }, 1000);
    }
  }
}
