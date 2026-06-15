'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import {
  LayoutDashboard, Calendar, Coffee, Settings, BarChart3, LogOut, Mountain, ChevronLeft,
  Users, HelpCircle, UserPlus, Package
} from 'lucide-react';

const adminNav = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard?tab=bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/dashboard?tab=cafe', label: 'Cafe Orders', icon: Coffee },
  { href: '/admin/staff', label: 'Staff', icon: UserPlus },
  { href: '/admin/packages', label: 'Packages', icon: Package },
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
      return pathname === base && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === params.get('tab');
    }
    return pathname === href;
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-60 flex-col glass-card-light border-r border-border rounded-none">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src="/images/vedara-logo.jpeg"
            alt="Vedara"
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-sm font-semibold text-foreground leading-tight truncate">Vedara Retreat</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                active
                  ? 'bg-gold-600 text-white shadow-md'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role?.replace(/_/g, ' ') || 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
