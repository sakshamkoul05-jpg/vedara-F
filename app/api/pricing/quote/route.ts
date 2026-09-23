import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { loadInventoryPressure, loadPricingConfig, todayInIndia } from '@/lib/pricing/load-config';
import { calculateQuote } from '@/lib/pricing/engine';
import { resolveCoupon } from '@/lib/pricing/server';
import { PricingError } from '@/lib/pricing/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const quoteSchema = z.object({
  cottageId: z.string().min(1),
  checkIn: isoDate,
  checkOut: isoDate,
  adults: z.number().int().min(1).max(10),
  childAges: z.array(z.number().int().min(0).max(17)).max(6).default([]),
  ratePlan: z.enum(['ROOM_ONLY', 'BREAKFAST_INCLUDED']).default('ROOM_ONLY'),
  extraMattresses: z.number().int().min(0).max(2).default(0),
  couponCode: z.string().trim().max(40).optional().nullable(),
  guestEmail: z.string().trim().email().optional().nullable(),
});

/**
 * Prices a stay. This is the only place a price is calculated — the browser
 * never computes a payable amount (spec §16).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const input = parsed.data;

  try {
    const supabase = getServiceClient();
    const config = await loadPricingConfig(supabase);

    // Inventory is measured from the database, never sent by the client.
    const pressure = await loadInventoryPressure(supabase, input.checkIn, input.checkOut, config.cottages);
    if (pressure.unavailableCottageIds.includes(input.cottageId)) {
      return NextResponse.json(
        { error: 'This cottage is not available for the selected dates', code: 'UNAVAILABLE' },
        { status: 409 }
      );
    }

    let coupon = null;
    if (input.couponCode) {
      const result = await resolveCoupon(supabase, input.couponCode, input.guestEmail ?? null);
      if (!result.ok) return NextResponse.json({ error: result.error, code: 'COUPON' }, { status: 400 });
      coupon = result.coupon;
    }

    const quote = calculateQuote(
      {
        cottageId: input.cottageId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        childAges: input.childAges,
        ratePlan: input.ratePlan,
        extraMattresses: input.extraMattresses,
        inventoryByNight: pressure.byNight,
        coupon,
        today: todayInIndia(),
      },
      config
    );

    return NextResponse.json({ data: quote });
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    console.error('Pricing quote failed:', err);
    return NextResponse.json({ error: 'Unable to calculate price' }, { status: 500 });
  }
}
