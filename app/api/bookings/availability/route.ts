import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-server';
import { isCottageFree } from '@/lib/availability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Is this cottage free for the requested range? Public — no session needed. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cottageId = url.searchParams.get('cottageId');
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');

  if (!cottageId || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'cottageId, checkIn and checkOut are required.' }, { status: 400 });
  }
  if (!(checkIn < checkOut)) {
    return NextResponse.json({ error: 'checkOut must be after checkIn.' }, { status: 400 });
  }

  try {
    const available = await isCottageFree(getServiceClient(), cottageId, { checkIn, checkOut });
    return NextResponse.json({ data: { available } });
  } catch (err) {
    console.error('Availability check failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Could not check availability.' }, { status: 500 });
  }
}
