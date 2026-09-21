import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  bookingId: z.string().min(1),
});

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Creates a Razorpay order for an existing booking.
 *
 * The amount is read from the stored booking, never from the request body, so
 * a tampered client cannot pay less than the quoted price.
 */
export async function POST(request: Request) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error('Razorpay credentials are not configured');
    return NextResponse.json(
      { error: 'Online payment is temporarily unavailable. Please contact us to confirm your booking.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'A bookingId is required' }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();

    const { data: booking, error } = await supabase
      .from('Booking')
      .select('id, bookingRef, finalAmount, paymentStatus, status, holdExpiresAt')
      .eq('id', parsed.data.bookingId)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'This booking is already paid' }, { status: 409 });
    }
    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      return NextResponse.json({ error: 'This booking is no longer active' }, { status: 409 });
    }
    if (booking.holdExpiresAt && new Date(booking.holdExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Your reservation hold has expired. Please start again.' },
        { status: 409 }
      );
    }

    // Razorpay works in paise.
    const amountPaise = Math.round(Number(booking.finalAmount) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return NextResponse.json({ error: 'Booking has an invalid amount' }, { status: 409 });
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        // Razorpay caps receipt at 40 characters.
        receipt: booking.bookingRef.slice(0, 40),
        notes: { bookingId: booking.id, bookingRef: booking.bookingRef },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Razorpay order creation failed:', res.status, detail);
      return NextResponse.json(
        { error: 'Could not start the payment. Please try again.' },
        { status: 502 }
      );
    }

    const order = await res.json();

    await supabase
      .from('Booking')
      .update({ paymentGateway: 'RAZORPAY' })
      .eq('id', booking.id);

    return NextResponse.json({
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.error('Create order failed:', err);
    return NextResponse.json({ error: 'Could not start the payment' }, { status: 500 });
  }
}
