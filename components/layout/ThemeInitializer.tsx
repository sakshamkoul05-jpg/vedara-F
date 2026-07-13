'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';

export function ThemeInitializer() {
  const { setTheme } = useThemeStore();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    const stored = localStorage.getItem('vd_theme') as 'light' | 'dark' | 'system' | null;
    if (stored) {
      setTheme(stored);
    } else {
      setTheme('system');
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = localStorage.getItem('vd_theme') as 'light' | 'dark' | 'system' | null;
      if (current === 'system' || !current) {
        setTheme('system');
      }
    };
    mql.addEventListener('change', handler);
    hydrate();
    return () => mql.removeEventListener('change', handler);
  }, [setTheme, hydrate]);

  return null;
}
