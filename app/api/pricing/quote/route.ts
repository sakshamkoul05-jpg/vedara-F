import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { loadInventoryPressure, loadPricingConfig } from '@/lib/pricing/load-config';
import { calculateQuote } from '@/lib/pricing/engine';
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

    // Inventory pressure is measured from the database, never sent by the client.
    const pressure = await loadInventoryPressure(supabase, input.checkIn, input.checkOut);

    if (pressure.bookedCottageIds.includes(input.cottageId)) {
      return NextResponse.json(
        { error: 'This cottage is not available for the selected dates' },
        { status: 409 }
      );
    }

    const coupon = await resolveCoupon(supabase, input.couponCode);
    if (input.couponCode && !coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 });
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
        inventory: { booked: pressure.booked, total: pressure.total },
        coupon,
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

async function resolveCoupon(
  supabase: ReturnType<typeof getServiceClient>,
  code: string | null | undefined
) {
  if (!code) return null;

  const { data } = await supabase
    .from('Coupon')
    .select('*')
    .eq('code', code)
    .eq('isActive', true)
    .maybeSingle();

  if (!data) return null;
  if (data.expiresAt && new Date(data.expiresAt) < new Date()) return null;
  if (data.maxUsage > 0 && data.usedCount >= data.maxUsage) return null;

  return {
    code: data.code as string,
    discountType: data.discountType as 'PERCENTAGE' | 'FIXED',
    discountValue: data.discountValue as number,
  };
}
