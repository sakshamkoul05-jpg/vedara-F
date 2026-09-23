import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';
import { invalidatePricingConfig } from '@/lib/pricing/load-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Global pricing switches and scalars (spec §15).
 *
 * Stored as key/value rows rather than columns so a new switch does not need a
 * migration. Each key is validated individually — an out-of-range uplift
 * ceiling or a nonsense weekend definition would silently distort every quote.
 */
const SETTING_SCHEMAS: Record<string, z.ZodTypeAny> = {
  weekendDays: z.array(z.number().int().min(0).max(6)).min(0).max(7),
  extraMattressPrice: z.number().int().min(0).max(1_000_000),
  adultAgeThreshold: z.number().int().min(1).max(30),
  inventoryPricingEnabled: z.boolean(),
  inventoryUpliftCeilingPercent: z.number().min(0).max(100),
  longStayEnabled: z.boolean(),
  minStayNights: z.number().int().min(1).max(30),
  roundingMode: z.enum(['NONE', 'NEAREST_RUPEE', 'NEAREST_TEN']),
};

const payloadSchema = z.record(z.string(), z.unknown());

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const updates: { key: string; value: unknown }[] = [];
  const errors: Record<string, string> = {};

  for (const [key, raw] of Object.entries(parsed.data)) {
    const schema = SETTING_SCHEMAS[key];
    if (!schema) {
      errors[key] = 'Unknown setting';
      continue;
    }
    const result = schema.safeParse(raw);
    if (!result.success) {
      errors[key] = result.error.issues[0]?.message ?? 'Invalid value';
      continue;
    }
    updates.push({ key, value: result.data });
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Invalid values', details: errors }, { status: 400 });
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();

    for (const { key, value } of updates) {
      const { error } = await supabase
        .from('PricingSetting')
        .upsert({ key, value, updatedAt: new Date().toISOString() }, { onConflict: 'key' });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    invalidatePricingConfig();
    return NextResponse.json({ data: { updated: updates.map((u) => u.key) } });
  } catch (err) {
    console.error('Pricing settings update failed:', err);
    return NextResponse.json({ error: 'Could not save settings' }, { status: 500 });
  }
}
