import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { Vector3 } from 'src/utils/math';

@Feature({
  id: 'scaffold',
  displayName: 'Scaffold',
  folderId: 'movement',
})
export class ScaffoldFeature extends FeatureBase<ScaffoldFeature> {
  defaultHotkey = 'z';

  schema = {
    height: props.number('Player Height', {
      default: 1.6,
      min: 0,
      max: 5,
      step: 0.1,
    }),
  };

  holding = false;

  onRMouseDown(): void {
    this.holding = true;
  }
  onRMouseUp(): void {
    this.holding = false;
  }

  onTick(ctx: FeatureContext<ScaffoldFeature>) {
    const self = ctx.core.bodies.getSelfBody();
    if (this.holding) {
      const center = self.position
        .toVector3()
        .sub(new Vector3(0, ctx.props.height, 0));

      const forward = ctx.core.camera.forward.clone();

      forward.y = 0;

      ctx.core.raycast.createRaycasts([
        {
          origin: center.add(forward.scale(2)),
          direction: forward.scale(-1),
          buttonState: 2,
        },
        { buttonState: 0 },
      ]);
    }
  }
}
