/** Shapes returned by GET /api/admin/pricing/config. */

export type SeasonType = 'VALUE' | 'REGULAR' | 'HIGH' | 'PEAK' | 'SPECIAL_PEAK';
export type CottageCategory = 'STUDIO' | 'BOUTIQUE' | 'PREMIUM' | 'SIGNATURE';

export interface AdminCottage {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  pricingCategory: CottageCategory | null;
  baseAdults: number;
  maxAdults: number;
  maxOccupancy: number;
  allowsExtraMattress: boolean;
  extraMattressPrice: number | null;
  maxExtraMattresses: number;
  publicDescriptor: string | null;
}

export interface AdminSeason {
  id: string;
  name: string;
  type: SeasonType;
  months: number[];
  isActive: boolean;
  sortOrder: number;
}

export interface AdminSeasonRate {
  id: string;
  seasonId: string;
  cottageId: string;
  adults: number;
  weekdayRate: number;
  weekendRate: number;
}

export interface AdminSpecialPeakPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AdminSpecialPeakRate {
  id: string;
  periodId: string;
  cottageId: string;
  adults: number;
  rate: number;
}

export interface AdminBreakfastBand {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  pricePerNight: number;
  isActive: boolean;
}

export interface AdminChildBand {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
  chargedAsAdult: boolean;
  accommodationCharge: number;
  isActive: boolean;
}

export interface AdminLongStayRule {
  id: string;
  name: string;
  nightsRequired: number;
  nightsCharged: number;
  enabledSeasonTypes: SeasonType[];
  cottageIds: string[];
  blackoutDates: string[];
  stackableWithCoupon: boolean;
  isActive: boolean;
}

export interface AdminInventoryTier {
  id: string;
  minBookedRatio: number;
  maxBookedRatio: number;
  upliftPercent: number;
  isActive: boolean;
}

export interface AdminTaxSlab {
  id: string;
  name: string;
  minTariff: number;
  maxTariff: number | null;
  ratePercent: number;
  isActive: boolean;
}

export interface AdminPricingSettings {
  weekendDays: number[];
  extraMattressPrice: number;
  adultAgeThreshold: number;
  inventoryPricingEnabled: boolean;
  inventoryUpliftCeilingPercent: number;
  longStayEnabled: boolean;
  roundingMode: 'NONE' | 'NEAREST_RUPEE' | 'NEAREST_TEN';
}

export interface AdminPricingConfig {
  cottages: AdminCottage[];
  seasons: AdminSeason[];
  seasonRates: AdminSeasonRate[];
  specialPeakPeriods: AdminSpecialPeakPeriod[];
  specialPeakRates: AdminSpecialPeakRate[];
  breakfastBands: AdminBreakfastBand[];
  childBands: AdminChildBand[];
  longStayRules: AdminLongStayRule[];
  inventoryTiers: AdminInventoryTier[];
  taxSlabs: AdminTaxSlab[];
  settings: Partial<AdminPricingSettings>;
  coupons: any[];
}

export const SEASON_TYPES: SeasonType[] = ['VALUE', 'REGULAR', 'HIGH', 'PEAK'];

export const CATEGORIES: CottageCategory[] = ['STUDIO', 'BOUTIQUE', 'PREMIUM', 'SIGNATURE'];

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
