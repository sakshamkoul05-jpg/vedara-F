'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { MAX_COMPARE, useCompareStore } from '@/store/compare';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/provider';
import type { MessageKey } from '@/lib/i18n/dictionary';
import type { PublicCottagePricing } from '@/lib/from-rates';
import { Check, Minus, X, Scale, ArrowRight } from 'lucide-react';

/**
 * Side-by-side comparison of the cottages a guest has ticked.
 *
 * Reads the live cottage rows the page already holds rather than a stored copy,
 * so a rate or description change shows up immediately.
 */

const TIER_KEY: Record<string, MessageKey> = {
  BOUTIQUE: 'tier.boutique',
  PREMIUM: 'tier.premium',
  SIGNATURE: 'tier.signature',
  STUDIO: 'tier.studio',
};

/** Amenity keys are stored lower case and hyphenated; these read better. */
const prettyAmenity = (raw: string) =>
  raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const asList = (value: string[] | string | undefined | null): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
  }
  return [];
};

/** Translate an interface key. Rows are module-level, so this is passed in. */
type Translate = (key: MessageKey) => string;

type Row = {
  labelKey: MessageKey;
  /** Rendered per cottage. Returning null prints an em dash. */
  value: (cottage: any, pub: PublicCottagePricing | undefined, t: Translate) => React.ReactNode;
};

const ROWS: Row[] = [
  {
    labelKey: 'stay.tier',
    value: (cottage, pub, t) => {
      const tier = pub?.category ?? cottage.pricingCategory;
      if (!tier) return null;
      const key = TIER_KEY[tier];
      return <Badge variant="secondary" size="sm">{key ? t(key) : tier}</Badge>;
    },
  },
  {
    labelKey: 'stay.sleeps',
    value: (cottage, pub, t) =>
      pub ? `${pub.maxAdults} ${t('stay.adults')}` : `${cottage.capacity} ${t('stay.guests')}`,
  },
  { labelKey: 'stay.bedrooms', value: (cottage) => cottage.bedrooms ?? null },
  { labelKey: 'stay.bathrooms', value: (cottage) => cottage.bathrooms ?? null },
  { labelKey: 'stay.size', value: (cottage) => (cottage.size ? `${cottage.size} sqft` : null) },
  {
    labelKey: 'stay.extraMattress',
    value: (cottage, pub, t) => {
      const allowed = pub?.allowsExtraMattress ?? cottage.allowsExtraMattress;
      if (!allowed) return <Minus className="w-4 h-4 text-muted-foreground" aria-label={t('stay.notAvailable')} />;
      const price = pub?.extraMattressPrice ?? cottage.extraMattressPrice;
      return price
        ? `${formatPrice(price)}/${t('stay.night')}`
        : <Check className="w-4 h-4 text-primary" aria-label={t('stay.available')} />;
    },
  },
];

function ComparisonTable({
  cottages,
  publicMap,
  fromRates,
  onRemove,
}: {
  cottages: any[];
  publicMap: Record<string, PublicCottagePricing>;
  fromRates: Record<string, number>;
  onRemove: (id: string) => void;
}) {
  const { t, td } = useLanguage();

  const pubFor = (cottage: any) => publicMap[cottage.id] ?? publicMap[cottage.slug];

  // The union across the selected cottages, so a row exists for anything at
  // least one of them has — which is what makes the gaps meaningful.
  const amenities = useMemo(() => {
    const seen = new Map<string, string>();
    for (const cottage of cottages) {
      for (const amenity of asList(cottage.amenities)) {
        const key = amenity.trim().toLowerCase();
        if (key && !seen.has(key)) seen.set(key, prettyAmenity(amenity.trim()));
      }
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [cottages]);

  const cellClass = 'px-3 py-3 align-top text-sm text-foreground';
  const labelClass = 'px-3 py-3 text-sm text-muted-foreground whitespace-nowrap sticky left-0 bg-background z-10';

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full border-collapse min-w-[520px]">
        <thead>
          <tr>
            <th className={`${labelClass} text-left font-normal`} />
            {cottages.map((cottage) => {
              const pub = pubFor(cottage);
              const rate = fromRates[cottage.id] ?? fromRates[cottage.slug] ?? pub?.fromRate ?? cottage.pricePerNight;
              return (
                <th key={cottage.id} className="px-3 py-3 text-left align-top min-w-[150px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-serif text-base text-foreground leading-tight">{cottage.name}</p>
                      <p className="text-gold-600 dark:text-gold-400 font-semibold text-sm mt-1">
                        <span className="text-[11px] font-normal text-muted-foreground">{t('stay.from')} </span>
                        {formatPrice(rate)}
                        <span className="text-[11px] font-normal text-muted-foreground">/{t('stay.night')}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(cottage.id)}
                      aria-label={`Remove ${cottage.name} from comparison`}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.labelKey} className="border-t border-border">
              <td className={labelClass}>{t(row.labelKey)}</td>
              {cottages.map((cottage) => (
                <td key={cottage.id} className={cellClass}>
                  {row.value(cottage, pubFor(cottage), t) ?? <span className="text-muted-foreground">—</span>}
                </td>
              ))}
            </tr>
          ))}

          {amenities.length > 0 && (
            <tr className="border-t border-border">
              <td colSpan={cottages.length + 1} className="px-3 pt-5 pb-1">
                <p className="text-xs uppercase tracking-wider text-gold-600 dark:text-gold-400">{t('stay.amenities')}</p>
              </td>
            </tr>
          )}
          {amenities.map(([key, label]) => (
            <tr key={key} className="border-t border-border">
              <td className={labelClass}>{td(label)}</td>
              {cottages.map((cottage) => {
                const has = asList(cottage.amenities).some((a) => a.trim().toLowerCase() === key);
                return (
                  <td key={cottage.id} className={cellClass}>
                    {has ? (
                      <Check className="w-4 h-4 text-primary" aria-label={t('stay.available')} />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" aria-label={t('stay.notAvailable')} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr className="border-t border-border">
            <td className={labelClass} />
            {cottages.map((cottage) => (
              <td key={cottage.id} className="px-3 py-4">
                <Link
                  href={`/cottages/slug/${cottage.slug}`}
                  className="text-gold-600 dark:text-gold-400 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  {t('action.viewDetails')} <ArrowRight className="w-3 h-3" />
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function CompareTray({
  cottages,
  publicMap,
  fromRates,
}: {
  cottages: any[];
  publicMap: Record<string, PublicCottagePricing>;
  fromRates: Record<string, number>;
}) {
  const { ids, remove, clear } = useCompareStore();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  // A stored id whose cottage is no longer on the page — deactivated, or the
  // list filtered by party size — simply does not appear.
  const selected = useMemo(
    () => ids.map((id) => cottages.find((c: any) => c.id === id)).filter(Boolean),
    [ids, cottages]
  );

  const handleRemove = (id: string) => {
    remove(id);
    // Closing on the way to an empty table avoids a dialog with nothing in it.
    if (selected.length <= 1) setOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-3xl mx-auto glass-card-light rounded-2xl shadow-lg border border-border p-3 flex flex-wrap items-center gap-3">
              <Scale className="w-4 h-4 text-gold-500 shrink-0 ml-1" />
              <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                {selected.map((cottage: any) => (
                  <span
                    key={cottage.id}
                    className="inline-flex items-center gap-1.5 bg-earth-100 dark:bg-earth-900/40 rounded-full pl-3 pr-1.5 py-1 text-xs text-foreground"
                  >
                    {cottage.name}
                    <button
                      type="button"
                      onClick={() => remove(cottage.id)}
                      aria-label={`Remove ${cottage.name} from comparison`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  {t('action.clear')}
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setOpen(true)}
                  disabled={selected.length < 2}
                >
                  {selected.length < 2 ? t('compare.pickOneMore') : `${t('action.compare')} ${selected.length}`}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{t('compare.title')}</DialogTitle>
            <DialogDescription>
              Side by side, up to {MAX_COMPARE} at a time. Rates shown are the lowest for each cottage
              before GST; your dates and party size decide the final price.
            </DialogDescription>
          </DialogHeader>
          {selected.length > 0 && (
            <ComparisonTable
              cottages={selected}
              publicMap={publicMap}
              fromRates={fromRates}
              onRemove={handleRemove}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** The tick a cottage card carries to add itself to the comparison. */
export function CompareToggle({ cottageId, name }: { cottageId: string; name: string }) {
  const { ids, toggle } = useCompareStore();
  const { t } = useLanguage();
  const selected = ids.includes(cottageId);
  const full = ids.length >= MAX_COMPARE;

  return (
    <button
      type="button"
      // The card is a link, so the tick must not navigate.
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(cottageId); }}
      disabled={!selected && full}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${name} from comparison` : `Add ${name} to comparison`}
      title={!selected && full ? `${t('compare.comparing')} ${MAX_COMPARE} — ${t('compare.full')}` : undefined}
      className={`absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors ${
        selected
          ? 'bg-primary text-primary-foreground'
          : full
            ? 'bg-black/40 text-white/50 cursor-not-allowed'
            : 'bg-black/40 text-white hover:bg-black/60'
      }`}
    >
      {selected ? <Check className="w-3 h-3" /> : <Scale className="w-3 h-3" />}
      {selected ? t('compare.comparing') : t('action.compare')}
    </button>
  );
}
