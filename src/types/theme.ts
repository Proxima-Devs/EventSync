export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
};
