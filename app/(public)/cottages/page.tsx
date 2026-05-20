'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Bed, Bath, Maximize } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function CottagesPage() {
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    api.get('/cottages').then((res: any) => {
      setCottages(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Accommodations</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              Find Your Mountain Sanctuary
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
                  <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div>
                  <label className="vintage-label">Check-out</label>
                  <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button variant="primary" size="md" className="w-full">
                    Check Availability
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cottages.map((cottage, i) => (
                <ScrollReveal key={cottage.id} delay={i * 0.1}>
                  <Link href={`/cottages/${cottage.id}`} className="group block">
                    <div className="vintage-card overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden bg-earth-100 dark:bg-earth-800 flex items-center justify-center">
                        <span className="font-serif text-6xl text-earth-300 dark:text-earth-600">{cottage.name[0]}</span>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-serif text-xl text-foreground group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">{cottage.name}</h3>
                          <span className="text-forest-600 dark:text-forest-400 font-semibold">{formatPrice(cottage.pricePerNight)}<span className="text-earth-400 font-normal text-xs">/night</span></span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{cottage.shortDesc || cottage.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cottage.capacity} guests</span>
                          <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {cottage.bedrooms} BR</span>
                          <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {cottage.bathrooms} bath</span>
                          {cottage.size && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {cottage.size} sqft</span>}
                        </div>
                        <span className="text-forest-600 dark:text-forest-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
