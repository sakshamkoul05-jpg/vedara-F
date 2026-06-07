'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Coffee, LogOut, Mountain, ChevronLeft } from 'lucide-react';

const employeeNav = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/cafe', label: 'Cafe Orders', icon: Coffee },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { token, user, logout, hydrated, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) { router.push('/admin/login'); return; }
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') {
      router.push('/admin/dashboard');
    }
  }, [token, user, router, hydrated]);

  if (!hydrated || !token) return null;

  return (
    <div className="min-h-screen bg-earth-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gold-200">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/employee/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/images/vedara-logo.jpeg"
                  alt="Vedara"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-sm font-semibold text-foreground leading-tight block">Vedara Retreat</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Staff Portal</span>
              </div>
            </Link>
            <div className="h-6 w-px bg-gold-100 hidden sm:block" />
            <nav className="flex items-center gap-1">
              {employeeNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-gold-50 text-forest-700'
                        : 'text-earth-500 hover:text-foreground hover:bg-earth-50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center text-forest-700 text-[10px] font-bold flex-shrink-0">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div className="h-6 w-px bg-gold-100" />
            <button
              onClick={() => { logout(); router.push('/admin/login'); }}
              className="rounded-lg p-1.5 text-charcoal/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
