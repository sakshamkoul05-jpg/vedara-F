import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { newId, nowIso } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  bookingId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Confirms a booking only after verifying Razorpay's HMAC signature.
 *
 * Previously the browser marked a booking PAID directly against Supabase, which
 * meant anyone could confirm any booking without paying. Confirmation now
 * happens here, and only when the signature checks out.
 */
export async function POST(request: Request) {
  if (!RAZORPAY_KEY_SECRET) {
    console.error('RAZORPAY_KEY_SECRET is not configured');
    return NextResponse.json({ error: 'Payment verification unavailable' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payment confirmation' }, { status: 400 });
  }
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  // Razorpay signs "<order_id>|<payment_id>" with the key secret.
  const expected = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const provided = Buffer.from(razorpaySignature, 'utf8');
  const computed = Buffer.from(expected, 'utf8');
  const signatureValid =
    provided.length === computed.length && crypto.timingSafeEqual(provided, computed);

  if (!signatureValid) {
    console.warn('Rejected payment confirmation with an invalid signature', { bookingId });
    return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();

    const { data: booking, error } = await supabase
      .from('Booking')
      .select('id, finalAmount, paymentStatus')
      .eq('id', bookingId)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Replaying a confirmation must not create a second payment row.
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ data: { success: true, alreadyConfirmed: true } });
    }

    const { error: updateError } = await supabase
      .from('Booking')
      .update({
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paymentId: razorpayPaymentId,
        paymentGateway: 'RAZORPAY',
        holdExpiresAt: null,
        updatedAt: nowIso(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to confirm booking:', updateError);
      return NextResponse.json({ error: 'Could not confirm the booking' }, { status: 500 });
    }

    const { error: paymentError } = await supabase.from('Payment').insert({
      id: newId(),
      updatedAt: nowIso(),
      bookingId,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      // Recorded from the stored booking, not from the client.
      amount: booking.finalAmount,
      status: 'PAID',
      gateway: 'RAZORPAY',
    });
    if (paymentError) {
      console.error('Failed to record payment:', paymentError);
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    console.error('Payment verification failed:', err);
    return NextResponse.json({ error: 'Could not verify the payment' }, { status: 500 });
  }
}
