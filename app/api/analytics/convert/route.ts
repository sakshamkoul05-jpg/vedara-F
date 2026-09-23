import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Mark a visit as having produced a booking.
 *
 * Without this the location report only answers "where do visitors come from",
 * which flatters whichever market sends the most idle browsing. Flagging the
 * visit lets the same report answer "where do *bookings* come from", which is
 * the number worth spending an advertising budget against.
 *
 * Only the session's own rows are touched, and no booking reference or guest
 * detail is stored against them — the flag is a boolean and nothing more.
 */

const convertSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
});

const MAX_CALLS = 20;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const noContent = new NextResponse(null, { status: 204 });

  if (!rateLimit(clientKey(request, 'analytics-convert'), MAX_CALLS, WINDOW_MS).allowed) return noContent;
  if (!hasServiceClient()) return noContent;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noContent;
  }

  const parsed = convertSchema.safeParse(body);
  if (!parsed.success) return noContent;

  try {
    await getServiceClient()
      .from('PageView')
      .update({ converted: true })
      .eq('sessionId', parsed.data.sessionId);
  } catch (err: any) {
    console.error('Page view conversion flag failed:', err?.message);
  }

  return noContent;
}
