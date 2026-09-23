/**
 * Engine tests covering the Developer Acceptance Checklist (spec v2.1 §17),
 * the worked examples in §7 and §14, and the controls in §9 and §15.
 *
 * Run with:  npx tsx lib/pricing/engine.test.ts
 */

import { buildSeedConfig } from './build-config';
import { calculateQuote, lowestFromRate, occupancyProblem } from './engine';
import { PricingError, type PricingConfig, type QuoteRequest } from './types';

const config = buildSeedConfig();

let passed = 0;
let failed = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`);
  }
}

function expectThrows(name: string, code: string, fn: () => unknown) {
  try {
    fn();
    failed++;
    console.log(`  FAIL  ${name}\n        expected PricingError(${code}), nothing thrown`);
  } catch (e) {
    if (e instanceof PricingError && e.code === code) {
      passed++;
      console.log(`  PASS  ${name}`);
    } else {
      failed++;
      console.log(`  FAIL  ${name}\n        expected PricingError(${code}), got ${e}`);
    }
  }
}

function quote(over: Partial<QuoteRequest>, cfg: PricingConfig = config) {
  return calculateQuote(
    {
      cottageId: 'monal-haven',
      checkIn: '2026-07-02',
      checkOut: '2026-07-06',
      adults: 2,
      childAges: [],
      ratePlan: 'ROOM_ONLY',
      ...over,
    },
    cfg
  );
}

/** A config copy that can be mutated without affecting the shared one. */
function cfgWith(mutate: (c: PricingConfig) => void): PricingConfig {
  const c = JSON.parse(JSON.stringify(config)) as PricingConfig;
  mutate(c);
  return c;
}

const oneNight = { checkIn: '2026-07-06', checkOut: '2026-07-07' };

// ---------------------------------------------------------------------------
console.log('\n§1  Cottage inventory follows the spec exactly');
// ---------------------------------------------------------------------------
const byslug = (s: string) => config.cottages.find((c) => c.slug === s)!;
check('Magpie Retreat is Boutique', byslug('magpie-retreat').category, 'BOUTIQUE');
check('Magpie Retreat max 2 adults', byslug('magpie-retreat').maxAdults, 2);
check('Magpie Retreat has no mattress', byslug('magpie-retreat').allowsExtraMattress, false);
check('Whistling Thrush is Premium', byslug('whistling-thrush').category, 'PREMIUM');
check('Whistling Thrush max 4 adults', byslug('whistling-thrush').maxAdults, 4);
check('Whistling Thrush allows a mattress', byslug('whistling-thrush').allowsExtraMattress, true);
check('Monal Haven is Signature', byslug('monal-haven').category, 'SIGNATURE');
check('Koklass Cove is Signature', byslug('koklass-cove').category, 'SIGNATURE');

// ---------------------------------------------------------------------------
console.log('\n§5  All four seasonal matrices return correct rates');
// ---------------------------------------------------------------------------
// 2026-07-06 is a Monday (weekday), 2026-07-03 a Friday (weekend).
const seasonCases: [string, string, string, number][] = [
  ['Value weekday  (Jul, Signature)', 'monal-haven', '2026-07-06', 7500],
  ['Value weekend  (Jul, Signature)', 'monal-haven', '2026-07-03', 8500],
  ['Regular weekday (Sep, Signature)', 'monal-haven', '2026-09-07', 8000],
  ['High weekday   (Oct, Signature)', 'monal-haven', '2026-10-05', 8500],
  ['Peak weekday   (May, Signature)', 'monal-haven', '2026-05-04', 9000],
  ['Value weekday  (Jul, Boutique Magpie)', 'magpie-retreat', '2026-07-06', 4500],
  ['Peak weekend   (Jun, Boutique Bulbul)', 'bulbul-nest', '2026-06-05', 7000],
  ['Value weekday  (Jul, Premium Whistling Thrush)', 'whistling-thrush', '2026-07-06', 6500],
  ['Value weekday  (Jul, Studio)', 'the-finch-nook', '2026-07-06', 3500],
];
for (const [name, cottageId, date, expected] of seasonCases) {
  const next = new Date(Date.parse(date + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
  check(name, quote({ cottageId, checkIn: date, checkOut: next }).perNight[0].roomRate, expected);
}

// ---------------------------------------------------------------------------
console.log('\n§17 3rd and 4th adult increments for the three larger cottages');
// ---------------------------------------------------------------------------
check('Signature 3 adults, Value weekday', quote({ ...oneNight, adults: 3 }).perNight[0].roomRate, 8500);
check('Signature 4 adults, Value weekday', quote({ ...oneNight, adults: 4 }).perNight[0].roomRate, 9500);
check('Whistling Thrush 3 adults, Value weekday', quote({ ...oneNight, cottageId: 'whistling-thrush', adults: 3 }).perNight[0].roomRate, 7500);
check('Whistling Thrush 4 adults, Peak weekend', quote({ cottageId: 'whistling-thrush', adults: 4, checkIn: '2026-06-05', checkOut: '2026-06-06' }).perNight[0].roomRate, 11000);
expectThrows('Magpie Retreat rejects a 3rd adult', 'OVER_ADULT_CAPACITY', () =>
  quote({ ...oneNight, cottageId: 'magpie-retreat', adults: 3 })
);
expectThrows('Bulbul Nest rejects a 3rd adult', 'OVER_ADULT_CAPACITY', () =>
  quote({ ...oneNight, cottageId: 'bulbul-nest', adults: 3 })
);

// ---------------------------------------------------------------------------
console.log('\n§7  Stay 4 Pay 3 — the spec worked example');
// ---------------------------------------------------------------------------
// Thu 7,500 + Fri 8,500 + Sat 8,500 + Sun 8,500 = 33,000; lowest night free.
const s4p3 = quote({ checkIn: '2026-07-02', checkOut: '2026-07-06' });
check('accommodation before benefit = 33,000', s4p3.accommodationBeforeBenefit, 33000);
check('long stay discount = 7,500', s4p3.longStayDiscount, 7500);
check('accommodation payable = 25,500', s4p3.accommodationTotal, 25500);
check('complimentary night is the Thursday', s4p3.perNight.filter((p) => p.isComplimentary).map((p) => p.date), ['2026-07-02']);

// ---------------------------------------------------------------------------
console.log('\n§14 Checkout breakdown — breakfast on all four nights');
// ---------------------------------------------------------------------------
const withBf = quote({ checkIn: '2026-07-02', checkOut: '2026-07-06', ratePlan: 'BREAKFAST_INCLUDED' });
check('breakfast 2 adults x 4 nights = 3,200', withBf.breakfastTotal, 3200);
check('breakfast charged on the complimentary night too', withBf.perNight.find((p) => p.isComplimentary)?.breakfastTotal, 800);
check('subtotal = 25,500 + 3,200', withBf.subtotal, 28700);

// §12 example: Room Only 8,500/night; Breakfast Included 9,300/night, 2 adults.
const weekendRO = quote({ checkIn: '2026-07-03', checkOut: '2026-07-04' });
const weekendBF = quote({ checkIn: '2026-07-03', checkOut: '2026-07-04', ratePlan: 'BREAKFAST_INCLUDED' });
check('§12 Room Only 8,500/night', weekendRO.subtotal, 8500);
check('§12 Breakfast Included 9,300/night', weekendBF.subtotal, 9300);

// ---------------------------------------------------------------------------
console.log('\n§17 Child policy');
// ---------------------------------------------------------------------------
const noKids = quote({ ...oneNight, adults: 2 });
const withKids = quote({ ...oneNight, adults: 2, childAges: [3, 9] });
check('children 0-11 add nothing to accommodation', withKids.accommodationTotal, noKids.accommodationTotal);
check('+ child aged 4 adds 0 breakfast', quote({ ...oneNight, childAges: [4], ratePlan: 'BREAKFAST_INCLUDED' }).breakfastTotal, 800);
check('+ child aged 8 adds 250 breakfast', quote({ ...oneNight, childAges: [8], ratePlan: 'BREAKFAST_INCLUDED' }).breakfastTotal, 1050);
check('+ guest aged 13 adds 400 breakfast', quote({ ...oneNight, childAges: [13], ratePlan: 'BREAKFAST_INCLUDED' }).breakfastTotal, 1200);
check('guest aged 13 triggers the 3rd-adult rate', quote({ ...oneNight, childAges: [13] }).perNight[0].roomRate, 8500);

// ---------------------------------------------------------------------------
console.log('\n§15 Maximum adult / child / total occupancy');
// ---------------------------------------------------------------------------
check('Boutique: 2 adults + 1 child sharing the bed is fine', quote({ ...oneNight, cottageId: 'magpie-retreat', childAges: [6] }).nights, 1);
expectThrows('Boutique: a 2nd child is over the child limit', 'OVER_CHILD_CAPACITY', () =>
  quote({ ...oneNight, cottageId: 'magpie-retreat', childAges: [4, 6] })
);
expectThrows('Signature: 4 adults + 2 children is over total occupancy', 'OVER_CAPACITY', () =>
  quote({ ...oneNight, adults: 4, childAges: [3, 4] })
);

// ---------------------------------------------------------------------------
console.log('\n§5.1/§5.2/§13 Extra mattress availability');
// ---------------------------------------------------------------------------
for (const slug of ['magpie-retreat', 'flycatcher-nook', 'bulbul-nest']) {
  expectThrows(`${slug} never accepts a mattress`, 'MATTRESS_NOT_AVAILABLE', () =>
    quote({ ...oneNight, cottageId: slug, extraMattresses: 1 })
  );
}
for (const slug of ['whistling-thrush', 'monal-haven', 'koklass-cove']) {
  check(`${slug} mattress = 1,250/night`, quote({ ...oneNight, cottageId: slug, extraMattresses: 1 }).mattressTotal, 1250);
}
const mattress4 = quote({ checkIn: '2026-07-02', checkOut: '2026-07-06', extraMattresses: 1 });
check('mattress charged on all 4 nights incl. the free one', mattress4.mattressTotal, 5000);
check('long stay discount unchanged by mattress', mattress4.longStayDiscount, 7500);

// ---------------------------------------------------------------------------
console.log('\n§6  Special Peak override');
// ---------------------------------------------------------------------------
const xmasConfig = buildSeedConfig(undefined, {
  periods: [{ id: 'sp-xmas', name: 'Christmas & New Year', startDate: '2026-12-24', endDate: '2027-01-02', minStay: 1, isActive: true }],
});
check('Special Peak overrides the seasonal rate', quote({ checkIn: '2026-12-25', checkOut: '2026-12-26' }, xmasConfig).perNight[0].roomRate, 10500);
check('Special Peak is flat on a weekday', quote({ checkIn: '2026-12-28', checkOut: '2026-12-29' }, xmasConfig).perNight[0].roomRate, 10500);
check('Special Peak 4 adults', quote({ checkIn: '2026-12-25', checkOut: '2026-12-26', adults: 4 }, xmasConfig).perNight[0].roomRate, 12500);
check('Special Peak Boutique', quote({ cottageId: 'magpie-retreat', checkIn: '2026-12-25', checkOut: '2026-12-26' }, xmasConfig).perNight[0].roomRate, 7000);
check('Special Peak Premium 3 adults', quote({ cottageId: 'whistling-thrush', adults: 3, checkIn: '2026-12-25', checkOut: '2026-12-26' }, xmasConfig).perNight[0].roomRate, 10500);
check('night outside the period falls back to High', quote({ checkIn: '2026-12-20', checkOut: '2026-12-21' }, xmasConfig).perNight[0].roomRate, 9500);

// ---------------------------------------------------------------------------
console.log('\n§15 Minimum stay');
// ---------------------------------------------------------------------------
const minStay2 = cfgWith((c) => { c.seasons.find((s) => s.type === 'VALUE')!.minStay = 2; });
expectThrows('1 night in a 2-night-minimum season is rejected', 'MIN_STAY', () => quote(oneNight, minStay2));
check('2 nights in a 2-night-minimum season is accepted', quote({ checkIn: '2026-07-06', checkOut: '2026-07-08' }, minStay2).minStay, 2);
const globalMin3 = cfgWith((c) => { c.settings.minStayNights = 3; });
expectThrows('global minimum stay of 3 applies', 'MIN_STAY', () => quote({ checkIn: '2026-07-06', checkOut: '2026-07-08' }, globalMin3));
const xmasMin3 = buildSeedConfig(undefined, {
  periods: [{ id: 'sp', name: 'NYE', startDate: '2026-12-30', endDate: '2027-01-01', minStay: 3, isActive: true }],
});
expectThrows('a stay touching a Special Peak with min 3 needs 3 nights', 'MIN_STAY', () =>
  quote({ checkIn: '2026-12-29', checkOut: '2026-12-31' }, xmasMin3)
);

// ---------------------------------------------------------------------------
console.log('\n§8  Inventory uplift: per night, +10% / +20%, add-ons not uplifted');
// ---------------------------------------------------------------------------
check('no uplift at 3 of 6', quote({ ...oneNight, inventory: { booked: 3, total: 6 } }).perNight[0].roomRate, 7500);
check('4 of 6 booked = +10%', quote({ ...oneNight, inventory: { booked: 4, total: 6 } }).perNight[0].roomRate, 8250);
check('5 of 6 booked = +20%', quote({ ...oneNight, inventory: { booked: 5, total: 6 } }).perNight[0].roomRate, 9000);
const perNightInv = quote({
  checkIn: '2026-07-06',
  checkOut: '2026-07-08',
  inventoryByNight: { '2026-07-06': { booked: 4, total: 6 }, '2026-07-07': { booked: 1, total: 6 } },
});
check('uplift applied only on the busy night', perNightInv.perNight.map((n) => n.roomRate), [8250, 7500]);
const upliftWithAddons = quote({ ...oneNight, ratePlan: 'BREAKFAST_INCLUDED', extraMattresses: 1, inventory: { booked: 5, total: 6 } });
check('breakfast is not uplifted', upliftWithAddons.breakfastTotal, 800);
check('mattress is not uplifted', upliftWithAddons.mattressTotal, 1250);

// ---------------------------------------------------------------------------
console.log('\n§7  Long stay eligibility: season, window, stacking');
// ---------------------------------------------------------------------------
check('Peak season gets no long-stay benefit', quote({ checkIn: '2026-06-04', checkOut: '2026-06-08' }).longStayApplied, false);
check('3-night stay is too short', quote({ checkIn: '2026-07-02', checkOut: '2026-07-05' }).longStayApplied, false);
const lsExpired = cfgWith((c) => { c.longStayRules[0].validTo = '2026-06-30'; });
check('rule outside its date window does not apply', quote({}, lsExpired).longStayApplied, false);
const lsWindow = cfgWith((c) => { c.longStayRules[0].validFrom = '2026-07-01'; c.longStayRules[0].validTo = '2026-07-31'; });
check('rule inside its date window applies', quote({}, lsWindow).longStayApplied, true);
const lsPartial = cfgWith((c) => { c.longStayRules[0].validTo = '2026-07-04'; });
check('only 3 nights inside the window: no benefit', quote({}, lsPartial).longStayApplied, false);

// Coupon vs Stay 4 Pay 3 — not stackable, so the guest gets the better one.
const bigCoupon = { code: 'BIG30', discountType: 'PERCENTAGE' as const, discountValue: 30 };
const smallCoupon = { code: 'SMALL10', discountType: 'PERCENTAGE' as const, discountValue: 10 };
const withBig = quote({ coupon: bigCoupon });
check('30% coupon (9,900) beats Stay 4 Pay 3 (7,500)', [withBig.couponDiscount, withBig.longStayApplied], [9900, false]);
const withSmall = quote({ coupon: smallCoupon });
check('Stay 4 Pay 3 (7,500) beats a 10% coupon (3,300)', [withSmall.longStayDiscount, withSmall.couponDiscount], [7500, 0]);
const stackable = cfgWith((c) => { c.longStayRules[0].stackableWithCoupon = true; });
const stacked = quote({ coupon: smallCoupon }, stackable);
check('stackable: 10% applies after the free night', [stacked.longStayDiscount, stacked.couponDiscount], [7500, 2550]);
check('coupon below its minimum amount is not applied', quote({ coupon: { ...bigCoupon, minAmount: 50000 } }).couponDiscount, 0);

// ---------------------------------------------------------------------------
console.log('\n§9  Last-minute / low-occupancy offers');
// ---------------------------------------------------------------------------
const lmBase = { ...oneNight, today: '2026-07-03', inventory: { booked: 2, total: 7 } };
check('seeded offer is off until an admin activates it', quote(lmBase).lastMinuteOffer, null);

const lmOn = cfgWith((c) => { c.lastMinuteOffers[0].isActive = true; });
const lmQuote = quote(lmBase, lmOn);
check('active offer: 10% off the room', lmQuote.promotionDiscount, 750);
check('active offer: accommodation 7,500 -> 6,750', lmQuote.accommodationTotal, 6750);
check('arrival 8 days out is outside the window', quote({ ...lmBase, today: '2026-06-28' }, lmOn).lastMinuteOffer, null);
check('3 cottages booked is above the threshold', quote({ ...lmBase, inventory: { booked: 3, total: 7 } }, lmOn).lastMinuteOffer, null);
check('no inventory data: offer cannot be verified', quote({ ...oneNight, today: '2026-07-03' }, lmOn).lastMinuteOffer, null);
const lmCapped = cfgWith((c) => { c.lastMinuteOffers[0].isActive = true; c.lastMinuteOffers[0].value = 25; });
check('room discount is capped at 10%', quote(lmBase, lmCapped).promotionDiscount, 750);

const lmBreakfast = cfgWith((c) => {
  c.lastMinuteOffers[0] = { ...c.lastMinuteOffers[0], isActive: true, offerType: 'COMPLIMENTARY_BREAKFAST', value: 0 };
});
const bfPlan = quote({ ...lmBase, ratePlan: 'BREAKFAST_INCLUDED' }, lmBreakfast);
check('complimentary breakfast waives the supplement', [bfPlan.breakfastTotal, bfPlan.promotionDiscount, bfPlan.subtotal], [800, 800, 7500]);
check('complimentary breakfast on Room Only is a free perk', quote(lmBase, lmBreakfast).subtotal, 7500);

const lmCredit = cfgWith((c) => {
  c.lastMinuteOffers[0] = { ...c.lastMinuteOffers[0], isActive: true, offerType: 'MEAL_CREDIT', value: 1500 };
});
const credit = quote(lmBase, lmCredit);
check('meal credit does not change the price', credit.subtotal, 7500);
check('meal credit is described', credit.lastMinuteOffer?.description, '₹1,500 meal credit at The Perch');

// 4-night Value stay: Stay 4 Pay 3 (7,500) vs 10% (3,300). Not stackable.
const lm4 = { checkIn: '2026-07-02', checkOut: '2026-07-06', today: '2026-06-30', inventory: { booked: 1, total: 7 } };
const bestOf = quote(lm4, lmOn);
check('not stackable: Stay 4 Pay 3 wins over 10% off', [bestOf.longStayDiscount, bestOf.promotionDiscount], [7500, 0]);
const lmStack = cfgWith((c) => { c.lastMinuteOffers[0].isActive = true; c.longStayRules[0].stackableWithOffers = true; });
const both = quote(lm4, lmStack);
check('stackable: 10% applies after the free night', [both.longStayDiscount, both.promotionDiscount], [7500, 2550]);

// ---------------------------------------------------------------------------
console.log('\n§3  Weekday/weekend and checkout-day handling');
// ---------------------------------------------------------------------------
const mixed = quote({ checkIn: '2026-07-09', checkOut: '2026-07-12' }); // Thu, Fri, Sat
check('3 nights charged, checkout day excluded', mixed.nights, 3);
check('Thu weekday, Fri weekend', [mixed.perNight[0].isWeekend, mixed.perNight[1].isWeekend], [false, true]);
check('Sun is a weekend', quote({ checkIn: '2026-07-05', checkOut: '2026-07-06' }).perNight[0].isWeekend, true);
check('mixed stay combines nightly rates', mixed.accommodationBeforeBenefit, 7500 + 8500 + 8500);
const cross = quote({ checkIn: '2026-08-31', checkOut: '2026-09-02' });
check('cross-season stay', cross.perNight.map((n) => n.seasonType), ['VALUE', 'REGULAR']);

// ---------------------------------------------------------------------------
console.log('\n§14 GST is calculated and displayed separately');
// ---------------------------------------------------------------------------
const taxed = quote({ ...oneNight });
check('7,500 tariff falls in the 12% slab', [taxed.taxBreakdown.map((t) => t.ratePercent), taxed.taxTotal, taxed.total], [[12], 900, 8400]);
const taxed18 = quote({ ...oneNight, adults: 4 });
check('9,500 tariff falls in the 18% slab', [taxed18.taxBreakdown.map((t) => t.ratePercent), taxed18.taxTotal], [[18], 1710]);

// ---------------------------------------------------------------------------
console.log('\n§12 Public "from" rates and §11 compatibility');
// ---------------------------------------------------------------------------
check('from rates', ['magpie-retreat', 'whistling-thrush', 'monal-haven', 'the-finch-nook'].map((s) => lowestFromRate(s, config)), [4500, 6500, 7500, 3500]);
check('Magpie Retreat is not compatible with 3 adults', occupancyProblem(byslug('magpie-retreat'), 3, [], config), 'Up to 2 adults');
check('Whistling Thrush is compatible with 4 adults', occupancyProblem(byslug('whistling-thrush'), 4, [], config), null);
check('Boutique with 2 children is not compatible', occupancyProblem(byslug('bulbul-nest'), 2, [3, 5], config), 'Up to 1 child');

// ---------------------------------------------------------------------------
console.log('\n§10 Validation and §16 snapshot');
// ---------------------------------------------------------------------------
expectThrows('checkout before check-in', 'INVALID_RANGE', () => quote({ checkIn: '2026-07-06', checkOut: '2026-07-06' }));
expectThrows('unknown cottage', 'COTTAGE_NOT_FOUND', () => quote({ cottageId: 'nope' }));
expectThrows('zero adults', 'INVALID_ADULTS', () => quote({ ...oneNight, adults: 0 }));
check('engine version stamped', s4p3.engineVersion, '2.1.1');
check('per-night breakdown exposed', s4p3.perNight.length, 4);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
