'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Check, X, Loader2, Calendar } from 'lucide-react';
import { formatDateShort, formatPrice } from '@/lib/utils';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-gold-100 text-clay-700',
  RESERVED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-earth-100 text-charcoal/70',
};

export function BookingsPage() {
  const { token } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: '10' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res: any = await api.get(`/bookings/all?${params}`, token);
      setBookings(res.bookings || res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [token, page, statusFilter]);

  const handleSearch = () => { setPage(1); fetchBookings(); };

  const handleApprove = async (bookingId: string) => {
    if (!token) return;
    setActionLoading(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/approve`, {}, token);
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b));
      showToast('Booking approved');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!token) return;
    const reason = prompt('Enter reason for rejection (optional):');
    setActionLoading(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/reject`, { reason: reason || undefined }, token);
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      showToast('Booking rejected');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!token || !confirm('Cancel this booking? The guest will be notified.')) return;
    setActionLoading(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`, {}, token);
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      showToast('Booking cancelled');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-24 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, email, or booking ref..."
            className="pl-10"
          />
        </div>
        <Button variant="primary" size="sm" onClick={handleSearch}>Search</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s.value
                ? 'glass-card-light text-gold-700 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-earth-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card-light rounded-2xl animate-pulse p-5">
              <div className="h-4 bg-gold-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gold-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No bookings found</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="glass-card-light rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{booking.guest?.name || 'Guest'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-earth-50 text-charcoal/70'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {booking.cottage?.name || 'Cottage'} • {formatDateShort(booking.checkIn)} – {formatDateShort(booking.checkOut)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{booking.bookingRef}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold-600 font-semibold">{formatPrice(booking.finalAmount)}</p>
                  {booking.payment && (
                    <span className={`text-xs ${booking.payment.status === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                      {booking.payment.status}
                    </span>
                  )}
                </div>
              </div>
              {booking.status === 'PENDING' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    disabled={actionLoading === booking.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(booking.id)}
                    disabled={actionLoading === booking.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    Reject
                  </button>
                </div>
              )}
              {booking.status === 'CONFIRMED' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={actionLoading === booking.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    Cancel Booking
                  </button>
                </div>
              )}
              {booking.specialRequests && (
                <p className="text-xs text-muted-foreground mt-2 italic">&ldquo;{booking.specialRequests}&rdquo;</p>
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
