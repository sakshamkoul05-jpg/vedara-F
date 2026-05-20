'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Calendar, Coffee, ClipboardList, LogOut, Bell } from 'lucide-react';
import { formatDateShort, formatPrice } from '@/lib/utils';

export default function EmployeeDashboardPage() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('bookings');

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') {
      router.push('/admin/dashboard');
      return;
    }

    if (tab === 'bookings') {
      api.get('/bookings/all?limit=10', token).then((res: any) => setBookings(res.bookings || [])).catch(() => {});
    } else {
      api.get('/cafe/kitchen', token).then((res: any) => setOrders(res.data || [])).catch(() => {});
    }
  }, [token, tab, router, user]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.put(`/cafe/orders/${orderId}/status`, { status }, token);
      const res = await api.get('/cafe/kitchen', token);
      setOrders(res.data || []);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900 pt-20">
      <div className="vintage-container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-2xl text-foreground">Employee Dashboard</h1>
            <p className="text-muted-foreground text-sm">{user?.name} • {user?.role?.replace('_', ' ')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('bookings')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'bookings' ? 'bg-forest-600 text-cream-50' : 'bg-earth-100 dark:bg-earth-800 text-earth-600'}`}
          >
            <Calendar className="w-4 h-4 inline mr-1.5" /> Bookings
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'orders' ? 'bg-forest-600 text-cream-50' : 'bg-earth-100 dark:bg-earth-800 text-earth-600'}`}
          >
            <Coffee className="w-4 h-4 inline mr-1.5" /> Kitchen Orders
          </button>
        </div>

        {tab === 'bookings' && (
          <div className="space-y-3">
            <h2 className="font-serif text-lg text-foreground mb-4">Recent Bookings</h2>
            {bookings.map((booking: any) => (
              <ScrollReveal key={booking.id}>
                <div className="vintage-card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground text-sm">{booking.guest?.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.cottage?.name} • {formatDateShort(booking.checkIn)} – {formatDateShort(booking.checkOut)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-forest-100 text-forest-700' :
                        booking.status === 'PENDING' ? 'bg-clay-100 text-clay-700' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-earth-100 text-earth-600'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{booking.bookingRef}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-serif text-lg text-foreground mb-4">Kitchen Orders</h2>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No pending orders</p>
            ) : (
              orders.map((order: any) => (
                <ScrollReveal key={order.id}>
                  <div className="vintage-card p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">Table {order.tableNumber} • {order.orderRef}</p>
                        {order.guestName && <p className="text-xs text-muted-foreground">{order.guestName}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-clay-100 text-clay-700' : 'bg-forest-100 text-forest-700'
                      }`}>{order.status}</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item: any) => (
                        <p key={item.id} className="text-xs text-muted-foreground">
                          {item.quantity}x {item.item?.name} — {formatPrice(item.totalPrice)}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'PENDING' && (
                        <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(order.id, 'PREPARING')}>
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'PREPARING' && (
                        <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(order.id, 'READY')}>
                          Mark Ready
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
