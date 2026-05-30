'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Coffee, ClipboardList, LogOut, Bell, User, ChevronRight, Clock, CheckCircle2, XCircle, UtensilsCrossed, Loader2 } from 'lucide-react';
import { formatDateShort, formatPrice } from '@/lib/utils';

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  CONFIRMED: 'success',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'default',
  PENDING: 'warning',
  CANCELLED: 'danger',
  PREPARING: 'warning',
  READY: 'success',
};

const bookingStatusActions: Record<string, { label: string; nextStatus: string }> = {
  CONFIRMED: { label: 'Check In', nextStatus: 'CHECKED_IN' },
  CHECKED_IN: { label: 'Check Out', nextStatus: 'CHECKED_OUT' },
};

const orderStatusActions: Record<string, { label: string; nextStatus: string }> = {
  PENDING: { label: 'Start Preparing', nextStatus: 'PREPARING' },
  PREPARING: { label: 'Mark Ready', nextStatus: 'READY' },
};

export default function EmployeeDashboardPage() {
  const { user, token, logout, hydrated, hydrate } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) { router.push('/admin/login'); return; }
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') {
      router.push('/admin/dashboard');
      return;
    }
  }, [token, user, router, hydrated]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    if (tab === 'bookings') {
      api.get('/bookings/all?limit=5', token)
        .then((res: any) => setBookings(res.bookings || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      api.get('/cafe/kitchen', token)
        .then((res: any) => setOrders(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [token, tab]);

  const handleBookingStatusUpdate = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/status`, { status }, token);
      const res = await api.get('/bookings/all?limit=5', token);
      setBookings(res.bookings || []);
    } catch {}
    finally { setUpdatingId(null); }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/cafe/orders/${orderId}/status`, { status }, token);
      const res = await api.get('/cafe/kitchen', token);
      setOrders(res.data || []);
    } catch {}
    finally { setUpdatingId(null); }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900 pt-24">
      <div className="vintage-container py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center">
              <User className="w-5 h-5 text-cream-50" />
            </div>
            <div>
              <h1 className="font-serif text-xl text-foreground leading-tight">{user?.name}</h1>
              <Badge variant="secondary" size="sm" className="mt-0.5">
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4 text-earth-600 dark:text-earth-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4 text-earth-600 dark:text-earth-300" />
            </Button>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('bookings')}
className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
               tab === 'bookings'
                 ? 'bg-forest-600 text-cream-50 shadow-md'
                 : 'bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-earth-300 hover:bg-earth-200'
             }`}
           >
             <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
             Bookings
           </button>
           <button
             onClick={() => setTab('orders')}
             className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
               tab === 'orders'
                 ? 'bg-forest-600 text-cream-50 shadow-md'
                 : 'bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-earth-300 hover:bg-earth-200'
             }`}
          >
            <Coffee className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Kitchen Orders
          </button>
        </div>

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <ClipboardList className="w-5 h-5 text-forest-600" />
              <h2 className="font-serif text-lg text-foreground">Today&apos;s Bookings</h2>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-forest-600 animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-10 h-10 text-earth-300 mx-auto mb-3" />
                <p className="text-earth-500 text-sm">No bookings for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any, i: number) => (
                  <ScrollReveal key={booking.id} delay={i * 0.05}>
                    <div className="backdrop-blur bg-white/60 dark:bg-earth-800/60 border border-white/20 dark:border-earth-700/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 font-sans">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm truncate">
                              {booking.guest?.name}
                            </span>
                            <Badge variant={statusBadgeVariant[booking.status] || 'default'} size="sm">
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <UtensilsCrossed className="w-3 h-3" />
                            {booking.cottage?.name}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {formatDateShort(booking.checkIn)} – {formatDateShort(booking.checkOut)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.adults} adults{booking.children ? `, ${booking.children} children` : ''} · {booking.bookingRef}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <p className="text-sm font-semibold text-forest-600">
                            {formatPrice(booking.finalAmount || booking.totalAmount)}
                          </p>
                          {bookingStatusActions[booking.status] && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookingStatusUpdate(booking.id, bookingStatusActions[booking.status].nextStatus)}
                              disabled={updatingId === booking.id}
                            >
                              {updatingId === booking.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>{bookingStatusActions[booking.status].label} <ChevronRight className="w-3 h-3 ml-1" /></>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Kitchen Orders Tab */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <UtensilsCrossed className="w-5 h-5 text-forest-600" />
              <h2 className="font-serif text-lg text-foreground">Order Queue</h2>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-forest-600 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Coffee className="w-10 h-10 text-earth-300 mx-auto mb-3" />
                <p className="text-earth-500 text-sm">No pending orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any, i: number) => (
                  <ScrollReveal key={order.id} delay={i * 0.05} direction="left">
                    <div className="backdrop-blur bg-white/60 dark:bg-earth-800/60 border border-white/20 dark:border-earth-700/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 font-sans">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground text-sm">Table {order.tableNumber}</span>
                            <Badge variant={statusBadgeVariant[order.status] || 'warning'} size="sm">
                              {order.status === 'PREPARING' ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />
                              ) : order.status === 'READY' ? (
                                <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1 inline" />
                              )}
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{order.orderRef}</p>
                          {order.guestName && (
                            <p className="text-xs text-muted-foreground mt-0.5">{order.guestName}</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-forest-600">{formatPrice(order.totalAmount)}</p>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-1.5 mb-4 pb-4 border-b border-earth-100 dark:border-earth-700/30">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.quantity}x {item.item?.name}</span>
                            <span>{formatPrice(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Actions */}
                      <div className="flex gap-2">
                        {orderStatusActions[order.status] && (
                          <Button
                            variant={order.status === 'PENDING' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleOrderStatusUpdate(order.id, orderStatusActions[order.status].nextStatus)}
                            disabled={updatingId === order.id}
                          >
                            {updatingId === order.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : order.status === 'PENDING' ? (
                              <Loader2 className="w-3 h-3 mr-1" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            )}
                            {orderStatusActions[order.status].label}
                          </Button>
                        )}
                        {order.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderStatusUpdate(order.id, 'CANCELLED')}
                            disabled={updatingId === order.id}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
