'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/admin/login');
    }
  }, [token, router]);

  if (!token) return null;

  return <>{children}</>;
}
