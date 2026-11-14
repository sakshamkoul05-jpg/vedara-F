import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { getServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Creating the first administrator accounts.
 *
 * This endpoint used to fall back to a setup key and a password that were both
 * written in this file, in a public repository — and `ADMIN_SETUP_KEY` is not
 * set in production, so the fallback *was* the live configuration. Anyone who
 * read the source could POST here and take over every admin account.
 *
 * Now:
 *   - setup is disabled unless `ADMIN_SETUP_KEY` is configured;
 *   - the password comes from the caller and is never a constant;
 *   - existing accounts are only overwritten when `resetExisting` is asked for,
 *     so running this cannot quietly invalidate a password someone already has.
 *
 * The accounts are the ones the admin and employee areas expect.
 */
const ACCOUNTS: Array<{ email: string; name: string; role: string }> = [
  { email: 'vedararetreat@gmail.com', name: 'Vedara Admin', role: 'SUPER_ADMIN' },
  { email: 'admin@vedara.com', name: 'Vedara Admin (alt)', role: 'SUPER_ADMIN' },
  { email: 'manager@vedara.com', name: 'Hotel Manager', role: 'MANAGER' },
  { email: 'cafe@vedara.com', name: 'Cafe Staff', role: 'CAFE_STAFF' },
  { email: 'staff@vedara.com', name: 'Service Staff', role: 'RECEPTIONIST' },
];

const PHONE = '+91-9118882242';

function keysMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const configuredKey = process.env.ADMIN_SETUP_KEY;
    if (!configuredKey) {
      // Fail closed. A setup endpoint that cannot be locked down should not run.
      return NextResponse.json(
        { error: 'Setup is disabled: ADMIN_SETUP_KEY is not configured.' },
        { status: 503 }
      );
    }

    let body: { setupKey?: unknown; password?: unknown; resetExisting?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (typeof body.setupKey !== 'string' || !keysMatch(body.setupKey, configuredKey)) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }

    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 12 || password.length > 200) {
      return NextResponse.json(
        { error: 'A password of at least 12 characters is required.' },
        { status: 400 }
      );
    }

    const resetExisting = body.resetExisting === true;
    const hashedPassword = await bcrypt.hash(password, 12);
    const supabase = getServiceClient();
    const results: string[] = [];

    for (const account of ACCOUNTS) {
      const { data: existing, error: lookupError } = await supabase
        .from('User')
        .select('id, email')
        .eq('email', account.email)
        .maybeSingle();

      if (lookupError) {
        results.push(`${account.email}: lookup failed - ${lookupError.message}`);
        continue;
      }

      if (existing) {
        if (!resetExisting) {
          results.push(`${account.email}: already exists, left untouched`);
          continue;
        }
        const { error } = await supabase
          .from('User')
          .update({ password: hashedPassword, isActive: true, lockoutUntil: null })
          .eq('email', account.email);
        results.push(error ? `${account.email}: update failed - ${error.message}` : `${account.email}: password updated`);
        continue;
      }

      const { error } = await supabase.from('User').insert({
        email: account.email,
        password: hashedPassword,
        name: account.name,
        role: account.role,
        isActive: true,
        phone: PHONE,
      });
      results.push(error ? `${account.email}: create failed - ${error.message}` : `${account.email}: created`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed. Please try again.' }, { status: 500 });
  }
}
