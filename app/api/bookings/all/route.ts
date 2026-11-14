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

  // Interpolated into an `or` filter, so the search term is escaped to stop a
  // single quote from breaking out of the expression.
  if (search) {
    const s = search.replace(/[,%()]/g, ' ').trim();
    if (s) {
      query = query.or(
        `guest.name.ilike.%${s}%,guest.email.ilike.%${s}%,guest.phone.ilike.%${s}%,bookingRef.ilike.%${s}%`
      );
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
