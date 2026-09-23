import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Enquiries that never became bookings, with the state of their follow-ups.
 *
 * The automated ladder is three messages and then silence. This is what the
 * desk uses to decide which of those are worth a phone call, which the ladder
 * deliberately does not attempt.
 */

const STATUSES = ['OPEN', 'CONVERTED', 'CLOSED', 'UNSUBSCRIBED'] as const;

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  if (!hasServiceClient()) {
    return NextResponse.json({ error: 'Service role key is not set' }, { status: 503 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'OPEN';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 200);

  let query = getServiceClient()
    .from('Inquiry')
    .select('*, cottage:Cottage(name, slug), followUps:InquiryFollowUp(channel, stage, status, scheduledAt, sentAt, error)')
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (status !== 'ALL' && STATUSES.includes(status as any)) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('Inquiry list failed:', error.message);
    return NextResponse.json({ error: 'Could not load enquiries.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
