'use client';

import { useCallback, useEffect, useState } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Globe, MapPin, Share2, Languages, MonitorSmartphone, Loader2 } from 'lucide-react';

/**
 * Where traffic and bookings come from.
 *
 * Every breakdown shows visits next to conversions rather than visits alone:
 * the whole point is deciding where to advertise, and the market that browses
 * most is often not the market that books.
 */

type Row = {
  key: string;
  label: string;
  views: number;
  visits: number;
  conversions: number;
  conversionRate: number;
};

type Report = {
  days: number;
  totals: { views: number; visits: number; conversions: number; conversionRate: number };
  truncated: boolean;
  countries: Row[];
  cities: Row[];
  sources: Row[];
  locales: Row[];
  devices: Row[];
};

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '12 months' },
];

function Breakdown({
  title,
  icon: Icon,
  rows,
  emptyNote,
}: {
  title: string;
  icon: typeof Globe;
  rows: Row[];
  emptyNote: string;
}) {
  // Bars are scaled against the largest row, not the total, so a long tail
  // stays visible instead of collapsing into slivers.
  const max = Math.max(1, ...rows.map((r) => r.visits));

  return (
    <div className="glass-card-light rounded-2xl p-6">
      <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gold-500" />
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyNote}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm text-foreground truncate">{row.label}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {row.visits.toLocaleString('en-IN')} {row.visits === 1 ? 'visit' : 'visits'}
                  {row.conversions > 0 && (
                    <span className="text-primary font-medium">
                      {' · '}{row.conversions} booked ({row.conversionRate}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-earth-100 dark:bg-earth-900/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gold-500"
                  style={{ width: `${Math.round((row.visits / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TrafficReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics/traffic?days=${days}`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not load the report.');
      setReport((await res.json()).data);
    } catch (err: any) {
      setError(err?.message || 'Could not load the report.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Where our guests come from</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visits and bookings by location, for deciding where to advertise.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map(({ days: value, label }) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-earth-100 text-muted-foreground hover:bg-earth-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !report ? null : report.totals.views === 0 ? (
        <div className="glass-card-light rounded-2xl p-10 text-center">
          <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No traffic recorded yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Visits appear here once the site has been live with analytics deployed. Locations come from
            the hosting edge, so they only populate on a real deployment — never from a local run.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Visits', value: report.totals.visits.toLocaleString('en-IN') },
              { label: 'Page views', value: report.totals.views.toLocaleString('en-IN') },
              { label: 'Visits that booked', value: report.totals.conversions.toLocaleString('en-IN') },
              { label: 'Conversion rate', value: `${report.totals.conversionRate}%` },
            ].map((stat) => (
              <div key={stat.label} className="glass-card-light rounded-2xl p-5">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {report.truncated && (
            <p className="text-xs text-amber-600">
              More than 50,000 page views in this range; the breakdowns below are based on the most
              recent 50,000.
            </p>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <ScrollReveal>
              <Breakdown
                title="Countries"
                icon={Globe}
                rows={report.countries}
                emptyNote="No locations recorded yet."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <Breakdown
                title="Cities"
                icon={MapPin}
                rows={report.cities}
                emptyNote="No cities recorded yet."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Breakdown
                title="How they found us"
                icon={Share2}
                rows={report.sources}
                emptyNote="No sources recorded yet."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <Breakdown
                title="Language used"
                icon={Languages}
                rows={report.locales}
                emptyNote="No languages recorded yet."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Breakdown
                title="Device"
                icon={MonitorSmartphone}
                rows={report.devices}
                emptyNote="No devices recorded yet."
              />
            </ScrollReveal>
          </div>
        </>
      )}
    </div>
  );
}
