import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { newId } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Page-view collection.
 *
 * The point of this is the question "where is our traffic actually coming
 * from", so that advertising can be aimed at those places rather than guessed
 * at. It stores the coarse location the edge already knows and nothing else:
 * no IP address, no user agent string, no identifier that outlives the tab.
 *
 * `sessionId` is a random value the browser keeps in sessionStorage for the
 * length of one visit. It exists so that several page views can be recognised
 * as one visit and so a booking can mark that visit converted. It is never
 * joined to a guest, a booking or an email address.
 */

const collectSchema = z.object({
  path: z.string().trim().min(1).max(300),
  referrer: z.string().trim().max(500).optional().nullable(),
  locale: z.string().trim().max(12).optional().nullable(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional().nullable(),
  sessionId: z.string().trim().min(8).max(64),
  utmSource: z.string().trim().max(100).optional().nullable(),
  utmMedium: z.string().trim().max(100).optional().nullable(),
  utmCampaign: z.string().trim().max(100).optional().nullable(),
});

/** A real visitor does not load hundreds of pages in ten minutes. */
const MAX_VIEWS = 120;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * Obvious automated traffic, which would otherwise swamp the country counts
 * with whichever region a crawler happens to run in.
 */
const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pingdom|curl|wget|python-requests|axios|monitor/i;

/**
 * Geo headers, as set by the platform.
 *
 * Vercel populates the `x-vercel-ip-*` family at the edge. These are not
 * client-controlled in a deployment behind Vercel; off-platform they are simply
 * absent and the row is stored without a location rather than with a forged one.
 */
function edgeGeo(request: Request) {
  const header = (name: string) => {
    const value = request.headers.get(name);
    if (!value) return null;
    // Vercel percent-encodes city names that contain non-ASCII characters.
    try {
      return decodeURIComponent(value).trim() || null;
    } catch {
      return value.trim() || null;
    }
  };

  return {
    country: header('x-vercel-ip-country'),
    region: header('x-vercel-ip-country-region'),
    city: header('x-vercel-ip-city'),
  };
}

export async function POST(request: Request) {
  // Collection must never break a page. Every failure below answers 204.
  const noContent = new NextResponse(null, { status: 204 });

  const userAgent = request.headers.get('user-agent') ?? '';
  if (BOT_PATTERN.test(userAgent)) return noContent;

  if (!rateLimit(clientKey(request, 'analytics'), MAX_VIEWS, WINDOW_MS).allowed) return noContent;
  if (!hasServiceClient()) return noContent;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noContent;
  }

  const parsed = collectSchema.safeParse(body);
  if (!parsed.success) return noContent;
  const input = parsed.data;

  const geo = edgeGeo(request);

  try {
    await getServiceClient()
      .from('PageView')
      .insert({
        id: newId(),
        path: input.path,
        referrer: input.referrer || null,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        locale: input.locale || null,
        deviceType: input.deviceType || null,
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
        sessionId: input.sessionId,
        converted: false,
      });
  } catch (err: any) {
    console.error('Page view insert failed:', err?.message);
  }

  return noContent;
}
