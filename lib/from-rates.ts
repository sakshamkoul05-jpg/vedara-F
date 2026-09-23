/**
 * Fetches the engine's public "from" rates for the cottage cards (spec §12).
 *
 * Returns a map keyed by both cottage id and slug, so callers can look up
 * whichever they hold. Fails soft: on any error it returns an empty map and the
 * pages fall back to their existing price field.
 */
export async function fetchFromRates(
  signal?: AbortSignal
): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/pricing/from-rates', { signal });
    if (!res.ok) return {};
    const json = await res.json();
    const map: Record<string, number> = {};
    for (const r of json.data ?? []) {
      if (typeof r.fromRate === 'number') {
        if (r.cottageId) map[r.cottageId] = r.fromRate;
        if (r.slug) map[r.slug] = r.fromRate;
      }
    }
    return map;
  } catch {
    return {};
  }
}
