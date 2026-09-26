'use client';

import { useEffect, useRef } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';
import { useLanguage } from '@/lib/i18n/provider';

/**
 * Translates the rendered page, whatever is on it.
 *
 * The checked-in dictionary covers navigation and the cottage cards, but a site
 * this size has thousands of sentences across About, the café, policies, the
 * booking flow and the FAQs. Routing every one through `t()` by hand would take
 * a long time, would miss things, and would need a code change for every new
 * line of copy. So this walks the DOM instead: whatever is visible gets
 * translated, including anything added later without anyone remembering to wire
 * it up.
 *
 * It is deliberately conservative about what it touches. Prices, phone numbers,
 * email addresses, URLs, code and brand names are left exactly as they are —
 * getting those wrong is worse than leaving a sentence in English.
 *
 * Requires GOOGLE_TRANSLATE_API_KEY on the server. Without it the endpoint
 * returns the source text and the page simply stays English.
 */

/** Never translated: the machine renders these as nonsense or as a rival brand. */
const PROTECTED = new Set([
  'The Vedara', 'Vedara', 'The Perch', 'The Vedara – Himalayan Boutique Retreat',
  'Monal Haven', 'Koklass Cove', 'Magpie Retreat', 'Whistling Thrush',
  'Flycatcher Nook', 'Bulbul Nest', 'The Finch Nook',
  'Jibhi', 'Ghiyagi', 'Jalori Pass', 'Serolsar Lake', 'Chehni Kothi',
  'Tirthan Valley', 'Mini Thailand', 'Lambhari Top', 'Bhuntar', 'Kullu', 'Manali',
  'WhatsApp', 'Razorpay', 'GST', 'WiFi', 'Wi-Fi',
]);

/** Subtrees whose text is never prose. */
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR',
  'TEXTAREA', 'SVG', 'PATH', 'CANVAS', 'IFRAME',
  // Next streams head elements into the body in development, and a translated
  // <title> would rewrite the browser tab.
  'TITLE', 'META', 'LINK', 'HEAD',
]);

/** Attributes worth translating — the ones a person actually reads. */
const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const;

/** The endpoint caps a batch; this stays inside it. */
const BATCH_SIZE = 100;

/**
 * Most strings a single page pass will send off.
 *
 * A real page is a few hundred. A number far above that means something is
 * feeding the translator its own output, and the honest response is to stop
 * rather than to spend money in a loop.
 */
const MAX_PER_PASS = 400;

/**
 * Whether a string is prose worth sending.
 *
 * Anything without two consecutive letters is a price, a date, an icon or
 * punctuation. Anything that looks like a contact detail or an address is left
 * alone because a mistranslated phone number is actively harmful.
 */
function isTranslatable(raw: string): boolean {
  const text = raw.trim();
  if (text.length < 2 || text.length > 3000) return false;

  // Needs real words, not "₹12,000" or "4.8" or "→".
  if (!/\p{L}\p{L}/u.test(text)) return false;

  // Anything showing money. Google generally preserves digits, but it also
  // re-groups them per locale, and a price that reads differently from the one
  // the engine quoted is a commercial problem rather than a cosmetic one.
  if (/[₹$€£¥]\s?\d/.test(text)) return false;

  // Contact details, URLs and file paths.
  if (/@[\w-]+\.\w/.test(text)) return false;
  if (/https?:\/\//i.test(text)) return false;
  if (/^[+\d][\d\s()+-]{6,}$/.test(text)) return false;
  if (/^\/[\w/-]+$/.test(text)) return false;

  // A booking reference such as VD1A2B3C4D5E.
  if (/^[A-Z0-9]{8,}$/.test(text)) return false;

  if (PROTECTED.has(text)) return false;

  return true;
}

/** True when this node sits inside something we must not touch. */
function isSkippable(node: Node): boolean {
  let element: HTMLElement | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);

  while (element) {
    if (SKIP_TAGS.has(element.tagName)) return true;
    if (element.getAttribute('translate') === 'no') return true;
    if (element.hasAttribute('data-no-translate')) return true;
    // Anything the guest is typing into must never be rewritten underneath them.
    if (element.isContentEditable) return true;
    element = element.parentElement;
  }
  return false;
}

type Job = { apply: (value: string) => void; source: string };

export function PageTranslator() {
  const { locale, translatedChrome } = useLanguage();

  /** locale -> source -> translation. Survives re-renders, cleared on switch. */
  const cache = useRef<Map<string, string>>(new Map());
  const cachedLocale = useRef(locale);
  /** Sources already requested, so a re-render does not re-ask. */
  const requested = useRef<Set<string>>(new Set());
  /**
   * Every string we have written into the page.
   *
   * Without this the observer sees our own edit, collects the translated text
   * as though it were fresh English, and sends it to be translated again — the
   * page accumulating a layer of translation per pass until it is unreadable.
   */
  const ourOutput = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  /** True while we are writing, so the observer ignores our own mutations. */
  const applying = useRef(false);

  useEffect(() => {
    if (cachedLocale.current !== locale) {
      cache.current.clear();
      requested.current.clear();
      ourOutput.current.clear();
      cachedLocale.current = locale;
    }

    if (locale === DEFAULT_LOCALE) return;

    let cancelled = false;

    /** Collect every translatable string currently on the page. */
    const collect = (): Job[] => {
      const jobs: Job[] = [];

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !isTranslatable(node.nodeValue)) return NodeFilter.FILTER_REJECT;
          if (isSkippable(node)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const raw = node.nodeValue!;
        const source = raw.trim();
        // Our own dictionary output, already in this language.
        if (translatedChrome.has(source)) continue;
        // Text this translator already wrote. Collecting it again is what
        // turns one pass into a loop.
        if (ourOutput.current.has(source)) continue;

        const textNode = node as Text;
        jobs.push({
          source,
          apply: (value) => {
            // Keep the original spacing so inline text does not run together.
            const [, lead = '', , trail = ''] = raw.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? [];
            textNode.nodeValue = lead + value + trail;
          },
        });
      }

      for (const attr of TRANSLATABLE_ATTRS) {
        for (const el of Array.from(document.querySelectorAll(`[${attr}]`))) {
          const value = el.getAttribute(attr);
          if (!value || !isTranslatable(value) || isSkippable(el)) continue;
          const source = value.trim();
          if (translatedChrome.has(source)) continue;
          if (ourOutput.current.has(source)) continue;
          jobs.push({ source, apply: (translated) => el.setAttribute(attr, translated) });
        }
      }

      return jobs;
    };

    const run = async () => {
      if (running.current || cancelled) return;
      running.current = true;

      try {
        const jobs = collect();
        if (jobs.length === 0) return;

        // Anything already known is applied immediately, with no network at
        // all — this is what makes re-renders and navigation feel instant.
        const unknown: string[] = [];
        applying.current = true;
        for (const job of jobs) {
          const hit = cache.current.get(job.source);
          if (hit) job.apply(hit);
          else if (!requested.current.has(job.source)) unknown.push(job.source);
        }
        setTimeout(() => { applying.current = false; }, 0);

        const pending = [...new Set(unknown)].slice(0, MAX_PER_PASS);
        if (pending.length === 0) return;
        for (const source of pending) requested.current.add(source);

        for (let i = 0; i < pending.length; i += BATCH_SIZE) {
          if (cancelled) return;
          const batch = pending.slice(i, i + BATCH_SIZE);
          try {
            const res = await fetch('/api/i18n/dynamic', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ locale, texts: batch, namespace: 'page' }),
            });
            if (!res.ok) continue;
            const json = await res.json();
            for (const [source, translated] of Object.entries(json.data ?? {})) {
              if (typeof translated === 'string' && translated !== source) {
                cache.current.set(source, translated);
                ourOutput.current.add(translated.trim());
              }
            }
          } catch {
            // Leave this batch in English; the page is still usable.
          }
        }

        if (cancelled) return;
        // Re-collect rather than reusing the earlier jobs: React may have
        // replaced those nodes while the request was in flight.
        applying.current = true;
        try {
          for (const job of collect()) {
            const hit = cache.current.get(job.source);
            if (hit) job.apply(hit);
          }
        } finally {
          // Let the observer settle before listening again, so the batch of
          // edits just made does not schedule another pass.
          setTimeout(() => { applying.current = false; }, 0);
        }
      } finally {
        running.current = false;
      }
    };

    const schedule = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(run, 150);
    };

    schedule();

    // React re-renders overwrite our text, and route changes bring entirely new
    // copy, so the page is watched rather than translated once.
    const observer = new MutationObserver((records) => {
      if (applying.current) return;
      for (const record of records) {
        if (record.type === 'characterData' || record.addedNodes.length > 0) {
          schedule();
          return;
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [locale, translatedChrome]);

  return null;
}
