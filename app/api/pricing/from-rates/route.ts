import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { loadPricingConfig } from '@/lib/pricing/load-config';
import { lowestFromRate } from '@/lib/pricing/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// The rate card changes rarely; cache at the edge for a minute so the public
// pages stay fast without going stale for long after an admin edit.
export const revalidate = 60;

/**
 * Public "from" rates for the cottage cards (spec §12).
 *
 * Returns the lowest published 2-adult weekday rate for each cottage, which is
 * the "From ₹X/night*" figure the public Stays and home pages display. Kept
 * separate from the booking quote so the cards can render without a full
 * date/occupancy round trip.
 */
export async function GET() {
  try {
    // "From" rates are public information, and the rate tables have public-read
    // RLS, so this uses the anon client rather than the service key.
    const config = await loadPricingConfig(supabase);

    const rates = config.cottages.map((cottage) => ({
      cottageId: cottage.id,
      slug: cottage.slug,
      fromRate: lowestFromRate(cottage.id, config),
      maxAdults: cottage.maxAdults,
      allowsExtraMattress: cottage.allowsExtraMattress,
    }));

    return NextResponse.json({ data: rates });
  } catch (err) {
    console.error('from-rates failed:', err);
    // The pages fall back to their own defaults on a non-200, so fail soft.
    return NextResponse.json({ error: 'Unable to load rates' }, { status: 500 });
  }
}
