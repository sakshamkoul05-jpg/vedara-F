import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';
import { nowIso } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Staff view of guest housekeeping and maintenance requests.
 *
 * Separate from the guest route because the shapes differ: staff see every
 * request across bookings along with the guest and cottage behind it, and are
 * the only ones who can change a status.
 */

const STATUSES = ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'] as const;

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(STATUSES).optional(),
  staffNotes: z.string().trim().max(1000).optional().nullable(),
  assignedToId: z.string().min(1).nullable().optional(),
});

const UNAUTHORISED = NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

export async function GET(request: Request) {
  if (!(await getAdminSession())) return UNAUTHORISED;

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 200);

  const supabase = getServiceClient();
  let query = supabase
    .from('ServiceRequest')
    .select('*, booking:Booking(bookingRef, checkIn, checkOut, guest:Guest(name, email, phone)), cottage:Cottage(name, slug)')
    .order('createdAt', { ascending: false })
    .limit(limit);

  // "Open" in the UI means anything still needing attention, not just the
  // OPEN status, so the three live statuses are grouped behind one filter.
  if (status === 'ACTIVE') query = query.in('status', ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS']);
  else if (status && STATUSES.includes(status as any)) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('Service request list failed:', error.message);
    return NextResponse.json({ error: 'Could not load requests.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return UNAUTHORISED;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update.' }, { status: 400 });
  }
  const { id, status, staffNotes, assignedToId } = parsed.data;

  const patch: Record<string, unknown> = { updatedAt: nowIso() };
  if (staffNotes !== undefined) patch.staffNotes = staffNotes;
  if (assignedToId !== undefined) patch.assignedToId = assignedToId;

  if (status) {
    patch.status = status;
    // Stamp the moment a status is first reached, so "how long did this take"
    // is answerable later without a separate audit trail.
    if (status === 'ACKNOWLEDGED') patch.acknowledgedAt = nowIso();
    if (status === 'RESOLVED') patch.resolvedAt = nowIso();
    if (status === 'OPEN') { patch.acknowledgedAt = null; patch.resolvedAt = null; }
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('ServiceRequest')
    .update(patch)
    .eq('id', id)
    .select('*, booking:Booking(bookingRef, guest:Guest(name, email, phone)), cottage:Cottage(name, slug)')
    .single();

  if (error) {
    console.error('Service request update failed:', error.message);
    return NextResponse.json({ error: 'Could not update the request.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
