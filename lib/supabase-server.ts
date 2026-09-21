import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client.
 *
 * Uses the service role key so that route handlers can write rows the browser
 * must never be able to write directly — confirming a payment, stamping a
 * pricing snapshot, editing the rate card. This module must never be imported
 * from a client component.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynwczlfkskiwtitwyggq.supabase.co';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: SupabaseClient | null = null;

/**
 * Throws when the service role key is absent rather than silently falling back
 * to the anon key — a route that quietly ran with anon privileges would fail in
 * confusing ways, or worse, appear to succeed while writing nothing.
 */
export function getServiceClient(): SupabaseClient {
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Server-side booking and payment routes cannot run without it.'
    );
  }
  if (!cached) {
    cached = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export function hasServiceClient(): boolean {
  return Boolean(serviceRoleKey);
}
