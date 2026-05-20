'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AdminSidebar } from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!token && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [token, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
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
