'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/provider';

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export function TextReveal({ children, className = '', delay = 0, as: Tag = 'p' }: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { td, registerDynamic } = useLanguage();

  // This splits the heading into one span per word for the animation, which
  // would otherwise reach the page translator as a pile of single words —
  // "Where", "the", "peaks" — and come back as nonsense. So the whole sentence
  // is translated here, before it is broken up, and the result is marked so the
  // page translator leaves the pieces alone.
  useEffect(() => {
    registerDynamic([children]);
  }, [children, registerDynamic]);

  const words = td(children).split(' ');

  return (
    <Tag ref={ref} className={className} data-no-translate>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%' }}
            animate={isInView ? { y: 0 } : { y: '100%' }}
            transition={{
              duration: 0.5,
              delay: delay + i * 0.05,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
