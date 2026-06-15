'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import { Calendar, Coffee, MessageCircle, Users, TrendingUp, Building2, Activity, LogOut, LayoutDashboard, Settings, MessageCircleMore } from 'lucide-react';
import { BookingsPage } from '../BookingsPage';
import { CafeManagementPage } from '../CafeManagementPage';

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab') || 'overview';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get('/cms/dashboard', token).then((res: any) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const setTab = useCallback((tab: string) => {
    router.push(`/admin/dashboard?tab=${tab}`);
  }, [router]);

  const statCards = stats ? [
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-gold-600 bg-gold-100' },
    { label: 'Monthly Bookings', value: stats.monthlyBookings, icon: TrendingUp, color: 'text-gold-500 bg-gold-100 dark:bg-vedara-900/30' },
    { label: 'Revenue (Year)', value: `₹${(stats.yearlyRevenue / 100000).toFixed(1)}L`, icon: Activity, color: 'text-charcoal/70 bg-gold-50' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Calendar, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Cafe Orders', value: stats.totalCafeOrders, icon: Coffee, color: 'text-gold-600 bg-gold-100' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageCircle, color: 'text-gold-500 bg-gold-100' },
    { label: 'Total Cottages', value: stats.totalCottages, icon: Building2, color: 'text-charcoal/70 bg-gold-50' },
    { label: 'Total Guests', value: stats.totalGuests, icon: Users, color: 'text-gold-600 bg-gold-100' },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'cafe', label: 'Cafe', icon: Coffee },
    { id: 'cms', label: 'CMS', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/chat" className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 hover:border-emerald-400 transition-colors">
              <MessageCircleMore className="w-3.5 h-3.5 inline mr-1" /> Live Chat
            </Link>
            <Link href="/admin/cms" className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs text-foreground hover:border-forest-400 transition-colors">
              <Settings className="w-3.5 h-3.5 inline mr-1" /> Settings
            </Link>
            <span className="px-3 py-1 rounded-full bg-gold-100 text-forest-700 text-xs font-medium">{user?.role}</span>
            <Button variant="ghost" size="icon" onClick={logout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border pb-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-sans font-medium border-b-2 transition-all ${
                  currentTab === tab.id
                    ? 'border-forest-600 text-gold-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {currentTab === 'overview' && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="glass-card-light animate-pulse p-5 rounded-2xl">
                    <div className="h-4 bg-gold-100 rounded w-1/2 mb-3" />
                    <div className="h-8 bg-gold-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card) => (
                  <ScrollReveal key={card.label} delay={0.05}>
                    <div className="glass-card-light rounded-2xl p-5">
                      <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                      <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
                      <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <ScrollReveal>
                <div className="glass-card-light rounded-2xl p-6">
                  <h2 className="font-serif text-lg text-foreground mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Manage Cottages', href: '/admin/cms', desc: 'Update cottage details, prices, images' },
                      { label: 'View All Bookings', href: '/admin/dashboard?tab=bookings', desc: 'Manage reservations' },
                      { label: 'Cafe Menu', href: '/admin/dashboard?tab=cafe', desc: 'Update menu items and categories' },
                      { label: 'Analytics', href: '/admin/analytics', desc: 'Revenue and performance reports' },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block p-3 rounded-xl bg-earth-50/80 hover:bg-gold-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="glass-card-light rounded-2xl p-6">
                  <h2 className="font-serif text-lg text-foreground mb-4">Activity Log</h2>
                  <p className="text-muted-foreground text-sm">View recent system activity and changes.</p>
                  {stats && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Active Cottages</span>
                        <span className="font-medium">{stats.activeCottages} / {stats.totalCottages}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending Bookings</span>
                        <span className="font-medium">{stats.pendingBookings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unread Messages</span>
                        <span className="font-medium">{stats.unreadMessages}</span>
                      </div>
                    </div>
                  )}
                  <Link href="/admin/cms" className="text-gold-600 text-sm font-medium mt-4 inline-block">View Details →</Link>
                </div>
              </ScrollReveal>
            </div>
          </>
        )}

        {currentTab === 'bookings' && <BookingsPage />}
        {currentTab === 'cafe' && <CafeManagementPage />}
        {currentTab === 'cms' && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Full CMS settings are available on the dedicated page.</p>
            <Link href="/admin/cms" className="vintage-button-primary">Open CMS</Link>
          </div>
        )}
      </div>
    </div>
  );
}
