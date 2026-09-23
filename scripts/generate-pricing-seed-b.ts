/**
 * Emits the part-B pricing seed SQL (run after migration 20260923).
 *
 * Unlike part A this must be safe to run on a live, admin-edited database, so:
 *   - only Magpie Retreat and Whistling Thrush — whose category changes to
 *     match spec §1 exactly — have their rates rewritten;
 *   - every other rate, band and rule is inserted only if it is missing;
 *   - rate rows above a cottage's new adult limit are removed.
 *
 * Run with:
 *   npx tsx scripts/generate-pricing-seed-b.ts > ../backend/prisma/migrations/20260923_pricing_engine_v2_1b/seed.sql
 */

import {
  SEED_CATEGORY_RATES,
  SEED_COTTAGES,
  SEED_LAST_MINUTE_OFFERS,
  SEED_SEASONS,
  SEED_SETTINGS,
} from '../lib/pricing/seed-data';

/** Cottages whose category changes in this release, so their rates must be rewritten. */
const RECATEGORISED = new Set(['magpie-retreat', 'whistling-thrush']);

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const cottageId = (slug: string) => `(SELECT "id" FROM "Cottage" WHERE "slug" = ${q(slug)})`;
const seasonId = (type: string) => `(SELECT "id" FROM "Season" WHERE "type" = ${q(type)}::"SeasonType")`;

const out: string[] = [];
const w = (s = '') => out.push(s);

w('-- ===========================================================================');
w('-- The Vedara — Pricing Engine v2.1 part B seed');
w('-- ===========================================================================');
w('-- GENERATED FILE — do not edit by hand.');
w('-- Regenerate with: npx tsx scripts/generate-pricing-seed-b.ts');
w('--');
w('-- Run AFTER migration.sql in this folder. Safe on a live database: it only');
w('-- rewrites the two cottages whose category changes, and otherwise inserts');
w('-- what is missing without touching values an admin may have edited.');
w('-- ===========================================================================');
w();
w('BEGIN;');
w();

w('-- --- Cottage inventory, exactly as spec §1 and §12 ------------------------');
w('-- Magpie Retreat is Boutique (2 adults, no mattress); Whistling Thrush is');
w('-- Premium (bathtub, up to 4 adults, mattress), as confirmed with the client.');
w('-- "capacity" (the legacy "N guests" figure) is aligned with maxOccupancy.');
w();
for (const c of SEED_COTTAGES) {
  w(`UPDATE "Cottage" SET`);
  w(`  "pricingCategory"     = ${q(c.category)}::"CottageCategory",`);
  w(`  "baseAdults"          = ${c.baseAdults},`);
  w(`  "maxAdults"           = ${c.maxAdults},`);
  w(`  "maxChildren"         = ${c.maxChildren},`);
  w(`  "maxOccupancy"        = ${c.maxOccupancy},`);
  w(`  "capacity"            = ${c.maxOccupancy},`);
  w(`  "allowsExtraMattress" = ${c.allowsExtraMattress},`);
  w(`  "maxExtraMattresses"  = ${c.maxExtraMattresses},`);
  w(`  "publicDescriptor"    = ${q(c.publicDescriptor)}`);
  w(`WHERE "slug" = ${q(c.slug)};`);
  w();
}

w('-- --- Seasonal rates --------------------------------------------------------');
w('-- Recategorised cottages: rates rewritten. All others: inserted if missing.');
w();
for (const season of SEED_SEASONS) {
  for (const cottage of SEED_COTTAGES) {
    const tiers = SEED_CATEGORY_RATES[cottage.category][season.type];
    const rewrite = RECATEGORISED.has(cottage.slug);
    for (const [adults, [weekday, weekend]] of Object.entries(tiers)) {
      w(`INSERT INTO "SeasonRate" ("id", "seasonId", "cottageId", "adults", "weekdayRate", "weekendRate")`);
      w(`VALUES (gen_random_uuid()::text, ${seasonId(season.type)}, ${cottageId(cottage.slug)}, ${adults}, ${weekday}, ${weekend})`);
      w(
        rewrite
          ? `ON CONFLICT ("seasonId", "cottageId", "adults") DO UPDATE SET "weekdayRate" = EXCLUDED."weekdayRate", "weekendRate" = EXCLUDED."weekendRate";`
          : `ON CONFLICT ("seasonId", "cottageId", "adults") DO NOTHING;`
      );
    }
  }
}
w();

w('-- Occupancy tiers a cottage can no longer take (Magpie Retreat 3-4 adults).');
w(`DELETE FROM "SeasonRate" r USING "Cottage" c`);
w(`WHERE r."cottageId" = c."id" AND c."maxAdults" IS NOT NULL AND r."adults" > c."maxAdults";`);
w(`DELETE FROM "SpecialPeakRate" r USING "Cottage" c`);
w(`WHERE r."cottageId" = c."id" AND c."maxAdults" IS NOT NULL AND r."adults" > c."maxAdults";`);
w();

w('-- Special Peak rates for any existing period, for the recategorised cottages.');
for (const cottage of SEED_COTTAGES.filter((c) => RECATEGORISED.has(c.slug))) {
  for (const [adults, [rate]] of Object.entries(SEED_CATEGORY_RATES[cottage.category].SPECIAL_PEAK)) {
    w(`INSERT INTO "SpecialPeakRate" ("id", "periodId", "cottageId", "adults", "rate")`);
    w(`SELECT gen_random_uuid()::text, p."id", ${cottageId(cottage.slug)}, ${adults}, ${rate} FROM "SpecialPeakPeriod" p`);
    w(`ON CONFLICT ("periodId", "cottageId", "adults") DO UPDATE SET "rate" = EXCLUDED."rate";`);
  }
}
w();

w('-- --- §9 Last-minute offer: seeded OFF ("Initially require admin activation")');
for (const o of SEED_LAST_MINUTE_OFFERS) {
  w(`INSERT INTO "LastMinuteOffer" ("id", "name", "offerType", "value", "daysBeforeArrival", "maxBookedCottages", "cottageIds", "stackableWithCoupon", "isActive")`);
  w(`SELECT gen_random_uuid()::text, ${q(o.name)}, ${q(o.offerType)}::"LastMinuteOfferType", ${o.value}, ${o.daysBeforeArrival}, ${o.maxBookedCottages}, '[]'::jsonb, ${o.stackableWithCoupon}, ${o.isActive}`);
  w(`WHERE NOT EXISTS (SELECT 1 FROM "LastMinuteOffer");`);
}
w();

w('-- --- §15 Global minimum stay (left alone if an admin has set it) ----------');
w(`INSERT INTO "PricingSetting" ("key", "value", "label")`);
w(`VALUES ('minStayNights', ${q(JSON.stringify(SEED_SETTINGS.minStayNights))}::jsonb, 'Minimum stay in nights (all dates)')`);
w(`ON CONFLICT ("key") DO NOTHING;`);
w();

w('-- --- Guest-facing content that contradicted the spec ---------------------');
w('-- The FAQ promised a complimentary breakfast with every stay; spec §3.2 sells');
w('-- breakfast as the Breakfast Included rate plan. The café was also renamed');
w('-- from Café Charade to The Perch, which only reached the code, not this data.');
w();
w(`UPDATE "FAQ" SET "answer" = ${q(
  'Breakfast is served daily from 7:30 AM to 10:00 AM at The Perch. Add it by choosing the Breakfast Included rate plan when you book: ₹400 per adult per night, complimentary for children aged 0–5 and ₹250 per night for children aged 6–11. GST extra as applicable.'
)}`);
w(`WHERE "question" = 'Is breakfast included?';`);
w(`UPDATE "FAQ" SET "question" = REPLACE("question", 'Café Charade', 'The Perch'), "answer" = REPLACE("answer", 'Café Charade', 'The Perch')`);
w(`WHERE "question" LIKE '%Café Charade%' OR "answer" LIKE '%Café Charade%';`);
w(`UPDATE "Testimonial" SET "content" = REPLACE("content", 'Café Charade', 'The Perch') WHERE "content" LIKE '%Café Charade%';`);
w(`UPDATE "CafeItem" SET "name" = 'The Perch Grand Breakfast' WHERE "name" = 'The Charade Grand Breakfast';`);
w(`UPDATE "SiteSetting" SET "value" = REPLACE("value"::text, 'Café Charade', 'The Perch')::jsonb`);
w(`WHERE "value"::text LIKE '%Café Charade%';`);
w();

w('COMMIT;');
w();

console.log(out.join('\n'));
