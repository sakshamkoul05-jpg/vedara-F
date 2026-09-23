/**
 * Customer-facing pricing copy from spec v2.1 §12, §13 and §18.
 *
 * §12 and §18 are fixed wording and reproduced verbatim. §13 quotes figures —
 * child ages, breakfast supplements, the mattress price and which cottages
 * offer a mattress — so it is assembled from the live configuration. With the
 * seeded configuration it reads exactly as the spec does; if an admin changes
 * a rate, the copy follows rather than going stale (spec §16).
 */

import type { PublicCottagePricing, PublicPricingPolicy } from '@/lib/from-rates';

/** Spec §12 footnote for "From ₹X/night*". */
export const RATE_FOOTNOTE =
  '*Rates vary according to dates, occupancy, season and availability. GST extra as applicable.';

/** Spec §18, verbatim. */
export const PRICING_DISCLAIMER = [
  'Rates are subject to availability and may vary according to stay dates, season, occupancy and demand. Special tariffs may apply during holidays, long weekends and peak periods. Long-stay benefits and promotional offers are subject to applicable dates, availability and exclusions.',
  'GST extra as applicable.',
  'Any applicable breakfast, extra-mattress, meal, activity or other charges will be shown during booking. The complete tariff, applicable taxes and final payable amount will be displayed before payment.',
];

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** "A, B or C" / "A, B and C". */
function listNames(names: string[], conjunction: 'or' | 'and'): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} ${conjunction} ${names[names.length - 1]}`;
}

// Order matching the spec's own sentences: Boutique before the studio, Premium
// before Signature.
const CATEGORY_ORDER: Record<string, number> = { BOUTIQUE: 0, STUDIO: 1, PREMIUM: 2, SIGNATURE: 3 };

/**
 * The two §13 paragraphs. Returns an empty list until pricing has loaded, so
 * nothing inaccurate is ever shown.
 */
export function childBreakfastBeddingCopy(
  cottages: PublicCottagePricing[],
  policy: PublicPricingPolicy | null
): string[] {
  if (!policy || cottages.length === 0) return [];

  const paragraphs: string[] = [];

  // --- Children and breakfast ---------------------------------------------
  const sentences = [
    `Children up to ${policy.freeStayUpToAge} years stay complimentary when sharing existing bedding with parents.`,
  ];
  const free = policy.childBreakfast.filter((b) => b.pricePerNight === 0);
  const paid = policy.childBreakfast.filter((b) => b.pricePerNight > 0);
  const clauses: string[] = [];
  for (const b of free) {
    clauses.push(`Children aged ${b.minAge}–${b.maxAge} receive complimentary breakfast when a breakfast-inclusive plan is selected`);
  }
  for (const b of paid) {
    clauses.push(`breakfast for children aged ${b.minAge}–${b.maxAge} is ${rupees(b.pricePerNight)} per child, per night`);
  }
  if (clauses.length) {
    const joined = clauses.join('; ');
    sentences.push(joined.charAt(0).toUpperCase() + joined.slice(1) + '.');
  }
  sentences.push(`Guests aged ${policy.adultAgeThreshold} years and above are treated as adults.`);
  paragraphs.push(sentences.join(' '));

  // --- Bedding -------------------------------------------------------------
  const ordered = [...cottages].sort(
    (a, b) => (CATEGORY_ORDER[a.category] ?? 9) - (CATEGORY_ORDER[b.category] ?? 9)
  );
  const without = ordered.filter((c) => !c.allowsExtraMattress).map((c) => c.name);
  const withMattress = ordered.filter((c) => c.allowsExtraMattress);

  const bedding: string[] = [];
  if (without.length) {
    bedding.push(`No extra bed or mattress is available in ${listNames(without, 'or')}.`);
  }
  if (withMattress.length) {
    const prices = new Set(withMattress.map((c) => c.extraMattressPrice ?? policy.extraMattressPrice));
    const priceText =
      prices.size === 1 ? ` at ${rupees([...prices][0])} per night` : ', charged per night';
    bedding.push(
      `An extra mattress is available in ${listNames(withMattress.map((c) => c.name), 'and')}${priceText}, subject to permitted occupancy. The extra bedding provided is a mattress only.`
    );
  }
  if (bedding.length) paragraphs.push(bedding.join(' '));

  paragraphs.push('GST extra as applicable.');
  return paragraphs;
}
