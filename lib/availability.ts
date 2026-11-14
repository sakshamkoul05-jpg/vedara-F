import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Availability, computed on the server.
 *
 * These queries used to run in the browser against the anon key, which forced
 * the `Booking` table to stay readable by anyone. Keeping them here means the
 * table can be locked down to the service role without losing the booking
 * flow's availability checks.
 *
 * A PENDING booking only blocks a cottage while its reservation hold is still
 * running: an abandoned checkout must not take the cottage off the market, but
 * a live one must.
 */

/** Statuses that hold a cottage for their date range. */
const HOLDING_STATUSES = ['CONFIRMED', 'RESERVED', 'CHECKED_IN', 'PENDING'];

type DateRange = { checkIn: string; checkOut: string };

/**
 * Ids of cottages that cannot be taken for the given range.
 *
 * Combines explicit blocked dates with any booking that overlaps the range.
 */
export async function occupiedCottageIds(
  supabase: SupabaseClient,
  range: DateRange,
  opts: { ignoreHold?: boolean } = {}
): Promise<Set<string>> {
  const occupied = new Set<string>();

  const { data: blocked, error: blockedErr } = await supabase
    .from('BlockedDate')
    .select('cottageId')
    .gte('date', range.checkIn)
    .lte('date', range.checkOut);

  if (!blockedErr && blocked) blocked.forEach((b) => occupied.add(b.cottageId));

  let query = supabase
    .from('Booking')
    .select('cottageId')
    .in('status', HOLDING_STATUSES)
    .lt('checkIn', range.checkOut)
    .gt('checkOut', range.checkIn);

  // By default an expired hold stops blocking; callers that need the raw
  // picture (a calendar, say) can ask for every holding status to count.
  if (!opts.ignoreHold) {
    const now = new Date().toISOString();
    query = query.or(`status.neq.PENDING,holdExpiresAt.is.null,holdExpiresAt.gt.${now}`);
  }

  const { data: booked, error: bookedErr } = await query;
  if (!bookedErr && booked) booked.forEach((b) => occupied.add(b.cottageId));

  return occupied;
}

/** Whether one cottage is free across the whole range. */
export async function isCottageFree(
  supabase: SupabaseClient,
  cottageId: string,
  range: DateRange
): Promise<boolean> {
  const occupied = await occupiedCottageIds(supabase, range);
  return !occupied.has(cottageId);
}

export { HOLDING_STATUSES };
