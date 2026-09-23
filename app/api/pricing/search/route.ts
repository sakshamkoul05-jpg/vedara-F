import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { loadInventoryPressure, loadPricingConfig, todayInIndia } from '@/lib/pricing/load-config';
import { calculateQuote, occupancyProblem } from '@/lib/pricing/engine';
import { PricingError, type QuoteBreakdown, type RatePlanCode } from '@/lib/pricing/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const searchSchema = z.object({
  checkIn: isoDate,
  checkOut: isoDate,
  adults: z.number().int().min(1).max(10),
  childAges: z.array(z.number().int().min(0).max(17)).max(6).default([]),
});

interface PlanPrice {
  ratePlan: RatePlanCode;
  /** Pre-tax price for the stay (accommodation after benefits + breakfast). */
  subtotal: number;
  /** Pre-tax average per night — the "₹8,500/night" figure in spec §12. */
  perNight: number;
  taxTotal: number;
  total: number;
}

function planPrice(q: QuoteBreakdown): PlanPrice {
  return {
    ratePlan: q.ratePlan,
    subtotal: q.subtotal,
    perNight: Math.round(q.subtotal / q.nights),
    taxTotal: q.taxTotal,
    total: q.total,
  };
}

/**
 * Availability search (spec §11, §12).
 *
 * Takes the stay and the party — check-in, check-out, adults, and the age of
 * each child — and returns only the cottages that can accommodate that party,
 * each priced under both rate plans so the guest can compare Room Only with
 * Breakfast Included before choosing.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const input = parsed.data;

  if (input.checkOut <= input.checkIn) {
    return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();
    const config = await loadPricingConfig(supabase);
    const pressure = await loadInventoryPressure(supabase, input.checkIn, input.checkOut, config.cottages);
    const unavailable = new Set(pressure.unavailableCottageIds);
    const today = todayInIndia();

    const results = [];
    let incompatible = 0;
    let stayError: { code: string; message: string } | null = null;

    for (const cottage of config.cottages.filter((c) => c.isActive)) {
      // Only cottages that can hold this party are returned (spec §11).
      if (occupancyProblem(cottage, input.adults, input.childAges, config)) {
        incompatible++;
        continue;
      }

      const base = {
        cottageId: cottage.id,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        childAges: input.childAges,
        inventoryByNight: pressure.byNight,
        today,
      };

      let roomOnly: QuoteBreakdown;
      let breakfast: QuoteBreakdown;
      try {
        roomOnly = calculateQuote({ ...base, ratePlan: 'ROOM_ONLY' }, config);
        breakfast = calculateQuote({ ...base, ratePlan: 'BREAKFAST_INCLUDED' }, config);
      } catch (err) {
        // A rule about the dates themselves (e.g. minimum stay) applies to every
        // cottage, so report it once rather than as a missing cottage.
        if (err instanceof PricingError && (err.code === 'MIN_STAY' || err.code === 'NO_SEASON')) {
          stayError = { code: err.code, message: err.message };
          break;
        }
        console.error(`Search: could not price ${cottage.name}:`, err);
        continue;
      }

      results.push({
        cottageId: cottage.id,
        slug: cottage.slug,
        name: cottage.name,
        category: cottage.category,
        publicDescriptor: cottage.publicDescriptor ?? null,
        maxAdults: cottage.maxAdults,
        maxChildren: cottage.maxChildren,
        allowsExtraMattress: cottage.allowsExtraMattress,
        maxExtraMattresses: cottage.maxExtraMattresses,
        available: !unavailable.has(cottage.id),
        nights: roomOnly.nights,
        longStayApplied: roomOnly.longStayApplied,
        longStayRuleName: roomOnly.longStayRuleName,
        lastMinuteOffer: roomOnly.lastMinuteOffer ?? breakfast.lastMinuteOffer,
        plans: {
          ROOM_ONLY: planPrice(roomOnly),
          BREAKFAST_INCLUDED: planPrice(breakfast),
        },
      });
    }

    if (stayError) {
      return NextResponse.json({ error: stayError.message, code: stayError.code }, { status: 400 });
    }

    // Available first, then cheapest.
    results.sort((a, b) =>
      a.available === b.available
        ? a.plans.ROOM_ONLY.perNight - b.plans.ROOM_ONLY.perNight
        : a.available ? -1 : 1
    );

    return NextResponse.json({
      data: {
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        childAges: input.childAges,
        cottages: results,
        incompatibleCount: incompatible,
      },
    });
  } catch (err) {
    console.error('Availability search failed:', err);
    return NextResponse.json({ error: 'Unable to search availability' }, { status: 500 });
  }
}
