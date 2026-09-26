'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DICTIONARY, DICTIONARY_VERSION, type MessageKey } from './dictionary';
import {
  DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale, localeDefinition, resolveLocale,
} from './locales';

/**
 * Language for the whole site.
 *
 * The locale lives in a cookie rather than the URL. That keeps one canonical
 * address per page — no duplicate URLs for search engines to weigh against each
 * other, and no link that carries a stranger's language choice when it is
 * shared. The trade is that the first paint is English until the dictionary
 * arrives, which is why `t()` falls back to the English source rather than
 * rendering blanks or keys.
 */

type Dictionary = Partial<Record<MessageKey, string>>;

type LanguageContextValue = {
  locale: string;
  dir: 'ltr' | 'rtl';
  /** BCP-47 tag for speech input and output in the concierge. */
  speechTag: string;
  /** True until the dictionary for a non-English locale has loaded. */
  loading: boolean;
  setLocale: (locale: string) => void;
  /** An interface string. Falls back to English, never to a bare key. */
  t: (key: MessageKey) => string;
  /**
   * Translate copy that came from the database. Returns the English source
   * until the translation arrives, so nothing ever renders empty.
   */
  td: (text: string | null | undefined) => string;
  /** Register database strings to be translated. Safe to call repeatedly. */
  registerDynamic: (texts: (string | null | undefined)[]) => void;
  /**
   * Every string the dictionary has already rendered in this language, so the
   * page translator can recognise its own output and leave it alone.
   */
  translatedChrome: Set<string>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const storageKey = (locale: string) => `vd-i18n-${locale}-v${DICTIONARY_VERSION}`;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string): void {
  // A year, site-wide. Lax is enough: nothing here is a credential, and it
  // needs to survive arriving from an external link.
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Dictionary>({});
  const [dynamic, setDynamic] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Strings seen this session but not yet sent for translation. A ref rather
  // than state so registering during render does not cause a render loop.
  const pending = useRef<Set<string>>(new Set());
  const requested = useRef<Set<string>>(new Set());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- decide the initial language -----------------------------------------
  useEffect(() => {
    const saved = readCookie(LOCALE_COOKIE);
    if (isSupportedLocale(saved)) {
      setLocaleState(saved!);
      return;
    }
    // No stored choice: follow the browser, which is usually right for a guest
    // arriving from abroad and costs nothing when it is not.
    const detected = resolveLocale(navigator.languages ?? [navigator.language]);
    setLocaleState(detected);
  }, []);

  // --- load the interface dictionary ---------------------------------------
  useEffect(() => {
    const definition = localeDefinition(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = definition.dir;

    if (locale === DEFAULT_LOCALE) {
      setMessages({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Serve last session's copy immediately, then refresh. A returning visitor
    // should not watch their own language load in.
    try {
      const cached = localStorage.getItem(storageKey(locale));
      if (cached) setMessages(JSON.parse(cached));
    } catch {
      // Storage unavailable; the fetch below still populates it.
    }

    setLoading(true);
    fetch(`/api/i18n/${locale}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.data?.messages) return;
        setMessages(json.data.messages);
        try {
          localStorage.setItem(storageKey(locale), JSON.stringify(json.data.messages));
        } catch {
          // Quota or private mode. The dictionary still works for this visit.
        }
      })
      .catch(() => {
        // Leave whatever is loaded; t() falls back to English regardless.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [locale]);

  // Database strings already translated for one language mean nothing in
  // another, and the same strings have to be asked for again.
  useEffect(() => {
    setDynamic({});
    requested.current = new Set();
  }, [locale]);

  const flushDynamic = useCallback(() => {
    const texts = [...pending.current].filter((text) => !requested.current.has(text));
    pending.current.clear();
    if (texts.length === 0 || locale === DEFAULT_LOCALE) return;

    for (const text of texts) requested.current.add(text);

    fetch('/api/i18n/dynamic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The endpoint caps the batch; slicing here keeps a very long page from
      // having its request rejected wholesale.
      body: JSON.stringify({ locale, texts: texts.slice(0, 120) }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) setDynamic((prev) => ({ ...prev, ...json.data }));
      })
      .catch(() => {
        // Untranslated database copy still renders, in English.
      });
  }, [locale]);

  const registerDynamic = useCallback(
    (texts: (string | null | undefined)[]) => {
      if (locale === DEFAULT_LOCALE) return;
      let added = false;
      for (const text of texts) {
        const value = text?.trim();
        if (!value || requested.current.has(value) || pending.current.has(value)) continue;
        pending.current.add(value);
        added = true;
      }
      if (!added) return;

      // Batched, so a list of cottage cards produces one request rather than one
      // per card.
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flushDynamic, 120);
    },
    [locale, flushDynamic]
  );

  const setLocale = useCallback((next: string) => {
    if (!isSupportedLocale(next)) return;
    writeCookie(LOCALE_COOKIE, next);
    setLocaleState(next);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const definition = localeDefinition(locale);
    return {
      locale,
      dir: definition.dir,
      speechTag: definition.speechTag,
      loading,
      setLocale,
      t: (key) => messages[key] ?? DICTIONARY[key],
      td: (text) => (text ? dynamic[text.trim()] ?? text : ''),
      registerDynamic,
      translatedChrome: new Set(Object.values(messages)),
    };
  }, [locale, messages, dynamic, loading, setLocale, registerDynamic]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Language tools for a component.
 *
 * Usable outside the provider — it falls back to English — so a component can
 * be rendered in isolation, in a test or in admin, without one.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context) return context;

  return {
    locale: DEFAULT_LOCALE,
    dir: 'ltr',
    speechTag: 'en-IN',
    loading: false,
    setLocale: () => {},
    t: (key) => DICTIONARY[key],
    td: (text) => text ?? '',
    registerDynamic: () => {},
    translatedChrome: new Set<string>(),
  };
}

/**
 * Translate database copy, registering it on first render.
 *
 * Returns the English source until the translation lands, so text never
 * flickers through an empty state.
 */
export function useDynamicText(texts: (string | null | undefined)[]): (text: string | null | undefined) => string {
  const { td, registerDynamic } = useLanguage();
  const key = texts.filter(Boolean).join('\u0000');

  useEffect(() => {
    registerDynamic(texts);
    // `key` stands in for the array's contents; the array itself is a new
    // reference on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, registerDynamic]);

  return td;
}
