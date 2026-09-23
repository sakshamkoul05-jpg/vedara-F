'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Bed, Bath, Maximize, Check, Wifi, Flame,
  Snowflake, Coffee, Tv, Wind, Warehouse, TreePine, Mountain,
  Calendar, Plus
} from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Badge } from '@/components/ui/badge';
import { FormattedText } from '@/components/ui/formatted-text';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice, calculateNights, getToday, parseDate, isPastDate } from '@/lib/utils';
import { fetchFromRates } from '@/lib/from-rates';
import { DatePicker } from '@/components/ui/DatePicker';

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi, fireplace: Flame, 'room heater': Snowflake,
  'coffee maker': Coffee, tv: Tv, 'air conditioning': Wind,
  balcony: Warehouse, garden: TreePine, 'mountain view': Mountain,
};

const FALLBACK_COTTAGES: Record<string, Cottage> = {
  'monal-haven': { id: '1', slug: 'monal-haven', name: 'Monal Haven', description: 'Premium Duplex Family Suite with private jacuzzi, attic yoga balcony, and sweeping mountain views. Wake up to mist rolling over the Himalayas from your private balcony.', shortDesc: 'Premium Duplex Family Suite with private jacuzzi and mountain views', category: 'Premium Duplex Family Suite', pricePerNight: 12000, heaterCharge: 600, capacity: 4, bedrooms: 2, bathrooms: 2, size: 850, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony', 'coffee maker'], images: [], isActive: true, sortOrder: 1 },
  'koklass-cove': { id: '2', slug: 'koklass-cove', name: 'Koklass Cove', description: 'Our largest duplex with two viewing balconies, private jacuzzi, and unmatched privacy. A true sanctuary for families seeking spacious luxury.', shortDesc: 'Largest duplex with two viewing balconies and private jacuzzi', category: 'Premium Duplex Family Suite', pricePerNight: 12500, heaterCharge: 600, capacity: 5, bedrooms: 2, bathrooms: 2, size: 950, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony', 'coffee maker'], images: [], isActive: true, sortOrder: 2 },
  'magpie-retreat': { id: '3', slug: 'magpie-retreat', name: 'Magpie Retreat', description: 'Charming duplex with deep-soak bathtub and dual-balcony setup. A perfect blend of rustic charm and modern comfort.', shortDesc: 'Charming duplex with deep-soak bathtub and dual balconies', category: 'Premium Duplex Family Suite', pricePerNight: 11000, heaterCharge: 600, capacity: 4, bedrooms: 2, bathrooms: 1, size: 780, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony'], images: [], isActive: true, sortOrder: 3 },
  'whistling-thrush': { id: '4', slug: 'whistling-thrush', name: 'Whistling Thrush', description: 'Intimate Mountain View Suite — a melody of mountain quietude. Elegant single-level sanctuary with dedicated workspace.', shortDesc: 'Intimate Mountain View Suite — a melody of mountain quietude', category: 'Intimate Mountain View Suite', pricePerNight: 7500, heaterCharge: 600, capacity: 2, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 4 },
  'flycatcher-nook': { id: '5', slug: 'flycatcher-nook', name: 'Flycatcher Nook', description: 'Intimate Mountain View Suite — your cozy Himalayan hideaway. Thoughtfully designed for couples and solo travelers.', shortDesc: 'Intimate Mountain View Suite — your cozy Himalayan hideaway', category: 'Intimate Mountain View Suite', pricePerNight: 7500, heaterCharge: 600, capacity: 2, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 5 },
  'bulbul-nest': { id: '6', slug: 'bulbul-nest', name: 'Bulbul Nest', description: 'Intimate Mountain View Suite with workstation — where coziness meets the peaks. Perfect for remote professionals.', shortDesc: 'Intimate Mountain View Suite with workstation', category: 'Intimate Mountain View Suite', pricePerNight: 7500, heaterCharge: 600, capacity: 2, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 6 },
  'the-finch-nook': { id: '7', slug: 'the-finch-nook', name: 'The Finch Nook', description: 'Cozy Alpine Studio — small space, boundless solitude. A minimalist escape for solo travelers and digital nomads.', shortDesc: 'Cozy Alpine Studio — small space, boundless solitude', category: 'Cozy Alpine Studio', pricePerNight: 5000, heaterCharge: 600, capacity: 1, bedrooms: 1, bathrooms: 1, size: 180, amenities: ['wifi', 'fireplace', 'mountain view'], images: [], isActive: true, sortOrder: 7 },
};

export default function CottageBySlugPage() {
  const { slug } = useParams();
  const [cottage, setCottage] = useState<Cottage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  // Engine "from" rate for the hero (spec §12) and a live quote for the
  // estimate, both replacing the legacy flat pricing this page used to show.
  const [fromRate, setFromRate] = useState<number | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const today = getToday();

  useEffect(() => {
    api.get(`/cottages/slug/${slug}`).then((res: any) => {
      if (res.data && res.data.id) {
        setCottage(res.data);
      } else {
        setCottage(FALLBACK_COTTAGES[slug as string] || null);
      }
      setLoading(false);
    }).catch(() => {
      setCottage(FALLBACK_COTTAGES[slug as string] || null);
      setLoading(false);
    });
  }, [slug]);

  // The published "from" rate for the hero.
  useEffect(() => {
    if (!cottage?.id) return;
    let alive = true;
    fetchFromRates().then((rates) => {
      if (alive) setFromRate(rates[cottage.id] ?? rates[cottage.slug] ?? null);
    });
    return () => { alive = false; };
  }, [cottage?.id, cottage?.slug]);

  // A live engine quote once dates are chosen. Occupancy is collected on the
  // booking page; here we quote the 2-adult base so the estimate is real.
  useEffect(() => {
    if (!cottage?.id || !checkIn || !checkOut) {
      setQuote(null);
      return;
    }
    let alive = true;
    const controller = new AbortController();
    fetch('/api/pricing/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        cottageId: cottage.id,
        checkIn,
        checkOut,
        adults: 2,
        childAges: [],
        ratePlan: 'ROOM_ONLY',
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive) setQuote(j?.data ?? null); })
      .catch(() => { if (alive) setQuote(null); });
    return () => { alive = false; controller.abort(); };
  }, [cottage?.id, checkIn, checkOut]);

  const nights = checkIn && checkOut ? calculateNights(parseDate(checkIn), parseDate(checkOut)) : 0;
  // Hero price: the engine "from" rate, falling back to the stored flat rate.
  const displayFrom = fromRate ?? cottage?.pricePerNight ?? 0;
  // Estimate: the live quote when available, else a simple nights × from-rate.
  const estimateTotal = quote?.total ?? nights * displayFrom;

  let parsedImages: string[] = [];
  try {
    parsedImages = typeof cottage?.images === 'string' ? JSON.parse(cottage.images as string) : (cottage?.images as string[] || []);
  } catch { parsedImages = []; }
  const images = Array.isArray(parsedImages) && parsedImages.length ? parsedImages : Array.from({ length: 6 }, (_, i) => `https://images.unsplash.com/photo-${['1504384308090-c894fdcc538d', '1554118811-1e0d58224f24', '1506905925346-21bda4d32df4', '1476514525535-07fb3b4ae5f1', '1519681393784-d120267933ba', '1469476568026-46a7f7b2f9c2'][i]}?w=800&q=80`);

  if (loading) {
    return (
      <div className="pt-32 vintage-container pb-20">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gold-100 dark:bg-[#231B12]/50 rounded w-1/4" />
          <div className="aspect-[2/1] bg-gold-100 dark:bg-[#231B12]/50 rounded-2xl" />
          <div className="flex gap-2">
            {[1,2,3,4].map((i) => <div key={i} className="w-20 h-16 bg-gold-100 dark:bg-[#231B12]/50 rounded-lg" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="h-8 bg-gold-100 dark:bg-[#231B12]/50 rounded w-2/3" />
              <div className="h-4 bg-gold-100 dark:bg-[#231B12]/50 rounded w-1/4" />
              <div className="h-20 bg-gold-100 dark:bg-[#231B12]/50 rounded w-full" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gold-100 dark:bg-[#231B12]/50 rounded w-1/3" />
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-gold-100 dark:bg-[#231B12]/50 rounded-xl" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cottage) {
    return (
      <div className="pt-32 vintage-container pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Image src="/images/vedara-logo.jpeg" alt="The Vedara" width={240} height={240} sizes="80px" quality={90} className="w-20 h-20 object-contain mx-auto mb-6 rounded-xl" />
          <h1 className="section-title mb-4">Cottage Not Found</h1>
          <p className="text-muted-foreground mb-8">The cottage you are looking for does not exist or has been removed.</p>
          <Link href="/cottages" className="cta-primary cta-lg">
            Back to Cottages
          </Link>
        </motion.div>
      </div>
    );
  }

  let amenitiesList: string[] = [];
  try { amenitiesList = typeof cottage.amenities === 'string' ? JSON.parse(cottage.amenities as string) : (cottage.amenities || []); } catch { amenitiesList = []; }

  return (
    <>
      <section className="pt-28 pb-6">
        <div className="vintage-container">
          <Link href="/cottages" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Cottages
          </Link>
        </div>
      </section>

      <section className="pb-8">
        <div className="vintage-container">
          <div className="relative overflow-hidden rounded-2xl bg-vedara-900 aspect-[2/1] md:aspect-[3/1] flex items-end justify-start">
            <motion.img
              src={images[selectedImage]}
              alt={cottage.name}
              className="absolute inset-0 w-full h-full object-cover"
              fetchPriority="high"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 p-6 md:p-10">
              {cottage.category && (
                <Badge variant="default" size="sm" className="mb-2 bg-gold-600/80 text-alabaster border-none">
                  {cottage.category}
                </Badge>
              )}
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-alabaster mb-2">{cottage.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-alabaster/70 text-sm">From</span>
                <span className="text-2xl md:text-3xl font-bold text-alabaster">{formatPrice(displayFrom)}</span>
                <span className="text-alabaster/70 text-sm">/ night*</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === i ? 'border-gold-500 ring-2 ring-gold-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${cottage.name} - photo ${i + 1} of cottage interior and surroundings`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-10">
              <ScrollReveal>
                <div>
                  <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-3 font-sans">The Cottage</p>
                  <h2 className="font-serif text-3xl text-foreground mb-4">About This Sanctuary</h2>
                  <FormattedText text={cottage.description} />
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-5">Amenities</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {amenitiesList.map((amenity) => {
                      const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                      return (
                        <span key={amenity} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gold-100 dark:bg-[#231B12]/40 text-foreground text-sm">
                          <Icon className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                          <span className="capitalize">{amenity}</span>
                        </span>
                      );
                    })}
                    <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                      <Flame className="w-4 h-4 text-red-500" /> Cooking not allowed
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-5">Capacity & Configuration</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="vintage-card px-5 py-4 flex items-center gap-3">
                      <Users className="w-5 h-5 text-gold-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Guests</p>
                        <p className="font-medium text-foreground">{cottage.capacity} Guests</p>
                      </div>
                    </div>
                    <div className="vintage-card px-5 py-4 flex items-center gap-3">
                      <Bed className="w-5 h-5 text-gold-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                        <p className="font-medium text-foreground">{cottage.bedrooms} {cottage.bedrooms > 1 ? 'Bedrooms' : 'Bedroom'}</p>
                      </div>
                    </div>
                    <div className="vintage-card px-5 py-4 flex items-center gap-3">
                      <Bath className="w-5 h-5 text-gold-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Bathrooms</p>
                        <p className="font-medium text-foreground">{cottage.bathrooms} {cottage.bathrooms > 1 ? 'Bathrooms' : 'Bathroom'}</p>
                      </div>
                    </div>
                    {cottage.size && (
                      <div className="vintage-card px-5 py-4 flex items-center gap-3">
                        <Maximize className="w-5 h-5 text-gold-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Size</p>
                          <p className="font-medium text-foreground">{cottage.size} sqft</p>
                        </div>
                      </div>
                    )}
                    <div className="vintage-card px-5 py-4 flex items-center gap-3">
                      <Flame className="w-5 h-5 text-gold-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Additional Heater</p>
                        <p className="font-medium text-foreground">₹{cottage.heaterCharge || 600}/night</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {Array.isArray(cottage.seasonalPricings) && cottage.seasonalPricings.length > 0 && (
                <ScrollReveal>
                  <div>
                    <h3 className="font-serif text-xl text-foreground mb-5">Pricing Overview</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gold-50 dark:bg-[#231B12]/30">
                            <th className="p-3 text-left border border-border text-muted-foreground font-medium">Season</th>
                            <th className="p-3 text-left border border-border text-muted-foreground font-medium">Price / Night</th>
                            <th className="p-3 text-left border border-border text-muted-foreground font-medium">Min Stay</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-gold-50/50">
                            <td className="p-3 border border-border text-foreground font-medium">Base Rate</td>
                            <td className="p-3 border border-border text-gold-600 font-semibold">{formatPrice(cottage.pricePerNight)}</td>
                            <td className="p-3 border border-border text-muted-foreground">1 night</td>
                          </tr>
                          {cottage.seasonalPricings.filter((s: any) => s.isActive).map((s: any) => (
                            <tr key={s.id}>
                              <td className="p-3 border border-border text-foreground">{s.name}</td>
                              <td className="p-3 border border-border text-gold-600 font-semibold">{formatPrice(s.pricePerNight)}</td>
                              <td className="p-3 border border-border text-muted-foreground">{s.minStay} nights</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-5">Good to Know</h3>
                  <Accordion.Root type="single" collapsible className="space-y-3">
                    {[
                      {
                        value: 'checkin',
                        title: 'Check-in & Check-out',
                        body: 'Check-in is from 1:00 PM and check-out is by 11:00 AM. Our reception is staffed daily from 8:00 AM to 10:30 PM — if you expect to arrive later, let us know and we will arrange a warm welcome.',
                      },
                      {
                        value: 'cancellation',
                        title: 'Cancellation Policy',
                        body: 'Free cancellation 15+ days before arrival (90% refund). 8–15 days before: 50% refund. Less than 7 days: no refund. Peak season requires 21+ days notice for a 50% refund.',
                      },
                      {
                        value: 'taxes',
                        title: 'Taxes & Extras',
                        body: 'All cottage rates are exclusive of applicable taxes (12% GST added at checkout). An extra guest charge of ₹1,500 per night applies beyond two guests, and a room heater is available at ₹600/night.',
                      },
                      {
                        value: 'pets',
                        title: 'Pets & Quiet Hours',
                        body: 'Pets are not allowed at the retreat. Out of respect for fellow guests, quiet hours are observed from 11:00 PM to 7:00 AM.',
                      },
                      {
                        value: 'id',
                        title: 'ID Proof',
                        body: 'A valid ID proof is required at check-in — Aadhaar, Passport or Driving Licence for Indian nationals, and a Passport for foreign nationals.',
                      },
                    ].map((item) => (
                      <Accordion.Item key={item.value} value={item.value} className="vintage-card overflow-hidden">
                        <Accordion.Header>
                          <Accordion.Trigger className="group w-full flex items-center justify-between px-5 py-4 text-left font-medium text-foreground">
                            {item.title}
                            <Plus className="w-4 h-4 text-gold-500 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {item.body}
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-28">
                <ScrollReveal direction="right">
                  <div className="vintage-card p-6 md:p-8">
                    <h3 className="font-serif text-xl text-foreground mb-2">Book Your Stay</h3>
                    <p className="text-xs text-gold-600 dark:text-gold-400 mb-6 flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> Sumptuous complimentary breakfast included with every stay
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="vintage-label">Check-in</label>
                        <DatePicker
                          value={checkIn}
                          onChange={(v) => {
                            setCheckIn(v);
                            if (checkOut && parseDate(checkOut) <= parseDate(v)) {
                              setCheckOut('');
                            }
                          }}
                          min={today}
                        />
                      </div>
                      <div>
                        <label className="vintage-label">Check-out</label>
                        <DatePicker
                          value={checkOut}
                          onChange={(v) => {
                            setCheckOut(v);
                            if (checkIn && parseDate(v) <= parseDate(checkIn)) {
                              setCheckOut('');
                            }
                          }}
                          min={checkIn || today}
                        />
                      </div>

                      {nights > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-2"
                        >
                          <div className="bg-gold-50 dark:bg-[#231B12]/30 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Accommodation, {nights} {nights === 1 ? 'night' : 'nights'}</span>
                              <span className="text-foreground font-medium">{formatPrice(quote ? quote.accommodationTotal : nights * displayFrom)}</span>
                            </div>
                            {quote?.longStayApplied && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span className="font-medium">{quote.longStayRuleName}</span>
                                <span>included</span>
                              </div>
                            )}
                            {quote?.taxTotal > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">GST</span>
                                <span className="text-foreground">{formatPrice(quote.taxTotal)}</span>
                              </div>
                            )}
                            <div className="border-t border-border pt-2 flex justify-between">
                              <span className="font-serif text-lg text-foreground">{quote ? 'Total' : 'Estimate'}</span>
                              <span className="font-bold text-lg text-gold-600 dark:text-gold-400">{formatPrice(estimateTotal)}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-right">Based on 2 adults, room only. Final price for your party and rate plan is shown at checkout.</p>
                          </div>

                          <Link
                            href={`/booking?cottageId=${cottage.id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                            className="cta-primary cta-lg w-full"
                          >
                            Book Your Stay — {formatPrice(estimateTotal)}
                          </Link>
                        </motion.div>
                      )}

                      {!checkIn && (
                        <p className="text-xs text-muted-foreground text-center pt-2">Select your dates to see pricing and availability</p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}