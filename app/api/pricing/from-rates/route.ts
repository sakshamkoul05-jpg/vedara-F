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
 * Public pricing information for the cottage cards and customer copy.
 *
 * - "From ₹X/night*" per cottage (spec §12): the lowest published 2-adult
 *   weekday rate in an active season.
 * - The policy figures the spec §13 customer copy quotes (child ages,
 *   breakfast supplements, mattress price), so that copy is generated from the
 *   live configuration instead of hard-coded into pages (spec §16).
 *
 * Everything here is public, and the rate tables have public-read RLS, so this
 * uses the anon client rather than the service key.
 */
export async function GET() {
  try {
    const config = await loadPricingConfig(supabase);

    const cottages = config.cottages
      .filter((c) => c.isActive)
      .map((c) => ({
        cottageId: c.id,
        slug: c.slug,
        name: c.name,
        category: c.category,
        fromRate: lowestFromRate(c.id, config),
        publicDescriptor: c.publicDescriptor ?? null,
        maxAdults: c.maxAdults,
        maxChildren: c.maxChildren,
        maxOccupancy: c.maxOccupancy,
        allowsExtraMattress: c.allowsExtraMattress,
        extraMattressPrice: c.allowsExtraMattress
          ? c.extraMattressPrice ?? config.settings.extraMattressPrice
          : null,
      }));

    const adultAge = config.settings.adultAgeThreshold;
    const childBreakfast = config.breakfastBands
      .filter((b) => b.isActive && b.maxAge < adultAge)
      .sort((a, b) => a.minAge - b.minAge)
      .map((b) => ({ minAge: b.minAge, maxAge: b.maxAge, pricePerNight: b.pricePerNight }));
    const adultBreakfast = config.breakfastBands.find((b) => b.isActive && b.minAge >= adultAge);
    const freeStayBands = config.childBands.filter(
      (b) => b.isActive && !b.chargedAsAdult && b.accommodationCharge === 0
    );

    return NextResponse.json({
      data: cottages,
      policy: {
        adultAgeThreshold: adultAge,
        // Oldest age that still stays free when sharing bedding.
        freeStayUpToAge: freeStayBands.length ? Math.max(...freeStayBands.map((b) => b.maxAge)) : adultAge - 1,
        adultBreakfastPrice: adultBreakfast?.pricePerNight ?? null,
        childBreakfast,
        extraMattressPrice: config.settings.extraMattressPrice,
      },
    });
  } catch (err) {
    console.error('from-rates failed:', err);
    // The pages fall back to their own defaults on a non-200, so fail soft.
    return NextResponse.json({ error: 'Unable to load rates' }, { status: 500 });
  }
}
