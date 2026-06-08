'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, ThemeConfig, ThemeMode } from '@/types/theme';

const STORAGE_KEY = 'eventsync_theme';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (mode: ThemeMode) => void;
  resetTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.mode && ['dark', 'light', 'system'].includes(parsed.mode)) {
          setThemeState(parsed);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const applyThemeToDom = useCallback((newTheme: ThemeConfig) => {
    const root = document.documentElement;
    if (newTheme.mode === 'system') {
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      root.classList.toggle('dark', newTheme.mode === 'dark');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      applyThemeToDom(theme);
    }
  }, [theme, isClient, applyThemeToDom]);

  useEffect(() => {
    if (!isClient) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.mode === 'system') {
        applyThemeToDom(theme);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isClient, applyThemeToDom]);

  const setTheme = useCallback((mode: ThemeMode) => {
    const newTheme = { mode };
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTheme));
    applyThemeToDom(newTheme);
  }, [applyThemeToDom]);

  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME);
    localStorage.removeItem(STORAGE_KEY);
    applyThemeToDom(DEFAULT_THEME);
  }, [applyThemeToDom]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
