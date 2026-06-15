'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Calendar, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    api.get('/cms/dashboard', token).then((res: any) => setStats(res.data)).catch(() => {});
  }, [token]);

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        <h1 className="font-serif text-3xl text-foreground mb-8">Analytics</h1>

        {stats ? (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-4">
              <ScrollReveal>
                <div className="glass-card-light rounded-2xl p-6">
                  <Calendar className="w-8 h-8 text-gold-500 mb-3" />
                  <p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <div className="glass-card-light rounded-2xl p-6">
                  <TrendingUp className="w-8 h-8 text-gold-500 mb-3" />
                  <p className="text-3xl font-bold text-foreground">{stats.monthlyBookings}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="glass-card-light rounded-2xl p-6">
                  <DollarSign className="w-8 h-8 text-gold-500 mb-3" />
                  <p className="text-3xl font-bold text-foreground">₹{(stats.yearlyRevenue / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-muted-foreground">Yearly Revenue</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div className="glass-card-light rounded-2xl p-6">
                  <ShoppingBag className="w-8 h-8 text-gold-500 mb-3" />
                  <p className="text-3xl font-bold text-foreground">{stats.totalCafeOrders}</p>
                  <p className="text-sm text-muted-foreground">Cafe Orders</p>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal>
              <div className="glass-card-light rounded-2xl p-6">
                <h2 className="font-serif text-xl text-foreground mb-4">Quick Stats</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Active Cottages', value: `${stats.activeCottages} / ${stats.totalCottages}` },
                    { label: 'Pending Bookings', value: stats.pendingBookings },
                    { label: 'Unread Messages', value: stats.unreadMessages },
                    { label: 'Total Guests', value: stats.totalGuests },
                    { label: 'Cafe Orders This Month', value: stats.todayCafeOrders },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        ) : (
          <div className="animate-pulse space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card-light rounded-2xl h-28" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
