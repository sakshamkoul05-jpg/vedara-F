'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Bed, Bath, Maximize, Loader2, XCircle, CheckCircle, Home } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice, getToday, parseDate, isPastDate } from '@/lib/utils';
import { fetchFromRates, fetchPublicPricing, indexPublicPricing, type PublicCottagePricing } from '@/lib/from-rates';
import { RATE_FOOTNOTE } from '@/lib/pricing/customer-copy';
import { CompareToggle, CompareTray } from '@/components/cottages/CompareTray';

const FALLBACK_COTTAGES: Cottage[] = [
  { id: '1', slug: 'monal-haven', pricingCategory: 'SIGNATURE', name: 'Monal Haven', description: 'Premium Duplex Family Suite with private jacuzzi, attic yoga balcony, and sweeping mountain views. Wake up to mist rolling over the Himalayas from your private balcony.', shortDesc: 'Premium Duplex Family Suite with private jacuzzi and mountain views', category: 'Premium Duplex Family Suite', pricePerNight: 12000, heaterCharge: 600, capacity: 4, bedrooms: 2, bathrooms: 2, size: 850, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony', 'coffee maker'], images: [], isActive: true, sortOrder: 1, isAvailable: true } as any,
  { id: '2', slug: 'koklass-cove', pricingCategory: 'SIGNATURE', name: 'Koklass Cove', description: 'Our largest duplex with two viewing balconies, private jacuzzi, and unmatched privacy. A true sanctuary for families seeking spacious luxury.', shortDesc: 'Largest duplex with two viewing balconies and private jacuzzi', category: 'Premium Duplex Family Suite', pricePerNight: 12500, heaterCharge: 600, capacity: 5, bedrooms: 2, bathrooms: 2, size: 950, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony', 'coffee maker'], images: [], isActive: true, sortOrder: 2, isAvailable: true } as any,
  { id: '3', slug: 'magpie-retreat', pricingCategory: 'BOUTIQUE', name: 'Magpie Retreat', description: 'Intimate Mountain View Suite — a sanctuary for couples and solo seekers, with a plush king-size bed and a private panoramic balcony.', shortDesc: 'Intimate Mountain View Suite — where serenity meets soul', category: 'Intimate Mountain View Suite', pricePerNight: 4500, heaterCharge: 600, capacity: 3, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony'], images: [], isActive: true, sortOrder: 3, isAvailable: true } as any,
  { id: '4', slug: 'whistling-thrush', pricingCategory: 'PREMIUM', name: 'Whistling Thrush', description: 'Charming duplex with a deep-soak bath tub, structural attic and dual-balcony setup. A perfect blend of rustic charm and modern comfort.', shortDesc: 'Charming duplex with deep-soak bath tub and dual balconies', category: 'Premium Duplex Family Suite', pricePerNight: 6500, heaterCharge: 600, capacity: 5, bedrooms: 2, bathrooms: 1, size: 556, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 4, isAvailable: true } as any,
  { id: '5', slug: 'flycatcher-nook', pricingCategory: 'BOUTIQUE', name: 'Flycatcher Nook', description: 'Intimate Mountain View Suite — your cozy Himalayan hideaway. Thoughtfully designed for couples and solo travelers.', shortDesc: 'Intimate Mountain View Suite — your cozy Himalayan hideaway', category: 'Intimate Mountain View Suite', pricePerNight: 7500, heaterCharge: 600, capacity: 2, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 5, isAvailable: true } as any,
  { id: '6', slug: 'bulbul-nest', pricingCategory: 'BOUTIQUE', name: 'Bulbul Nest', description: 'Intimate Mountain View Suite with workstation — where coziness meets the peaks. Perfect for remote professionals.', shortDesc: 'Intimate Mountain View Suite with workstation', category: 'Intimate Mountain View Suite', pricePerNight: 7500, heaterCharge: 600, capacity: 2, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 6, isAvailable: true } as any,
  { id: '7', slug: 'the-finch-nook', pricingCategory: 'STUDIO', name: 'The Finch Nook', description: 'Cozy Alpine Studio — small space, boundless solitude. A minimalist escape for solo travelers and digital nomads.', shortDesc: 'Cozy Alpine Studio — small space, boundless solitude', category: 'Cozy Alpine Studio', pricePerNight: 5000, heaterCharge: 600, capacity: 1, bedrooms: 1, bathrooms: 1, size: 180, amenities: ['wifi', 'fireplace', 'mountain view'], images: [], isActive: true, sortOrder: 7, isAvailable: true } as any,
];

/**
 * The public grouping from spec §12. Ordered as the spec lists them; the
 * Studio is a seventh cottage the spec predates.
 */
const CATEGORY_SECTIONS = [
  {
    key: 'BOUTIQUE',
    eyebrow: 'Boutique',
    title: 'Boutique Cottages',
    blurb:
      'Intimate single-level sanctuaries for couples, solo adventurers and remote professionals — premium warmth, a private balcony and a front-row seat to the Jibhi valley. Two adults; a child under 12 may share the existing bed.',
  },
  {
    key: 'PREMIUM',
    eyebrow: 'Premium',
    title: 'Premium Cottage',
    blurb:
      'A multi-level chalet with a signature wooden attic, dual balconies and a deep-soak bath tub. Sleeps up to four adults, with an extra mattress available.',
  },
  {
    key: 'SIGNATURE',
    eyebrow: 'Signature',
    title: 'Signature Cottages',
    blurb:
      'Our most expansive duplexes, each with a private jacuzzi, an attic-linked yoga and meditation balcony and a second sitting balcony. Up to four adults, with an extra mattress available.',
  },
  {
    key: 'STUDIO',
    eyebrow: 'Studio',
    title: 'Alpine Studio',
    blurb:
      'A minimalist escape built for the solo traveller, remote writer or anyone who wants warmth and utility in a smaller space.',
  },
] as const;

export default function CottagesPage() {
  const [cottages, setCottages] = useState<Cottage[]>([]);
  // The full catalogue, so a new search can bring back cottages an earlier
  // party-size filter hid.
  const [allCottages, setAllCottages] = useState<Cottage[]>([]);
  // Engine "from" rates (spec §12), keyed by cottage id and slug.
  const [fromRates, setFromRates] = useState<Record<string, number>>({});
  // Public descriptors (spec §12) and, after a search, each suitable cottage
  // priced under both rate plans.
  const [publicMap, setPublicMap] = useState<Record<string, PublicCottagePricing>>({});
  const [searchMap, setSearchMap] = useState<Record<string, any>>({});
  const [hiddenCount, setHiddenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  // Occupancy is part of the availability question: only cottages that can
  // actually hold the party should come back (spec 11).
  const [adults, setAdults] = useState(2);
  const [childAges, setChildAges] = useState<number[]>([]);
  const today = getToday();

  /**
   * A cottage's pricing tier. Comes from the engine, with the record's own
   * column as a fallback while the public pricing request is still in flight.
   */
  const tierOf = (cottage: any): string | null =>
    (publicMap[cottage.id] ?? publicMap[cottage.slug])?.category ?? cottage.pricingCategory ?? null;

  const cardHref = (cottage: any, slug: string) => {
    const r = searchMap[cottage.id];
    if (availabilityChecked && r?.available) {
      const qs = new URLSearchParams({ checkIn, checkOut, adults: String(adults), cottageId: cottage.id });
      if (childAges.length) qs.set('childAges', childAges.join(','));
      return `/booking?${qs.toString()}`;
    }
    return `/cottages/slug/${slug}`;
  };

  const resetAvailability = () => {
    setAvailabilityChecked(false);
    setAvailabilityError('');
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isPastDate(val)) return;
    setCheckIn(val);
    setAvailabilityChecked(false);
    if (checkOut && parseDate(checkOut) <= parseDate(val)) {
      setCheckOut('');
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isPastDate(val)) return;
    setCheckOut(val);
    setAvailabilityChecked(false);
  };

  const handleCheckAvailability = useCallback(async () => {
    if (!checkIn || !checkOut) return;
    if (childAges.some((a) => a < 0)) {
      setAvailabilityError('Please select an age for every child.');
      return;
    }

    setChecking(true);
    setAvailabilityChecked(false);
    setAvailabilityError('');
    try {
      const res = await fetch('/api/pricing/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn, checkOut, adults, childAges }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // e.g. a minimum-stay rule for these dates.
        setAvailabilityError(json.error || 'We could not check availability just now. Please try again.');
        return;
      }

      const map: Record<string, any> = {};
      for (const r of json.data.cottages) map[r.cottageId] = r;
      setSearchMap(map);
      setHiddenCount(json.data.incompatibleCount ?? 0);

      // Spec §11: only cottages compatible with the party are shown.
      const base = allCottages.length > 0 ? allCottages : FALLBACK_COTTAGES;
      setCottages(
        base
          .filter((c: any) => map[c.id])
          .map((c: any) => ({ ...c, isAvailable: map[c.id].available }))
      );
      setAvailabilityChecked(true);
    } catch {
      // Never fall back to a list that claims everything is available.
      setAvailabilityError('We could not check availability just now. Please try again.');
      setAvailabilityChecked(false);
    } finally {
      setChecking(false);
    }
  }, [checkIn, checkOut, adults, childAges, allCottages]);

  useEffect(() => {
    fetchFromRates().then(setFromRates);
    fetchPublicPricing().then((p) => setPublicMap(indexPublicPricing(p.cottages)));
    api.get('/cottages').then((res: any) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        const patched = res.data.map((c: any) => ({
          ...c,
          pricePerNight: c.pricePerNight || FALLBACK_COTTAGES.find((f: any) => f.slug === c.slug)?.pricePerNight || 0,
        }));
        setCottages(patched);
        setAllCottages(patched);
      } else {
        setCottages(FALLBACK_COTTAGES);
        setAllCottages(FALLBACK_COTTAGES);
      }
      setLoading(false);
    }).catch(() => {
      setCottages(FALLBACK_COTTAGES);
      setAllCottages(FALLBACK_COTTAGES);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <section className="pt-32 pb-20 bg-alabaster">
        <div className="vintage-container">
          <ScrollReveal>
            <BackButton />
            <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Accommodations</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              Find Your Mountain Retreat
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-12 -mt-8">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="vintage-label">Check-in</label>
                  <DatePicker value={checkIn} onChange={(v) => { setCheckIn(v); resetAvailability(); if (checkOut && parseDate(checkOut) <= parseDate(v)) { setCheckOut(''); } }} min={today} />
                </div>
                <div>
                  <label className="vintage-label">Check-out</label>
                  <DatePicker value={checkOut} onChange={(v) => { setCheckOut(v); resetAvailability(); }} min={checkIn || today} />
                </div>
                <div>
                  <label className="vintage-label" htmlFor="stays-adults">
                    Adults <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <select
                    id="stays-adults"
                    required
                    value={adults}
                    onChange={(e) => { setAdults(parseInt(e.target.value)); resetAvailability(); }}
                    className="vintage-input"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="vintage-label" htmlFor="stays-children">
                    Children <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <select
                    id="stays-children"
                    required
                    value={childAges.length}
                    onChange={(e) => {
                      const next = parseInt(e.target.value);
                      setChildAges((prev) =>
                        next > prev.length
                          ? [...prev, ...Array(next - prev.length).fill(-1)]
                          : prev.slice(0, next)
                      );
                      resetAvailability();
                    }}
                    className="vintage-input"
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* An age per child: it decides the child policy, the breakfast
                  band and whether the guest counts as an adult. */}
              {childAges.length > 0 && (
                <div className="mt-4">
                  <label className="vintage-label">
                    Age of each child <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {childAges.map((age, i) => (
                      <select
                        key={i}
                        required
                        aria-label={`Age of child ${i + 1}`}
                        value={age < 0 ? '' : age}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          setChildAges((prev) => prev.map((a, idx) => (idx === i ? v : a)));
                          resetAvailability();
                        }}
                        className={`vintage-input ${age < 0 ? 'border-amber-500' : ''}`}
                      >
                        <option value="" disabled>Child {i + 1} age</option>
                        {Array.from({ length: 18 }, (_, n) => n).map((n) => (
                          <option key={n} value={n}>
                            {n === 0 ? 'Under 1' : `${n} year${n === 1 ? '' : 's'}`}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto sm:min-w-[220px]"
                  onClick={handleCheckAvailability}
                  disabled={!checkIn || !checkOut || checking || childAges.some((a) => a < 0)}
                >
                  {checking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</> : 'Check Availability'}
                </Button>
                {availabilityError && (
                  <p className="text-sm text-red-500 mt-3">{availabilityError}</p>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding pt-8">
        <div className="vintage-container">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="vintage-card animate-pulse">
                  <div className="aspect-[4/3] bg-gold-100 dark:bg-[#231B12]/50 rounded-t-2xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gold-100 dark:bg-[#231B12]/50 rounded w-2/3" />
                    <div className="h-4 bg-gold-100 dark:bg-[#231B12]/50 rounded w-full" />
                    <div className="h-4 bg-gold-100 dark:bg-[#231B12]/50 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {availabilityChecked && (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    {cottages.filter((c: any) => c.isAvailable).length} of {cottages.length} cottages available for these dates
                    {' '}({adults} {adults === 1 ? 'adult' : 'adults'}
                    {childAges.length > 0 ? `, ${childAges.length} ${childAges.length === 1 ? 'child' : 'children'}` : ''})
                  </p>
                  <button onClick={() => { setAvailabilityChecked(false); setSearchMap({}); setHiddenCount(0); api.get('/cottages').then((res: any) => { const data = Array.isArray(res.data) && res.data.length > 0 ? res.data.map((c: any) => ({ ...c, pricePerNight: c.pricePerNight || FALLBACK_COTTAGES.find((f: any) => f.slug === c.slug)?.pricePerNight || 0 })) : FALLBACK_COTTAGES; setCottages(data); }).catch(() => setCottages(FALLBACK_COTTAGES)); }} className="text-sm text-gold-600 dark:text-gold-400 hover:underline">
                    Show all cottages
                  </button>
                </div>
              )}

              {/* Grouped by the engine tiers the spec publishes (§12):
                  Boutique, Premium, Signature — plus the Studio, a seventh
                  cottage the spec predates. */}
              {CATEGORY_SECTIONS.map(({ key, eyebrow, title, blurb }) => {
                const group = cottages.filter((c: any) => tierOf(c) === key);
                if (group.length === 0) return null;
                return (
                  <div key={key} className="mb-16">
                    <ScrollReveal>
                      <div className="mb-8">
                        <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-2 font-sans">{eyebrow}</p>
                        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">{title}</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl">{blurb}</p>
                      </div>
                    </ScrollReveal>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.map((cottage: any, i: number) => {
                      const slug = cottage.slug || cottage.name.toLowerCase().replace(/\s+/g, '-');
                      const available = availabilityChecked ? cottage.isAvailable : true;
                      const result = searchMap[cottage.id];
                      const pub = publicMap[cottage.id] ?? publicMap[slug];
                      return (
                      <ScrollReveal key={cottage.id} delay={i * 0.1}>
                        <Link href={cardHref(cottage, slug)} className="group block">
                          <div className={`vintage-card overflow-hidden h-full ${availabilityChecked && !available ? 'opacity-50' : ''}`}>
                            <div className="aspect-[4/3] overflow-hidden bg-gold-50 dark:bg-[#231B12]/30 relative">
                              <CompareToggle cottageId={cottage.id} name={cottage.name} />
                              {availabilityChecked && !available && (
                                <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                                  <span className="bg-vedara-900/80 text-alabaster px-4 py-2 rounded-full text-sm font-medium">Not available</span>
                                </div>
                              )}
                              <img
                                src={`https://images.unsplash.com/photo-${['1504384308090-c894fdcc538d', '1554118811-1e0d58224f24', '1506905925346-21bda4d32df4'][i % 3]}?w=600&q=80`}
                                alt={`${cottage.name} - ${cottage.category || 'premium duplex suite'} at The Vedara`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                              />
                            </div>
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-serif text-xl text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{cottage.name}</h3>
                                <span className="text-gold-600 dark:text-gold-400 font-semibold whitespace-nowrap"><span className="text-xs font-normal text-muted-foreground">From </span>{formatPrice(fromRates[cottage.id] ?? fromRates[cottage.slug] ?? cottage.pricePerNight)}<span className="text-gold-400 font-normal text-xs">/night*</span></span>
                              </div>
                              {pub?.publicDescriptor && (
                                <p className="text-[11px] uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-2">{pub.publicDescriptor}</p>
                              )}
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{cottage.shortDesc || cottage.description}</p>
                              <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {pub ? `Up to ${pub.maxAdults} adults` : `${cottage.capacity} guests`}</span>
                                <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {cottage.bedrooms} BR</span>
                                <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {cottage.bathrooms} bath</span>
                                {cottage.size && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {cottage.size} sqft</span>}
                              </div>
                              {availabilityChecked && (
                                <div className="mb-3">
                                  {available ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3 h-3" /> Available</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium"><XCircle className="w-3 h-3" /> Booked for these dates</span>
                                  )}
                                  {available && result && (
                                    <div className="mt-2 space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Only</span>
                                        <span className="text-foreground font-medium">{formatPrice(result.plans.ROOM_ONLY.perNight)}/night</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Breakfast Included</span>
                                        <span className="text-foreground font-medium">{formatPrice(result.plans.BREAKFAST_INCLUDED.perNight)}/night</span>
                                      </div>
                                      {result.longStayApplied && (
                                        <p className="text-green-600 font-medium">{result.longStayRuleName} applied</p>
                                      )}
                                      {result.lastMinuteOffer && (
                                        <p className="text-amber-600 font-medium">{result.lastMinuteOffer.name}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              <span className="text-gold-600 dark:text-gold-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                {availabilityChecked && result?.available ? 'Book this stay' : 'View Details'} <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </ScrollReveal>
                    )})}
                  </div>
                  </div>
                );
              })}

              {availabilityChecked && hiddenCount > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {hiddenCount} {hiddenCount === 1 ? 'cottage is' : 'cottages are'} hidden because {hiddenCount === 1 ? 'it cannot' : 'they cannot'} accommodate your party.
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mt-6">
                {availabilityChecked ? 'Per-night prices are averages before GST for your party. ' : ''}{RATE_FOOTNOTE}
              </p>
              {cottages.length === 0 && (
                <div className="text-center py-20">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium text-lg">No cottages available</p>
                  <p className="text-muted-foreground text-sm mt-1">Please try different dates or contact us directly at +91-91188-82242.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <CompareTray cottages={cottages} publicMap={publicMap} fromRates={fromRates} />
    </>
  );
}
