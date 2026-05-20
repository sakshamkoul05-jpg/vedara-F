'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateShort, formatPrice } from '@/lib/utils';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-forest-100 text-forest-700',
  PENDING: 'bg-clay-100 text-clay-700',
  RESERVED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-earth-100 text-earth-600',
};

export function BookingsPage() {
  const { token } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: '10' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    api.get(`/bookings/all?${params}`, token).then((res: any) => {
      setBookings(res.bookings || []);
      setTotalPages(res.totalPages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token, page, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or booking ref..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['', 'CONFIRMED', 'PENDING', 'CANCELLED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === s ? 'bg-forest-600 text-cream-50' : 'bg-earth-100 dark:bg-earth-800 text-earth-600'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="vintage-card animate-pulse p-5">
              <div className="h-4 bg-earth-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-earth-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No bookings found</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="vintage-card p-5 hover:border-forest-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{booking.guest?.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-earth-100 text-earth-600'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {booking.cottage?.name} • {formatDateShort(booking.checkIn)} – {formatDateShort(booking.checkOut)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{booking.bookingRef}</p>
                </div>
                <div className="text-right">
                  <p className="text-forest-600 dark:text-forest-400 font-semibold">{formatPrice(booking.finalAmount)}</p>
                  {booking.payment && (
                    <span className={`text-xs ${booking.payment.status === 'PAID' ? 'text-forest-600' : 'text-clay-500'}`}>
                      {booking.payment.status}
                    </span>
                  )}
                </div>
              </div>
              {booking.specialRequests && (
                <p className="text-xs text-muted-foreground mt-2 italic">"{booking.specialRequests}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="secondary" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
