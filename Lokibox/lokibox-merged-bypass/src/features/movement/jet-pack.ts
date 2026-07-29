import { Feature, type FeatureContext, FeatureBase } from '../registry';
import { props } from '../schema';
@Feature({
  id: 'jet-pack',
  displayName: 'JetPack',
  folderId: 'movement',
})
export class JetPackFeature extends FeatureBase<JetPackFeature> {
  defaultHotkey = 'f';
  activateOnHold = true;

  schema = {
    speed: props.number('Speed', { default: 1.8, min: 0, max: 10, step: 0.1 }),
  };

  onTick(ctx: FeatureContext<JetPackFeature>): void {
    ctx.core.bodies
      .getSelfBody()
      .velocity.copy(ctx.core.camera.forward.scale(ctx.props.speed));
  }
}
