import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Where traffic comes from, and where bookings come from.
 *
 * Both numbers are reported together on purpose. Volume alone flatters
 * whichever market browses most; the pairing is what tells you which places are
 * worth advertising in.
 */

/** Country codes are what the edge gives us; these are what people read. */
const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India', IL: 'Israel', US: 'United States', GB: 'United Kingdom', AE: 'UAE',
  AU: 'Australia', SG: 'Singapore', CA: 'Canada', DE: 'Germany', FR: 'France',
  ES: 'Spain', IT: 'Italy', NL: 'Netherlands', RU: 'Russia', CN: 'China',
  JP: 'Japan', KR: 'South Korea', BR: 'Brazil', PT: 'Portugal', PL: 'Poland',
  CH: 'Switzerland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', BE: 'Belgium',
  IE: 'Ireland', NZ: 'New Zealand', ZA: 'South Africa', TH: 'Thailand',
  MY: 'Malaysia', ID: 'Indonesia', VN: 'Vietnam', TR: 'Turkey', SA: 'Saudi Arabia',
  NP: 'Nepal', LK: 'Sri Lanka', BD: 'Bangladesh', PK: 'Pakistan',
};

type Bucket = { key: string; label: string; views: number; visits: Set<string>; conversions: Set<string> };

function bucketOf(map: Map<string, Bucket>, key: string, label: string): Bucket {
  let bucket = map.get(key);
  if (!bucket) {
    bucket = { key, label, views: 0, visits: new Set(), conversions: new Set() };
    map.set(key, bucket);
  }
  return bucket;
}

/** Views count every hit; visits and conversions are counted once per session. */
function summarise(map: Map<string, Bucket>, limit: number) {
  return [...map.values()]
    .map(({ key, label, views, visits, conversions }) => ({
      key,
      label,
      views,
      visits: visits.size,
      conversions: conversions.size,
      conversionRate: visits.size ? Math.round((conversions.size / visits.size) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit);
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  if (!hasServiceClient()) {
    return NextResponse.json({ error: 'Analytics storage is not configured.' }, { status: 503 });
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? 30), 1), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getServiceClient()
    .from('PageView')
    .select('country, region, city, path, referrer, locale, deviceType, utmSource, utmCampaign, sessionId, converted, createdAt')
    .gte('createdAt', since)
    // Enough to be representative without pulling an unbounded result set; the
    // page says so when the cap is hit.
    .limit(50000);

  if (error) {
    console.error('Traffic report failed:', error.message);
    return NextResponse.json({ error: 'Could not load the traffic report.' }, { status: 500 });
  }

  const rows = data ?? [];
  const countries = new Map<string, Bucket>();
  const cities = new Map<string, Bucket>();
  const sources = new Map<string, Bucket>();
  const locales = new Map<string, Bucket>();
  const devices = new Map<string, Bucket>();

  const allVisits = new Set<string>();
  const allConversions = new Set<string>();

  for (const row of rows) {
    const session = row.sessionId ?? '';
    allVisits.add(session);
    if (row.converted) allConversions.add(session);

    const countryCode = row.country ?? 'unknown';
    const countryLabel = row.country ? COUNTRY_NAMES[row.country] ?? row.country : 'Unknown';

    const targets: [Map<string, Bucket>, string, string][] = [
      [countries, countryCode, countryLabel],
      [
        cities,
        `${countryCode}:${row.city ?? 'unknown'}`,
        row.city ? `${row.city}, ${countryLabel}` : `Unknown, ${countryLabel}`,
      ],
      // An untagged visit with no referrer is someone who typed the address or
      // came from a bookmark, which is worth distinguishing from a gap in data.
      [
        sources,
        row.utmSource ?? (row.referrer ? 'referral' : 'direct'),
        row.utmSource ?? (row.referrer ? new URL(row.referrer, 'https://x').hostname || 'Referral' : 'Direct'),
      ],
      [locales, row.locale ?? 'unknown', row.locale ?? 'Unknown'],
      [devices, row.deviceType ?? 'unknown', row.deviceType ?? 'Unknown'],
    ];

    for (const [map, key, label] of targets) {
      const bucket = bucketOf(map, key, label);
      bucket.views += 1;
      bucket.visits.add(session);
      if (row.converted) bucket.conversions.add(session);
    }
  }

  return NextResponse.json({
    data: {
      days,
      totals: {
        views: rows.length,
        visits: allVisits.size,
        conversions: allConversions.size,
        conversionRate: allVisits.size
          ? Math.round((allConversions.size / allVisits.size) * 1000) / 10
          : 0,
      },
      /** True when the row cap was reached, so the page can say the figures are partial. */
      truncated: rows.length >= 50000,
      countries: summarise(countries, 20),
      cities: summarise(cities, 15),
      sources: summarise(sources, 10),
      locales: summarise(locales, 20),
      devices: summarise(devices, 5),
    },
  });
}
