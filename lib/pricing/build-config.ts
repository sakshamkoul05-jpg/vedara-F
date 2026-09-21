/**
 * Builds a `PricingConfig` from the seed rate card.
 *
 * Used by the database seeder and by the engine tests, so both exercise exactly
 * the same numbers as the spec. At runtime the app loads its config from the
 * database instead (see `loadPricingConfig`).
 */

import {
  SEED_BREAKFAST_BANDS,
  SEED_CATEGORY_RATES,
  SEED_CHILD_BANDS,
  SEED_COTTAGES,
  SEED_INVENTORY_TIERS,
  SEED_LONG_STAY_RULE,
  SEED_SEASONS,
  SEED_SETTINGS,
  SEED_TAX_SLABS,
} from './seed-data';
import type {
  CottageConfig,
  PricingConfig,
  SeasonRate,
  SpecialPeakPeriod,
  SpecialPeakRate,
} from './types';

/** Maps cottage slug -> database id. */
export type CottageIdMap = Record<string, string>;

export function buildSeedConfig(
  idMap?: CottageIdMap,
  specialPeak?: { periods: SpecialPeakPeriod[] }
): PricingConfig {
  const idFor = (slug: string) => idMap?.[slug] ?? slug;

  const cottages: CottageConfig[] = SEED_COTTAGES.map((c) => ({
    id: idFor(c.slug),
    name: c.name,
    slug: c.slug,
    category: c.category,
    baseAdults: c.baseAdults,
    maxAdults: c.maxAdults,
    maxOccupancy: c.maxOccupancy,
    allowsExtraMattress: c.allowsExtraMattress,
    extraMattressPrice: null,
    maxExtraMattresses: c.maxExtraMattresses,
    isActive: true,
  }));

  const seasons = SEED_SEASONS.map((s) => ({
    id: `season-${s.type.toLowerCase()}`,
    name: s.name,
    type: s.type,
    months: s.months,
    isActive: true,
  }));

  const seasonRates: SeasonRate[] = [];
  for (const season of seasons) {
    for (const cottage of SEED_COTTAGES) {
      const tiers = SEED_CATEGORY_RATES[cottage.category][season.type];
      for (const [adults, [weekdayRate, weekendRate]] of Object.entries(tiers)) {
        seasonRates.push({
          seasonId: season.id,
          cottageId: idFor(cottage.slug),
          adults: Number(adults),
          weekdayRate,
          weekendRate,
        });
      }
    }
  }

  const periods = specialPeak?.periods ?? [];
  const specialPeakRates: SpecialPeakRate[] = [];
  for (const period of periods) {
    for (const cottage of SEED_COTTAGES) {
      const tiers = SEED_CATEGORY_RATES[cottage.category].SPECIAL_PEAK;
      for (const [adults, [rate]] of Object.entries(tiers)) {
        specialPeakRates.push({
          periodId: period.id,
          cottageId: idFor(cottage.slug),
          adults: Number(adults),
          rate,
        });
      }
    }
  }

  return {
    seasons,
    seasonRates,
    specialPeakPeriods: periods,
    specialPeakRates,
    cottages,
    breakfastBands: SEED_BREAKFAST_BANDS.map((b, i) => ({
      id: `bf-${i}`,
      ...b,
      isActive: true,
    })),
    childBands: SEED_CHILD_BANDS.map((b, i) => ({ id: `child-${i}`, ...b, isActive: true })),
    longStayRules: [{ id: 'long-stay-1', ...SEED_LONG_STAY_RULE }],
    inventoryTiers: SEED_INVENTORY_TIERS.map((t, i) => ({
      id: `inv-${i}`,
      ...t,
      isActive: true,
    })),
    taxSlabs: SEED_TAX_SLABS.map((t, i) => ({ id: `tax-${i}`, ...t, isActive: true })),
    settings: { ...SEED_SETTINGS },
  };
}
