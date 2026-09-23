'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Records a part-filled booking form as an open enquiry.
 *
 * Abandonment has no event of its own — the guest simply stops and closes the
 * tab — so the row has to exist *before* they leave. This writes one as soon as
 * there is something to follow up with, then keeps it current as they progress.
 *
 * Three things keep it from being noisy:
 *  - nothing is written until there is a usable email or phone number;
 *  - writes are debounced, so typing an address does not produce ten rows;
 *  - the server holds one row per id, so this updates rather than accumulates.
 *
 * It never blocks or fails the form: the endpoint answers 204 on every problem
 * and every call here swallows its own errors.
 */

const DEBOUNCE_MS = 2500;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A partly typed address or a lone dial code is not something to store. */
function usableContact(email: string, phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return EMAIL_PATTERN.test(email.trim()) || digits.length >= 10;
}

export type InquiryInput = {
  source: 'BOOKING_FORM' | 'CONTACT_FORM' | 'CHATBOT' | 'AVAILABILITY_SEARCH';
  step: number;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  cottageId: string;
  quotedAmount: number | null;
};

export function useInquiryCapture(input: InquiryInput) {
  const [id, setId] = useState<string | null>(null);
  const idRef = useRef<string | null>(null);
  idRef.current = id;

  // The last payload actually sent, so an unrelated re-render does not
  // re-POST identical details.
  const lastSent = useRef<string>('');

  const {
    source, step, name, email, phone, checkIn, checkOut, adults, children, cottageId, quotedAmount,
  } = input;

  useEffect(() => {
    // Step 4 is the confirmation screen: by then it is a booking, not an
    // enquiry, and the server closes the row off the booking itself.
    if (step >= 4) return;
    if (!usableContact(email, phone)) return;

    const payload = {
      id: idRef.current,
      source,
      name: name.trim() || null,
      email: EMAIL_PATTERN.test(email.trim()) ? email.trim() : null,
      phone: phone.replace(/\D/g, '').length >= 10 ? phone.trim() : null,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      adults: adults || null,
      children: children || null,
      cottageId: cottageId || null,
      lastStep: `step-${step}`,
      quotedAmount,
      locale: typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en',
    };

    const fingerprint = JSON.stringify({ ...payload, id: null });
    if (fingerprint === lastSent.current) return;

    const timer = setTimeout(async () => {
      lastSent.current = fingerprint;
      try {
        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok && res.status !== 204) {
          const json = await res.json().catch(() => null);
          if (json?.data?.id) setId(json.data.id);
        }
      } catch {
        // Losing an enquiry costs a follow-up, never the booking in progress.
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [source, step, name, email, phone, checkIn, checkOut, adults, children, cottageId, quotedAmount]);

  return { id };
}
