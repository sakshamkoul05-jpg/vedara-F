/**
 * Types for the Vedara pricing engine.
 *
 * Mirrors "The Vedara — Dynamic Pricing & Booking Engine Specification v2.1".
 * Every rate and rule here arrives as data (see `PricingConfig`); nothing is
 * hard-coded in the engine itself, per spec §16.
 */

export type SeasonType = 'VALUE' | 'REGULAR' | 'HIGH' | 'PEAK' | 'SPECIAL_PEAK';

export type CottageCategory = 'STUDIO' | 'BOUTIQUE' | 'PREMIUM' | 'SIGNATURE';

export type RatePlanCode = 'ROOM_ONLY' | 'BREAKFAST_INCLUDED';

export type LastMinuteOfferType = 'ROOM_DISCOUNT' | 'COMPLIMENTARY_BREAKFAST' | 'MEAL_CREDIT';

/** Engine version stamped onto every pricing snapshot (spec §16). */
export const PRICING_ENGINE_VERSION = '2.1.1';

/** Spec §9 caps the last-minute room discount at 10%. */
export const MAX_LAST_MINUTE_DISCOUNT_PERCENT = 10;

// ---------------------------------------------------------------------------
// Configuration (loaded from the database, editable by admin)
// ---------------------------------------------------------------------------

export interface SeasonDefinition {
  id: string;
  name: string;
  type: SeasonType;
  /** Calendar months (1-12) this season recurs in. Empty for SPECIAL_PEAK. */
  months: number[];
  /** Minimum nights for a stay touching this season (spec §15). */
  minStay: number;
  isActive: boolean;
}

/**
 * One rate row: a cottage, in a season, at a given adult occupancy.
 * `adults` is the occupancy tier — 2, 3 or 4.
 */
export interface SeasonRate {
  seasonId: string;
  cottageId: string;
  adults: number;
  weekdayRate: number;
  weekendRate: number;
}

/** Admin-defined date range that overrides the normal seasonal tariff (spec §6). */
export interface SpecialPeakPeriod {
  id: string;
  name: string;
  /** ISO date (YYYY-MM-DD), inclusive. */
  startDate: string;
  /** ISO date (YYYY-MM-DD), inclusive. */
  endDate: string;
  /** Minimum nights for a stay touching this period (spec §15). */
  minStay: number;
  isActive: boolean;
}

/** Special Peak has a single flat rate — no weekday/weekend split (spec §6). */
export interface SpecialPeakRate {
  periodId: string;
  cottageId: string;
  adults: number;
  rate: number;
}

export interface CottageConfig {
  id: string;
  name: string;
  slug: string;
  category: CottageCategory;
  /** Lowest occupancy tier that has a rate. Always 2 under the current tariff. */
  baseAdults: number;
  maxAdults: number;
  /** Children below the adult age threshold (spec §15). */
  maxChildren: number;
  /** Total heads allowed, adults + children. */
  maxOccupancy: number;
  allowsExtraMattress: boolean;
  /** Per-cottage override; falls back to `PricingSettings.extraMattressPrice`. */
  extraMattressPrice?: number | null;
  maxExtraMattresses: number;
  /** Public descriptor for the cottage cards (spec §12). */
  publicDescriptor?: string | null;
  isActive: boolean;
}

/** Breakfast supplement band, matched on guest age (spec §3.2). */
export interface BreakfastBand {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  pricePerNight: number;
  isActive: boolean;
}

/**
 * Child accommodation band (spec §4). `chargedAsAdult` promotes a guest into
 * the adult occupancy count, which is what drives the 3rd/4th adult increment.
 */
export interface ChildBand {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  chargedAsAdult: boolean;
  /** Accommodation charge when sharing existing bedding. Zero for 0-11. */
  accommodationCharge: number;
  isActive: boolean;
}

/** Stay 4 Pay 3 (spec §7). */
export interface LongStayRule {
  id: string;
  name: string;
  nightsRequired: number;
  /** Number of nights actually charged. `nightsRequired - nightsCharged` are free. */
  nightsCharged: number;
  /** Seasons in which the benefit is available. */
  enabledSeasonTypes: SeasonType[];
  /** Cottage ids the benefit applies to. Empty means all cottages. */
  cottageIds: string[];
  /** ISO dates on which the benefit is suppressed. */
  blackoutDates: string[];
  /** Availability window (spec §7). Null means open-ended. */
  validFrom?: string | null;
  validTo?: string | null;
  /** Whether the benefit may combine with a coupon. */
  stackableWithCoupon: boolean;
  /** Whether the benefit may combine with a last-minute room discount. */
  stackableWithOffers?: boolean;
  isActive: boolean;
}

/** Low-occupancy / last-minute offer (spec §9). */
export interface LastMinuteOffer {
  id: string;
  name: string;
  offerType: LastMinuteOfferType;
  /** ROOM_DISCOUNT: percent (max 10). MEAL_CREDIT: rupees per stay. */
  value: number;
  /** Offer applies when arrival is within this many days of today. */
  daysBeforeArrival: number;
  /** ...and no night of the stay has more than this many cottages booked. */
  maxBookedCottages: number;
  /** Empty means all cottages. */
  cottageIds: string[];
  stackableWithCoupon: boolean;
  isActive: boolean;
}

/**
 * Inventory-based uplift tier (spec §8), expressed as a ratio of cottages
 * booked so it adapts to changing inventory size.
 */
export interface InventoryTier {
  id: string;
  /** Inclusive lower bound of booked ratio, 0-1. */
  minBookedRatio: number;
  /** Exclusive upper bound of booked ratio, 0-1. Use 1.01 to include "all booked". */
  maxBookedRatio: number;
  upliftPercent: number;
  isActive: boolean;
}

/** GST slab, matched on the per-night room tariff (spec §14). */
export interface TaxSlab {
  id: string;
  name: string;
  /** Inclusive lower bound of the per-night tariff. */
  minTariff: number;
  /** Inclusive upper bound; null means unbounded. */
  maxTariff: number | null;
  ratePercent: number;
  isActive: boolean;
}

export interface PricingSettings {
  /** Days of the week counted as weekend. 0=Sun … 6=Sat. Spec §3: Fri, Sat, Sun. */
  weekendDays: number[];
  extraMattressPrice: number;
  /** Age at and above which a guest is treated as an adult (spec §4). */
  adultAgeThreshold: number;
  inventoryPricingEnabled: boolean;
  /** Maximum uplift the inventory rule may apply, percent (spec §8). */
  inventoryUpliftCeilingPercent: number;
  longStayEnabled: boolean;
  /** Global minimum stay floor in nights (spec §15). */
  minStayNights: number;
  /** Rounding applied to the final payable amount. */
  roundingMode: 'NONE' | 'NEAREST_RUPEE' | 'NEAREST_TEN';
}

export interface PricingConfig {
  seasons: SeasonDefinition[];
  seasonRates: SeasonRate[];
  specialPeakPeriods: SpecialPeakPeriod[];
  specialPeakRates: SpecialPeakRate[];
  cottages: CottageConfig[];
  breakfastBands: BreakfastBand[];
  childBands: ChildBand[];
  longStayRules: LongStayRule[];
  lastMinuteOffers: LastMinuteOffer[];
  inventoryTiers: InventoryTier[];
  taxSlabs: TaxSlab[];
  settings: PricingSettings;
}

// ---------------------------------------------------------------------------
// Request / response
// ---------------------------------------------------------------------------

export interface InventoryCount {
  booked: number;
  total: number;
}

export interface CouponInput {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  /** Accommodation subtotal the coupon requires before it applies. */
  minAmount?: number;
}

export interface QuoteRequest {
  cottageId: string;
  /** ISO date (YYYY-MM-DD). */
  checkIn: string;
  /** ISO date (YYYY-MM-DD). Not charged — checkout day (spec §3). */
  checkOut: string;
  adults: number;
  /** Age of each child. Length is the child count (spec §11). */
  childAges: number[];
  ratePlan: RatePlanCode;
  extraMattresses?: number;
  /**
   * Cottages booked vs available, per night (ISO date keys). Drives the
   * inventory uplift (spec §8) and the last-minute offer (spec §9) night by
   * night, since "4 of 6 booked" is a statement about a specific date.
   */
  inventoryByNight?: Record<string, InventoryCount>;
  /** Whole-stay fallback when per-night data is not supplied. */
  inventory?: InventoryCount;
  coupon?: CouponInput | null;
  /** ISO date treated as "today" for the last-minute window. Defaults to now. */
  today?: string;
}

export interface NightBreakdown {
  /** ISO date of the night. */
  date: string;
  seasonType: SeasonType;
  seasonName: string;
  isWeekend: boolean;
  /** Room rate before any uplift or discount. */
  baseRate: number;
  /** Uplift applied for inventory pressure. */
  inventoryUplift: number;
  /** Room rate actually charged for this night, before long-stay benefit. */
  roomRate: number;
  /** True when this night is the complimentary one under Stay 4 Pay 3. */
  isComplimentary: boolean;
  breakfastTotal: number;
  mattressTotal: number;
}

export interface AppliedOffer {
  id: string;
  name: string;
  offerType: LastMinuteOfferType;
  /** Rupees taken off the price. Zero for a pure perk. */
  discount: number;
  /** Customer-facing description, e.g. "₹1,500 meal credit at The Perch". */
  description: string;
}

export interface QuoteBreakdown {
  engineVersion: string;
  cottageId: string;
  cottageName: string;
  ratePlan: RatePlanCode;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  childAges: number[];
  /** Children promoted to adults by the 12+ rule, already folded into `adults`. */
  billableAdults: number;
  extraMattresses: number;

  perNight: NightBreakdown[];

  /** Room charges for every night, before the long-stay benefit. */
  accommodationBeforeBenefit: number;
  longStayDiscount: number;
  longStayApplied: boolean;
  longStayRuleName: string | null;
  /** Last-minute room discount (spec §9). */
  promotionDiscount: number;
  lastMinuteOffer: AppliedOffer | null;
  /** Accommodation after long-stay, promotion and coupon. */
  accommodationTotal: number;

  breakfastTotal: number;
  mattressTotal: number;

  couponCode: string | null;
  couponDiscount: number;

  subtotal: number;
  taxBreakdown: { slabName: string; ratePercent: number; taxableAmount: number; tax: number }[];
  taxTotal: number;
  total: number;

  /** Minimum stay that applied to these dates. */
  minStay: number;

  notes: string[];
}

export class PricingError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'PricingError';
    this.code = code;
  }
}
