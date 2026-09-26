import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { NO_MATCH, findVerifiedBooking, publicBookingView, serviceRequestBlockReason } from '@/lib/booking-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Booking lookup by reference.
 *
 * This replaces a lookup that matched on email or phone alone and ran in the
 * browser against Supabase with the anon key, which let anyone who knew a
 * guest's email list their stays. A caller must now present the booking
 * reference *and* the contact detail the booking was made with, and the match
 * happens here under the service role.
 */

const lookupSchema = z.object({
  reference: z.string().trim().min(4).max(40),
  /** The email address or phone number the booking was made with. */
  contact: z.string().trim().min(4).max(150),
});

/** Guessing a reference should be slow enough not to be worth scripting. */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'booking-lookup'), MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many lookup attempts. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter your booking reference and the email or phone number you booked with.' },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = getServiceClient();
  } catch {
    return NextResponse.json(
      { error: 'Booking lookup is temporarily unavailable. Please call us on +91-80919-21222.' },
      { status: 503 }
    );
  }

  let booking;
  try {
    booking = await findVerifiedBooking(supabase, parsed.data.reference, parsed.data.contact);
  } catch (err: any) {
    console.error('Booking lookup failed:', err?.message);
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: NO_MATCH }, { status: 404 });
  }

  // The guest's open requests come back with the booking so the portal can show
  // them without a second round trip and a second ownership check.
  const { data: requests } = await supabase
    .from('ServiceRequest')
    .select('id, category, priority, subject, description, preferredTime, status, createdAt, resolvedAt')
    .eq('bookingId', booking.id)
    .order('createdAt', { ascending: false })
    .limit(20);

  return NextResponse.json({
    data: {
      ...publicBookingView(booking),
      serviceRequests: requests ?? [],
      /** Null when the guest may raise a request; a reason when they may not. */
      serviceRequestsClosed: serviceRequestBlockReason(booking),
    },
  });
}
