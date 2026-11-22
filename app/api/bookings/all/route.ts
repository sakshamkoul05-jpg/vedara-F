import { NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Staff listing of every booking, with the guest and cottage behind it.
 *
 * This used to run in the browser against the anon key, which meant anyone who
 * opened the network tab could page through every guest's name, email and phone
 * number. The query now runs here under the service role behind a session check.
 */
export async function GET(request: Request) {
  if (!(await getStaffSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10) || 20));

  const supabase = getServiceClient();
  let query = supabase
    .from('Booking')
    .select('*, cottage:Cottage(*), guest:Guest(*)', { count: 'exact' });

  if (status) query = query.eq('status', status);

  // Interpolated into `or` filters, so the search term is escaped to stop a
  // single quote from breaking out of the expression.
  //
  // PostgREST will not accept an embedded column (`guest.name`) inside a
  // top-level `or`, and parsing that expression failed — so every search the
  // admin typed returned a 500. Guest matches are resolved first, then their
  // ids are combined with the booking-ref match using columns that do live on
  // Booking.
  if (search) {
    const s = search.replace(/[,%()]/g, ' ').trim();
    if (s) {
      const { data: guestRows, error: guestError } = await supabase
        .from('Guest')
        .select('id')
        .or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
        .limit(100);

      if (guestError) {
        console.error('Booking search (guest lookup) failed:', guestError.message);
        return NextResponse.json({ error: 'Could not load bookings.' }, { status: 500 });
      }

      // A placeholder id keeps the expression well-formed when nothing matched.
      const guestIds = (guestRows ?? []).map((g) => g.id);
      const idList = guestIds.length ? guestIds.join(',') : '00000000-0000-0000-0000-000000000000';
      query = query.or(`bookingRef.ilike.%${s}%,guestId.in.(${idList})`);
    }
  }

  const from = (page - 1) * limit;
  const { data, error, count } = await query
    .range(from, from + limit - 1)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Booking list failed:', error.message);
    return NextResponse.json({ error: 'Could not load bookings.' }, { status: 500 });
  }

  // The admin and employee screens read `bookings`, not `data`.
  // `totalPages` was never returned before, so the admin table could only ever
  // show page 1 no matter how many bookings existed.
  const total = count ?? 0;
  return NextResponse.json({
    bookings: data ?? [],
    data: data ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    page,
    limit,
  });
}
