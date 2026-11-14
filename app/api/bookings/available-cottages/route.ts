import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-server';
import { occupiedCottageIds } from '@/lib/availability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The cottage list for the booking step, each flagged free or taken for the
 * selected dates. Without dates every cottage comes back available.
 *
 * Public — the guest has not booked yet — but served from the server so the
 * `Booking` table does not have to be readable from the browser.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');

  if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
    return NextResponse.json({ error: 'Provide both checkIn and checkOut, or neither.' }, { status: 400 });
  }
  if (checkIn && checkOut && !(checkIn < checkOut)) {
    return NextResponse.json({ error: 'checkOut must be after checkIn.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    const { data: cottages, error } = await supabase
      .from('Cottage')
      .select('*')
      .eq('isActive', true)
      .order('sortOrder', { ascending: true });

    if (error) {
      console.error('Cottage list failed:', error.message);
      return NextResponse.json({ error: 'Could not load cottages.' }, { status: 500 });
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json({
        data: (cottages ?? []).map((c) => ({ ...c, isAvailable: true })),
      });
    }

    const occupied = await occupiedCottageIds(supabase, { checkIn, checkOut });

    return NextResponse.json({
      data: (cottages ?? []).map((c) => ({ ...c, isAvailable: !occupied.has(c.id) })),
    });
  } catch (err) {
    console.error('Available cottages failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Could not load cottages.' }, { status: 500 });
  }
}
