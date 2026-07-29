import { mount } from 'svelte';
import App from 'src/ui/App.svelte';
import { initApp } from './init';
import { FeatureManager } from 'src/features/manager';

initApp();

if (import.meta.env.VITE_LOKIBOX_SKIP_AUTH === 'true') {
  FeatureManager.getInstance().enable('click-ui');
  FeatureManager.getInstance().enable('category');
}

const app = mount(App, {
  target: (() => {
    const el = document.createElement('div');
    document.body.append(el);
    return el;
  })(),
});

export default app;
