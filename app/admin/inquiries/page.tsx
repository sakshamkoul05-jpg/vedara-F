'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Loader2, RefreshCw, Mail, MessageCircle, Phone, UserX, Inbox } from 'lucide-react';

/**
 * Enquiries that stopped short of a booking.
 *
 * The automated ladder sends three messages and then stops. This page exists
 * for the judgement call it cannot make: which of these is worth picking up the
 * phone about.
 */

type FollowUp = {
  channel: 'EMAIL' | 'WHATSAPP';
  stage: number;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  scheduledAt: string;
  sentAt: string | null;
  error: string | null;
};

type Inquiry = {
  id: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  checkIn: string | null;
  checkOut: string | null;
  adults: number | null;
  children: number | null;
  lastStep: string | null;
  quotedAmount: number | null;
  status: string;
  createdAt: string;
  cottage: { name: string; slug: string } | null;
  followUps: FollowUp[];
};

const FILTERS = [
  { key: 'OPEN', label: 'Still open' },
  { key: 'CONVERTED', label: 'Booked' },
  { key: 'UNSUBSCRIBED', label: 'Opted out' },
  { key: 'ALL', label: 'All' },
] as const;

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'danger'> = {
  OPEN: 'warning',
  CONVERTED: 'success',
  CLOSED: 'secondary',
  UNSUBSCRIBED: 'danger',
};

const followUpVariant: Record<string, 'success' | 'warning' | 'secondary' | 'danger'> = {
  SENT: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
  SKIPPED: 'secondary',
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

const relativeTime = (iso: string) => {
  const hours = Math.round((Date.now() - Date.parse(iso)) / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<string>('OPEN');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/inquiries?status=${filter}`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not load enquiries.');
      setInquiries((await res.json()).data || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Enquiries</h1>
            <p className="text-sm text-muted-foreground mt-1">
              People who gave us details and dates but did not finish booking. Three automatic
              follow-ups go out over three days; after that it is a phone call or nothing.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
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
        ) : inquiries.length === 0 ? (
          <div className="glass-card-light rounded-2xl p-10 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Nothing here</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'OPEN' ? 'No unfinished enquiries at the moment.' : 'No enquiries in this state.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry, i) => {
              const dates = formatDate(inquiry.checkIn) && formatDate(inquiry.checkOut)
                ? `${formatDate(inquiry.checkIn)} – ${formatDate(inquiry.checkOut)}`
                : 'No dates given';
              return (
                <ScrollReveal key={inquiry.id} delay={Math.min(i * 0.03, 0.3)}>
                  <div className="glass-card-light rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {inquiry.name || 'Name not given'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inquiry.cottage?.name ?? 'No cottage chosen'} · {dates}
                          {inquiry.adults ? ` · ${inquiry.adults} adults` : ''}
                          {inquiry.children ? `, ${inquiry.children} children` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {inquiry.quotedAmount ? (
                          <span className="text-sm font-semibold text-foreground">
                            ₹{Math.round(inquiry.quotedAmount).toLocaleString('en-IN')}
                          </span>
                        ) : null}
                        <Badge variant={statusVariant[inquiry.status] || 'secondary'} size="sm">
                          {inquiry.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                      {inquiry.email && (
                        <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {inquiry.email}
                        </a>
                      )}
                      {inquiry.phone && (
                        <>
                          <a href={`tel:${inquiry.phone}`} className="text-primary hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {inquiry.phone}
                          </a>
                          <a
                            href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </a>
                        </>
                      )}
                      <span>Left at {inquiry.lastStep ?? 'unknown step'} · {relativeTime(inquiry.createdAt)}</span>
                    </div>

                    {inquiry.status === 'UNSUBSCRIBED' ? (
                      <p className="text-xs text-red-500 flex items-center gap-1.5">
                        <UserX className="w-3.5 h-3.5" />
                        Opted out of follow-ups. Do not contact about this enquiry.
                      </p>
                    ) : inquiry.followUps?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {[...inquiry.followUps]
                          .sort((a, b) => a.stage - b.stage || a.channel.localeCompare(b.channel))
                          .map((followUp) => (
                            <Badge
                              key={`${followUp.channel}-${followUp.stage}`}
                              variant={followUpVariant[followUp.status] || 'secondary'}
                              size="sm"
                              // The reason a nudge was skipped is the useful part
                              // when someone asks why nobody heard from us.
                              title={followUp.error ?? undefined}
                            >
                              {followUp.channel === 'EMAIL' ? 'Email' : 'WhatsApp'} {followUp.stage}:{' '}
                              {followUp.status.toLowerCase()}
                            </Badge>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No follow-ups scheduled.</p>
                    )}
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
