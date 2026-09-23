/**
 * The languages the site is offered in.
 *
 * English is the source: every string is authored in it, and every other
 * locale is derived from it. The rest are the markets that actually reach
 * Jibhi — European and East Asian travellers, Israeli travellers, and the
 * Indian languages spoken by domestic guests.
 *
 * `nativeName` is what the switcher shows, because someone looking for their
 * own language is scanning for it in its own script, not for its English name.
 */

export const DEFAULT_LOCALE = 'en';

export type LocaleDefinition = {
  code: string;
  /** English name, for admin reporting. */
  name: string;
  /** The language's own name, for the switcher. */
  nativeName: string;
  dir: 'ltr' | 'rtl';
  /**
   * BCP-47 tag for speech synthesis and recognition in the concierge, which
   * wants a region as well as a language.
   */
  speechTag: string;
};

export const LOCALES: LocaleDefinition[] = [
  { code: 'en', name: 'English',    nativeName: 'English',   dir: 'ltr', speechTag: 'en-IN' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',      dir: 'ltr', speechTag: 'hi-IN' },
  { code: 'he', name: 'Hebrew',     nativeName: 'עברית',     dir: 'rtl', speechTag: 'he-IL' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',    dir: 'rtl', speechTag: 'ar-SA' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',   dir: 'ltr', speechTag: 'es-ES' },
  { code: 'fr', name: 'French',     nativeName: 'Français',  dir: 'ltr', speechTag: 'fr-FR' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',   dir: 'ltr', speechTag: 'de-DE' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',  dir: 'ltr', speechTag: 'it-IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', speechTag: 'pt-PT' },
  { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands',dir: 'ltr', speechTag: 'nl-NL' },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',   dir: 'ltr', speechTag: 'ru-RU' },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',       dir: 'ltr', speechTag: 'zh-CN' },
  { code: 'ja', name: 'Japanese',   nativeName: '日本語',      dir: 'ltr', speechTag: 'ja-JP' },
  { code: 'ko', name: 'Korean',     nativeName: '한국어',      dir: 'ltr', speechTag: 'ko-KR' },
  { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు',      dir: 'ltr', speechTag: 'te-IN' },
  { code: 'kn', name: 'Kannada',    nativeName: 'ಕನ್ನಡ',       dir: 'ltr', speechTag: 'kn-IN' },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',       dir: 'ltr', speechTag: 'ta-IN' },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',       dir: 'ltr', speechTag: 'bn-IN' },
  { code: 'mr', name: 'Marathi',    nativeName: 'मराठी',       dir: 'ltr', speechTag: 'mr-IN' },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

const BY_CODE = new Map(LOCALES.map((l) => [l.code, l]));

export function isSupportedLocale(code: string | null | undefined): boolean {
  return Boolean(code && BY_CODE.has(code));
}

export function localeDefinition(code: string): LocaleDefinition {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_LOCALE)!;
}

/**
 * Best supported match for an Accept-Language header or navigator.languages.
 *
 * Region is dropped: we offer one Spanish, not five, and a visitor with
 * `es-MX` is better served Spanish than English.
 */
export function resolveLocale(candidates: readonly string[]): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalised = candidate.trim().toLowerCase();
    if (BY_CODE.has(normalised)) return normalised;
    const base = normalised.split('-')[0];
    if (BY_CODE.has(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Name of the cookie holding the visitor's choice, read on the server too. */
export const LOCALE_COOKIE = 'vd_locale';
