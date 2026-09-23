/**
 * Loads the pricing configuration from the database.
 *
 * Every rate and rule the engine uses comes from here, so an admin rate change
 * takes effect without a deployment (spec §16).
 *
 * The loader tolerates columns and tables from a newer migration being absent,
 * so code can ship before its SQL runs without taking bookings down: missing
 * values fall back to the documented defaults.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BreakfastBand,
  ChildBand,
  CottageConfig,
  InventoryCount,
  InventoryTier,
  LastMinuteOffer,
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
import { occupiedNightDates } from './engine';

/** Cached for the lifetime of a serverless invocation to avoid refetching per request. */
let cache: { config: PricingConfig; at: number } | null = null;
const CACHE_TTL_MS = 60_000;

/** Booking statuses that hold a cottage. */
export const ACTIVE_BOOKING_STATUSES = ['PENDING', 'RESERVED', 'CONFIRMED', 'CHECKED_IN'];

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

function dateOnly(v: unknown): string | null {
  return v ? String(v).slice(0, 10) : null;
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
    offersRes,
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
    // Added in migration 20260923; treated as empty until that SQL has run.
    supabase.from('LastMinuteOffer').select('*'),
    supabase.from('InventoryTier').select('*').order('minBookedRatio'),
    supabase.from('TaxSlab').select('*').order('minTariff'),
    supabase.from('PricingSetting').select('*'),
  ]);

  const firstError = [seasonsRes, seasonRatesRes, cottagesRes, breakfastRes, childRes, taxRes].find(
    (r) => r.error
  );
  if (firstError?.error) {
    throw new Error(`Failed to load pricing configuration: ${firstError.error.message}`);
  }

  const seasons: SeasonDefinition[] = (seasonsRes.data ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    months: asArray<number>(s.months),
    minStay: Number(s.minStay ?? 1) || 1,
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
    minStay: Number(p.minStay ?? 1) || 1,
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
      maxChildren: c.maxChildren ?? 2,
      maxOccupancy: c.maxOccupancy ?? 3,
      allowsExtraMattress: Boolean(c.allowsExtraMattress),
      extraMattressPrice: c.extraMattressPrice ?? null,
      maxExtraMattresses: c.maxExtraMattresses ?? 0,
      publicDescriptor: c.publicDescriptor ?? null,
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
    validFrom: dateOnly(r.validFrom),
    validTo: dateOnly(r.validTo),
    stackableWithCoupon: Boolean(r.stackableWithCoupon),
    stackableWithOffers: Boolean(r.stackableWithOffers),
    isActive: r.isActive,
  }));

  const lastMinuteOffers: LastMinuteOffer[] = offersRes.error
    ? []
    : (offersRes.data ?? []).map((o: any) => ({
        id: o.id,
        name: o.name,
        offerType: o.offerType,
        value: Number(o.value ?? 0),
        daysBeforeArrival: Number(o.daysBeforeArrival ?? 7),
        maxBookedCottages: Number(o.maxBookedCottages ?? 2),
        cottageIds: asArray<string>(o.cottageIds),
        stackableWithCoupon: Boolean(o.stackableWithCoupon),
        isActive: Boolean(o.isActive),
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
  const bool = (v: unknown, d: boolean) => (v === undefined ? d : Boolean(v));
  const settings: PricingSettings = {
    weekendDays: asArray<number>(raw.weekendDays, SEED_SETTINGS.weekendDays),
    extraMattressPrice: Number(raw.extraMattressPrice ?? SEED_SETTINGS.extraMattressPrice),
    adultAgeThreshold: Number(raw.adultAgeThreshold ?? SEED_SETTINGS.adultAgeThreshold),
    inventoryPricingEnabled: bool(raw.inventoryPricingEnabled, SEED_SETTINGS.inventoryPricingEnabled),
    inventoryUpliftCeilingPercent: Number(
      raw.inventoryUpliftCeilingPercent ?? SEED_SETTINGS.inventoryUpliftCeilingPercent
    ),
    longStayEnabled: bool(raw.longStayEnabled, SEED_SETTINGS.longStayEnabled),
    minStayNights: Number(raw.minStayNights ?? SEED_SETTINGS.minStayNights) || 1,
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
    lastMinuteOffers,
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

export interface InventoryPressure {
  /** Booked vs sellable cottages for each night of the stay (spec §8, §9). */
  byNight: Record<string, InventoryCount>;
  /** Cottages that cannot be sold for at least one night of the range. */
  unavailableCottageIds: string[];
  /** Cottages blocked (stop-sell / maintenance) on at least one night. */
  blockedCottageIds: string[];
}

/**
 * Measures inventory for each night of a stay.
 *
 * - An unpaid booking whose reservation hold has lapsed no longer holds the
 *   cottage, so it neither blocks availability nor inflates the demand uplift.
 * - A blackout / stop-sell date removes that cottage from the night's sellable
 *   inventory rather than counting as a sale — "4 of 6 booked" is about
 *   bookings, not maintenance.
 */
export async function loadInventoryPressure(
  supabase: SupabaseClient,
  checkIn: string,
  checkOut: string,
  cottages: { id: string; isActive: boolean }[]
): Promise<InventoryPressure> {
  const nowIso = new Date().toISOString();
  const nights = occupiedNightDates(checkIn, checkOut);

  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from('Booking')
      .select('cottageId, checkIn, checkOut, status, holdExpiresAt')
      .in('status', ACTIVE_BOOKING_STATUSES)
      .lt('checkIn', checkOut)
      .gt('checkOut', checkIn)
      .or(`status.neq.PENDING,holdExpiresAt.is.null,holdExpiresAt.gt.${nowIso}`),
    supabase.from('BlockedDate').select('cottageId, date').gte('date', checkIn).lt('date', checkOut),
  ]);

  if (bookingsRes.error) throw new Error(`Failed to load bookings: ${bookingsRes.error.message}`);

  const sellable = cottages.filter((c) => c.isActive).map((c) => c.id);
  const sellableSet = new Set(sellable);

  const bookings = (bookingsRes.data ?? []).map((b: any) => ({
    cottageId: b.cottageId as string,
    from: String(b.checkIn).slice(0, 10),
    to: String(b.checkOut).slice(0, 10),
  }));
  const blocked = (blockedRes.data ?? []).map((b: any) => ({
    cottageId: b.cottageId as string,
    date: String(b.date).slice(0, 10),
  }));

  const byNight: Record<string, InventoryCount> = {};
  const unavailable = new Set<string>();
  const blockedAny = new Set<string>();

  for (const night of nights) {
    const blockedTonight = new Set(
      blocked.filter((b) => b.date === night && sellableSet.has(b.cottageId)).map((b) => b.cottageId)
    );
    const bookedTonight = new Set(
      bookings
        .filter((b) => b.from <= night && night < b.to && sellableSet.has(b.cottageId))
        .map((b) => b.cottageId)
    );
    for (const id of blockedTonight) {
      bookedTonight.delete(id);
      unavailable.add(id);
      blockedAny.add(id);
    }
    for (const id of bookedTonight) unavailable.add(id);

    byNight[night] = {
      booked: bookedTonight.size,
      total: Math.max(0, sellable.length - blockedTonight.size),
    };
  }

  return {
    byNight,
    unavailableCottageIds: Array.from(unavailable),
    blockedCottageIds: Array.from(blockedAny),
  };
}

/** Today's date in India, where the property is, for the last-minute window. */
export function todayInIndia(): string {
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}
