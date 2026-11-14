import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStaffSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';
import { nowIso } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Staff moving a booking through check-in and check-out.
 *
 * Restricting the values to these two is deliberate. The employee screen only
 * ever offers "Check In" and "Check Out", so widening this to the full status
 * enum would hand a receptionist — or, before this route existed, anyone with
 * the anon key — a way to jump a PENDING booking straight to CONFIRMED and skip
 * payment. Approving a booking is `POST /bookings/<id>/approve` and needs an
 * admin session.
 */
const ALLOWED = ['CHECKED_IN', 'CHECKED_OUT'] as const;

const bodySchema = z.object({ status: z.enum(ALLOWED) });

const UNAUTHORISED = NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getStaffSession())) return UNAUTHORISED;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 });

  let parsed: unknown;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const body = parsed as { success: boolean; data?: { status: (typeof ALLOWED)[number] }; error?: unknown };
  if (!body.success || !body.data) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('Booking')
    .update({ status: body.data.status, updatedAt: nowIso() })
    .eq('id', id)
    .select('id, bookingRef, status')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }
    console.error('Booking status update failed:', error.message);
    return NextResponse.json({ error: 'Could not update the booking.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
