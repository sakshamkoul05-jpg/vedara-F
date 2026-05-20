'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AdminSidebar } from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/admin/login');
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-cream-50 dark:bg-earth-900">
      <AdminSidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
