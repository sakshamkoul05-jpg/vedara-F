'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useDragControls } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/theme';

export function LanternToggle() {
  const { theme, toggle } = useThemeStore();
  const controls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const dragY = useMotionValue(0);
  const ropeLength = useSpring(dragY, { stiffness: 200, damping: 25, mass: 0.5 });

  const swingX = useMotionValue(0);
  const swingSpring = useSpring(swingX, { stiffness: 80, damping: 8 });

  const ropeOpacity = useSpring(dragY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    setIsAdmin(window.location.pathname.startsWith('/admin'));
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      const interval = setInterval(() => {
        if (!isDragging) {
          swingX.set(Math.sin(Date.now() / 2000) * 2);
        }
      }, 16);
      return () => clearInterval(interval);
    }
  }, [isDragging, isAdmin, swingX]);

  if (isAdmin) return null;

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    setIsDragging(false);
    swingX.set(8);

    if (info.offset.y > 60) {
      toggle();
    }

    dragY.set(0);
  };

  const ropeHeight = 120;

  return (
    <div
      ref={constraintsRef}
      className="fixed right-6 top-0 z-50 flex flex-col items-center select-none"
      style={{ pointerEvents: isDragging ? 'auto' : 'auto' }}
    >
      <motion.div
        className="w-0.5 bg-gradient-to-b from-amber-700/50 to-amber-600/30 dark:from-amber-500/40 dark:to-amber-400/20"
        style={{
          height: ropeHeight,
          opacity: ropeOpacity,
          scaleX: 1,
        }}
      />

      <motion.div
        drag="y"
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 100 }}
        dragElastic={0.4}
        dragMomentum={false}
        onDragStart={() => {
          setIsDragging(true);
          swingX.set(0);
        }}
        onDragEnd={handleDragEnd}
        style={{
          y: dragY,
          x: swingSpring,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        <div className="relative flex items-center justify-center w-10 h-14">
          <div className="absolute inset-0 rounded-t-full rounded-b-lg bg-gradient-to-b from-amber-800/80 to-amber-700/60 dark:from-amber-600/60 dark:to-amber-500/40 shadow-lg" />

          <div className="absolute top-1 w-6 h-1.5 rounded-full bg-amber-900/80 dark:bg-amber-400/60" />

          <div className="absolute top-2 w-4 h-4 flex items-center justify-center">
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-amber-200" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-amber-200" />
            )}
          </div>

          <div className="absolute bottom-1 w-4 h-1 rounded-full bg-amber-900/60 dark:bg-amber-400/40" />
        </div>

        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-600/50 dark:bg-amber-400/40 blur-sm"
          animate={{
            opacity: isDragging ? 0.6 : 0.3,
            scale: isDragging ? 1.5 : 1,
          }}
        />
      </motion.div>
    </div>
  );
}
