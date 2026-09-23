import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';
import { ACTIVE_BOOKING_STATUSES, invalidatePricingConfig } from '@/lib/pricing/load-config';
import { occupiedNightDates } from '@/lib/pricing/engine';
import { newId } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Blackout / stop-sell dates (spec §15).
 *
 * A blackout stops a cottage being sold on a date — for maintenance, a private
 * event, or closing the property. It never cancels a booking that already
 * exists; the response reports any such overlap so an admin can act on it.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const MAX_DAYS = 366;

const createSchema = z.object({
  /** Empty array means every active cottage — a property-wide stop-sell. */
  cottageIds: z.array(z.string()).default([]),
  startDate: isoDate,
  /** Inclusive. */
  endDate: isoDate,
  reason: z.string().trim().max(200).optional().nullable(),
});

const deleteSchema = z.object({ ids: z.array(z.string()).min(1).max(2000) });

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const supabase = getServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('BlockedDate')
    .select('id, cottageId, date, reason, cottage:Cottage(name)')
    .gte('date', today)
    .order('date')
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid values', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { startDate, endDate, reason } = parsed.data;
  if (startDate > endDate) {
    return NextResponse.json({ error: 'Start date cannot be after end date.' }, { status: 400 });
  }

  // endDate is inclusive, so the range runs to the day after it.
  const dayAfterEnd = new Date(Date.parse(endDate + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
  const dates = occupiedNightDates(startDate, dayAfterEnd);
  if (dates.length > MAX_DAYS) {
    return NextResponse.json({ error: `A blackout can cover at most ${MAX_DAYS} days.` }, { status: 400 });
  }

  const supabase = getServiceClient();

  let cottageIds = parsed.data.cottageIds;
  if (cottageIds.length === 0) {
    const { data: active } = await supabase.from('Cottage').select('id').eq('isActive', true);
    cottageIds = (active ?? []).map((c: any) => c.id);
  }

  const rows = cottageIds.flatMap((cottageId) =>
    dates.map((date) => ({ id: newId(), cottageId, date, reason: reason || 'Stop-sell' }))
  );

  const { error } = await supabase
    .from('BlockedDate')
    .upsert(rows, { onConflict: 'cottageId,date', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Existing bookings are left untouched — report them so nothing is missed.
  const { data: overlapping } = await supabase
    .from('Booking')
    .select('bookingRef, cottageId, checkIn, checkOut, status')
    .in('cottageId', cottageIds)
    .in('status', ACTIVE_BOOKING_STATUSES)
    .lt('checkIn', dayAfterEnd)
    .gt('checkOut', startDate);

  invalidatePricingConfig();
  return NextResponse.json(
    { data: { blockedNights: rows.length, overlappingBookings: overlapping ?? [] } },
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Provide the ids to remove' }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase.from('BlockedDate').delete().in('id', parsed.data.ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  invalidatePricingConfig();
  return NextResponse.json({ data: { removed: parsed.data.ids.length } });
}
