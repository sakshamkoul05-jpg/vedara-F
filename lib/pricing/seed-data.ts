/**
 * Rate card and rules from "The Vedara — Dynamic Pricing & Booking Engine
 * Specification v2.1" (September 2026).
 *
 * This is SEED data only. Once written to the database every value here is
 * admin-editable; the engine never reads this file at runtime (spec §16).
 *
 * Cottage-to-category mapping
 * ---------------------------
 * Follows spec §1 exactly, as confirmed with the client: Magpie Retreat,
 * Flycatcher Nook and Bulbul Nest are Boutique (max 2 adults, no extra
 * mattress); Whistling Thrush is Premium (bathtub, up to 4 adults); Monal
 * Haven and Koklass Cove are Signature (jacuzzi, up to 4 adults).
 *
 * The Finch Nook is a 7th cottage the spec predates. It is seeded as a Studio
 * tier one step below Boutique, as agreed with the client.
 */

import type { CottageCategory, LastMinuteOfferType, SeasonType } from './types';

export interface SeedCottage {
  slug: string;
  name: string;
  category: CottageCategory;
  baseAdults: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  allowsExtraMattress: boolean;
  maxExtraMattresses: number;
  /** Public descriptor for the cottage cards (spec §12), verbatim. */
  publicDescriptor: string;
}

/**
 * Spec §5.1: "Maximum 2 adults; a child under 12 may share the existing double
 * bed with parents" — so Boutique allows one child, three heads in total.
 * The spec sets no child limit for the four-adult cottages; two is seeded and
 * admin-editable.
 */
export const SEED_COTTAGES: SeedCottage[] = [
  {
    slug: 'magpie-retreat',
    name: 'Magpie Retreat',
    category: 'BOUTIQUE',
    baseAdults: 2,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    allowsExtraMattress: false,
    maxExtraMattresses: 0,
    publicDescriptor: 'Boutique Cottage | 2 Adults',
  },
  {
    slug: 'flycatcher-nook',
    name: 'Flycatcher Nook',
    category: 'BOUTIQUE',
    baseAdults: 2,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    allowsExtraMattress: false,
    maxExtraMattresses: 0,
    publicDescriptor: 'Boutique Cottage | 2 Adults',
  },
  {
    slug: 'bulbul-nest',
    name: 'Bulbul Nest',
    category: 'BOUTIQUE',
    baseAdults: 2,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    allowsExtraMattress: false,
    maxExtraMattresses: 0,
    publicDescriptor: 'Boutique Cottage | 2 Adults',
  },
  {
    slug: 'whistling-thrush',
    name: 'Whistling Thrush',
    category: 'PREMIUM',
    baseAdults: 2,
    maxAdults: 4,
    maxChildren: 2,
    maxOccupancy: 5,
    allowsExtraMattress: true,
    maxExtraMattresses: 1,
    publicDescriptor: 'Premium Cottage | Bathtub | Up to 4 Adults',
  },
  {
    slug: 'monal-haven',
    name: 'Monal Haven',
    category: 'SIGNATURE',
    baseAdults: 2,
    maxAdults: 4,
    maxChildren: 2,
    maxOccupancy: 5,
    allowsExtraMattress: true,
    maxExtraMattresses: 1,
    publicDescriptor: 'Signature Cottage | Jacuzzi | Up to 4 Adults',
  },
  {
    slug: 'koklass-cove',
    name: 'Koklass Cove',
    category: 'SIGNATURE',
    baseAdults: 2,
    maxAdults: 4,
    maxChildren: 2,
    maxOccupancy: 5,
    allowsExtraMattress: true,
    maxExtraMattresses: 1,
    publicDescriptor: 'Signature Cottage | Jacuzzi | Up to 4 Adults',
  },
  {
    slug: 'the-finch-nook',
    name: 'The Finch Nook',
    category: 'STUDIO',
    baseAdults: 2,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    allowsExtraMattress: false,
    maxExtraMattresses: 0,
    publicDescriptor: 'Studio Cottage | 2 Adults',
  },
];

export interface SeedSeason {
  type: SeasonType;
  name: string;
  months: number[];
  minStay: number;
}

/** Spec §5 seasonal bands. December is HIGH, with Special Peak overriding dates. */
export const SEED_SEASONS: SeedSeason[] = [
  { type: 'VALUE', name: 'Value', months: [7, 8], minStay: 1 },
  { type: 'REGULAR', name: 'Regular', months: [2, 3, 9, 11], minStay: 1 },
  { type: 'HIGH', name: 'High', months: [1, 4, 10, 12], minStay: 1 },
  { type: 'PEAK', name: 'Peak', months: [5, 6], minStay: 1 },
];

/** [weekdayRate, weekendRate] per adult-occupancy tier, per season. */
type RateTier = Record<number, [number, number]>;

/**
 * Seasonal rate matrices from spec §5, by category. The Premium row is the
 * spec's "Whistling Thrush" column; Signature is "Monal Haven / Koklass Cove".
 *
 * STUDIO is not in the spec — seeded one step below Boutique, admin-editable.
 */
export const SEED_CATEGORY_RATES: Record<CottageCategory, Record<SeasonType, RateTier>> = {
  STUDIO: {
    VALUE: { 2: [3500, 4500] },
    REGULAR: { 2: [4000, 5000] },
    HIGH: { 2: [4500, 5500] },
    PEAK: { 2: [5000, 6000] },
    SPECIAL_PEAK: { 2: [6000, 6000] },
  },
  BOUTIQUE: {
    VALUE: { 2: [4500, 5500] },
    REGULAR: { 2: [5000, 6000] },
    HIGH: { 2: [5500, 6500] },
    PEAK: { 2: [6000, 7000] },
    SPECIAL_PEAK: { 2: [7000, 7000] },
  },
  PREMIUM: {
    VALUE: { 2: [6500, 7500], 3: [7500, 8500], 4: [8500, 9500] },
    REGULAR: { 2: [7000, 8000], 3: [8000, 9000], 4: [9000, 10000] },
    HIGH: { 2: [7500, 8500], 3: [8500, 9500], 4: [9500, 10500] },
    PEAK: { 2: [8000, 9000], 3: [9000, 10000], 4: [10000, 11000] },
    SPECIAL_PEAK: { 2: [9500, 9500], 3: [10500, 10500], 4: [11500, 11500] },
  },
  SIGNATURE: {
    VALUE: { 2: [7500, 8500], 3: [8500, 9500], 4: [9500, 10500] },
    REGULAR: { 2: [8000, 9000], 3: [9000, 10000], 4: [10000, 11000] },
    HIGH: { 2: [8500, 9500], 3: [9500, 10500], 4: [10500, 11500] },
    PEAK: { 2: [9000, 10000], 3: [10000, 11000], 4: [11000, 12000] },
    SPECIAL_PEAK: { 2: [10500, 10500], 3: [11500, 11500], 4: [12500, 12500] },
  },
};

/** Spec §3.2 breakfast supplements. */
export const SEED_BREAKFAST_BANDS = [
  { label: 'Child 0–5 (complimentary)', minAge: 0, maxAge: 5, pricePerNight: 0 },
  { label: 'Child 6–11', minAge: 6, maxAge: 11, pricePerNight: 250 },
  { label: 'Adult (12+)', minAge: 12, maxAge: 120, pricePerNight: 400 },
];

/** Spec §4 child and bedding policy. */
export const SEED_CHILD_BANDS = [
  { label: 'Child 0–5', minAge: 0, maxAge: 5, chargedAsAdult: false, accommodationCharge: 0 },
  { label: 'Child 6–11', minAge: 6, maxAge: 11, chargedAsAdult: false, accommodationCharge: 0 },
  { label: 'Guest 12+', minAge: 12, maxAge: 120, chargedAsAdult: true, accommodationCharge: 0 },
];

/**
 * Spec §7. Recommended availability: Value and Regular enabled, High
 * admin-controlled, Peak and Special Peak normally disabled.
 */
export const SEED_LONG_STAY_RULE = {
  name: 'Stay 4, Pay 3',
  nightsRequired: 4,
  nightsCharged: 3,
  enabledSeasonTypes: ['VALUE', 'REGULAR'] as SeasonType[],
  cottageIds: [] as string[],
  blackoutDates: [] as string[],
  validFrom: null as string | null,
  validTo: null as string | null,
  stackableWithCoupon: false,
  stackableWithOffers: false,
  isActive: true,
};

/**
 * Spec §9: "If arrival is within 7 days and 2 or fewer cottages are booked,
 * allow an admin-controlled offer ... Initially require admin activation."
 * Seeded switched OFF; an admin turns it on.
 */
export const SEED_LAST_MINUTE_OFFERS: {
  name: string;
  offerType: LastMinuteOfferType;
  value: number;
  daysBeforeArrival: number;
  maxBookedCottages: number;
  stackableWithCoupon: boolean;
  isActive: boolean;
}[] = [
  {
    name: 'Last-minute escape',
    offerType: 'ROOM_DISCOUNT',
    value: 10,
    daysBeforeArrival: 7,
    maxBookedCottages: 2,
    stackableWithCoupon: false,
    isActive: false,
  },
];

/**
 * Spec §8, expressed as booked ratios so the rule adapts to inventory size.
 *
 * The spec's trigger points are 4-of-6 (0.6667) and 5-of-6 (0.8333). The bounds
 * sit just below each so the exact fractions land inside the intended tier
 * rather than on a floating-point boundary.
 */
export const SEED_INVENTORY_TIERS = [
  { minBookedRatio: 0.0, maxBookedRatio: 0.66, upliftPercent: 0 },
  { minBookedRatio: 0.66, maxBookedRatio: 0.83, upliftPercent: 10 },
  { minBookedRatio: 0.83, maxBookedRatio: 1.01, upliftPercent: 20 },
];

/**
 * Indian hotel GST slabs, matched on the per-night room tariff. Spec §14
 * requires the statutory treatment be configurable rather than hard-coded.
 */
export const SEED_TAX_SLABS = [
  { name: 'GST 5%', minTariff: 0, maxTariff: 1000, ratePercent: 5 },
  { name: 'GST 12%', minTariff: 1001, maxTariff: 7500, ratePercent: 12 },
  { name: 'GST 18%', minTariff: 7501, maxTariff: null, ratePercent: 18 },
];

export const SEED_SETTINGS = {
  /** Fri, Sat, Sun (spec §3). */
  weekendDays: [5, 6, 0],
  extraMattressPrice: 1250,
  adultAgeThreshold: 12,
  inventoryPricingEnabled: true,
  inventoryUpliftCeilingPercent: 20,
  longStayEnabled: true,
  minStayNights: 1,
  roundingMode: 'NEAREST_RUPEE' as const,
};
