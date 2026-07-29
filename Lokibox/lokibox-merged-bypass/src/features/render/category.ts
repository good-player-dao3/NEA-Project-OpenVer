import { Feature, FeatureBase } from '../registry';

@Feature({
  id: 'category',
  displayName: 'Category',
  folderId: 'render'
})
export class CategoryFeature extends FeatureBase<CategoryFeature> {
  defaultEnabled = true;
  showInCategoryList = false;
}
