import { NextResponse } from 'next/server';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';
import { nowIso } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Opt out of follow-ups.
 *
 * Answers both GET, for the link at the foot of an email, and POST, for the
 * one-click unsubscribe a mail client performs from the List-Unsubscribe
 * header. Both close the inquiry and drop everything still pending for it.
 *
 * Deliberately needs no confirmation step: an unsubscribe that takes two
 * clicks is one people give up on, and they mark the message as spam instead —
 * which costs far more than the inquiry was ever worth.
 */

const PAGE = (title: string, message: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · The Vedara</title></head>
<body style="margin:0;padding:48px 24px;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;color:#2b2b2b;">
<div style="max-width:440px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;text-align:center;">
<p style="margin:0 0 24px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5c;">The Vedara</p>
<h1 style="margin:0 0 12px;font-size:22px;font-weight:normal;">${title}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555;">${message}</p>
<a href="/" style="font-size:14px;color:#8a7a5c;">Back to the site</a>
</div></body></html>`;

const html = (body: string, status = 200) =>
  new NextResponse(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

async function unsubscribe(id: string | null): Promise<boolean> {
  if (!id || !hasServiceClient()) return false;

  try {
    const supabase = getServiceClient();
    const stamp = nowIso();

    const { data } = await supabase
      .from('Inquiry')
      .update({ status: 'UNSUBSCRIBED', unsubscribedAt: stamp, updatedAt: stamp })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (!data) return false;

    // The worker checks inquiry status anyway; clearing the queue as well means
    // a stuck row cannot slip through later.
    await supabase
      .from('InquiryFollowUp')
      .update({ status: 'SKIPPED', error: 'unsubscribed', updatedAt: stamp })
      .eq('inquiryId', id)
      .eq('status', 'PENDING');

    return true;
  } catch (err: any) {
    console.error('Unsubscribe failed:', err?.message);
    return false;
  }
}

export async function GET(request: Request) {
  const done = await unsubscribe(new URL(request.url).searchParams.get('id'));

  return done
    ? html(PAGE('You are unsubscribed', 'We will not email you about this enquiry again. If you booked with us, your booking emails are separate and will still reach you.'))
    : html(
        PAGE(
          'That link has expired',
          'We could not find that enquiry — it may already have been closed. Email vedararetreat@gmail.com and we will make sure you hear nothing further.'
        ),
        404
      );
}

/** One-click unsubscribe from a mail client, per RFC 8058. */
export async function POST(request: Request) {
  await unsubscribe(new URL(request.url).searchParams.get('id'));
  // RFC 8058 wants a 2xx regardless; telling a mail client the id was unknown
  // achieves nothing and some clients retry on an error.
  return new NextResponse(null, { status: 204 });
}
