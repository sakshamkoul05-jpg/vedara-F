'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryItems = [
  { id: 1, category: 'cottages', caption: 'Morning mist over The Pine Perch', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', span: 'row-span-1', alt: 'Cozy wooden cottage surrounded by morning mist in the Himalayas at The Vedara' },
  { id: 2, category: 'cafe', caption: 'The Forest Pantry at golden hour', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', span: 'row-span-2', alt: 'Cafe Charade dining area bathed in warm golden hour sunlight' },
  { id: 3, category: 'views', caption: 'Valley panorama from Ridge View', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', span: 'row-span-1', alt: 'Panoramic view of the Jibhi valley from The Vedara retreat' },
  { id: 4, category: 'cottages', caption: 'Cedar Nook garden in bloom', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', span: 'row-span-1', alt: 'Cottage garden with blooming flowers and cedar trees at The Vedara' },
  { id: 5, category: 'cafe', caption: 'Hand-poured coffee ceremony', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', span: 'row-span-1', alt: 'Barista preparing hand-poured artisan coffee at Cafe Charade' },
  { id: 6, category: 'views', caption: 'Starry night over the mountains', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', span: 'row-span-1', alt: 'Brilliant starry night sky over the Himalayan mountain range' },
  { id: 7, category: 'cottages', caption: 'Maple Suite wraparound veranda', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', span: 'row-span-2', alt: 'Cottage veranda with mountain views at sunset in The Vedara' },
  { id: 8, category: 'cafe', caption: 'Wood-fired hearth kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', span: 'row-span-1', alt: 'Wood-fired kitchen at Cafe Charade preparing fresh meals' },
  { id: 9, category: 'views', caption: 'Autumn colors along the trail', image: 'https://images.unsplash.com/photo-1469476568026-46a7f7b2f9c2?w=800&q=80', span: 'row-span-1', alt: 'Forest trail with vibrant autumn colors near The Vedara retreat' },
  { id: 10, category: 'cottages', caption: 'Ridge View infinity tub under stars', image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea17?w=800&q=80', span: 'row-span-1', alt: 'Outdoor bathtub with starlit mountain views at The Vedara' },
  { id: 11, category: 'cafe', caption: 'Fresh mountain bakes display', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', span: 'row-span-1', alt: 'Display of freshly baked mountain breads and pastries at the cafe' },
  { id: 12, category: 'views', caption: 'Sunrise over the Himalayan range', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', span: 'row-span-1', alt: 'Golden sunrise illuminating the snow-capped Himalayan mountain range' },
];

const categories = ['all', 'cottages', 'cafe', 'views'];

export default function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filtered = useMemo(
    () => filter === 'all' ? galleryItems : galleryItems.filter((item) => item.category === filter),
    [filter]
  );

  const currentIndex = selectedImage ? filtered.findIndex((item) => item.id === selectedImage) : -1;
  const selectedItem = selectedImage ? filtered.find((g) => g.id === selectedImage) : null;

  const navigateImage = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + filtered.length) % filtered.length
      : (currentIndex + 1) % filtered.length;
    setSelectedImage(filtered[newIndex].id);
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-alabaster dark:bg-[#13110E]">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Gallery</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              A Visual Journey Through The Vedara
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20 dark:bg-[#13110E]">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="flex gap-3 mb-10 overflow-x-auto pb-2 justify-center">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize transition-all whitespace-nowrap ${
                    filter === cat
                      ? 'bg-gold-600 text-alabaster shadow-md'
                      : 'bg-gold-50 dark:bg-[#221E18] text-charcoal/70 dark:text-[#A89C8B] hover:bg-gold-100 dark:hover:bg-[#221E18]/80'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {cat}
                  {filter === cat && (
                    <motion.span
                      className="ml-2 text-xs opacity-70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      ({filtered.length})
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </ScrollReveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6"
            >
              {filtered.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 0.03}>
                  <motion.button
                    onClick={() => setSelectedImage(item.id)}
                    className="group relative w-full rounded-xl overflow-hidden bg-gold-100 dark:bg-[#221E18] break-inside-avoid"
                    style={{ aspectRatio: i % 3 === 1 ? '4/5' : '4/3' }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={item.image}
                      alt={item.alt || item.caption}
                      className="absolute inset-0 w-full h-full object-cover animate-pulse"
                      loading="lazy"
                      width={400}
                      height={i % 3 === 1 ? 500 : 300}
                      onLoad={(e) => (e.target as HTMLImageElement).classList.remove('animate-pulse')}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        const parent = el.parentElement;
                        if (parent && !parent.querySelector('.gallery-error-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'gallery-error-fallback absolute inset-0 flex flex-col items-center justify-center text-muted-foreground';
                          fallback.innerHTML = '<svg class="w-8 h-8 mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span class="text-xs">Image unavailable</span>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-alabaster text-sm text-left font-medium">{item.caption}</p>
                      <span className="text-alabaster/70 text-xs capitalize">{item.category}</span>
                    </div>
                  </motion.button>
                </ScrollReveal>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Dialog open={selectedImage !== null} onOpenChange={(open) => { if (!open) setSelectedImage(null); }}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-black/95 border-vedara-900">
          <DialogTitle className="sr-only">{selectedItem?.caption || 'Gallery image'}</DialogTitle>
          <DialogDescription className="sr-only">{selectedItem?.caption || 'Gallery image in the ' + selectedItem?.category + ' category'}</DialogDescription>
          <div className="relative">
            <div className="aspect-[16/10] max-h-[75vh] flex items-center justify-center bg-vedara-900">
              {selectedItem && (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.alt || selectedItem.caption}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 text-alabaster flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 text-alabaster flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-alabaster text-base font-medium">
              {selectedItem?.caption}
            </p>
            <p className="text-alabaster/60 text-sm capitalize mt-1">
              {selectedItem?.category}
            </p>
            <p className="text-alabaster/40 text-xs mt-2">
              {currentIndex + 1} / {filtered.length}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
