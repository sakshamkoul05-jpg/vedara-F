import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { loadInventoryPressure, loadPricingConfig } from '@/lib/pricing/load-config';
import { calculateQuote } from '@/lib/pricing/engine';
import { PricingError } from '@/lib/pricing/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const bookingSchema = z.object({
  cottageId: z.string().min(1),
  checkIn: isoDate,
  checkOut: isoDate,
  adults: z.number().int().min(1).max(10),
  childAges: z.array(z.number().int().min(0).max(17)).max(6).default([]),
  ratePlan: z.enum(['ROOM_ONLY', 'BREAKFAST_INCLUDED']).default('ROOM_ONLY'),
  extraMattresses: z.number().int().min(0).max(2).default(0),
  couponCode: z.string().trim().max(40).optional().nullable(),

  guestName: z.string().trim().min(2).max(100),
  guestEmail: z.string().trim().email().max(150),
  guestPhone: z.string().trim().min(6).max(20),
  address: z.string().trim().max(300).optional().nullable(),
  idProof: z.string().trim().max(100).optional().nullable(),
  specialRequests: z.string().trim().max(1000).optional().nullable(),
  source: z.string().trim().max(40).default('WEBSITE'),
});

const HOLD_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES ?? 15);

/**
 * Creates a booking at a server-calculated price.
 *
 * The client sends stay details only. The payable amount is computed here and
 * persisted alongside a full pricing snapshot, so a later tariff change cannot
 * alter an existing reservation (spec §16).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const input = parsed.data;

  try {
    const supabase = getServiceClient();

    // --- Availability -----------------------------------------------------
    const pressure = await loadInventoryPressure(supabase, input.checkIn, input.checkOut);
    if (pressure.bookedCottageIds.includes(input.cottageId)) {
      return NextResponse.json(
        { error: 'This cottage is no longer available for the selected dates' },
        { status: 409 }
      );
    }

    // --- Price ------------------------------------------------------------
    const config = await loadPricingConfig(supabase);
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

    // --- Guest ------------------------------------------------------------
    const guestId = await upsertGuest(supabase, input);
    if (!guestId) {
      return NextResponse.json({ error: 'Could not save guest details' }, { status: 500 });
    }

    // --- Booking ----------------------------------------------------------
    const bookingRef =
      'VD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

    const { data: booking, error } = await supabase
      .from('Booking')
      .insert({
        bookingRef,
        guestId,
        cottageId: input.cottageId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        children: input.childAges.length,
        childAges: input.childAges,
        ratePlan: input.ratePlan,
        extraMattresses: input.extraMattresses,
        accommodationTotal: quote.accommodationTotal,
        breakfastTotal: quote.breakfastTotal,
        mattressTotal: quote.mattressTotal,
        longStayDiscount: quote.longStayDiscount,
        taxAmount: quote.taxTotal,
        totalAmount: quote.subtotal,
        discount: quote.couponDiscount,
        couponCode: quote.couponCode,
        finalAmount: quote.total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        holdExpiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
        specialRequests: input.specialRequests ?? null,
        source: input.source,
      })
      .select('*, cottage:Cottage(*), guest:Guest(*)')
      .single();

    if (error || !booking) {
      console.error('Booking insert failed:', error);
      return NextResponse.json({ error: 'Could not create booking' }, { status: 500 });
    }

    // The snapshot is what an invoice or dispute is settled against later.
    const { error: snapshotError } = await supabase.from('BookingPricingSnapshot').insert({
      bookingId: booking.id,
      engineVersion: quote.engineVersion,
      payload: quote,
    });
    if (snapshotError) {
      console.error('Pricing snapshot insert failed:', snapshotError);
    }

    return NextResponse.json({ data: { booking, quote } }, { status: 201 });
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    console.error('Booking creation failed:', err);
    return NextResponse.json({ error: 'Unable to create booking' }, { status: 500 });
  }
}

async function upsertGuest(
  supabase: ReturnType<typeof getServiceClient>,
  input: z.infer<typeof bookingSchema>
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('Guest')
    .select('id')
    .eq('phone', input.guestPhone)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from('Guest')
      .update({
        name: input.guestName,
        email: input.guestEmail,
        ...(input.address ? { address: input.address } : {}),
        ...(input.idProof ? { idProof: input.idProof } : {}),
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data: created } = await supabase
    .from('Guest')
    .insert({
      name: input.guestName,
      email: input.guestEmail,
      phone: input.guestPhone,
      address: input.address ?? null,
      idProof: input.idProof ?? null,
    })
    .select('id')
    .single();

  return created?.id ?? null;
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
