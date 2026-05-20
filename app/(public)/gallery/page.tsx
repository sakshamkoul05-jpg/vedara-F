'use client';

import { useState } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { X, Mountain } from 'lucide-react';

const galleryItems = [
  { id: 1, category: 'cottages', caption: 'Morning mist over The Pine Perch', color: 'bg-earth-200' },
  { id: 2, category: 'cafe', caption: 'The Forest Pantry at golden hour', color: 'bg-forest-200' },
  { id: 3, category: 'views', caption: 'Valley panorama from Ridge View', color: 'bg-clay-200' },
  { id: 4, category: 'cottages', caption: 'Cedar Nook garden in bloom', color: 'bg-forest-300' },
  { id: 5, category: 'cafe', caption: 'Hand-poured coffee ceremony', color: 'bg-earth-300' },
  { id: 6, category: 'views', caption: 'Starry night over the mountains', color: 'bg-earth-400' },
  { id: 7, category: 'cottages', caption: 'Maple Suite wraparound veranda', color: 'bg-clay-300' },
  { id: 8, category: 'cafe', caption: 'Wood-fired hearth kitchen', color: 'bg-forest-400' },
  { id: 9, category: 'views', caption: 'Autumn colors along the trail', color: 'bg-clay-400' },
];

const categories = ['all', 'cottages', 'cafe', 'views'];

export default function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filtered = filter === 'all' ? galleryItems : galleryItems.filter((item) => item.category === filter);

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Gallery</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              A Visual Journey Through Vedara
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  filter === cat
                    ? 'bg-forest-600 text-cream-50'
                    : 'bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-cream-300 hover:bg-earth-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 0.05}>
                <button
                  onClick={() => setSelectedImage(item.id)}
                  className={`group relative aspect-[4/3] rounded-xl overflow-hidden ${item.color} w-full`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mountain className="w-10 h-10 opacity-40" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-cream-50 text-sm text-left">{item.caption}</p>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-cream-50 hover:text-cream-200"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-earth-600 flex items-center justify-center">
              <Mountain className="w-20 h-20 text-earth-500" />
            </div>
            <p className="text-cream-200 text-sm mt-3 text-center">
              {galleryItems.find((g) => g.id === selectedImage)?.caption}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
