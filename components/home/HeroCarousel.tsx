'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  { src: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80', alt: 'Himalayan mountain panorama' },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', alt: 'Misty Himalayan peaks at sunrise' },
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', alt: 'Mountain landscape with pine forests' },
  { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', alt: 'Snow capped mountains under starry sky' },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[current].src})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
