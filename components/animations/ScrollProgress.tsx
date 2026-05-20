'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    setIsAdmin(window.location.pathname.startsWith('/admin'));
  }, []);

  if (isAdmin) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 z-[9999] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #2d6a4f, #bc6c25)',
      }}
    />
  );
}
