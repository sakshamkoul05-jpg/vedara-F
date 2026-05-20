'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageReveal({ src, alt, className = '' }: ImageRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ scale: 1.3, filter: 'blur(8px)' }}
        animate={isInView ? { scale: 1, filter: 'blur(0px)' } : { scale: 1.3, filter: 'blur(8px)' }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  );
}
