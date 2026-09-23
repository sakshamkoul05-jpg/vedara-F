import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceClient } from '@/lib/supabase-server';
import { loadInventoryPressure, loadPricingConfig, todayInIndia } from '@/lib/pricing/load-config';
import { calculateQuote } from '@/lib/pricing/engine';
import { recordCouponUse, resolveCoupon } from '@/lib/pricing/server';
import { PricingError } from '@/lib/pricing/types';
import { newId, nowIso } from '@/lib/ids';

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

/** Postgres / PostgREST codes for "that column does not exist". */
const MISSING_COLUMN = new Set(['42703', 'PGRST204']);

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
  const guestKey = input.guestEmail.toLowerCase();

  try {
    const supabase = getServiceClient();
    const config = await loadPricingConfig(supabase);

    // --- Availability -----------------------------------------------------
    const pressure = await loadInventoryPressure(supabase, input.checkIn, input.checkOut, config.cottages);
    if (pressure.unavailableCottageIds.includes(input.cottageId)) {
      return NextResponse.json(
        { error: 'This cottage is no longer available for the selected dates', code: 'UNAVAILABLE' },
        { status: 409 }
      );
    }

    // --- Price ------------------------------------------------------------
    let coupon = null;
    let couponId: string | null = null;
    if (input.couponCode) {
      const result = await resolveCoupon(supabase, input.couponCode, guestKey);
      if (!result.ok) return NextResponse.json({ error: result.error, code: 'COUPON' }, { status: 400 });
      coupon = result.coupon;
      couponId = result.id;
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

    // --- Guest ------------------------------------------------------------
    const guestId = await upsertGuest(supabase, input);
    if (!guestId) {
      return NextResponse.json({ error: 'Could not save guest details' }, { status: 500 });
    }

    // --- Booking ----------------------------------------------------------
    const bookingRef =
      'VD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

    const row: Record<string, unknown> = {
      id: newId(),
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
      promotionDiscount: quote.promotionDiscount,
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
      updatedAt: nowIso(),
    };

    let { data: booking, error } = await insertBooking(supabase, row);
    // Deployed ahead of the 20260923 migration: the promotion is still kept in
    // the pricing snapshot, just not in its own column.
    if (error && MISSING_COLUMN.has(error.code ?? '')) {
      delete row.promotionDiscount;
      ({ data: booking, error } = await insertBooking(supabase, row));
    }

    if (error || !booking) {
      console.error('Booking insert failed:', error);
      return NextResponse.json({ error: 'Could not create booking' }, { status: 500 });
    }

    // The snapshot is what an invoice or dispute is settled against later.
    const { error: snapshotError } = await supabase.from('BookingPricingSnapshot').insert({
      id: newId(),
      bookingId: booking.id,
      engineVersion: quote.engineVersion,
      payload: quote,
    });
    if (snapshotError) console.error('Pricing snapshot insert failed:', snapshotError);

    if (couponId && quote.couponCode) {
      await recordCouponUse(supabase, couponId, guestKey, booking.id);
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

function insertBooking(supabase: SupabaseClient, row: Record<string, unknown>) {
  return supabase
    .from('Booking')
    .insert(row)
    .select('*, cottage:Cottage(*), guest:Guest(*)')
    .single();
}

async function upsertGuest(
  supabase: SupabaseClient,
  input: z.infer<typeof bookingSchema>
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('Guest')
    .select('id')
    .eq('phone', input.guestPhone)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from('Guest')
      .update({
        name: input.guestName,
        email: input.guestEmail,
        updatedAt: nowIso(),
        ...(input.address ? { address: input.address } : {}),
        ...(input.idProof ? { idProof: input.idProof } : {}),
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from('Guest')
    .insert({
      id: newId(),
      name: input.guestName,
      email: input.guestEmail,
      phone: input.guestPhone,
      address: input.address ?? null,
      idProof: input.idProof ?? null,
      updatedAt: nowIso(),
    })
    .select('id')
    .single();

  if (error) console.error('Guest insert failed:', error);
  return created?.id ?? null;
}
