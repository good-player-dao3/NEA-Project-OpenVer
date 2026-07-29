declare const unsafeWindow: Window & typeof globalThis;

function getNearestSaturdayEvening(now: number, DateImpl: typeof Date): number {
  const current = new DateImpl(now);
  const target = new DateImpl(now);
  const day = current.getDay();
  target.setDate(current.getDate() + ((6 - day + 7) % 7));
  target.setHours(20, 30, 0, 0);
  const distance = target.getTime() - now;
  if (distance > 3 * 24 * 60 * 60 * 1000) {
    target.setDate(target.getDate() - 7);
  }
  return target.getTime();
}

function installTimeMockInWindow(scope: any, label: string): void {
  if (scope.__lokiboxTimeMockInstalled) return;
  const RealDate = scope.Date;
  const realNow = RealDate.now;
  const fakeBase = getNearestSaturdayEvening(realNow(), RealDate);
  const offset = fakeBase - realNow();

  const MockDate = function (this: any, ...args: any[]): any {
    if (!new.target) {
      if (args.length === 0) {
        return new RealDate(realNow() + offset).toString();
      }
      return RealDate();
    }
    if (args.length === 0) {
      return new RealDate(realNow() + offset);
    }
    return new RealDate(...args);
  };

  MockDate.prototype = RealDate.prototype;
  Object.setPrototypeOf(MockDate, RealDate);
  MockDate.now = () => realNow() + offset;
  MockDate.parse = RealDate.parse;
  MockDate.UTC = RealDate.UTC;

  scope.Date = MockDate;
  scope.__lokiboxTimeMockInstalled = true;
  console.info('[TimeMock] installed', { target: label, offset });
}

function installTimeMockInIframe(iframe: HTMLIFrameElement): void {
  const apply = () => {
    try {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return;
      installTimeMockInWindow(win, 'iframe');
      installTimeMockInDocument(doc);
    } catch (e) {
      console.warn('[TimeMock] failed to install in iframe', e);
    }
  };
  if (!(iframe as any).__lokiboxTimeMockLoadHookInstalled) {
    (iframe as any).__lokiboxTimeMockLoadHookInstalled = true;
    iframe.addEventListener('load', apply, { passive: true });
  }
  apply();
}

function installTimeMockInDocument(doc: Document): void {
  const root = doc.documentElement ?? doc.body;
  if (!root) return;
  doc.querySelectorAll('iframe').forEach(iframe => installTimeMockInIframe(iframe));
  if ((doc as any).__lokiboxTimeMockObserverInstalled) return;
  (doc as any).__lokiboxTimeMockObserverInstalled = true;
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node instanceof HTMLIFrameElement) {
          installTimeMockInIframe(node);
        }
        node.querySelectorAll?.('iframe').forEach(iframe => installTimeMockInIframe(iframe));
      });
    }
  });
  observer.observe(root, { childList: true, subtree: true });
}

export function installTimeMock(): void {
  installTimeMockInWindow(window, 'window');
  if (typeof unsafeWindow !== 'undefined') {
    installTimeMockInWindow(unsafeWindow, 'unsafeWindow');
  }
  installTimeMockInDocument(document);
}

installTimeMock();