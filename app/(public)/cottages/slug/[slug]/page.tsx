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

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi, fireplace: Flame, 'room heater': Snowflake,
  'coffee maker': Coffee, tv: Tv, 'air conditioning': Wind,
  balcony: Warehouse, garden: TreePine, 'mountain view': Mountain,
};

export default function CottageBySlugPage() {
  const { slug } = useParams();
  const [cottage, setCottage] = useState<Cottage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const today = getToday();

  useEffect(() => {
    api.get(`/cottages/slug/${slug}`).then((res: any) => {
      setCottage(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [slug]);

  const pricings = Array.isArray(cottage?.seasonalPricings) ? cottage.seasonalPricings : [];
  const nights = checkIn && checkOut ? calculateNights(parseDate(checkIn), parseDate(checkOut)) : 0;
  const activeSeasonal = checkIn && checkOut ? pricings.find(
    (s) => s.isActive && parseDate(checkIn) < parseDate(s.endDate) && parseDate(checkOut) > parseDate(s.startDate)
  ) : pricings.find(
    (s) => checkIn && checkIn >= s.startDate && checkIn <= s.endDate && s.isActive
  );
  const isPeakSeason = !!activeSeasonal;
  const effectivePrice = activeSeasonal ? activeSeasonal.pricePerNight : (cottage?.pricePerNight || 0);
  const totalAmount = nights * effectivePrice;

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
          <Image src="/images/vedara-logo.jpeg" alt="The Vedara" width={96} height={96} className="w-20 h-20 object-contain mx-auto mb-6 rounded-xl" />
          <h1 className="section-title mb-4">Cottage Not Found</h1>
          <p className="text-muted-foreground mb-8">The cottage you are looking for does not exist or has been removed.</p>
          <Link href="/cottages" className="vintage-button-primary text-base px-8 py-4">
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
              <Badge variant="default" size="sm" className="mb-3 bg-gold-500 text-alabaster border-none">
                {isPeakSeason ? 'Peak Season Pricing' : 'Standard Pricing'}
              </Badge>
              {cottage.category && (
                <Badge variant="default" size="sm" className="mb-2 bg-gold-600/80 text-alabaster border-none">
                  {cottage.category}
                </Badge>
              )}
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-alabaster mb-2">{cottage.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-alabaster">{formatPrice(effectivePrice)}</span>
                <span className="text-alabaster/70 text-sm">/ night</span>
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
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                          <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (isPastDate(v)) return;
                              setCheckIn(v);
                              if (checkOut && parseDate(checkOut) <= parseDate(v)) {
                                setCheckOut('');
                              }
                            }}
                            min={today}
                            className="vintage-input pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="vintage-label">Check-out</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                          <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (isPastDate(v)) return;
                              setCheckOut(v);
                              if (checkIn && parseDate(v) <= parseDate(checkIn)) {
                                setCheckOut('');
                              }
                            }}
                            min={checkIn || today}
                            className="vintage-input pl-10"
                          />
                        </div>
                      </div>

                      {nights > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-2"
                        >
                          <div className="bg-gold-50 dark:bg-[#231B12]/30 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{formatPrice(effectivePrice)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                              <span className="text-foreground font-medium">{formatPrice(effectivePrice * nights)}</span>
                            </div>
                            {activeSeasonal && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gold-500 font-medium">{activeSeasonal.name} premium</span>
                                <span className="text-foreground">+{formatPrice(activeSeasonal.pricePerNight - cottage.pricePerNight)}/night</span>
                              </div>
                            )}
                            <div className="border-t border-border pt-2 flex justify-between">
                              <span className="font-serif text-lg text-foreground">Total</span>
                              <span className="font-bold text-lg text-gold-600 dark:text-gold-400">{formatPrice(totalAmount)}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-right">Prices exclusive of applicable taxes (12% GST at checkout)</p>
                          </div>

                          <Link
                            href={`/booking?cottageId=${cottage.id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                            className="vintage-button-primary text-base px-8 py-4 w-full text-center block"
                          >
                            Book Now - {formatPrice(totalAmount)}
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