'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Mountain, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

const galleryItems = [
  { id: 1, category: 'cottages', caption: 'Morning mist over The Pine Perch', color: 'bg-earth-200', span: 'row-span-1' },
  { id: 2, category: 'cafe', caption: 'The Forest Pantry at golden hour', color: 'bg-forest-200', span: 'row-span-2' },
  { id: 3, category: 'views', caption: 'Valley panorama from Ridge View', color: 'bg-clay-200', span: 'row-span-1' },
  { id: 4, category: 'cottages', caption: 'Cedar Nook garden in bloom', color: 'bg-forest-300', span: 'row-span-1' },
  { id: 5, category: 'cafe', caption: 'Hand-poured coffee ceremony', color: 'bg-earth-300', span: 'row-span-1' },
  { id: 6, category: 'views', caption: 'Starry night over the mountains', color: 'bg-earth-400', span: 'row-span-1' },
  { id: 7, category: 'cottages', caption: 'Maple Suite wraparound veranda', color: 'bg-clay-300', span: 'row-span-2' },
  { id: 8, category: 'cafe', caption: 'Wood-fired hearth kitchen', color: 'bg-forest-400', span: 'row-span-1' },
  { id: 9, category: 'views', caption: 'Autumn colors along the trail', color: 'bg-clay-400', span: 'row-span-1' },
  { id: 10, category: 'cottages', caption: 'Ridge View infinity tub under stars', color: 'bg-earth-500', span: 'row-span-1' },
  { id: 11, category: 'cafe', caption: 'Fresh mountain bakes display', color: 'bg-forest-500', span: 'row-span-1' },
  { id: 12, category: 'views', caption: 'Sunrise over the Himalayan range', color: 'bg-clay-500', span: 'row-span-1' },
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

  const navigateImage = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + filtered.length) % filtered.length
      : (currentIndex + 1) % filtered.length;
    setSelectedImage(filtered[newIndex].id);
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Gallery</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              A Visual Journey Through The Vedara
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="flex gap-3 mb-10 overflow-x-auto pb-2 justify-center">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize transition-all whitespace-nowrap ${
                    filter === cat
                      ? 'bg-forest-600 text-cream-50 shadow-md'
                      : 'bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-cream-300 hover:bg-earth-200'
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
                    className={`group relative w-full rounded-xl overflow-hidden ${item.color} break-inside-avoid`}
                    style={{ aspectRatio: i % 3 === 1 ? '4/5' : '4/3' }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 opacity-30 text-white/30" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-cream-50 text-sm text-left font-medium">{item.caption}</p>
                      <span className="text-cream-200/70 text-xs capitalize">{item.category}</span>
                    </div>
                  </motion.button>
                </ScrollReveal>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Dialog open={selectedImage !== null} onOpenChange={(open) => { if (!open) setSelectedImage(null); }}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-black/95 border-earth-700">
          <div className="relative">
            <div className="aspect-[16/10] max-h-[75vh] flex items-center justify-center bg-earth-900">
              <div className="w-full h-full flex items-center justify-center">
                <Mountain className="w-24 h-24 text-earth-600" />
              </div>
            </div>
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-cream-50 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-cream-50 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-cream-50 text-base font-medium">
              {filtered.find((g) => g.id === selectedImage)?.caption}
            </p>
            <p className="text-cream-200/60 text-sm capitalize mt-1">
              {filtered.find((g) => g.id === selectedImage)?.category}
            </p>
            <p className="text-cream-200/40 text-xs mt-2">
              {currentIndex + 1} / {filtered.length}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
