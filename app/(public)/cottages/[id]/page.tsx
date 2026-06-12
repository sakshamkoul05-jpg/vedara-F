'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Bed, Bath, Maximize, Check, Wifi, Flame,
  Snowflake, Coffee, Tv, Wind, Warehouse, TreePine, Mountain,
  Calendar
} from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormattedText } from '@/components/ui/formatted-text';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice, calculateNights, getToday } from '@/lib/utils';

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi, fireplace: Flame, 'room heater': Snowflake,
  'coffee maker': Coffee, tv: Tv, 'air conditioning': Wind,
  balcony: Warehouse, garden: TreePine, 'mountain view': Mountain,
};

const mockCottage: Cottage = {
  id: '1', slug: 'pine-perch', name: 'The Pine Perch',
  description: 'Secluded pine-wood haven with mountain views. Wake up to the mist over the mountains and enjoy the warm fireplace at night. This cottage offers a perfect blend of rustic charm and modern comfort, featuring handcrafted wooden furniture, a private sit-out area, and panoramic views of the Himalayan range.',
  shortDesc: 'Secluded pine-wood haven with mountain views', pricePerNight: 8500, heaterCharge: 500,
  capacity: 3, bedrooms: 1, bathrooms: 1, size: 450,
  amenities: ['wifi', 'fireplace', 'coffee maker', 'mountain view', 'balcony', 'garden'],
  images: [], isActive: true, sortOrder: 1,
  seasonalPricings: [
    { id: 's1', cottageId: '1', name: 'Peak Season', startDate: '2026-12-20', endDate: '2027-01-05', pricePerNight: 14000, minStay: 3, isActive: true },
    { id: 's2', cottageId: '1', name: 'Spring Season', startDate: '2026-03-01', endDate: '2026-05-31', pricePerNight: 10500, minStay: 2, isActive: true },
  ],
};

const allMockCottages: Record<string, Cottage> = {
  '1': mockCottage,
  '2': { ...mockCottage, id: '2', slug: 'cedar-nook', name: 'The Cedar Nook', pricePerNight: 7500, capacity: 2, bedrooms: 1, bathrooms: 1, size: 350, description: 'Intimate cedar retreat with private garden. Perfect for couples seeking a quiet escape surrounded by the fragrance of cedar forests.', shortDesc: 'Intimate cedar retreat with private garden', seasonalPricings: mockCottage.seasonalPricings },
  '3': { ...mockCottage, id: '3', slug: 'maple-suite', name: 'The Maple Suite', pricePerNight: 14000, capacity: 6, bedrooms: 3, bathrooms: 2, size: 900, description: 'Spacious family cottage with wraparound veranda. Ideal for families or groups wanting ample space without compromising on the mountain experience.', shortDesc: 'Spacious family cottage with wraparound veranda', seasonalPricings: mockCottage.seasonalPricings },
};

export default function CottageDetailPage() {
  const { id } = useParams();
  const [cottage, setCottage] = useState<Cottage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const today = getToday();

  useEffect(() => {
    api.get(`/cottages/${id}`).then((res: any) => {
      setCottage(res.data);
      setLoading(false);
    }).catch(() => {
      const mock = allMockCottages[id as string];
      if (mock) setCottage(mock);
      setLoading(false);
    });
  }, [id]);

  const pricings = Array.isArray(cottage?.seasonalPricings) ? cottage.seasonalPricings : [];
  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const activeSeasonal = checkIn && checkOut ? pricings.find(
    (s) => s.isActive && new Date(checkIn) < new Date(s.endDate) && new Date(checkOut) > new Date(s.startDate)
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
          <div className="h-6 bg-gold-100 dark:bg-vedara-900/50 rounded w-1/4" />
          <div className="aspect-[2/1] bg-gold-100 dark:bg-vedara-900/50 rounded-2xl" />
          <div className="flex gap-2">
            {[1,2,3,4].map((i) => <div key={i} className="w-20 h-16 bg-gold-100 dark:bg-vedara-900/50 rounded-lg" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="h-8 bg-gold-100 dark:bg-vedara-900/50 rounded w-2/3" />
              <div className="h-4 bg-gold-100 dark:bg-vedara-900/50 rounded w-1/4" />
              <div className="h-20 bg-gold-100 dark:bg-vedara-900/50 rounded w-full" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gold-100 dark:bg-vedara-900/50 rounded w-1/3" />
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-gold-100 dark:bg-vedara-900/50 rounded-xl" />)}
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
          <Mountain className="w-16 h-16 text-gold-300 mx-auto mb-6" />
          <h1 className="section-title mb-4">Cottage Not Found</h1>
          <p className="text-muted-foreground mb-8">The cottage you are looking for does not exist or has been removed.</p>
          <Link href="/cottages" className="vintage-button-primary text-base px-8 py-4">
            Back to Cottages
          </Link>
        </motion.div>
      </div>
    );
  }

  const amenitiesList: string[] = typeof cottage.amenities === 'string' ? JSON.parse(cottage.amenities as string) : cottage.amenities;

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
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative z-10 p-6 md:p-10">
              <Badge variant="default" size="sm" className="mb-3 bg-gold-500 text-alabaster border-none">
                {isPeakSeason ? 'Peak Season Pricing' : 'Standard Pricing'}
              </Badge>
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
                <img src={img} alt={`${cottage.name} view ${i + 1}`} className="w-full h-full object-cover" />
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenitiesList.map((amenity) => {
                      const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                      return (
                        <div key={amenity} className="vintage-card p-3.5 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                          </div>
                          <span className="text-sm text-foreground capitalize">{amenity}</span>
                        </div>
                      );
                    })}
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
                        <p className="font-medium text-foreground">₹{cottage.heaterCharge || 500}/night</p>
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
                          <tr className="bg-gold-50 dark:bg-vedara-900/30">
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
                          {cottage.seasonalPricings.filter((s) => s.isActive).map((s) => (
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
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-28">
                <ScrollReveal direction="right">
                  <div className="vintage-card p-6 md:p-8">
                    <h3 className="font-serif text-xl text-foreground mb-6">Book Your Stay</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="vintage-label">Check-in</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
                          <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => {
                              setCheckIn(e.target.value);
                              if (checkOut && new Date(checkOut) <= new Date(e.target.value)) {
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
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
                          <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => {
                              setCheckOut(e.target.value);
                              if (checkIn && new Date(e.target.value) <= new Date(checkIn)) {
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
                          <div className="bg-gold-50 dark:bg-vedara-900/30 rounded-xl p-4 space-y-2">
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
                          </div>

                          <Link
                            href={`/booking?cottageId=${cottage.id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                            className="vintage-button-primary text-base px-8 py-4 w-full text-center inline-block"
                          >
                            Book Now — {formatPrice(totalAmount)}
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
