'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import {
  Sparkles, Wrench, PackagePlus, UtensilsCrossed, HelpCircle,
  Loader2, Clock, AlertTriangle, RefreshCw,
} from 'lucide-react';

/**
 * Housekeeping and maintenance requests raised by guests.
 *
 * Lives on its own page rather than as a dashboard tab because it is worked
 * from, not read: the desk keeps it open and moves rows through the statuses.
 */

type ServiceRequest = {
  id: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  preferredTime: string | null;
  status: string;
  staffNotes: string | null;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  booking?: {
    bookingRef: string;
    checkIn?: string;
    checkOut?: string;
    guest?: { name: string; email: string | null; phone: string | null } | null;
  } | null;
  cottage?: { name: string; slug: string } | null;
};

const categoryIcon: Record<string, typeof Sparkles> = {
  HOUSEKEEPING: Sparkles,
  MAINTENANCE: Wrench,
  AMENITIES: PackagePlus,
  FOOD_BEVERAGE: UtensilsCrossed,
  OTHER: HelpCircle,
};

const categoryLabel: Record<string, string> = {
  HOUSEKEEPING: 'Housekeeping',
  MAINTENANCE: 'Maintenance',
  AMENITIES: 'Amenities',
  FOOD_BEVERAGE: 'Food & Drink',
  OTHER: 'Other',
};

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'danger'> = {
  OPEN: 'warning',
  ACKNOWLEDGED: 'secondary',
  IN_PROGRESS: 'secondary',
  RESOLVED: 'success',
  CANCELLED: 'danger',
};

/** The move each status most often wants next, as a single button. */
const NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
  OPEN: { status: 'ACKNOWLEDGED', label: 'Acknowledge' },
  ACKNOWLEDGED: { status: 'IN_PROGRESS', label: 'Start' },
  IN_PROGRESS: { status: 'RESOLVED', label: 'Mark done' },
};

const FILTERS = [
  { key: 'ACTIVE', label: 'Needs attention' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'ALL', label: 'All' },
] as const;

const relativeTime = (iso: string) => {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
};

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<string>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = filter === 'ALL' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/admin/service-requests${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not load requests.');
      const json = await res.json();
      setRequests(json.data || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/service-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Update failed.');
      const json = await res.json();
      setRequests((prev) =>
        // A row that no longer belongs in the current filter drops out, so the
        // "needs attention" list stays a worklist rather than a log.
        filter === 'ACTIVE' && ['RESOLVED', 'CANCELLED'].includes(json.data.status)
          ? prev.filter((r) => r.id !== id)
          : prev.map((r) => (r.id === id ? { ...r, ...json.data } : r))
      );
    } catch (err: any) {
      setError(err?.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const urgentCount = requests.filter((r) => r.priority === 'URGENT').length;

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Guest Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Housekeeping and maintenance raised from the guest portal.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {urgentCount > 0 && (
          <div className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {urgentCount} urgent {urgentCount === 1 ? 'request' : 'requests'} in this list.
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-earth-100 text-muted-foreground hover:bg-earth-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <div className="glass-card-light rounded-2xl p-10 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Nothing waiting</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'ACTIVE' ? 'Every guest request has been dealt with.' : 'No requests here yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req, i) => {
              const Icon = categoryIcon[req.category] || HelpCircle;
              const next = NEXT_STEP[req.status];
              const guest = req.booking?.guest;
              return (
                <ScrollReveal key={req.id} delay={Math.min(i * 0.03, 0.3)}>
                  <div
                    className={`glass-card-light rounded-2xl p-5 border-l-4 ${
                      req.priority === 'URGENT' ? 'border-l-red-500' : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <Icon className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {categoryLabel[req.category] || req.category}
                            {req.cottage?.name ? ` · ${req.cottage.name}` : ''}
                          </p>
                          <p className="font-medium text-foreground">{req.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {req.priority === 'URGENT' && <Badge variant="danger" size="sm">Urgent</Badge>}
                        <Badge variant={statusVariant[req.status] || 'secondary'} size="sm">
                          {req.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{req.description}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
                      {guest?.name && <span className="text-foreground font-medium">{guest.name}</span>}
                      {req.booking?.bookingRef && <span className="font-mono">{req.booking.bookingRef}</span>}
                      {guest?.phone && (
                        <a href={`tel:${guest.phone}`} className="text-primary hover:underline">{guest.phone}</a>
                      )}
                      {req.preferredTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {req.preferredTime}
                        </span>
                      )}
                      <span>{relativeTime(req.createdAt)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {next && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={busyId === req.id}
                          onClick={() => update(req.id, { status: next.status })}
                        >
                          {busyId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : next.label}
                        </Button>
                      )}
                      {req.status !== 'RESOLVED' && req.status !== 'CANCELLED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === req.id}
                          onClick={() => update(req.id, { status: 'CANCELLED' })}
                        >
                          Cancel
                        </Button>
                      )}
                      {(req.status === 'RESOLVED' || req.status === 'CANCELLED') && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === req.id}
                          onClick={() => update(req.id, { status: 'OPEN' })}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
