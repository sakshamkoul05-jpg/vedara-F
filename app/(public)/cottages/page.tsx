'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Bed, Bath, Maximize, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice, getToday } from '@/lib/utils';

const CATEGORY_DESCRIPTIONS: Record<string, { prefix: string; description: string }> = {
  'Premium Duplex Family Suite': {
    prefix: 'Cottages',
    description: 'Perfect for families, groups of four, or couples seeking expansive structural luxury. These multi-level chalets feature signature wooden attic layouts, dual balconies, and private soaking experiences.',
  },
  'Intimate Mountain View Suite': {
    prefix: 'Cottages',
    description: 'Tailor-made for couples, solo adventurers, and remote professionals. These elegant single-level sanctuaries offer premium warmth, dedicated workspace/dining seating layouts, and a front-row seat to the Jibhi valley vistas.',
  },
  'Cozy Alpine Studio': {
    prefix: 'Cottage',
    description: 'Thoughtfully tailored minimalist escapes optimized for solo travelers, remote writers, digital nomads, or simple comfort. These rooms pack rich warmth and structural utility into a smartly integrated design.',
  },
};

export default function CottagesPage() {
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const today = getToday();

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckIn(e.target.value);
    setAvailabilityChecked(false);
    if (checkOut && new Date(checkOut) <= new Date(e.target.value)) {
      setCheckOut('');
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckOut(e.target.value);
    setAvailabilityChecked(false);
  };

  const handleCheckAvailability = useCallback(async () => {
    if (!checkIn || !checkOut) return;
    setChecking(true);
    setAvailabilityChecked(false);
    try {
      const res: any = await api.get(`/bookings/available-cottages?checkIn=${checkIn}&checkOut=${checkOut}`);
      setCottages(res.data);
      setAvailabilityChecked(true);
    } catch {
      setAvailabilityChecked(true);
    } finally {
      setChecking(false);
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    api.get('/cottages').then((res: any) => {
      setCottages(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const groupedCottages = useMemo(() => {
    const groups: Record<string, Cottage[]> = {};
    const uncategorized: Cottage[] = [];
    cottages.forEach((c: any) => {
      const cat = c.category?.trim();
      if (cat) {
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(c);
      } else {
        uncategorized.push(c);
      }
    });
    if (uncategorized.length > 0) {
      groups['Our Cottages'] = uncategorized;
    }
    return groups;
  }, [cottages]);

  const categoryOrder = useMemo(() => {
    const preferred = ['Premium Duplex Family Suite', 'Intimate Mountain View Suite', 'Cozy Alpine Studio'];
    const keys = Object.keys(groupedCottages);
    const ordered = preferred.filter(k => keys.includes(k));
    keys.forEach(k => { if (!ordered.includes(k)) ordered.push(k); });
    return ordered;
  }, [groupedCottages]);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 h-[40vh] min-h-[320px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1600&q=80)', transform: 'scale(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white" />
        <div className="relative z-10 vintage-container">
          <BackButton className="mb-6" />
          <TextReveal as="h1" className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Our Cottages
          </TextReveal>
          <p className="text-white/90 text-lg max-w-2xl">Handpicked mountain retreats, each with its own character and warmth</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium mb-1.5">Check-in</label>
                <Input type="date" value={checkIn} min={today} onChange={handleCheckInChange} />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium mb-1.5">Check-out</label>
                <Input type="date" value={checkOut} min={checkIn || today} onChange={handleCheckOutChange} />
              </div>
              <div className="flex items-end">
                <Button variant="primary" size="md" className="w-full" onClick={handleCheckAvailability} disabled={!checkIn || !checkOut || checking}>
                  {checking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</> : 'Check Availability'}
                </Button>
              </div>
              <div className="flex items-end">
                <Link href="/booking" className="vintage-button-secondary w-full text-center">
                  Quick Book
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding pt-8">
        <div className="vintage-container">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="vintage-card animate-pulse">
                  <div className="aspect-[4/3] bg-gold-100 dark:bg-vedara-900/50 rounded-t-2xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gold-100 dark:bg-vedara-900/50 rounded w-2/3" />
                    <div className="h-4 bg-gold-100 dark:bg-vedara-900/50 rounded w-full" />
                    <div className="h-4 bg-gold-100 dark:bg-vedara-900/50 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {availabilityChecked && (
                <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 font-medium">
                    {cottages.filter((c: any) => c.isAvailable).length} of {cottages.length} cottages available for these dates
                  </p>
                  {checkIn && checkOut && (
                    <p className="text-sm text-green-700 mt-1">
                      {new Date(checkIn).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} →{' '}
                      {new Date(checkOut).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      ({Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)} nights)
                    </p>
                  )}
                  <button
                    onClick={() => { setAvailabilityChecked(false); setCheckIn(''); setCheckOut(''); }}
                    className="text-sm text-green-700 hover:text-green-900 underline mt-2"
                  >
                    Show all cottages
                  </button>
                </div>
              )}

              {categoryOrder.map((category) => {
                const items = groupedCottages[category];
                const catInfo = CATEGORY_DESCRIPTIONS[category];
                const prefix = catInfo?.prefix || 'Cottages';
                return (
                  <div key={category} className="mb-16">
                    <ScrollReveal>
                      <div className="mb-8">
                        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">{category}</h2>
                        {catInfo ? (
                          <p className="text-muted-foreground text-sm max-w-2xl">{catInfo.description}</p>
                        ) : (
                          <p className="text-muted-foreground text-sm max-w-2xl">{items.length} {items.length === 1 ? prefix.toLowerCase() : prefix.toLowerCase() + 's'} in this category</p>
                        )}
                      </div>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {items.map((cottage: any, i: number) => {
                        const slug = cottage.slug || cottage.name.toLowerCase().replace(/\s+/g, '-');
                        const available = availabilityChecked ? cottage.isAvailable : true;
                        let images: string[] = [];
                        try { images = typeof cottage.images === 'string' ? JSON.parse(cottage.images) : (cottage.images || []); } catch { images = []; }
                        const imageUrl = images.length > 0 ? (images[0].startsWith('http') ? images[0] : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${images[0]}`) : `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80`;
                        return (
                          <ScrollReveal key={cottage.id} delay={i * 0.1}>
                            <Link href={`/cottages/slug/${slug}`} className="group block">
                              <div className={`vintage-card overflow-hidden ${availabilityChecked && !available ? 'opacity-50' : ''}`}>
                                <div className="aspect-[4/3] overflow-hidden bg-gold-50 dark:bg-vedara-900/30 relative">
                                  {availabilityChecked && !available && (
                                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                                      <span className="bg-vedara-900/80 text-alabaster px-4 py-2 rounded-full text-sm font-medium">Not available</span>
                                    </div>
                                  )}
                                  <img
                                    src={imageUrl}
                                    alt={cottage.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="p-6">
                                  <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-serif text-xl text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{cottage.name}</h3>
                                    <span className="text-gold-600 dark:text-gold-400 font-semibold">{formatPrice(cottage.pricePerNight)}<span className="text-gold-400 font-normal text-xs">/night</span></span>
                                  </div>
                                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{cottage.shortDesc || cottage.description}</p>
                                  <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cottage.capacity} guests</span>
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
                                    </div>
                                  )}
                                  <span className="text-gold-600 dark:text-gold-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                    View Details <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </ScrollReveal>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>
    </>
  );
}
