import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';
import { nowIso } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin actions on a single booking.
 *
 * These previously ran in the browser with the anon key: the admin screen sent
 * a token that nothing ever checked, so any visitor could POST
 * `/bookings/<id>/approve` and mark their own booking CONFIRMED and PAID
 * without paying. The write now happens here, behind a verified session.
 */

const ACTIONS = ['approve', 'reject', 'cancel'] as const;

const bodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

const UNAUTHORISED = NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

export async function POST(request: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
  if (!(await getAdminSession())) return UNAUTHORISED;

  const { id, action } = await params;
  if (!(ACTIONS as readonly string[]).includes(action)) {
    return NextResponse.json({ error: 'Unknown booking action.' }, { status: 404 });
  }
  if (!id) return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 });

  let reason: string | undefined;
  try {
    const body = bodySchema.safeParse(await request.json());
    if (body.success) reason = body.data.reason;
  } catch {
    // An empty body is fine — approve and cancel are sent with `{}`.
  }

  const patch: Record<string, unknown> = { updatedAt: nowIso() };

  if (action === 'approve') {
    // The amount is whatever the booking already holds; this only flips its
    // state, and it is what the "approve a pay-later booking" button does.
    patch.status = 'CONFIRMED';
    patch.paymentStatus = 'PAID';
    patch.holdExpiresAt = null;
  } else if (action === 'reject') {
    patch.status = 'CANCELLED';
    patch.cancelledAt = nowIso();
    patch.cancelReason = reason?.trim() || 'Rejected by admin';
  } else {
    patch.status = 'CANCELLED';
    patch.cancelledAt = nowIso();
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('Booking')
    .update(patch)
    .eq('id', id)
    .select('id, bookingRef, status, paymentStatus, holdExpiresAt, cancelledAt, cancelReason')
    .single();

  if (error) {
    // A missing row is the likely cause of a failed single() update.
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }
    console.error(`Booking ${action} failed:`, error.message);
    return NextResponse.json({ error: 'Could not update the booking.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
