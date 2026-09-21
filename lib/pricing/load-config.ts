/**
 * Loads the pricing configuration from the database.
 *
 * Every rate and rule the engine uses comes from here, so an admin rate change
 * takes effect without a deployment (spec §16).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BreakfastBand,
  ChildBand,
  CottageConfig,
  InventoryTier,
  LongStayRule,
  PricingConfig,
  PricingSettings,
  SeasonDefinition,
  SeasonRate,
  SpecialPeakPeriod,
  SpecialPeakRate,
  TaxSlab,
} from './types';
import { SEED_SETTINGS } from './seed-data';

/** Cached for the lifetime of a serverless invocation to avoid refetching per request. */
let cache: { config: PricingConfig; at: number } | null = null;
const CACHE_TTL_MS = 60_000;

function asArray<T>(v: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export async function loadPricingConfig(
  supabase: SupabaseClient,
  options: { force?: boolean } = {}
): Promise<PricingConfig> {
  if (!options.force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.config;
  }

  const [
    seasonsRes,
    seasonRatesRes,
    periodsRes,
    peakRatesRes,
    cottagesRes,
    breakfastRes,
    childRes,
    longStayRes,
    inventoryRes,
    taxRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from('Season').select('*').order('sortOrder'),
    supabase.from('SeasonRate').select('*'),
    supabase.from('SpecialPeakPeriod').select('*').eq('isActive', true),
    supabase.from('SpecialPeakRate').select('*'),
    supabase.from('Cottage').select('*').order('sortOrder'),
    supabase.from('BreakfastBand').select('*').order('minAge'),
    supabase.from('ChildBand').select('*').order('minAge'),
    supabase.from('LongStayRule').select('*'),
    supabase.from('InventoryTier').select('*').order('minBookedRatio'),
    supabase.from('TaxSlab').select('*').order('minTariff'),
    supabase.from('PricingSetting').select('*'),
  ]);

  const firstError = [
    seasonsRes,
    seasonRatesRes,
    cottagesRes,
    breakfastRes,
    childRes,
    taxRes,
  ].find((r) => r.error);
  if (firstError?.error) {
    throw new Error(`Failed to load pricing configuration: ${firstError.error.message}`);
  }

  const seasons: SeasonDefinition[] = (seasonsRes.data ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    months: asArray<number>(s.months),
    isActive: s.isActive,
  }));

  const seasonRates: SeasonRate[] = (seasonRatesRes.data ?? []).map((r: any) => ({
    seasonId: r.seasonId,
    cottageId: r.cottageId,
    adults: r.adults,
    weekdayRate: r.weekdayRate,
    weekendRate: r.weekendRate,
  }));

  const specialPeakPeriods: SpecialPeakPeriod[] = (periodsRes.data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    startDate: String(p.startDate).slice(0, 10),
    endDate: String(p.endDate).slice(0, 10),
    isActive: p.isActive,
  }));

  const specialPeakRates: SpecialPeakRate[] = (peakRatesRes.data ?? []).map((r: any) => ({
    periodId: r.periodId,
    cottageId: r.cottageId,
    adults: r.adults,
    rate: r.rate,
  }));

  const cottages: CottageConfig[] = (cottagesRes.data ?? [])
    // A cottage without a pricing category has not been configured for the
    // engine yet; including it would throw NO_RATE on every quote.
    .filter((c: any) => Boolean(c.pricingCategory))
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      category: c.pricingCategory,
      baseAdults: c.baseAdults ?? 2,
      maxAdults: c.maxAdults ?? 2,
      maxOccupancy: c.maxOccupancy ?? 3,
      allowsExtraMattress: Boolean(c.allowsExtraMattress),
      extraMattressPrice: c.extraMattressPrice ?? null,
      maxExtraMattresses: c.maxExtraMattresses ?? 0,
      isActive: c.isActive,
    }));

  const breakfastBands: BreakfastBand[] = (breakfastRes.data ?? []).map((b: any) => ({
    id: b.id,
    label: b.label,
    minAge: b.minAge,
    maxAge: b.maxAge,
    pricePerNight: b.pricePerNight,
    isActive: b.isActive,
  }));

  const childBands: ChildBand[] = (childRes.data ?? []).map((b: any) => ({
    id: b.id,
    label: b.label,
    minAge: b.minAge,
    maxAge: b.maxAge,
    chargedAsAdult: b.chargedAsAdult,
    accommodationCharge: b.accommodationCharge,
    isActive: b.isActive,
  }));

  const longStayRules: LongStayRule[] = (longStayRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    nightsRequired: r.nightsRequired,
    nightsCharged: r.nightsCharged,
    enabledSeasonTypes: asArray(r.enabledSeasonTypes),
    cottageIds: asArray<string>(r.cottageIds),
    blackoutDates: asArray<string>(r.blackoutDates),
    stackableWithCoupon: r.stackableWithCoupon,
    isActive: r.isActive,
  }));

  const inventoryTiers: InventoryTier[] = (inventoryRes.data ?? []).map((t: any) => ({
    id: t.id,
    minBookedRatio: t.minBookedRatio,
    maxBookedRatio: t.maxBookedRatio,
    upliftPercent: t.upliftPercent,
    isActive: t.isActive,
  }));

  const taxSlabs: TaxSlab[] = (taxRes.data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    minTariff: t.minTariff,
    maxTariff: t.maxTariff,
    ratePercent: t.ratePercent,
    isActive: t.isActive,
  }));

  // Settings fall back to the seeded defaults so a missing row degrades to the
  // documented behaviour rather than undefined.
  const raw: Record<string, unknown> = {};
  for (const row of settingsRes.data ?? []) {
    raw[(row as any).key] = (row as any).value;
  }
  const settings: PricingSettings = {
    weekendDays: asArray<number>(raw.weekendDays, SEED_SETTINGS.weekendDays),
    extraMattressPrice: Number(raw.extraMattressPrice ?? SEED_SETTINGS.extraMattressPrice),
    adultAgeThreshold: Number(raw.adultAgeThreshold ?? SEED_SETTINGS.adultAgeThreshold),
    inventoryPricingEnabled:
      raw.inventoryPricingEnabled === undefined
        ? SEED_SETTINGS.inventoryPricingEnabled
        : Boolean(raw.inventoryPricingEnabled),
    inventoryUpliftCeilingPercent: Number(
      raw.inventoryUpliftCeilingPercent ?? SEED_SETTINGS.inventoryUpliftCeilingPercent
    ),
    longStayEnabled:
      raw.longStayEnabled === undefined
        ? SEED_SETTINGS.longStayEnabled
        : Boolean(raw.longStayEnabled),
    roundingMode: (raw.roundingMode as PricingSettings['roundingMode']) ?? SEED_SETTINGS.roundingMode,
  };

  const config: PricingConfig = {
    seasons,
    seasonRates,
    specialPeakPeriods,
    specialPeakRates,
    cottages,
    breakfastBands,
    childBands,
    longStayRules,
    inventoryTiers,
    taxSlabs,
    settings,
  };

  cache = { config, at: Date.now() };
  return config;
}

/** Drops the cache so an admin rate change is visible on the next request. */
export function invalidatePricingConfig(): void {
  cache = null;
}

/**
 * Counts how many cottages are already taken for a date range, which drives the
 * inventory uplift (spec §8).
 */
export async function loadInventoryPressure(
  supabase: SupabaseClient,
  checkIn: string,
  checkOut: string
): Promise<{ booked: number; total: number; bookedCottageIds: string[] }> {
  const [cottagesRes, bookingsRes, blockedRes] = await Promise.all([
    supabase.from('Cottage').select('id').eq('isActive', true),
    supabase
      .from('Booking')
      .select('cottageId')
      .in('status', ['PENDING', 'RESERVED', 'CONFIRMED', 'CHECKED_IN'])
      .lt('checkIn', checkOut)
      .gt('checkOut', checkIn),
    supabase.from('BlockedDate').select('cottageId').gte('date', checkIn).lt('date', checkOut),
  ]);

  const total = (cottagesRes.data ?? []).length;
  const taken = new Set<string>();
  for (const b of bookingsRes.data ?? []) taken.add((b as any).cottageId);
  for (const b of blockedRes.data ?? []) taken.add((b as any).cottageId);

  return { booked: taken.size, total, bookedCottageIds: Array.from(taken) };
}
