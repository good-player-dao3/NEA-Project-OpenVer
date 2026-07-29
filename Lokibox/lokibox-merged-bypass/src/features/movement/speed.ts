import { Feature, type FeatureContext, FeatureBase } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'speed',
  displayName: 'Speed',
  folderId: 'movement',
})
export class SpeedFeature extends FeatureBase<SpeedFeature> {
  schema = {
    walkSpeed: props.number('Walk Speed', {
      default: 0.3,
      min: 0,
      max: 5,
      step: 0.01,
    }),
    walkAcceleration: props.number('Walk Acceleration', {
      default: 0.3,
      min: 0,
      max: 5,
      step: 0.01,
    }),
    runSpeed: props.number('Run Speed', {
      default: 0.45,
      min: 0,
      max: 5,
      step: 0.01,
    }),
    runAcceleration: props.number('Run Acceleration', {
      default: 0.45,
      min: 0,
      max: 5,
      step: 0.01,
    }),
  };
  cancel?: () => void;

  reassign(ctx: FeatureContext<SpeedFeature>) {
    const { walkSpeed, walkAcceleration, runSpeed, runAcceleration } =
      ctx.props;
    const player = ctx.core.players.getSelfPlayer();
    const c1 = player.hookWalkSpeed(walkSpeed);
    const c2 = player.hookWalkAcceleration(walkAcceleration);
    const c3 = player.hookRunSpeed(runSpeed);
    const c4 = player.hookRunAcceleration(runAcceleration);
    this.cancel = () => {
      c1();
      c2();
      c3();
      c4();
    };
  }

  onEnable(ctx: FeatureContext<SpeedFeature>): void {
    this.reassign(ctx);
  }

  onPropsChange(ctx: FeatureContext<SpeedFeature>): void {
    this.reassign(ctx);
  }

  onDisable(): void {
    this.cancel?.();
  }
}
