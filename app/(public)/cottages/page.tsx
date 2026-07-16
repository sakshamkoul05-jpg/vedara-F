'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Bed, Bath, Maximize, Loader2, XCircle, CheckCircle, Home } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice, getToday } from '@/lib/utils';

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
                  <Input type="date" value={checkIn} onChange={handleCheckInChange} min={today} />
                </div>
                <div>
                  <label className="vintage-label">Check-out</label>
                  <Input type="date" value={checkOut} onChange={handleCheckOutChange} min={checkIn || today} />
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
                  </p>
                  <button onClick={() => { setAvailabilityChecked(false); api.get('/cottages').then((res: any) => setCottages(res.data)); }} className="text-sm text-gold-600 dark:text-gold-400 hover:underline">
                    Show all cottages
                  </button>
                </div>
              )}

              {/* Premium Duplex Family Suites */}
              {cottages.some((c: any) => c.category === 'Premium Duplex Family Suite') && (
                <div className="mb-16">
                  <ScrollReveal>
                    <div className="mb-8">
                      <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-2 font-sans">Cottages 1 – 3</p>
                      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">Premium Duplex Family Suites</h2>
                      <p className="text-muted-foreground text-sm max-w-2xl">Perfect for families, groups of four, or couples seeking expansive structural luxury. These multi-level chalets feature signature wooden attic layouts, dual balconies, and private soaking experiences.</p>
                    </div>
                  </ScrollReveal>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cottages.filter((c: any) => c.category === 'Premium Duplex Family Suite').map((cottage: any, i) => {
                      const slug = cottage.slug || cottage.name.toLowerCase().replace(/\s+/g, '-');
                      const available = availabilityChecked ? cottage.isAvailable : true;
                      return (
                      <ScrollReveal key={cottage.id} delay={i * 0.1}>
                        <Link href={`/cottages/slug/${slug}`} className="group block">
                          <div className={`vintage-card overflow-hidden h-full ${availabilityChecked && !available ? 'opacity-50' : ''}`}>
                            <div className="aspect-[4/3] overflow-hidden bg-gold-50 dark:bg-[#231B12]/30 relative">
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
                    )})}
                  </div>
                </div>
              )}

              {/* Intimate Mountain View Suites */}
              {cottages.some((c: any) => c.category === 'Intimate Mountain View Suite') && (
                <div className="mb-16">
                  <ScrollReveal>
                    <div className="mb-8">
                      <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-2 font-sans">Cottages 4 – 6</p>
                      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">Intimate Mountain View Suites</h2>
                      <p className="text-muted-foreground text-sm max-w-2xl">Tailor-made for couples, solo adventurers, and remote professionals. These elegant 270 sq. ft. single-level sanctuaries offer premium warmth, dedicated workspace/dining seating layouts, and a front-row seat to the Jibhi valley vistas.</p>
                    </div>
                  </ScrollReveal>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cottages.filter((c: any) => c.category === 'Intimate Mountain View Suite').map((cottage: any, i) => {
                      const slug = cottage.slug || cottage.name.toLowerCase().replace(/\s+/g, '-');
                      const available = availabilityChecked ? cottage.isAvailable : true;
                      return (
                      <ScrollReveal key={cottage.id} delay={i * 0.1}>
                        <Link href={`/cottages/slug/${slug}`} className="group block">
                          <div className={`vintage-card overflow-hidden h-full ${availabilityChecked && !available ? 'opacity-50' : ''}`}>
                            <div className="aspect-[4/3] overflow-hidden bg-gold-50 dark:bg-[#231B12]/30 relative">
                              {availabilityChecked && !available && (
                                <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                                  <span className="bg-vedara-900/80 text-alabaster px-4 py-2 rounded-full text-sm font-medium">Not available</span>
                                </div>
                              )}
                              <img
                                src={`https://images.unsplash.com/photo-${['1476514525535-07fb3b4ae5f1', '1519681393784-d120267933ba', '1469476568026-46a7f7b2f9c2'][i % 3]}?w=600&q=80`}
                                alt={`${cottage.name} - ${cottage.category || 'mountain view suite'} at The Vedara`}
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
                    )})}
                  </div>
                </div>
              )}

              {/* Cozy Alpine Studio */}
              {cottages.some((c: any) => c.category === 'Cozy Alpine Studio') && (
                <div className="mb-16">
                  <ScrollReveal>
                    <div className="mb-8">
                      <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-2 font-sans">Cottage 6</p>
                      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">Cozy Alpine Studio</h2>
                      <p className="text-muted-foreground text-sm max-w-2xl">Thoughtfully tailored minimalist escapes optimized for solo travelers, remote writers, digital nomads, or simple comfort. These rooms pack rich warmth and structural utility into a smartly integrated design.</p>
                    </div>
                  </ScrollReveal>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cottages.filter((c: any) => c.category === 'Cozy Alpine Studio').map((cottage: any, i) => {
                      const slug = cottage.slug || cottage.name.toLowerCase().replace(/\s+/g, '-');
                      const available = availabilityChecked ? cottage.isAvailable : true;
                      return (
                      <ScrollReveal key={cottage.id} delay={i * 0.1}>
                        <Link href={`/cottages/slug/${slug}`} className="group block">
                          <div className={`vintage-card overflow-hidden h-full ${availabilityChecked && !available ? 'opacity-50' : ''}`}>
                            <div className="aspect-[4/3] overflow-hidden bg-gold-50 dark:bg-[#231B12]/30 relative">
                              {availabilityChecked && !available && (
                                <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                                  <span className="bg-vedara-900/80 text-alabaster px-4 py-2 rounded-full text-sm font-medium">Not available</span>
                                </div>
                              )}
                              <img
                                src={`https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80`}
                                alt={`${cottage.name} - cozy alpine studio at The Vedara`}
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
                    )})}
                  </div>
                </div>
              )}
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
    </>
  );
}
