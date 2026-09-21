/**
 * The Vedara pricing engine.
 *
 * Implements the calculation sequence from spec v2.1 §10, in order:
 *   validate → cottage → season → weekday/weekend → occupancy base rate →
 *   Special Peak override → inventory uplift → Stay 4 Pay 3 → mattress →
 *   breakfast → coupon → GST.
 *
 * This module is pure: it takes a `PricingConfig` loaded from the database and
 * returns a breakdown. No rates live here (spec §16).
 */

import {
  PRICING_ENGINE_VERSION,
  PricingError,
  type ChildBand,
  type CottageConfig,
  type NightBreakdown,
  type PricingConfig,
  type QuoteBreakdown,
  type QuoteRequest,
  type SeasonType,
} from './types';

// ---------------------------------------------------------------------------
// Date helpers — all dates are handled as plain YYYY-MM-DD in UTC so that a
// guest's timezone can never shift which night they are charged for.
// ---------------------------------------------------------------------------

/** Parses YYYY-MM-DD into a UTC Date at midnight. */
export function parseDate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) throw new PricingError('INVALID_DATE', `Invalid date: ${iso}`);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) throw new PricingError('INVALID_DATE', `Invalid date: ${iso}`);
  return d;
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400000);
}

/** Nights between two dates. The checkout date is not charged (spec §3). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseDate(checkIn);
  const b = parseDate(checkOut);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Every night actually occupied, i.e. check-in up to but excluding checkout. */
function occupiedNights(checkIn: string, checkOut: string): Date[] {
  const n = nightsBetween(checkIn, checkOut);
  const start = parseDate(checkIn);
  return Array.from({ length: n }, (_, i) => addDays(start, i));
}

// ---------------------------------------------------------------------------
// Guest classification
// ---------------------------------------------------------------------------

function findBand<T extends { minAge: number; maxAge: number; isActive: boolean }>(
  bands: T[],
  age: number
): T | undefined {
  return bands.find((b) => b.isActive && age >= b.minAge && age <= b.maxAge);
}

/**
 * Splits the party into adults and children per spec §4. A guest aged 12+ is
 * treated as an adult for both occupancy and tariff, so they roll into the
 * adult count that drives the 3rd/4th adult increment.
 */
export function classifyGuests(
  adults: number,
  childAges: number[],
  childBands: ChildBand[],
  adultAgeThreshold: number
): { billableAdults: number; payingChildAges: number[]; freeChildAges: number[] } {
  let billableAdults = adults;
  const payingChildAges: number[] = [];
  const freeChildAges: number[] = [];

  for (const age of childAges) {
    if (age < 0 || age > 120) {
      throw new PricingError('INVALID_CHILD_AGE', `Invalid child age: ${age}`);
    }
    const band = findBand(childBands, age);
    const asAdult = band ? band.chargedAsAdult : age >= adultAgeThreshold;

    if (asAdult) {
      billableAdults += 1;
    } else if (band && band.accommodationCharge > 0) {
      payingChildAges.push(age);
    } else {
      freeChildAges.push(age);
    }
  }

  return { billableAdults, payingChildAges, freeChildAges };
}

// ---------------------------------------------------------------------------
// Season resolution
// ---------------------------------------------------------------------------

interface ResolvedNight {
  date: Date;
  iso: string;
  seasonType: SeasonType;
  seasonName: string;
  isWeekend: boolean;
  /** Set when a Special Peak period covers this night. */
  specialPeakPeriodId: string | null;
}

function isWithin(iso: string, startDate: string, endDate: string): boolean {
  return iso >= startDate.slice(0, 10) && iso <= endDate.slice(0, 10);
}

function resolveNight(date: Date, config: PricingConfig): ResolvedNight {
  const iso = formatDate(date);
  const isWeekend = config.settings.weekendDays.includes(date.getUTCDay());

  // Special Peak overrides the normal seasonal tariff entirely (spec §6).
  const special = config.specialPeakPeriods.find(
    (p) => p.isActive && isWithin(iso, p.startDate, p.endDate)
  );
  if (special) {
    return {
      date,
      iso,
      seasonType: 'SPECIAL_PEAK',
      seasonName: special.name,
      isWeekend,
      specialPeakPeriodId: special.id,
    };
  }

  const month = date.getUTCMonth() + 1;
  const season = config.seasons.find((s) => s.isActive && s.months.includes(month));
  if (!season) {
    throw new PricingError('NO_SEASON', `No active season configured for month ${month}`);
  }

  return {
    date,
    iso,
    seasonType: season.type,
    seasonName: season.name,
    isWeekend,
    specialPeakPeriodId: null,
  };
}

// ---------------------------------------------------------------------------
// Rate lookup
// ---------------------------------------------------------------------------

/**
 * Finds the room rate for a night at a given adult occupancy.
 *
 * Occupancy tiers are defined at 2, 3 and 4 adults. A single adult pays the
 * 2-adult base rate, matching the published "from" rates in spec §12.
 */
function lookupRoomRate(
  night: ResolvedNight,
  cottage: CottageConfig,
  billableAdults: number,
  config: PricingConfig
): number {
  const tier = Math.max(cottage.baseAdults, Math.min(billableAdults, cottage.maxAdults));

  if (night.specialPeakPeriodId) {
    const rate = config.specialPeakRates.find(
      (r) =>
        r.periodId === night.specialPeakPeriodId &&
        r.cottageId === cottage.id &&
        r.adults === tier
    );
    if (rate) return rate.rate;
    throw new PricingError(
      'NO_SPECIAL_PEAK_RATE',
      `No Special Peak rate for ${cottage.name} at ${tier} adults on ${night.iso}`
    );
  }

  const season = config.seasons.find((s) => s.type === night.seasonType && s.isActive);
  if (!season) {
    throw new PricingError('NO_SEASON', `No active season of type ${night.seasonType}`);
  }

  const rate = config.seasonRates.find(
    (r) => r.seasonId === season.id && r.cottageId === cottage.id && r.adults === tier
  );
  if (!rate) {
    throw new PricingError(
      'NO_RATE',
      `No ${season.name} rate for ${cottage.name} at ${tier} adults`
    );
  }

  return night.isWeekend ? rate.weekendRate : rate.weekdayRate;
}

// ---------------------------------------------------------------------------
// Inventory uplift (spec §8)
// ---------------------------------------------------------------------------

function inventoryUpliftPercent(
  inventory: { booked: number; total: number } | undefined,
  config: PricingConfig
): number {
  if (!config.settings.inventoryPricingEnabled) return 0;
  if (!inventory || inventory.total <= 0) return 0;

  const ratio = inventory.booked / inventory.total;
  const tier = config.inventoryTiers.find(
    (t) => t.isActive && ratio >= t.minBookedRatio && ratio < t.maxBookedRatio
  );
  if (!tier) return 0;

  return Math.min(tier.upliftPercent, config.settings.inventoryUpliftCeilingPercent);
}

// ---------------------------------------------------------------------------
// Breakfast (spec §3.2)
// ---------------------------------------------------------------------------

function breakfastPerNight(
  billableAdults: number,
  childAges: number[],
  config: PricingConfig
): number {
  const adultBand = config.breakfastBands.find(
    (b) => b.isActive && b.minAge >= config.settings.adultAgeThreshold
  );
  if (!adultBand) {
    throw new PricingError('NO_BREAKFAST_RATE', 'No adult breakfast band configured');
  }

  let total = billableAdults * adultBand.pricePerNight;

  for (const age of childAges) {
    // A 12+ child already counted as an adult above; skip to avoid charging twice.
    if (age >= config.settings.adultAgeThreshold) continue;
    const band = findBand(config.breakfastBands, age);
    total += band ? band.pricePerNight : 0;
  }

  return total;
}

// ---------------------------------------------------------------------------
// Long stay — Stay 4, Pay 3 (spec §7)
// ---------------------------------------------------------------------------

interface LongStayOutcome {
  discount: number;
  ruleName: string | null;
  /** Index into `nights` of the complimentary night, or -1. */
  freeNightIndex: number;
  note?: string;
}

function applyLongStay(
  nights: ResolvedNight[],
  roomRates: number[],
  cottage: CottageConfig,
  config: PricingConfig,
  hasCoupon: boolean
): LongStayOutcome {
  const none: LongStayOutcome = { discount: 0, ruleName: null, freeNightIndex: -1 };
  if (!config.settings.longStayEnabled) return none;

  for (const rule of config.longStayRules) {
    if (!rule.isActive) continue;
    if (nights.length < rule.nightsRequired) continue;
    if (rule.cottageIds.length > 0 && !rule.cottageIds.includes(cottage.id)) continue;
    if (hasCoupon && !rule.stackableWithCoupon) {
      return { ...none, note: `${rule.name} not combined with coupon` };
    }

    // Only nights in an enabled season, and not blacked out, are eligible.
    const eligible = nights
      .map((n, i) => ({ n, i }))
      .filter(
        ({ n }) =>
          rule.enabledSeasonTypes.includes(n.seasonType) && !rule.blackoutDates.includes(n.iso)
      );

    const freeNights = rule.nightsRequired - rule.nightsCharged;
    if (eligible.length < rule.nightsRequired || freeNights <= 0) continue;

    // The lowest-priced eligible accommodation night is complimentary (spec §7).
    let cheapest = eligible[0];
    for (const cur of eligible) {
      if (roomRates[cur.i] < roomRates[cheapest.i]) cheapest = cur;
    }

    return {
      discount: roomRates[cheapest.i],
      ruleName: rule.name,
      freeNightIndex: cheapest.i,
    };
  }

  return none;
}

// ---------------------------------------------------------------------------
// Tax (spec §14)
// ---------------------------------------------------------------------------

/**
 * GST is slab-based on the per-night room tariff, so a stay that straddles a
 * slab boundary is taxed night by night rather than on the stay total.
 */
function calculateTax(
  perNightTaxable: { tariff: number; amount: number }[],
  otherTaxable: number,
  config: PricingConfig
): { slabName: string; ratePercent: number; taxableAmount: number; tax: number }[] {
  const buckets = new Map<string, { ratePercent: number; taxableAmount: number }>();

  const slabFor = (tariff: number) =>
    config.taxSlabs.find(
      (s) =>
        s.isActive && tariff >= s.minTariff && (s.maxTariff === null || tariff <= s.maxTariff)
    );

  for (const { tariff, amount } of perNightTaxable) {
    if (amount <= 0) continue;
    const slab = slabFor(tariff);
    if (!slab) continue;
    const cur = buckets.get(slab.name) ?? { ratePercent: slab.ratePercent, taxableAmount: 0 };
    cur.taxableAmount += amount;
    buckets.set(slab.name, cur);
  }

  // Add-ons follow the highest room tariff of the stay, which is how the slab
  // is determined for a composite invoice.
  if (otherTaxable > 0 && perNightTaxable.length > 0) {
    const highest = Math.max(...perNightTaxable.map((p) => p.tariff));
    const slab = slabFor(highest);
    if (slab) {
      const cur = buckets.get(slab.name) ?? { ratePercent: slab.ratePercent, taxableAmount: 0 };
      cur.taxableAmount += otherTaxable;
      buckets.set(slab.name, cur);
    }
  }

  return Array.from(buckets.entries()).map(([slabName, v]) => ({
    slabName,
    ratePercent: v.ratePercent,
    taxableAmount: round2(v.taxableAmount),
    tax: round2((v.taxableAmount * v.ratePercent) / 100),
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function applyRounding(n: number, mode: PricingConfig['settings']['roundingMode']): number {
  switch (mode) {
    case 'NEAREST_TEN':
      return Math.round(n / 10) * 10;
    case 'NEAREST_RUPEE':
      return Math.round(n);
    default:
      return round2(n);
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function calculateQuote(req: QuoteRequest, config: PricingConfig): QuoteBreakdown {
  const notes: string[] = [];

  // --- 1. Validate (spec §10.1) -------------------------------------------
  const cottage = config.cottages.find((c) => c.id === req.cottageId);
  if (!cottage) throw new PricingError('COTTAGE_NOT_FOUND', 'Cottage not found');
  if (!cottage.isActive) throw new PricingError('COTTAGE_INACTIVE', 'Cottage is not bookable');

  const nightCount = nightsBetween(req.checkIn, req.checkOut);
  if (nightCount < 1) {
    throw new PricingError('INVALID_RANGE', 'Check-out must be after check-in');
  }
  if (req.adults < 1) {
    throw new PricingError('INVALID_ADULTS', 'At least one adult is required');
  }

  const { billableAdults, payingChildAges, freeChildAges } = classifyGuests(
    req.adults,
    req.childAges ?? [],
    config.childBands,
    config.settings.adultAgeThreshold
  );

  if (billableAdults > cottage.maxAdults) {
    throw new PricingError(
      'OVER_ADULT_CAPACITY',
      `${cottage.name} accommodates a maximum of ${cottage.maxAdults} adults`
    );
  }

  const totalHeads = billableAdults + payingChildAges.length + freeChildAges.length;
  if (totalHeads > cottage.maxOccupancy) {
    throw new PricingError(
      'OVER_CAPACITY',
      `${cottage.name} accommodates a maximum of ${cottage.maxOccupancy} guests`
    );
  }

  // --- Extra mattress validation (spec §5.2) ------------------------------
  const requestedMattresses = req.extraMattresses ?? 0;
  if (requestedMattresses > 0 && !cottage.allowsExtraMattress) {
    throw new PricingError(
      'MATTRESS_NOT_AVAILABLE',
      `No extra bed or mattress is available in ${cottage.name}`
    );
  }
  if (requestedMattresses > cottage.maxExtraMattresses) {
    throw new PricingError(
      'TOO_MANY_MATTRESSES',
      `${cottage.name} allows at most ${cottage.maxExtraMattresses} extra mattress(es)`
    );
  }
  const mattressPrice = cottage.extraMattressPrice ?? config.settings.extraMattressPrice;

  // --- 2-6. Resolve each night and its room rate --------------------------
  const nights = occupiedNights(req.checkIn, req.checkOut).map((d) => resolveNight(d, config));
  const baseRates = nights.map((n) => lookupRoomRate(n, cottage, billableAdults, config));

  // --- 7. Inventory uplift (spec §8) --------------------------------------
  const uplift = inventoryUpliftPercent(req.inventory, config);
  const roomRates = baseRates.map((r) => Math.round(r * (1 + uplift / 100)));
  if (uplift > 0) {
    notes.push(`Limited availability: room rate increased by ${uplift}%.`);
  }

  // --- 8. Stay 4 Pay 3 (spec §7) ------------------------------------------
  const longStay = applyLongStay(
    nights,
    roomRates,
    cottage,
    config,
    Boolean(req.coupon)
  );
  if (longStay.note) notes.push(longStay.note);

  // --- 9-10. Mattress and breakfast, charged on every night ---------------
  // Both remain payable on the complimentary accommodation night (spec §7).
  const perNightBreakfast =
    req.ratePlan === 'BREAKFAST_INCLUDED'
      ? breakfastPerNight(billableAdults, req.childAges ?? [], config)
      : 0;
  const perNightMattress = requestedMattresses * mattressPrice;

  const perNight: NightBreakdown[] = nights.map((n, i) => ({
    date: n.iso,
    seasonType: n.seasonType,
    seasonName: n.seasonName,
    isWeekend: n.isWeekend,
    baseRate: baseRates[i],
    inventoryUplift: roomRates[i] - baseRates[i],
    roomRate: roomRates[i],
    isComplimentary: i === longStay.freeNightIndex,
    breakfastTotal: perNightBreakfast,
    mattressTotal: perNightMattress,
  }));

  const accommodationBeforeBenefit = roomRates.reduce((s, r) => s + r, 0);
  const accommodationTotal = accommodationBeforeBenefit - longStay.discount;
  const breakfastTotal = perNightBreakfast * nights.length;
  const mattressTotal = perNightMattress * nights.length;

  if (longStay.freeNightIndex >= 0) {
    notes.push(
      `${longStay.ruleName}: the lowest-priced night (${nights[longStay.freeNightIndex].iso}) is complimentary. Breakfast and add-ons remain payable on all nights.`
    );
  }

  // --- 11. Coupon ---------------------------------------------------------
  // Applied to accommodation only, so add-ons are never discounted twice.
  let couponDiscount = 0;
  if (req.coupon) {
    couponDiscount =
      req.coupon.discountType === 'PERCENTAGE'
        ? Math.round((accommodationTotal * req.coupon.discountValue) / 100)
        : req.coupon.discountValue;
    couponDiscount = Math.min(couponDiscount, accommodationTotal);
  }

  const subtotal = accommodationTotal - couponDiscount + breakfastTotal + mattressTotal;

  // --- 12. GST (spec §14) -------------------------------------------------
  // Discounts are spread proportionally so each night is taxed on what it
  // actually contributed to the subtotal.
  const totalDiscount = longStay.discount + couponDiscount;
  const discountFactor =
    accommodationBeforeBenefit > 0
      ? Math.max(0, (accommodationBeforeBenefit - totalDiscount) / accommodationBeforeBenefit)
      : 0;

  const perNightTaxable = perNight.map((p) => ({
    tariff: p.roomRate,
    amount: p.roomRate * discountFactor,
  }));

  const taxBreakdown = calculateTax(perNightTaxable, breakfastTotal + mattressTotal, config);
  const taxTotal = taxBreakdown.reduce((s, t) => s + t.tax, 0);

  const total = applyRounding(subtotal + taxTotal, config.settings.roundingMode);

  if (freeChildAges.length > 0) {
    notes.push(
      `${freeChildAges.length} child(ren) stay complimentary when sharing existing bedding.`
    );
  }

  return {
    engineVersion: PRICING_ENGINE_VERSION,
    cottageId: cottage.id,
    cottageName: cottage.name,
    ratePlan: req.ratePlan,
    checkIn: req.checkIn,
    checkOut: req.checkOut,
    nights: nights.length,
    adults: req.adults,
    childAges: req.childAges ?? [],
    billableAdults,
    extraMattresses: requestedMattresses,
    perNight,
    accommodationBeforeBenefit: round2(accommodationBeforeBenefit),
    longStayDiscount: round2(longStay.discount),
    longStayApplied: longStay.freeNightIndex >= 0,
    longStayRuleName: longStay.ruleName,
    accommodationTotal: round2(accommodationTotal),
    breakfastTotal: round2(breakfastTotal),
    mattressTotal: round2(mattressTotal),
    couponCode: req.coupon?.code ?? null,
    couponDiscount: round2(couponDiscount),
    subtotal: round2(subtotal),
    taxBreakdown,
    taxTotal: round2(taxTotal),
    total,
    notes,
  };
}

/**
 * Lowest published "from" rate for a cottage — the 2-adult weekday rate in the
 * cheapest active season. Drives the public cottage cards (spec §12).
 */
export function lowestFromRate(cottageId: string, config: PricingConfig): number | null {
  const rates = config.seasonRates.filter(
    (r) => r.cottageId === cottageId && r.adults === 2
  );
  if (rates.length === 0) return null;
  return Math.min(...rates.map((r) => r.weekdayRate));
}
