'use client';

import { useEffect } from 'react';

export function WaterRipple() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 1.5px solid #C8A96A;
        transform: translate(-50%, -50%);
        animation: ripple 0.8s ease-out;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}