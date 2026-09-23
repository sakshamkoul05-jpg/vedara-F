import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { NO_MATCH, findVerifiedBooking, serviceRequestBlockReason } from '@/lib/booking-access';
import { newId, nowIso } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Housekeeping and maintenance requests raised by a guest against their own
 * booking.
 *
 * Ownership is re-proved on every call from the booking reference and contact
 * detail. There is no session: a guest who looked their booking up a minute ago
 * still has to present both here, so a leaked request payload cannot be replayed
 * against a different booking.
 */

const CATEGORIES = ['HOUSEKEEPING', 'MAINTENANCE', 'AMENITIES', 'FOOD_BEVERAGE', 'OTHER'] as const;
const PRIORITIES = ['LOW', 'NORMAL', 'URGENT'] as const;

const createSchema = z.object({
  reference: z.string().trim().min(4).max(40),
  contact: z.string().trim().min(4).max(150),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES).default('NORMAL'),
  subject: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(1000),
  preferredTime: z.string().trim().max(60).optional().nullable(),
});

/** Generous enough for a real guest, tight enough that the desk is not flooded. */
const MAX_REQUESTS = 6;
const WINDOW_MS = 15 * 60 * 1000;

/** A stay with this many requests still open is a phone call, not a form. */
const MAX_OPEN_PER_BOOKING = 10;

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'service-request'), MAX_REQUESTS, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'That is a lot of requests at once. Please call us on +91-91188-82242 so we can help properly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Please complete every field.' },
      { status: 400 }
    );
  }
  const input = parsed.data;

  let supabase;
  try {
    supabase = getServiceClient();
  } catch {
    return NextResponse.json(
      { error: 'Requests are temporarily unavailable. Please call us on +91-91188-82242.' },
      { status: 503 }
    );
  }

  let booking;
  try {
    booking = await findVerifiedBooking(supabase, input.reference, input.contact);
  } catch (err: any) {
    console.error('Service request lookup failed:', err?.message);
    return NextResponse.json({ error: 'Could not submit your request. Please try again.' }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: NO_MATCH }, { status: 404 });
  }

  const blocked = serviceRequestBlockReason(booking);
  if (blocked) {
    return NextResponse.json({ error: blocked }, { status: 409 });
  }

  const { count } = await supabase
    .from('ServiceRequest')
    .select('id', { count: 'exact', head: true })
    .eq('bookingId', booking.id)
    .in('status', ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS']);

  if ((count ?? 0) >= MAX_OPEN_PER_BOOKING) {
    return NextResponse.json(
      { error: 'You already have several requests open. Please call us on +91-91188-82242 and we will sort them out together.' },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from('ServiceRequest')
    .insert({
      id: newId(),
      bookingId: booking.id,
      cottageId: booking.cottageId ?? null,
      category: input.category,
      priority: input.priority,
      subject: input.subject,
      description: input.description,
      preferredTime: input.preferredTime || null,
      status: 'OPEN',
      updatedAt: nowIso(),
    })
    .select('id, category, priority, subject, description, preferredTime, status, createdAt, resolvedAt')
    .single();

  if (error) {
    console.error('Service request insert failed:', error.message);
    return NextResponse.json({ error: 'Could not submit your request. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
