import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-server';
import { HOLDING_STATUSES } from '@/lib/availability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One cottage's month: the explicit blocked dates and the bookings that overlap
 * it, so a calendar can shade days that cannot be taken.
 *
 * Public — it exposes no guest detail, only date ranges and a status — but served
 * from the server so the `Booking` table does not have to stay readable from the
 * browser.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cottageId = url.searchParams.get('cottageId');
  const month = parseInt(url.searchParams.get('month') ?? '1', 10);
  const year = parseInt(url.searchParams.get('year') ?? '2026', 10);

  if (!cottageId) {
    return NextResponse.json({ error: 'cottageId is required.' }, { status: 400 });
  }
  if (!(month >= 1 && month <= 12) || !(year >= 2000 && year <= 2100)) {
    return NextResponse.json({ error: 'month must be 1-12 and year a four-digit year.' }, { status: 400 });
  }

  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const supabase = getServiceClient();

  try {
    const [blocked, booked] = await Promise.all([
      supabase
        .from('BlockedDate')
        .select('date,reason')
        .eq('cottageId', cottageId)
        .gte('date', start)
        .lt('date', end),
      supabase
        .from('Booking')
        .select('checkIn,checkOut,status')
        .eq('cottageId', cottageId)
        .in('status', HOLDING_STATUSES)
        .or(`status.neq.PENDING,holdExpiresAt.is.null,holdExpiresAt.gt.${new Date().toISOString()}`)
        .lt('checkIn', end)
        .gt('checkOut', start),
    ]);

    if (blocked.error) {
      console.error('Calendar blocked dates failed:', blocked.error.message);
      return NextResponse.json({ error: 'Could not load the calendar.' }, { status: 500 });
    }
    if (booked.error) {
      console.error('Calendar bookings failed:', booked.error.message);
      return NextResponse.json({ error: 'Could not load the calendar.' }, { status: 500 });
    }

    return NextResponse.json({
      data: { blockedDates: blocked.data ?? [], bookings: booked.data ?? [] },
    });
  } catch (err) {
    console.error('Calendar failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Could not load the calendar.' }, { status: 500 });
  }
}
