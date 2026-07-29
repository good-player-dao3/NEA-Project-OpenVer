import { Feature, FeatureBase } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'tracers',
  displayName: 'Tracers',
  folderId: 'render',
})
export class TracersFeature extends FeatureBase<TracersFeature> {
  schema = {
    strokeWidth: props.number('Stroke Width', {
      default: 1.5,
      min: 0.5,
      max: 3,
      step: 0.01,
    }),
  };
}
