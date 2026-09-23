import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { clientKey, rateLimit } from '@/lib/rate-limit';

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

/**
 * One message for "no such reference" and for "that is not your booking".
 *
 * Distinguishing them would confirm that a reference exists, which is the one
 * thing an attacker with a list of guesses wants to learn.
 */
const NO_MATCH = 'No booking matches that reference and contact detail. Please check both and try again.';

/** References are printed uppercase and often retyped with spaces or dashes. */
function normaliseReference(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '');
}

/** Compare phone numbers on their last 10 digits, ignoring country-code style. */
function phoneMatches(a: string | null | undefined, b: string): boolean {
  if (!a) return false;
  const digitsA = a.replace(/\D/g, '');
  const digitsB = b.replace(/\D/g, '');
  if (digitsA.length < 6 || digitsB.length < 6) return false;
  return digitsA.slice(-10) === digitsB.slice(-10);
}

function emailMatches(a: string | null | undefined, b: string): boolean {
  if (!a) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * What the guest is allowed to see.
 *
 * Built by naming fields rather than spreading the row, so internal columns —
 * payment ids, staff notes, the cost breakdown we do not show — cannot start
 * leaking because a column was added to the table later.
 */
function publicView(booking: any) {
  return {
    id: booking.id,
    bookingRef: booking.bookingRef,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    ratePlan: booking.ratePlan,
    extraMattresses: booking.extraMattresses,
    finalAmount: booking.finalAmount,
    taxAmount: booking.taxAmount,
    discount: booking.discount,
    specialRequests: booking.specialRequests,
    createdAt: booking.createdAt,
    cancelledAt: booking.cancelledAt,
    guest: booking.guest
      ? { name: booking.guest.name, email: booking.guest.email, phone: booking.guest.phone }
      : null,
    cottage: booking.cottage
      ? {
          id: booking.cottage.id,
          name: booking.cottage.name,
          slug: booking.cottage.slug,
          images: booking.cottage.images,
          pricingCategory: booking.cottage.pricingCategory ?? null,
        }
      : null,
  };
}

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

  const reference = normaliseReference(parsed.data.reference);
  const contact = parsed.data.contact;

  let supabase;
  try {
    supabase = getServiceClient();
  } catch {
    return NextResponse.json(
      { error: 'Booking lookup is temporarily unavailable. Please call us on +91-91188-82242.' },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from('Booking')
    .select('*, cottage:Cottage(*), guest:Guest(*)')
    .eq('bookingRef', reference)
    .maybeSingle();

  if (error) {
    console.error('Booking lookup failed:', error.message);
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 500 });
  }

  const guest = data?.guest;
  const verified = Boolean(data) && (emailMatches(guest?.email, contact) || phoneMatches(guest?.phone, contact));

  if (!verified) {
    return NextResponse.json({ error: NO_MATCH }, { status: 404 });
  }

  return NextResponse.json({ data: publicView(data) });
}
