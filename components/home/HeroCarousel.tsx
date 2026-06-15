'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  { src: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80', alt: 'Himalayan mountain panorama' },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', alt: 'Misty Himalayan peaks at sunrise' },
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', alt: 'Mountain landscape with pine forests' },
  { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', alt: 'Snow capped mountains under starry sky' },
];

export function HeroCarousel({ onSpotlightMove }: { onSpotlightMove?: (x: number, y: number) => void }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useState(() => ({ current: null as ReturnType<typeof setInterval> | null }))[0];

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  }, [next, timerRef]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, timerRef]);

  const goToSlide = useCallback((i: number) => {
    setCurrent(i);
    resetTimer();
  }, [resetTimer]);

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
          role="img"
          aria-label={images[current].alt}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
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
