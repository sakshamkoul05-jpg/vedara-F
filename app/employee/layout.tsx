'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Coffee, LogOut, Mountain } from 'lucide-react';

const employeeNav = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/cafe', label: 'Cafe', icon: Coffee },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') {
      router.push('/admin/dashboard');
    }
  }, [token, user, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/90 dark:bg-earth-800/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/employee/dashboard" className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-forest-600" />
              <span className="font-serif text-lg font-semibold text-foreground">Vedara</span>
            </Link>
            <nav className="flex items-center gap-1">
              {employeeNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-forest-100 text-forest-700 dark:bg-forest-900/30 dark:text-forest-300'
                        : 'text-muted-foreground hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-cream-50 text-xs font-bold">
                {user?.name?.charAt(0) || 'E'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push('/admin/login'); }}
              className="rounded-full p-2 text-muted-foreground hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
