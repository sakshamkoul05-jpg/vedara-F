import { createHash } from 'node:crypto';
import { getServiceClient, hasServiceClient } from '@/lib/supabase-server';
import { newId, nowIso } from '@/lib/ids';

/**
 * Machine translation, cached.
 *
 * Server-only. Every string is translated once and stored in the Translation
 * table keyed by (locale, hash of the source), so the provider is paid for the
 * first visitor in a language and nobody after. A string that changes gets a
 * new hash and is translated afresh; the old row simply stops being read.
 *
 * Every failure path returns the English source rather than throwing. A page
 * in the wrong language is a disappointment; a page that will not render is a
 * lost booking.
 */

const PROVIDER = 'google';
const API_URL = 'https://translation.googleapis.com/language/translate/v2';

/** Google rejects oversized batches; this stays well inside the limit. */
const BATCH_SIZE = 100;

export function sourceHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export function translationConfigured(): boolean {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
}

/**
 * Translate a batch through the provider.
 *
 * Returns a map from source text to translation, omitting anything that
 * failed — callers fall back to the source for those.
 */
async function translateBatch(texts: string[], targetLocale: string): Promise<Map<string, string>> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  const out = new Map<string, string>();
  if (!key || texts.length === 0) return out;

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const chunk = texts.slice(i, i + BATCH_SIZE);
    try {
      const res = await fetch(`${API_URL}?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: chunk,
          source: 'en',
          target: targetLocale,
          // Our strings are plain text. Asking for text avoids the provider
          // HTML-escaping apostrophes into &#39; in the output.
          format: 'text',
        }),
      });

      if (!res.ok) {
        console.error(`Translation failed for ${targetLocale}:`, res.status, await res.text().catch(() => ''));
        continue;
      }

      const json = await res.json();
      const translations: { translatedText: string }[] = json?.data?.translations ?? [];
      chunk.forEach((source, index) => {
        const translated = translations[index]?.translatedText;
        if (translated) out.set(source, translated);
      });
    } catch (err: any) {
      console.error(`Translation request failed for ${targetLocale}:`, err?.message);
    }
  }

  return out;
}

/**
 * Translations for a set of strings, reading the cache first and only sending
 * the misses to the provider.
 *
 * The returned map always has an entry for every input: the translation where
 * one could be produced, the English source otherwise.
 */
export async function translateAll(
  texts: string[],
  targetLocale: string,
  namespace = 'dynamic'
): Promise<Map<string, string>> {
  const unique = [...new Set(texts.filter((t) => t && t.trim()))];
  const result = new Map<string, string>(unique.map((t) => [t, t]));

  if (unique.length === 0 || targetLocale === 'en') return result;
  if (!hasServiceClient()) return result;

  const supabase = getServiceClient();
  const byHash = new Map(unique.map((text) => [sourceHash(text), text]));

  // --- cache ----------------------------------------------------------------
  const { data: cached, error } = await supabase
    .from('Translation')
    .select('sourceHash, translated')
    .eq('locale', targetLocale)
    .in('sourceHash', [...byHash.keys()]);

  if (error) console.error('Translation cache read failed:', error.message);

  const missing = new Map(byHash);
  for (const row of cached ?? []) {
    const source = byHash.get(row.sourceHash);
    if (source) {
      result.set(source, row.translated);
      missing.delete(row.sourceHash);
    }
  }

  if (missing.size === 0 || !translationConfigured()) return result;

  // --- provider -------------------------------------------------------------
  const fresh = await translateBatch([...missing.values()], targetLocale);
  if (fresh.size === 0) return result;

  const rows = [...fresh.entries()].map(([source, translated]) => ({
    id: newId(),
    locale: targetLocale,
    sourceHash: sourceHash(source),
    sourceText: source,
    translated,
    namespace,
    provider: PROVIDER,
    updatedAt: nowIso(),
  }));

  for (const [source, translated] of fresh) result.set(source, translated);

  // Two requests for the same new string can race here; the unique index on
  // (locale, sourceHash) settles it and ignoreDuplicates keeps the loser quiet.
  const { error: writeError } = await supabase
    .from('Translation')
    .upsert(rows, { onConflict: 'locale,sourceHash', ignoreDuplicates: true });
  if (writeError) console.error('Translation cache write failed:', writeError.message);

  return result;
}
