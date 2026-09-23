import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSupportedLocale } from '@/lib/i18n/locales';
import { translateAll } from '@/lib/i18n/translate';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Translates copy that lives in the database — cottage descriptions, café
 * items, FAQs — which cannot go in the checked-in dictionary because it changes
 * without a deploy.
 *
 * The client sends the English strings it is about to render and gets back a
 * map. Everything is cached server side after the first request, so this is a
 * database read for all but the first visitor in a given language.
 */

const dynamicSchema = z.object({
  locale: z.string().trim().min(2).max(12),
  /** Bounded so one page cannot bill an unlimited translation job. */
  texts: z.array(z.string().max(4000)).max(120),
  namespace: z.string().trim().max(40).optional(),
});

const MAX_REQUESTS = 60;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, 'i18n-dynamic'), MAX_REQUESTS, WINDOW_MS).allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = dynamicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { locale, texts, namespace } = parsed.data;

  // English needs nothing, and an unknown language must not silently become
  // one we do support.
  if (!isSupportedLocale(locale) || locale === 'en') {
    return NextResponse.json({ data: {} });
  }

  const translated = await translateAll(texts, locale, namespace || 'dynamic');

  return NextResponse.json({ data: Object.fromEntries(translated) });
}
