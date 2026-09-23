import { NextResponse } from 'next/server';
import { DICTIONARY, DICTIONARY_VERSION, MESSAGE_KEYS } from '@/lib/i18n/dictionary';
import { OVERRIDES } from '@/lib/i18n/overrides';
import { isSupportedLocale, localeDefinition } from '@/lib/i18n/locales';
import { translateAll } from '@/lib/i18n/translate';

export const runtime = 'nodejs';

/**
 * The whole interface dictionary for one language, in one request.
 *
 * Resolution order per key: a hand-written override, then the machine
 * translation cache, then English. That ordering is the hybrid: copy worth
 * owning is owned, and everything else is still translated rather than left in
 * a language the visitor may not read.
 *
 * The response is cached hard at the edge. A dictionary only changes when the
 * English source changes, and DICTIONARY_VERSION is in the payload so a client
 * holding a stale copy can tell.
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 404 });
  }

  const definition = localeDefinition(locale);
  const overrides = OVERRIDES[locale] ?? {};

  const messages: Record<string, string> = {};

  if (locale === 'en') {
    for (const key of MESSAGE_KEYS) messages[key] = DICTIONARY[key];
  } else {
    const needsTranslating = MESSAGE_KEYS.filter((key) => !overrides[key]).map((key) => DICTIONARY[key]);
    const translated = await translateAll(needsTranslating, locale, 'ui');

    for (const key of MESSAGE_KEYS) {
      const source = DICTIONARY[key];
      messages[key] = overrides[key] ?? translated.get(source) ?? source;
    }
  }

  return NextResponse.json(
    {
      data: {
        locale,
        dir: definition.dir,
        speechTag: definition.speechTag,
        version: DICTIONARY_VERSION,
        messages,
      },
    },
    {
      headers: {
        // A day at the edge, a week while revalidating. Worst case a visitor
        // sees week-old wording, which is a better trade than translating the
        // same dictionary on every cold start.
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
