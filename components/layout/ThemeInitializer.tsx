'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';

export function ThemeInitializer() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrateTheme();
    hydrateAuth();
  }, [hydrateTheme, hydrateAuth]);

  return null;
}
