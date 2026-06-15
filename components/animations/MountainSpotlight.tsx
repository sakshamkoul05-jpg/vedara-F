'use client';

import { useEffect } from 'react';

interface MountainSpotlightProps {
  selector?: string;
  radius?: number;
  color?: string;
  opacity?: number;
}

export function MountainSpotlight({
  selector = '[data-spotlight]',
  radius = 200,
  color = 'rgba(0, 0, 0, 0.85)',
  opacity = 1,
}: MountainSpotlightProps) {
  useEffect(() => {
    const target = document.querySelector(selector) as HTMLElement;
    if (!target) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      target.style.background = `
        radial-gradient(
          circle ${radius}px at ${x}px ${y}px,
          transparent 0%,
          ${color} 100%
        )
      `;
    };

    const handleMouseLeave = () => {
      target.style.background = `
        radial-gradient(
          circle ${radius}px at 50% 50%,
          transparent 0%,
          ${color} 100%
        )
      `;
    };

    target.addEventListener('mousemove', handleMouseMove);
    target.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      target.removeEventListener('mousemove', handleMouseMove);
      target.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [selector, radius, color]);

  return null;
}