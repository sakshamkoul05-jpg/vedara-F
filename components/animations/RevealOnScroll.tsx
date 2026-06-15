'use client';

import { useEffect } from 'react';

export function RevealOnScroll() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '-50px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  return null;
}