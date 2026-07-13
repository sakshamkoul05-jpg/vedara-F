'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '-50px' }
    );

    const raf = requestAnimationFrame(() => {
      els.forEach((el) => obs.observe(el));
    });

    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [pathname]);

  return null;
}