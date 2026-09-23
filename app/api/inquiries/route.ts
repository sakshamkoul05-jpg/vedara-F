import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { newId, nowIso } from '@/lib/ids';
import { scheduleFor } from '@/lib/follow-up/ladder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Records someone who gave us contact details and dates but has not finished
 * booking, and schedules the follow-ups they are owed.
 *
 * Called as the booking form is filled rather than only on abandonment, because
 * abandonment has no event — the guest simply stops. The row is updated as they
 * progress and marked converted if they complete, so the only inquiries that
 * ever get messaged are the ones that really went nowhere.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable();

const inquirySchema = z.object({
  /** Returned by a previous call, so filling the form updates one row. */
  id: z.string().min(1).optional().nullable(),
  source: z.enum(['BOOKING_FORM', 'CONTACT_FORM', 'CHATBOT', 'AVAILABILITY_SEARCH']),
  name: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email().max(150).optional().nullable(),
  phone: z.string().trim().max(24).optional().nullable(),
  checkIn: isoDate,
  checkOut: isoDate,
  adults: z.number().int().min(1).max(20).optional().nullable(),
  children: z.number().int().min(0).max(10).optional().nullable(),
  cottageId: z.string().min(1).optional().nullable(),
  lastStep: z.string().trim().max(40).optional().nullable(),
  quotedAmount: z.number().nonnegative().optional().nullable(),
  locale: z.string().trim().max(12).optional().nullable(),
});

const MAX_WRITES = 40;
const WINDOW_MS = 10 * 60 * 1000;

/** Nothing to follow up with, so nothing worth storing. */
const hasContact = (email?: string | null, phone?: string | null) => Boolean(email || phone);

export async function POST(request: Request) {
  // This runs alongside a guest filling in a form. It must never be the reason
  // a booking fails, so every problem answers 204 and the form carries on.
  const noContent = new NextResponse(null, { status: 204 });

  if (!rateLimit(clientKey(request, 'inquiry'), MAX_WRITES, WINDOW_MS).allowed) return noContent;
  if (!hasServiceClient()) return noContent;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noContent;
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return noContent;
  const input = parsed.data;

  if (!hasContact(input.email, input.phone)) return noContent;

  const supabase = getServiceClient();

  const fields = {
    source: input.source,
    name: input.name || null,
    email: input.email || null,
    phone: input.phone || null,
    checkIn: input.checkIn || null,
    checkOut: input.checkOut || null,
    adults: input.adults ?? null,
    children: input.children ?? null,
    cottageId: input.cottageId || null,
    lastStep: input.lastStep || null,
    quotedAmount: input.quotedAmount ?? null,
    locale: input.locale || 'en',
    updatedAt: nowIso(),
  };

  try {
    if (input.id) {
      // Only an inquiry still open may be updated. One that converted or
      // unsubscribed must not be dragged back into the ladder by a stale tab.
      const { data } = await supabase
        .from('Inquiry')
        .update(fields)
        .eq('id', input.id)
        .eq('status', 'OPEN')
        .select('id')
        .maybeSingle();

      if (data) return NextResponse.json({ data: { id: data.id } });
      // Fall through and create one if that id is gone or no longer open.
    }

    const id = newId();
    const createdAt = nowIso();

    const { error } = await supabase
      .from('Inquiry')
      .insert({ id, status: 'OPEN', createdAt, ...fields });

    if (error) {
      console.error('Inquiry insert failed:', error.message);
      return noContent;
    }

    // The whole ladder is written up front. A row per stage per channel, with a
    // unique key behind it, is what makes the worker safe to run twice.
    const followUps = scheduleFor(createdAt)
      .filter(({ channel }) => (channel === 'EMAIL' ? Boolean(input.email) : Boolean(input.phone)))
      .map(({ stage, channel, scheduledAt }) => ({
        id: newId(),
        inquiryId: id,
        channel,
        stage,
        status: 'PENDING',
        scheduledAt,
        updatedAt: nowIso(),
      }));

    if (followUps.length > 0) {
      const { error: followUpError } = await supabase.from('InquiryFollowUp').insert(followUps);
      if (followUpError) console.error('Follow-up schedule failed:', followUpError.message);
    }

    return NextResponse.json({ data: { id } });
  } catch (err: any) {
    console.error('Inquiry write failed:', err?.message);
    return noContent;
  }
}
