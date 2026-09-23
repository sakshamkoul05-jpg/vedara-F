/**
 * Server-side helpers shared by the quote, search and booking routes, so all
 * three price a stay identically.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CouponInput } from './types';
import { newId } from '@/lib/ids';

export type CouponResult =
  | { ok: true; coupon: CouponInput; id: string }
  | { ok: false; error: string };

/**
 * Resolves a coupon code into engine input, enforcing the coupon's own rules:
 * active, not expired, total usage cap, and per-guest usage cap (spec §15).
 * The minimum-amount rule is left to the engine, which knows the subtotal.
 */
export async function resolveCoupon(
  supabase: SupabaseClient,
  code: string,
  guestKey?: string | null
): Promise<CouponResult> {
  const { data } = await supabase
    .from('Coupon')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .maybeSingle();

  // Codes may have been stored in mixed case before; fall back to exact match.
  const coupon =
    data ??
    (await supabase.from('Coupon').select('*').eq('code', code.trim()).maybeSingle()).data;

  if (!coupon || !coupon.isActive) return { ok: false, error: 'Invalid coupon code' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { ok: false, error: 'This coupon has expired' };
  }
  if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
    return { ok: false, error: 'This coupon has reached its usage limit' };
  }
  if (guestKey && coupon.maxUsesPerUser > 0) {
    const { count } = await supabase
      .from('CouponUsage')
      .select('id', { count: 'exact', head: true })
      .eq('couponId', coupon.id)
      .eq('userId', guestKey);
    if ((count ?? 0) >= coupon.maxUsesPerUser) {
      return { ok: false, error: 'You have already used this coupon' };
    }
  }

  return {
    ok: true,
    id: coupon.id,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
      discountValue: Number(coupon.discountValue),
      minAmount: Number(coupon.minAmount ?? 0) || undefined,
    },
  };
}

/**
 * Records a coupon use against a booking. Best effort: a failure here must not
 * undo a booking the guest has already made.
 */
export async function recordCouponUse(
  supabase: SupabaseClient,
  couponId: string,
  guestKey: string,
  bookingId: string
): Promise<void> {
  try {
    const { data } = await supabase.from('Coupon').select('usedCount').eq('id', couponId).single();
    await supabase
      .from('Coupon')
      .update({ usedCount: (data?.usedCount ?? 0) + 1 })
      .eq('id', couponId);
    await supabase.from('CouponUsage').insert({ id: newId(), couponId, userId: guestKey, bookingId });
  } catch (err) {
    console.error('Failed to record coupon use:', err);
  }
}
