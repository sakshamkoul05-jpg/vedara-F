'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, IndianRupee, Loader2, RefreshCw } from 'lucide-react';
import { fetchConfig } from './api';
import type { AdminPricingConfig } from './types';
import { RateCardTab, SpecialPeakTab } from './RateCardTab';
import { CottagesTab, GuestPolicyTab } from './OccupancyTab';
import { DemandTab, LongStayTab, TaxSettingsTab } from './RulesTab';
import { PreviewTab } from './PreviewTab';
import { BlackoutsTab, LastMinuteTab } from './OffersTab';

/**
 * Pricing & booking engine administration (spec §15).
 *
 * Every tariff and rule the engine uses is editable here, so rates change
 * without a code deployment. Edits save as you make them; there is no separate
 * publish step.
 */

const TABS = [
  { id: 'rates', label: 'Rate card' },
  { id: 'special-peak', label: 'Special Peak' },
  { id: 'cottages', label: 'Cottages' },
  { id: 'guests', label: 'Guest policy' },
  { id: 'long-stay', label: 'Long stay' },
  { id: 'offers', label: 'Last-minute offers' },
  { id: 'availability', label: 'Blackout dates' },
  { id: 'demand', label: 'Demand pricing' },
  { id: 'tax', label: 'Tax & settings' },
  { id: 'preview', label: 'Preview' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function PricingAdminPage() {
  const [config, setConfig] = useState<AdminPricingConfig | null>(null);
  const [tab, setTab] = useState<TabId>('rates');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setConfig(await fetchConfig());
    } catch (err: any) {
      setError(err?.message ?? 'Could not load pricing configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(async () => {
    setConfig(await fetchConfig());
  }, []);

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-gold-600" />
              Pricing &amp; Booking Engine
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Seasonal rates, occupancy rules, child policy, long-stay benefits, demand pricing and
              tax. Changes take effect on the next quote — no deployment needed.
            </p>
          </div>
          <button
            onClick={() => load()}
            className="h-9 px-3 rounded-lg border border-border text-sm text-foreground hover:bg-earth-50 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading configuration…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          </div>
        )}

        {config && (
          <>
            <ConfigWarnings config={config} />

            <div className="flex gap-1 overflow-x-auto border-b border-border mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    tab === t.id
                      ? 'border-gold-600 text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'rates' && <RateCardTab config={config} reload={reload} />}
            {tab === 'special-peak' && <SpecialPeakTab config={config} reload={reload} />}
            {tab === 'cottages' && <CottagesTab config={config} reload={reload} />}
            {tab === 'guests' && <GuestPolicyTab config={config} reload={reload} />}
            {tab === 'long-stay' && <LongStayTab config={config} reload={reload} />}
            {tab === 'offers' && <LastMinuteTab config={config} reload={reload} />}
            {tab === 'availability' && <BlackoutsTab config={config} />}
            {tab === 'demand' && <DemandTab config={config} reload={reload} />}
            {tab === 'tax' && <TaxSettingsTab config={config} reload={reload} />}
            {tab === 'preview' && <PreviewTab config={config} />}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Surfaces configuration gaps that would make quotes fail at booking time,
 * rather than letting them be discovered by a guest.
 */
function ConfigWarnings({ config }: { config: AdminPricingConfig }) {
  const warnings: string[] = [];

  if (config.lastMinuteOffers === null || !config.cottageFieldsReady) {
    warnings.push(
      'Database migration 20260923_pricing_engine_v2_1b has not been run: last-minute offers, minimum stay, child limits and the spec cottage mapping are not active yet.'
    );
  }

  const coveredMonths = new Set(
    config.seasons.filter((s) => s.isActive).flatMap((s) => s.months)
  );
  const missingMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter(
    (m) => !coveredMonths.has(m)
  );
  if (missingMonths.length > 0) {
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    warnings.push(
      `No active season covers ${missingMonths.map((m) => names[m - 1]).join(', ')}. Quotes for those dates will fail.`
    );
  }

  const unconfigured = config.cottages.filter((c) => c.isActive && !c.pricingCategory);
  if (unconfigured.length > 0) {
    warnings.push(
      `${unconfigured.map((c) => c.name).join(', ')} ${unconfigured.length === 1 ? 'has' : 'have'} no pricing category and cannot be booked.`
    );
  }

  // Every bookable cottage needs a rate at each occupancy tier in each season.
  const missingRates: string[] = [];
  for (const season of config.seasons.filter((s) => s.isActive)) {
    for (const cottage of config.cottages.filter((c) => c.isActive && c.pricingCategory)) {
      for (let adults = cottage.baseAdults; adults <= cottage.maxAdults; adults++) {
        const has = config.seasonRates.some(
          (r) => r.seasonId === season.id && r.cottageId === cottage.id && r.adults === adults
        );
        if (!has) missingRates.push(`${cottage.name} · ${season.name} · ${adults} adults`);
      }
    }
  }
  if (missingRates.length > 0) {
    warnings.push(
      `${missingRates.length} rate${missingRates.length === 1 ? '' : 's'} missing: ${missingRates.slice(0, 4).join('; ')}${missingRates.length > 4 ? '…' : ''}`
    );
  }

  if (config.taxSlabs.filter((t) => t.isActive).length === 0) {
    warnings.push('No active tax slab — quotes will show zero GST.');
  }

  if (config.breakfastBands.filter((b) => b.isActive).length === 0) {
    warnings.push('No active breakfast band — the Breakfast Included rate plan will fail.');
  }

  if (warnings.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 mb-6">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4" />
        Configuration needs attention
      </p>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-xs text-amber-800 dark:text-amber-300">• {w}</li>
        ))}
      </ul>
    </div>
  );
}
