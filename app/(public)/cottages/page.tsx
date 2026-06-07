'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Bed, Bath, Maximize, Loader2, XCircle, CheckCircle, Mountain } from 'lucide-react';
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

  const today = getToday();

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckIn(e.target.value);
    if (checkOut && new Date(checkOut) <= new Date(e.target.value)) {
      setCheckOut('');
    }
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <BackButton />
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Accommodations</p>
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
                  <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || today} />
                </div>
                <div className="flex items-end">
                  <Button variant="primary" size="md" className="w-full" onClick={handleCheckAvailability} disabled={!checkIn || !checkOut || checking}>
                    {checking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</> : 'Check Availability'}
                  </Button>
                </div>
                <div className="flex items-end">
                  <Link href={checkIn && checkOut ? `/booking?checkIn=${checkIn}&checkOut=${checkOut}` : '/booking'} className="vintage-button-secondary w-full text-center">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="vintage-card animate-pulse">
                  <div className="aspect-[4/3] bg-earth-200 dark:bg-earth-700 rounded-t-2xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-earth-200 dark:bg-earth-700 rounded w-2/3" />
                    <div className="h-4 bg-earth-200 dark:bg-earth-700 rounded w-full" />
                    <div className="h-4 bg-earth-200 dark:bg-earth-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : cottages.length === 0 ? (
            <div className="text-center py-20">
              <Mountain className="w-16 h-16 text-earth-300 mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-foreground mb-3">No Cottages Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {availabilityChecked
                  ? 'No cottages are available for the selected dates. Try different dates.'
                  : 'We couldn\'t load our cottages. Please try again later.'}
              </p>
            </div>
          ) : (
            <>
              {availabilityChecked && (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    {cottages.filter((c: any) => c.isAvailable).length} of {cottages.length} cottages available for these dates
                  </p>
                  <button onClick={() => { setAvailabilityChecked(false); api.get('/cottages').then((res: any) => setCottages(res.data)); }} className="text-sm text-forest-600 dark:text-forest-400 hover:underline">
                    Show all cottages
                  </button>
                </div>
              )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cottages.map((cottage: any, i) => {
                const slug = cottage.slug || cottage.name.toLowerCase().replace(/\s+/g, '-');
                const available = availabilityChecked ? cottage.isAvailable : true;
                return (
                <ScrollReveal key={cottage.id} delay={i * 0.1}>
                  <Link href={`/cottages/slug/${slug}`} className="group block">
                    <div className={`vintage-card overflow-hidden ${availabilityChecked && !available ? 'opacity-50' : ''}`}>
                      <div className="aspect-[4/3] overflow-hidden bg-earth-100 dark:bg-earth-800 relative">
                        {availabilityChecked && !available && (
                          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                            <span className="bg-earth-900/80 text-cream-50 px-4 py-2 rounded-full text-sm font-medium">Not available</span>
                          </div>
                        )}
                        <img
                          src={`https://images.unsplash.com/photo-${['1504384308090-c894fdcc538d', '1554118811-1e0d58224f24', '1506905925346-21bda4d32df4', '1476514525535-07fb3b4ae5f1', '1519681393784-d120267933ba', '1469476568026-46a7f7b2f9c2', '1504384308090-c894fdcc538d'][i % 7]}?w=600&q=80`}
                          alt={cottage.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-serif text-xl text-foreground group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">{cottage.name}</h3>
                          <span className="text-forest-600 dark:text-forest-400 font-semibold">{formatPrice(cottage.pricePerNight)}<span className="text-earth-400 font-normal text-xs">/night</span></span>
                        </div>
                        {cottage.category && (
                          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-clay-100 dark:bg-clay-900/30 text-clay-600 dark:text-clay-400 mb-2">{cottage.category}</span>
                        )}
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
                        <span className="text-forest-600 dark:text-forest-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              )})}
            </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
