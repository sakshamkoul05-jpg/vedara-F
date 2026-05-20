'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Bed, Bath, Maximize, Wifi, FireExtinguisher, Check } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function CottageDetailPage() {
  const { id } = useParams();
  const [cottage, setCottage] = useState<Cottage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cottages/${id}`).then((res: any) => {
      setCottage(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 vintage-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-earth-200 dark:bg-earth-700 rounded w-1/3" />
          <div className="aspect-[2/1] bg-earth-200 dark:bg-earth-700 rounded-2xl" />
          <div className="h-4 bg-earth-200 dark:bg-earth-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!cottage) {
    return (
      <div className="pt-32 vintage-container text-center">
        <h1 className="section-title mb-4">Cottage Not Found</h1>
        <Link href="/cottages" className="vintage-button-primary">Back to Cottages</Link>
      </div>
    );
  }

  const amenities: string[] = typeof cottage.amenities === 'string' ? JSON.parse(cottage.amenities as string) : cottage.amenities;

  return (
    <>
      <section className="pt-32 pb-8">
        <div className="vintage-container">
          <Link href="/cottages" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cottages
          </Link>
        </div>
      </section>

      <section className="pb-12">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-2 gap-10">
            <ScrollReveal direction="left">
              <div className="aspect-[4/3] lg:aspect-[3/4] rounded-2xl overflow-hidden bg-earth-100 dark:bg-earth-800 flex items-center justify-center">
                <span className="font-serif text-8xl text-earth-300 dark:text-earth-600">{cottage.name[0]}</span>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div>
                <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-3 font-sans">The Cottage</p>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">{cottage.name}</h1>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-forest-600 dark:text-forest-400">{formatPrice(cottage.pricePerNight)}</span>
                  <span className="text-muted-foreground text-sm">/ night</span>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8">{cottage.description}</p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-earth-50 dark:bg-earth-800 text-sm">
                    <Users className="w-4 h-4 text-clay-500" /> {cottage.capacity} Guests
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-earth-50 dark:bg-earth-800 text-sm">
                    <Bed className="w-4 h-4 text-clay-500" /> {cottage.bedrooms} Bedroom{cottage.bedrooms > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-earth-50 dark:bg-earth-800 text-sm">
                    <Bath className="w-4 h-4 text-clay-500" /> {cottage.bathrooms} Bathroom{cottage.bathrooms > 1 ? 's' : ''}
                  </div>
                  {cottage.size && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-earth-50 dark:bg-earth-800 text-sm">
                      <Maximize className="w-4 h-4 text-clay-500" /> {cottage.size} sqft
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="font-serif text-lg text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-forest-500" /> {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={`/booking?cottageId=${cottage.id}`} className="vintage-button-primary text-base px-8 py-4 inline-block">
                  Book This Cottage
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
