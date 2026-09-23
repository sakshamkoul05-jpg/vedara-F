import { NextResponse } from 'next/server';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';
import { nowIso } from '@/lib/ids';
import { inquiryIsStale } from '@/lib/follow-up/ladder';
import { emailForStage, whatsappForStage, type InquiryContext } from '@/lib/follow-up/templates';
import { emailConfigured, sendEmail } from '@/lib/messaging/email';
import { sendWhatsApp, whatsappConfigured } from '@/lib/messaging/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Sending is slow; the default 10s would cut a batch off mid-flight. */
export const maxDuration = 60;

/**
 * Sends the follow-ups that have come due.
 *
 * Driven by Vercel Cron (see vercel.json). Safe to run twice: each row is
 * claimed by moving it out of PENDING before the send is attempted, and the
 * unique key on (inquiryId, channel, stage) means a stage cannot exist twice in
 * the first place. Overlapping runs can at worst duplicate work, never a
 * message.
 */

/** Small enough to finish inside the function's budget. */
const BATCH_SIZE = 25;

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://vedara.com';

/**
 * Cron authorisation.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET`. Without a secret set the
 * route refuses rather than running open, because an unauthenticated endpoint
 * that sends email is an open relay pointed at our own reputation.
 */
function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

function contextFor(inquiry: any, cottageName: string | null): InquiryContext {
  const params = new URLSearchParams();
  if (inquiry.cottageId) params.set('cottageId', inquiry.cottageId);
  if (inquiry.checkIn) params.set('checkIn', String(inquiry.checkIn).slice(0, 10));
  if (inquiry.checkOut) params.set('checkOut', String(inquiry.checkOut).slice(0, 10));
  if (inquiry.adults) params.set('adults', String(inquiry.adults));

  const query = params.toString();

  return {
    name: inquiry.name ?? null,
    cottageName,
    checkIn: inquiry.checkIn ?? null,
    checkOut: inquiry.checkOut ?? null,
    adults: inquiry.adults ?? null,
    quotedAmount: inquiry.quotedAmount ?? null,
    bookingUrl: `${siteUrl()}/booking${query ? `?${query}` : ''}`,
    unsubscribeUrl: `${siteUrl()}/api/inquiries/unsubscribe?id=${encodeURIComponent(inquiry.id)}`,
  };
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  if (!hasServiceClient()) {
    return NextResponse.json({ error: 'Service role key is not set' }, { status: 503 });
  }

  const supabase = getServiceClient();
  const now = nowIso();

  const { data: due, error } = await supabase
    .from('InquiryFollowUp')
    .select('id, inquiryId, channel, stage, inquiry:Inquiry(*, cottage:Cottage(name))')
    .eq('status', 'PENDING')
    .lte('scheduledAt', now)
    .order('scheduledAt', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error('Follow-up fetch failed:', error.message);
    return NextResponse.json({ error: 'Could not load due follow-ups.' }, { status: 500 });
  }

  const summary = { considered: due?.length ?? 0, sent: 0, skipped: 0, failed: 0, retrying: 0 };

  for (const row of due ?? []) {
    const inquiry: any = row.inquiry;

    // Claim the row first. If the send then fails we will know, but a crash
    // mid-send can never leave it PENDING for a second run to send again.
    const { data: claimed } = await supabase
      .from('InquiryFollowUp')
      .update({ status: 'SKIPPED', updatedAt: nowIso() })
      .eq('id', row.id)
      .eq('status', 'PENDING')
      .select('id')
      .maybeSingle();

    // Another run got there first.
    if (!claimed) continue;

    const skip = async (reason: string) => {
      summary.skipped += 1;
      await supabase.from('InquiryFollowUp').update({ error: reason, updatedAt: nowIso() }).eq('id', row.id);
    };

    if (!inquiry || inquiry.status !== 'OPEN') {
      await skip(`inquiry is ${inquiry?.status ?? 'missing'}`);
      continue;
    }
    if (inquiryIsStale(inquiry.checkIn)) {
      await skip('check-in date has passed');
      continue;
    }

    const context = contextFor(inquiry, inquiry.cottage?.name ?? null);
    let outcome;

    if (row.channel === 'EMAIL') {
      if (!inquiry.email) { await skip('no email address'); continue; }
      if (!emailConfigured()) { await skip('email provider not configured'); continue; }
      outcome = await sendEmail(emailForStage(row.stage, inquiry.email, context));
    } else {
      if (!inquiry.phone) { await skip('no phone number'); continue; }
      if (!whatsappConfigured()) { await skip('WhatsApp provider not configured'); continue; }
      outcome = await sendWhatsApp(whatsappForStage(row.stage, inquiry.phone, context));
    }

    if (outcome.ok) {
      summary.sent += 1;
      await supabase
        .from('InquiryFollowUp')
        .update({
          status: 'SENT',
          sentAt: nowIso(),
          providerMessageId: outcome.providerMessageId,
          error: null,
          updatedAt: nowIso(),
        })
        .eq('id', row.id);
    } else if (outcome.retryable) {
      // Hand it back for the next run rather than burning the stage on a
      // provider hiccup.
      summary.retrying += 1;
      await supabase
        .from('InquiryFollowUp')
        .update({ status: 'PENDING', error: outcome.error, updatedAt: nowIso() })
        .eq('id', row.id);
    } else {
      summary.failed += 1;
      await supabase
        .from('InquiryFollowUp')
        .update({ status: 'FAILED', error: outcome.error, updatedAt: nowIso() })
        .eq('id', row.id);
    }
  }

  return NextResponse.json({ data: summary });
}
