import { Feature, FeatureBase } from '../registry';

@Feature({
  id: 'target-hud',
  displayName: 'TargetHUD',
  folderId: 'render',
})
export class TargetHudFeature extends FeatureBase<TargetHudFeature> {
  defaultEnabled = true;
}
