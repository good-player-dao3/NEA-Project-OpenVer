function waitForBody(): Promise<void> {
  if (document.body) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
}

async function boot() {
  if (location.href.startsWith('https://dao3.fun/play/')) {
    await import('./bridge/top');
    const disableTimeMock =
      import.meta.env.VITE_LOKIBOX_DISABLE_TIME_MOCK === 'true' ||
      (globalThis as { __lokiboxDisableTimeMock?: boolean }).__lokiboxDisableTimeMock;
    if (!disableTimeMock) {
      await import('./time-mock');
    }
    return;
  }

  if (!location.href.startsWith('https://view.dao3.fun/')) {
    return;
  }

  const { Core } = await import('src/core/core');
  const core = Core.getInstance();
  await waitForBody();

  const { initApp } = await import('./init');
  initApp();

  const { mount, unmount } = await import('svelte');
  const { default: LoadingScreen } = await import('src/ui/LoadingScreen.svelte');

  let ready!: () => void;
  const readyPromise = new Promise<void>(resolve => {
    ready = resolve;
  });

  const loadingTarget = document.createElement('div');
  document.body.append(loadingTarget);
  const loadingApp = mount(LoadingScreen, {
    target: loadingTarget,
    props: { ready: readyPromise },
  });

  const coreReady = core.ready
    ? Promise.resolve()
    : new Promise<void>(resolve => core.onReady(() => resolve()));

  const skipAuth = import.meta.env.VITE_LOKIBOX_SKIP_AUTH === 'true';
  const authCheck = skipAuth
    ? Promise.resolve(true)
    : (async () => {
        const { LokiAPI } = await import('src/api/api');
        const api = LokiAPI.getInstance();
        try {
          await api.getSession();
          const resp = await api.userAuth();
          return resp.code === 'OK';
        } catch {
          return false;
        }
      })();

  const [isAuthed] = await Promise.all([authCheck, coreReady]);

  ready();
  await new Promise(resolve => setTimeout(resolve, 500));
  unmount(loadingApp);
  loadingTarget.remove();

  if (isAuthed) {
    await import('./main');
  } else {
    await import('./auth/main');
  }
}

void boot();

export {};