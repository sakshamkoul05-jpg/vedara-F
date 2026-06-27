'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AdminSidebar } from './AdminSidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, hydrated, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [token, isLoginPage, router, hydrated]);

  if (!hydrated) return null;
  if (isLoginPage) return <>{children}</>;
  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-earth-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 lg:ml-60 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-border"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="p-4 lg:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
