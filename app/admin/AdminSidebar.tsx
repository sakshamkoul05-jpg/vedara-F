'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import {
  LayoutDashboard, Calendar, Coffee, Settings, BarChart3, LogOut, Mountain
} from 'lucide-react';

const adminNav = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard?tab=bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/dashboard?tab=cafe', label: 'Cafe', icon: Coffee },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/cms', label: 'CMS', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const isActive = (href: string) => {
    if (href.includes('?')) {
      const [base, qs] = href.split('?');
      const params = new URLSearchParams(qs);
      return pathname === base && new URLSearchParams(window.location.search).get('tab') === params.get('tab');
    }
    return pathname === href;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-white dark:bg-earth-800/50">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <Mountain className="h-7 w-7 text-forest-600" />
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground leading-tight">Vedara</h2>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-forest-600 text-cream-50 shadow-sm'
                  : 'text-muted-foreground hover:bg-earth-100 dark:hover:bg-earth-700 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-earth-50 dark:bg-earth-700/50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-cream-50 text-xs font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name || 'Admin'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
