'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';

export function ThemeInitializer() {
  const { setTheme } = useThemeStore();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    const stored = localStorage.getItem('vd_theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
    } else {
      setTheme('light');
    }
    hydrate();
  }, [setTheme, hydrate]);

  return null;
}
