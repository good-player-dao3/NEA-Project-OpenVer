import { Feature, FeatureBase } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'minimap',
  displayName: 'Minimap',
  folderId: 'render',
})
export class MinimapFeature extends FeatureBase<MinimapFeature> {
  schema = {
    size: props.number('Map Size', {
      default: 130,
      min: 80,
      max: 200,
      step: 5,
    }),
    scale: props.number('World Range', {
      default: 50,
      min: 20,
      max: 120,
      step: 5,
    }),
    opacity: props.number('Opacity', {
      default: 0.65,
      min: 0.3,
      max: 1,
      step: 0.05,
    }),
    colorByHp: props.boolean('HP Color', true),
    showName: props.boolean('Show Names', false),
    excludeSpectator: props.boolean('Exclude Spectator', true),
  };
}
