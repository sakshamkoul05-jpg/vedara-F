'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface ParallaxCursorProps {
  variant?: 'default' | 'light' | 'dark';
}

export function ParallaxCursor({ variant = 'default' }: ParallaxCursorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 150, damping: 15 });
  const springY = useSpring(cursorY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const checkTouch = () => {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        setIsVisible(false);
        return;
      }
      setIsVisible(true);
    };

    checkTouch();

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnterLink = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('[role="link"]')) {
        setIsHoveringLink(true);
      } else {
        setIsHoveringLink(false);
      }
      if (target.closest('button') || target.closest('[role="button"]')) {
        setIsHoveringButton(true);
      } else {
        setIsHoveringButton(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseEnterLink);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseEnterLink);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  const size = isHoveringButton ? 48 : isHoveringLink ? 40 : 20;
  const isDark = variant === 'dark';
  const borderColor = isDark ? 'border-white/30' : 'border-black/20';
  const bgColor = isDark ? 'bg-white/10' : 'bg-black/5';

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] rounded-full mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        width: size,
        height: size,
        backgroundColor: isHoveringLink || isHoveringButton ? 'rgba(255,255,255,0.15)' : 'transparent',
        borderColor: isHoveringLink || isHoveringButton ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    />
  );
}
