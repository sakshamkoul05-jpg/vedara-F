/**
 * Engine tests covering the Developer Acceptance Checklist (spec v2.1 §17)
 * and the worked examples in §7 and §14.
 *
 * Run with:  npx tsx lib/pricing/engine.test.ts
 */

import { buildSeedConfig } from './build-config';
import { calculateQuote } from './engine';
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

// ---------------------------------------------------------------------------
console.log('\n§5  All four seasonal matrices return correct rates');
// ---------------------------------------------------------------------------
// 2026-07-06 is a Monday (weekday), 2026-07-03 a Friday (weekend).
const seasonCases: [string, string, string, number][] = [
  ['Value weekday  (Jul, Signature, 2ad)', 'monal-haven', '2026-07-06', 7500],
  ['Value weekend  (Jul, Signature, 2ad)', 'monal-haven', '2026-07-03', 8500],
  ['Regular weekday (Sep, Signature, 2ad)', 'monal-haven', '2026-09-07', 8000],
  ['High weekday   (Oct, Signature, 2ad)', 'monal-haven', '2026-10-05', 8500],
  ['Peak weekday   (May, Signature, 2ad)', 'monal-haven', '2026-05-04', 9000],
  ['Value weekday  (Jul, Boutique, 2ad)', 'bulbul-nest', '2026-07-06', 4500],
  ['Peak weekend   (Jun, Boutique, 2ad)', 'bulbul-nest', '2026-06-05', 7000],
  ['Value weekday  (Jul, Premium, 2ad)', 'magpie-retreat', '2026-07-06', 6500],
  ['Value weekday  (Jul, Studio, 2ad)', 'the-finch-nook', '2026-07-06', 3500],
];
for (const [name, cottageId, date, expected] of seasonCases) {
  const nextDay = new Date(Date.parse(date + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
  const q = quote({ cottageId, checkIn: date, checkOut: nextDay });
  check(name, q.perNight[0].roomRate, expected);
}

// ---------------------------------------------------------------------------
console.log('\n§17 3rd and 4th adult increments work for the larger cottages');
// ---------------------------------------------------------------------------
check('Signature 3 adults, Value weekday', quote({ adults: 3, checkIn: '2026-07-06', checkOut: '2026-07-07' }).perNight[0].roomRate, 8500);
check('Signature 4 adults, Value weekday', quote({ adults: 4, checkIn: '2026-07-06', checkOut: '2026-07-07' }).perNight[0].roomRate, 9500);
check('Premium 4 adults, Peak weekend', quote({ cottageId: 'magpie-retreat', adults: 4, checkIn: '2026-06-05', checkOut: '2026-06-06' }).perNight[0].roomRate, 11000);
expectThrows('Boutique rejects a 3rd adult', 'OVER_ADULT_CAPACITY', () =>
  quote({ cottageId: 'bulbul-nest', adults: 3, checkIn: '2026-07-06', checkOut: '2026-07-07' })
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
check('only one night is complimentary', s4p3.perNight.filter((p) => p.isComplimentary).length, 1);

// ---------------------------------------------------------------------------
console.log('\n§14 Checkout breakdown — breakfast on all four nights');
// ---------------------------------------------------------------------------
const withBf = quote({ checkIn: '2026-07-02', checkOut: '2026-07-06', ratePlan: 'BREAKFAST_INCLUDED' });
check('breakfast 2 adults x 4 nights = 3,200', withBf.breakfastTotal, 3200);
check('breakfast charged on the complimentary night too', withBf.perNight.find((p) => p.isComplimentary)?.breakfastTotal, 800);
check('accommodation still 25,500 with breakfast plan', withBf.accommodationTotal, 25500);
check('subtotal = 25,500 + 3,200', withBf.subtotal, 28700);

// ---------------------------------------------------------------------------
console.log('\n§17 Child policy: 0-11 sharing bedding has zero accommodation charge');
// ---------------------------------------------------------------------------
const oneNight = { checkIn: '2026-07-06', checkOut: '2026-07-07' };
const noKids = quote({ ...oneNight, adults: 2 });
const withKids = quote({ ...oneNight, adults: 2, childAges: [3, 9] });
check('two children add nothing to accommodation', withKids.accommodationTotal, noKids.accommodationTotal);
check('children are not promoted to adults', withKids.billableAdults, 2);

// ---------------------------------------------------------------------------
console.log('\n§17 Child breakfast: 0-5 = 0, 6-11 = 250, 12+ = adult rate');
// ---------------------------------------------------------------------------
const bfBase = quote({ ...oneNight, adults: 2, ratePlan: 'BREAKFAST_INCLUDED' }).breakfastTotal;
check('2 adults = 800', bfBase, 800);
check('+ child aged 4 adds 0', quote({ ...oneNight, adults: 2, childAges: [4], ratePlan: 'BREAKFAST_INCLUDED' }).breakfastTotal, 800);
check('+ child aged 8 adds 250', quote({ ...oneNight, adults: 2, childAges: [8], ratePlan: 'BREAKFAST_INCLUDED' }).breakfastTotal, 1050);
check('+ guest aged 13 adds 400 (adult rate)', quote({ ...oneNight, adults: 2, childAges: [13], ratePlan: 'BREAKFAST_INCLUDED' }).breakfastTotal, 1200);

// A 12+ "child" counts as an adult for the room tariff too.
check('guest aged 13 becomes the 3rd adult', quote({ ...oneNight, adults: 2, childAges: [13] }).billableAdults, 3);
check('and triggers the 3rd-adult rate', quote({ ...oneNight, adults: 2, childAges: [13] }).perNight[0].roomRate, 8500);

// ---------------------------------------------------------------------------
console.log('\n§5.1/§5.2 Extra mattress availability');
// ---------------------------------------------------------------------------
expectThrows('Boutique never accepts a mattress', 'MATTRESS_NOT_AVAILABLE', () =>
  quote({ ...oneNight, cottageId: 'bulbul-nest', extraMattresses: 1 })
);
expectThrows('Studio never accepts a mattress', 'MATTRESS_NOT_AVAILABLE', () =>
  quote({ ...oneNight, cottageId: 'the-finch-nook', extraMattresses: 1 })
);
check('Signature mattress = 1,250/night', quote({ ...oneNight, extraMattresses: 1 }).mattressTotal, 1250);
check('Premium mattress = 1,250/night', quote({ ...oneNight, cottageId: 'magpie-retreat', extraMattresses: 1 }).mattressTotal, 1250);

// Mattress is an add-on and is not discounted by Stay 4 Pay 3 (spec §5.2).
const mattress4 = quote({ checkIn: '2026-07-02', checkOut: '2026-07-06', extraMattresses: 1 });
check('mattress charged on all 4 nights incl. the free one', mattress4.mattressTotal, 5000);
check('long stay discount unchanged by mattress', mattress4.longStayDiscount, 7500);

// ---------------------------------------------------------------------------
console.log('\n§6  Special Peak override');
// ---------------------------------------------------------------------------
const xmasConfig = buildSeedConfig(undefined, {
  periods: [
    { id: 'sp-xmas', name: 'Christmas & New Year', startDate: '2026-12-24', endDate: '2027-01-02', isActive: true },
  ],
});
// 2026-12-25 is a Friday; High season would be 9,500 for Signature at 2 adults.
check('Special Peak overrides the seasonal weekend rate', quote({ checkIn: '2026-12-25', checkOut: '2026-12-26' }, xmasConfig).perNight[0].roomRate, 10500);
check('Special Peak is flat — no weekday/weekend split', quote({ checkIn: '2026-12-28', checkOut: '2026-12-29' }, xmasConfig).perNight[0].roomRate, 10500);
check('Special Peak 4 adults', quote({ checkIn: '2026-12-25', checkOut: '2026-12-26', adults: 4 }, xmasConfig).perNight[0].roomRate, 12500);
check('Special Peak Boutique', quote({ cottageId: 'bulbul-nest', checkIn: '2026-12-25', checkOut: '2026-12-26' }, xmasConfig).perNight[0].roomRate, 7000);
check('night outside the period falls back to High', quote({ checkIn: '2026-12-20', checkOut: '2026-12-21' }, xmasConfig).perNight[0].roomRate, 9500);

// ---------------------------------------------------------------------------
console.log('\n§8  Inventory uplift: +10% and +20%, add-ons not uplifted');
// ---------------------------------------------------------------------------
const base = quote({ ...oneNight, ratePlan: 'BREAKFAST_INCLUDED', extraMattresses: 1 });
const at4of6 = quote({ ...oneNight, ratePlan: 'BREAKFAST_INCLUDED', extraMattresses: 1, inventory: { booked: 4, total: 6 } });
const at5of6 = quote({ ...oneNight, ratePlan: 'BREAKFAST_INCLUDED', extraMattresses: 1, inventory: { booked: 5, total: 6 } });
check('no uplift below threshold', quote({ ...oneNight, inventory: { booked: 3, total: 6 } }).perNight[0].roomRate, 7500);
check('4 of 6 booked = +10%', at4of6.perNight[0].roomRate, 8250);
check('5 of 6 booked = +20%', at5of6.perNight[0].roomRate, 9000);
check('breakfast is not uplifted', at5of6.breakfastTotal, base.breakfastTotal);
check('mattress is not uplifted', at5of6.mattressTotal, base.mattressTotal);
// Ratio thresholds scale to 7 cottages.
check('5 of 7 booked = +10%', quote({ ...oneNight, inventory: { booked: 5, total: 7 } }).perNight[0].roomRate, 8250);
check('6 of 7 booked = +20%', quote({ ...oneNight, inventory: { booked: 6, total: 7 } }).perNight[0].roomRate, 9000);

// ---------------------------------------------------------------------------
console.log('\n§7  Long stay eligibility by season');
// ---------------------------------------------------------------------------
// Peak is disabled in the seeded rule, so a 4-night June stay gets no benefit.
const peakStay = quote({ checkIn: '2026-06-04', checkOut: '2026-06-08' });
check('Peak season gets no long-stay benefit', peakStay.longStayApplied, false);
check('Peak season discount is zero', peakStay.longStayDiscount, 0);
check('3-night Value stay is too short', quote({ checkIn: '2026-07-02', checkOut: '2026-07-05' }).longStayApplied, false);

// ---------------------------------------------------------------------------
console.log('\n§3  Weekday/weekend and checkout-day handling');
// ---------------------------------------------------------------------------
const mixed = quote({ checkIn: '2026-07-09', checkOut: '2026-07-12' }); // Thu, Fri, Sat
check('3 nights charged, checkout day excluded', mixed.nights, 3);
check('Thu is a weekday', mixed.perNight[0].isWeekend, false);
check('Fri is a weekend', mixed.perNight[1].isWeekend, true);
check('Sun is a weekend', quote({ checkIn: '2026-07-05', checkOut: '2026-07-06' }).perNight[0].isWeekend, true);
check('Mon is a weekday', quote({ checkIn: '2026-07-06', checkOut: '2026-07-07' }).perNight[0].isWeekend, false);
check('mixed stay combines nightly rates', mixed.accommodationBeforeBenefit, 7500 + 8500 + 8500);

// Cross-season stay: 31 Aug (Value) into 1 Sep (Regular).
const crossSeason = quote({ checkIn: '2026-08-31', checkOut: '2026-09-02' });
check('cross-season night 1 is Value', crossSeason.perNight[0].seasonType, 'VALUE');
check('cross-season night 2 is Regular', crossSeason.perNight[1].seasonType, 'REGULAR');

// ---------------------------------------------------------------------------
console.log('\n§14 GST is calculated and displayed separately');
// ---------------------------------------------------------------------------
const taxed = quote({ ...oneNight, adults: 2 }); // 7,500/night -> 12% slab
check('7,500 tariff falls in the 12% slab', taxed.taxBreakdown.map((t) => t.ratePercent), [12]);
check('tax = 12% of 7,500', taxed.taxTotal, 900);
check('total = 7,500 + 900', taxed.total, 8400);
const taxed18 = quote({ ...oneNight, adults: 4 }); // 9,500/night -> 18% slab
check('9,500 tariff falls in the 18% slab', taxed18.taxBreakdown.map((t) => t.ratePercent), [18]);
check('tax = 18% of 9,500', taxed18.taxTotal, 1710);

// ---------------------------------------------------------------------------
console.log('\n§10 Validation');
// ---------------------------------------------------------------------------
expectThrows('checkout before check-in', 'INVALID_RANGE', () => quote({ checkIn: '2026-07-06', checkOut: '2026-07-06' }));
expectThrows('unknown cottage', 'COTTAGE_NOT_FOUND', () => quote({ cottageId: 'nope' }));
expectThrows('zero adults', 'INVALID_ADULTS', () => quote({ ...oneNight, adults: 0 }));
expectThrows('over total occupancy', 'OVER_CAPACITY', () => quote({ ...oneNight, adults: 4, childAges: [3, 4] }));

// ---------------------------------------------------------------------------
console.log('\n§16 Pricing snapshot fields are present');
// ---------------------------------------------------------------------------
check('engine version stamped', s4p3.engineVersion, '2.1.0');
check('per-night breakdown exposed', s4p3.perNight.length, 4);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
