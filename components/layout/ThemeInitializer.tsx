'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export function ThemeInitializer() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
