'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * GA4, for building the audiences that Google Ads targeting needs.
 *
 * The in-house PageView table answers "where is our traffic from" inside admin;
 * this exists because ad platforms will not take that table as an input. It
 * only loads when NEXT_PUBLIC_GA_ID is set, so development and preview stay
 * out of the property.
 *
 * Note for whoever wires this up: GA4 sets cookies, so a site serving the EU
 * needs a consent banner gating this component. Nothing here asks for consent
 * on its own.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // App Router navigations do not reload the page, so GA would otherwise only
  // ever see the first URL of a visit.
  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return;
    const query = searchParams.toString();
    window.gtag('event', 'page_view', {
      page_path: query ? `${pathname}?${query}` : pathname,
    });
  }, [pathname, searchParams]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
