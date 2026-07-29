import { Feature, FeatureBase } from '../registry';

@Feature({
  id: 'click-ui',
  displayName: 'ClickUI',
  folderId: 'render'
})
export class ClickUIFeature extends FeatureBase<ClickUIFeature> {
  defaultHotkey = 'Tab';
  showInCategoryList = false;
}
