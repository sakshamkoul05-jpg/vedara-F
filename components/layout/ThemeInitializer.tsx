'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';

export function ThemeInitializer() {
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const stored = localStorage.getItem('vd_theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, [setTheme]);

  return null;
}
