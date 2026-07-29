import { GM_getValue, GM_setValue } from '$';

const STORAGE_KEY = 'theme';

export interface ThemeColors {
  accent: string;
  bgDefault: string;
  bgHover: string;
  bgActive: string;
  bgActiveHover: string;
  textDefault: string;
  textOnActive: string;
  track: string;
}

export const THEME_COLOR_KEYS: (keyof ThemeColors)[] = [
  'accent',
  'bgDefault',
  'bgHover',
  'bgActive',
  'bgActiveHover',
  'textDefault',
  'textOnActive',
  'track',
];

export const THEME_COLOR_LABELS: Record<keyof ThemeColors, string> = {
  accent: 'Accent',
  bgDefault: 'Background',
  bgHover: 'Background Hover',
  bgActive: 'Active BG',
  bgActiveHover: 'Active Hover',
  textDefault: 'Text',
  textOnActive: 'Text on Active',
  track: 'Track',
};

export const DEFAULT_THEME: ThemeColors = {
  accent: '#ffffff',
  bgDefault: '#222222',
  bgHover: '#252525',
  bgActive: '#ffffff',
  bgActiveHover: '#fcfcfc',
  textDefault: '#ffffff',
  textOnActive: '#000000',
  track: '#3a3a3a',
};

const CYAN_THEME: ThemeColors = {
  accent: '#06b6d4',
  bgDefault: '#222222',
  bgHover: '#252525',
  bgActive: '#06b6d4',
  bgActiveHover: '#08c0df',
  textDefault: '#ffffff',
  textOnActive: '#000000',
  track: '#3a3a3a',
};

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  accent: '--accent',
  bgDefault: '--bg-default',
  bgHover: '--bg-hover',
  bgActive: '--bg-active',
  bgActiveHover: '--bg-active-hover',
  textDefault: '--text-default',
  textOnActive: '--text-on-active',
  track: '--track',
};

/** 兼容旧版 mono/cyan 字符串格式 */
function parse(raw: unknown): ThemeColors {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    if (typeof o.accent === 'string') {
      return o as unknown as ThemeColors;
    }
  }
  if (raw === 'cyan') return { ...CYAN_THEME };
  return { ...DEFAULT_THEME };
}

export function parseThemeColors(raw: unknown): ThemeColors {
  return parse(raw);
}

export function getTheme(): ThemeColors {
  return parse(GM_getValue(STORAGE_KEY));
}

export function setTheme(colors: ThemeColors) {
  const el = document.documentElement;
  for (const [key, varName] of Object.entries(CSS_VAR_MAP)) {
    el.style.setProperty(varName, colors[key as keyof ThemeColors]);
  }
  GM_setValue(STORAGE_KEY, colors);
}

export function restoreTheme() {
  setTheme(getTheme());
}
