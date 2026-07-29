import { Feature, FeatureBase } from '../registry';
import { props } from '../schema';

@Feature({
  id: 'esp',
  displayName: 'ESP',
  folderId: 'render',
})
export class ESPFeature extends FeatureBase<ESPFeature> {
  schema = {
    excludeSpectator: props.boolean('Exclude Spectator', true),
    showName: props.boolean('Show Names', true),
  };

  defaultHotkey = 'o';
}
