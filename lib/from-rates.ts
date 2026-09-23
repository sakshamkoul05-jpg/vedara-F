/**
 * Public pricing information for the website (spec §12, §13).
 *
 * Fails soft: on any error the fetchers return empty data and the pages fall
 * back to their existing fields.
 */

export interface PublicCottagePricing {
  cottageId: string;
  slug: string;
  name: string;
  category: 'STUDIO' | 'BOUTIQUE' | 'PREMIUM' | 'SIGNATURE';
  fromRate: number | null;
  publicDescriptor: string | null;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  allowsExtraMattress: boolean;
  extraMattressPrice: number | null;
}

export interface PublicPricingPolicy {
  adultAgeThreshold: number;
  freeStayUpToAge: number;
  adultBreakfastPrice: number | null;
  childBreakfast: { minAge: number; maxAge: number; pricePerNight: number }[];
  extraMattressPrice: number;
}

export interface PublicPricing {
  cottages: PublicCottagePricing[];
  policy: PublicPricingPolicy | null;
}

export async function fetchPublicPricing(signal?: AbortSignal): Promise<PublicPricing> {
  try {
    const res = await fetch('/api/pricing/from-rates', { signal });
    if (!res.ok) return { cottages: [], policy: null };
    const json = await res.json();
    return { cottages: json.data ?? [], policy: json.policy ?? null };
  } catch {
    return { cottages: [], policy: null };
  }
}

/**
 * The engine's "from" rates, keyed by both cottage id and slug so callers can
 * look up whichever they hold.
 */
export async function fetchFromRates(signal?: AbortSignal): Promise<Record<string, number>> {
  const { cottages } = await fetchPublicPricing(signal);
  const map: Record<string, number> = {};
  for (const c of cottages) {
    if (typeof c.fromRate === 'number') {
      map[c.cottageId] = c.fromRate;
      map[c.slug] = c.fromRate;
    }
  }
  return map;
}

/** Public details keyed by id and slug. */
export function indexPublicPricing(
  cottages: PublicCottagePricing[]
): Record<string, PublicCottagePricing> {
  const map: Record<string, PublicCottagePricing> = {};
  for (const c of cottages) {
    map[c.cottageId] = c;
    map[c.slug] = c;
  }
  return map;
}
