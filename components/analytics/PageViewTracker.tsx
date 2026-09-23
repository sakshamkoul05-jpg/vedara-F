'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Records page views so the admin traffic report can say where visitors and
 * bookings actually come from.
 *
 * Location is resolved server side from the edge's own geo headers, so nothing
 * here asks for a position or touches an IP address. The only identifier is a
 * per-visit random value in sessionStorage, which the browser discards when the
 * tab closes.
 */

const SESSION_KEY = 'vedara-session';

/** Admin and staff traffic is our own; counting it would skew the report. */
const IGNORED_PREFIXES = ['/admin', '/employee'];

function sessionId(): string | null {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    // Private mode, or storage blocked. Without a session id the view cannot be
    // grouped into a visit, so it is skipped rather than stored half-useless.
    return null;
  }
}

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/** Call after a booking completes, to mark this visit as converted. */
export function markVisitConverted(): void {
  try {
    const id = sessionStorage.getItem(SESSION_KEY);
    if (!id) return;
    navigator.sendBeacon?.('/api/analytics/convert', new Blob([JSON.stringify({ sessionId: id })], { type: 'application/json' }));
  } catch {
    // A missed conversion flag costs a slightly pessimistic report, nothing more.
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // React runs effects twice in development; without this the first view of
  // every page is double-counted.
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const id = sessionId();
    if (!id) return;

    const payload = {
      path: pathname,
      referrer: document.referrer || null,
      locale: document.documentElement.lang || null,
      deviceType: deviceType(),
      sessionId: id,
      // Campaign tags come off the URL rather than being inferred, so an
      // untagged visit is honestly recorded as untagged.
      utmSource: searchParams.get('utm_source'),
      utmMedium: searchParams.get('utm_medium'),
      utmCampaign: searchParams.get('utm_campaign'),
    };

    // Fire and forget: a failed beacon must never surface to the visitor.
    fetch('/api/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
