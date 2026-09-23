/**
 * The Vedara pricing engine.
 *
 * Implements the calculation sequence from spec v2.1 §10, in order:
 *   validate → cottage → season → weekday/weekend → occupancy base rate →
 *   Special Peak override → inventory uplift → Stay 4 Pay 3 → mattress →
 *   breakfast → promotion / coupon → GST.
 *
 * This module is pure: it takes a `PricingConfig` loaded from the database and
 * returns a breakdown. No rates live here (spec §16).
 */

import {
  MAX_LAST_MINUTE_DISCOUNT_PERCENT,
  PRICING_ENGINE_VERSION,
  PricingError,
  type AppliedOffer,
  type ChildBand,
  type CottageConfig,
  type CouponInput,
  type InventoryCount,
  type LastMinuteOffer,
  type LongStayRule,
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
export function occupiedNightDates(checkIn: string, checkOut: string): string[] {
  const n = nightsBetween(checkIn, checkOut);
  const start = parseDate(checkIn);
  return Array.from({ length: Math.max(0, n) }, (_, i) => formatDate(addDays(start, i)));
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
    if (!Number.isInteger(age) || age < 0 || age > 120) {
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
  iso: string;
  seasonType: SeasonType;
  seasonName: string;
  isWeekend: boolean;
  /** Set when a Special Peak period covers this night. */
  specialPeakPeriodId: string | null;
  /** Minimum stay imposed by this night's season or Special Peak period. */
  minStay: number;
}

function isWithin(iso: string, startDate: string, endDate: string): boolean {
  return iso >= startDate.slice(0, 10) && iso <= endDate.slice(0, 10);
}

function resolveNight(iso: string, config: PricingConfig): ResolvedNight {
  const date = parseDate(iso);
  const isWeekend = config.settings.weekendDays.includes(date.getUTCDay());

  // Special Peak overrides the normal seasonal tariff entirely (spec §6).
  const special = config.specialPeakPeriods.find(
    (p) => p.isActive && isWithin(iso, p.startDate, p.endDate)
  );
  if (special) {
    return {
      iso,
      seasonType: 'SPECIAL_PEAK',
      seasonName: special.name,
      isWeekend,
      specialPeakPeriodId: special.id,
      minStay: special.minStay || 1,
    };
  }

  const month = date.getUTCMonth() + 1;
  const season = config.seasons.find((s) => s.isActive && s.months.includes(month));
  if (!season) {
    throw new PricingError('NO_SEASON', `No active season configured for month ${month}`);
  }

  return {
    iso,
    seasonType: season.type,
    seasonName: season.name,
    isWeekend,
    specialPeakPeriodId: null,
    minStay: season.minStay || 1,
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
    throw new PricingError('NO_RATE', `No ${season.name} rate for ${cottage.name} at ${tier} adults`);
  }

  return night.isWeekend ? rate.weekendRate : rate.weekdayRate;
}

// ---------------------------------------------------------------------------
// Inventory (spec §8, §9)
// ---------------------------------------------------------------------------

function inventoryFor(night: string, req: QuoteRequest): InventoryCount | undefined {
  return req.inventoryByNight?.[night] ?? req.inventory;
}

function upliftPercentFor(count: InventoryCount | undefined, config: PricingConfig): number {
  if (!config.settings.inventoryPricingEnabled) return 0;
  if (!count || count.total <= 0) return 0;

  const ratio = count.booked / count.total;
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

interface LongStayCandidate {
  rule: LongStayRule;
  discount: number;
  /** Index into the stay's nights of the complimentary night. */
  freeNightIndex: number;
}

function evaluateLongStay(
  nights: ResolvedNight[],
  roomRates: number[],
  cottage: CottageConfig,
  config: PricingConfig
): LongStayCandidate | null {
  if (!config.settings.longStayEnabled) return null;

  let best: LongStayCandidate | null = null;

  for (const rule of config.longStayRules) {
    if (!rule.isActive) continue;
    if (nights.length < rule.nightsRequired) continue;
    if (rule.nightsRequired - rule.nightsCharged <= 0) continue;
    if (rule.cottageIds.length > 0 && !rule.cottageIds.includes(cottage.id)) continue;

    // Only nights in an enabled season, inside the rule's availability window,
    // and not blacked out are eligible (spec §7).
    const eligible = nights
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => {
        if (!rule.enabledSeasonTypes.includes(n.seasonType)) return false;
        if (rule.blackoutDates.includes(n.iso)) return false;
        if (rule.validFrom && n.iso < rule.validFrom.slice(0, 10)) return false;
        if (rule.validTo && n.iso > rule.validTo.slice(0, 10)) return false;
        return true;
      });

    if (eligible.length < rule.nightsRequired) continue;

    // The lowest-priced eligible accommodation night is complimentary.
    let cheapest = eligible[0];
    for (const cur of eligible) {
      if (roomRates[cur.i] < roomRates[cheapest.i]) cheapest = cur;
    }

    const candidate = { rule, discount: roomRates[cheapest.i], freeNightIndex: cheapest.i };
    if (!best || candidate.discount > best.discount) best = candidate;
  }

  return best;
}

// ---------------------------------------------------------------------------
// Last-minute / low-occupancy offers (spec §9)
// ---------------------------------------------------------------------------

function daysUntil(today: string, checkIn: string): number {
  return Math.round((parseDate(checkIn).getTime() - parseDate(today).getTime()) / 86400000);
}

/**
 * An offer is eligible when arrival is within its window and no night of the
 * stay has more cottages booked than its threshold. With no inventory data the
 * low-occupancy condition cannot be verified, so the offer does not apply.
 */
function eligibleOffers(
  req: QuoteRequest,
  nightDates: string[],
  cottage: CottageConfig,
  config: PricingConfig
): LastMinuteOffer[] {
  const today = req.today ?? formatDate(new Date());
  const lead = daysUntil(today, req.checkIn);

  return config.lastMinuteOffers.filter((offer) => {
    if (!offer.isActive) return false;
    if (offer.cottageIds.length > 0 && !offer.cottageIds.includes(cottage.id)) return false;
    if (lead < 0 || lead > offer.daysBeforeArrival) return false;
    return nightDates.every((d) => {
      const count = inventoryFor(d, req);
      return count !== undefined && count.booked <= offer.maxBookedCottages;
    });
  });
}

function formatRupees(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

// ---------------------------------------------------------------------------
// Accommodation discounts: Stay 4 Pay 3, last-minute room discount, coupon
// ---------------------------------------------------------------------------

type DiscountKey = 'longStay' | 'offer' | 'coupon';

interface DiscountPlan {
  keys: DiscountKey[];
  longStay: number;
  offer: number;
  coupon: number;
  total: number;
}

/**
 * The spec forbids stacking Stay 4 Pay 3 with another accommodation discount
 * or coupon unless an admin enables it (§7), and treats the last-minute room
 * discount as a promotion (§9). When discounts cannot combine, the guest gets
 * whichever permitted combination is worth the most to them.
 *
 * Discounts apply in spec order — long stay, then promotion, then coupon —
 * each on what remains after the previous one.
 */
function bestDiscountPlan(
  accommodation: number,
  longStay: LongStayCandidate | null,
  roomOffer: LastMinuteOffer | null,
  coupon: CouponInput | null
): DiscountPlan {
  const available: DiscountKey[] = [];
  if (longStay) available.push('longStay');
  if (roomOffer) available.push('offer');
  if (coupon) available.push('coupon');

  const compatible = (a: DiscountKey, b: DiscountKey): boolean => {
    const pair = [a, b].sort().join('+');
    if (pair === 'coupon+longStay') return Boolean(longStay?.rule.stackableWithCoupon);
    if (pair === 'longStay+offer') return Boolean(longStay?.rule.stackableWithOffers);
    if (pair === 'coupon+offer') return Boolean(roomOffer?.stackableWithCoupon);
    return true;
  };

  let best: DiscountPlan = { keys: [], longStay: 0, offer: 0, coupon: 0, total: 0 };

  // Every subset of the available discounts; at most 8.
  for (let mask = 1; mask < 1 << available.length; mask++) {
    const keys = available.filter((_, i) => mask & (1 << i));
    const allCompatible = keys.every((a, i) => keys.slice(i + 1).every((b) => compatible(a, b)));
    if (!allCompatible) continue;

    let remaining = accommodation;
    let ls = 0;
    let off = 0;
    let cp = 0;

    if (keys.includes('longStay') && longStay) {
      ls = Math.min(longStay.discount, remaining);
      remaining -= ls;
    }
    if (keys.includes('offer') && roomOffer) {
      const pct = Math.min(roomOffer.value, MAX_LAST_MINUTE_DISCOUNT_PERCENT);
      off = Math.round((remaining * pct) / 100);
      remaining -= off;
    }
    if (keys.includes('coupon') && coupon) {
      cp =
        coupon.discountType === 'PERCENTAGE'
          ? Math.round((remaining * coupon.discountValue) / 100)
          : coupon.discountValue;
      cp = Math.min(cp, remaining);
      remaining -= cp;
    }

    const total = ls + off + cp;
    if (total > best.total) best = { keys, longStay: ls, offer: off, coupon: cp, total };
  }

  return best;
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
      (s) => s.isActive && tariff >= s.minTariff && (s.maxTariff === null || tariff <= s.maxTariff)
    );

  const add = (name: string, rate: number, amount: number) => {
    const cur = buckets.get(name) ?? { ratePercent: rate, taxableAmount: 0 };
    cur.taxableAmount += amount;
    buckets.set(name, cur);
  };

  for (const { tariff, amount } of perNightTaxable) {
    if (amount <= 0) continue;
    const slab = slabFor(tariff);
    if (slab) add(slab.name, slab.ratePercent, amount);
  }

  // Add-ons follow the highest room tariff of the stay, which is how the slab
  // is determined for a composite invoice.
  if (otherTaxable > 0 && perNightTaxable.length > 0) {
    const slab = slabFor(Math.max(...perNightTaxable.map((p) => p.tariff)));
    if (slab) add(slab.name, slab.ratePercent, otherTaxable);
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

  const nightDates = occupiedNightDates(req.checkIn, req.checkOut);
  if (nightDates.length < 1) {
    throw new PricingError('INVALID_RANGE', 'Check-out must be after check-in');
  }
  if (!Number.isInteger(req.adults) || req.adults < 1) {
    throw new PricingError('INVALID_ADULTS', 'At least one adult is required');
  }

  const childAges = req.childAges ?? [];
  const { billableAdults, payingChildAges, freeChildAges } = classifyGuests(
    req.adults,
    childAges,
    config.childBands,
    config.settings.adultAgeThreshold
  );
  const childCount = payingChildAges.length + freeChildAges.length;

  if (billableAdults > cottage.maxAdults) {
    throw new PricingError(
      'OVER_ADULT_CAPACITY',
      `${cottage.name} accommodates a maximum of ${cottage.maxAdults} adults (guests aged ${config.settings.adultAgeThreshold}+ count as adults)`
    );
  }
  if (childCount > cottage.maxChildren) {
    throw new PricingError(
      'OVER_CHILD_CAPACITY',
      `${cottage.name} accommodates a maximum of ${cottage.maxChildren} child${cottage.maxChildren === 1 ? '' : 'ren'}`
    );
  }
  if (billableAdults + childCount > cottage.maxOccupancy) {
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
  const nights = nightDates.map((d) => resolveNight(d, config));

  // --- Minimum stay (spec §15): the strictest rule across the stay --------
  const minStay = Math.max(
    config.settings.minStayNights || 1,
    ...nights.map((n) => n.minStay)
  );
  if (nights.length < minStay) {
    throw new PricingError(
      'MIN_STAY',
      `The minimum stay for these dates is ${minStay} nights`
    );
  }

  const baseRates = nights.map((n) => lookupRoomRate(n, cottage, billableAdults, config));

  // --- 7. Inventory uplift, night by night (spec §8) ----------------------
  const uplifts = nights.map((n) => upliftPercentFor(inventoryFor(n.iso, req), config));
  const roomRates = baseRates.map((r, i) => Math.round(r * (1 + uplifts[i] / 100)));
  const maxUplift = Math.max(0, ...uplifts);
  if (maxUplift > 0) {
    notes.push(`High demand: room rate increased by up to ${maxUplift}% on some nights.`);
  }

  const accommodationBeforeBenefit = roomRates.reduce((s, r) => s + r, 0);

  // --- 9-10. Mattress and breakfast, charged on every night ---------------
  // Both remain payable on the complimentary accommodation night (spec §7).
  const perNightBreakfast =
    req.ratePlan === 'BREAKFAST_INCLUDED'
      ? breakfastPerNight(billableAdults, childAges, config)
      : 0;
  const perNightMattress = requestedMattresses * mattressPrice;
  const breakfastTotal = perNightBreakfast * nights.length;
  const mattressTotal = perNightMattress * nights.length;

  // --- 8 & 11. Long stay, last-minute offer and coupon --------------------
  const longStay = evaluateLongStay(nights, roomRates, cottage, config);

  // Only one last-minute offer applies; pick the one worth most to the guest.
  const offers = eligibleOffers(req, nightDates, cottage, config);
  const offerValue = (o: LastMinuteOffer): number => {
    if (o.offerType === 'ROOM_DISCOUNT') {
      const base = accommodationBeforeBenefit - (longStay?.discount ?? 0);
      return (base * Math.min(o.value, MAX_LAST_MINUTE_DISCOUNT_PERCENT)) / 100;
    }
    if (o.offerType === 'COMPLIMENTARY_BREAKFAST') {
      // Computed only when such an offer exists, so a property with no
      // breakfast bands is never blocked by it.
      return breakfastPerNight(billableAdults, childAges, config) * nights.length;
    }
    return o.value;
  };
  const offer = offers.length > 0
    ? offers.reduce((a, b) => (offerValue(b) > offerValue(a) ? b : a))
    : null;

  // Coupon minimum is checked against the accommodation subtotal.
  let coupon: CouponInput | null = req.coupon ?? null;
  if (coupon && coupon.minAmount && accommodationBeforeBenefit < coupon.minAmount) {
    notes.push(
      `Coupon ${coupon.code} needs an accommodation total of at least ${formatRupees(coupon.minAmount)}.`
    );
    coupon = null;
  }

  const plan = bestDiscountPlan(
    accommodationBeforeBenefit,
    longStay,
    offer?.offerType === 'ROOM_DISCOUNT' ? offer : null,
    coupon
  );

  const longStayApplied = plan.keys.includes('longStay');
  const freeNightIndex = longStayApplied && longStay ? longStay.freeNightIndex : -1;

  if (longStay && !longStayApplied) {
    notes.push(
      `${longStay.rule.name} was not combined with another discount; the better offer for you has been applied.`
    );
  }
  if (req.coupon && coupon && !plan.keys.includes('coupon')) {
    notes.push(`Coupon ${coupon.code} was not combined with a better offer already applied.`);
  }

  // --- The last-minute offer, whatever its kind ---------------------------
  let appliedOffer: AppliedOffer | null = null;
  let breakfastWaiver = 0;
  if (offer) {
    if (offer.offerType === 'ROOM_DISCOUNT') {
      if (plan.keys.includes('offer')) {
        appliedOffer = {
          id: offer.id,
          name: offer.name,
          offerType: offer.offerType,
          discount: plan.offer,
          description: `${Math.min(offer.value, MAX_LAST_MINUTE_DISCOUNT_PERCENT)}% off the room rate`,
        };
      }
    } else if (offer.offerType === 'COMPLIMENTARY_BREAKFAST') {
      // On the breakfast plan the supplement is waived; on Room Only the guest
      // still receives breakfast, at no charge either way.
      breakfastWaiver = breakfastTotal;
      appliedOffer = {
        id: offer.id,
        name: offer.name,
        offerType: offer.offerType,
        discount: breakfastWaiver,
        description: 'Complimentary breakfast for your party on every morning of your stay',
      };
    } else {
      appliedOffer = {
        id: offer.id,
        name: offer.name,
        offerType: offer.offerType,
        discount: 0,
        description: `${formatRupees(offer.value)} meal credit at The Perch`,
      };
    }
  }

  const accommodationTotal = accommodationBeforeBenefit - plan.total;
  const promotionDiscount = plan.offer + breakfastWaiver;

  const perNight: NightBreakdown[] = nights.map((n, i) => ({
    date: n.iso,
    seasonType: n.seasonType,
    seasonName: n.seasonName,
    isWeekend: n.isWeekend,
    baseRate: baseRates[i],
    inventoryUplift: roomRates[i] - baseRates[i],
    roomRate: roomRates[i],
    isComplimentary: i === freeNightIndex,
    breakfastTotal: perNightBreakfast,
    mattressTotal: perNightMattress,
  }));

  if (longStayApplied && longStay) {
    notes.push(
      `${longStay.rule.name}: the lowest-priced night (${nights[freeNightIndex].iso}) is complimentary. Breakfast and add-ons remain payable on all nights.`
    );
  }
  if (appliedOffer) {
    notes.push(`${appliedOffer.name}: ${appliedOffer.description}.`);
  }

  const subtotal = accommodationTotal + breakfastTotal - breakfastWaiver + mattressTotal;

  // --- 12. GST (spec §14) -------------------------------------------------
  // Accommodation discounts are spread proportionally so each night is taxed
  // on what it actually contributed to the subtotal.
  const discountFactor =
    accommodationBeforeBenefit > 0
      ? Math.max(0, accommodationTotal / accommodationBeforeBenefit)
      : 0;

  const perNightTaxable = perNight.map((p) => ({
    tariff: p.roomRate,
    amount: p.roomRate * discountFactor,
  }));

  const taxBreakdown = calculateTax(
    perNightTaxable,
    breakfastTotal - breakfastWaiver + mattressTotal,
    config
  );
  const taxTotal = taxBreakdown.reduce((s, t) => s + t.tax, 0);

  const total = applyRounding(subtotal + taxTotal, config.settings.roundingMode);

  if (freeChildAges.length > 0) {
    notes.push(
      `${freeChildAges.length} ${freeChildAges.length === 1 ? 'child stays' : 'children stay'} complimentary when sharing existing bedding.`
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
    childAges,
    billableAdults,
    extraMattresses: requestedMattresses,
    perNight,
    accommodationBeforeBenefit: round2(accommodationBeforeBenefit),
    longStayDiscount: round2(plan.longStay),
    longStayApplied,
    longStayRuleName: longStayApplied && longStay ? longStay.rule.name : null,
    promotionDiscount: round2(promotionDiscount),
    lastMinuteOffer: appliedOffer,
    accommodationTotal: round2(accommodationTotal),
    breakfastTotal: round2(breakfastTotal),
    mattressTotal: round2(mattressTotal),
    couponCode: plan.keys.includes('coupon') && coupon ? coupon.code : null,
    couponDiscount: round2(plan.coupon),
    subtotal: round2(subtotal),
    taxBreakdown,
    taxTotal: round2(taxTotal),
    total,
    minStay,
    notes,
  };
}

/**
 * Lowest published "from" rate for a cottage — the 2-adult weekday rate in the
 * cheapest active season. Drives the public cottage cards (spec §12).
 */
export function lowestFromRate(cottageId: string, config: PricingConfig): number | null {
  const activeSeasonIds = new Set(config.seasons.filter((s) => s.isActive).map((s) => s.id));
  const rates = config.seasonRates.filter(
    (r) => r.cottageId === cottageId && r.adults === 2 && activeSeasonIds.has(r.seasonId)
  );
  if (rates.length === 0) return null;
  return Math.min(...rates.map((r) => r.weekdayRate));
}

/**
 * Checks whether a party can stay in a cottage at all, without pricing it.
 * Used to return only compatible cottages from a search (spec §11).
 */
export function occupancyProblem(
  cottage: CottageConfig,
  adults: number,
  childAges: number[],
  config: PricingConfig
): string | null {
  try {
    const { billableAdults, payingChildAges, freeChildAges } = classifyGuests(
      adults,
      childAges,
      config.childBands,
      config.settings.adultAgeThreshold
    );
    const children = payingChildAges.length + freeChildAges.length;
    if (billableAdults > cottage.maxAdults) return `Up to ${cottage.maxAdults} adults`;
    if (children > cottage.maxChildren) {
      return `Up to ${cottage.maxChildren} ${cottage.maxChildren === 1 ? 'child' : 'children'}`;
    }
    if (billableAdults + children > cottage.maxOccupancy) return `Up to ${cottage.maxOccupancy} guests`;
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Invalid party';
  }
}
