'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CalendarX, Loader2, Plus, Trash2 } from 'lucide-react';
import { Section, SavingInput, SavingSelect, SavingToggle, EmptyState } from './components';
import { createRecord, deleteRecord, updateRecord } from './api';
import type { AdminBlackout, AdminPricingConfig, LastMinuteOfferType } from './types';

const OFFER_TYPES: { value: LastMinuteOfferType; label: string }[] = [
  { value: 'ROOM_DISCOUNT', label: 'Room discount (%)' },
  { value: 'COMPLIMENTARY_BREAKFAST', label: 'Complimentary breakfast' },
  { value: 'MEAL_CREDIT', label: 'Meal credit (₹)' },
];

const MIGRATION_NOTE = (
  <EmptyState>
    This needs migration <code>20260923_pricing_engine_v2_1b</code>. Run its <code>migration.sql</code>{' '}
    and <code>seed.sql</code> in Supabase, then refresh.
  </EmptyState>
);

/** Low-occupancy / last-minute offers (spec §9). */
export function LastMinuteTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const offers = config.lastMinuteOffers;

  return (
    <Section
      title="Last-minute offers"
      specRef="Spec §9"
      description="When arrival is within the window and few cottages are booked, a guest can be offered up to 10% off the room, complimentary breakfast, or a meal credit. Base rates are never lowered automatically — an offer only applies once you switch it on."
      actions={
        offers && (
          <button
            onClick={async () => {
              await createRecord('last-minute-offers', {
                name: 'New last-minute offer',
                offerType: 'ROOM_DISCOUNT',
                value: 10,
                daysBeforeArrival: 7,
                maxBookedCottages: 2,
                cottageIds: [],
                stackableWithCoupon: false,
                isActive: false,
              });
              await reload();
            }}
            className="cta-primary cta-sm"
          >
            <Plus className="w-4 h-4" /> Add offer
          </button>
        )
      }
    >
      {offers === null ? (
        MIGRATION_NOTE
      ) : offers.length === 0 ? (
        <EmptyState>No last-minute offers configured.</EmptyState>
      ) : (
        <div className="space-y-5">
          {offers.map((offer) => {
            const save = async (field: string, value: unknown) => {
              await updateRecord('last-minute-offers', { id: offer.id, [field]: value });
              await reload();
            };
            const int = (raw: string, label: string, min = 0) => {
              const v = Math.round(Number(raw));
              if (!Number.isFinite(v) || v < min) throw new Error(`${label} must be ${min} or more`);
              return v;
            };
            return (
              <div key={offer.id} className="border border-border rounded-xl p-4">
                <div className="flex flex-wrap items-end gap-3 mb-4">
                  <div className="flex-1 min-w-[180px]">
                    <label className="text-xs text-muted-foreground block mb-1">Name (shown to guests)</label>
                    <SavingInput value={offer.name} ariaLabel="Offer name" onSave={(v) => save('name', v)} />
                  </div>
                  <div className="w-56">
                    <label className="text-xs text-muted-foreground block mb-1">Offer</label>
                    <SavingSelect
                      value={offer.offerType}
                      ariaLabel="Offer type"
                      options={OFFER_TYPES}
                      onSave={async (v) => {
                        // Keep the value meaningful for the new type.
                        const value = v === 'ROOM_DISCOUNT' ? Math.min(offer.value, 10) : offer.value;
                        await updateRecord('last-minute-offers', { id: offer.id, offerType: v, value });
                        await reload();
                      }}
                    />
                  </div>
                  {offer.offerType !== 'COMPLIMENTARY_BREAKFAST' && (
                    <div className="w-32">
                      <label className="text-xs text-muted-foreground block mb-1">
                        {offer.offerType === 'ROOM_DISCOUNT' ? 'Discount' : 'Credit'}
                      </label>
                      <SavingInput
                        type="number"
                        min={0}
                        max={offer.offerType === 'ROOM_DISCOUNT' ? 10 : undefined}
                        prefix={offer.offerType === 'MEAL_CREDIT' ? '₹' : undefined}
                        suffix={offer.offerType === 'ROOM_DISCOUNT' ? '%' : undefined}
                        value={offer.value}
                        ariaLabel="Offer value"
                        onSave={async (v) => {
                          const n = Number(v);
                          if (!Number.isFinite(n) || n < 0) throw new Error('Enter a positive number');
                          if (offer.offerType === 'ROOM_DISCOUNT' && n > 10) {
                            throw new Error('Spec §9 caps this at 10%');
                          }
                          await save('value', n);
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active</span>
                    <SavingToggle checked={offer.isActive} label={`${offer.name} active`} onSave={(n) => save('isActive', n)} />
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete "${offer.name}"?`)) return;
                      await deleteRecord('last-minute-offers', offer.id);
                      await reload();
                    }}
                    className="h-9 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>

                <div className="flex flex-wrap items-end gap-4 mb-4">
                  <div className="w-44">
                    <label className="text-xs text-muted-foreground block mb-1">Arrival within</label>
                    <SavingInput
                      type="number"
                      min={0}
                      suffix="days"
                      value={offer.daysBeforeArrival}
                      ariaLabel="Days before arrival"
                      onSave={(v) => save('daysBeforeArrival', int(v, 'Days'))}
                    />
                  </div>
                  <div className="w-52">
                    <label className="text-xs text-muted-foreground block mb-1">When booked cottages ≤</label>
                    <SavingInput
                      type="number"
                      min={0}
                      suffix="on every night"
                      value={offer.maxBookedCottages}
                      ariaLabel="Maximum booked cottages"
                      onSave={(v) => save('maxBookedCottages', int(v, 'Booked cottages'))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <SavingToggle
                      checked={offer.stackableWithCoupon}
                      label={`${offer.name} stacks with coupons`}
                      onSave={(n) => save('stackableWithCoupon', n)}
                    />
                    <span className="text-xs text-muted-foreground">Stacks with coupons</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Limited to cottages</label>
                  <div className="flex flex-wrap gap-2">
                    {config.cottages.map((cottage) => {
                      const on = offer.cottageIds.includes(cottage.id);
                      return (
                        <button
                          key={cottage.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            save(
                              'cottageIds',
                              on ? offer.cottageIds.filter((id) => id !== cottage.id) : [...offer.cottageIds, cottage.id]
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                            on
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                          }`}
                        >
                          {cottage.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">Select none to offer it on every cottage.</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        Only one offer applies to a stay — the one worth most to the guest. A room discount does not combine with Stay
        4 Pay 3 or a coupon unless you allow it; when they cannot combine, the guest gets whichever is better.
      </p>
    </Section>
  );
}

/** Blackout / stop-sell dates (spec §15). */
export function BlackoutsTab({ config }: { config: AdminPricingConfig }) {
  const [rows, setRows] = useState<AdminBlackout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ nights: number; overlapping: any[] } | null>(null);

  const [cottageIds, setCottageIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pricing/blackouts', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load blackout dates');
      setRows(json.data);
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setSaving(true);
    setError('');
    setNotice(null);
    try {
      const res = await fetch('/api/admin/pricing/blackouts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cottageIds, startDate, endDate, reason: reason || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save');
      setNotice({ nights: json.data.blockedNights, overlapping: json.data.overlappingBookings });
      setStartDate('');
      setEndDate('');
      setReason('');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (ids: string[]) => {
    if (!confirm(`Re-open ${ids.length} night${ids.length === 1 ? '' : 's'} for sale?`)) return;
    const res = await fetch('/api/admin/pricing/blackouts', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Could not remove');
      return;
    }
    await load();
  };

  // Group consecutive nights for the same cottage and reason into one row.
  const nameOf = (r: AdminBlackout) =>
    r.cottage?.name ?? config.cottages.find((c) => c.id === r.cottageId)?.name ?? r.cottageId;
  // Rows arrive ordered by date across every cottage; order by cottage first so
  // each cottage's consecutive nights are adjacent and merge into one range.
  const sorted = [...rows].sort(
    (a, b) => nameOf(a).localeCompare(nameOf(b)) || String(a.date).localeCompare(String(b.date))
  );
  const groups: { name: string; reason: string; from: string; to: string; ids: string[] }[] = [];
  for (const r of sorted) {
    const date = String(r.date).slice(0, 10);
    const name = nameOf(r);
    const reasonText = r.reason ?? '';
    const last = groups[groups.length - 1];
    const prevDay = last && new Date(Date.parse(last.to + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
    if (last && last.name === name && last.reason === reasonText && prevDay === date) {
      last.to = date;
      last.ids.push(r.id);
    } else {
      groups.push({ name, reason: reasonText, from: date, to: date, ids: [r.id] });
    }
  }
  groups.sort((a, b) => a.from.localeCompare(b.from) || a.name.localeCompare(b.name));

  return (
    <Section
      title="Blackout & stop-sell dates"
      specRef="Spec §15"
      description="Stop a cottage — or the whole property — being sold on specific dates, for maintenance, a private event or closure. Existing bookings are never cancelled; any that overlap are listed so you can contact the guest."
    >
      <div className="border border-border rounded-xl p-4 mb-5">
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div className="w-40">
            <label className="text-xs text-muted-foreground block mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
            />
          </div>
          <div className="w-40">
            <label className="text-xs text-muted-foreground block mb-1">To (inclusive)</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground block mb-1">Reason (internal)</label>
            <input
              value={reason}
              maxLength={200}
              placeholder="Maintenance, private event…"
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
            />
          </div>
          <button
            onClick={create}
            disabled={!startDate || !endDate || saving}
            className="cta-primary cta-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarX className="w-4 h-4" />}
            Block dates
          </button>
        </div>
        <label className="text-xs text-muted-foreground block mb-1.5">Cottages</label>
        <div className="flex flex-wrap gap-2">
          {config.cottages.map((cottage) => {
            const on = cottageIds.includes(cottage.id);
            return (
              <button
                key={cottage.id}
                type="button"
                aria-pressed={on}
                onClick={() => setCottageIds(on ? cottageIds.filter((id) => id !== cottage.id) : [...cottageIds, cottage.id])}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  on
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {cottage.name}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">Select none to stop-sell the whole property.</p>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {notice && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 mb-4 text-sm">
          <p className="text-amber-900 dark:text-amber-200">Blocked {notice.nights} cottage-night{notice.nights === 1 ? '' : 's'}.</p>
          {notice.overlapping.length > 0 && (
            <p className="text-amber-800 dark:text-amber-300 flex items-start gap-1.5 mt-1">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              These existing bookings overlap and were not changed:{' '}
              {notice.overlapping.map((b: any) => b.bookingRef).join(', ')}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>
      ) : groups.length === 0 ? (
        <EmptyState>No upcoming blackout dates. Every cottage is on sale.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 font-medium">Cottage</th>
                <th className="py-2 pr-3 font-medium">Dates</th>
                <th className="py-2 pr-3 font-medium">Reason</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.ids[0]} className="border-b border-border/50">
                  <td className="py-2 pr-3 text-foreground">{g.name}</td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {g.from === g.to ? g.from : `${g.from} → ${g.to}`}
                    <span className="text-[11px] ml-1">({g.ids.length} night{g.ids.length === 1 ? '' : 's'})</span>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{g.reason || '—'}</td>
                  <td className="py-2">
                    <button
                      onClick={() => remove(g.ids)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      aria-label={`Re-open ${g.name} ${g.from}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
