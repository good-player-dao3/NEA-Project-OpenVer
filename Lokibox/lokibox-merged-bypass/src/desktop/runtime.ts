const STORAGE_PREFIX = 'lokibox:';

export function GM_getValue<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}

export function GM_setValue<T>(key: string, value: T): void {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
}

export const unsafeWindow = window;
