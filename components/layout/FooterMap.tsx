'use client';

import { useEffect, useRef } from 'react';

const MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao';

const THE_VEDARA = { lat: 31.4875, lng: 77.5410 };

let scriptPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as any;
  if (w.google?.maps) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    w.gm_authFailure = () =>
      reject(new Error('Google Maps auth failed: check the API key and its referrer restrictions'));

    const existing = document.getElementById('google-maps-script');
    const onReady = () => {
      if (w.google?.maps) resolve();
      else reject(new Error('Google Maps failed to initialize'));
    };
    if (existing) {
      if (w.google?.maps) return resolve();
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', () =>
        reject(new Error('Google Maps script blocked (network or CSP)'))
      );
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error('Google Maps script blocked (network or CSP)'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function FooterMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const w = window as any;
        if (!w.google?.maps) return;
        const map = new w.google.maps.Map(ref.current, {
          center: THE_VEDARA,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'cooperative',
        });
        new w.google.maps.Marker({
          position: THE_VEDARA,
          map,
          title: 'The Vedara – Himalayan Boutique Retreat',
        });
      })
      .catch((err) => {
        console.error('[FooterMap]', err);
        if (ref.current) {
          ref.current.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:12px;text-align:center;padding:0 8px">Map unavailable</div>';
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={ref}
      className="w-full bg-sand-200"
      style={{ height: 160 }}
      role="img"
      aria-label="The Vedara Retreat location map"
    />
  );
}
