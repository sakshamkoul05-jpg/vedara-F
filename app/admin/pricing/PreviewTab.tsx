'use client';

import { useState } from 'react';
import { Loader2, Calculator } from 'lucide-react';
import { Section } from './components';
import type { AdminPricingConfig } from './types';

/**
 * Prices a hypothetical stay against the live configuration.
 *
 * Calls the same `/api/pricing/quote` endpoint the booking form uses, so what
 * is shown here is exactly what a guest would be charged — which makes it a
 * safe way to check a rate change before it reaches real bookings.
 */
export function PreviewTab({ config }: { config: AdminPricingConfig }) {
  const bookable = config.cottages.filter((c) => c.pricingCategory && c.isActive);

  const [cottageId, setCottageId] = useState(bookable[0]?.id ?? '');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [ratePlan, setRatePlan] = useState<'ROOM_ONLY' | 'BREAKFAST_INCLUDED'>('ROOM_ONLY');
  const [extraMattresses, setExtraMattresses] = useState(0);

  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cottage = config.cottages.find((c) => c.id === cottageId);

  const run = async () => {
    setLoading(true);
    setError('');
    setQuote(null);
    try {
      const res = await fetch('/api/pricing/quote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId,
          checkIn,
          checkOut,
          adults,
          childAges,
          ratePlan,
          extraMattresses,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Could not calculate a price');
        return;
      }
      setQuote(json.data);
    } catch {
      setError('Could not reach the pricing service');
    } finally {
      setLoading(false);
    }
  };

  const money = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <Section
      title="Rate preview"
      specRef="Spec §17"
      description="Price a test stay against the live configuration. This runs the same calculation the booking form uses, including real availability, so you can verify a rate change before a guest sees it."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Cottage</label>
          <select
            value={cottageId}
            onChange={(e) => setCottageId(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            {bookable.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Adults</label>
          <select
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            {Array.from({ length: cottage?.maxAdults ?? 4 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Children</label>
          <select
            value={childAges.length}
            onChange={(e) => {
              const next = parseInt(e.target.value);
              setChildAges((prev) =>
                next > prev.length ? [...prev, ...Array(next - prev.length).fill(5)] : prev.slice(0, next)
              );
            }}
            className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        {childAges.map((age, i) => (
          <div key={i}>
            <label className="text-xs text-muted-foreground block mb-1">Child {i + 1} age</label>
            <input
              type="number"
              min={0}
              max={17}
              value={age}
              onChange={(e) =>
                setChildAges((prev) =>
                  prev.map((a, idx) => (idx === i ? parseInt(e.target.value) || 0 : a))
                )
              }
              className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
            />
          </div>
        ))}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Rate plan</label>
          <select
            value={ratePlan}
            onChange={(e) => setRatePlan(e.target.value as any)}
            className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            <option value="ROOM_ONLY">Room Only</option>
            <option value="BREAKFAST_INCLUDED">Breakfast Included</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Extra mattresses</label>
          <select
            value={extraMattresses}
            onChange={(e) => setExtraMattresses(parseInt(e.target.value))}
            disabled={!cottage?.allowsExtraMattress}
            className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground disabled:opacity-50"
          >
            {Array.from({ length: (cottage?.maxExtraMattresses ?? 0) + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={run}
        disabled={!cottageId || !checkIn || !checkOut || loading}
        className="cta-primary cta-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
        Calculate
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-500 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {quote && (
        <div className="mt-5 border border-border rounded-xl p-4">
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">Night</th>
                  <th className="py-2 pr-3 font-medium">Season</th>
                  <th className="py-2 pr-3 font-medium">Base</th>
                  <th className="py-2 pr-3 font-medium">Uplift</th>
                  <th className="py-2 pr-3 font-medium">Room</th>
                </tr>
              </thead>
              <tbody>
                {quote.perNight.map((n: any) => (
                  <tr key={n.date} className="border-b border-border/50">
                    <td className="py-2 pr-3 text-foreground">
                      {n.date}
                      {n.isWeekend && (
                        <span className="text-[10px] text-muted-foreground ml-1">weekend</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{n.seasonName}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{money(n.baseRate)}</td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {n.inventoryUplift ? `+${money(n.inventoryUplift)}` : '—'}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={n.isComplimentary ? 'line-through text-green-600' : 'text-foreground'}>
                        {money(n.roomRate)}
                      </span>
                      {n.isComplimentary && (
                        <span className="text-[10px] text-green-600 ml-1">free</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="space-y-1.5 text-sm max-w-sm ml-auto">
            <Row label="Accommodation" value={money(quote.accommodationBeforeBenefit)} />
            {quote.longStayApplied && (
              <Row
                label={quote.longStayRuleName}
                value={`-${money(quote.longStayDiscount)}`}
                tone="green"
              />
            )}
            {quote.breakfastTotal > 0 && (
              <Row label="Breakfast" value={money(quote.breakfastTotal)} />
            )}
            {quote.mattressTotal > 0 && (
              <Row label="Extra mattress" value={money(quote.mattressTotal)} />
            )}
            {quote.couponDiscount > 0 && (
              <Row
                label={`Coupon ${quote.couponCode}`}
                value={`-${money(quote.couponDiscount)}`}
                tone="green"
              />
            )}
            <Row label="Subtotal" value={money(quote.subtotal)} divider />
            {quote.taxBreakdown.map((t: any) => (
              <Row key={t.slabName} label={t.slabName} value={money(t.tax)} />
            ))}
            <Row label="Total payable" value={money(quote.total)} strong divider />
          </dl>

          {quote.notes.length > 0 && (
            <ul className="mt-3 space-y-1">
              {quote.notes.map((note: string, i: number) => (
                <li key={i} className="text-[11px] text-muted-foreground">{note}</li>
              ))}
            </ul>
          )}

          <p className="text-[10px] text-muted-foreground mt-3">
            Engine v{quote.engineVersion} · {quote.billableAdults} billable adult
            {quote.billableAdults === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </Section>
  );
}

function Row({
  label,
  value,
  tone,
  strong,
  divider,
}: {
  label: string;
  value: string;
  tone?: 'green';
  strong?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${divider ? 'border-t border-border pt-1.5' : ''} ${
        tone === 'green' ? 'text-green-600' : ''
      }`}
    >
      <dt className={strong ? 'font-medium text-foreground' : 'text-muted-foreground'}>{label}</dt>
      <dd className={strong ? 'font-bold text-gold-600' : 'text-foreground'}>{value}</dd>
    </div>
  );
}
