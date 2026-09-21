/**
 * Emits the pricing seed SQL from `lib/pricing/seed-data.ts`.
 *
 * Keeping the generator pointed at the same module the engine tests use means
 * the rate card can never drift between what is tested and what is seeded.
 *
 * Run with:  npx tsx scripts/generate-pricing-seed.ts > ../backend/prisma/migrations/20260921_pricing_engine_v2/seed.sql
 */

import {
  SEED_BREAKFAST_BANDS,
  SEED_CATEGORY_RATES,
  SEED_CHILD_BANDS,
  SEED_COTTAGES,
  SEED_INVENTORY_TIERS,
  SEED_LONG_STAY_RULE,
  SEED_SEASONS,
  SEED_SETTINGS,
  SEED_TAX_SLABS,
} from '../lib/pricing/seed-data';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const cottageId = (slug: string) => `(SELECT "id" FROM "Cottage" WHERE "slug" = ${q(slug)})`;
const seasonId = (type: string) => `(SELECT "id" FROM "Season" WHERE "type" = ${q(type)}::"SeasonType")`;

const out: string[] = [];
const w = (s = '') => out.push(s);

w('-- ===========================================================================');
w('-- The Vedara — Pricing Engine v2.1 seed data');
w('-- ===========================================================================');
w('-- GENERATED FILE — do not edit by hand.');
w('-- Regenerate with: npx tsx scripts/generate-pricing-seed.ts');
w('--');
w('-- Seeds the rate card from specification v2.1. Idempotent: re-running');
w('-- updates existing rows rather than duplicating them. Every value seeded');
w('-- here is editable afterwards from the admin screens (spec §15).');
w('-- ===========================================================================');
w();
w('BEGIN;');
w();

// --- Cottage occupancy configuration ---------------------------------------
w('-- --- Cottage occupancy & bedding (spec §1, §5) -----------------------------');
w('-- NOTE: the spec lists Magpie Retreat as Boutique and Whistling Thrush as the');
w('-- bathtub Premium cottage. The official website copy and the live inventory');
w('-- have these the other way round, and the mapping below follows those two,');
w('-- as confirmed with the client.');
w();
for (const c of SEED_COTTAGES) {
  w(`UPDATE "Cottage" SET`);
  w(`  "pricingCategory"     = ${q(c.category)}::"CottageCategory",`);
  w(`  "baseAdults"          = ${c.baseAdults},`);
  w(`  "maxAdults"           = ${c.maxAdults},`);
  w(`  "maxOccupancy"        = ${c.maxOccupancy},`);
  w(`  "allowsExtraMattress" = ${c.allowsExtraMattress},`);
  w(`  "maxExtraMattresses"  = ${c.maxExtraMattresses},`);
  w(`  "publicDescriptor"    = ${q(c.publicDescriptor)}`);
  w(`WHERE "slug" = ${q(c.slug)};`);
  w();
}

// --- Seasons ----------------------------------------------------------------
w('-- --- Seasons (spec §5) -----------------------------------------------------');
w();
SEED_SEASONS.forEach((s, i) => {
  w(`INSERT INTO "Season" ("id", "name", "type", "months", "isActive", "sortOrder")`);
  w(
    `VALUES (gen_random_uuid()::text, ${q(s.name)}, ${q(s.type)}::"SeasonType", ${q(JSON.stringify(s.months))}::jsonb, true, ${i})`
  );
  w(`ON CONFLICT ("type") DO UPDATE SET`);
  w(`  "name" = EXCLUDED."name", "months" = EXCLUDED."months", "sortOrder" = EXCLUDED."sortOrder";`);
  w();
});

// --- Seasonal rates ---------------------------------------------------------
w('-- --- Seasonal rate matrices (spec §5) --------------------------------------');
w();
for (const season of SEED_SEASONS) {
  w(`-- ${season.name} — months ${season.months.join(', ')}`);
  for (const cottage of SEED_COTTAGES) {
    const tiers = SEED_CATEGORY_RATES[cottage.category][season.type];
    for (const [adults, [weekday, weekend]] of Object.entries(tiers)) {
      w(
        `INSERT INTO "SeasonRate" ("id", "seasonId", "cottageId", "adults", "weekdayRate", "weekendRate")`
      );
      w(
        `VALUES (gen_random_uuid()::text, ${seasonId(season.type)}, ${cottageId(cottage.slug)}, ${adults}, ${weekday}, ${weekend})`
      );
      w(`ON CONFLICT ("seasonId", "cottageId", "adults") DO UPDATE SET`);
      w(`  "weekdayRate" = EXCLUDED."weekdayRate", "weekendRate" = EXCLUDED."weekendRate";`);
    }
  }
  w();
}

// --- Breakfast bands --------------------------------------------------------
w('-- --- Breakfast supplements (spec §3.2) -------------------------------------');
w();
w('DELETE FROM "BreakfastBand";');
for (const b of SEED_BREAKFAST_BANDS) {
  w(
    `INSERT INTO "BreakfastBand" ("id", "label", "minAge", "maxAge", "pricePerNight", "isActive")`
  );
  w(
    `VALUES (gen_random_uuid()::text, ${q(b.label)}, ${b.minAge}, ${b.maxAge}, ${b.pricePerNight}, true);`
  );
}
w();

// --- Child bands ------------------------------------------------------------
w('-- --- Child & bedding policy (spec §4) --------------------------------------');
w();
w('DELETE FROM "ChildBand";');
for (const b of SEED_CHILD_BANDS) {
  w(
    `INSERT INTO "ChildBand" ("id", "label", "minAge", "maxAge", "chargedAsAdult", "accommodationCharge", "isActive")`
  );
  w(
    `VALUES (gen_random_uuid()::text, ${q(b.label)}, ${b.minAge}, ${b.maxAge}, ${b.chargedAsAdult}, ${b.accommodationCharge}, true);`
  );
}
w();

// --- Long stay --------------------------------------------------------------
w('-- --- Stay 4, Pay 3 (spec §7) -----------------------------------------------');
w('-- Recommended availability: Value and Regular enabled, High admin-controlled,');
w('-- Peak and Special Peak normally disabled.');
w();
const ls = SEED_LONG_STAY_RULE;
w('DELETE FROM "LongStayRule";');
w(
  `INSERT INTO "LongStayRule" ("id", "name", "nightsRequired", "nightsCharged", "enabledSeasonTypes", "cottageIds", "blackoutDates", "stackableWithCoupon", "isActive")`
);
w(
  `VALUES (gen_random_uuid()::text, ${q(ls.name)}, ${ls.nightsRequired}, ${ls.nightsCharged}, ${q(JSON.stringify(ls.enabledSeasonTypes))}::jsonb, '[]'::jsonb, '[]'::jsonb, ${ls.stackableWithCoupon}, ${ls.isActive});`
);
w();

// --- Inventory tiers --------------------------------------------------------
w('-- --- Inventory-based dynamic pricing (spec §8) -----------------------------');
w();
w('DELETE FROM "InventoryTier";');
for (const t of SEED_INVENTORY_TIERS) {
  w(
    `INSERT INTO "InventoryTier" ("id", "minBookedRatio", "maxBookedRatio", "upliftPercent", "isActive")`
  );
  w(
    `VALUES (gen_random_uuid()::text, ${t.minBookedRatio}, ${t.maxBookedRatio}, ${t.upliftPercent}, true);`
  );
}
w();

// --- Tax slabs --------------------------------------------------------------
w('-- --- GST slabs (spec §14) --------------------------------------------------');
w();
w('DELETE FROM "TaxSlab";');
for (const t of SEED_TAX_SLABS) {
  w(`INSERT INTO "TaxSlab" ("id", "name", "minTariff", "maxTariff", "ratePercent", "isActive")`);
  w(
    `VALUES (gen_random_uuid()::text, ${q(t.name)}, ${t.minTariff}, ${t.maxTariff === null ? 'NULL' : t.maxTariff}, ${t.ratePercent}, true);`
  );
}
w();

// --- Settings ---------------------------------------------------------------
w('-- --- Global pricing settings (spec §15) ------------------------------------');
w();
const settingLabels: Record<string, string> = {
  weekendDays: 'Days counted as weekend (0=Sun … 6=Sat)',
  extraMattressPrice: 'Extra mattress price per night',
  adultAgeThreshold: 'Age at which a guest is treated as an adult',
  inventoryPricingEnabled: 'Inventory-based dynamic pricing on/off',
  inventoryUpliftCeilingPercent: 'Maximum inventory uplift (%)',
  longStayEnabled: 'Long-stay benefit on/off',
  roundingMode: 'Rounding applied to the final payable amount',
};
for (const [key, value] of Object.entries(SEED_SETTINGS)) {
  w(`INSERT INTO "PricingSetting" ("key", "value", "label")`);
  w(
    `VALUES (${q(key)}, ${q(JSON.stringify(value))}::jsonb, ${q(settingLabels[key] ?? key)})`
  );
  w(`ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "label" = EXCLUDED."label";`);
}
w();

w('COMMIT;');
w();

console.log(out.join('\n'));
