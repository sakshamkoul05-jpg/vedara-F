import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Returns everything the pricing admin screen needs in one round trip:
 * the rate card, the rules, and the cottages the rates hang off.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();

    const [
      cottages,
      seasons,
      seasonRates,
      specialPeakPeriods,
      specialPeakRates,
      breakfastBands,
      childBands,
      longStayRules,
      inventoryTiers,
      taxSlabs,
      settings,
      coupons,
    ] = await Promise.all([
      supabase
        .from('Cottage')
        .select(
          'id, name, slug, sortOrder, isActive, pricingCategory, baseAdults, maxAdults, maxOccupancy, allowsExtraMattress, extraMattressPrice, maxExtraMattresses, publicDescriptor'
        )
        .order('sortOrder'),
      supabase.from('Season').select('*').order('sortOrder'),
      supabase.from('SeasonRate').select('*'),
      supabase.from('SpecialPeakPeriod').select('*').order('startDate'),
      supabase.from('SpecialPeakRate').select('*'),
      supabase.from('BreakfastBand').select('*').order('minAge'),
      supabase.from('ChildBand').select('*').order('minAge'),
      supabase.from('LongStayRule').select('*'),
      supabase.from('InventoryTier').select('*').order('minBookedRatio'),
      supabase.from('TaxSlab').select('*').order('minTariff'),
      supabase.from('PricingSetting').select('*'),
      supabase.from('Coupon').select('*').order('createdAt', { ascending: false }),
    ]);

    const failed = [
      cottages,
      seasons,
      seasonRates,
      specialPeakPeriods,
      specialPeakRates,
      breakfastBands,
      childBands,
      longStayRules,
      inventoryTiers,
      taxSlabs,
      settings,
    ].find((r) => r.error);

    if (failed?.error) {
      // A missing table almost always means the pricing migration has not run.
      return NextResponse.json(
        {
          error:
            'Could not load pricing configuration. Has the pricing engine migration been applied?',
          detail: failed.error.message,
        },
        { status: 500 }
      );
    }

    const settingsMap: Record<string, unknown> = {};
    for (const row of settings.data ?? []) {
      settingsMap[(row as any).key] = (row as any).value;
    }

    return NextResponse.json({
      data: {
        cottages: cottages.data ?? [],
        seasons: seasons.data ?? [],
        seasonRates: seasonRates.data ?? [],
        specialPeakPeriods: specialPeakPeriods.data ?? [],
        specialPeakRates: specialPeakRates.data ?? [],
        breakfastBands: breakfastBands.data ?? [],
        childBands: childBands.data ?? [],
        longStayRules: longStayRules.data ?? [],
        inventoryTiers: inventoryTiers.data ?? [],
        taxSlabs: taxSlabs.data ?? [],
        settings: settingsMap,
        settingRows: settings.data ?? [],
        coupons: coupons.data ?? [],
      },
    });
  } catch (err) {
    console.error('Admin pricing config load failed:', err);
    return NextResponse.json({ error: 'Could not load pricing configuration' }, { status: 500 });
  }
}
