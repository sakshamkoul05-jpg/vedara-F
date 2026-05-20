'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  once?: boolean;
  distance?: number;
}

const variants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 60 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
    }),
  },
  down: {
    hidden: { opacity: 0, y: -60 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
    }),
  },
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
    }),
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
    }),
  },
};

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.8,
  once = true,
  distance = 60,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const varKey = direction;
  const baseDir = variants[varKey] || variants.up;

  const v: Variants = {
    hidden: baseDir.hidden || { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={v}
      className={className}
    >
      {children}
    </motion.div>
  );
}
