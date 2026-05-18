'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, ThemeConfig } from '@/types/theme';
import { isValidHex } from '@/utils/color';

const STORAGE_KEY = 'eventsync_theme';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (newTheme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (
          isValidHex(parsed.primary) &&
          isValidHex(parsed.secondary) &&
          isValidHex(parsed.tertiary)
        ) {
          setThemeState(parsed);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setMounted(true);
  }, []);

  const applyThemeToDom = useCallback((newTheme: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', newTheme.primary);
    root.style.setProperty('--color-secondary', newTheme.secondary);
    root.style.setProperty('--color-tertiary', newTheme.tertiary);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyThemeToDom(theme);
    }
  }, [theme, mounted, applyThemeToDom]);

  const setTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setThemeState((prev) => {
      const updated = { ...prev, ...newTheme };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME);
    localStorage.removeItem(STORAGE_KEY);
    applyThemeToDom(DEFAULT_THEME);
  }, [applyThemeToDom]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
