'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SecurityShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        router.push('/admin/_sys/info');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  return null;
}
