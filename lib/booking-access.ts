import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Proving that a caller holds a booking.
 *
 * A guest has no account, so the booking reference plus the contact detail the
 * booking was made with *is* the credential. Every route that reads or writes
 * something belonging to a booking re-runs this check — there is no session to
 * carry the result, and a previous successful lookup does not authorise a
 * later request.
 */

/** References are printed uppercase and often retyped with spaces or dashes. */
export function normaliseReference(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '');
}

/** Compare phone numbers on their last 10 digits, ignoring country-code style. */
export function phoneMatches(stored: string | null | undefined, given: string): boolean {
  if (!stored) return false;
  const a = stored.replace(/\D/g, '');
  const b = given.replace(/\D/g, '');
  if (a.length < 6 || b.length < 6) return false;
  return a.slice(-10) === b.slice(-10);
}

export function emailMatches(stored: string | null | undefined, given: string): boolean {
  if (!stored) return false;
  return stored.trim().toLowerCase() === given.trim().toLowerCase();
}

/**
 * One message for "no such reference" and for "that is not your booking".
 *
 * Distinguishing them would confirm that a reference exists, which is the one
 * thing an attacker working through a list of guesses wants to learn.
 */
export const NO_MATCH =
  'No booking matches that reference and contact detail. Please check both and try again.';

/**
 * The booking behind a reference, but only if the contact detail matches it.
 *
 * Returns null in both the not-found and the not-yours case, deliberately
 * without saying which.
 */
export async function findVerifiedBooking(
  supabase: SupabaseClient,
  reference: string,
  contact: string
): Promise<any | null> {
  const { data, error } = await supabase
    .from('Booking')
    .select('*, cottage:Cottage(*), guest:Guest(*)')
    .eq('bookingRef', normaliseReference(reference))
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const guest = data.guest;
  const verified = emailMatches(guest?.email, contact) || phoneMatches(guest?.phone, contact);
  return verified ? data : null;
}

/**
 * What the guest is allowed to see of their own booking.
 *
 * Built by naming fields rather than spreading the row, so internal columns —
 * payment ids, staff notes, the cost breakdown we do not show — cannot start
 * leaking because a column was added to the table later.
 */
export function publicBookingView(booking: any) {
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

/** Statuses where a stay is live enough for the guest to ask us for something. */
const SERVICEABLE_STATUSES = new Set(['CONFIRMED', 'RESERVED', 'CHECKED_IN', 'PENDING']);

/** Requests stay open through the day after check-out, for anything left behind. */
const GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Whether this booking can still raise service requests.
 *
 * Returns a reason rather than a bare false, because the guest has already
 * proved the booking is theirs and deserves to know why the form is closed.
 */
export function serviceRequestBlockReason(booking: any): string | null {
  if (!SERVICEABLE_STATUSES.has(booking.status)) {
    return booking.status === 'CANCELLED'
      ? 'This booking has been cancelled, so requests are closed. Please call us if you need anything.'
      : 'Requests are not available for this booking. Please call us on +91-80919-21222.';
  }
  if (booking.checkOut && Date.parse(booking.checkOut) + GRACE_MS < Date.now()) {
    return 'This stay has ended. For anything left behind or still outstanding, please call us on +91-80919-21222.';
  }
  return null;
}
