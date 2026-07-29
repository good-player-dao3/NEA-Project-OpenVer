// Stub browser globals for vitest
// Modules referencing navigator, screen, window, etc. will find these

if (typeof window === 'undefined') {
  (globalThis as any).window = {
    location: { pathname: '/p/test-game', href: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

if (typeof document === 'undefined') {
  (globalThis as any).document = {
    documentElement: { classList: { contains: () => false } },
    createElement: () => ({}),
    body: { appendChild: () => {}, removeChild: () => {} },
  };
}

Object.defineProperty(globalThis, 'navigator', {
  value: {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Win32',
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'screen', {
  value: {
    width: 1920,
    height: 1080,
  },
  writable: true,
  configurable: true,
});
