import { mount, unmount } from 'svelte';
import { onAuthorized } from './auth';
import AuthClickUI from './ui/AuthClickUI.svelte';

const target = (() => {
  const el = document.createElement('div');
  document.body.append(el);
  return el;
})();

const authApp = mount(AuthClickUI, { target });

onAuthorized(async () => {
  // 销毁 auth UI，直接 mount 主 UI
  unmount(authApp);
  target.remove();
  // Core 和 features 已在 boot 中初始化
  await import('../main');
});

export default authApp;
