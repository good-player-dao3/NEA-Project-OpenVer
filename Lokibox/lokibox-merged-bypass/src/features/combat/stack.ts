import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';

enum StackKey {
  LEFT = 1,
  RIGHT = 2,
}

@Feature({
  id: 'stack',
  displayName: 'Stack',
  folderId: 'combat',
})
export class StackFeature extends FeatureBase<StackFeature> {
  cooldown = false;

  schema = {
    stack: props.number('Stack', {
      default: 10,
      min: 0,
      max: 100,
      step: 1,
    }),
    cooldown: props.number('Cooldown', {
      default: 1000,
      min: 0,
      max: 2000,
      step: 10,
    }),
    key: props.select('Key', {
      default: StackKey.RIGHT,
      options: [
        {
          id: StackKey.RIGHT,
          name: 'Right',
        },
        {
          id: StackKey.LEFT,
          name: 'Left',
        },
      ],
    }),
  };

  onRMouseDown(ctx: FeatureContext<StackFeature>) {
    if (this.cooldown) return;
    ctx.core.raycast.createRaycasts(
      Array(ctx.props.stack).fill({
        buttonState: ctx.props.key,
      })
    );
    this.cooldown = true;
    setTimeout(() => (this.cooldown = false), ctx.props.cooldown);
  }
}
