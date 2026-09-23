import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';
import { invalidatePricingConfig } from '@/lib/pricing/load-config';
import { newId } from '@/lib/ids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CRUD for every admin-configurable pricing record (spec §15).
 *
 * Each resource declares the table it writes to and a schema for the fields an
 * admin may set, so no request can reach a column that is not meant to be
 * editable. Rates change without a code deployment (spec §17).
 */

const positiveInt = z.number().int().min(0).max(10_000_000);
const age = z.number().int().min(0).max(120);
const ratio = z.number().min(0).max(1.01);
const percent = z.number().min(0).max(100);

const RESOURCES = {
  cottages: {
    table: 'Cottage',
    // Only the pricing-relevant columns; name, images and copy live elsewhere.
    schema: z.object({
      pricingCategory: z.enum(['STUDIO', 'BOUTIQUE', 'PREMIUM', 'SIGNATURE']).nullable().optional(),
      baseAdults: z.number().int().min(1).max(10).optional(),
      maxAdults: z.number().int().min(1).max(10).optional(),
      maxOccupancy: z.number().int().min(1).max(12).optional(),
      maxChildren: z.number().int().min(0).max(10).optional(),
      allowsExtraMattress: z.boolean().optional(),
      extraMattressPrice: positiveInt.nullable().optional(),
      maxExtraMattresses: z.number().int().min(0).max(3).optional(),
      publicDescriptor: z.string().max(200).nullable().optional(),
      isActive: z.boolean().optional(),
    }),
    allowCreate: false,
    allowDelete: false,
  },
  seasons: {
    table: 'Season',
    schema: z.object({
      name: z.string().min(1).max(60),
      type: z.enum(['VALUE', 'REGULAR', 'HIGH', 'PEAK', 'SPECIAL_PEAK']),
      months: z.array(z.number().int().min(1).max(12)).max(12),
      // Optional so creates work before migration 20260923 adds the column.
      minStay: z.number().int().min(1).max(30).optional(),
      isActive: z.boolean(),
      sortOrder: z.number().int().min(0).max(100),
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'season-rates': {
    table: 'SeasonRate',
    schema: z.object({
      seasonId: z.string().min(1),
      cottageId: z.string().min(1),
      adults: z.number().int().min(1).max(10),
      weekdayRate: positiveInt,
      weekendRate: positiveInt,
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'special-peak-periods': {
    table: 'SpecialPeakPeriod',
    schema: z.object({
      name: z.string().min(1).max(100),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      minStay: z.number().int().min(1).max(30).optional(),
      isActive: z.boolean(),
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'special-peak-rates': {
    table: 'SpecialPeakRate',
    schema: z.object({
      periodId: z.string().min(1),
      cottageId: z.string().min(1),
      adults: z.number().int().min(1).max(10),
      rate: positiveInt,
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'breakfast-bands': {
    table: 'BreakfastBand',
    schema: z.object({
      label: z.string().min(1).max(80),
      minAge: age,
      maxAge: age,
      pricePerNight: positiveInt,
      isActive: z.boolean(),
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'child-bands': {
    table: 'ChildBand',
    schema: z.object({
      label: z.string().min(1).max(80),
      minAge: age,
      maxAge: age,
      chargedAsAdult: z.boolean(),
      accommodationCharge: positiveInt,
      isActive: z.boolean(),
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'long-stay-rules': {
    table: 'LongStayRule',
    schema: z.object({
      name: z.string().min(1).max(80),
      nightsRequired: z.number().int().min(2).max(30),
      nightsCharged: z.number().int().min(1).max(30),
      enabledSeasonTypes: z.array(
        z.enum(['VALUE', 'REGULAR', 'HIGH', 'PEAK', 'SPECIAL_PEAK'])
      ),
      cottageIds: z.array(z.string()),
      blackoutDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
      validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      validTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      stackableWithCoupon: z.boolean(),
      stackableWithOffers: z.boolean().optional(),
      isActive: z.boolean(),
    }),
    allowCreate: true,
    allowDelete: true,
  },
  // Spec §9. Seeded inactive: "Initially require admin activation".
  'last-minute-offers': {
    table: 'LastMinuteOffer',
    schema: z.object({
      name: z.string().min(1).max(80),
      offerType: z.enum(['ROOM_DISCOUNT', 'COMPLIMENTARY_BREAKFAST', 'MEAL_CREDIT']),
      value: z.number().min(0).max(100_000),
      daysBeforeArrival: z.number().int().min(0).max(60),
      maxBookedCottages: z.number().int().min(0).max(50),
      cottageIds: z.array(z.string()),
      stackableWithCoupon: z.boolean(),
      isActive: z.boolean(),
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'inventory-tiers': {
    table: 'InventoryTier',
    schema: z.object({
      minBookedRatio: ratio,
      maxBookedRatio: ratio,
      upliftPercent: percent,
      isActive: z.boolean(),
    }),
    allowCreate: true,
    allowDelete: true,
  },
  'tax-slabs': {
    table: 'TaxSlab',
    schema: z.object({
      name: z.string().min(1).max(60),
      minTariff: positiveInt,
      maxTariff: positiveInt.nullable(),
      ratePercent: percent,
      isActive: z.boolean(),
    }),
    allowCreate: true,
    allowDelete: true,
  },
} as const;

type ResourceKey = keyof typeof RESOURCES;

function resolve(resource: string) {
  return (RESOURCES as Record<string, (typeof RESOURCES)[ResourceKey]>)[resource];
}

/** Rules with a numeric range must not be saved inverted. */
function validateRanges(resource: string, data: Record<string, unknown>): string | null {
  if (resource === 'breakfast-bands' || resource === 'child-bands') {
    const { minAge, maxAge } = data as { minAge?: number; maxAge?: number };
    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      return 'Minimum age cannot be greater than maximum age.';
    }
  }
  if (resource === 'special-peak-periods') {
    const { startDate, endDate } = data as { startDate?: string; endDate?: string };
    if (startDate && endDate && startDate > endDate) {
      return 'Start date cannot be after end date.';
    }
  }
  if (resource === 'inventory-tiers') {
    const { minBookedRatio, maxBookedRatio } = data as {
      minBookedRatio?: number;
      maxBookedRatio?: number;
    };
    if (
      minBookedRatio !== undefined &&
      maxBookedRatio !== undefined &&
      minBookedRatio >= maxBookedRatio
    ) {
      return 'The lower bound must be below the upper bound.';
    }
  }
  if (resource === 'tax-slabs') {
    const { minTariff, maxTariff } = data as { minTariff?: number; maxTariff?: number | null };
    if (minTariff !== undefined && maxTariff != null && minTariff > maxTariff) {
      return 'Minimum tariff cannot be greater than maximum tariff.';
    }
  }
  if (resource === 'long-stay-rules') {
    const { nightsRequired, nightsCharged } = data as {
      nightsRequired?: number;
      nightsCharged?: number;
    };
    if (
      nightsRequired !== undefined &&
      nightsCharged !== undefined &&
      nightsCharged >= nightsRequired
    ) {
      return 'Nights charged must be fewer than nights required, or the benefit does nothing.';
    }
  }
  if (resource === 'long-stay-rules') {
    const { validFrom, validTo } = data as { validFrom?: string | null; validTo?: string | null };
    if (validFrom && validTo && validFrom > validTo) {
      return 'The window start cannot be after its end.';
    }
  }
  if (resource === 'last-minute-offers') {
    const { offerType, value } = data as { offerType?: string; value?: number };
    // Spec §9: "up to 10% room discount". The engine caps it too.
    if (offerType === 'ROOM_DISCOUNT' && value !== undefined && value > 10) {
      return 'A last-minute room discount can be at most 10%.';
    }
  }
  if (resource === 'cottages') {
    const { baseAdults, maxAdults, maxOccupancy, maxChildren } = data as {
      baseAdults?: number;
      maxAdults?: number;
      maxOccupancy?: number;
      maxChildren?: number;
    };
    if (maxChildren !== undefined && maxOccupancy !== undefined && maxChildren > maxOccupancy) {
      return 'Maximum children cannot exceed maximum total occupancy.';
    }
    if (baseAdults !== undefined && maxAdults !== undefined && baseAdults > maxAdults) {
      return 'Base adults cannot exceed maximum adults.';
    }
    if (maxAdults !== undefined && maxOccupancy !== undefined && maxAdults > maxOccupancy) {
      return 'Maximum adults cannot exceed maximum total occupancy.';
    }
  }
  return null;
}

async function guard(resource: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) };
  }
  const config = resolve(resource);
  if (!config) {
    return { error: NextResponse.json({ error: 'Unknown resource' }, { status: 404 }) };
  }
  return { config };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const { resource } = await params;
  const { error, config } = await guard(resource);
  if (error) return error;
  if (!config!.allowCreate) {
    return NextResponse.json({ error: 'This resource cannot be created' }, { status: 405 });
  }

  const body = await request.json().catch(() => null);
  const parsed = config!.schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid values', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const rangeError = validateRanges(resource, parsed.data as Record<string, unknown>);
  if (rangeError) return NextResponse.json({ error: rangeError }, { status: 400 });

  const supabase = getServiceClient();
  // The row shape is a union across every resource, which the client's generic
  // insert signature cannot narrow; the Zod parse above is what guarantees it.
  const { data, error: dbError } = await supabase
    .from(config!.table)
    .insert({ id: newId(), ...(parsed.data as Record<string, unknown>) })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  invalidatePricingConfig();
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const { resource } = await params;
  const { error, config } = await guard(resource);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || !('id' in body)) {
    return NextResponse.json({ error: 'An id is required' }, { status: 400 });
  }

  const { id, ...rest } = body as { id: string } & Record<string, unknown>;
  const parsed = config!.schema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid values', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const rangeError = validateRanges(resource, parsed.data as Record<string, unknown>);
  if (rangeError) return NextResponse.json({ error: rangeError }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error: dbError } = await supabase
    .from(config!.table)
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  invalidatePricingConfig();
  return NextResponse.json({ data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const { resource } = await params;
  const { error, config } = await guard(resource);
  if (error) return error;
  if (!config!.allowDelete) {
    return NextResponse.json({ error: 'This resource cannot be deleted' }, { status: 405 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'An id is required' }, { status: 400 });

  const supabase = getServiceClient();
  const { error: dbError } = await supabase.from(config!.table).delete().eq('id', id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  invalidatePricingConfig();
  return NextResponse.json({ data: { success: true } });
}
