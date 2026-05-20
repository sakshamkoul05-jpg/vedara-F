'use client';

import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: ReactNode;
  bgImage: string;
  className?: string;
  speed?: number;
}

export function ParallaxSection({ children, bgImage, className = '', speed = 0.5 }: ParallaxSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  return (
    <section ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
